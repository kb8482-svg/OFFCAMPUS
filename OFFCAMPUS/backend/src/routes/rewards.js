const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const today = new Date();
  const month = today.toISOString().slice(0, 7);
  const start = `${month}-01`;
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1))
    .toISOString().slice(0, 10);
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS spent,
      COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COUNT(DISTINCT date) AS activeDays
    FROM expenses
    WHERE user_id = ? AND date >= ? AND date < ?
  `).get(req.user.id, start, end);
  const saved = db.prepare(`
    SELECT COALESCE(SUM(gc.amount), 0) AS total
    FROM goal_contributions gc
    JOIN goals g ON g.id = gc.goal_id
    WHERE gc.user_id = ? AND g.type = 'savings' AND gc.date >= ? AND gc.date < ?
  `).get(req.user.id, start, end).total;
  const monthlyBudget = db.prepare(`
    SELECT target_amount FROM goals
    WHERE user_id = ? AND type = 'budget' AND period = 'monthly'
  `).get(req.user.id);
  const monthlySavingsGoal = db.prepare(`
    SELECT target_amount FROM goals
    WHERE user_id = ? AND type = 'savings' AND period = 'monthly'
  `).get(req.user.id);

  const rewards = [];
  if (monthlyBudget && totals.spent <= monthlyBudget.target_amount) {
    rewards.push({ id: 'budget-keeper', title: 'Budget keeper', detail: 'You stayed within your monthly spending budget.' });
  }
  if (saved > 0 && monthlySavingsGoal && saved >= monthlySavingsGoal.target_amount) {
    rewards.push({ id: 'steady-saver', title: 'Steady saver', detail: 'You reached your monthly savings goal.' });
  } else if (saved > 0) {
    rewards.push({ id: 'first-step', title: 'First step', detail: 'You recorded savings this month.' });
  }
  if (totals.activeDays >= 8) {
    rewards.push({ id: 'money-mindful', title: 'Money mindful', detail: 'You kept your money records up to date on eight days.' });
  }

  const nextUp = [];
  if (!monthlyBudget) nextUp.push('Create a monthly budget goal to unlock Budget keeper.');
  else if (totals.spent > monthlyBudget.target_amount) {
    nextUp.push(`Keep monthly spending at or below ${monthlyBudget.target_amount} to unlock Budget keeper.`);
  }
  if (!monthlySavingsGoal) nextUp.push('Create a monthly savings goal and log contributions to earn a saving reward.');
  else if (saved < monthlySavingsGoal.target_amount) {
    nextUp.push(`Save ${Math.max(0, monthlySavingsGoal.target_amount - saved).toFixed(2)} more to reach your monthly goal.`);
  }
  if (totals.activeDays < 8) nextUp.push(`Record money activity on ${8 - totals.activeDays} more days to unlock Money mindful.`);

  res.json({
    month,
    summary: { spent: totals.spent, income: totals.income, saved, activeDays: totals.activeDays },
    rewards,
    nextUp
  });
});

module.exports = router;
