import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/role', authorize('admin'), updateUserRole);

export default router;
