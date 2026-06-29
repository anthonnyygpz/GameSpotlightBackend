const db = require('../config/db');

// ─── GET /api/upcoming-releases ───────────────────────────────────────────────
/**
 * Devuelve todos los próximos lanzamientos con datos del juego y géneros.
 * Usado por UpcomingReleasesScreen en Flutter.
 */
exports.getAll = async (req, res, next) => {
    try {
        const { limit = 50, offset = 0, featured = null } = req.query;

        let whereClause = '';
        const params = [];

        if (featured !== null) {
            whereClause = 'WHERE ur.featured = ?';
            params.push(featured === 'true' ? 1 : 0);
        }

        const [rows] = await db.execute(
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
            [...params, Number(limit), Number(offset)]
        );

        const data = rows.map(row => ({
            releaseId:          row.release_id,
            releaseDate:        row.release_date,
            releaseWindow:      row.release_window,
            releaseDescription: row.release_description,
            releaseBanner:      row.release_banner,
            releaseFeatured:    !!row.release_featured,
            game: {
                gameId:      row.game_id,
                title:       row.title,
                slug:        row.slug,
                description: row.description,
                coverImage:  row.cover_image,
                bannerUrl:   row.banner_url,
                developer:   row.developer,
                publisher:   row.publisher,
                genres:      row.genres    || '',
                platforms:   row.platforms || '',
            },
        }));

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                total:  data.length,
                limit:  Number(limit),
                offset: Number(offset),
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/upcoming-releases/:id ──────────────────────────────────────────
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
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
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Lanzamiento no encontrado' });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        return next(err);
    }
};
