const express = require('express');
const app = express();
const PORT = 4002;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'product-service',
    status: 'running',
    port: PORT,
    message: 'Welcome to Product Service!'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/products', (req, res) => {
  res.json([{ id: 1, name: 'Product 1', price: 99.99 }]);
});

app.listen(PORT, () => {
  console.log(`Product Service listening on port ${PORT}`);
});
