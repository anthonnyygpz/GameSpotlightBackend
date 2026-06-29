const express        = require('express');
const router         = express.Router();
const notifications  = require('../controllers/notificationsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas de notificaciones requieren autenticación
router.use(verifyToken);

// GET   /api/notifications                    — Listado + unreadCount
router.get('/', notifications.getAll);

// PATCH /api/notifications/read-all           — Marcar todas como leídas
router.patch('/read-all', notifications.markAllRead);

// PATCH /api/notifications/:id/read           — Marcar una como leída
router.patch('/:id/read', notifications.markRead);

module.exports = router;
