import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../types';
import { ApiReponse } from '../types/reponse.type';
import { LoginResponse, RegisterResponse } from '../types/auth.type';
import { UserResponse } from '../types/user.type';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body, req.ip ?? null, req.headers['user-agent'] ?? null);
    const reponse: ApiReponse<RegisterResponse> = { success: true, message: 'Usuario registrado exitosamente', data: result };
    res.status(201).json(reponse);
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body, req.ip ?? null, req.headers['user-agent'] ?? null);
    const reponse: ApiReponse<LoginResponse> = { success: true, message: 'Inicio de sesión exitoso', data: result };
    res.status(201).json(reponse);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) await authService.logout(token);
    res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await authService.getProfile(req.userId as string);
    const reponse: ApiReponse<UserResponse> = { success: true, data: profile };
    res.status(200).json(reponse);
  } catch (err) {
    next(err);
  }
};


export const forgetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { password } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: "ID de usuario no proporcionado." });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: "Contraseña no proporcionada." });
      return;
    }

    const result = await authService.forgetPassword(userId, password);
    const reponse: ApiReponse<UserResponse> = { success: true, data: result };
    res.status(200).json(reponse);
  } catch (err) {
    next(err);
  }
};
