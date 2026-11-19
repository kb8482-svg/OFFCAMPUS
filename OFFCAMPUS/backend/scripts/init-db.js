const bcrypt = require('bcryptjs');
const { db, inTransaction } = require('../src/db');

async function seed() {
  const users = [
    { username: 'hannah', email: 'hannah@example.test', password: 'GarrettG44!' },
    { username: 'wellsey', email: 'wellsey@example.test', password: 'GarrettG44!' },
    { username: 'jlo', email: 'jlo@example.test', password: 'Maverick22!' }
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        email = excluded.email,
        password_hash = excluded.password_hash
    `).run(user.username, user.email, passwordHash);
  }

  const ids = Object.fromEntries(
    db.prepare('SELECT id, username FROM users').all().map((user) => [user.username.toLowerCase(), user.id])
  );
  const demoExpenseCount = db.prepare(`
    SELECT COUNT(*) AS count FROM expenses WHERE user_id IN (?, ?, ?)
  `).get(ids.hannah, ids.wellsey, ids.jlo).count;
  if (demoExpenseCount === 0) {
    const categoryId = (name) => db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
    inTransaction(() => {
      const rent = db.prepare(`
        INSERT INTO expenses (user_id, category_id, amount, description, date, is_shared)
        VALUES (?, ?, ?, ?, date('now', 'start of month'), 1)
      `).run(ids.hannah, categoryId('Rent'), 1200, 'Monthly apartment rent');
      const addSplit = db.prepare(
        'INSERT INTO expense_splits (expense_id, user_id, share_amount) VALUES (?, ?, ?)'
      );
      addSplit.run(Number(rent.lastInsertRowid), ids.wellsey, 400);
      addSplit.run(Number(rent.lastInsertRowid), ids.jlo, 400);

      const groceries = db.prepare(`
        INSERT INTO expenses (user_id, category_id, amount, description, date, is_shared)
        VALUES (?, ?, ?, ?, date('now'), 1)
      `).run(ids.wellsey, categoryId('Food'), 54, 'Shared groceries');
      addSplit.run(Number(groceries.lastInsertRowid), ids.hannah, 18);
      addSplit.run(Number(groceries.lastInsertRowid), ids.jlo, 18);

      db.prepare(`
        INSERT INTO expenses (user_id, category_id, amount, description, date, is_shared)
        VALUES (?, ?, ?, ?, date('now'), 0)
      `).run(ids.hannah, categoryId('Phone'), 19.99, 'Monthly phone plan');
    });
  }

  console.log('Database initialized with sample users and expenses.');
  console.log('Demo login: hannah / GarrettG44! (also wellsey and jlo).');
}

seed()
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
