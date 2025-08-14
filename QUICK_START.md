# Quick Start Guide

Get DocuChat AI running in 5 minutes! 🚀

## Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/)

## Option 1: Automatic Startup (Recommended)

### On Windows:
1. Double-click `start.bat`
2. Wait for both servers to start
3. Open your browser to `http://localhost:5173`

### On Mac/Linux:
1. Open terminal in the project folder
2. Run: `./start.sh`
3. Open your browser to `http://localhost:5173`

## Option 2: Manual Startup

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

## First Time Setup

1. **Get OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create account and get API key
   - Copy the key

2. **Configure Backend**:
   - In `backend` folder, create `.env` file
   - Add: `OPENAI_API_KEY=your-actual-api-key`

3. **Restart Backend** if you added the API key

## Test the Application

1. **Upload a PDF**: Drag and drop any PDF file
2. **Ask Questions**: Type questions about the document
3. **Navigate**: Use the PDF viewer controls
4. **Citations**: Click page references to jump to pages

## Troubleshooting

### Common Issues:

- **"Module not found"**: Run `npm install` in both folders
- **"Port already in use"**: Close other applications using ports 5000/5173
- **"OpenAI API error"**: Check your API key in `.env` file
- **"PDF not loading"**: Ensure backend is running on port 5000

### Still Having Issues?

1. Check the full [README.md](README.md)
2. Review the [deployment guide](DEPLOYMENT.md)
3. Ensure Node.js version is 16 or higher

## What's Next?

- **Customize**: Modify colors, add features
- **Deploy**: Follow the [deployment guide](DEPLOYMENT.md)
- **Extend**: Add authentication, user management, etc.

---

🎉 **You're all set!** Your Google NotebookLM clone is ready to use. 