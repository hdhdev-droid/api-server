const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/tables', async (req, res) => {
  try {
    const result = await db.getTables();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ error: err.message || '서버 오류' });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/items', async (req, res) => {
  try {
    const items = await db.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/items/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await db.getItemById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/items', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const newItem = await db.createItem(name);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
