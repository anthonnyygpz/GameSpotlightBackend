const db = require('../config/db');

// ─── GET /api/favorites  ──────────────────────────────────────────────────────
/**
 * Devuelve los favoritos del usuario autenticado.
 * Usa la vista v_user_favorites del schema.
 */
exports.getUserFavorites = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT vf.game_id, vf.title, vf.slug, vf.cover_image,
                    vf.status, vf.added_at, vf.genres
             FROM v_user_favorites vf
             WHERE vf.user_id = ?
             ORDER BY vf.added_at DESC`,
            [req.userId]
        );

        return res.status(200).json({
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
        return next(err);
    }
};

// ─── POST /api/favorites ──────────────────────────────────────────────────────
exports.addFavorite = async (req, res, next) => {
    try {
        const { gameId } = req.body;

        if (!gameId) {
            return res.status(422).json({ success: false, message: 'gameId es requerido' });
        }

        // Verificar que el juego existe
        const [game] = await db.execute(
            'SELECT game_id FROM games WHERE game_id = ?',
            [gameId]
        );
        if (game.length === 0) {
            return res.status(404).json({ success: false, message: 'Juego no encontrado' });
        }

        // Verificar si ya es favorito
        const [existing] = await db.execute(
            'SELECT favorite_id FROM favorites WHERE user_id = ? AND game_id = ?',
            [req.userId, gameId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'El juego ya está en favoritos' });
        }

        await db.execute(
            'INSERT INTO favorites (favorite_id, user_id, game_id) VALUES (UUID(), ?, ?)',
            [req.userId, gameId]
        );

        return res.status(201).json({ success: true, message: 'Juego añadido a favoritos' });
    } catch (err) {
        return next(err);
    }
};

// ─── DELETE /api/favorites/:gameId ───────────────────────────────────────────
exports.removeFavorite = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const [result] = await db.execute(
            'DELETE FROM favorites WHERE user_id = ? AND game_id = ?',
            [req.userId, gameId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' });
        }

        return res.status(200).json({ success: true, message: 'Juego eliminado de favoritos' });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/favorites/:gameId/check ────────────────────────────────────────
/**
 * Verifica si un juego es favorito del usuario (para el botón en GameDetailsScreen).
 */
exports.checkFavorite = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const [rows] = await db.execute(
            'SELECT favorite_id, added_at FROM favorites WHERE user_id = ? AND game_id = ?',
            [req.userId, gameId]
        );

        return res.status(200).json({
            success:    true,
            isFavorite: rows.length > 0,
            addedAt:    rows[0]?.added_at || null,
        });
    } catch (err) {
        return next(err);
    }
};
