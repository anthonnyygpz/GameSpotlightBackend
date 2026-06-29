const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const authRoutes          = require('./routes/authRoutes');
const gamesRoutes         = require('./routes/gamesRoutes');
const upcomingRoutes      = require('./routes/upcomingRoutes');
const favoritesRoutes     = require('./routes/favoritesRoutes');
const newsRoutes          = require('./routes/newsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const errorHandler        = require('./middleware/errorHandler');

const app = express();

// ─── Middleware global ────────────────────────────────────────────────────────
app.use(cors({
    origin: '*',               // En producción, restringir al dominio de la app
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status:  'OK',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/games',          gamesRoutes);
app.use('/api/upcoming-releases', upcomingRoutes);
app.use('/api/favorites',      favoritesRoutes);
app.use('/api/news',           newsRoutes);
app.use('/api/notifications',  notificationsRoutes);

// ─── 404 para rutas no encontradas ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// ─── Manejo global de errores (debe ir ÚLTIMO) ────────────────────────────────
app.use(errorHandler);

// ─── Arranque del servidor ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║     🎮  Game Spotlight API v2.0      ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Puerto : ${PORT}                        ║`);
    console.log(`║  Env    : ${(process.env.NODE_ENV || 'development').padEnd(26)} ║`);
    console.log('╠══════════════════════════════════════╣');
    console.log('║  Rutas disponibles:                  ║');
    console.log('║  GET  /api/health                    ║');
    console.log('║  POST /api/auth/register             ║');
    console.log('║  POST /api/auth/login                ║');
    console.log('║  GET  /api/games/home                ║');
    console.log('║  GET  /api/games/:id                 ║');
    console.log('║  GET  /api/upcoming-releases         ║');
    console.log('║  GET  /api/favorites                 ║');
    console.log('║  GET  /api/news                      ║');
    console.log('║  GET  /api/notifications             ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
