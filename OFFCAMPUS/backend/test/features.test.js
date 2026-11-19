const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'offcampus-features-'));
process.env.OFFCAMPUS_DB_PATH = path.join(tempDirectory, 'features.sqlite');
process.env.UPLOAD_DIRECTORY = path.join(tempDirectory, 'private-uploads');
process.env.JWT_SECRET = 'feature-test-secret-with-enough-length';
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

async function request(route, { token, method = 'GET', body, file } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let requestBody;
  if (file) {
    const formData = new FormData();
    formData.append('file', new Blob([file.contents], { type: file.type }), file.name);
    requestBody = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }
  const response = await fetch(`${baseUrl}/api${route}`, {
    method,
    headers,
    body: requestBody
  });
  const data = response.status === 204 ? null : await response.json();
  return { response, data };
}

test('private profiles, attachments, savings goals, and budgets', async () => {
  const aliceResult = await request('/auth/register', {
    method: 'POST',
    body: { username: 'feature_alice', email: 'feature-alice@test.example', password: 'a-strong-password' }
  });
  const bobResult = await request('/auth/register', {
    method: 'POST',
    body: { username: 'feature_bob', email: 'feature-bob@test.example', password: 'another-strong-password' }
  });
  assert.equal(aliceResult.response.status, 201);
  assert.equal(bobResult.response.status, 201);
  const aliceToken = aliceResult.data.token;
  const bobToken = bobResult.data.token;

  const profile = await request('/profile', { token: aliceToken });
  assert.equal(profile.data.displayName, 'feature_alice');
  const updatedProfile = await request('/profile', {
    token: aliceToken,
    method: 'PATCH',
    body: { displayName: 'Alice Student' }
  });
  assert.equal(updatedProfile.data.displayName, 'Alice Student');
  const bobProfile = await request('/profile', { token: bobToken });
  assert.equal(bobProfile.data.displayName, 'feature_bob');

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz4kAAAAASUVORK5CYII=',
    'base64'
  );
  const avatar = await request('/profile/avatar', {
    token: aliceToken,
    method: 'PUT',
    file: { name: 'avatar.png', type: 'image/png', contents: png }
  });
  assert.equal(avatar.response.status, 201);
  const bobAvatar = await fetch(`${baseUrl}/api/profile/avatar`, {
    headers: { Authorization: `Bearer ${bobToken}` }
  });
  assert.equal(bobAvatar.status, 404);
  const aliceAvatar = await fetch(`${baseUrl}/api/profile/avatar`, {
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  assert.equal(aliceAvatar.status, 200);
  assert.equal(aliceAvatar.headers.get('content-type'), 'image/png');

  const categories = await request('/categories', { token: aliceToken });
  const food = categories.data.categories.find((category) => category.name === 'Food');
  const today = new Date().toISOString().slice(0, 10);
  const expense = await request('/expenses', {
    token: aliceToken,
    method: 'POST',
    body: {
      categoryId: food.id,
      amount: 37.5,
      description: 'Private receipt test',
      date: today,
      isShared: false,
      splits: []
    }
  });
  assert.equal(expense.response.status, 201);

  const pdf = Buffer.from('%PDF-1.7\nPrivate test receipt\n%%EOF');
  const receipt = await request(`/expenses/${expense.data.expense.id}/receipts`, {
    token: aliceToken,
    method: 'POST',
    file: { name: 'receipt.pdf', type: 'application/pdf', contents: pdf }
  });
  assert.equal(receipt.response.status, 201);
  const ownReceipts = await request('/expenses/receipts', { token: aliceToken });
  assert.equal(ownReceipts.data.receipts.length, 1);
  const bobReceipts = await request('/expenses/receipts', { token: bobToken });
  assert.equal(bobReceipts.data.receipts.length, 0);
  const bobExpenseReceipts = await request(`/expenses/${expense.data.expense.id}/receipts`, { token: bobToken });
  assert.equal(bobExpenseReceipts.response.status, 404);
  const downloadedReceipt = await fetch(
    `${baseUrl}/api/expenses/${expense.data.expense.id}/receipts/${receipt.data.receipt.id}`,
    { headers: { Authorization: `Bearer ${aliceToken}` } }
  );
  assert.equal(downloadedReceipt.status, 200);
  assert.match(downloadedReceipt.headers.get('content-disposition'), /attachment/);
  const invalidFile = await request(`/expenses/${expense.data.expense.id}/receipts`, {
    token: aliceToken,
    method: 'POST',
    file: { name: 'fake.pdf', type: 'application/pdf', contents: Buffer.from('not a PDF') }
  });
  assert.equal(invalidFile.response.status, 400);

  const savingsGoal = await request('/goals', {
    token: aliceToken,
    method: 'POST',
    body: { type: 'savings', period: 'weekly', name: 'Emergency fund', targetAmount: 100 }
  });
  const budgetGoal = await request('/goals', {
    token: aliceToken,
    method: 'POST',
    body: { type: 'budget', period: 'monthly', name: 'Monthly spending', targetAmount: 200 }
  });
  const yearlyGoal = await request('/goals', {
    token: aliceToken,
    method: 'POST',
    body: { type: 'savings', period: 'yearly', name: 'Yearly savings', targetAmount: 1000 }
  });
  assert.equal(savingsGoal.response.status, 201);
  assert.equal(budgetGoal.response.status, 201);
  assert.equal(yearlyGoal.response.status, 201);
  const duplicateGoal = await request('/goals', {
    token: aliceToken,
    method: 'POST',
    body: { type: 'savings', period: 'weekly', name: 'Second weekly goal', targetAmount: 50 }
  });
  assert.equal(duplicateGoal.response.status, 409);
  const bobGoals = await request('/goals', { token: bobToken });
  assert.equal(bobGoals.data.goals.length, 0);
  const bobCannotDeleteGoal = await request(`/goals/${savingsGoal.data.goal.id}`, {
    token: bobToken,
    method: 'DELETE'
  });
  assert.equal(bobCannotDeleteGoal.response.status, 404);

  const contribution = await request(`/goals/${savingsGoal.data.goal.id}/contributions`, {
    token: aliceToken,
    method: 'POST',
    body: { amount: 20, note: 'Saved from tutoring' }
  });
  assert.equal(contribution.response.status, 201);
  const goals = await request('/goals', { token: aliceToken });
  assert.equal(goals.data.goals.find((goal) => goal.id === savingsGoal.data.goal.id).progress, 20);
  assert.equal(goals.data.goals.find((goal) => goal.id === budgetGoal.data.goal.id).progress, 37.5);

  const carolResult = await request('/auth/register', {
    method: 'POST',
    body: { username: 'feature_carol', email: 'feature-carol@test.example', password: 'third-strong-password' }
  });
  const sharedExpense = await request('/expenses', {
    token: aliceToken,
    method: 'POST',
    body: {
      categoryId: food.id,
      amount: 60,
      description: 'Shared household bill',
      date: today,
      isShared: true,
      splits: [
        { userId: bobResult.data.user.id, shareAmount: 12 },
        { userId: carolResult.data.user.id, shareAmount: 15 }
      ]
    }
  });
  assert.equal(sharedExpense.response.status, 201);
  const bobExpenses = await request('/expenses', { token: bobToken });
  const bobSharedExpense = bobExpenses.data.expenses.find((item) => item.id === sharedExpense.data.expense.id);
  assert.equal(bobSharedExpense.splits.length, 1);
  assert.equal(bobSharedExpense.splits[0].username, 'feature_bob');
  const aliceExpenses = await request('/expenses', { token: aliceToken });
  const aliceSharedExpense = aliceExpenses.data.expenses.find((item) => item.id === sharedExpense.data.expense.id);
  assert.equal(aliceSharedExpense.splits.length, 2);
});
