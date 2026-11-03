import { run } from './database.js';

export async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS dreams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dream_text TEXT NOT NULL,
      interpretation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized successfully');
}

