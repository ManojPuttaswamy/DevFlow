import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { ValidateRegistration, validateLogin } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();


router.post('/register', ValidateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

router.get('/profile', authenticateToken, AuthController.getProfile);


export default router;