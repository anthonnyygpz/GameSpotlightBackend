import { Request, Response, NextFunction } from 'express';
import { genresService } from "../services/genresService";
import { ApiReponse } from '../types/reponse.type';
import { GameGenreResponse, GenreResponse } from '../types/genre.type';

export const getGameGenres = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const genreId = req.params.id as string;
  if (!genreId) {
    res.status(400).json({ success: false, message: "ID de género no proporcionado." });
    return;
  }

  try {
    const result = await genresService.getGameGenres(genreId);
    const reponse: ApiReponse<GameGenreResponse[]> = { success: true, data: result };
    res.status(200).json(reponse);
  } catch (err: any) {
    next(err);
  }
};

export const getGeres = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await genresService.getGeres();
    const reponse: ApiReponse<GenreResponse[]> = { success: true, data: result };
    res.status(200).json(reponse);
  } catch (err: any) {
    next(err);
  }
};
