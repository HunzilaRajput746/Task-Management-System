import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  addComment,
  updateChecklist,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin', 'manager'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('admin', 'manager'), deleteTask);

router.route('/:id/status').patch(updateTaskStatus);
router.route('/:id/comments').post(addComment);
router.route('/:id/checklist').put(updateChecklist);

export default router;
