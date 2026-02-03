# Deployment Checklist - Ready for Production

## Pre-Deployment Checklist

### ✅ 1. Google Sheets Setup

- [ ] Create Google Sheet with name "Ahuathing"
- [ ] Add header row with columns A-V:
  ```
  timestamp | action | entry_point | company_name | email | phone_number | survey_q1 | survey_q2 | survey_q3 | gift | click_share_linkedin | click_share_whatsapp | click_tngo | click_more_huat | referral_name | referral_phone | referral_position | referral_email | referral_companyname | utm_source | utm_medium | utm_campaign
  ```

### ✅ 2. Google Apps Script Setup

- [ ] Open Extensions → Apps Script in your Google Sheet
- [ ] Copy code from `/GOOGLE_APPS_SCRIPT_FINAL.md`
- [ ] Replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
- [ ] Deploy as Web App:
  - Execute as: **Me**
  - Who has access: **Anyone**
- [ ] Copy the Web App URL

### ✅ 3. Environment Variables

Add to Vercel project settings:

- [ ] `VITE_GOOGLE_SCRIPT_URL` - Your Google Apps Script Web App URL
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email (if using API)
- [ ] `GOOGLE_PRIVATE_KEY` - Google private key (if using API)

### ✅ 4. Code Verification

All these fixes are implemented:

- [x] Gift logic based on survey_q3 (headcount)
- [x] UTM parameters default to "direct" if blank
- [x] Duplicate prevention using email AND phone
- [x] "Congrats you won" visibility improved
- [x] Loading states on all buttons
- [x] Responsive for 13" laptops and mobile

---

## Deployment Steps

### Step 1: Commit Your Changes

```bash
git add .
git commit -m "Fix: Gift logic, UTM defaults, duplicate prevention, UI improvements"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: From Vercel Dashboard**
1. Go to your Vercel project
2. Click **Deployments** tab
3. Find latest deployment
4. Click **Redeploy**

**Option B: Auto-deploy**
- Push to GitHub and Vercel auto-deploys

**Option C: Use the Publish button in v0**
- Click **Publish** in the top right
- Connect to Vercel project
- Deploy directly

### Step 3: Verify Environment Variables

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify all required variables are set
3. Click **Redeploy** if you just added variables

---

## Post-Deployment Testing

### Test 1: New User Entry ✅
1. Visit your deployed site
2. Fill entry form with:
   - Company: Test Company
   - Email: test1@example.com
   - Phone: 123456789
3. Click "OPEN ANGPAU"
4. **Expected**: Button shows "SUBMITTING..." then proceeds
5. **Check Sheet**: New row created with email and phone

### Test 2: Survey & Gift Calculation ✅
1. Continue from Test 1
2. Complete survey with "11 - 30 people" for headcount
3. Click "REVEAL REWARD"
4. **Expected**: 
   - Button shows "LOADING..."
   - Congrats message clearly visible
   - Gift shown: RM988 voucher + Billboard
5. **Check Sheet**: Same row updated with:
   - survey_q3: "11 - 30 people"
   - gift: "Disc RM988 off AJobThing Voucher + FREE Billboard Ad"

### Test 3: Click Tracking ✅
1. Continue from Test 2
2. Click LinkedIn share button
3. Click WhatsApp share button
4. Click "WANT MORE HUAT?"
5. **Check Sheet**: Same row updated with:
   - click_share_linkedin: yes
   - click_share_whatsapp: yes
   - click_more_huat: yes

### Test 4: Referral Submission ✅
1. Continue from Test 3
2. Fill referral form
3. Submit
4. **Check Sheet**: Same row updated with referral data

### Test 5: No Duplicates ✅
1. Refresh the page
2. Submit entry form with SAME email and phone as Test 1
3. Complete survey again
4. **Check Sheet**: Should UPDATE existing row, NOT create new row
5. **Verify**: Only ONE row exists for test1@example.com

### Test 6: Different User ✅
1. Submit with DIFFERENT email: test2@example.com
2. Complete full flow
3. **Check Sheet**: NEW row created (different user)

### Test 7: UTM Tracking ✅
1. Visit site without UTM parameters: `https://yoursite.com`
2. Submit entry form
3. **Check Sheet**: 
   - utm_source: direct
   - utm_medium: direct
   - utm_campaign: direct

### Test 8: Responsive Design ✅
1. Test on 13" laptop (1280px width)
2. **Expected**: All content fits without horizontal scroll
3. Test on mobile (375px width)
4. **Expected**: All elements properly sized and readable

### Test 9: Loading Performance ✅
1. Open DevTools → Network tab
2. Reload page
3. **Expected**: Page loads in < 3 seconds
4. Submit form
5. **Expected**: Response in < 1 second

---

## Issue Resolution

### Issue: Button Still Shows "No changes to publish"

**Solution:**
1. This is normal if code is already pushed to GitHub
2. Changes are deployed automatically
3. Check **Deployments** tab in Vercel to see latest deployment
4. If needed, manually trigger redeploy

### Issue: Sheet Still Creating Duplicates

**Cause:** Google Apps Script not updated or not using email+phone

**Solution:**
1. Verify script from `/GOOGLE_APPS_SCRIPT_FINAL.md` is deployed
2. Check script logs: Apps Script → Executions
3. Verify search logic uses BOTH email (column E) and phone (column F)
4. Test with console.log to see what's being matched

### Issue: Gift Column Empty

**Cause:** Gift only populated after survey completion

**Solution:**
1. User must complete survey (select headcount)
2. Gift is calculated in App.tsx based on survey_q3
3. Check that `determineGift()` function is being called
4. Verify gift value is in submission data

### Issue: UTM Shows Empty Instead of "direct"

**Cause:** Frontend not defaulting to "direct"

**Solution:**
1. Check App.tsx line 72-74
2. Should have: `|| 'direct'` for each UTM parameter
3. Verify change is deployed

---

## Monitoring

### Check Sheet Regularly
- Monitor for duplicate rows
- Verify gift column is populated correctly
- Check UTM tracking is working

### Check Vercel Logs
1. Go to Vercel project
2. Click **Logs** tab
3. Look for errors or issues

### Check Google Apps Script Logs
1. Open Apps Script editor
2. Click **Executions** tab
3. Review any failures

---

## Success Criteria

✅ **All checkboxes above completed**
✅ **No duplicate rows in sheet for same email+phone**
✅ **Gift column populated correctly based on headcount**
✅ **UTM parameters show "direct" when not provided**
✅ **All buttons show loading states**
✅ **"Congrats you won" message clearly visible**
✅ **Responsive on 13" laptops and mobile**
✅ **Page loads fast (< 3s)**
✅ **Form submissions fast (< 1s)**

---

## Ready to Launch! 🚀

Once all tests pass, your CNY Promotion is ready for production!

**Next Steps:**
1. Share the production URL with your team
2. Monitor the Google Sheet for entries
3. Track conversion rates via the sheet data
4. Celebrate Huat! 🎉🧧
