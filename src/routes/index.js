const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const items = [
  { id: 1, name: 'Item 1', createdAt: new Date().toISOString() },
  { id: 2, name: 'Item 2', createdAt: new Date().toISOString() },
];

router.get('/items', (req, res) => {
  res.json(items);
});

router.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});

router.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const newItem = {
    id: items.length + 1,
    name,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

module.exports = router;
