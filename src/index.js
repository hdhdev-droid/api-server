const express = require('express');
const path = require('path');
const config = require('./config');
const routes = require('./routes');

const app = express();
const PORT = config.PORT;

app.use(express.json());

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
      tables: 'GET /api/tables',
      health: 'GET /api/health',
      items: 'GET /api/items',
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
});
