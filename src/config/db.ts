import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'game_spotlight',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  charset: 'utf8mb4',
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('[DB] Conexión exitosa a MySQL:', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] Error de conexión:', (err as Error).message);
  });

export default pool;
