# Deployment Ready Checklist

## ✅ All Issues Fixed

### 1. API Routes Fixed
- ✅ Fixed `check-user.ts` API to use proper JWT authentication instead of `require()`
- ✅ All API routes use consistent authentication method
- ✅ Proper error handling implemented

### 2. Features Implemented
- ✅ One-time play restriction (email + phone combination)
- ✅ Live ticker notification showing companies opening angpau
- ✅ Error message: "You've already opened your angpau!"
- ✅ Gift logic based on survey_q3 (headcount)
- ✅ UTM parameters default to "direct"
- ✅ Click tracking for register/login buttons
- ✅ No duplicate rows - updates existing row instead

### 3. UI Optimizations
- ✅ Responsive design for 13" laptops and mobile
- ✅ Thank you page and referral page fit without scrolling
- ✅ Enlarged title and prize images
- ✅ Live ticker positioned at top center
- ✅ All loading states implemented
- ✅ Font sizes maintained

## Environment Variables Required

Make sure these are set in Vercel:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

Note: The `SPREADSHEET_ID` and `SHEET_NAME` are hardcoded in the API files:
- Spreadsheet ID: `1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo`
- Sheet Name: `Ahuathing`

## Google Sheet Structure

Columns A-X (24 columns total):
- A: timestamp
- B: action
- C: entry_point
- D: company_name
- E: email (unique key 1)
- F: phone_number (unique key 2)
- G: survey_q1
- H: survey_q2
- I: survey_q3
- J: gift (auto-calculated based on survey_q3)
- K: click_share_linkedin
- L: click_share_whatsapp
- M: click_tngo
- N: click_more_huat
- O: click_register
- P: click_login
- Q: referral_name
- R: referral_phone
- S: referral_position
- T: referral_email
- U: referral_companyname
- V: utm_source
- W: utm_medium
- X: utm_campaign

## Deployment Steps

1. **Push to GitHub**
   - All changes are ready to commit
   - Create PR from v0 interface

2. **Vercel Deployment**
   - Click "Publish" button in v0
   - OR connect GitHub repo to Vercel
   - Vercel will auto-deploy on push

3. **Set Environment Variables**
   - Go to Vercel Project Settings
   - Navigate to Environment Variables
   - Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Add `GOOGLE_PRIVATE_KEY`
   - Redeploy if needed

4. **Verify Deployment**
   - Test entry form submission
   - Verify duplicate detection works
   - Check Google Sheet updates correctly
   - Test all click tracking

## Testing Checklist

- [ ] Entry form submits successfully
- [ ] Duplicate email/phone shows error message
- [ ] Survey form records gift based on headcount
- [ ] Share buttons track clicks
- [ ] Register/Login buttons track clicks
- [ ] Referral form submits successfully
- [ ] Google Sheet updates same row for returning users
- [ ] Live ticker displays and rotates companies
- [ ] Mobile responsive on all screen sizes
- [ ] 13" laptop displays without scrolling

## Known Configuration

- Framework: Vite + React 19
- API Routes: Vercel Serverless Functions
- Database: Google Sheets (via Sheets API v4)
- Authentication: JWT with Service Account

## Support

If issues occur:
1. Check Vercel function logs
2. Verify environment variables are set
3. Ensure Google Service Account has Sheet access
4. Check console for "[v0]" debug messages

---

✅ **Ready for Production Deployment**
