import { Router } from 'express';
import * as notifications from '../controllers/notificationsController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(verifyToken);

// GET   /api/notifications
router.get('/', notifications.getAll);

// PATCH /api/notifications/read-all
router.patch('/read-all', notifications.markAllRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notifications.markRead);

export default router;
