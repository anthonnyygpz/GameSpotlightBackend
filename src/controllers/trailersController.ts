import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../config/db';
import { TrailerRow } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mapea una fila de trailers al formato que espera TrailerModel.fromJson() en Flutter.
 * Campos: id_trailer, id_juego, titulo, url_video, url_poster, duracion, orden, created_at
 */
const buildTrailerItem = (row: TrailerRow) => ({
  id_trailer:  row.trailer_id || '',
  id_juego:    row.game_id    || '',
  titulo:      row.title      || '',
  url_video:   row.video_url  || '',
  url_poster:  row.poster_url || '',
  duracion:    row.duration   || '',
  orden:       String(row.sort_order ?? '0'),
  created_at:  row.created_at ? new Date(row.created_at).toISOString() : '',
  // Campos extra (no en TrailerEntity, pero disponibles)
  tipo:        row.type || 'official',
});

// ─── GET /api/trailers ────────────────────────────────────────────────────────
/**
 * Lista todos los trailers activos.
 * Compatible con trailersProvider en Flutter.
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const [rows] = await db.execute<(TrailerRow & RowDataPacket)[]>(
      `SELECT t.trailer_id, t.game_id, t.title, t.type,
              t.video_url, t.poster_url, t.duration, t.sort_order, t.created_at
       FROM trailers t
       JOIN games g ON t.game_id = g.game_id
       WHERE g.status = 'active'
       ORDER BY t.game_id ASC, t.sort_order ASC
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)],
    );

    res.status(200).json({
      success: true,
      data: rows.map(buildTrailerItem),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/trailers/:idJuego ───────────────────────────────────────────────
/**
 * Devuelve el primer trailer de un juego buscado por game_id.
 * Compatible con trailerDetailsProvider(id).future en Flutter:
 *   repository.getTrailerById(idJuego)
 */
export const getByGameId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { idJuego } = req.params;

    const [rows] = await db.execute<(TrailerRow & RowDataPacket)[]>(
      `SELECT t.trailer_id, t.game_id, t.title, t.type,
              t.video_url, t.poster_url, t.duration, t.sort_order, t.created_at
       FROM trailers t
       WHERE t.game_id = ?
       ORDER BY t.sort_order ASC
       LIMIT 1`,
      [idJuego],
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trailer no encontrado para este juego' });
      return;
    }

    res.status(200).json({
      success: true,
      data: buildTrailerItem(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/trailers/by-trailer/:id ────────────────────────────────────────
/**
 * Devuelve un trailer por su propio ID (trailer_id).
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute<(TrailerRow & RowDataPacket)[]>(
      `SELECT t.trailer_id, t.game_id, t.title, t.type,
              t.video_url, t.poster_url, t.sort_order, t.created_at
       FROM trailers t
       WHERE t.trailer_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trailer no encontrado' });
      return;
    }

    res.status(200).json({
      success: true,
      data: buildTrailerItem(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};
