# Kejah - Vercel Deployment Guide

This guide will help you deploy the Kejah student housing platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub

## Deployment Steps

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account and cluster
2. Create a database user with read/write permissions
3. Get your connection string (it should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/kejah?retryWrites=true&w=majority
   ```

### 2. Deploy Backend API

1. **Create a new Vercel project for the backend:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set the **Root Directory** to `backend`
   - Click "Deploy"

2. **Set Environment Variables for Backend:**
   In your Vercel backend project dashboard, go to Settings > Environment Variables and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kejah?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   PAYMENT_MODE=demo
   ```

3. **Note your backend URL** (e.g., `https://your-backend-api.vercel.app`)

### 3. Deploy Frontend

1. **Update Frontend Environment Variables:**
   - Edit `frontend/.env.production`
   - Replace `https://your-backend-api.vercel.app` with your actual backend URL

2. **Create a new Vercel project for the frontend:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository again
   - Set the **Root Directory** to `frontend`
   - Click "Deploy"

3. **Set Environment Variables for Frontend:**
   In your Vercel frontend project dashboard, go to Settings > Environment Variables and add:
   ```
   REACT_APP_API_URL=https://your-backend-api.vercel.app
   ```

### 4. Update CORS Settings

After deployment, update the CORS settings in your backend:

1. Go to your backend Vercel project
2. Update the environment variables to include your frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

## Project Structure for Vercel

```
kejah/
├── backend/
│   ├── api/
│   │   └── index.js          # Vercel API entry point
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── server.js             # Modified for Vercel
│   ├── vercel.json           # Backend Vercel config
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.production       # Production environment variables
│   ├── package.json
│   └── build/                # Generated after build
├── vercel.json               # Root Vercel config (for frontend)
└── DEPLOYMENT_GUIDE.md
```

## Environment Variables Summary

### Backend Environment Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kejah
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
PAYMENT_MODE=demo
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Frontend Environment Variables
```
REACT_APP_API_URL=https://your-backend-api.vercel.app
```

## Testing Your Deployment

1. **Test Backend API:**
   - Visit `https://your-backend-api.vercel.app/api/health`
   - Should return: `{"status":"OK","message":"Kejah API is running"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try registering a new account
   - Test login functionality
   - Create a test listing

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Make sure FRONTEND_URL is set in backend environment variables
   - Check that the frontend URL in CORS settings matches your actual deployment URL

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Ensure database user has proper permissions
   - Check if your IP is whitelisted (or use 0.0.0.0/0 for all IPs)

3. **Environment Variables Not Loading:**
   - Redeploy after adding environment variables
   - Check variable names match exactly (case-sensitive)

4. **Build Failures:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

## Post-Deployment Steps

1. **Custom Domain (Optional):**
   - Add your custom domain in Vercel project settings
   - Update environment variables with new domain

2. **Monitoring:**
   - Set up Vercel Analytics
   - Monitor function execution times
   - Check error logs regularly

3. **Security:**
   - Use strong JWT secrets
   - Regularly rotate API keys
   - Monitor for unusual activity

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check MongoDB Atlas connection and permissions

Happy deploying! 🚀