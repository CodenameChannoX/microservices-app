#!/bin/bash

echo "Setting up Microservices Development Environment..."

# Update packages
apt-get update

# Install additional tools
apt-get install -y \
    postgresql-client \
    mongodb-clients \
    curl \
    wget \
    git \
    htop \
    net-tools

# Create workspace directory
mkdir -p /workspace

# Setup complete
echo "Setup complete!"
echo "Services available at:"
echo "- Frontend: http://localhost:8080"
echo "- API Gateway: http://localhost:3000"
echo "- User Service: http://localhost:3001"
echo "- Product Service: http://localhost:3002"
echo "- PostgreSQL: localhost:5432"
echo "- MongoDB: localhost:27017"
