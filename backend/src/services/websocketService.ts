import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { JWTUtill } from "../utils/jwt";
import prisma from "../utils/database";

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

class WebSocketService {
    private io: SocketIOServer;
    private connectedUsers: Map<String, String> = new Map();

    constructor(server: HttpServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:300',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware() {
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));

                }

                const decoded = JWTUtill.verifyAccessToken(token);
                if (!decoded) {
                    return next(new Error('Authentication error: Invalid token'));
                }

                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: { id: true, username: true }
                });

                if (!user) {
                    return next(new Error('Authentication error: User not found'));
                }

                socket.userId = user.id;
                next();
            } catch (error) {
                console.error('WebSocket authentication error:', error);
                next(new Error('Authentication error'));

            }
        });

    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log(`User ${socket.userId} connected with socket ${socket.id}`);
            if (socket.userId) {
                this.connectedUsers.set(socket.userId, socket.id);

                socket.join(`user: ${socket.userId}`);

                this.updateUserLastActive(socket.userId);
            }

            socket.on('disconnect', (reason) => {
                console.log(`User ${socket.userId} disconnected: ${reason}`);
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                    this.updateUserLastActive(socket.userId);
                }
            });

            socket.on('notification: read', async (notificationId: string) => {
                try {
                    await this.markNotificationAsRead(notificationId, socket.userId!)
                }
                catch (error) {
                    console.error('Error marking notification as read:', error);
                }
            });

            socket.on('notification:readAll', async () => {
                try {
                    await this.markAllNotificationsAsRead(socket.userId!);
                    socket.emit('notification:allRead');
                } catch (error) {
                    console.error('Error marking all notifications as read:', error);
                }
            });
        });
    }

    public async sendNotificationToUser(
        userId: string,
        notification: {
            id: string;
            title: string;
            message: string;
            type: string;
            data?: any;
            createdAt: Date;
        }
    ) {
        const socketId = this.connectedUsers.get(userId);

        if (socketId) {
            this.io.to(`user: ${userId}`).emit('notification:new', notification);
            console.log(`Real-time notification sent to user ${userId}`);
        } else {
            console.log(`User ${userId} is offline - notification saved to database`);
        }
    }

    public broadcastToAll(event: string, data: any) {
        this.io.emit(event, data);
    }

    public sendToUsers(userIds: string[], event: string, data: any) {
        userIds.forEach(userId => {
            this.io.to(`user: ${userId}`).emit(event, data);
        })
    }

    public getOnlineUsersCount(): number {
        return this.connectedUsers.size;
    }

    public isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    private async updateUserLastActive(userId: string) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { lastActive: new Date() }
            });
        }
        catch (error) {
            console.log('Error updating user last active');
        }
    }

    private async markNotificationAsRead (notificationId: string, userId: string) {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId: userId
                },
                data: {
                    read: true
                }
            });
        }
        catch(error) {
            console.log('Error marking notification as read');
        }
    }

    private async markAllNotificationsAsRead(userId: string) {
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                read: false
            },
            data: {
                read: true
            }
        });
    }
}

let webSocketService : WebSocketService;

export const initializeWebSocket = (server: HttpServer) : WebSocketService => {
    webSocketService = new WebSocketService(server);
    return webSocketService;
};

export const getWebSocketService = () : WebSocketService => {
    if (!webSocketService) {
        throw new Error('WebSocketService not initialized');
    }
    return webSocketService;
};

export default WebSocketService;