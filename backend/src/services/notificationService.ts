import prisma from "../utils/database";
import  { getWebSocketService } from './websocketService';
import EmailService, { emailService } from "./emailService";
import rateLimit from "express-rate-limit";


export interface CreateNotificationData{
    userId: string;
    title: string;
    message: string;
    type: 'REVIEW_RECEIVED' | 'REVIEW_APPROVED' | 'REVIEW_REJECTED' | 'PROJECT_LIKED' | 'PROJECT_VIEWED' | 'PROFILE_VIEWED' | 'SYSTEM_UPDATE' | 'WELCOME' | 'ACHIEVEMENT';
    data?: any;
    projectId?: string;
    reviewId?: string;
    triggeredById?: string;
}

class NotificationService{
    async createNotification(notificationData: CreateNotificationData) {
        try {
            const notification = await prisma.notification.create ({
                data: notificationData,
                include : {
                    user :{
                        select :{
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    project : {
                        select : { 
                            id: true,
                            title: true
                        }
                    },
                    triggeredBy:{
                        select : {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            const websocketService = getWebSocketService();
            await websocketService.sendNotificationToUser(notification.userId , {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                data: notification.data,
                createdAt: notification.createdAt
            });

            await this.sendEmailNotification(notification);
            return notification;
        } catch (error){
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async createReviewNotification( reviewId: string, projectAuthorId: string, reviewerId: string){
        try {
            const review = await prisma.review.findUnique({
                where : { id: reviewId },
                include : {
                    project : { select : { title : true}},
                    reviewer : {
                        select : {
                            username: true,
                            firstName: true,
                            lastName: true
                        }

                    }
                }
            });
            if (!review) {
                return;
            }
            const reviewerName = review.reviewer.firstName && review.reviewer.lastName ? 
            `${review.reviewer.firstName} ${review.reviewer.lastName}` : review.reviewer.username;

            await this.createNotification({
                userId: projectAuthorId,
                title: 'New Review Received' ,
                message : `${reviewerName} reviewd your project`,
                type: 'REVIEW_RECEIVED',
                data: {
                    rating: review.rating,
                    projectTitle: review.project.title,
                    reviewerName
                },
                projectId: review.projectId,
                reviewId: review.id,
                triggeredById: reviewerId
            });
            
        } catch (error) {
            console.error('Error creating review notification:', error);
        }
    }

    async createProfileViewNotification(profileUserId: string, viewerId?: string) {
        try {
            if (profileUserId === viewerId) return;
    
            const [profileUser, viewer] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: profileUserId },
                    select: { firstName: true, username: true }
                }),
                prisma.user.findUnique({
                    where: { id: viewerId },
                    select: { firstName: true, lastName: true, username: true }
                })
            ]);
    
            if (!profileUser || !viewer) return;
    
            const viewerName = viewer.firstName && viewer.lastName 
                ? `${viewer.firstName} ${viewer.lastName}`
                : viewer.username;
    
            await this.createNotification({
                userId: profileUserId,
                title: 'Profile View',
                message: `${viewerName} viewed your profile`,
                type: 'PROFILE_VIEWED',
                data: {
                    viewerName
                },
                triggeredById: viewerId
            });
        } catch (error) {
            console.error('Error creating profile view notification:', error);
        }
    }

    async createProjectLikeNotification(projectId: string, projectAuthorId: string, likerId: string) {
        try {
            const project = await prisma.project.findUnique({
                where : { id :projectId },
                select: { title: true, likes: true }
            });

            const liker = await prisma.user.findUnique({
                where: { id: likerId },
                select : { username: true, firstName: true, lastName: true}
            });

            if(!project || !liker || projectAuthorId === likerId) return;

            const likerName = liker.firstName && liker.lastName ? `${liker.firstName} ${liker.lastName}`
            : liker.username;

            await this.createNotification({
                userId: projectAuthorId,
                title: 'Project Liked!',
                message: `${likerName} liked your project "${project.title}".`,
                type: 'PROJECT_LIKED',
                data: {
                    projectTitle: project.title,
                    likerName,
                    totalLikes: project.likes
                },
                projectId: projectId,
                triggeredById: likerId
            });
        } catch (error) {
            console.error('Error creating project like notification:', error);
        }
    }

    async createProjectViewMilestoneNotification(projectId: string, projectAuthorId: string, viewCount: number) {
        try {
            const milestones = [ 100, 500, 1000, 5000, 10000];

            if(!milestones.includes(viewCount)) return;

            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { title: true }
            });

            if(!project) return;

            await this.createNotification({
                userId: projectAuthorId,
                title: `${viewCount} View Milestone!`,
                message: `Your project "${project.title}" has reached ${viewCount} views! Keep up the great work!`,
                type: 'PROJECT_VIEWED',
                data: {
                    projectTitle: project.title,
                    viewCount,
                    milestone: viewCount
                },
                projectId: projectId
            });
        } catch (error) {
            console.error('Error creating view milestone notification:', error);
        }
    }

    async createWelcomeNotification(userId: string){
        try{
            const user = await prisma.user.findUnique({
                where: {id: userId},
                select : { firstName: true, username: true}
            });

            if (!user) return;

            const name = user.firstName || user.username;

            await this.createNotification({
                userId: userId,
                title: `Welcome to DevFlow, ${name}!`,
                message: 'Start by creating your first project and connecting with other developers. Welcome to the community!',
                type: 'WELCOME',
                data: {
                    isWelcome: true
                }
            });
        } catch (error) {
            console.error('Error creating welcome notification:', error);
        }
    }

    async getUserNotifications(userId: string, page: number = 1, limit: number = 20 ) {
        try {
            const offset = (page - 1) * limit;

            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where :{ userId},
                    include : {
                        project: {
                            select : { id : true, title: true}
                        },
                        triggeredBy: {
                            select : {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt : 'desc'},
                    skip : offset,
                    take: limit
                }),
                prisma.notification.count({
                    where: { userId }
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch ( error ) {
            console.error('Error getting user notifications:', error);
            throw error;  
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await prisma.notification.count({
                where: {
                    userId,
                    read: false
                }
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    async markAsRead(notificationId: string, userId: string) {
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
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: string) {
        try {
            await prisma.notification.updateMany({
                where: {
                    userId: userId,
                    read: false
                },
                data: {
                    read: true
                }
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: string, userId: string) {
        try {
            await prisma.notification.deleteMany({
                where: {
                    id: notificationId,
                    userId: userId
                }
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    private async sendEmailNotification(notification: any) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: notification.userId },
                select: { 
                    email: true,
                }
            });

            if (!user?.email) return;

            const emailableTypes = ['REVIEW_RECEIVED', 'PROJECT_VIEWED'];
            if (!emailableTypes.includes(notification.type)) return;

            await emailService.sendNotificationEmail(
                user.email,
                notification.title,
                notification.message
            );
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    }

}

export const notificationService = new NotificationService();
export default NotificationService;