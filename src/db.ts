import * as pg from "pg";
import { config } from "dotenv";
config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const heartbeat = setInterval(() => {
  pool.query(`SELECT 1;`, (err, result) => {
    if (err) {
      console.error(err);
      clearInterval(heartbeat);
    }
  });
}, 1000);

export const query = (text: string, params?: any[]) => pool.query(text, params);
