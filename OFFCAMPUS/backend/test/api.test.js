const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'offcampus-test-'));
process.env.OFFCAMPUS_DB_PATH = path.join(tempDirectory, 'test.sqlite');
process.env.JWT_SECRET = 'test-secret-with-enough-length';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const { db } = require('../src/db');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

async function request(route, { token, method = 'GET', body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${baseUrl}/api${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = response.status === 204 ? null : await response.json();
  return { response, data };
}

test('authenticated expense and roommate settlement lifecycle', async () => {
  const unauthenticated = await request('/categories');
  assert.equal(unauthenticated.response.status, 401);

  const registeredAlice = await request('/auth/register', {
    method: 'POST',
    body: { username: 'alice_test', email: 'alice@test.example', password: 'a-strong-password' }
  });
  assert.equal(registeredAlice.response.status, 201);
  const aliceToken = registeredAlice.data.token;

  const registeredBob = await request('/auth/register', {
    method: 'POST',
    body: { username: 'bob_test', email: 'bob@test.example', password: 'another-strong-password' }
  });
  assert.equal(registeredBob.response.status, 201);
  const bobToken = registeredBob.data.token;
  const duplicateUsername = await request('/auth/register', {
    method: 'POST',
    body: { username: 'BOB_TEST', email: 'another-bob@test.example', password: 'a-different-password' }
  });
  assert.equal(duplicateUsername.response.status, 409);
  assert.throws(() => db.prepare(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
  ).run('Bob_Test', 'case-check@test.example', 'not-a-real-password-hash'));

  const categoriesResult = await request('/categories', { token: aliceToken });
  const food = categoriesResult.data.categories.find((category) => category.name === 'Food');
  assert.ok(food);

  const created = await request('/expenses', {
    token: aliceToken,
    method: 'POST',
    body: {
      categoryId: food.id,
      amount: 60,
      description: 'Shared groceries',
      date: '2026-10-12',
      isShared: true,
      splits: [{ userId: registeredBob.data.user.id, shareAmount: 20 }]
    }
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.expense.splits.length, 1);
  const expenseId = created.data.expense.id;
  const splitId = created.data.expense.splits[0].id;

  const invalidTotal = await request('/expenses', {
    token: aliceToken,
    method: 'POST',
    body: {
      categoryId: food.id,
      amount: 30,
      description: 'Invalid split',
      date: '2026-10-12',
      isShared: true,
      splits: [{ userId: registeredBob.data.user.id, shareAmount: 31 }]
    }
  });
  assert.equal(invalidTotal.response.status, 400);

  const bobExpenses = await request('/expenses', { token: bobToken });
  assert.equal(bobExpenses.data.expenses.length, 1);
  const aliceSummary = await request('/expenses/summary?month=2026-10', { token: aliceToken });
  assert.equal(aliceSummary.data.total, 60);
  const bobBalance = await request('/expenses/balance', { token: bobToken });
  assert.equal(bobBalance.data.owedByMe, 0);
  assert.equal(bobBalance.data.pendingSplits.length, 1);
  assert.equal(bobBalance.data.pendingSplits[0].amount, 20);
  const aliceCannotAcceptForBob = await request(`/expenses/${expenseId}/splits/${splitId}/decision`, {
    token: aliceToken,
    method: 'PATCH',
    body: { decision: 'accept' }
  });
  assert.equal(aliceCannotAcceptForBob.response.status, 404);
  const accepted = await request(`/expenses/${expenseId}/splits/${splitId}/decision`, {
    token: bobToken,
    method: 'PATCH',
    body: { decision: 'accept' }
  });
  assert.equal(accepted.data.status, 'accepted');
  const acceptedBalance = await request('/expenses/balance', { token: bobToken });
  assert.equal(acceptedBalance.data.owedByMe, 20);
  assert.equal(acceptedBalance.data.pendingSplits.length, 0);
  assert.equal(acceptedBalance.data.debts[0].payer, 'alice_test');

  const settled = await request(`/expenses/${expenseId}/splits/${splitId}`, {
    token: bobToken,
    method: 'PATCH',
    body: { settled: true }
  });
  assert.equal(settled.response.status, 200);
  const clearedBalance = await request('/expenses/balance', { token: aliceToken });
  assert.equal(clearedBalance.data.owedToMe, 0);
  assert.equal(clearedBalance.data.debts.length, 0);

  const rejectedExpense = await request('/expenses', {
    token: aliceToken,
    method: 'POST',
    body: {
      categoryId: food.id,
      amount: 25,
      description: 'Optional shared item',
      date: '2026-10-12',
      isShared: true,
      splits: [{ userId: registeredBob.data.user.id, shareAmount: 5 }]
    }
  });
  const rejectedSplitId = rejectedExpense.data.expense.splits[0].id;
  const rejected = await request(
    `/expenses/${rejectedExpense.data.expense.id}/splits/${rejectedSplitId}/decision`,
    { token: bobToken, method: 'PATCH', body: { decision: 'reject' } }
  );
  assert.equal(rejected.data.status, 'rejected');
  const bobAfterRejecting = await request('/expenses/balance', { token: bobToken });
  assert.equal(bobAfterRejecting.data.pendingSplits.length, 0);
  assert.equal(bobAfterRejecting.data.debts.length, 0);

  const updated = await request(`/expenses/${expenseId}`, {
    token: aliceToken,
    method: 'PUT',
    body: {
      categoryId: food.id,
      amount: 42,
      description: 'Updated groceries',
      date: '2026-10-12',
      isShared: false,
      splits: []
    }
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.expense.amount, 42);
  assert.equal(updated.data.expense.splits.length, 0);

  const deleted = await request(`/expenses/${expenseId}`, { token: aliceToken, method: 'DELETE' });
  assert.equal(deleted.response.status, 204);
  const missing = await request(`/expenses/${expenseId}`, { token: aliceToken, method: 'DELETE' });
  assert.equal(missing.response.status, 404);
});
