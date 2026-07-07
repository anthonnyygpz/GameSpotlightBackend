const express    = require('express');
const router     = express.Router();
const favorites  = require('../controllers/favoritesController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas de favoritos requieren autenticación
router.use(verifyToken);

// GET    /api/favorites              — Favoritos del usuario autenticado
router.get('/', favorites.getUserFavorites);

// POST   /api/favorites              — Añadir favorito { gameId }
router.post('/', favorites.addFavorite);

// GET    /api/favorites/:gameId/check — Verificar si es favorito
router.get('/:gameId/check', favorites.checkFavorite);

// DELETE /api/favorites/:gameId      — Eliminar favorito
router.delete('/:gameId', favorites.removeFavorite);

module.exports = router;
