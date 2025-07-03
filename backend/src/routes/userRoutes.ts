import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateProfileUpdate } from '../middleware/validation';
import { upload } from '../utils/fileupload';

const router = Router();

router.get('/search', UserController.searchUsers);
router.get('/:username', UserController.getPublicProfile);

router.get('/profile/me', authenticateToken, UserController.getProfile);
router.put('/profile/me', authenticateToken, validateProfileUpdate, UserController.updateProfile);
router.get('/dashboard/me', authenticateToken, UserController.getDashboard);

router.post('/avatar/upload', authenticateToken, upload.single('avatar'), UserController.uploadAvatar);

export default router;