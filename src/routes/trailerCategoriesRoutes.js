const express  = require('express');
const router   = express.Router();
const categories = require('../controllers/categoriesController');

// GET /api/trailer-categories      — Todas las relaciones trailer↔categoría
//                                    (para trailerCategoriesProvider en Flutter)
router.get('/', categories.getAllTrailerCategories);

module.exports = router;
