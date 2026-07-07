const express  = require('express');
const router   = express.Router();
const upcoming = require('../controllers/upcomingController');

// GET /api/upcoming-releases          — Listado completo
router.get('/', upcoming.getAll);

// GET /api/upcoming-releases/:id      — Detalle de un lanzamiento
router.get('/:id', upcoming.getById);

module.exports = router;
