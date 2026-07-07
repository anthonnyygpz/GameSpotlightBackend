const db = require('../config/db');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mapea una fila de la DB al formato que espera GameModel.fromJson() en Flutter.
 * Todos los campos usan snake_case en español para coincidir con el modelo Dart.
 */
const buildGameItem = (row) => ({
  id_juego: row.game_id || '',
  titulo: row.title || '',
  slug: row.slug || '',
  sinopsis: row.description || '',
  fecha_lanzamiento: row.release_date
    ? new Date(row.release_date).toISOString().split('T')[0]
    : '',
  desarrollador: row.developer || '',
  editor: row.publisher || '',
  imagen_portada: row.cover_image || '',
  banner_url: row.banner_url || '',
  estado: row.status || '',
  destacado: row.featured ? 'si' : 'no',
  created_at: row.created_at ? new Date(row.created_at).toISOString() : '',
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : '',
  // Campos extra opcionales (se ignoran en GameModel pero útiles para la UI)
  generos: row.genres || '',
  plataformas: row.platforms || '',
  total_trailers: row.total_trailers || 0,
});

// ─── GET /api/games ───────────────────────────────────────────────────────────
/**
 * Listado paginado de juegos activos con filtros opcionales.
 */
exports.getAllGames = async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      genre = null,
      platform = null,
      status = 'active',
      featured = null,
    } = req.query;

    let whereClause = 'WHERE vg.status = ?';
    const params = [status];

    if (genre) {
      whereClause += ' AND FIND_IN_SET(?, vg.genres)';
      params.push(genre);
    }
    if (platform) {
      whereClause += ' AND FIND_IN_SET(?, vg.platforms)';
      params.push(platform);
    }
    if (featured !== null) {
      whereClause += ' AND vg.featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    const [rows] = await db.execute(
      `SELECT * FROM v_games_full vg ${whereClause}
             ORDER BY vg.featured DESC, vg.release_date DESC
             LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM v_games_full vg ${whereClause}`,
      params
    );

    return res.status(200).json({
      success: true,
      data: rows.map(buildGameItem),
      pagination: {
        total: countRows[0].total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (err) {
    return next(err);
  }
};

// ─── GET /api/games/home ──────────────────────────────────────────────────────
/**
 * Devuelve los juegos agrupados por sección para la HomeScreen de Flutter.
 * Secciones: hero, trailers, upcoming, top_rated, new_releases
 */
exports.getHomeGames = async (req, res, next) => {
  try {
    // 1) Hero: juegos destacados (featured = TRUE)
    const [heroRows] = await db.execute(
      `SELECT vg.*
             FROM v_games_full vg
             WHERE vg.featured = TRUE
             ORDER BY vg.created_at DESC
             LIMIT 5`
    );

    // 2) Trailers: un trailer oficial por juego
    const [trailerRows] = await db.execute(
      `SELECT g.game_id, g.title, g.slug, g.description, g.cover_image, g.banner_url,
                    g.release_date, g.featured, g.status, g.created_at, g.updated_at,
                    t.video_url, t.poster_url, t.title AS trailer_title, t.type AS trailer_type,
                    NULL AS genres, NULL AS platforms, 0 AS total_trailers
             FROM games g
             JOIN trailers t ON g.game_id = t.game_id
             WHERE g.status = 'active' AND t.type = 'official'
             GROUP BY g.game_id
             ORDER BY t.sort_order ASC
             LIMIT 10`
    );

    // 3) Upcoming: próximos lanzamientos
    const [upcomingRows] = await db.execute(
      `SELECT vg.*, ur.release_date AS upcoming_date, ur.release_window,
                    ur.banner_url AS upcoming_banner, ur.featured AS up_featured
             FROM v_games_full vg
             JOIN upcoming_releases ur ON vg.game_id = ur.game_id
             ORDER BY ur.featured DESC, ur.release_date ASC
             LIMIT 10`
    );

    // 4) Top rated: juegos activos no destacados con más trailers
    const [topRatedRows] = await db.execute(
      `SELECT vg.*
             FROM v_games_full vg
             WHERE vg.featured = FALSE
             ORDER BY vg.total_trailers DESC, vg.created_at DESC
             LIMIT 10`
    );

    // 5) New releases: lanzados recientemente (últimos 3 años)
    const [newReleasesRows] = await db.execute(
      `SELECT vg.*
             FROM v_games_full vg
             WHERE vg.release_date >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
               AND vg.status = 'active'
             ORDER BY vg.release_date DESC
             LIMIT 10`
    );

    // 6) Exclusives
    const [exclusivesRows] = await db.execute(
      `SELECT DISTINCT vg.*
       FROM v_games_full vg
       JOIN trailers t ON vg.game_id = t.game_id
       JOIN trailer_categories tc ON t.trailer_id = tc.trailer_id
       JOIN categories c ON tc.category_id = c.category_id
       WHERE c.name = 'Exclusive'
       ORDER BY vg.created_at DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      data: {
        hero: heroRows.map(buildGameItem),
        trailers: trailerRows.map(buildGameItem),
        upcoming: upcomingRows.map(buildGameItem),
        top_rated: topRatedRows.map(buildGameItem),
        new_releases: newReleasesRows.map(buildGameItem),
        exclusives: exclusivesRows.map(buildGameItem),
      },
    });
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
      data: rows.map(buildGameItem),
      pagination: {
        total: countRows[0].total,
        limit: Number(limit),
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

    const game = gameRows[0];

    // Trailers del juego — en formato compatible con TrailerModel.fromJson de Flutter
    const [trailerRows] = await db.execute(
      `SELECT t.trailer_id, t.game_id, t.title, t.type, t.video_url,
                    t.poster_url, t.sort_order, t.created_at,
                    GROUP_CONCAT(DISTINCT c.category_id SEPARATOR ',') AS category_ids
             FROM trailers t
             LEFT JOIN trailer_categories tc ON t.trailer_id = tc.trailer_id
             LEFT JOIN categories         c  ON tc.category_id = c.category_id
             WHERE t.game_id = ?
             GROUP BY t.trailer_id
             ORDER BY t.sort_order ASC`,
      [id]
    );

    // Respuesta del juego en formato Flutter
    const gameData = buildGameItem(game);

    // Trailers en formato TrailerModel.fromJson()
    const trailers = trailerRows.map(t => ({
      id_trailer: t.trailer_id || '',
      id_juego: t.game_id || '',
      titulo: t.title || '',
      url_video: t.video_url || '',
      url_poster: t.poster_url || '',
      duracion: t.duration || '',
      orden: String(t.sort_order ?? '0'),
      created_at: t.created_at ? new Date(t.created_at).toISOString() : '',
      // Extra: tipo y categorías para uso futuro
      tipo: t.type || 'official',
      category_ids: t.category_ids ? t.category_ids.split(',') : [],
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...gameData,
        trailers,
      },
    });
  } catch (err) {
    return next(err);
  }
};
