import 'dotenv/config';
import sqlite3 from 'sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';

const databasePath = process.env.DATABASE_PATH
  || join(fileURLToPath(new URL('.', import.meta.url)), 'dreams.db');

const db = new sqlite3.Database(databasePath);

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

export default db;
