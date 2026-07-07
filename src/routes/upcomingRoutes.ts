import { Router } from 'express';
import * as upcoming from '../controllers/upcomingController';

const router = Router();

// GET /api/upcoming-releases
router.get('/', upcoming.getAll);

// GET /api/upcoming-releases/:id
router.get('/:id', upcoming.getById);

export default router;
