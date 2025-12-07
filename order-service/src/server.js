const express = require('express');
const app = express();
const PORT = 4003;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'order-service',
    status: 'running',
    port: PORT,
    message: 'Welcome to Order Service!'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/orders', (req, res) => {
  res.json([{ id: 1, userId: 1, productId: 1, quantity: 2 }]);
});

app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
});
