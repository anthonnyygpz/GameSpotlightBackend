import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import db from '../config/db';
import { AuthRequest, JwtPayload, UserRole, ROLE_HIERARCHY } from '../types';


/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>.
 * Además de la firma y expiración, valida que la sesión siga activa en DB
 * (para que el logout invalide el token correctamente).
 * Adjunta req.userId y req.userRole al request.
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(403).json({ success: false, message: 'Token no proporcionado' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(403).json({ success: false, message: 'Formato de token inválido' });
    return;
  }

  const token = parts[1];

  // 1) Verificar firma y expiración del JWT
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch (err) {
    const message =
      (err as Error).name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    res.status(401).json({ success: false, message });
    return;
  }

  // 2) Verificar que la sesión siga activa en DB (invalida tras logout)
  try {
    const [sessions] = await db.execute<(RowDataPacket & { session_id: string })[]>(
      `SELECT session_id FROM sessions WHERE token = ? AND active = TRUE LIMIT 1`,
      [token],
    );

    if (sessions.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Sesión inválida o cerrada. Inicia sesión nuevamente.',
      });
      return;
    }
  } catch (dbErr) {
    return next(dbErr);
  }

  // 3) Actualizar last_login del usuario en cada petición autenticada
  try {
    await db.execute(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [decoded.userId],
    );
  } catch (_) {
    // No fatal: continuar aunque falle el update de last_login
  }

  req.userId   = decoded.userId;
  req.userRole = decoded.role || 'viewer';
  return next();
};

/**
 * Fábrica de middleware que exige un rol específico.
 * Debe usarse DESPUÉS de verifyToken.
 * @param role - Rol requerido: 'admin' | 'editor' | 'viewer'
 */
export const requireRole =
  (role: UserRole) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = (req.userRole as UserRole) || 'viewer';
    if ((ROLE_HIERARCHY[userRole] || 0) < (ROLE_HIERARCHY[role] || 0)) {
      res.status(403).json({
        success: false,
        message: `Se requiere rol '${role}' o superior`,
      });
      return;
    }
    next();
  };
