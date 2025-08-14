@echo off
echo 🚀 Starting DocuChat AI - Google NotebookLM Clone
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Start backend
echo 🔧 Starting backend server...
cd backend

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found. Creating one with default values...
    echo PORT=5000 > .env
    echo NODE_ENV=development >> .env
    echo OPENAI_API_KEY=your-openai-api-key-here >> .env
    echo ⚠️  Please update the .env file with your OpenAI API key
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

REM Start backend in background
echo 🚀 Starting backend on http://localhost:5000
start "Backend Server" npm run dev

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🔧 Starting frontend server...
cd ..\frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start frontend
echo 🚀 Starting frontend on http://localhost:5173
start "Frontend Server" npm run dev

echo.
echo 🎉 DocuChat AI is starting up!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo.
echo Both servers are now running in separate windows.
echo Close the windows to stop the servers.
echo.
pause 