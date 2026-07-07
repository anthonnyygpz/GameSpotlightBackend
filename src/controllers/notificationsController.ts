import { Response, NextFunction } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';
import { AuthRequest, NotificationRow } from '../types';

// ─── GET /api/notifications ───────────────────────────────────────────────────
/**
 * Lista de notificaciones del usuario autenticado.
 * Usa la vista v_unread_notifications para el conteo de no leídas.
 */
export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { limit = 30, offset = 0, unreadOnly } = req.query;

    let whereClause = 'WHERE n.user_id = ?';
    const params: (string | number)[] = [req.userId as string];

    if (unreadOnly === 'true') {
      whereClause += ' AND n.read = FALSE';
    }

    const [rows] = await db.execute<(NotificationRow & RowDataPacket)[]>(
      `SELECT n.notification_id, n.title, n.message, n.type,
              n.read, n.created_at, n.read_at
       FROM notifications n
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)],
    );

    // Conteo de no leídas usando la vista
    const [unreadRows] = await db.execute<({ total_unread: number } & RowDataPacket)[]>(
      `SELECT total_unread FROM v_unread_notifications WHERE user_id = ?`,
      [req.userId as string],
    );

    res.status(200).json({
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
      unreadCount: unreadRows[0]?.total_unread ?? 0,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
export const markRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE notifications
       SET read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE notification_id = ? AND user_id = ?`,
      [id, req.userId as string],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Notificación no encontrada' });
      return;
    }

    res.status(200).json({ success: true, message: 'Notificación marcada como leída' });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
export const markAllRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE notifications
       SET read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND read = FALSE`,
      [req.userId as string],
    );

    res.status(200).json({
      success: true,
      message: `${result.affectedRows} notificaciones marcadas como leídas`,
      updated: result.affectedRows,
    });
  } catch (err) {
    next(err);
  }
};
