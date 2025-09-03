import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authController.signin);
router.post('/logout', authController.signout);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getMe);
router.post('/refresh', authMiddleware, authController.refreshToken);

export default router;
