const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'running',
    port: PORT,
    message: 'Welcome to API Gateway!'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
