// One-off helper: imports apbs_db_schema.sql into the DB configured in .env
// Usage: node import_schema.js
import 'dotenv/config';
import fs from 'fs';
import mysql from 'mysql2/promise';

const sql = fs.readFileSync(new URL('./apbs_db.sql', import.meta.url), 'utf8');

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

try {
  await conn.query(sql);
  const [tables] = await conn.query('SHOW TABLES');
  console.log(`Import OK — ${tables.length} tables now in ${process.env.DB_NAME}:`);
  tables.forEach(t => console.log(' -', Object.values(t)[0]));
} finally {
  await conn.end();
}
