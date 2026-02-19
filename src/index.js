require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');
const dbLogger = require('./dbLogger');
const routes = require('./routes');

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

app.get('/ok', (req, res) => {
  res.type('text/plain').send('OK');
});

app.get('/gateway-timeout', (req, res) => {
  res.status(504).type('text/plain').send('Gateway Timeout');
});

function getDbEnvForDisplay() {
  const keys = ['PORT', 'DB_TYPE', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
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

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAccessDeniedHtml() {
  const env = getDbEnvForDisplay();
  const rows = Object.entries(env)
    .map(([k, v]) => '<tr><th style="text-align:left;padding:0.4rem 0.6rem;border-bottom:1px solid #eee;">' + escapeHtml(k) + '</th><td style="padding:0.4rem 0.6rem;border-bottom:1px solid #eee;word-break:break-all;">' + escapeHtml(v) + '</td></tr>')
    .join('');
  const table = '<table style="width:100%;max-width:400px;margin:1rem auto;font-size:0.9rem;border-collapse:collapse;">' + rows + '</table>';
  const logEntries = dbLogger.getLogs();
  const logLines = logEntries.length === 0
    ? '(아직 로그 없음)'
    : logEntries.map((e) => '[' + e.time + '] ' + (e.isError ? 'ERROR: ' : '') + escapeHtml(e.msg)).join('\n');
  const logBlock = '<pre style="text-align:left;background:#1a1a2e;color:#e2e8f0;padding:1rem;border-radius:6px;font-size:0.8rem;overflow:auto;max-height:200px;">' + escapeHtml(logLines) + '</pre>';
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>접속 불가</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:3rem auto;padding:2rem;text-align:center;">
  <h1 style="color:#dc2626;">접속 불가</h1>
  <p>DB가 설정되지 않았거나 연결되지 않아 서비스를 이용할 수 없습니다.</p>
  <p style="color:#64748b;font-size:0.9rem;">DB_TYPE, DB_HOST, DB_NAME 등 환경 변수를 설정하고 DB 서버가 동작 중인지 확인하세요. (변수·메모리 DB는 사용하지 않습니다.)</p>
  <p style="margin-top:1.5rem;font-size:0.9rem;color:#333;">현재 설정된 환경 변수</p>
  ${table}
  <p style="margin-top:1.5rem;font-size:0.9rem;color:#333;">연결 과정 / 디버그 로그</p>
  ${logBlock}
</body>
</html>`;
}

app.use(async (req, res, next) => {
  if (!db.isConfigured()) {
    dbLogger.addLog('Access denied: DB not configured (DB_TYPE/DB_HOST/DB_NAME or DB_PORT for inference)');
    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').setHeader('X-Service-Status', 'unavailable').send(getAccessDeniedHtml());
    return;
  }
  const ok = await db.ping();
  if (!ok) {
    dbLogger.addLog('Access denied: DB ping failed');
    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').setHeader('X-Service-Status', 'unavailable').send(getAccessDeniedHtml());
    return;
  }
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);

app.get('/sample', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'sample.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API Server',
    version: '1.0.0',
    endpoints: {
      config: 'GET /api/config',
      tables: 'GET /api/tables',
      createTable: 'POST /api/tables (body: { tableName })',
      tableRows: 'POST /api/tables/:tableName/rows (body: { name }), DELETE /api/tables/:tableName/rows/:id',
      health: 'GET /api/health',
      items: 'GET /api/items, POST /api/items (body: { name }), DELETE /api/items/:id',
      itemsById: 'GET /api/items/:id',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  const dbType = db.getDbType();
  const configured = db.isConfigured();
  dbLogger.addLog('Config check: dbType=' + (dbType || '(none)') + ', configured=' + configured);
});
