import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';
import { validateReview, validateReviewStatus } from '../middleware/reviewValidation';

const router = Router();

router.post('/', authenticateToken, validateReview, ReviewController.createReview);

router.get('/project/:projectId', ReviewController.getProjectReviews);

router.get('/user/:userId/given', ReviewController.getUserReviewsGiven);

router.get('/user/:userId/received', ReviewController.getUserReviewsReceived);

router.put('/:id/status', authenticateToken, validateReviewStatus, ReviewController.updateReviewStatus);

router.delete('/:id', authenticateToken, ReviewController.deleteReview);

router.get('/analytics/:projectId', ReviewController.getReviewAnalytics);

export default router;