import { Request, Response, NextFunction } from 'express';
import { platformsService } from "../services/platformsService";
import { ApiReponse } from '../types/reponse.type';
import { GamePlatformResponse, PlatformResponse } from '../types/platform.type';

export const getGamesPlatform = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const platformId = req.params.id as string;
  if (!platformId) {
    res.status(400).json({ success: false, message: "ID de plataforma no proporcionado." });
    return;
  }

  try {
    const result = await platformsService.getGamesPlatform(platformId);
    const reponse: ApiReponse<GamePlatformResponse[]> = { success: true, data: result };
    res.status(200).json(reponse);
  } catch (err: any) {
    next(err);
  }
};

export const getPlatforms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await platformsService.getPlatforms();
    const reponse: ApiReponse<PlatformResponse[]> = { success: true, data: result };
    res.status(200).json(reponse);
  } catch (err: any) {
    next(err);
  }
};  
