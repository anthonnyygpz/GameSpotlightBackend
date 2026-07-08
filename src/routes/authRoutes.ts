import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as user from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';
import { registerValidators, loginValidators } from '../middleware/authValidators';
import validate from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidators, validate, auth.register);

// POST /api/auth/login
router.post('/login', loginValidators, validate, auth.login);

// POST /api/auth/logout  (requiere token)
router.post('/logout', verifyToken, auth.logout);

// GET  /api/auth/me  (perfil propio)
router.get('/me', verifyToken, auth.getProfile);

router.post('/forget-password', verifyToken, auth.forgetPassword);

router.put('/update-user', verifyToken, user.updateUser);

export default router;
