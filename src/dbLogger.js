const MAX_LOGS = 100;
const logs = [];

function addLog(msg, isError = false) {
  const entry = { time: new Date().toISOString(), msg: String(msg), isError };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
  if (isError) {
    console.error('[DB]', msg);
  } else {
    console.log('[DB]', msg);
  }
}

function getLogs() {
  return logs.slice();
}

module.exports = { addLog, getLogs };
