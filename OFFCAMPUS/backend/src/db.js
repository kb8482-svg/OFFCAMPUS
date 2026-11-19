const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const databasePath = process.env.OFFCAMPUS_DB_PATH
  || path.join(__dirname, '..', 'data', 'offcampus.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_key TEXT,
    avatar_size INTEGER NOT NULL DEFAULT 0 CHECK (avatar_size >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL DEFAULT 'expense' CHECK (kind IN ('expense', 'income'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    transaction_type TEXT NOT NULL DEFAULT 'expense' CHECK (transaction_type IN ('expense', 'income')),
    is_shared INTEGER NOT NULL DEFAULT 0 CHECK (is_shared IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_amount REAL NOT NULL CHECK (share_amount > 0),
    settled INTEGER NOT NULL DEFAULT 0 CHECK (settled IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    UNIQUE (expense_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS expense_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('savings', 'budget')),
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
    name TEXT NOT NULL,
    target_amount REAL NOT NULL CHECK (target_amount > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, type, period)
  );

  CREATE TABLE IF NOT EXISTS goal_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_nocase ON users(username COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_splits_user_settled ON expense_splits(user_id, settled);
  CREATE INDEX IF NOT EXISTS idx_receipts_user_expense ON expense_receipts(user_id, expense_id);
  CREATE INDEX IF NOT EXISTS idx_contributions_goal_date ON goal_contributions(goal_id, date);
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((column) => column.name === 'display_name')) {
  db.exec("ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''");
}
if (!userColumns.some((column) => column.name === 'avatar_key')) {
  db.exec('ALTER TABLE users ADD COLUMN avatar_key TEXT');
}
if (!userColumns.some((column) => column.name === 'avatar_size')) {
  db.exec('ALTER TABLE users ADD COLUMN avatar_size INTEGER NOT NULL DEFAULT 0 CHECK (avatar_size >= 0)');
}

const splitColumns = db.prepare('PRAGMA table_info(expense_splits)').all();
if (!splitColumns.some((column) => column.name === 'status')) {
  db.exec(`
    ALTER TABLE expense_splits
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'rejected'))
  `);
}

const categoryColumns = db.prepare('PRAGMA table_info(categories)').all();
if (!categoryColumns.some((column) => column.name === 'kind')) {
  db.exec("ALTER TABLE categories ADD COLUMN kind TEXT NOT NULL DEFAULT 'expense' CHECK (kind IN ('expense', 'income'))");
}

const expenseColumns = db.prepare('PRAGMA table_info(expenses)').all();
if (!expenseColumns.some((column) => column.name === 'transaction_type')) {
  db.exec("ALTER TABLE expenses ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'expense' CHECK (transaction_type IN ('expense', 'income'))");
}

db.exec('CREATE INDEX IF NOT EXISTS idx_expenses_user_type_date ON expenses(user_id, transaction_type, date)');

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, kind) VALUES (?, ?)');
for (const [name, kind] of [
  ['Food', 'expense'], ['Rent', 'expense'], ['Phone', 'expense'], ['Utilities', 'expense'],
  ['Entertainment', 'expense'], ['Transport', 'expense'], ['Other', 'expense'],
  ['Salary', 'income'], ['Scholarship', 'income'], ['Family support', 'income'], ['Other income', 'income']
]) {
  insertCategory.run(name, kind);
}

function inTransaction(callback) {
  db.exec('BEGIN');
  try {
    const result = callback();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = { db, inTransaction };
