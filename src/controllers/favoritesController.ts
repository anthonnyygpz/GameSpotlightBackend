import { Response, NextFunction } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';
import { AuthRequest, FavoriteRow } from '../types';

// ─── GET /api/favorites ───────────────────────────────────────────────────────
/**
 * Devuelve los favoritos del usuario autenticado.
 * Usa la vista v_user_favorites del schema.
 */
export const getUserFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.execute<(FavoriteRow & RowDataPacket)[]>(
      `SELECT vf.game_id, vf.title, vf.slug, vf.cover_image,
              vf.status, vf.added_at, vf.genres
       FROM v_user_favorites vf
       WHERE vf.user_id = ?
       ORDER BY vf.added_at DESC`,
      [req.userId as string],
    );

    res.status(200).json({
      success: true,
      data: rows.map(r => ({
        gameId:     r.game_id,
        title:      r.title,
        slug:       r.slug,
        coverImage: r.cover_image,
        status:     r.status,
        addedAt:    r.added_at,
        genres:     r.genres || '',
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/favorites ──────────────────────────────────────────────────────
export const addFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { gameId } = req.body as { gameId?: string };

    if (!gameId) {
      res.status(422).json({ success: false, message: 'gameId es requerido' });
      return;
    }

    // Verificar que el juego existe
    const [game] = await db.execute<RowDataPacket[]>(
      'SELECT game_id FROM games WHERE game_id = ?',
      [gameId],
    );
    if (game.length === 0) {
      res.status(404).json({ success: false, message: 'Juego no encontrado' });
      return;
    }

    // Verificar si ya es favorito
    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT favorite_id FROM favorites WHERE user_id = ? AND game_id = ?',
      [req.userId as string, gameId],
    );
    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'El juego ya está en favoritos' });
      return;
    }

    await db.execute<ResultSetHeader>(
      'INSERT INTO favorites (favorite_id, user_id, game_id) VALUES (UUID(), ?, ?)',
      [req.userId as string, gameId],
    );

    res.status(201).json({ success: true, message: 'Juego añadido a favoritos' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/favorites/:gameId ───────────────────────────────────────────
export const removeFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { gameId } = req.params;

    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM favorites WHERE user_id = ? AND game_id = ?',
      [req.userId as string, gameId],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Favorito no encontrado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Juego eliminado de favoritos' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/favorites/:gameId/check ────────────────────────────────────────
/**
 * Verifica si un juego es favorito del usuario (para el botón en GameDetailsScreen).
 */
export const checkFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { gameId } = req.params;

    const [rows] = await db.execute<({ favorite_id: string; added_at: Date | null } & RowDataPacket)[]>(
      'SELECT favorite_id, added_at FROM favorites WHERE user_id = ? AND game_id = ?',
      [req.userId as string, gameId],
    );

    res.status(200).json({
      success:    true,
      isFavorite: rows.length > 0,
      addedAt:    rows[0]?.added_at ?? null,
    });
  } catch (err) {
    next(err);
  }
};
