const config = require('./config');
const dbLogger = require('./dbLogger');

const DB_TYPES = ['POSTGRESQL', 'MYSQL', 'MARIADB', 'MONGODB'];
const PORT_TO_TYPE = { 5432: 'POSTGRESQL', 3306: 'MYSQL', 27017: 'MONGODB' };

let pgPool = null;
let mysqlPool = null;
let mongoClient = null;
let mongoDb = null;
let pingOkLogged = false;

function getDbType() {
  const explicit = config.DB_TYPE ? config.DB_TYPE.toUpperCase() : null;
  if (explicit && DB_TYPES.includes(explicit)) return explicit;
  if (config.DB_URI && (config.DB_URI.trim() !== '')) return 'MONGODB';
  const port = config.DB_PORT != null && config.DB_PORT !== '' ? parseInt(config.DB_PORT, 10) : NaN;
  if (Number.isNaN(port)) return null;
  return PORT_TO_TYPE[port] || null;
}

function isConfigured() {
  const t = getDbType();
  if (!t) return false;
  if (t === 'MONGODB') {
    return !!(config.DB_URI || (config.DB_HOST && config.DB_NAME));
  }
  return !!(config.DB_HOST && config.DB_NAME);
}

function itemFromRow(r) {
  const created = r.created_at || r.createdAt;
  return {
    id: r.id,
    name: r.name,
    createdAt: created ? new Date(created).toISOString() : null,
  };
}

// ---------- PostgreSQL ----------
function getPgPool() {
  if (pgPool) return pgPool;
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
  const port = DB_PORT ? parseInt(DB_PORT, 10) : 5432;
  dbLogger.addLog('Connecting to PostgreSQL ' + JSON.stringify({ host: DB_HOST, port, database: DB_NAME, user: DB_USER }));
  const { Pool } = require('pg');
  pgPool = new Pool({
    host: DB_HOST,
    port,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  return pgPool;
}

async function pgGetTables() {
  const pool = getPgPool();
  const result = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );
  return { tables: result.rows.map((r) => r.table_name) };
}

async function pgEnsureItems() {
  const pool = getPgPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function pgGetItems() {
  await pgEnsureItems();
  const result = await getPgPool().query(
    'SELECT id, name, created_at FROM items ORDER BY id'
  );
  return result.rows.map((r) => itemFromRow(r));
}

async function pgGetItemById(id) {
  await pgEnsureItems();
  const result = await getPgPool().query(
    'SELECT id, name, created_at FROM items WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) return null;
  return itemFromRow(result.rows[0]);
}

async function pgCreateItem(name) {
  await pgEnsureItems();
  const result = await getPgPool().query(
    'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
    [name]
  );
  return itemFromRow(result.rows[0]);
}

// ---------- MySQL / MariaDB ----------
function getMysqlPool() {
  if (mysqlPool) return mysqlPool;
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
  const port = DB_PORT ? parseInt(DB_PORT, 10) : 3306;
  dbLogger.addLog('Connecting to MySQL/MariaDB ' + JSON.stringify({ host: DB_HOST, port, database: DB_NAME, user: DB_USER }));
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool({
    host: DB_HOST,
    port,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  return mysqlPool;
}

async function mysqlGetTables() {
  const pool = getMysqlPool();
  const [rows] = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = ? AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
    [config.DB_NAME]
  );
  return { tables: rows.map((r) => r.TABLE_NAME || r.table_name) };
}

async function mysqlEnsureItems() {
  const pool = getMysqlPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
    )
  `);
}

async function mysqlGetItems() {
  await mysqlEnsureItems();
  const [rows] = await getMysqlPool().query(
    'SELECT id, name, created_at FROM items ORDER BY id'
  );
  return rows.map((r) => itemFromRow(r));
}

async function mysqlGetItemById(id) {
  await mysqlEnsureItems();
  const [rows] = await getMysqlPool().query(
    'SELECT id, name, created_at FROM items WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  return itemFromRow(rows[0]);
}

async function mysqlCreateItem(name) {
  await mysqlEnsureItems();
  const [result] = await getMysqlPool().query(
    'INSERT INTO items (name) VALUES (?)',
    [name]
  );
  const [rows] = await getMysqlPool().query(
    'SELECT id, name, created_at FROM items WHERE id = ?',
    [result.insertId]
  );
  return itemFromRow(rows[0]);
}

// ---------- MongoDB ----------
async function getMongoDb() {
  if (mongoDb) return mongoDb;
  const { MongoClient } = require('mongodb');
  let url = config.DB_URI;
  if (!url) {
    const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
    const port = DB_PORT ? parseInt(DB_PORT, 10) : 27017;
    dbLogger.addLog('Connecting to MongoDB ' + JSON.stringify({ host: DB_HOST, port, database: DB_NAME, user: DB_USER ? '(set)' : '(none)' }));
    const auth = DB_USER && DB_PASSWORD
      ? `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@`
      : '';
    url = `mongodb://${auth}${DB_HOST}:${port}/${DB_NAME}`;
  } else {
    dbLogger.addLog('Connecting to MongoDB via DB_URI');
  }
  mongoClient = new MongoClient(url);
  await mongoClient.connect();
  mongoDb = config.DB_NAME ? mongoClient.db(config.DB_NAME) : mongoClient.db();
  return mongoDb;
}

async function mongoGetTables() {
  const db = await getMongoDb();
  const cols = await db.listCollections().toArray();
  return { tables: cols.map((c) => c.name) };
}

function mongoItemsCollection(db) {
  return db.collection('items');
}

function mongoDocToItem(doc) {
  return {
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

async function mongoGetItems() {
  const db = await getMongoDb();
  const col = mongoItemsCollection(db);
  const cursor = col.find({}).sort({ id: 1 });
  const list = await cursor.toArray();
  return list.map(mongoDocToItem);
}

async function mongoGetItemById(id) {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return null;
  const db = await getMongoDb();
  const col = mongoItemsCollection(db);
  const doc = await col.findOne({ id: numId });
  if (!doc) return null;
  return mongoDocToItem(doc);
}

async function mongoCreateItem(name) {
  const db = await getMongoDb();
  const col = mongoItemsCollection(db);
  const last = await col.find().sort({ id: -1 }).limit(1).toArray();
  const nextId = last.length > 0 ? last[0].id + 1 : 1;
  const doc = {
    id: nextId,
    name,
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return mongoDocToItem(doc);
}

// ---------- 연결 확인 (ping) ----------
async function ping() {
  if (!isConfigured()) return false;
  const t = getDbType();
  try {
    if (t === 'POSTGRESQL') {
      await getPgPool().query('SELECT 1');
      if (!pingOkLogged) { dbLogger.addLog('Ping OK (PostgreSQL)'); pingOkLogged = true; }
      return true;
    }
    if (t === 'MYSQL' || t === 'MARIADB') {
      await getMysqlPool().query('SELECT 1');
      if (!pingOkLogged) { dbLogger.addLog('Ping OK (MySQL/MariaDB)'); pingOkLogged = true; }
      return true;
    }
    if (t === 'MONGODB') {
      const db = await getMongoDb();
      await db.command({ ping: 1 });
      if (!pingOkLogged) { dbLogger.addLog('Ping OK (MongoDB)'); pingOkLogged = true; }
      return true;
    }
    return false;
  } catch (err) {
    dbLogger.addLog('Ping failed: ' + err.message, true);
    return false;
  }
}

// ---------- 공통 API ----------
async function getTables() {
  if (!isConfigured()) {
    return { error: 'DB가 설정되지 않았습니다. DB_TYPE, DB_HOST, DB_NAME 등 환경 변수를 확인하세요.' };
  }
  const t = getDbType();
  try {
    if (t === 'POSTGRESQL') return await pgGetTables();
    if (t === 'MYSQL' || t === 'MARIADB') return await mysqlGetTables();
    if (t === 'MONGODB') return await mongoGetTables();
    return { error: '지원하지 않는 DB_TYPE입니다. POSTGRESQL, MYSQL, MARIADB, MONGODB 중 하나를 사용하세요.' };
  } catch (err) {
    return { error: err.message };
  }
}

async function getItems() {
  if (!isConfigured()) return null;
  const t = getDbType();
  if (t === 'POSTGRESQL') return await pgGetItems();
  if (t === 'MYSQL' || t === 'MARIADB') return await mysqlGetItems();
  if (t === 'MONGODB') return await mongoGetItems();
  return null;
}

async function getItemById(id) {
  if (!isConfigured()) return null;
  const t = getDbType();
  if (t === 'POSTGRESQL') return await pgGetItemById(id);
  if (t === 'MYSQL' || t === 'MARIADB') return await mysqlGetItemById(id);
  if (t === 'MONGODB') return await mongoGetItemById(id);
  return null;
}

async function createItem(name) {
  if (!isConfigured()) return null;
  const t = getDbType();
  if (t === 'POSTGRESQL') return await pgCreateItem(name);
  if (t === 'MYSQL' || t === 'MARIADB') return await mysqlCreateItem(name);
  if (t === 'MONGODB') return await mongoCreateItem(name);
  return null;
}

module.exports = {
  getDbType,
  isConfigured,
  ping,
  getTables,
  getItems,
  getItemById,
  createItem,
};
