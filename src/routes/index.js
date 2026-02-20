const express = require('express');
const config = require('../config');
const db = require('../db');

const router = express.Router();

function getDbEnvForDisplay() {
  const keys = ['DB_TYPE', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const out = {};
  for (const key of keys) {
    const v = config[key];
    if (key === 'DB_PASSWORD') {
      out[key] = v != null && String(v).length > 0 ? '********' : '(미설정)';
    } else {
      out[key] = v != null && v !== '' ? String(v) : '(미설정)';
    }
  }
  return out;
}

router.get('/config', (req, res) => {
  res.json({ env: getDbEnvForDisplay() });
});

router.get('/main', async (req, res) => {
  const env = getDbEnvForDisplay();
  try {
    const result = await db.getTables();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ env, tables: result.tables || [], error: result.error || null });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ env, tables: [], error: err.message || '서버 오류' });
  }
});

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

router.post('/tables', async (req, res) => {
  const { tableName } = req.body;
  if (!tableName || typeof tableName !== 'string') {
    return res.status(400).json({ error: 'tableName is required (string)' });
  }
  try {
    const result = await db.createTable(tableName.trim());
    if (result == null) return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다.' });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/tables/:tableName/rows', async (req, res) => {
  const { tableName } = req.params;
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required (string)' });
  }
  try {
    const row = await db.addRow(tableName, name.trim());
    if (row == null) return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다.' });
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/tables/:tableName/rows/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const deleted = await db.deleteRow(tableName, numId);
    if (deleted == null) return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다.' });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/items', async (req, res) => {
  try {
    const items = await db.getItems();
    if (items == null || !Array.isArray(items)) {
      return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다. 아이템은 DB에서만 조회됩니다.' });
    }
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
    if (newItem == null) {
      return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다. 아이템은 DB에만 저장됩니다.' });
    }
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/items/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const deleted = await db.deleteItem(id);
    if (deleted == null) return res.status(503).json({ error: 'DB 연결을 사용할 수 없습니다.' });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
