<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="goToHome">
          <i class="fas fa-microchip"></i>
          <span>MicroApp</span>
        </div>
        
        <div class="nav-menu">
          <a href="#" @click.prevent="currentView = 'home'" :class="{ active: currentView === 'home' }">
            <i class="fas fa-home"></i> Home
          </a>
          <a href="#" @click.prevent="currentView = 'products'" :class="{ active: currentView === 'products' }">
            <i class="fas fa-shopping-bag"></i> Products
          </a>
          <a href="#" @click.prevent="currentView = 'cart'" :class="{ active: currentView === 'cart' }">
            <i class="fas fa-shopping-cart"></i> Cart 
            <span v-if="cart.length > 0" class="cart-badge">{{ cart.length }}</span>
          </a>
          
          <div v-if="user" class="user-menu">
            <div class="user-avatar" @click="currentView = 'profile'">
              {{ user.firstName?.charAt(0) || user.username.charAt(0) }}
            </div>
            <span>{{ user.firstName || user.username }}</span>
            <button @click="logout" class="btn-logout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
          <div v-else class="auth-buttons">
            <button @click="currentView = 'login'" class="btn-auth">
              <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button @click="currentView = 'register'" class="btn-auth btn-register">
              <i class="fas fa-user-plus"></i> Register
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Notifications -->
    <div v-if="notification.message" :class="['notification', notification.type]">
      <i :class="notification.icon"></i>
      {{ notification.message }}
      <button @click="notification.message = ''" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Home View -->
        <div v-if="currentView === 'home'" class="home-view">
          <div class="hero">
            <h1><i class="fas fa-rocket"></i> Microservices Application</h1>
            <p class="subtitle">Vue.js + Node.js + PostgreSQL + MongoDB</p>
            
            <div class="stats">
              <div class="stat-card">
                <i class="fas fa-users"></i>
                <h3>{{ users.length }}</h3>
                <p>Users</p>
              </div>
              <div class="stat-card">
                <i class="fas fa-box"></i>
                <h3>{{ products.length }}</h3>
                <p>Products</p>
              </div>
              <div class="stat-card">
                <i class="fas fa-database"></i>
                <h3>2</h3>
                <p>Databases</p>
              </div>
              <div class="stat-card">
                <i class="fas fa-server"></i>
                <h3>5</h3>
                <p>Services</p>
              </div>
            </div>

            <div class="hero-actions">
              <button @click="currentView = 'products'" class="btn-primary">
                <i class="fas fa-shopping-bag"></i> Browse Products
              </button>
              <button v-if="!user" @click="currentView = 'register'" class="btn-success">
                <i class="fas fa-user-plus"></i> Get Started
              </button>
            </div>
          </div>

          <div class="services-section">
            <h2><i class="fas fa-layer-group"></i> Architecture Overview</h2>
            <div class="services-grid">
              <div class="service-card">
                <div class="service-icon">
                  <i class="fas fa-desktop"></i>
                </div>
                <h3>Frontend</h3>
                <p>Vue.js 3</p>
                <span class="status online">Port 8080</span>
              </div>
              <div class="service-card">
                <div class="service-icon">
                  <i class="fas fa-code"></i>
                </div>
                <h3>API Gateway</h3>
                <p>Node.js/Express</p>
                <span class="status online">Port 3000</span>
              </div>
              <div class="service-card">
                <div class="service-icon">
                  <i class="fas fa-user-circle"></i>
                </div>
                <h3>User Service</h3>
                <p>PostgreSQL</p>
                <span class="status online">Port 3001</span>
              </div>
              <div class="service-card">
                <div class="service-icon">
                  <i class="fas fa-box-open"></i>
                </div>
                <h3>Product Service</h3>
                <p>MongoDB</p>
                <span class="status online">Port 3002</span>
              </div>
            </div>
          </div>

          <div class="api-info">
            <h2><i class="fas fa-plug"></i> API Endpoints</h2>
            <div class="endpoints">
              <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/auth/register</code>
                <span class="desc">Register new user</span>
              </div>
              <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/auth/login</code>
                <span class="desc">User login</span>
              </div>
              <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/products</code>
                <span class="desc">Get all products</span>
              </div>
              <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/products</code>
                <span class="desc">Create product (Admin)</span>
              </div>
              <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/health</code>
                <span class="desc">System health</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Login View -->
        <div v-if="currentView === 'login'" class="auth-view">
          <div class="auth-card">
            <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
            <form @submit.prevent="handleLogin">
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="loginForm.email" required placeholder="admin@example.com">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" v-model="loginForm.password" required placeholder="admin123">
              </div>
              <button type="submit" class="btn-primary" :disabled="loading">
                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                <i class="fas fa-sign-in-alt" v-else></i>
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>
            </form>
            <p class="auth-link">
              Don't have an account? <a href="#" @click.prevent="currentView = 'register'">Register here</a>
            </p>
          </div>
        </div>

        <!-- Register View -->
        <div v-if="currentView === 'register'" class="auth-view">
          <div class="auth-card">
            <h2><i class="fas fa-user-plus"></i> Register</h2>
            <form @submit.prevent="handleRegister">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" v-model="registerForm.firstName" placeholder="John">
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" v-model="registerForm.lastName" placeholder="Doe">
                </div>
              </div>
              <div class="form-group">
                <label>Username *</label>
                <input type="text" v-model="registerForm.username" required placeholder="johndoe">
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" v-model="registerForm.email" required placeholder="john@example.com">
              </div>
              <div class="form-group">
                <label>Password *</label>
                <input type="password" v-model="registerForm.password" required placeholder="Minimum 6 characters">
              </div>
              <button type="submit" class="btn-primary" :disabled="loading">
                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                <i class="fas fa-user-plus" v-else></i>
                {{ loading ? 'Creating account...' : 'Register' }}
              </button>
            </form>
            <p class="auth-link">
              Already have an account? <a href="#" @click.prevent="currentView = 'login'">Login here</a>
            </p>
          </div>
        </div>

        <!-- Products View -->
        <div v-if="currentView === 'products'" class="products-view">
          <div class="products-header">
            <h2><i class="fas fa-shopping-bag"></i> Products</h2>
            <div class="products-filters">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" v-model="search" placeholder="Search products...">
              </div>
              <select v-model="category" class="filter-select">
                <option value="">All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Books</option>
                <option>Home</option>
                <option>Sports</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div v-if="user?.role === 'admin'" class="admin-actions">
            <button @click="showCreateForm = !showCreateForm" class="btn-primary">
              <i class="fas fa-plus"></i> Add Product
            </button>
            
            <div v-if="showCreateForm" class="create-form">
              <h3>Create New Product</h3>
              <form @submit.prevent="createProduct">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name *</label>
                    <input type="text" v-model="newProduct.name" required>
                  </div>
                  <div class="form-group">
                    <label>Price *</label>
                    <input type="number" v-model="newProduct.price" step="0.01" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Description *</label>
                  <textarea v-model="newProduct.description" rows="3" required></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Category *</label>
                    <select v-model="newProduct.category" required>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Books</option>
                      <option>Home</option>
                      <option>Sports</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Stock</label>
                    <input type="number" v-model="newProduct.stock">
                  </div>
                </div>
                <button type="submit" class="btn-success">
                  <i class="fas fa-save"></i> Create Product
                </button>
              </form>
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="empty-state">
            <i class="fas fa-box-open fa-3x"></i>
            <h3>No products found</h3>
            <p>Try changing your search criteria</p>
          </div>

          <div class="products-grid">
            <div class="product-card" v-for="product in filteredProducts" :key="product._id">
              <div class="product-image">
                <img :src="product.imageUrl || 'https://via.placeholder.com/300'" :alt="product.name">
              </div>
              <div class="product-info">
                <span class="product-category">{{ product.category }}</span>
                <h3 class="product-title">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">${{ product.price.toFixed(2) }}</div>
                <div class="product-meta">
                  <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                    <i class="fas fa-box"></i> {{ product.stock }} in stock
                  </span>
                </div>
                <div class="product-actions">
                  <button @click="addToCart(product)" class="btn-primary">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                  </button>
                  <button v-if="user?.role === 'admin'" @click="deleteProduct(product._id)" class="btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart View -->
        <div v-if="currentView === 'cart'" class="cart-view">
          <h2><i class="fas fa-shopping-cart"></i> Shopping Cart</h2>
          
          <div v-if="cart.length === 0" class="empty-cart">
            <i class="fas fa-shopping-cart fa-3x"></i>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button @click="currentView = 'products'" class="btn-primary">
              <i class="fas fa-shopping-bag"></i> Browse Products
            </button>
          </div>

          <div v-else>
            <div class="cart-items">
              <div class="cart-item" v-for="item in cart" :key="item.id">
                <img :src="item.image" :alt="item.name" class="cart-item-image">
                <div class="cart-item-details">
                  <h4>{{ item.name }}</h4>
                  <p>${{ item.price.toFixed(2) }} each</p>
                  <div class="quantity-controls">
                    <button @click="updateQuantity(item.id, -1)" class="btn-quantity">-</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.id, 1)" class="btn-quantity">+</button>
                  </div>
                </div>
                <div class="cart-item-total">
                  <strong>${{ (item.price * item.quantity).toFixed(2) }}</strong>
                  <button @click="removeFromCart(item.id)" class="btn-remove">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>$5.99</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ (cartTotal + 5.99).toFixed(2) }}</span>
              </div>
              
              <button @click="checkout" class="btn-success btn-checkout">
                <i class="fas fa-credit-card"></i> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        <!-- Profile View -->
        <div v-if="currentView === 'profile'" class="profile-view">
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar-large">
                {{ user?.firstName?.charAt(0) || user?.username?.charAt(0) }}
              </div>
              <div class="profile-info">
                <h2>{{ user?.firstName }} {{ user?.lastName }}</h2>
                <p class="username">@{{ user?.username }}</p>
                <p class="email">{{ user?.email }}</p>
                <span class="role-badge" :class="user?.role">{{ user?.role }}</span>
              </div>
            </div>
            
            <div class="profile-stats">
              <div class="stat">
                <i class="fas fa-shopping-cart"></i>
                <h4>{{ cart.length }}</h4>
                <p>Cart Items</p>
              </div>
              <div class="stat">
                <i class="fas fa-box"></i>
                <h4>{{ products.length }}</h4>
                <p>Products</p>
              </div>
              <div class="stat">
                <i class="fas fa-calendar"></i>
                <h4>2024</h4>
                <p>Member Since</p>
              </div>
            </div>

            <div class="profile-actions">
              <button @click="currentView = 'products'" class="btn-primary">
                <i class="fas fa-shopping-bag"></i> Shop Now
              </button>
              <button @click="logout" class="btn-danger">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>Microservices Application - Vue.js + Node.js + PostgreSQL + MongoDB</p>
        <p>API Gateway: Port 3000 | User Service: Port 3001 | Product Service: Port 3002</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentView: 'home',
      user: null,
      users: [],
      products: [],
      cart: [],
      search: '',
      category: '',
      showCreateForm: false,
      loading: false,
      loginForm: {
        email: 'admin@example.com',
        password: 'admin123'
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      },
      newProduct: {
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: 0
      },
      notification: {
        message: '',
        type: '',
        icon: ''
      }
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesSearch = !this.search || 
          product.name.toLowerCase().includes(this.search.toLowerCase()) ||
          product.description.toLowerCase().includes(this.search.toLowerCase())
        
        const matchesCategory = !this.category || product.category === this.category
        
        return matchesSearch && matchesCategory
      })
    },
    cartTotal() {
      return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
  },
  methods: {
    goToHome() {
      this.currentView = 'home'
    },
    
    async handleLogin() {
      this.loading = true
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.loginForm)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.user = data.user
          localStorage.setItem('token', data.token)
          this.showNotification('Login successful!', 'success', 'fas fa-check-circle')
          this.currentView = 'home'
          await this.fetchProducts()
        } else {
          throw new Error(data.error || 'Login failed')
        }
      } catch (error) {
        this.showNotification(error.message, 'error', 'fas fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },
    
    async handleRegister() {
      this.loading = true
      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.registerForm)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.user = data.user
          localStorage.setItem('token', data.token)
          this.showNotification('Account created successfully!', 'success', 'fas fa-check-circle')
          this.currentView = 'home'
          await this.fetchProducts()
        } else {
          throw new Error(data.error || 'Registration failed')
        }
      } catch (error) {
        this.showNotification(error.message, 'error', 'fas fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      this.user = null
      this.cart = []
      localStorage.removeItem('token')
      this.showNotification('Logged out successfully', 'info', 'fas fa-info-circle')
      this.currentView = 'home'
    },
    
    async fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/products')
        const data = await response.json()
        if (response.ok) {
          this.products = data.products || []
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    },
    
    addToCart(product) {
      const existingItem = this.cart.find(item => item.id === product._id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.cart.push({
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.imageUrl || 'https://via.placeholder.com/300'
        })
      }
      this.showNotification(`${product.name} added to cart!`, 'success', 'fas fa-check-circle')
    },
    
    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.id !== productId)
      this.showNotification('Item removed from cart', 'info', 'fas fa-info-circle')
    },
    
    updateQuantity(productId, change) {
      const item = this.cart.find(item => item.id === productId)
      if (item) {
        item.quantity += change
        if (item.quantity <= 0) {
          this.removeFromCart(productId)
        }
      }
    },
    
    async checkout() {
      if (!this.user) {
        this.showNotification('Please login to checkout', 'error', 'fas fa-exclamation-circle')
        this.currentView = 'login'
        return
      }
      
      const total = this.cartTotal + 5.99
      const confirmed = confirm(`Confirm payment of $${total.toFixed(2)}?`)
      
      if (confirmed) {
        this.showNotification('Payment processed successfully!', 'success', 'fas fa-check-circle')
        this.cart = []
        setTimeout(() => {
          this.currentView = 'products'
        }, 2000)
      }
    },
    
    async createProduct() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.newProduct)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.showNotification('Product created successfully!', 'success', 'fas fa-check-circle')
          this.showCreateForm = false
          this.newProduct = {
            name: '',
            description: '',
            price: '',
            category: 'Electronics',
            stock: 0
          }
          await this.fetchProducts()
        } else {
          throw new Error(data.error || 'Failed to create product')
        }
      } catch (error) {
        this.showNotification(error.message, 'error', 'fas fa-exclamation-circle')
      }
    },
    
    async deleteProduct(productId) {
      if (!confirm('Are you sure you want to delete this product?')) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          this.showNotification('Product deleted successfully!', 'success', 'fas fa-check-circle')
          await this.fetchProducts()
        } else {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete product')
        }
      } catch (error) {
        this.showNotification(error.message, 'error', 'fas fa-exclamation-circle')
      }
    },
    
    showNotification(message, type, icon) {
      this.notification = { message, type, icon }
      setTimeout(() => {
        this.notification.message = ''
      }, 3000)
    },
    
    async checkAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            this.user = data.user
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
        }
      }
    }
  },
  async mounted() {
    await this.checkAuth()
    await this.fetchProducts()
    
    // Auto-login with admin for testing
    if (!this.user && window.location.hostname === 'localhost') {
      this.loginForm.email = 'admin@example.com'
      this.loginForm.password = 'admin123'
    }
  }
}
</script>
