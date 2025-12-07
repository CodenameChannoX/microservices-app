import { createApp, reactive } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Global state
const AppState = reactive({
    currentUser: null,
    token: localStorage.getItem('token'),
    cartItems: [],
    products: [],
    users: [],
    currentView: 'home',
    isLoading: false,
    error: null,
    success: null
})

// API Service
const ApiService = {
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }

        if (AppState.token) {
            headers['Authorization'] = `Bearer ${AppState.token}`
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            })

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    AppState.currentUser = null
                    AppState.token = null
                    localStorage.removeItem('token')
                    navigateTo('login')
                    throw new Error('Session expired. Please login again.')
                }
                const error = await response.json()
                throw new Error(error.error || 'Request failed')
            }

            return await response.json()
        } catch (error) {
            console.error('API Error:', error)
            AppState.error = error.message
            throw error
        }
    },

    // Auth
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        })
        AppState.currentUser = data.user
        AppState.token = data.token
        localStorage.setItem('token', data.token)
        return data
    },

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        })
        AppState.currentUser = data.user
        AppState.token = data.token
        localStorage.setItem('token', data.token)
        return data
    },

    async getProfile() {
        const data = await this.request('/auth/profile')
        AppState.currentUser = data.user
        return data
    },

    // Products
    async getProducts() {
        const data = await this.request('/products')
        AppState.products = data.products
        return data
    },

    async createProduct(productData) {
        return await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        })
    },

    async updateProduct(id, productData) {
        return await this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        })
    },

    async deleteProduct(id) {
        return await this.request(`/products/${id}`, {
            method: 'DELETE'
        })
    },

    // Users (admin only)
    async getUsers() {
        const data = await this.request('/users')
        AppState.users = data.users
        return data
    },

    // Health checks
    async checkHealth() {
        return await this.request('/health')
    }
}

// Navigation
function navigateTo(view) {
    AppState.currentView = view
    AppState.error = null
    AppState.success = null
}

// Auth functions
function logout() {
    AppState.currentUser = null
    AppState.token = null
    localStorage.removeItem('token')
    navigateTo('login')
}

// Cart functions
function addToCart(product, quantity = 1) {
    const existingItem = AppState.cartItems.find(item => item.id === product.id)
    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        AppState.cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.imageUrl
        })
    }
    AppState.success = `${product.name} added to cart!`
}

function removeFromCart(productId) {
    AppState.cartItems = AppState.cartItems.filter(item => item.id !== productId)
}

function getCartTotal() {
    return AppState.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Create Vue app
const app = createApp({
    setup() {
        return {
            AppState,
            ApiService,
            navigateTo,
            logout,
            addToCart,
            removeFromCart,
            getCartTotal
        }
    },

    components: {
        // Home Component
        'home-view': {
            template: `
                <div class="home">
                    <div class="hero card text-center">
                        <h1>Welcome to Microservices App</h1>
                        <p class="subtitle">Built with Vue.js, Node.js, PostgreSQL & MongoDB</p>
                        
                        <div class="stats">
                            <div class="stat">
                                <i class="fas fa-users"></i>
                                <h3>{{ AppState.users.length }}</h3>
                                <p>Registered Users</p>
                            </div>
                            <div class="stat">
                                <i class="fas fa-box"></i>
                                <h3>{{ AppState.products.length }}</h3>
                                <p>Products</p>
                            </div>
                            <div class="stat">
                                <i class="fas fa-shopping-cart"></i>
                                <h3>{{ AppState.cartItems.length }}</h3>
                                <p>Cart Items</p>
                            </div>
                            <div class="stat">
                                <i class="fas fa-database"></i>
                                <h3>2</h3>
                                <p>Databases</p>
                            </div>
                        </div>

                        <div class="actions">
                            <button class="btn btn-primary" @click="navigateTo('products')">
                                <i class="fas fa-shopping-bag"></i> Browse Products
                            </button>
                            <button v-if="!AppState.currentUser" class="btn btn-success" @click="navigateTo('register')">
                                <i class="fas fa-user-plus"></i> Get Started
                            </button>
                            <button v-if="AppState.currentUser?.role === 'admin'" class="btn btn-warning" @click="navigateTo('admin')">
                                <i class="fas fa-cog"></i> Admin Panel
                            </button>
                        </div>
                    </div>

                    <div class="services card">
                        <h2>Microservices Architecture</h2>
                        <div class="service-grid">
                            <div class="service">
                                <i class="fas fa-user-circle"></i>
                                <h3>User Service</h3>
                                <p>Node.js + PostgreSQL</p>
                                <small>Handles authentication & user data</small>
                            </div>
                            <div class="service">
                                <i class="fas fa-box-open"></i>
                                <h3>Product Service</h3>
                                <p>Node.js + MongoDB</p>
                                <small>Manages products & inventory</small>
                            </div>
                            <div class="service">
                                <i class="fas fa-code"></i>
                                <h3>API Gateway</h3>
                                <p>Express.js</p>
                                <small>Routes requests to services</small>
                            </div>
                            <div class="service">
                                <i class="fas fa-desktop"></i>
                                <h3>Frontend</h3>
                                <p>Vue.js 3</p>
                                <small>Single Page Application</small>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },

        // Login Component
        'login-view': {
            data() {
                return {
                    email: '',
                    password: '',
                    loading: false
                }
            },
            template: `
                <div class="auth-form">
                    <div class="card" style="max-width: 400px; margin: 0 auto;">
                        <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
                        
                        <form @submit.prevent="login">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" v-model="email" required placeholder="Enter your email">
                            </div>
                            
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" v-model="password" required placeholder="Enter your password">
                            </div>
                            
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                                <i class="fas fa-sign-in-alt" v-else></i>
                                {{ loading ? 'Logging in...' : 'Login' }}
                            </button>
                            
                            <p class="text-center mt-3">
                                Don't have an account? 
                                <a href="#" @click="navigateTo('register')">Register here</a>
                            </p>
                        </form>
                    </div>
                </div>
            `,
            methods: {
                async login() {
                    this.loading = true
                    try {
                        await ApiService.login({
                            email: this.email,
                            password: this.password
                        })
                        AppState.success = 'Login successful!'
                        navigateTo('home')
                    } catch (error) {
                        AppState.error = error.message
                    } finally {
                        this.loading = false
                    }
                }
            }
        },

        // Register Component
        'register-view': {
            data() {
                return {
                    username: '',
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    loading: false
                }
            },
            template: `
                <div class="auth-form">
                    <div class="card" style="max-width: 500px; margin: 0 auto;">
                        <h2><i class="fas fa-user-plus"></i> Create Account</h2>
                        
                        <form @submit.prevent="register">
                            <div class="row">
                                <div class="form-group">
                                    <label>First Name</label>
                                    <input type="text" v-model="firstName" placeholder="John">
                                </div>
                                <div class="form-group">
                                    <label>Last Name</label>
                                    <input type="text" v-model="lastName" placeholder="Doe">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Username *</label>
                                <input type="text" v-model="username" required placeholder="johndoe">
                            </div>
                            
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" v-model="email" required placeholder="john@example.com">
                            </div>
                            
                            <div class="form-group">
                                <label>Password *</label>
                                <input type="password" v-model="password" required placeholder="Minimum 6 characters">
                            </div>
                            
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                                <i class="fas fa-user-plus" v-else></i>
                                {{ loading ? 'Creating account...' : 'Register' }}
                            </button>
                            
                            <p class="text-center mt-3">
                                Already have an account? 
                                <a href="#" @click="navigateTo('login')">Login here</a>
                            </p>
                        </form>
                    </div>
                </div>
            `,
            methods: {
                async register() {
                    this.loading = true
                    try {
                        await ApiService.register({
                            username: this.username,
                            email: this.email,
                            password: this.password,
                            firstName: this.firstName,
                            lastName: this.lastName
                        })
                        AppState.success = 'Account created successfully!'
                        navigateTo('home')
                    } catch (error) {
                        AppState.error = error.message
                    } finally {
                        this.loading = false
                    }
                }
            }
        },

        // Products Component
        'products-view': {
            data() {
                return {
                    search: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    showCreateForm: false,
                    newProduct: {
                        name: '',
                        description: '',
                        price: '',
                        category: 'Electronics',
                        stock: '',
                        imageUrl: ''
                    }
                }
            },
            template: `
                <div class="products">
                    <div class="card">
                        <div class="filters">
                            <div class="search">
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
                            
                            <div class="price-range">
                                <input type="number" v-model="minPrice" placeholder="Min price">
                                <span>to</span>
                                <input type="number" v-model="maxPrice" placeholder="Max price">
                            </div>
                        </div>
                    </div>

                    <div class="card" v-if="AppState.currentUser?.role === 'admin'">
                        <button class="btn btn-primary" @click="showCreateForm = !showCreateForm">
                            <i class="fas fa-plus"></i> Add New Product
                        </button>
                        
                        <div v-if="showCreateForm" class="create-form mt-3">
                            <h3>Create New Product</h3>
                            <form @submit.prevent="createProduct">
                                <div class="row">
                                    <div class="form-group">
                                        <label>Product Name *</label>
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
                                
                                <div class="row">
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
                                
                                <div class="form-group">
                                    <label>Image URL</label>
                                    <input type="text" v-model="newProduct.imageUrl" placeholder="https://example.com/image.jpg">
                                </div>
                                
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-save"></i> Create Product
                                </button>
                            </form>
                        </div>
                    </div>

                    <div v-if="filteredProducts.length === 0" class="card text-center">
                        <i class="fas fa-box-open fa-3x"></i>
                        <h3>No products found</h3>
                        <p>Try changing your search criteria</p>
                    </div>

                    <div class="products-grid">
                        <div class="product-card" v-for="product in filteredProducts" :key="product.id">
                            <img :src="product.imageUrl || 'https://via.placeholder.com/300'" 
                                 :alt="product.name" class="product-image">
                            <div class="product-info">
                                <div class="product-category">{{ product.category }}</div>
                                <h3 class="product-title">{{ product.name }}</h3>
                                <p class="product-description">{{ product.description }}</p>
                                <div class="product-price">${{ product.price.toFixed(2) }}</div>
                                
                                <div class="product-meta">
                                    <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                                        <i class="fas fa-box"></i> {{ product.stock }} in stock
                                    </span>
                                    <span class="created">
                                        {{ new Date(product.createdAt).toLocaleDateString() }}
                                    </span>
                                </div>
                                
                                <div class="product-actions">
                                    <button class="btn btn-primary" @click="addToCart(product)">
                                        <i class="fas fa-cart-plus"></i> Add to Cart
                                    </button>
                                    
                                    <button v-if="AppState.currentUser?.role === 'admin'" 
                                            class="btn btn-danger" 
                                            @click="deleteProduct(product.id)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            computed: {
                filteredProducts() {
                    return AppState.products.filter(product => {
                        const matchesSearch = !this.search || 
                            product.name.toLowerCase().includes(this.search.toLowerCase()) ||
                            product.description.toLowerCase().includes(this.search.toLowerCase())
                        
                        const matchesCategory = !this.category || product.category === this.category
                        
                        const matchesMinPrice = !this.minPrice || product.price >= parseFloat(this.minPrice)
                        const matchesMaxPrice = !this.maxPrice || product.price <= parseFloat(this.maxPrice)
                        
                        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
                    })
                }
            },
            methods: {
                async createProduct() {
                    try {
                        await ApiService.createProduct(this.newProduct)
                        await ApiService.getProducts()
                        this.showCreateForm = false
                        this.newProduct = {
                            name: '',
                            description: '',
                            price: '',
                            category: 'Electronics',
                            stock: '',
                            imageUrl: ''
                        }
                        AppState.success = 'Product created successfully!'
                    } catch (error) {
                        AppState.error = error.message
                    }
                },
                
                async deleteProduct(id) {
                    if (!confirm('Are you sure you want to delete this product?')) return
                    
                    try {
                        await ApiService.deleteProduct(id)
                        await ApiService.getProducts()
                        AppState.success = 'Product deleted successfully!'
                    } catch (error) {
                        AppState.error = error.message
                    }
                }
            },
            async mounted() {
                await ApiService.getProducts()
            }
        },

        // Cart Component
        'cart-view': {
            template: `
                <div class="cart">
                    <div class="card">
                        <h2><i class="fas fa-shopping-cart"></i> Your Shopping Cart</h2>
                        
                        <div v-if="AppState.cartItems.length === 0" class="empty-cart text-center">
                            <i class="fas fa-shopping-cart fa-3x"></i>
                            <h3>Your cart is empty</h3>
                            <p>Add some products to get started!</p>
                            <button class="btn btn-primary" @click="navigateTo('products')">
                                <i class="fas fa-shopping-bag"></i> Browse Products
                            </button>
                        </div>
                        
                        <div v-else>
                            <div class="cart-items">
                                <div class="cart-item" v-for="item in AppState.cartItems" :key="item.id">
                                    <img :src="item.image" :alt="item.name" class="cart-item-image">
                                    <div class="cart-item-info">
                                        <h4>{{ item.name }}</h4>
                                        <p>${{ item.price.toFixed(2) }} each</p>
                                        <div class="quantity-controls">
                                            <button class="btn btn-sm" @click="updateQuantity(item.id, -1)">-</button>
                                            <span>{{ item.quantity }}</span>
                                            <button class="btn btn-sm" @click="updateQuantity(item.id, 1)">+</button>
                                        </div>
                                    </div>
                                    <div class="cart-item-total">
                                        <strong>${{ (item.price * item.quantity).toFixed(2) }}</strong>
                                        <button class="btn btn-danger btn-sm" @click="removeFromCart(item.id)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="cart-summary">
                                <div class="summary-item">
                                    <span>Subtotal:</span>
                                    <span>${{ getCartTotal().toFixed(2) }}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Shipping:</span>
                                    <span>$5.99</span>
                                </div>
                                <div class="summary-item total">
                                    <span>Total:</span>
                                    <span>${{ (getCartTotal() + 5.99).toFixed(2) }}</span>
                                </div>
                                
                                <button class="btn btn-success btn-lg" @click="checkout">
                                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                                </button>
                                
                                <button class="btn btn-primary" @click="navigateTo('products')">
                                    <i class="fas fa-shopping-bag"></i> Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            methods: {
                updateQuantity(productId, change) {
                    const item = AppState.cartItems.find(item => item.id === productId)
                    if (item) {
                        item.quantity += change
                        if (item.quantity <= 0) {
                            this.removeFromCart(productId)
                        }
                    }
                },
                
                async checkout() {
                    if (!AppState.currentUser) {
                        navigateTo('login')
                        AppState.error = 'Please login to checkout'
                        return
                    }
                    
                    const total = getCartTotal()
                    const confirmed = confirm(`Confirm payment of $${total.toFixed(2)}?`)
                    
                    if (confirmed) {
                        AppState.success = 'Payment processed successfully! Thank you for your purchase.'
                        AppState.cartItems = []
                        setTimeout(() => navigateTo('products'), 2000)
                    }
                }
            }
        },

        // Admin Component
        'admin-view': {
            template: `
                <div class="admin">
                    <div class="card">
                        <h2><i class="fas fa-cog"></i> Admin Dashboard</h2>
                        
                        <div class="admin-tabs">
                            <button class="tab-btn active" @click="activeTab = 'users'">
                                <i class="fas fa-users"></i> Users
                            </button>
                            <button class="tab-btn" @click="activeTab = 'products'">
                                <i class="fas fa-box"></i> Products
                            </button>
                            <button class="tab-btn" @click="activeTab = 'system'">
                                <i class="fas fa-server"></i> System Health
                            </button>
                        </div>
                        
                        <div class="tab-content">
                            <!-- Users Tab -->
                            <div v-if="activeTab === 'users'" class="users-table">
                                <h3>Registered Users</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="user in AppState.users" :key="user.id">
                                            <td>{{ user.id }}</td>
                                            <td>{{ user.username }}</td>
                                            <td>{{ user.email }}</td>
                                            <td>{{ user.first_name }} {{ user.last_name }}</td>
                                            <td><span class="role-badge" :class="user.role">{{ user.role }}</span></td>
                                            <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Products Tab -->
                            <div v-if="activeTab === 'products'" class="products-management">
                                <h3>Product Management</h3>
                                <p>Manage products in the Products view</p>
                                <button class="btn btn-primary" @click="navigateTo('products')">
                                    <i class="fas fa-external-link-alt"></i> Go to Products
                                </button>
                            </div>
                            
                            <!-- System Tab -->
                            <div v-if="activeTab === 'system'" class="system-health">
                                <h3>System Health</h3>
                                <div class="health-status">
                                    <div class="status-card online">
                                        <i class="fas fa-check-circle"></i>
                                        <h4>Frontend</h4>
                                        <p>Vue.js App</p>
                                        <span class="status">Online</span>
                                    </div>
                                    <div class="status-card online">
                                        <i class="fas fa-check-circle"></i>
                                        <h4>API Gateway</h4>
                                        <p>Express.js</p>
                                        <span class="status">Online</span>
                                    </div>
                                    <div class="status-card online">
                                        <i class="fas fa-check-circle"></i>
                                        <h4>User Service</h4>
                                        <p>PostgreSQL</p>
                                        <span class="status">Online</span>
                                    </div>
                                    <div class="status-card online">
                                        <i class="fas fa-check-circle"></i>
                                        <h4>Product Service</h4>
                                        <p>MongoDB</p>
                                        <span class="status">Online</span>
                                    </div>
                                </div>
                                
                                <button class="btn btn-success" @click="seedProducts">
                                    <i class="fas fa-seedling"></i> Seed Sample Products
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            data() {
                return {
                    activeTab: 'users'
                }
            },
            methods: {
                async seedProducts() {
                    try {
                        await fetch(`${API_URL}/products/seed`, {
                            method: 'POST'
                        })
                        await ApiService.getProducts()
                        AppState.success = 'Sample products seeded successfully!'
                    } catch (error) {
                        AppState.error = 'Failed to seed products'
                    }
                }
            },
            async mounted() {
                if (AppState.currentUser?.role === 'admin') {
                    await ApiService.getUsers()
                }
            }
        },

        // Profile Component
        'profile-view': {
            template: `
                <div class="profile">
                    <div class="card">
                        <h2><i class="fas fa-user-circle"></i> My Profile</h2>
                        
                        <div class="profile-info" v-if="AppState.currentUser">
                            <div class="profile-header">
                                <div class="avatar-large">
                                    {{ AppState.currentUser.firstName?.charAt(0) || AppState.currentUser.username.charAt(0) }}
                                </div>
                                <div class="profile-details">
                                    <h3>{{ AppState.currentUser.firstName }} {{ AppState.currentUser.lastName }}</h3>
                                    <p class="username">@{{ AppState.currentUser.username }}</p>
                                    <p class="email">{{ AppState.currentUser.email }}</p>
                                    <span class="role-badge" :class="AppState.currentUser.role">
                                        {{ AppState.currentUser.role }}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="profile-stats">
                                <div class="stat">
                                    <i class="fas fa-shopping-cart"></i>
                                    <h4>{{ AppState.cartItems.length }}</h4>
                                    <p>Cart Items</p>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-box"></i>
                                    <h4>{{ AppState.products.length }}</h4>
                                    <p>Products Available</p>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-calendar"></i>
                                    <h4>{{ new Date().getFullYear() }}</h4>
                                    <p>Member Since</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-actions">
                            <button class="btn btn-primary" @click="navigateTo('products')">
                                <i class="fas fa-shopping-bag"></i> Browse Products
                            </button>
                            <button class="btn btn-warning" @click="navigateTo('cart')">
                                <i class="fas fa-shopping-cart"></i> View Cart
                            </button>
                            <button class="btn btn-danger" @click="logout">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            `
        }
    },

    template: `
        <div id="app">
            <!-- Navigation -->
            <nav>
                <div class="logo" @click="navigateTo('home')">
                    <i class="fas fa-microchip"></i>
                    MicroApp
                </div>
                
                <div class="nav-links">
                    <a href="#" class="nav-link" :class="{ active: AppState.currentView === 'home' }" 
                       @click="navigateTo('home')">
                        <i class="fas fa-home"></i> Home
                    </a>
                    
                    <a href="#" class="nav-link" :class="{ active: AppState.currentView === 'products' }" 
                       @click="navigateTo('products')">
                        <i class="fas fa-shopping-bag"></i> Products
                    </a>
                    
                    <a href="#" class="nav-link" :class="{ active: AppState.currentView === 'cart' }" 
                       @click="navigateTo('cart')">
                        <i class="fas fa-shopping-cart"></i> Cart 
                        <span v-if="AppState.cartItems.length > 0" class="cart-count">
                            {{ AppState.cartItems.length }}
                        </span>
                    </a>
                    
                    <div class="user-info" v-if="AppState.currentUser">
                        <div class="avatar" @click="navigateTo('profile')">
                            {{ AppState.currentUser.firstName?.charAt(0) || AppState.currentUser.username.charAt(0) }}
                        </div>
                        <span>{{ AppState.currentUser.firstName || AppState.currentUser.username }}</span>
                        
                        <a href="#" class="nav-link" @click="logout">
                            <i class="fas fa-sign-out-alt"></i>
                        </a>
                    </div>
                    <div v-else class="auth-buttons">
                        <a href="#" class="nav-link" @click="navigateTo('login')">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </a>
                        <a href="#" class="nav-link" @click="navigateTo('register')">
                            <i class="fas fa-user-plus"></i> Register
                        </a>
                    </div>
                </div>
            </nav>

            <!-- Notifications -->
            <div v-if="AppState.error" class="notification error">
                <i class="fas fa-exclamation-circle"></i> {{ AppState.error }}
                <button @click="AppState.error = null" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div v-if="AppState.success" class="notification success">
                <i class="fas fa-check-circle"></i> {{ AppState.success }}
                <button @click="AppState.success = null" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Main Content -->
            <div class="container">
                <component :is="AppState.currentView + '-view'"></component>
            </div>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <p>Microservices Application - Vue.js + Node.js + PostgreSQL + MongoDB</p>
                    <p>API Gateway: Port 3000 | User Service: Port 3001 | Product Service: Port 3002</p>
                </div>
            </footer>
        </div>
    `,

    async mounted() {
        // Load initial data
        try {
            await ApiService.getProducts()
            
            // Auto-login if token exists
            if (AppState.token) {
                try {
                    await ApiService.getProfile()
                } catch (error) {
                    console.log('Auto-login failed:', error)
                    localStorage.removeItem('token')
                }
            }
        } catch (error) {
            console.error('Initialization error:', error)
        }
    }
})

// Mount the app
app.mount('#app')
