# Deployment Guide

This guide will help you deploy your DocuChat AI application to free cloud platforms.

## Backend Deployment (Render)

### 1. Prepare Backend for Deployment

1. **Remove dev dependencies** from `package.json`:
```bash
cd backend
npm install --production
```

2. **Create a `.env` file** with production values:
```env
PORT=10000
NODE_ENV=production
OPENAI_API_KEY=your-production-openai-api-key
```

### 2. Deploy to Render

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your repository** or upload the backend code
4. **Configure the service**:
   - **Name**: `docuchat-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `10000`

5. **Set Environment Variables**:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `OPENAI_API_KEY`: Your OpenAI API key

6. **Deploy** and wait for the build to complete

## Frontend Deployment (Netlify)

### 1. Prepare Frontend for Deployment

1. **Update API endpoints** in your components to point to your deployed backend:
```javascript
// Change from:
const API_BASE = 'http://localhost:5000';

// To:
const API_BASE = 'https://your-backend-url.onrender.com';
```

2. **Build the project**:
```bash
cd frontend
npm run build
```

### 2. Deploy to Netlify

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Drag and drop** the `dist` folder from your build
3. **Configure custom domain** (optional)
4. **Set environment variables** if needed

## Alternative Deployment Options

### Backend Alternatives

- **Railway**: Similar to Render, good free tier
- **Heroku**: Limited free tier, but reliable
- **Vercel**: Good for serverless functions

### Frontend Alternatives

- **Vercel**: Excellent for React apps
- **GitHub Pages**: Free hosting for static sites
- **Firebase Hosting**: Google's hosting solution

## Environment Variables

### Backend (.env)
```env
PORT=10000
NODE_ENV=production
OPENAI_API_KEY=your-openai-api-key
```

### Frontend (if using environment variables)
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Post-Deployment

### 1. Test Your Application

1. **Upload a PDF** to test the upload functionality
2. **Send a chat message** to test the AI integration
3. **Navigate through pages** to test the PDF viewer
4. **Check citations** to ensure they work properly

### 2. Monitor Performance

1. **Check Render logs** for backend errors
2. **Monitor API usage** in OpenAI dashboard
3. **Test file upload limits** with different PDF sizes

### 3. Update Documentation

1. **Update README.md** with your deployment URLs
2. **Share the application** with others
3. **Document any custom configurations**

## Troubleshooting Deployment

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for syntax errors

2. **Runtime Errors**:
   - Verify environment variables are set
   - Check API endpoints are correct
   - Monitor application logs

3. **CORS Issues**:
   - Ensure backend CORS is configured for your frontend domain
   - Check if HTTPS/HTTP mismatch exists

### Getting Help

1. **Check platform documentation** (Render, Netlify)
2. **Review application logs** for error messages
3. **Test locally** to isolate deployment vs. code issues
4. **Use platform support** if available

## Cost Optimization

### Free Tier Limits

- **Render**: 750 hours/month free
- **Netlify**: 100GB bandwidth/month free
- **OpenAI**: Pay-per-use, monitor usage

### Tips to Stay Free

1. **Monitor API usage** to avoid unexpected charges
2. **Use free tier limits** efficiently
3. **Consider self-hosting** for development/testing

---

Your DocuChat AI application should now be accessible via a public URL! 🚀 