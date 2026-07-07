import { Router } from 'express';
import * as games from '../controllers/gamesController';

const router = Router();

// GET /api/games
router.get('/', games.getAllGames);

// GET /api/games/home
router.get('/home', games.getHomeGames);

// GET /api/games/search?q=...
router.get('/search', games.searchGames);

// GET /api/games/:id
router.get('/:id', games.getGameById);

export default router;
