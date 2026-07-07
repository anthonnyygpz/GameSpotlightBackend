import { Router } from 'express';
import * as auth from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';
import validate from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', auth.registerValidators, validate, auth.register);

// POST /api/auth/login
router.post('/login', auth.loginValidators, validate, auth.login);

// POST /api/auth/logout  (requiere token)
router.post('/logout', verifyToken, auth.logout);

// GET  /api/auth/me  (perfil propio)
router.get('/me', verifyToken, auth.getProfile);

export default router;
