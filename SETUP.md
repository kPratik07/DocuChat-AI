# Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- GROQ API key

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd DocuChat-AI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file (optional):
```bash
cp .env.example .env
```

Edit `frontend/.env` if needed:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `NODE_ENV` - Environment (development/production)
- `GROQ_API_KEY` - GROQ API key for AI features

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

## Troubleshooting

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check your connection string format
- Verify network connectivity

### API Key Issues
- Verify GROQ API key is valid
- Check API key permissions

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use environment variables from hosting platform
3. Enable CORS for your frontend domain
4. Use HTTPS

### Frontend
1. Update `VITE_API_URL` to production backend URL
2. Build the application:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder

## Support

For issues and questions, please open an issue on GitHub.
