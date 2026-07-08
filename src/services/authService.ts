import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';
import { UserRow, RoleRow } from '../types';
import { LoginResponse, RegisterResponse } from '../types/auth.type';
import { UserResponse } from '../types/user.type';

export const authService = {
  async register(data: any, ip: string | null, userAgent: string | null): Promise<RegisterResponse> {
    const { name, email, password, country } = data;

    const [existing] = await db.execute<RowDataPacket[]>('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('El correo ya está registrado'); // El error handler debe mapear esto a 409

    const passwordHash = await bcrypt.hash(password, 12);

    await db.execute<ResultSetHeader>(
      `INSERT INTO users (user_id, name, email, password_hash, country, last_login) VALUES (UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, email, passwordHash, country ?? null]
    );

    const [rows] = await db.execute<(UserRow & RowDataPacket)[]>('SELECT user_id, name, email, country, registered_at FROM users WHERE email = ?', [email]);
    const user = rows[0];

    await db.execute<ResultSetHeader>(`INSERT INTO user_settings (settings_id, user_id) VALUES (UUID(), ?)`, [user.user_id]);

    const [roles] = await db.execute<(RoleRow & RowDataPacket)[]>("SELECT role_id FROM roles WHERE name = 'viewer' LIMIT 1");
    if (roles.length > 0) {
      await db.execute<ResultSetHeader>(`INSERT INTO user_roles (id, user_id, role_id) VALUES (UUID(), ?, ?)`, [user.user_id, roles[0].role_id]);
    }

    const token = jwt.sign({ userId: user.user_id, role: 'viewer' }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    await db.execute<ResultSetHeader>(
      `INSERT INTO sessions (session_id, user_id, token, ip_address, user_agent) VALUES (UUID(), ?, ?, ?, ?)`,
      [user.user_id, token, ip, userAgent]
    );

    return {
      token_type: 'Bearer',
      access_token: token,
      expires_in: 604800,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        registered_at: user.registered_at
      }
    };
  },

  async login(data: any, ip: string | null, userAgent: string | null): Promise<LoginResponse> {
    const { identifier, password } = data;

    const [users] = await db.execute<(UserRow & RowDataPacket)[]>(
      `SELECT u.user_id, u.name, u.email, u.password_hash, u.avatar_url, u.country, u.active, r.name AS role
       FROM users u LEFT JOIN user_roles ur ON u.user_id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.email = ? OR u.name = ? LIMIT 1`,
      [identifier, identifier]
    );

    if (users.length === 0) throw new Error('Credenciales inválidas');
    const user = users[0];
    if (!user.active) throw new Error('Cuenta desactivada');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Credenciales inválidas');

    await db.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

    const role = user.role ?? 'viewer';
    const token = jwt.sign({ userId: user.user_id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    await db.execute<ResultSetHeader>(
      `INSERT INTO sessions (session_id, user_id, token, ip_address, user_agent) VALUES (UUID(), ?, ?, ?, ?)`,
      [user.user_id, token, ip, userAgent]
    );

    return {
      token_type: 'Bearer',
      access_token: token,
      expires_in: 604800,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        registered_at: user.registered_at
      }
    };
  },

  async logout(token: string) {
    await db.execute(`UPDATE sessions SET active = FALSE, ended_at = CURRENT_TIMESTAMP WHERE token = ?`, [token]);
  },

  async getProfile(userId: string): Promise<Omit<UserResponse, 'password_hash' | 'active'>> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT u.user_id, u.name, u.email, u.avatar_url, u.country, u.registered_at, u.last_login,
              us.theme, us.email_notifications, us.push_notifications, us.profile_privacy, 
              l.code AS language_code, l.name AS language_name, r.name AS role
       FROM users u
       LEFT JOIN user_settings us ON u.user_id = us.user_id
       LEFT JOIN languages l ON us.language_id = l.language_id
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.user_id = ?`,
      [userId]
    );
    if (rows.length === 0) throw new Error('Usuario no encontrado');

    return {
      user_id: rows[0].user_id,
      name: rows[0].name,
      email: rows[0].email,
      avatar_url: rows[0].avatar_url,
      country: rows[0].country,
      registered_at: rows[0].registered_at,
      last_login: rows[0].last_login,
      role: rows[0].role
    };
  },

  async forgetPassword(userId: string, password: string): Promise<Omit<UserResponse, 'password_hash' | 'active'>> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT u.user_id, u.name, u.email, u.avatar_url, u.country, u.active, u.registered_at,
              us.theme, us.email_notifications, us.push_notifications, us.profile_privacy, 
              l.code AS language_code, l.name AS language_name, r.name AS role
       FROM users u
       LEFT JOIN user_settings us ON u.user_id = us.user_id
       LEFT JOIN languages l ON us.language_id = l.language_id
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.user_id = ?`,
      [userId]
    );
    if (rows.length === 0) throw new Error('Usuario no encontrado');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.execute<ResultSetHeader>(
      `UPDATE users SET password_hash = ? WHERE user_id = ?`,
      [hash, userId]
    );

    return {
      user_id: rows[0].user_id,
      name: rows[0].name,
      email: rows[0].email,
      avatar_url: rows[0].avatar_url,
      country: rows[0].country,
      registered_at: rows[0].registered_at,
      last_login: rows[0].last_login,
      role: rows[0].role
    };
  }
};
