import 'dotenv/config';
import mysql from 'mysql2';
import mysqlNew from 'mysql2/promise';

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  : undefined;

export const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ssl: sslConfig,
};

if (!process.env.DB_HOST) {
  console.warn('DB_HOST is not set. The backend will start, but database requests will fail until DB env vars are configured.');
}

export const db = mysql.createPool(dbConfig);

export const dbNew = mysqlNew.createPool(dbConfig);
