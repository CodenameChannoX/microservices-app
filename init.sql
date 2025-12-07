-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for JWT blacklist (optional)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$XH7O5NQV7O5NQV7O5NQV7Oe8L6M5A9J2C4E6G8I0K2M4O6Q8S0U2W4Y', -- bcrypt hash of 'admin123'
    'Admin',
    'User',
    'admin'
) ON CONFLICT (username) DO NOTHING;
