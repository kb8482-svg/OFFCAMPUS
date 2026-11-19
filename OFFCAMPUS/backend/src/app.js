const express = require('express');
const cors = require('cors');
const { allowedOrigins, frontendPort } = require('./config');
const authenticate = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');
const profileRoutes = require('./routes/profile');
const goalRoutes = require('./routes/goals');
const rewardRoutes = require('./routes/rewards');
const { ApiError } = require('./errors');

const app = express();

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    const localOrigins = [
      `http://localhost:${frontendPort}`,
      `http://127.0.0.1:${frontendPort}`
    ];
    if (!origin || allowedOrigins.includes(origin) || localOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new ApiError(403, 'This origin is not allowed by the API.'));
  },
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', authenticate);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/expenses', expenseRoutes);

app.use('/api', (req, res, next) => next(new ApiError(404, 'API endpoint not found.')));
app.use((req, res, next) => next(new ApiError(404, 'Route not found.')));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error(error);
  const message = status >= 500 ? 'An unexpected server error occurred.' : error.message;
  res.status(status).json({ error: message });
});

module.exports = app;
