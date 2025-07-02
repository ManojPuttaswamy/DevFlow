import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth";
import { validateProject, validateProjectUpdate } from "../middleware/projectValidation";
import { upload } from "../utils/fileupload";


const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/id', ProjectController.getProject);

router.post('/', authenticateToken, upload.array('projectImages',5), validateProject, ProjectController.createProject);

router.put('/', authenticateToken, upload.array('projectImages', 5), validateProjectUpdate, ProjectController.updateProject);

router.delete('/:id', authenticateToken, ProjectController.deleteProject);
router.post('/:id/like', authenticateToken, ProjectController.toggleLike);
router.delete('/:id/images', authenticateToken, ProjectController.removeImage);

export default router;