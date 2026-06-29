const db = require('../config/db');

// ─── GET /api/notifications ───────────────────────────────────────────────────
/**
 * Lista de notificaciones del usuario autenticado.
 * Usa la vista v_unread_notifications para el conteo de no leídas.
 */
exports.getAll = async (req, res, next) => {
    try {
        const { limit = 30, offset = 0, unreadOnly = false } = req.query;

        let whereClause = 'WHERE n.user_id = ?';
        const params = [req.userId];

        if (unreadOnly === 'true') {
            whereClause += ' AND n.read = FALSE';
        }

        const [rows] = await db.execute(
            `SELECT n.notification_id, n.title, n.message, n.type,
                    n.read, n.created_at, n.read_at
             FROM notifications n
             ${whereClause}
             ORDER BY n.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );

        // Conteo de no leídas usando la vista
        const [unreadRows] = await db.execute(
            `SELECT total_unread FROM v_unread_notifications WHERE user_id = ?`,
            [req.userId]
        );

        return res.status(200).json({
            success: true,
            data: rows.map(n => ({
                notificationId: n.notification_id,
                title:          n.title,
                message:        n.message,
                type:           n.type,
                read:           !!n.read,
                createdAt:      n.created_at,
                readAt:         n.read_at,
            })),
            unreadCount: unreadRows[0]?.total_unread || 0,
        });
    } catch (err) {
        return next(err);
    }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
exports.markRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `UPDATE notifications
             SET read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE notification_id = ? AND user_id = ?`,
            [id, req.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }

        return res.status(200).json({ success: true, message: 'Notificación marcada como leída' });
    } catch (err) {
        return next(err);
    }
};

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
    try {
        const [result] = await db.execute(
            `UPDATE notifications
             SET read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND read = FALSE`,
            [req.userId]
        );

        return res.status(200).json({
            success: true,
            message: `${result.affectedRows} notificaciones marcadas como leídas`,
            updated: result.affectedRows,
        });
    } catch (err) {
        return next(err);
    }
};
