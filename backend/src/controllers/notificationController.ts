import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export class NotificationController {
    static async getUserNotifications(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await notificationService.getUserNotifications(userId, page, limit);

            return res.json(result);
        } catch (error) {
            console.error('Get user notifications error:', error);
            return res.status(500).json({
                error: 'Failed to get notifications',
                message: 'Internal server error'
            });
        }
    }

    static async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const count = await notificationService.getUnreadCount(userId);

            return res.json({ count });
        } catch (error) {
            console.error('Get unread count error:', error);
            return res.status(500).json({
                error: 'Failed to get unread count',
                message: 'Internal server error'
            });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            await notificationService.markAsRead(id, userId);

            return res.json({
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Mark notification as read error:', error);
            return res.status(500).json({
                error: 'Failed to mark notification as read',
                message: 'Internal server error'
            });
        }
    }

    static async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            await notificationService.markAllAsRead(userId);

            return res.json({
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            return res.status(500).json({
                error: 'Failed to mark all notifications as read',
                message: 'Internal server error'
            });
        }
    }

    static async deleteNotification(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            await notificationService.deleteNotification(id, userId);

            return res.json({
                message: 'Notification deleted'
            });
        } catch (error) {
            console.error('Delete notification error:', error);
            return res.status(500).json({
                error: 'Failed to delete notification',
                message: 'Internal server error'
            });
        }
    }

    static async createTestNotification(req: Request, res: Response) {
        try {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    error: 'Test notifications are not allowed in production'
                });
            }

            const userId = req.user!.id;
            const { title, message, type } = req.body;

            const notification = await notificationService.createNotification({
                userId,
                title: title || 'Test Notification',
                message: message || 'This is a test notification from DevFlow!',
                type: type || 'SYSTEM_UPDATE',
                data: { isTest: true }
            });

            return res.status(201).json({
                message: 'Test notification created',
                notification
            });
        } catch (error) {
            console.error('Create test notification error:', error);
            return res.status(500).json({
                error: 'Failed to create test notification',
                message: 'Internal server error'
            });
        }
    }
}