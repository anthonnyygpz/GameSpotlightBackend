import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../config/db';
import { UpcomingRow } from '../types';

// ─── GET /api/upcoming-releases ───────────────────────────────────────────────
/**
 * Devuelve todos los próximos lanzamientos con datos del juego y géneros.
 * Usado por UpcomingReleasesScreen en Flutter.
 * El objeto 'game' anidado usa los campos en formato Flutter (snake_case en español).
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { limit = 50, offset = 0, featured } = req.query;

    let whereClause = '';
    const params: (string | number)[] = [];

    if (featured !== undefined && featured !== null) {
      whereClause = 'WHERE ur.featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    const [rows] = await db.execute<(UpcomingRow & RowDataPacket)[]>(
      `SELECT
          ur.release_id,
          ur.release_date,
          ur.release_window,
          ur.description     AS release_description,
          ur.banner_url      AS release_banner,
          ur.featured        AS release_featured,
          ur.created_at      AS release_created_at,
          g.game_id,
          g.title,
          g.slug,
          g.description,
          g.cover_image,
          g.banner_url,
          g.developer,
          g.publisher,
          GROUP_CONCAT(DISTINCT ge.name ORDER BY ge.name SEPARATOR ', ') AS genres,
          GROUP_CONCAT(DISTINCT pl.name ORDER BY pl.name SEPARATOR ', ') AS platforms
       FROM upcoming_releases ur
       JOIN games           g  ON ur.game_id = g.game_id
       LEFT JOIN game_genres gg ON g.game_id = gg.game_id
       LEFT JOIN genres      ge ON gg.genre_id = ge.genre_id
       LEFT JOIN game_platforms gp ON g.game_id = gp.game_id
       LEFT JOIN platforms      pl ON gp.platform_id = pl.platform_id
       ${whereClause}
       GROUP BY ur.release_id, g.game_id
       ORDER BY ur.featured DESC,
                CASE WHEN ur.release_date IS NULL THEN 1 ELSE 0 END,
                ur.release_date ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)],
    );

    const data = rows.map(row => ({
      release_id:          row.release_id || '',
      release_date:        row.release_date
        ? new Date(row.release_date).toISOString().split('T')[0]
        : null,
      release_window:      row.release_window      ?? null,
      release_description: row.release_description ?? '',
      release_banner:      row.release_banner       ?? null,
      release_featured:    !!row.release_featured,
      // Juego en formato GameModel.fromJson de Flutter
      game: {
        id_juego:       row.game_id     || '',
        titulo:         row.title       || '',
        slug:           row.slug        || '',
        sinopsis:       row.description || '',
        imagen_portada: row.cover_image || '',
        banner_url:     row.banner_url  || '',
        desarrollador:  row.developer   || '',
        editor:         row.publisher   || '',
        generos:        row.genres      || '',
        plataformas:    row.platforms   || '',
      },
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total:  data.length,
        limit:  Number(limit),
        offset: Number(offset),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/upcoming-releases/:id ──────────────────────────────────────────
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute<(UpcomingRow & RowDataPacket)[]>(
      `SELECT
          ur.*,
          g.game_id, g.title, g.slug, g.description,
          g.cover_image, g.banner_url, g.developer, g.publisher,
          GROUP_CONCAT(DISTINCT ge.name ORDER BY ge.name SEPARATOR ', ') AS genres,
          GROUP_CONCAT(DISTINCT pl.name ORDER BY pl.name SEPARATOR ', ') AS platforms
       FROM upcoming_releases ur
       JOIN games           g  ON ur.game_id = g.game_id
       LEFT JOIN game_genres gg ON g.game_id = gg.game_id
       LEFT JOIN genres      ge ON gg.genre_id = ge.genre_id
       LEFT JOIN game_platforms gp ON g.game_id = gp.game_id
       LEFT JOIN platforms      pl ON gp.platform_id = pl.platform_id
       WHERE ur.release_id = ?
       GROUP BY ur.release_id, g.game_id`,
      [id],
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Lanzamiento no encontrado' });
      return;
    }

    const row = rows[0];
    res.status(200).json({
      success: true,
      data: {
        release_id:          row.release_id || '',
        release_date:        row.release_date
          ? new Date(row.release_date).toISOString().split('T')[0]
          : null,
        release_window:      row.release_window ?? null,
        release_description: row.description    || '',
        release_banner:      row.banner_url     ?? null,
        release_featured:    !!row.featured,
        game: {
          id_juego:       row.game_id     || '',
          titulo:         row.title       || '',
          slug:           row.slug        || '',
          sinopsis:       row.description || '',
          imagen_portada: row.cover_image || '',
          banner_url:     row.banner_url  || '',
          desarrollador:  row.developer   || '',
          editor:         row.publisher   || '',
          generos:        row.genres      || '',
          plataformas:    row.platforms   || '',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
