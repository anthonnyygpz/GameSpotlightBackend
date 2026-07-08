import { RowDataPacket } from "mysql2";
import db from '../config/db';
import { GamePlatformResponse, PlatformResponse } from "../types/platform.type";

export const platformsService = {
  async getGamesPlatform(platformId: string): Promise<GamePlatformResponse[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      ` SELECT 
        plat.name AS platform, 
        g.*
      FROM platforms AS plat
        INNER JOIN game_platforms AS gp ON plat.platform_id = gp.platform_id
        INNER JOIN games AS g        ON gp.game_id = g.game_id
      WHERE plat.platform_id = ?;`, [platformId]
    )

    return rows.map(row => ({
      platform: row.platform,
      game_id: row.game_id,
      title: row.title,
      description: row.description,
      cover_image: row.cover_image,
      status: row.status
    }));
  },

  async getPlatforms(): Promise<PlatformResponse[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        platform.platform_id, 
        platform.name, 
        platform.type, 
        platform.icon_url
      FROM platforms AS platform;`
    );

    return rows.map(row => ({
      platform_id: row.platform_id,
      name: row.name,
      type: row.type,
      icon_url: row.icon_url
    }));
  }
};
