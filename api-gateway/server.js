const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-12345';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes - handled locally
app.post('/api/auth/register', (req, res) => {
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }
  })(req, res);
});

app.post('/api/auth/login', (req, res) => {
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }
  })(req, res);
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('authorization', `Bearer ${req.headers.authorization.split(' ')[1]}`);
    }
  })(req, res);
});

// User routes (protected)
app.use('/api/users', authenticateToken, createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

// Product routes (public for GET, protected for POST/PUT/DELETE)
app.get('/api/products', createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

app.get('/api/products/:id', createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

app.use('/api/products', authenticateToken, createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req) => {
    if (req.body) {
      let bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

// Health checks
app.get('/api/health/user', (req, res) => {
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/health/user': '/health' }
  })(req, res);
});

app.get('/api/health/product', (req, res) => {
  createProxyMiddleware({
    target: PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/health/product': '/health' }
  })(req, res);
});

// Combined health check
app.get('/api/health', async (req, res) => {
  try {
    const services = {
      userService: USER_SERVICE_URL,
      productService: PRODUCT_SERVICE_URL,
      gateway: 'http://localhost:3000'
    };

    res.json({
      status: 'operational',
      services: services,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    services: {
      userService: `${USER_SERVICE_URL}`,
      productService: `${PRODUCT_SERVICE_URL}`,
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          profile: 'GET /api/auth/profile'
        },
        users: 'GET /api/users',
        products: {
          list: 'GET /api/products',
          single: 'GET /api/products/:id',
          create: 'POST /api/products',
          update: 'PUT /api/products/:id',
          delete: 'DELETE /api/products/:id'
        },
        health: {
          gateway: 'GET /api/health',
          userService: 'GET /api/health/user',
          productService: 'GET /api/health/product'
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`User Service: ${USER_SERVICE_URL}`);
  console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
});
