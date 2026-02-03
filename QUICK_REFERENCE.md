# Quick Reference Card

One-page reference for all the fixes and how to deploy.

---

## 🎯 What Was Fixed

| # | Issue | Status | File(s) Changed |
|---|-------|--------|-----------------|
| 1 | Gift logic based on survey_q3 | ✅ FIXED | App.tsx, lib/googleSheets.ts, api/submit-to-sheets.ts |
| 2 | UTM defaults to "direct" | ✅ FIXED | App.tsx, api/submit-to-sheets.ts |
| 3 | Duplicate rows (use email+phone) | ✅ FIXED | api/submit-to-sheets.ts, GOOGLE_APPS_SCRIPT_FINAL.md |
| 4 | Congrats message visibility | ✅ FIXED | components/PrizeReveal.tsx |
| 5 | Loading states | ✅ FIXED | components/EntryPage.tsx, PreClaimModal.tsx |

---

## 📋 Gift Logic Reference

Copy this for your team:

```
1-5 people        → Disc RM288 off AJobThing Voucher
6-10 people       → Disc RM588 off AJobThing Voucher + FREE Billboard Ad
11-30 people      → Disc RM988 off AJobThing Voucher + FREE Billboard Ad
31-100 people     → Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad
100+ people       → Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad
```

---

## 📊 Sheet Structure (A-V)

```
A: timestamp              J: gift                    S: referral_companyname
B: action                 K: click_share_linkedin    T: utm_source
C: entry_point            L: click_share_whatsapp    U: utm_medium
D: company_name           M: click_tngo              V: utm_campaign
E: email ⚠️               N: click_more_huat
F: phone_number ⚠️        O: referral_name
G: survey_q1              P: referral_phone
H: survey_q2              Q: referral_position
I: survey_q3              R: referral_email
```

⚠️ = Used together as unique identifier (no duplicates)

---

## 🚀 Deploy in 5 Minutes

### Step 1: Update Google Apps Script (2 min)
```
1. Open your Google Sheet
2. Extensions → Apps Script
3. Copy from: /GOOGLE_APPS_SCRIPT_FINAL.md
4. Replace YOUR_SPREADSHEET_ID
5. Deploy → New deployment → Web app
6. Copy Web App URL
```

### Step 2: Set Environment Variable (1 min)
```
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add: VITE_GOOGLE_SCRIPT_URL = [Your Web App URL]
```

### Step 3: Deploy (1 min)
```
Option A: Click "Publish" button in v0
Option B: Git push (auto-deploys)
Option C: Vercel Dashboard → Redeploy
```

### Step 4: Test (1 min)
```
1. Submit entry form
2. Complete survey
3. Check sheet → Should have 1 row with all data
4. Submit again → Should UPDATE same row (no duplicate)
```

---

## ✅ Testing Checklist

Quick tests to run:

```
□ New user creates new row
□ Same user updates same row (no duplicate)
□ Gift shows correct value in column J
□ UTM shows "direct" when no params
□ Congrats message clearly visible
□ All buttons show loading states
□ Works on 13" laptop
□ Works on mobile
```

---

## 🐛 Quick Troubleshooting

### Still seeing duplicates?
→ Check Google Apps Script is deployed as Web App
→ Verify script uses email (col E) AND phone (col F)

### Gift column empty?
→ Gift only appears AFTER survey completion
→ Check that survey_q3 has valid headcount value

### UTM showing blank instead of "direct"?
→ Verify App.tsx line 72-74 has `|| 'direct'`
→ Redeploy after change

### Button not showing loading?
→ Check that handler is async: `async (data) => { ... }`
→ Verify button uses `isSubmitting` state

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `/App.tsx` | Main logic, gift calculation, UTM defaults |
| `/api/submit-to-sheets.ts` | API route, duplicate checking, column structure |
| `/components/PrizeReveal.tsx` | Congrats message display |
| `/GOOGLE_APPS_SCRIPT_FINAL.md` | Script for Google Sheets (copy this!) |
| `/DEPLOYMENT_CHECKLIST.md` | Full deployment guide |
| `/FIXES_COMPLETED.md` | Detailed explanation of all fixes |

---

## 💡 How Duplicate Prevention Works

```
Submission 1: email=test@co.com, phone=+60123456789
→ Search sheet for matching email+phone
→ Not found
→ CREATE new row 2

Submission 2: email=test@co.com, phone=+60123456789
→ Search sheet for matching email+phone
→ Found at row 2
→ UPDATE row 2 (no new row)

Submission 3: email=other@co.com, phone=+60987654321
→ Search sheet for matching email+phone
→ Not found (different combo)
→ CREATE new row 3
```

**Key:** BOTH email AND phone must match to update existing row

---

## 📞 Support

If you encounter issues:

1. Check `/DEPLOYMENT_CHECKLIST.md` for detailed steps
2. Check `/FIXES_COMPLETED.md` for what changed
3. Check Google Apps Script logs: Apps Script → Executions
4. Check Vercel logs: Vercel Dashboard → Logs

---

## 🎉 Success Indicators

Your app is working correctly when:

✅ Sheet has proper header row (A-V)
✅ New users create new rows
✅ Existing users update their rows
✅ Gift column populated after survey
✅ UTM columns show "direct" or actual values
✅ No duplicate rows for same email+phone
✅ Congrats message clearly visible
✅ All buttons show loading feedback

---

## 🎊 You're Ready!

All fixes complete. Deploy and celebrate! 🚀🧧

**Quick Deploy:**
```bash
# If using Git
git add .
git commit -m "All fixes complete"
git push

# Or just click "Publish" button
```

**That's it! Huat ah! 🎉**
