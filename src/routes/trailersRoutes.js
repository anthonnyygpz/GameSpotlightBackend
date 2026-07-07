const express  = require('express');
const router   = express.Router();
const trailers = require('../controllers/trailersController');

// GET /api/trailers               — Todos los trailers (para trailersProvider)
router.get('/', trailers.getAll);

// GET /api/trailers/:idJuego      — Primer trailer de un juego por game_id
//                                   (para trailerDetailsProvider.family en Flutter)
router.get('/:idJuego', trailers.getByGameId);

// GET /api/trailers/by-trailer/:id — Trailer por su propio ID
router.get('/by-trailer/:id', trailers.getById);

module.exports = router;
