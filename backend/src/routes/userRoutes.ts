import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../utils/fileupload';

const router = Router();

router.get('/:username', UserController.getProfile);

router.get('/dashboard/me', authenticateToken, UserController.getDashboard);
router.put('/profile/me', authenticateToken, UserController.updateProfile);
router.post('/avatar/upload', authenticateToken, upload.single('avatar'), UserController.uploadAvatar);

export default router;