import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/authRoutes';
import gamesRoutes from './routes/gamesRoutes';
import trailersRoutes from './routes/trailersRoutes';
import categoriesRoutes from './routes/categoriesRoutes';
import trailerCategoriesRoutes from './routes/trailerCategoriesRoutes';
import upcomingRoutes from './routes/upcomingRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import newsRoutes from './routes/newsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import userRoutes from './routes/usersRoutes';
import genresRoutes from './routes/genresRoutes';
import platformsRoutes from './routes/platformsRoutes';
import errorHandler from './middleware/errorHandler';

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
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/trailers', trailersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/trailer-categories', trailerCategoriesRoutes);
app.use('/api/upcoming-releases', upcomingRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/platforms', platformsRoutes);

// ─── 404 para rutas no encontradas ───────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Manejo global de errores (debe ir ÚLTIMO) ────────────────────────────────
app.use(errorHandler);

// ─── Arranque del servidor ────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🎮  Game Spotlight API v3.0          ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Puerto : ${PORT}                        ║`);
  console.log(`║  Env    : ${(process.env.NODE_ENV || 'development').padEnd(28)} ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Rutas disponibles:                      ║');
  console.log('║  GET    /api/health                      ║');
  console.log('║  POST   /api/auth/register               ║');
  console.log('║  POST   /api/auth/login                  ║');
  console.log('║  POST   /api/auth/logout                 ║');
  console.log('║  GET    /api/auth/me                     ║');
  console.log('║  GET    /api/games                       ║');
  console.log('║  GET    /api/games/home                  ║');
  console.log('║  GET    /api/games/search?q=             ║');
  console.log('║  GET    /api/games/:id                   ║');
  console.log('║  GET    /api/trailers                    ║');
  console.log('║  GET    /api/trailers/:idJuego           ║');
  console.log('║  GET    /api/categories                  ║');
  console.log('║  GET    /api/trailer-categories          ║');
  console.log('║  GET    /api/upcoming-releases           ║');
  console.log('║  GET    /api/favorites         [auth]    ║');
  console.log('║  POST   /api/favorites         [auth]    ║');
  console.log('║  DELETE /api/favorites/:gameId [auth]    ║');
  console.log('║  GET    /api/news                        ║');
  console.log('║  GET    /api/notifications     [auth]    ║');
  console.log('║  GET    /api/user              [auth]    ║');
  console.log('║  GET    /api/genres                      ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

export default app;
