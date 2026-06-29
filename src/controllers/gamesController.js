const db = require('../config/db');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte un string hexadecimal (#RRGGBB o RRGGBB) a formato que
 * Flutter puede parsear. Si es null, devuelve el color por defecto.
 */
const normalizeColor = (hex) => {
    if (!hex) return '#000000';
    return hex.startsWith('#') ? hex : `#${hex}`;
};

/**
 * Construye el objeto GameItem compatible con el modelo Flutter.
 */
const buildGameItem = (row, category) => ({
    id:            row.game_id,
    title:         row.title,
    subtitle:      row.description
                     ? row.description.substring(0, 80).trim()
                     : '',
    gradientStart: normalizeColor(row.gradient_start),
    gradientEnd:   normalizeColor(row.gradient_end),
    badge:         row.badge        || null,
    date:          row.release_date
                     ? new Date(row.release_date).getFullYear().toString()
                     : null,
    category,
    coverImageUrl: row.cover_image  || null,
    bannerUrl:     row.banner_url   || null,
    genres:        row.genres       || '',
    platforms:     row.platforms    || '',
    totalTrailers: row.total_trailers || 0,
    featured:      !!row.featured,
    status:        row.status,
});

// ─── GET /api/games/home ──────────────────────────────────────────────────────
/**
 * Devuelve los juegos agrupados por sección para la HomeScreen de Flutter.
 * Secciones: hero, trailers, upcoming, top_rated, new_releases
 */
exports.getHomeGames = async (req, res, next) => {
    try {
        // 1) Hero: juegos destacados (featured = TRUE)
        const [heroRows] = await db.execute(
            `SELECT vg.*, NULL AS gradient_start, NULL AS gradient_end, NULL AS badge
             FROM v_games_full vg
             WHERE vg.featured = TRUE
             ORDER BY vg.created_at DESC
             LIMIT 5`
        );

        // 2) Trailers: un trailer oficial por juego
        const [trailerRows] = await db.execute(
            `SELECT g.game_id, g.title, g.description, g.cover_image, g.banner_url,
                    g.release_date, g.featured, g.status,
                    t.video_url, t.poster_url, t.title AS trailer_title, t.type AS trailer_type,
                    NULL AS gradient_start, NULL AS gradient_end, NULL AS badge,
                    NULL AS genres, NULL AS platforms, 0 AS total_trailers
             FROM games g
             JOIN trailers t ON g.game_id = t.game_id
             WHERE g.status = 'active' AND t.type = 'official'
             GROUP BY g.game_id
             ORDER BY t.sort_order ASC
             LIMIT 10`
        );

        // 3) Upcoming: próximos lanzamientos (fecha futura)
        const [upcomingRows] = await db.execute(
            `SELECT vg.*, ur.release_date AS upcoming_date, ur.release_window,
                    ur.banner_url AS upcoming_banner, ur.featured AS up_featured,
                    NULL AS gradient_start, NULL AS gradient_end, NULL AS badge
             FROM v_games_full vg
             JOIN upcoming_releases ur ON vg.game_id = ur.game_id
             WHERE ur.release_date >= CURDATE() OR ur.release_date IS NULL
             ORDER BY ur.featured DESC, ur.release_date ASC
             LIMIT 10`
        );

        // 4) Top rated: juegos activos ordenados por created_at (placeholder ratings futuros)
        const [topRatedRows] = await db.execute(
            `SELECT vg.*, NULL AS gradient_start, NULL AS gradient_end, 'TOP' AS badge
             FROM v_games_full vg
             WHERE vg.featured = FALSE
             ORDER BY vg.total_trailers DESC, vg.created_at DESC
             LIMIT 10`
        );

        // 5) New releases: lanzados recientemente (últimos 2 años)
        const [newReleasesRows] = await db.execute(
            `SELECT vg.*, NULL AS gradient_start, NULL AS gradient_end, 'NUEVO' AS badge
             FROM v_games_full vg
             WHERE vg.release_date >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
               AND vg.status = 'active'
             ORDER BY vg.release_date DESC
             LIMIT 10`
        );

        // Mapear trailerRows con campos extra (video_url)
        const trailerItems = trailerRows.map(row => ({
            ...buildGameItem(row, 'trailers'),
            videoUrl:     row.video_url    || null,
            posterUrl:    row.poster_url   || null,
            trailerTitle: row.trailer_title || row.title,
            trailerType:  row.trailer_type || 'official',
        }));

        // Mapear upcomingRows con release_window
        const upcomingItems = upcomingRows.map(row => ({
            ...buildGameItem(row, 'upcoming'),
            releaseWindow: row.release_window || null,
        }));

        const grouped = {
            hero:         heroRows.map(r => buildGameItem(r, 'hero')),
            trailers:     trailerItems,
            upcoming:     upcomingItems,
            top_rated:    topRatedRows.map(r => buildGameItem(r, 'top_rated')),
            new_releases: newReleasesRows.map(r => buildGameItem(r, 'new_releases')),
        };

        return res.status(200).json({ success: true, data: grouped });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/games/search?q=... ─────────────────────────────────────────────
exports.searchGames = async (req, res, next) => {
    try {
        const { q = '', limit = 20, offset = 0 } = req.query;

        if (!q.trim()) {
            return res.status(422).json({ success: false, message: 'El parámetro q es requerido' });
        }

        const searchTerm = `%${q.trim()}%`;

        const [rows] = await db.execute(
            `SELECT vg.*
             FROM v_games_full vg
             WHERE vg.title LIKE ? OR vg.genres LIKE ?
             ORDER BY vg.featured DESC, vg.release_date DESC
             LIMIT ? OFFSET ?`,
            [searchTerm, searchTerm, Number(limit), Number(offset)]
        );

        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM v_games_full vg
             WHERE vg.title LIKE ? OR vg.genres LIKE ?`,
            [searchTerm, searchTerm]
        );

        return res.status(200).json({
            success: true,
            data: rows.map(r => buildGameItem(r, 'search')),
            pagination: {
                total:  countRows[0].total,
                limit:  Number(limit),
                offset: Number(offset),
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/games/:id ───────────────────────────────────────────────────────
exports.getGameById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Datos base del juego
        const [gameRows] = await db.execute(
            `SELECT g.game_id, g.title, g.slug, g.description,
                    g.release_date, g.developer, g.publisher,
                    g.cover_image, g.banner_url, g.status, g.featured,
                    g.created_at, g.updated_at,
                    GROUP_CONCAT(DISTINCT ge.name  ORDER BY ge.name  SEPARATOR ', ') AS genres,
                    GROUP_CONCAT(DISTINCT pl.name  ORDER BY pl.name  SEPARATOR ', ') AS platforms
             FROM games g
             LEFT JOIN game_genres    gg ON g.game_id = gg.game_id
             LEFT JOIN genres         ge ON gg.genre_id = ge.genre_id
             LEFT JOIN game_platforms gp ON g.game_id = gp.game_id
             LEFT JOIN platforms      pl ON gp.platform_id = pl.platform_id
             WHERE g.game_id = ?
             GROUP BY g.game_id`,
            [id]
        );

        if (gameRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Juego no encontrado' });
        }

        // Trailers del juego
        const [trailers] = await db.execute(
            `SELECT t.trailer_id, t.title, t.type, t.video_url, t.poster_url, t.sort_order,
                    GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories
             FROM trailers t
             LEFT JOIN trailer_categories tc ON t.trailer_id = tc.trailer_id
             LEFT JOIN categories         c  ON tc.category_id = c.category_id
             WHERE t.game_id = ?
             GROUP BY t.trailer_id
             ORDER BY t.sort_order ASC`,
            [id]
        );

        const game = gameRows[0];

        return res.status(200).json({
            success: true,
            data: {
                gameId:      game.game_id,
                title:       game.title,
                slug:        game.slug,
                description: game.description,
                releaseDate: game.release_date,
                developer:   game.developer,
                publisher:   game.publisher,
                coverImage:  game.cover_image,
                bannerUrl:   game.banner_url,
                status:      game.status,
                featured:    !!game.featured,
                genres:      game.genres || '',
                platforms:   game.platforms || '',
                createdAt:   game.created_at,
                updatedAt:   game.updated_at,
                trailers:    trailers.map(t => ({
                    trailerId:  t.trailer_id,
                    title:      t.title,
                    type:       t.type,
                    videoUrl:   t.video_url,
                    posterUrl:  t.poster_url,
                    sortOrder:  t.sort_order,
                    categories: t.categories || '',
                })),
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/games (listado paginado) ───────────────────────────────────────
exports.getAllGames = async (req, res, next) => {
    try {
        const {
            limit    = 20,
            offset   = 0,
            genre    = null,
            platform = null,
            status   = 'active',
            featured = null,
        } = req.query;

        let whereClause = 'WHERE vg.status = ?';
        const params = [status];

        if (genre) {
            whereClause += ' AND FIND_IN_SET(?, vg.genres)';
            params.push(genre);
        }
        if (featured !== null) {
            whereClause += ' AND vg.featured = ?';
            params.push(featured === 'true' ? 1 : 0);
        }

        const [rows] = await db.execute(
            `SELECT * FROM v_games_full ${whereClause}
             ORDER BY vg.featured DESC, vg.release_date DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );

        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total FROM v_games_full ${whereClause}`,
            params
        );

        return res.status(200).json({
            success: true,
            data: rows.map(r => buildGameItem(r, 'list')),
            pagination: {
                total:  countRows[0].total,
                limit:  Number(limit),
                offset: Number(offset),
            },
        });
    } catch (err) {
        return next(err);
    }
};
