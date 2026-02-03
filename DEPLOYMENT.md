# Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy
1. Click the **Publish** button in the top right of v0
2. This will automatically deploy your app to Vercel with all environment variables configured

### Option 2: Manual Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables Required

Make sure these environment variables are set in your Vercel project:

### For Google Sheets Integration:
- `VITE_GOOGLE_SCRIPT_URL` - Your Google Apps Script web app URL
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email (for API route)
- `GOOGLE_PRIVATE_KEY` - Service account private key (for API route)

### Setting Environment Variables:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable with its value
4. Redeploy your project

## Build Configuration

The project uses:
- **Framework**: Vite + React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher

## Post-Deployment Checklist

✅ All environment variables are set
✅ Google Sheets integration is working
✅ Test the form submission
✅ Test on mobile devices
✅ Check loading times (should be < 3s)
✅ Verify all buttons are clickable
✅ Test responsive design on different screen sizes

## Troubleshooting

### Button Not Clickable
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

### Slow Sheet Updates
- Verify `VITE_GOOGLE_SCRIPT_URL` is correct
- Check Google Apps Script deployment is active
- Ensure Apps Script has proper permissions

### Mobile Issues
- Test with responsive design tools in Chrome DevTools
- Verify viewport meta tag is present
- Check touch interactions work properly

## Performance Optimization

Current optimizations implemented:
- ✅ Preconnect to CDNs for faster loading
- ✅ Optimized font loading (reduced weights)
- ✅ Reduced animation complexity
- ✅ Added loading states to all forms
- ✅ Implemented upsert logic (no duplicates)
- ✅ Added 5s timeout for API calls
- ✅ Optimized for 13" laptops (1280-1440px)
- ✅ Mobile-first responsive design

## Support

For deployment issues, contact Vercel support or check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
