#!/bin/bash

echo "🚀 Kejah Deployment Helper"
echo "=========================="

echo "📋 Pre-deployment Checklist:"
echo "1. ✅ MongoDB Atlas database set up"
echo "2. ✅ Vercel account created"
echo "3. ✅ Code pushed to GitHub"
echo ""

echo "📝 Next Steps:"
echo "1. Deploy Backend:"
echo "   - Create new Vercel project"
echo "   - Set Root Directory to 'backend'"
echo "   - Add environment variables:"
echo "     * MONGODB_URI=your_mongodb_connection_string"
echo "     * JWT_SECRET=your_jwt_secret"
echo "     * NODE_ENV=production"
echo "     * PAYMENT_MODE=demo"
echo ""

echo "2. Deploy Frontend:"
echo "   - Create another Vercel project"
echo "   - Set Root Directory to 'frontend'"
echo "   - Add environment variables:"
echo "     * REACT_APP_API_URL=your_backend_vercel_url"
echo ""

echo "3. Update CORS:"
echo "   - Add FRONTEND_URL to backend environment variables"
echo "   - Redeploy backend"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy deploying!"