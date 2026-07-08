type User = {
  id: string;
  name: string;
  email: string;
  registered_at?: Date | null;
}

export type LoginResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  user: User
}

export type RegisterResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  user: User
}

