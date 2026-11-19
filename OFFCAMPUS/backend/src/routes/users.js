const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, username FROM users WHERE id != ? ORDER BY username')
    .all(req.user.id);
  res.json({ users });
});

module.exports = router;
