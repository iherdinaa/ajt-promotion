# 🧪 Testing Checklist - Verify Everything Works

## Pre-Deployment Testing

### 1. Loading States (All buttons should show loading)

#### Entry Form
- [ ] Click "OPEN ANGPAU" button
- [ ] Button text changes to "SUBMITTING..."
- [ ] Spinner icon appears
- [ ] Button is disabled during submission
- [ ] Loading disappears after < 1 second
- [ ] Form transitions to game page

#### Survey Form (PreClaimModal)
- [ ] Answer all 3 survey questions
- [ ] Click "REVEAL REWARD" button
- [ ] Button text changes to "LOADING..."
- [ ] Spinner icon appears
- [ ] Button is disabled during submission
- [ ] Loading completes quickly
- [ ] Prize reveal page shows

#### Referral Form
- [ ] Fill in referral details
- [ ] Click "Submit Referral" button
- [ ] Button shows "Submitting..." with spinner
- [ ] Button is disabled during submission
- [ ] Success message appears
- [ ] Shows internship reward

### 2. No Duplicate Rows

#### Test Scenario 1: Same Email, Multiple Submissions
- [ ] Submit entry form with email: `test@example.com`
- [ ] Check Google Sheet → Should see 1 new row
- [ ] Complete survey on the app
- [ ] Check Google Sheet → Same row updated (survey fields filled)
- [ ] Click share buttons (LinkedIn, WhatsApp)
- [ ] Check Google Sheet → Same row updated (click fields = "yes")
- [ ] Submit referral
- [ ] Check Google Sheet → Same row updated (referral fields filled)
- [ ] **RESULT**: Only 1 row for `test@example.com` ✅

#### Test Scenario 2: Different Email
- [ ] Submit entry form with email: `test2@example.com`
- [ ] Check Google Sheet → Should see NEW row (total 2 rows)
- [ ] Complete the flow for this user
- [ ] Check Google Sheet → Only the new row updates
- [ ] **RESULT**: 2 rows total, each email has 1 row ✅

### 3. Responsive Design

#### Desktop (13" Laptop - 1280x800)
- [ ] Open in Chrome DevTools, set viewport to 1280x800
- [ ] All content fits on screen without horizontal scroll
- [ ] Form is not too large or too small
- [ ] Images load properly
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] Spacing looks good

#### Tablet (768x1024)
- [ ] Switch to tablet viewport
- [ ] Layout adapts properly
- [ ] All elements visible
- [ ] Touch targets are large enough (min 44x44px)
- [ ] No overlapping elements

#### Mobile (375x667 - iPhone SE)
- [ ] Switch to mobile viewport
- [ ] Content fits on screen
- [ ] Floating vouchers hidden on mobile (performance)
- [ ] Form fields are easy to tap
- [ ] Buttons are full width and easy to tap
- [ ] Text is readable (not too small)
- [ ] Scrolling is smooth

### 4. Performance

#### Load Time
- [ ] Open app in incognito mode
- [ ] Measure load time (Network tab)
- [ ] Should be < 3 seconds
- [ ] Preloader shows while loading
- [ ] Preloader disappears when ready

#### Form Submission Speed
- [ ] Submit entry form
- [ ] Time the submission
- [ ] Should complete in < 1 second
- [ ] No hanging or freezing

#### Animation Performance
- [ ] Watch floating vouchers
- [ ] Animations should be smooth (not choppy)
- [ ] No lag when hovering over elements
- [ ] Transitions feel snappy

### 5. Browser Compatibility

#### Chrome
- [ ] All features work
- [ ] Forms submit correctly
- [ ] Animations smooth
- [ ] Layout correct

#### Safari (Desktop)
- [ ] All features work
- [ ] Forms submit correctly
- [ ] Animations smooth
- [ ] Layout correct

#### Safari (Mobile/iOS)
- [ ] All features work
- [ ] Touch interactions work
- [ ] Forms submit correctly
- [ ] Layout correct

#### Firefox
- [ ] All features work
- [ ] Forms submit correctly
- [ ] Layout correct

### 6. Edge Cases

#### Empty Form Submission
- [ ] Try submitting entry form without filling fields
- [ ] Should show HTML5 validation errors
- [ ] Should not submit

#### Network Error Handling
- [ ] Open DevTools Network tab
- [ ] Set to "Offline" mode
- [ ] Try submitting form
- [ ] App handles error gracefully
- [ ] No crash or blank screen

#### Rapid Clicking
- [ ] Click submit button multiple times rapidly
- [ ] Should only submit once (disabled state prevents duplicates)
- [ ] No multiple rows created

### 7. Google Sheets Integration

#### Data Integrity
- [ ] Check that all form fields map to correct columns
- [ ] Timestamp is recorded correctly
- [ ] UTM parameters are captured (if in URL)
- [ ] Click tracking works (yes/no values)
- [ ] Referral data is captured

#### Update Logic
- [ ] Verify that updates preserve existing data
- [ ] Empty fields don't overwrite existing values
- [ ] New data correctly updates rows

---

## Post-Deployment Testing

### Production Environment
- [ ] Visit your deployed URL
- [ ] Run through entire flow
- [ ] Check Google Sheet updates
- [ ] Test on real mobile device
- [ ] Test on different screen sizes
- [ ] Share link with colleague for testing

### Monitoring
- [ ] Check Vercel deployment logs for errors
- [ ] Monitor Google Sheet for duplicates
- [ ] Check form submission success rate

---

## Sign-off

### Tested By: ________________

### Date: ________________

### Environment:
- [ ] Local Development
- [ ] Vercel Preview
- [ ] Production

### Overall Status:
- [ ] ✅ All tests passed - Ready for launch!
- [ ] ⚠️ Minor issues - Can launch with notes
- [ ] ❌ Major issues - Needs fixes before launch

### Notes:
```
[Add any observations or issues here]
```

---

## Quick Fix Guide

**If duplicates appear:**
→ Check Google Apps Script has upsert code
→ Verify script is deployed as Web app

**If buttons don't work:**
→ Hard refresh browser
→ Check browser console for errors
→ Verify all environment variables set

**If slow:**
→ Check network connection
→ Verify Google Apps Script URL correct
→ Check Vercel deployment logs
