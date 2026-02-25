#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     🏸 BADMINTON TOURNAMENT PRO - AUTO INSTALLER              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✅ MongoDB CLI found"
else
    echo "⚠️  MongoDB CLI not found - you can use MongoDB Atlas (cloud)"
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ INSTALLATION COMPLETE                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Choose database option:"
echo ""
echo "   OPTION A: MongoDB Atlas (Cloud - Recommended)"
echo "   ────────────────────────────────────────────────────"
echo "   • Go to https://www.mongodb.com/cloud/atlas"
echo "   • Create free cluster (512MB free forever)"
echo "   • Get connection string"
echo "   • Edit backend/server.js line 18-22"
echo "   • Replace 'mongodb://localhost:27017/badminton-tournament'"
echo "   • With your Atlas connection string"
echo ""
echo "   OPTION B: Local MongoDB"
echo "   ────────────────────────────────────────────────────"
echo "   • Install MongoDB locally"
echo "   • Start: mongod"
echo "   • Edit backend/server.js line 18-22"
echo "   • Uncomment the mongoose.connect block"
echo ""
echo "   OPTION C: Skip Database (Frontend Only)"
echo "   ────────────────────────────────────────────────────"
echo "   • Frontend will work without backend"
echo "   • Use mock data for demo"
echo ""
echo "2️⃣  Start the servers:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3️⃣  Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4️⃣  Create first organization:"
echo "   Click 'Create Organization →'"
echo "   Fill form → Auto-login as Admin"
echo ""
echo "═══════════════════════════════════════════════════════════════"

