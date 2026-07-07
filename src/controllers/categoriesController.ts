import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../config/db';
import { CategoryRow, TrailerCategoryRow } from '../types';

// ─── GET /api/categories ──────────────────────────────────────────────────────
/**
 * Lista todas las categorías de trailers.
 * Compatible con categoriesProvider en Flutter.
 * CategoryModel.fromJson espera: category_id, name
 */
export const getAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.execute<(CategoryRow & RowDataPacket)[]>(
      `SELECT category_id, name FROM categories ORDER BY name ASC`,
    );

    res.status(200).json({
      success: true,
      data: rows.map(row => ({
        category_id: row.category_id || '',
        name:        row.name        || '',
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/categories/:id ──────────────────────────────────────────────────
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute<(CategoryRow & RowDataPacket)[]>(
      `SELECT category_id, name FROM categories WHERE category_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      return;
    }

    const row = rows[0];
    res.status(200).json({
      success: true,
      data: {
        category_id: row.category_id || '',
        name:        row.name        || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/trailer-categories ─────────────────────────────────────────────
/**
 * Lista todas las relaciones trailer ↔ categoría.
 * Compatible con trailerCategoriesProvider en Flutter.
 * TrailerCategoryModel.fromJson espera: trailer_id, category_id
 */
export const getAllTrailerCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.execute<(TrailerCategoryRow & RowDataPacket)[]>(
      `SELECT tc.trailer_id, tc.category_id
       FROM trailer_categories tc
       ORDER BY tc.category_id ASC, tc.trailer_id ASC`,
    );

    res.status(200).json({
      success: true,
      data: rows.map(row => ({
        trailer_id:  row.trailer_id  || '',
        category_id: row.category_id || '',
      })),
    });
  } catch (err) {
    next(err);
  }
};
