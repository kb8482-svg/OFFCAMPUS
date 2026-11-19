const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT id, name, kind FROM categories ORDER BY kind, name').all();
  res.json({ categories });
});

module.exports = router;
