import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationController.getUserNotifications);

router.get('/unread-count', NotificationController.getUnreadCount);

router.put('/:id/read', NotificationController.markAsRead);

router.put('/read-all', NotificationController.markAllAsRead);

router.delete('/:id', NotificationController.deleteNotification);

router.post('/test', NotificationController.createTestNotification);

export default router;