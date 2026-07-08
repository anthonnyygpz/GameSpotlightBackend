import { Response, NextFunction } from 'express';
import { AuthRequest } from "../types";
import db from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password_hash, avatar_url, country } = req.body;

    await db.execute<ResultSetHeader>(
      `INSERT INTO users (name, email, password_hash, avatar_url, country) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password_hash, avatar_url || null, country || null]
    );

    res.status(201).json({ success: true, message: "Usuario creado en el sistema." });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT user_id, name, email, active, country, registered_at FROM users`
    );

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.params.id || req.userId) as string;

    if (!userId) {
      res.status(400).json({ success: false, message: "ID de usuario no proporcionado." });
      return;
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
          u.user_id, u.name, u.email, u.avatar_url, u.country, u.active, u.registered_at,
          ro.name AS role
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles ro ON ur.role_id = ro.role_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!rows.length) {
      res.status(404).json({ success: false, message: "Usuario no localizado." });
      return;
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Acceso denegado. Token ausente o inválido." });
      return;
    }

    const { name, avatar_url, country, active } = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(avatar_url); }
    if (country !== undefined) { fields.push("country = ?"); values.push(country); }
    if (active !== undefined) { fields.push("active = ?"); values.push(active); }

    if (fields.length === 0) {
      res.status(400).json({ success: false, message: "No se proporcionaron parámetros para actualizar." });
      return;
    }

    values.push(userId);

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(200).json({
        success: true,
        message: "No se registraron modificaciones. Los datos son idénticos a los actuales o el registro no fue localizado."
      });
      return;
    }

    res.status(200).json({ success: true, message: "Protocolo de actualización completado con éxito." });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Acceso denegado. Token ausente o inválido." });
      return;
    }

    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Imposible ejecutar la purga. Usuario no localizado." });
      return;
    }

    res.status(200).json({ success: true, message: "Cuenta removida del sistema de forma definitiva." });
  } catch (err) {
    next(err);
  }
};
