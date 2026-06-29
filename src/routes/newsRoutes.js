const express = require('express');
const router  = express.Router();
const news    = require('../controllers/newsController');

// GET /api/news         — Listado paginado de noticias
router.get('/', news.getAll);

// GET /api/news/:id     — Artículo completo (acepta news_id o slug)
router.get('/:id', news.getById);

module.exports = router;
