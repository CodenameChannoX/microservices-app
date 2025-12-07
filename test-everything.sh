#!/bin/bash
echo "=== COMPLETE MICROSERVICES TEST ==="
echo ""

echo "1. Testing API Gateway (port 4000)..."
if curl -s http://localhost:4000 > /dev/null; then
  echo "   ✅ SUCCESS:"
  curl -s http://localhost:4000 | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4000
else
  echo "   ❌ FAILED: Cannot connect to API Gateway"
fi
echo ""

echo "2. Testing User Service (port 4001)..."
if curl -s http://localhost:4001 > /dev/null; then
  echo "   ✅ SUCCESS:"
  curl -s http://localhost:4001 | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4001
else
  echo "   ❌ FAILED: Cannot connect to User Service"
fi
echo ""

echo "3. Testing Product Service (port 4002)..."
if curl -s http://localhost:4002 > /dev/null; then
  echo "   ✅ SUCCESS:"
  curl -s http://localhost:4002 | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4002
else
  echo "   ❌ FAILED: Cannot connect to Product Service"
fi
echo ""

echo "4. Testing Order Service (port 4003)..."
if curl -s http://localhost:4003 > /dev/null; then
  echo "   ✅ SUCCESS:"
  curl -s http://localhost:4003 | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4003
else
  echo "   ❌ FAILED: Cannot connect to Order Service"
fi
echo ""

echo "5. Testing Databases..."
echo "   MongoDB (port 27017):"
if docker ps | grep -q mongodb; then
  echo "   ✅ RUNNING"
else
  echo "   ❌ STOPPED"
fi

echo "   PostgreSQL (port 5432):"
if docker ps | grep -q postgres; then
  echo "   ✅ RUNNING"
else
  echo "   ❌ STOPPED"
fi
echo ""

echo "6. All Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== TEST COMPLETE ==="
