# Google Apps Script - Final Implementation Guide

## IMPORTANT: Prevents Duplicate Rows

This script ensures that submissions with the same **email AND phone number** will UPDATE the existing row instead of creating duplicates.

---

## Sheet Column Structure

Your Google Sheet should have these columns in order (A to V):

| Col | Header | Description | Example |
|-----|--------|-------------|---------|
| A | timestamp | Entry creation time | 2026-02-03T10:30:00Z |
| B | action | Action type (optional) | entry |
| C | entry_point | Source (optional) | web |
| D | company_name | Company name | Tech Company Sdn Bhd |
| E | email | User email ⚠️ UNIQUE KEY 1 | user@company.com |
| F | phone_number | Phone with country code ⚠️ UNIQUE KEY 2 | +60123456789 |
| G | survey_q1 | Resignation frequency | Often |
| H | survey_q2 | Hiring plan | Yes |
| I | survey_q3 | Headcount | 11 - 30 people |
| J | gift | Auto-calculated reward | Disc RM988 off AJobThing Voucher + FREE Billboard Ad |
| K | click_share_linkedin | Clicked LinkedIn share | yes |
| L | click_share_whatsapp | Clicked WhatsApp share | yes |
| M | click_tngo | Clicked TnG button | yes |
| N | click_more_huat | Clicked More Huat | yes |
| O | referral_name | Friend's name | John Doe |
| P | referral_phone | Friend's phone | +60198765432 |
| Q | referral_position | Friend's position | HR Manager |
| R | referral_email | Friend's email | john@company.com |
| S | referral_companyname | Friend's company | Another Company |
| T | utm_source | UTM source | direct |
| U | utm_medium | UTM medium | direct |
| V | utm_campaign | UTM campaign | direct |

---

## Complete Google Apps Script Code

Copy this entire script to your Google Apps Script editor:

```javascript
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Ahuathing');
    const params = e.parameter;
    
    // Get email and phone (our unique identifiers)
    const email = params.email || '';
    const phone = params.phone_number || '';
    
    // Prepare row data matching columns A-V
    const rowData = [
      params.timestamp || new Date().toISOString(),           // A: timestamp
      params.action || '',                                     // B: action
      params.entry_point || '',                                // C: entry_point
      params.company_name || '',                               // D: company_name
      email,                                                   // E: email
      phone,                                                   // F: phone_number
      params.survey_q1 || '',                                  // G: survey_q1
      params.survey_q2 || '',                                  // H: survey_q2
      params.survey_q3 || '',                                  // I: survey_q3
      params.gift || '',                                       // J: gift
      params.click_share_linkedin || 'no',                     // K: click_share_linkedin
      params.click_share_whatsapp || 'no',                     // L: click_share_whatsapp
      params.click_tngo || 'no',                               // M: click_tngo
      params.click_more_huat || 'no',                          // N: click_more_huat
      params.referral_name || '',                              // O: referral_name
      params.referral_phone || '',                             // P: referral_phone
      params.referral_position || '',                          // Q: referral_position
      params.referral_email || '',                             // R: referral_email
      params.referral_companyname || '',                       // S: referral_companyname
      params.utm_source || 'direct',                           // T: utm_source (default: direct)
      params.utm_medium || 'direct',                           // U: utm_medium (default: direct)
      params.utm_campaign || 'direct'                          // V: utm_campaign (default: direct)
    ];
    
    // Find existing row by BOTH email AND phone number
    if (email && phone) {
      const data = sheet.getDataRange().getValues();
      let existingRowIndex = -1;
      
      // Search for matching email AND phone (columns E and F, indices 4 and 5)
      for (let i = 1; i < data.length; i++) { // Start at 1 to skip header row
        const rowEmail = data[i][4] || ''; // Column E (index 4)
        const rowPhone = data[i][5] || ''; // Column F (index 5)
        
        if (rowEmail === email && rowPhone === phone) {
          existingRowIndex = i + 1; // Convert to 1-indexed for Google Sheets
          break;
        }
      }
      
      // If row exists, UPDATE it
      if (existingRowIndex > 0) {
        const existingRow = sheet.getRange(existingRowIndex, 1, 1, rowData.length).getValues()[0];
        
        // Merge data: use new value if provided and meaningful, otherwise keep existing
        const mergedRow = rowData.map((newValue, index) => {
          // Always update timestamp (column A)
          if (index === 0) {
            return params.timestamp || new Date().toISOString();
          }
          
          // For click tracking (K, L, M, N), change 'no' to 'yes' if clicked
          if (index >= 10 && index <= 13) { // Columns K-N
            if (newValue === 'yes') return 'yes';
            return existingRow[index] || 'no';
          }
          
          // For other fields, use new value if it's not empty
          if (newValue && newValue !== '' && newValue !== 'no') {
            return newValue;
          }
          
          // Keep existing value if new value is empty
          return existingRow[index] || newValue;
        });
        
        // Write merged data back to the existing row
        sheet.getRange(existingRowIndex, 1, 1, mergedRow.length).setValues([mergedRow]);
        
        Logger.log('Updated existing row: ' + existingRowIndex + ' for ' + email);
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, action: 'updated', row: existingRowIndex })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // No existing row found - APPEND new row
    sheet.appendRow(rowData);
    Logger.log('Appended new row for ' + email);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, action: 'inserted' })
    ).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Key Features

✅ **No Duplicates**: Uses email AND phone number as unique identifiers
✅ **Smart Updates**: Only updates row if BOTH email and phone match
✅ **Progressive Data**: Accumulates data as user progresses through the app
✅ **Click Tracking**: Updates from 'no' to 'yes' when buttons are clicked
✅ **Gift Auto-Calculated**: Gift column (J) is populated based on survey_q3
✅ **UTM Defaults**: If UTM parameters are blank, records as "direct"

---

## Deployment Steps

### Step 1: Open Apps Script Editor
1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**

### Step 2: Paste the Code
1. Delete any existing code
2. Paste the complete code above
3. Replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
   - Find it in your sheet URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`

### Step 3: Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Set these options:
   - **Description**: "AJobThing CNY Promotion Form"
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. Review permissions and click **Authorize access**
6. Copy the **Web app URL**

### Step 4: Add to Vercel
1. Go to your Vercel project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `VITE_GOOGLE_SCRIPT_URL`
   - **Value**: [Paste the Web app URL]
4. Redeploy your app

---

## Testing the Script

### Test 1: New Submission
1. Submit entry form with `test@example.com` and `+60123456789`
2. Check sheet - should create NEW row

### Test 2: Update Same User
1. Complete survey with same email and phone
2. Check sheet - should UPDATE the same row (not create new)
3. Verify gift column (J) is populated

### Test 3: Click Tracking
1. Click LinkedIn share
2. Check sheet - column K should change to "yes"
3. Click WhatsApp share
4. Check sheet - column L should change to "yes"

### Test 4: Different User
1. Submit with `another@example.com` and `+60198765432`
2. Check sheet - should create a NEW row (different email+phone combo)

### Test 5: UTM Tracking
1. Visit site without UTM parameters
2. Submit form
3. Check sheet - columns T, U, V should all say "direct"

---

## Troubleshooting

### Issue: Still Creating Duplicates
- Check that email AND phone are being sent correctly
- Look at sheet columns E and F - verify data format matches
- Check Apps Script logs: **Executions** tab in Apps Script editor

### Issue: Data Not Updating
- Verify the script is deployed as **Web app** (not API executable)
- Check **Who has access** is set to **Anyone**
- Redeploy after any code changes

### Issue: Gift Column Empty
- Gift is calculated in the app based on survey_q3 (headcount)
- Only populated after user completes the survey
- Check that `params.gift` is being sent from the app

---

## How It Works

**Flow:**

1. **User opens angpau** → Creates row with email, phone, company
2. **User completes survey** → Updates same row with survey_q1, q2, q3, and gift
3. **User clicks share** → Updates click_share_linkedin or click_share_whatsapp to "yes"
4. **User clicks More Huat** → Updates click_more_huat to "yes"
5. **User submits referral** → Updates referral_name, email, phone, etc.

**Result:** One clean row per user with all their interactions tracked!

---

## Gift Logic Reference

Based on **survey_q3 (headcount)**, the gift is auto-calculated:

| Headcount | Gift (Column J) |
|-----------|-----------------|
| 1 - 5 people | Disc RM288 off AJobThing Voucher |
| 6 - 10 people | Disc RM588 off AJobThing Voucher + FREE Billboard Ad |
| 11 - 30 people | Disc RM988 off AJobThing Voucher + FREE Billboard Ad |
| 31 - 100 people | Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad |
| 100 people | Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad |

This is calculated in the app and sent to the sheet.
