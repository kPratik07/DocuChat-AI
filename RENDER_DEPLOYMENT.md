# Render Deployment Guide

## Prerequisites
- GitHub account with your repository
- Render account (sign up at https://render.com)
- MongoDB Atlas database
- GROQ API key

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push render.yaml to GitHub:**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select `DocuChat-AI` repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables:**
   After deployment starts, go to each service and add:
   
   **Backend Service:**
   - `MONGO_URI`: Your MongoDB connection string
   - `GROQ_API_KEY`: Your GROQ API key
   - `JWT_SECRET`: Auto-generated (or set your own)
   - `PORT`: 10000 (auto-set)
   - `NODE_ENV`: production (auto-set)

4. **Update Frontend API URL:**
   - Go to Frontend service
   - Update `VITE_API_URL` with your backend URL:
     `https://docuchat-ai-backend.onrender.com`

### Option 2: Manual Deployment

#### Deploy Backend:

1. **Create New Web Service:**
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repository
   - Select `DocuChat-AI` repository
   - Configure:
     - **Name**: `docuchat-ai-backend`
     - **Region**: Oregon (or closest to you)
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

2. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   GROQ_API_KEY=<your-groq-api-key>
   ```

3. **Deploy** and wait for it to complete

#### Deploy Frontend:

1. **Create New Static Site:**
   - Dashboard → "New" → "Static Site"
   - Connect GitHub repository
   - Select `DocuChat-AI` repository
   - Configure:
     - **Name**: `docuchat-ai-frontend`
     - **Region**: Oregon
     - **Branch**: `main`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Plan**: Free

2. **Add Environment Variable:**
   ```
   VITE_API_URL=https://docuchat-ai-backend.onrender.com
   ```
   (Replace with your actual backend URL)

3. **Deploy** and wait for it to complete

## Post-Deployment

### 1. Update CORS Settings

Update `backend/index.js` to allow your frontend domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://docuchat-ai-frontend.onrender.com' // Add your frontend URL
  ],
  credentials: true
};
```

### 2. Test the Application

1. Visit your frontend URL: `https://docuchat-ai-frontend.onrender.com`
2. Upload a PDF
3. Test the chat functionality

### 3. Monitor Logs

- Go to each service dashboard
- Click "Logs" to see real-time logs
- Check for any errors

## Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free (enough for 1 service running 24/7)

### Uploads Directory:
- Uploaded files are stored in memory on Render
- Files are lost when service restarts
- Consider using cloud storage (AWS S3, Cloudinary) for production

### Database:
- Use MongoDB Atlas (free tier available)
- Whitelist Render's IP or use 0.0.0.0/0 (all IPs)

## Troubleshooting

### Backend won't start:
- Check environment variables are set correctly
- Check logs for errors
- Verify MongoDB connection string

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Build fails:
- Check Node version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

## Custom Domain (Optional)

1. Go to service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

## Monitoring

- Enable "Auto-Deploy" for automatic deployments on push
- Set up health checks
- Monitor service metrics in dashboard

## Cost Optimization

Free tier includes:
- 750 hours/month per service
- 100 GB bandwidth
- Automatic SSL certificates

For production, consider upgrading to paid plans for:
- No spin-down
- More resources
- Priority support

---

Your application should now be live! 🚀

**Frontend URL**: https://docuchat-ai-frontend.onrender.com
**Backend URL**: https://docuchat-ai-backend.onrender.com
