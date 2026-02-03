# 🚀 Quick Start - Deploy in 5 Minutes

## Step 1: Update Google Apps Script (2 min)

1. Open your Google Sheet
2. **Extensions** → **Apps Script**
3. Copy the code from `/GOOGLE_APPS_SCRIPT_UPSERT.md`
4. Replace your current code
5. Update the Spreadsheet ID in the code
6. **Deploy** → **New Deployment** → **Web app**
7. Set "Execute as: **Me**" and "Who has access: **Anyone**"
8. Copy the Web App URL

## Step 2: Deploy to Vercel (3 min)

### Option A: One-Click (Easiest)
1. Click the **Publish** button in v0 (top right)
2. v0 will handle everything automatically
3. Done! ✅

### Option B: Manual Deploy
1. In Vercel dashboard, import your GitHub repo
2. Framework: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**

## Step 3: Set Environment Variables (1 min)

In your Vercel project settings:

```
VITE_GOOGLE_SCRIPT_URL = [paste your Apps Script URL]
GOOGLE_SERVICE_ACCOUNT_EMAIL = [your service account email]
GOOGLE_PRIVATE_KEY = [your private key]
```

**Important**: After adding variables, redeploy your project!

## Step 4: Test (1 min)

1. Open your deployed URL
2. Fill the entry form → Submit
3. Check Google Sheet → Should see 1 new row
4. Complete survey on the site
5. Check Google Sheet → Same row should be updated (not new row!)
6. ✅ Success!

---

## That's it! 🎉

Your CNY Spin & Win app is now live with:
- ⚡ Fast loading (<1s) on all forms
- 🎯 No duplicate entries
- 📱 Mobile & 13" laptop optimized
- 🚀 Production-ready

---

## Need Help?

- Full details: See `/DEPLOYMENT.md`
- Script code: See `/GOOGLE_APPS_SCRIPT_UPSERT.md`
- All changes: See `/CHANGES_SUMMARY.md`

---

## Quick Troubleshooting

**Buttons not clickable?**
- Hard refresh: Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)

**Creating duplicate rows?**
- Check that Google Apps Script was updated
- Verify the script is deployed as Web app

**Slow submissions?**
- Check your internet connection
- Verify Google Apps Script URL is correct

**Mobile issues?**
- Clear cache on mobile browser
- Test in incognito/private mode first
