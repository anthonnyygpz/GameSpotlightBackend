export type UserResponse = {
  user_id: string;
  name: string;
  email: string;
  password_hash?: string;
  avatar_url: string | null;
  country: string | null;
  active?: number | boolean;
  registered_at: Date | null;
  last_login: Date | null;
  role?: string;
}
