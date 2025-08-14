#!/bin/bash

echo "🚀 Starting DocuChat AI - Google NotebookLM Clone"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one with default values..."
    echo "PORT=5000" > .env
    echo "NODE_ENV=development" >> .env
    echo "OPENAI_API_KEY=your-openai-api-key-here" >> .env
    echo "⚠️  Please update the .env file with your OpenAI API key"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
echo "🚀 Starting backend on http://localhost:5000"
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🔧 Starting frontend server..."
cd ../frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 DocuChat AI is starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 