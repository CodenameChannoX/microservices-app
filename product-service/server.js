const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/productdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

// Get all products
app.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (admin only - in real app, add authentication)
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Name, description, price, and category are required' });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: stock || 0,
      imageUrl: imageUrl || 'https://via.placeholder.com/300'
    });

    await product.save();
    res.status(201).json({ 
      message: 'Product created successfully', 
      product 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
app.put('/products/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ 
      message: 'Product updated successfully', 
      product 
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'product-service',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Seed sample products
app.post('/products/seed', async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: 'iPhone 14 Pro',
        description: 'Latest iPhone with A16 Bionic chip',
        price: 1099.99,
        category: 'Electronics',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c'
      },
      {
        name: 'MacBook Air M2',
        description: 'Thin and light laptop with M2 chip',
        price: 1299.99,
        category: 'Electronics',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
      },
      {
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        price: 129.99,
        category: 'Sports',
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
      },
      {
        name: 'Samsung 4K TV',
        description: '55-inch 4K Ultra HD Smart TV',
        price: 699.99,
        category: 'Electronics',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1'
      },
      {
        name: 'Designer T-Shirt',
        description: 'Premium cotton t-shirt',
        price: 49.99,
        category: 'Clothing',
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
      },
      {
        name: 'Coffee Table Book',
        description: 'Beautiful photography book',
        price: 39.99,
        category: 'Books',
        stock: 75,
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'
      }
    ];

    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);

    res.json({ 
      message: 'Sample products seeded successfully',
      count: sampleProducts.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});
