# 🚀 Grub Frontend Deployment Guide

## Prerequisites

1. **GitHub Account** - For code repository
2. **Netlify Account** - For frontend hosting
3. **Backend Deployed** - Your Node.js backend should be deployed first

## Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

## Step 2: Deploy Backend First

Before deploying the frontend, ensure your backend is deployed to a service like:
- **Heroku** (recommended for beginners)
- **Railway**
- **Render**
- **DigitalOcean App Platform**

Get your backend URL (e.g., `https://your-app.herokuapp.com`)

## Step 3: Configure Environment Variables

1. **Update Backend URL**:
   - Edit `netlify.toml` and replace `https://your-backend-url.herokuapp.com` with your actual backend URL
   - Update `.env.production` with your backend URL

2. **Set up Firebase** (if using):
   - Replace Firebase configuration in `.env.production`

## Step 4: Deploy to Netlify

### Option A: Netlify Dashboard (Recommended)

1. **Login to Netlify**: https://app.netlify.com/
2. **New Site from Git**: Click "New site from Git"
3. **Connect GitHub**: Authorize Netlify to access your repositories
4. **Select Repository**: Choose your `grub-frontend` repository
5. **Configure Build Settings**:
   - **Base directory**: `grub-frontend` (if in monorepo)
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. **Environment Variables**: Add these in Netlify dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
   NEXT_PUBLIC_APP_NAME=Grub Food Distribution
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```
7. **Deploy**: Click "Deploy site"

### Option B: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=out
   ```

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain** in Netlify dashboard
2. **Configure DNS** with your domain provider
3. **Enable HTTPS** (automatic with Netlify)

## Step 6: Test Deployment

1. **Visit your site** at the Netlify URL
2. **Test key features**:
   - User authentication
   - Product browsing
   - Search functionality
   - API connectivity

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### API Connection Issues
- Verify backend URL is correct
- Check CORS settings on backend
- Ensure backend is deployed and accessible

### 404 Errors
- Verify `netlify.toml` redirects are configured
- Check that `out` directory is being published

## Environment Variables Reference

Required variables for production:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
NEXT_PUBLIC_APP_NAME=Grub Food Distribution
NEXT_PUBLIC_APP_VERSION=1.0.0
```

Optional variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_GA_TRACKING_ID=your_id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] API calls work
- [ ] Authentication functions
- [ ] Search works
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Performance is acceptable

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test backend API endpoints directly
4. Check browser console for errors

Your Grub application should now be live! 🎉
