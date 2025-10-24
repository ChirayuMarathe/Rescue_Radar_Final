# 🔧 Netlify 404 Error - Fix Guide

## ✅ Fixes Applied

### 1. **Updated `netlify.toml`**
   - Removed conflicting `edge_functions` config
   - Added proper SPA fallback redirect
   - Fixed API proxy configuration
   - Organized cache headers correctly

### 2. **Enhanced `next.config.js`**
   - Fixed rewrites configuration
   - Added backend domain to allowed image domains
   - Improved static file handling

### 3. **Added Configuration Files**
   - `netlify.json` - Netlify deployment config
   - `vercel.json` - Vercel backup deployment config

## 🚨 Common Netlify 404 Issues & Solutions

### Issue 1: SPA Routes Returning 404
**Problem:** Pages like `/report`, `/reports-map` return 404
**Solution:** ✅ Added SPA fallback in netlify.toml
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  condition = "!req.headers.accept || req.headers.accept.includes(\"text/html\")"
```

### Issue 2: Next.js Plugin Not Active
**Problem:** Netlify doesn't recognize Next.js app
**Solution:** ✅ Ensure `@netlify/plugin-nextjs` is installed and listed in netlify.toml

### Issue 3: API Calls Failing (404)
**Problem:** `/api/...` endpoints return 404
**Solution:** ✅ Updated proxy to `https://rescueradar-backend.vercel.app/api/:splat`

### Issue 4: Static Assets Missing
**Problem:** Images, CSS, JS files not loading
**Solution:** ✅ Configured cache headers for `/_next/static/*`

## 📋 Deployment Checklist

- [ ] Environment variables set in Netlify Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

- [ ] Netlify Build Settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `.next`

- [ ] Node version: 18.20.2 (set in netlify.toml)

- [ ] Netlify Plugins installed:
  - `@netlify/plugin-nextjs`

## 🚀 Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "fix: Netlify 404 configuration"
   git push
   ```

2. **In Netlify Dashboard:**
   - Go to Site Settings → Build & Deploy
   - Verify build command: `npm run build`
   - Verify publish directory: `.next`
   - Add environment variables
   - Trigger redeploy

3. **Test:**
   - Visit your domain (e.g., https://rescueradar.netlify.app)
   - Navigate to `/report` - should work
   - Test API calls - should proxy to backend

## 🔍 Debugging

### Check Build Logs
1. Go to Netlify Dashboard
2. Deploys → Latest Deploy
3. Check "Deploy log" for errors

### Test Locally
```bash
cd frontend
npm run build
npm start
```

### Check Console Errors
Open DevTools (F12) → Console tab to see client-side errors

## ⚡ If Still Getting 404

### Solution A: Clear Cache & Redeploy
1. In Netlify: Deploys → Trigger deploy → Clear cache and deploy site

### Solution B: Check Redirects
1. In Netlify: Deploys → Get logs
2. Look for redirect matching issues
3. Verify `netlify.toml` syntax (use [netlify.toml validator](https://www.netlify.com/docs/netlify-toml-reference/))

### Solution C: Disable Plugin Temporarily
1. Remove `@netlify/plugin-nextjs` from netlify.toml
2. Redeploy
3. If works, issue is with plugin; if not, issue is elsewhere

## 📞 Support

- Netlify Support: https://support.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment/static-exports
- Common Issues: Check Netlify Community Forums

