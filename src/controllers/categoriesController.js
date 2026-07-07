const db = require('../config/db');

// ─── GET /api/categories ──────────────────────────────────────────────────────
/**
 * Lista todas las categorías de trailers.
 * Compatible con categoriesProvider en Flutter.
 * CategoryModel.fromJson espera: category_id, name
 */
exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT category_id, name FROM categories ORDER BY name ASC`
        );

        return res.status(200).json({
            success: true,
            data: rows.map(row => ({
                category_id: row.category_id || '',
                name:        row.name        || '',
            })),
        });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/categories/:id ──────────────────────────────────────────────────
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT category_id, name FROM categories WHERE category_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }

        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                category_id: row.category_id || '',
                name:        row.name        || '',
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── GET /api/trailer-categories ─────────────────────────────────────────────
/**
 * Lista todas las relaciones trailer ↔ categoría.
 * Compatible con trailerCategoriesProvider en Flutter.
 * TrailerCategoryModel.fromJson espera: trailer_id, category_id
 */
exports.getAllTrailerCategories = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT tc.trailer_id, tc.category_id
             FROM trailer_categories tc
             ORDER BY tc.category_id ASC, tc.trailer_id ASC`
        );

        return res.status(200).json({
            success: true,
            data: rows.map(row => ({
                trailer_id:  row.trailer_id  || '',
                category_id: row.category_id || '',
            })),
        });
    } catch (err) {
        return next(err);
    }
};
