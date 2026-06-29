const express = require('express');
const router  = express.Router();
const games   = require('../controllers/gamesController');

// GET /api/games/home  — Datos de la HomeScreen agrupados por sección
router.get('/home', games.getHomeGames);

// GET /api/games/search?q=term  — Búsqueda fulltext
router.get('/search', games.searchGames);

// GET /api/games  — Listado paginado con filtros opcionales
router.get('/', games.getAllGames);

// GET /api/games/:id  — Detalle completo de un juego
router.get('/:id', games.getGameById);

module.exports = router;
