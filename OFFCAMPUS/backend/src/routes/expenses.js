const express = require('express');
const { db, inTransaction } = require('../db');
const { ApiError, asyncHandler } = require('../errors');
const {
  maxUserUploadBytes,
  createUploadMiddleware,
  parseUpload,
  validateUploadedFile,
  storeUploadedFile,
  removeStoredFile,
  uploadedFilePath,
  safeOriginalName
} = require('../uploads');

const router = express.Router();
const receiptUpload = parseUpload(createUploadMiddleware());

function cents(value) {
  return Math.round(value * 100);
}

function validateExpense(body, ownerId) {
  const categoryId = Number(body.categoryId);
  const amount = Number(body.amount);
  const transactionType = body.type === undefined ? 'expense' : body.type;
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const isShared = body.isShared === true;

  if (!['expense', 'income'].includes(transactionType)) {
    throw new ApiError(400, 'Type must be either expense or income.');
  }
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    throw new ApiError(400, 'Choose a valid category.');
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
    throw new ApiError(400, 'Amount must be greater than 0 and no more than 10,000,000.');
  }
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-8) {
    throw new ApiError(400, 'Amount must have no more than two decimal places.');
  }
  if (!description || description.length > 250) {
    throw new ApiError(400, 'Description is required and must be 250 characters or fewer.');
  }
  const category = db.prepare('SELECT id, kind FROM categories WHERE id = ?').get(categoryId);
  if (!category || category.kind !== transactionType) {
    throw new ApiError(400, 'Choose a category that matches this income or expense.');
  }

  const dateInput = body.date || new Date().toISOString().slice(0, 10);
  if (typeof dateInput !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    throw new ApiError(400, 'Date must use the YYYY-MM-DD format.');
  }
  const parsedDate = new Date(`${dateInput}T12:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dateInput) {
    throw new ApiError(400, 'Enter a valid calendar date.');
  }

  const rawSplits = body.splits === undefined ? [] : body.splits;
  if (!Array.isArray(rawSplits)) {
    throw new ApiError(400, 'Splits must be a list of roommates and amounts.');
  }
  if (isShared && rawSplits.length === 0) {
    throw new ApiError(400, 'Add at least one roommate to a shared expense.');
  }
  if (transactionType === 'income' && (isShared || rawSplits.length > 0)) {
    throw new ApiError(400, 'Income cannot be split with roommates.');
  }
  if (!isShared && rawSplits.length > 0) {
    throw new ApiError(400, 'Turn on shared expense to add roommate splits.');
  }

  const splits = rawSplits.map((split) => {
    const userId = Number(split.userId);
    const shareAmount = Number(split.shareAmount);
    if (!Number.isSafeInteger(userId) || userId < 1 || userId === ownerId) {
      throw new ApiError(400, 'Choose a valid roommate for each split.');
    }
    if (!Number.isFinite(shareAmount) || shareAmount <= 0 || shareAmount > amount) {
      throw new ApiError(400, 'Each share must be greater than 0 and no more than the expense amount.');
    }
    if (Math.abs(shareAmount * 100 - Math.round(shareAmount * 100)) > 1e-8) {
      throw new ApiError(400, 'Each share must have no more than two decimal places.');
    }
    return { userId, shareAmount };
  });
  if (new Set(splits.map((split) => split.userId)).size !== splits.length) {
    throw new ApiError(400, 'A roommate can only appear once per expense.');
  }
  if (splits.reduce((total, split) => total + cents(split.shareAmount), 0) > cents(amount)) {
    throw new ApiError(400, 'Roommate shares cannot add up to more than the expense total.');
  }
  if (splits.length > 0) {
    const placeholders = splits.map(() => '?').join(', ');
    const users = db.prepare(`SELECT id FROM users WHERE id IN (${placeholders})`).all(
      ...splits.map((split) => split.userId)
    );
    if (users.length !== splits.length) {
      throw new ApiError(400, 'One or more selected roommates do not exist.');
    }
  }

  return { categoryId, amount, description, date: dateInput, transactionType, isShared, splits };
}

function saveSplits(expenseId, splits) {
  const insertSplit = db.prepare(
    'INSERT INTO expense_splits (expense_id, user_id, share_amount, settled, status) VALUES (?, ?, ?, 0, ?)'
  );
  for (const split of splits) {
    insertSplit.run(expenseId, split.userId, split.shareAmount, 'pending');
  }
}

function getExpenseList(whereSql, parameters, viewerId) {
  const expenses = db.prepare(`
    SELECT e.id, e.user_id, u.username AS payer, e.category_id, c.name AS category,
           e.amount, e.description, e.date, e.transaction_type AS type, e.is_shared
    FROM expenses e
    JOIN users u ON u.id = e.user_id
    JOIN categories c ON c.id = e.category_id
    WHERE ${whereSql}
    ORDER BY e.date DESC, e.id DESC
  `).all(...parameters);

  if (expenses.length === 0) {
    return [];
  }
  const ids = expenses.map((expense) => expense.id);
  const placeholders = ids.map(() => '?').join(', ');
  const splits = db.prepare(`
    SELECT s.id, s.expense_id, s.user_id, u.username, s.share_amount, s.settled, s.status
    FROM expense_splits s
    JOIN users u ON u.id = s.user_id
    JOIN expenses e ON e.id = s.expense_id
    WHERE s.expense_id IN (${placeholders})
      AND (e.user_id = ? OR s.user_id = ?)
    ORDER BY u.username
  `).all(...ids, viewerId, viewerId);
  const splitMap = new Map(expenses.map((expense) => [expense.id, []]));
  for (const split of splits) {
    splitMap.get(split.expense_id).push({
      id: split.id,
      userId: split.user_id,
      username: split.username,
      shareAmount: split.share_amount,
      settled: Boolean(split.settled),
      status: split.status
    });
  }
  return expenses.map((expense) => ({
    ...expense,
    isShared: Boolean(expense.is_shared),
    splits: splitMap.get(expense.id)
  }));
}

router.get('/', (req, res) => {
  const expenses = getExpenseList(
    'e.user_id = ? OR EXISTS (SELECT 1 FROM expense_splits s WHERE s.expense_id = e.id AND s.user_id = ?)',
    [req.user.id, req.user.id],
    req.user.id
  );
  res.json({ expenses });
});

router.post('/', (req, res) => {
  const expense = validateExpense(req.body, req.user.id);
  const id = inTransaction(() => {
    const result = db.prepare(`
      INSERT INTO expenses (user_id, category_id, amount, description, date, transaction_type, is_shared)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, expense.categoryId, expense.amount, expense.description,
      expense.date, expense.transactionType, expense.isShared ? 1 : 0
    );
    const expenseId = Number(result.lastInsertRowid);
    saveSplits(expenseId, expense.splits);
    return expenseId;
  });
  res.status(201).json({ expense: getExpenseList('e.id = ?', [id], req.user.id)[0] });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid expense id.');
  }
  if (!db.prepare('SELECT id FROM expenses WHERE id = ? AND user_id = ?').get(id, req.user.id)) {
    throw new ApiError(404, 'Expense not found.');
  }
  const expense = validateExpense(req.body, req.user.id);
  inTransaction(() => {
    db.prepare(`
      UPDATE expenses
      SET category_id = ?, amount = ?, description = ?, date = ?, transaction_type = ?, is_shared = ?
      WHERE id = ? AND user_id = ?
    `).run(
      expense.categoryId, expense.amount, expense.description, expense.date,
      expense.transactionType, expense.isShared ? 1 : 0, id, req.user.id
    );
    db.prepare('DELETE FROM expense_splits WHERE expense_id = ?').run(id);
    saveSplits(id, expense.splits);
  });
  res.json({ expense: getExpenseList('e.id = ?', [id], req.user.id)[0] });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid expense id.');
  }
  const receipts = db.prepare(
    'SELECT storage_key FROM expense_receipts WHERE expense_id = ? AND user_id = ?'
  ).all(id, req.user.id);
  const result = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?')
    .run(id, req.user.id);
  if (result.changes === 0) {
    throw new ApiError(404, 'Expense not found.');
  }
  for (const receipt of receipts) removeStoredFile(receipt.storage_key);
  res.status(204).end();
});

function requireExpenseOwner(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid expense id.');
  }
  const expense = db.prepare('SELECT id FROM expenses WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!expense) throw new ApiError(404, 'Expense not found.');
  req.expenseId = id;
  next();
}

router.get('/receipts', (req, res) => {
  const receipts = db.prepare(`
    SELECT id, expense_id AS expenseId, original_name AS name,
           mime_type AS mimeType, size_bytes AS sizeBytes, created_at AS createdAt
    FROM expense_receipts
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(req.user.id);
  res.json({ receipts });
});

router.get('/:id/receipts', requireExpenseOwner, (req, res) => {
  const receipts = db.prepare(`
    SELECT id, original_name AS name, mime_type AS mimeType, size_bytes AS sizeBytes, created_at AS createdAt
    FROM expense_receipts WHERE expense_id = ? AND user_id = ?
    ORDER BY id
  `).all(req.expenseId, req.user.id);
  res.json({ receipts });
});

router.post('/:id/receipts', requireExpenseOwner, receiptUpload, (req, res) => {
  const { mimeType, extension } = validateUploadedFile(req.file);
  const usage = db.prepare(`
    SELECT avatar_size + COALESCE((
      SELECT SUM(size_bytes) FROM expense_receipts WHERE user_id = ?
    ), 0) AS total
    FROM users WHERE id = ?
  `).get(req.user.id, req.user.id);
  if (usage.total + req.file.size > maxUserUploadBytes) {
    throw new ApiError(413, 'Your private file storage is full. Remove an old file before uploading another.');
  }
  const storageKey = storeUploadedFile(req.file, extension);
  let result;
  try {
    result = db.prepare(`
      INSERT INTO expense_receipts
        (expense_id, user_id, storage_key, original_name, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.expenseId, req.user.id, storageKey, safeOriginalName(req.file.originalname),
      mimeType, req.file.size
    );
  } catch (error) {
    removeStoredFile(storageKey);
    throw error;
  }
  res.status(201).json({
    receipt: {
      id: Number(result.lastInsertRowid),
      name: safeOriginalName(req.file.originalname),
      mimeType,
      sizeBytes: req.file.size
    }
  });
});

router.get('/:id/receipts/:receiptId', requireExpenseOwner, (req, res, next) => {
  const receiptId = Number(req.params.receiptId);
  if (!Number.isSafeInteger(receiptId) || receiptId < 1) {
    throw new ApiError(400, 'Invalid receipt id.');
  }
  const receipt = db.prepare(`
    SELECT storage_key, original_name
    FROM expense_receipts
    WHERE id = ? AND expense_id = ? AND user_id = ?
  `).get(receiptId, req.expenseId, req.user.id);
  if (!receipt) throw new ApiError(404, 'Receipt not found.');
  res.download(uploadedFilePath(receipt.storage_key), receipt.original_name, {
    headers: { 'X-Content-Type-Options': 'nosniff' }
  }, (error) => {
    if (error) next(error);
  });
});

router.delete('/:id/receipts/:receiptId', requireExpenseOwner, (req, res) => {
  const receiptId = Number(req.params.receiptId);
  if (!Number.isSafeInteger(receiptId) || receiptId < 1) {
    throw new ApiError(400, 'Invalid receipt id.');
  }
  const receipt = db.prepare(`
    SELECT storage_key FROM expense_receipts
    WHERE id = ? AND expense_id = ? AND user_id = ?
  `).get(receiptId, req.expenseId, req.user.id);
  if (!receipt) throw new ApiError(404, 'Receipt not found.');
  db.prepare('DELETE FROM expense_receipts WHERE id = ?').run(receiptId);
  removeStoredFile(receipt.storage_key);
  res.status(204).end();
});

router.get('/summary', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new ApiError(400, 'Month must use the YYYY-MM format.');
  }
  const start = `${month}-01`;
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10);
  const categories = db.prepare(`
    SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) AS total, COUNT(e.id) AS expenseCount
    FROM categories c
    LEFT JOIN expenses e
      ON e.category_id = c.id AND e.user_id = ? AND e.date >= ? AND e.date < ?
         AND e.transaction_type = c.kind
    WHERE c.kind = 'expense'
    GROUP BY c.id, c.name
    ORDER BY total DESC, c.name
  `).all(req.user.id, start, next);
  const total = categories.reduce((sum, category) => sum + category.total, 0);
  const incomeTotal = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses WHERE user_id = ? AND transaction_type = 'income' AND date >= ? AND date < ?
  `).get(req.user.id, start, next).total;
  res.json({
    month, total, expenseTotal: total, incomeTotal, net: incomeTotal - total,
    categories: categories.filter((category) => category.expenseCount > 0)
  });
});

router.get('/trend', (req, res) => {
  const months = Number(req.query.months || 6);
  if (![3, 6, 12].includes(months)) {
    throw new ApiError(400, 'Months must be 3, 6, or 12.');
  }
  const today = new Date();
  const currentMonth = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const startMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - months + 1, 1));
  const start = startMonth.toISOString().slice(0, 10);
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', date) AS month, transaction_type AS type, SUM(amount) AS total
    FROM expenses
    WHERE user_id = ? AND date >= ? AND date < ?
    GROUP BY strftime('%Y-%m', date), transaction_type
  `).all(req.user.id, start, end);
  const totals = new Map();
  for (const row of rows) {
    if (!totals.has(row.month)) totals.set(row.month, { income: 0, expenses: 0 });
    totals.get(row.month)[row.type === 'income' ? 'income' : 'expenses'] = row.total;
  }
  const series = [];
  for (let index = 0; index < months; index += 1) {
    const date = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + index, 1));
    const month = date.toISOString().slice(0, 7);
    const values = totals.get(month) || { income: 0, expenses: 0 };
    series.push({ month, ...values, net: values.income - values.expenses });
  }
  res.json({ months, currentMonth: new Date(currentMonth).toISOString().slice(0, 7), series });
});

router.get('/balance', (req, res) => {
  const debts = db.prepare(`
    SELECT s.id AS split_id, e.id AS expense_id, e.description, e.date,
           s.share_amount, debtor.id AS debtor_id, debtor.username AS debtor,
           payer.id AS payer_id, payer.username AS payer
    FROM expense_splits s
    JOIN expenses e ON e.id = s.expense_id
    JOIN users debtor ON debtor.id = s.user_id
    JOIN users payer ON payer.id = e.user_id
    WHERE s.settled = 0 AND s.status = 'accepted' AND e.is_shared = 1
      AND (s.user_id = ? OR e.user_id = ?)
    ORDER BY e.date DESC, s.id DESC
  `).all(req.user.id, req.user.id).map((debt) => ({
    splitId: debt.split_id,
    expenseId: debt.expense_id,
    description: debt.description,
    date: debt.date,
    amount: debt.share_amount,
    debtorId: debt.debtor_id,
    debtor: debt.debtor,
    payerId: debt.payer_id,
    payer: debt.payer
  }));
  const pendingSplits = db.prepare(`
    SELECT s.id AS split_id, e.id AS expense_id, e.description, e.date,
           s.share_amount, payer.username AS payer
    FROM expense_splits s
    JOIN expenses e ON e.id = s.expense_id
    JOIN users payer ON payer.id = e.user_id
    WHERE s.user_id = ? AND s.status = 'pending' AND e.is_shared = 1
    ORDER BY e.date DESC, s.id DESC
  `).all(req.user.id).map((split) => ({
    splitId: split.split_id,
    expenseId: split.expense_id,
    description: split.description,
    date: split.date,
    amount: split.share_amount,
    payer: split.payer
  }));
  const totals = debts.reduce((result, debt) => {
    if (debt.debtorId === req.user.id) result.owedByMe += debt.amount;
    if (debt.payerId === req.user.id) result.owedToMe += debt.amount;
    return result;
  }, { owedByMe: 0, owedToMe: 0 });
  res.json({ debts, pendingSplits, ...totals });
});

router.patch('/:id/splits/:splitId/decision', (req, res) => {
  const expenseId = Number(req.params.id);
  const splitId = Number(req.params.splitId);
  if (!Number.isSafeInteger(expenseId) || expenseId < 1
      || !Number.isSafeInteger(splitId) || splitId < 1) {
    throw new ApiError(400, 'Invalid expense or split id.');
  }
  if (req.body.decision !== 'accept' && req.body.decision !== 'reject') {
    throw new ApiError(400, 'Decision must be accept or reject.');
  }
  const split = db.prepare(`
    SELECT s.id, s.status
    FROM expense_splits s
    JOIN expenses e ON e.id = s.expense_id
    WHERE s.id = ? AND e.id = ? AND s.user_id = ?
  `).get(splitId, expenseId, req.user.id);
  if (!split) {
    throw new ApiError(404, 'Split not found.');
  }
  if (split.status !== 'pending') {
    throw new ApiError(409, 'This shared expense has already been reviewed.');
  }
  const status = req.body.decision === 'accept' ? 'accepted' : 'rejected';
  const result = db.prepare(
    'UPDATE expense_splits SET status = ? WHERE id = ? AND status = ?'
  ).run(status, splitId, 'pending');
  if (result.changes === 0) {
    throw new ApiError(409, 'This shared expense has already been reviewed.');
  }
  res.json({ splitId, status });
});

router.patch('/:id/splits/:splitId', (req, res) => {
  const expenseId = Number(req.params.id);
  const splitId = Number(req.params.splitId);
  if (!Number.isSafeInteger(expenseId) || expenseId < 1
      || !Number.isSafeInteger(splitId) || splitId < 1) {
    throw new ApiError(400, 'Invalid expense or split id.');
  }
  if (typeof req.body.settled !== 'boolean') {
    throw new ApiError(400, 'Settled must be true or false.');
  }
  const split = db.prepare(`
    SELECT s.id
    FROM expense_splits s
    JOIN expenses e ON e.id = s.expense_id
    WHERE s.id = ? AND e.id = ? AND s.status = 'accepted'
      AND (e.user_id = ? OR s.user_id = ?)
  `).get(splitId, expenseId, req.user.id, req.user.id);
  if (!split) {
    throw new ApiError(404, 'Split not found.');
  }
  db.prepare('UPDATE expense_splits SET settled = ? WHERE id = ?')
    .run(req.body.settled ? 1 : 0, splitId);
  res.json({ splitId, settled: req.body.settled });
});

module.exports = router;
