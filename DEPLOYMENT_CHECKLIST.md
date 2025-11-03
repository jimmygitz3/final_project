# Vercel Deployment Checklist

## Pre-Deployment ✅

- [ ] MongoDB Atlas cluster created
- [ ] Database user with read/write permissions created
- [ ] MongoDB connection string obtained
- [ ] Vercel account created
- [ ] Code pushed to GitHub repository
- [ ] All environment variables identified

## Backend Deployment ✅

- [ ] Create new Vercel project
- [ ] Set root directory to `backend`
- [ ] Add environment variables:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PAYMENT_MODE=demo`
- [ ] Deploy and test API health endpoint
- [ ] Note backend URL for frontend configuration

## Frontend Deployment ✅

- [ ] Update `frontend/.env.production` with backend URL
- [ ] Create new Vercel project
- [ ] Set root directory to `frontend`
- [ ] Add environment variables:
  - [ ] `REACT_APP_API_URL` (backend URL)
- [ ] Deploy and test frontend

## Post-Deployment ✅

- [ ] Update backend CORS settings with frontend URL
- [ ] Add `FRONTEND_URL` to backend environment variables
- [ ] Redeploy backend
- [ ] Test complete application flow:
  - [ ] User registration
  - [ ] User login
  - [ ] Create listing (landlord)
  - [ ] Browse listings (tenant)
  - [ ] Demo payment flow
- [ ] Monitor deployment logs for errors

## Optional Enhancements ✅

- [ ] Set up custom domain
- [ ] Configure Vercel Analytics
- [ ] Set up monitoring and alerts
- [ ] Configure automatic deployments from GitHub

## Troubleshooting ✅

If issues occur:
- [ ] Check Vercel deployment logs
- [ ] Verify all environment variables are set
- [ ] Test API endpoints individually
- [ ] Check MongoDB Atlas connection and IP whitelist
- [ ] Verify CORS configuration

---

**Deployment URLs:**
- Backend: `https://your-backend.vercel.app`
- Frontend: `https://your-frontend.vercel.app`

**Test Credentials:**
- Email: test@test.com
- Password: test123