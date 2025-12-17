import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/users/', register);
router.post('/token', login);
router.get('/users/me', authenticate, getCurrentUser);

export default router;

