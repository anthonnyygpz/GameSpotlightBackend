import { Router } from 'express';
import * as categories from '../controllers/categoriesController';

const router = Router();

// GET /api/trailer-categories
router.get('/', categories.getAllTrailerCategories);

export default router;
