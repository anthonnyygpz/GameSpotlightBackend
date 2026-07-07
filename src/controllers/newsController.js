const db = require('../config/db');

// ─── GET /api/news ────────────────────────────────────────────────────────────
/**
 * Lista de noticias paginada con datos del autor.
 */
exports.getAll = async (req, res, next) => {
    try {
        const { limit = 20, offset = 0, featured = null } = req.query;

        let whereClause = '';
        const params = [];

        if (featured !== null) {
            whereClause = 'WHERE n.featured = ?';
            params.push(featured === 'true' ? 1 : 0);
        }

        const [rows] = await db.execute(
            `SELECT n.news_id, n.title, n.slug, n.summary, n.cover_image,
                    n.published_at, n.featured, n.created_at,
                    u.name AS author_name, u.avatar_url AS author_avatar
             FROM news n
             LEFT JOIN users u ON n.author_id = u.user_id
             ${whereClause}
             ORDER BY n.featured DESC, n.published_at DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );

        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total FROM news n ${whereClause}`,
            params
        );

        return res.status(200).json({
            success: true,
            data: rows.map(n => ({
                newsId:      n.news_id,
                title:       n.title,
                slug:        n.slug,
                summary:     n.summary,
                coverImage:  n.cover_image,
                publishedAt: n.published_at,
                featured:    !!n.featured,
                author: {
                    name:      n.author_name  || 'Editorial',
                    avatarUrl: n.author_avatar || null,
                },
            })),
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

// ─── GET /api/news/:id ────────────────────────────────────────────────────────
/**
 * Artículo completo con imágenes y autor.
 */
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [newsRows] = await db.execute(
            `SELECT n.news_id, n.title, n.slug, n.summary, n.content,
                    n.cover_image, n.published_at, n.featured,
                    n.created_at, n.updated_at,
                    u.name AS author_name, u.avatar_url AS author_avatar
             FROM news n
             LEFT JOIN users u ON n.author_id = u.user_id
             WHERE n.news_id = ? OR n.slug = ?`,
            [id, id]
        );

        if (newsRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
        }

        const newsItem = newsRows[0];

        // Imágenes adicionales
        const [images] = await db.execute(
            `SELECT image_url, sort_order, caption
             FROM news_images
             WHERE news_id = ?
             ORDER BY sort_order ASC`,
            [newsItem.news_id]
        );

        return res.status(200).json({
            success: true,
            data: {
                newsId:      newsItem.news_id,
                title:       newsItem.title,
                slug:        newsItem.slug,
                summary:     newsItem.summary,
                content:     newsItem.content,
                coverImage:  newsItem.cover_image,
                publishedAt: newsItem.published_at,
                featured:    !!newsItem.featured,
                createdAt:   newsItem.created_at,
                updatedAt:   newsItem.updated_at,
                author: {
                    name:      newsItem.author_name  || 'Editorial',
                    avatarUrl: newsItem.author_avatar || null,
                },
                images: images.map(img => ({
                    imageUrl:  img.image_url,
                    sortOrder: img.sort_order,
                    caption:   img.caption,
                })),
            },
        });
    } catch (err) {
        return next(err);
    }
};
