const express    = require('express');
const router     = express.Router();
const auth       = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const validate   = require('../middleware/validate');

// POST /api/auth/register
router.post(
    '/register',
    auth.registerValidators,
    validate,
    auth.register
);

// POST /api/auth/login
router.post(
    '/login',
    auth.loginValidators,
    validate,
    auth.login
);

// POST /api/auth/logout  (requiere token)
router.post('/logout', verifyToken, auth.logout);

// GET  /api/auth/me  (perfil propio)
router.get('/me', verifyToken, auth.getProfile);

module.exports = router;
