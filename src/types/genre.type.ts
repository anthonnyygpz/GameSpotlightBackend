export interface GameGenreResponse {
  genre: string;
  game_id: string | number;
  title: string;
  description?: string;
  cover_image?: string;
}

export type GenreResponse = {
  genre_id: string | number;
  name: string;
  description?: string;
  icon_url?: string;
  status?: string;
}
