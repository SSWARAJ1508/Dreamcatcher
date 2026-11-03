import 'dotenv/config';
import initSqlJs from 'sql.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const databasePath = process.env.DATABASE_PATH
  || join(fileURLToPath(new URL('.', import.meta.url)), 'dreams.db');

const SQL = await initSqlJs({
  locateFile: (file) => join(
    fileURLToPath(new URL('./node_modules/sql.js/dist/', import.meta.url)),
    file
  )
});

const database = existsSync(databasePath)
  ? new SQL.Database(readFileSync(databasePath))
  : new SQL.Database();

function persist() {
  writeFileSync(databasePath, Buffer.from(database.export()));
}

export function all(sql, params = []) {
  const statement = database.prepare(sql);
  statement.bind(params);
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return Promise.resolve(rows);
}

export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.then((results) => results[0]);
}

export function run(sql, params = []) {
  const statement = database.prepare(sql);
  statement.run(params);
  const changes = database.getRowsModified();
  const lastID = database.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0];
  statement.free();
  persist();
  return Promise.resolve({ changes, lastID });
}

export default database;
