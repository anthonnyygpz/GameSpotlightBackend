import { Router } from 'express';
import * as news from '../controllers/newsController';

const router = Router();

// GET /api/news
router.get('/', news.getAll);

// GET /api/news/:id
router.get('/:id', news.getById);

export default router;
