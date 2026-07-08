import { GameGenreResponse, GenreResponse } from "../types/genre.type";
import db from '../config/db';
import { RowDataPacket } from "mysql2";

export const genresService = {
  async getGameGenres(genreId: string): Promise<GameGenreResponse[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        genre.name AS genre, 
        g.*
      FROM genres AS genre
        INNER JOIN game_genres AS gg ON genre.genre_id = gg.genre_id
        INNER JOIN games AS g        ON gg.game_id = g.game_id
      WHERE genre.genre_id = ?;`, [genreId]
    );

    return rows.map(row => ({
      genre: row.genre,
      game_id: row.game_id,
      title: row.title,
      description: row.description,
      cover_image: row.cover_image,
      status: row.status
    }));
  },

  async getGeres(): Promise<GenreResponse[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        genre.genre_id, 
        genre.name, 
        genre.description, 
        genre.icon_url
      FROM genres AS genre;`
    );

    return rows.map(row => ({
      genre_id: row.genre_id,
      name: row.name,
      description: row.description,
      icon_url: row.icon_url
    }));
  }
};
