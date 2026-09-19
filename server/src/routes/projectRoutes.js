import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin', 'manager'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin', 'manager'), updateProject)
  .delete(authorize('admin'), deleteProject);

export default router;
