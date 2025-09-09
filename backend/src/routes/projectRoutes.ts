import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { validateProject, validateProjectUpdate } from "../middleware/projectValidation";
import { upload } from "../utils/fileupload";
import { parseProjectFormData } from "../middleware/formDataParser";


const router = Router();

router.get('/', optionalAuth, ProjectController.getProjects);
router.get('/user/:userId', optionalAuth, ProjectController.getUserProjects);
router.get('/:id', optionalAuth, ProjectController.getProject);

router.post('/', authenticateToken, upload.array('projectImages',5),parseProjectFormData, validateProject, ProjectController.createProject);

router.put('/:id', authenticateToken, upload.array('projectImages', 5), parseProjectFormData, validateProjectUpdate, ProjectController.updateProject);

router.delete('/:id', authenticateToken, ProjectController.deleteProject);
router.post('/:id/like', authenticateToken, ProjectController.toggleLike);
router.delete('/:id/images', authenticateToken, ProjectController.removeImage);

export default router;