import { Router } from 'express';
import * as trailers from '../controllers/trailersController';

const router = Router();

// GET /api/trailers
router.get('/', trailers.getAll);

// GET /api/trailers/by-trailer/:id   — por trailer_id propio
router.get('/by-trailer/:id', trailers.getById);

// GET /api/trailers/:idJuego         — primer trailer del juego
router.get('/:idJuego', trailers.getByGameId);

export default router;
