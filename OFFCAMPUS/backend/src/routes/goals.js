const express = require('express');
const { db } = require('../db');
const { ApiError } = require('../errors');

const router = express.Router();
const validTypes = new Set(['savings', 'budget']);
const validPeriods = new Set(['weekly', 'monthly', 'yearly']);

function periodRange(period) {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const day = today.getUTCDate();
  let start;
  let end;
  if (period === 'weekly') {
    const weekdayOffset = (today.getUTCDay() + 6) % 7;
    start = new Date(Date.UTC(year, month, day - weekdayOffset));
    end = new Date(Date.UTC(year, month, day - weekdayOffset + 7));
  } else if (period === 'monthly') {
    start = new Date(Date.UTC(year, month, 1));
    end = new Date(Date.UTC(year, month + 1, 1));
  } else {
    start = new Date(Date.UTC(year, 0, 1));
    end = new Date(Date.UTC(year + 1, 0, 1));
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function goalProgress(goal, userId) {
  const range = periodRange(goal.period);
  const row = goal.type === 'savings'
    ? db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS progress
      FROM goal_contributions
      WHERE goal_id = ? AND user_id = ? AND date >= ? AND date < ?
    `).get(goal.id, userId, range.start, range.end)
    : db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS progress
      FROM expenses
      WHERE user_id = ? AND date >= ? AND date < ?
    `).get(userId, range.start, range.end);
  const progress = row.progress;
  const contributions = goal.type === 'savings'
    ? db.prepare(`
      SELECT id, amount, date, note
      FROM goal_contributions
      WHERE goal_id = ? AND user_id = ? AND date >= ? AND date < ?
      ORDER BY date DESC, id DESC
    `).all(goal.id, userId, range.start, range.end)
    : [];
  return {
    id: goal.id,
    type: goal.type,
    period: goal.period,
    name: goal.name,
    targetAmount: goal.target_amount,
    progress,
    remaining: Math.max(0, goal.target_amount - progress),
    percent: Math.min(100, Math.round(progress / goal.target_amount * 100)),
    periodStart: range.start,
    periodEnd: range.end,
    contributions
  };
}

function getOwnedGoal(goalId, userId) {
  if (!Number.isSafeInteger(goalId) || goalId < 1) {
    throw new ApiError(400, 'Invalid goal id.');
  }
  const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(goalId, userId);
  if (!goal) throw new ApiError(404, 'Goal not found.');
  return goal;
}

router.get('/', (req, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY type, period')
    .all(req.user.id).map((goal) => goalProgress(goal, req.user.id));
  res.json({ goals });
});

router.post('/', (req, res) => {
  const { type, period } = req.body;
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const amount = Number(req.body.targetAmount);
  if (!validTypes.has(type)) throw new ApiError(400, 'Choose a savings or budget goal.');
  if (!validPeriods.has(period)) throw new ApiError(400, 'Choose a weekly, monthly, or yearly period.');
  if (!name || name.length > 80) throw new ApiError(400, 'Goal name is required and must be 80 characters or fewer.');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000
      || Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-8) {
    throw new ApiError(400, 'Goal amount must be positive, no more than 10,000,000, and have at most two decimal places.');
  }
  let result;
  try {
    result = db.prepare(`
      INSERT INTO goals (user_id, type, period, name, target_amount)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, type, period, name, amount);
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      throw new ApiError(409, `You already have a ${period} ${type} goal.`);
    }
    throw error;
  }
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ goal: goalProgress(goal, req.user.id) });
});

router.delete('/:id', (req, res) => {
  const goal = getOwnedGoal(Number(req.params.id), req.user.id);
  db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(goal.id, req.user.id);
  res.status(204).end();
});

router.post('/:id/contributions', (req, res) => {
  const goal = getOwnedGoal(Number(req.params.id), req.user.id);
  if (goal.type !== 'savings') {
    throw new ApiError(400, 'Savings contributions can only be added to a savings goal.');
  }
  const amount = Number(req.body.amount);
  const date = req.body.date || new Date().toISOString().slice(0, 10);
  const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000
      || Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-8) {
    throw new ApiError(400, 'Contribution must be positive and have at most two decimal places.');
  }
  if (!validDate(date)) throw new ApiError(400, 'Contribution date must be a valid YYYY-MM-DD date.');
  if (note.length > 120) throw new ApiError(400, 'Contribution note must be 120 characters or fewer.');
  const result = db.prepare(`
    INSERT INTO goal_contributions (goal_id, user_id, amount, date, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(goal.id, req.user.id, amount, date, note);
  res.status(201).json({
    contribution: { id: Number(result.lastInsertRowid), amount, date, note },
    goal: goalProgress(goal, req.user.id)
  });
});

router.delete('/:id/contributions/:contributionId', (req, res) => {
  const goal = getOwnedGoal(Number(req.params.id), req.user.id);
  const contributionId = Number(req.params.contributionId);
  if (!Number.isSafeInteger(contributionId) || contributionId < 1) {
    throw new ApiError(400, 'Invalid contribution id.');
  }
  const result = db.prepare(`
    DELETE FROM goal_contributions
    WHERE id = ? AND goal_id = ? AND user_id = ?
  `).run(contributionId, goal.id, req.user.id);
  if (result.changes === 0) throw new ApiError(404, 'Contribution not found.');
  res.status(204).end();
});

module.exports = router;
