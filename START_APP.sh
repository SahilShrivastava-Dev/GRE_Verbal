#!/bin/bash

echo "========================================"
echo "  GRE Vocab Builder - Starting App"
echo "========================================"
echo ""

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "[1/4] Installing backend dependencies..."
    cd backend
    npm install
    cd ..
else
    echo "[1/4] Backend dependencies already installed ✓"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[2/4] Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "[2/4] Frontend dependencies already installed ✓"
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "⚠️  WARNING: backend/.env file not found!"
    echo "   Please create backend/.env and add your OpenRouter API key"
    echo "   You can copy from backend/.env.example"
    echo ""
    exit 1
fi

echo "[3/4] Starting backend server..."
echo ""

# Start backend in background
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo "[4/4] Starting frontend..."
echo ""

# Start frontend
cd frontend
npm run dev

# Cleanup: Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null

