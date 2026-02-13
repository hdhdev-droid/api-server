const express = require('express');
const routes = require('./routes');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);

app.get('/sample', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'sample.html'));
});

app.get('/', (req, res) => {
  res.json({
    message: 'API Server',
    version: '1.0.0',
    sample: 'GET /sample 또는 /sample.html',
    endpoints: {
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
