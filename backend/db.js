import 'dotenv/config';
import mysql from 'mysql2';
import mysqlNew from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const db = mysql.createConnection(dbConfig);

export const dbNew = await mysqlNew.createPool(dbConfig);
