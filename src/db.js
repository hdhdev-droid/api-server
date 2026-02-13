const { Pool } = require('pg');
const config = require('./config');

let pool = null;

function getPool() {
  if (pool) return pool;
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
  if (!DB_HOST || !DB_NAME) return null;
  pool = new Pool({
    host: DB_HOST,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  return pool;
}

/**
 * DB 연결 가능 여부
 */
function isConfigured() {
  return !!(config.DB_HOST && config.DB_NAME);
}

/**
 * public 스키마의 테이블 목록 조회
 * @returns {{ tables: string[] } | { error: string }}
 */
async function getTables() {
  if (!isConfigured()) {
    return { error: 'DB가 설정되지 않았습니다. DB_HOST, DB_NAME 등 환경 변수를 확인하세요.' };
  }
  const client = getPool();
  try {
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    return { tables: result.rows.map((r) => r.table_name) };
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { getPool, getTables, isConfigured };
