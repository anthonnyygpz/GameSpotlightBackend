import { Request, Response, NextFunction } from 'express';

// ─── Request extendido con datos del usuario autenticado ─────────────────────
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// ─── Tipos de rol ─────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'editor' | 'viewer';

// ─── Jerarquía de roles ───────────────────────────────────────────────────────
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

// ─── Payload del JWT ──────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Tipo controlador estándar ────────────────────────────────────────────────
export type Controller = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
export type AuthController = (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response | void>;

// ─── Respuesta API genérica ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

// ─── Modelos de base de datos ─────────────────────────────────────────────────

export interface GameRow {
  game_id: string;
  title: string;
  slug: string;
  description: string;
  release_date: Date | null;
  developer: string;
  publisher: string;
  cover_image: string;
  banner_url: string;
  status: string;
  featured: number | boolean;
  created_at: Date | null;
  updated_at: Date | null;
  genres: string | null;
  platforms: string | null;
  total_trailers: number;
}

export interface TrailerRow {
  trailer_id: string;
  game_id: string;
  title: string;
  type: string;
  video_url: string;
  poster_url: string;
  duration: string | null;
  sort_order: number;
  created_at: Date | null;
  category_ids?: string | null;
}

export interface CategoryRow {
  category_id: string;
  name: string;
}

export interface TrailerCategoryRow {
  trailer_id: string;
  category_id: string;
}

export interface UserRow {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  country: string | null;
  active: number | boolean;
  registered_at: Date | null;
  last_login: Date | null;
  role?: string;
}

export interface NewsRow {
  news_id: string;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  cover_image: string | null;
  published_at: Date | null;
  featured: number | boolean;
  created_at: Date | null;
  updated_at: Date | null;
  author_name: string | null;
  author_avatar: string | null;
}

export interface NewsImageRow {
  image_url: string;
  sort_order: number;
  caption: string | null;
}

export interface NotificationRow {
  notification_id: string;
  title: string;
  message: string;
  type: string;
  read: number | boolean;
  created_at: Date | null;
  read_at: Date | null;
}

export interface FavoriteRow {
  favorite_id?: string;
  game_id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  status: string;
  added_at: Date | null;
  genres: string | null;
}

export interface UpcomingRow {
  release_id: string;
  release_date: Date | null;
  release_window: string | null;
  release_description: string | null;
  release_banner: string | null;
  release_featured: number | boolean;
  game_id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  banner_url: string;
  developer: string;
  publisher: string;
  genres: string | null;
  platforms: string | null;
  // upcomingController getById usa campos directos de ur.*
  featured?: number | boolean;
  banner_url_release?: string;
}

export interface SessionRow {
  session_id: string;
}

export interface RoleRow {
  role_id: string;
}

export interface CountRow {
  total: number;
}

export interface UnreadRow {
  total_unread: number;
}

export interface ResultSetHeader {
  affectedRows: number;
  insertId: number;
}
