const express    = require('express');
const router     = express.Router();
const categories = require('../controllers/categoriesController');

// GET /api/categories              — Todas las categorías (para categoriesProvider)
router.get('/', categories.getAll);

// GET /api/categories/:id          — Una categoría por ID
router.get('/:id', categories.getById);

module.exports = router;
