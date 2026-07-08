import { Router } from "express";
import * as genres from '../controllers/genresController';

const router = Router();

router.get('/:id', genres.getGameGenres)

router.get('/', genres.getGeres)

export default router;
