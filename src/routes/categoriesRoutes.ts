import { Router } from 'express';
import * as categories from '../controllers/categoriesController';

const router = Router();

// GET /api/categories
router.get('/', categories.getAll);

// GET /api/categories/:id
router.get('/:id', categories.getById);

export default router;
