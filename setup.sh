#!/bin/bash
# =====================================================
# 🏸 BADMINTON TOURNAMENT SYSTEM - AUTO SETUP SCRIPT
# =====================================================
# Run this script to install all dependencies at once
# Usage: bash setup.sh

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  🏸 BADMINTON TOURNAMENT SYSTEM SETUP       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo "✅ npm $(npm -v) found"
echo ""

# Install Backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed!"
echo ""

# Install Frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed!"
echo ""

echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ SETUP COMPLETE!                          ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                              ║"
echo "║  To START the app:                           ║"
echo "║                                              ║"
echo "║  Terminal 1 (Backend):                       ║"
echo "║    cd backend && npm run dev                 ║"
echo "║                                              ║"
echo "║  Terminal 2 (Frontend):                      ║"
echo "║    cd frontend && npm start                  ║"
echo "║                                              ║"
echo "║  Then open: http://localhost:3000            ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
