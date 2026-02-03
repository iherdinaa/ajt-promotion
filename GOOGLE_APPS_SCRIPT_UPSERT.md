# Google Apps Script - Upsert Implementation

## Important: Update Your Google Apps Script

To prevent duplicate entries, you need to update your Google Apps Script to support **upsert** (update or insert) functionality.

## Updated Script Code

Replace your existing Google Apps Script with this updated version:

```javascript
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Ahuathing');
    const params = e.parameter;
    
    // Check if this is an upsert request
    const action = params.action || 'append';
    const email = params.email;
    
    // Prepare row data
    const rowData = [
      params.timestamp || new Date().toISOString(),
      params.company_name || '',
      params.email || '',
      params.phone_number || '',
      params.survey_q1 || '',
      params.survey_q2 || '',
      params.survey_q3 || '',
      params.click_share_linkedin || 'no',
      params.click_share_whatsapp || 'no',
      params.click_tngo || 'no',
      params.click_more_huat || 'no',
      params.referral_name || '',
      params.referral_phone || '',
      params.referral_position || '',
      params.referral_email || '',
      params.referral_companyname || '',
      params.utm_campaign || '',
      params.utm_source || '',
      params.utm_medium || ''
    ];
    
    if (action === 'upsert' && email) {
      // Find existing row by email (column C, index 3)
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) { // Start at 1 to skip header
        if (data[i][2] === email) { // Email is column C (index 2)
          rowIndex = i + 1; // Convert to 1-indexed
          break;
        }
      }
      
      if (rowIndex > 0) {
        // Update existing row - merge data (keep non-empty values)
        const existingRow = sheet.getRange(rowIndex, 1, 1, rowData.length).getValues()[0];
        const mergedRow = rowData.map((value, index) => {
          // Keep new value if it's not empty, otherwise keep existing
          if (value && value !== '' && value !== 'no') {
            return value;
          }
          return existingRow[index] || value;
        });
        
        sheet.getRange(rowIndex, 1, 1, mergedRow.length).setValues([mergedRow]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, action: 'updated', row: rowIndex }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Append new row if not found or not upsert
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, action: 'inserted' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## How It Works

1. **First Submission**: Creates a new row with user data
2. **Subsequent Submissions**: Finds the existing row by email and updates it
3. **Data Merging**: Preserves existing data and only updates fields that have new values
4. **Click Tracking**: Updates click fields (linkedin, whatsapp, tngo, more_huat) when they occur
5. **Survey & Referral**: Updates these fields when user completes them

## Benefits

✅ **No Duplicates**: Each email only has one row
✅ **Progressive Data**: Data accumulates as user progresses through the app
✅ **Complete Tracking**: All interactions are tracked in a single row
✅ **Easy Analysis**: One row per user makes reporting easier

## Deployment Steps

1. Open your Google Sheets
2. Go to **Extensions** → **Apps Script**
3. Replace the code with the above script
4. Update `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
5. Click **Deploy** → **New Deployment**
6. Select **Web app**
7. Set **Execute as**: Me
8. Set **Who has access**: Anyone
9. Click **Deploy**
10. Copy the Web App URL
11. Add it to your Vercel project as `VITE_GOOGLE_SCRIPT_URL`

## Testing

Test the upsert functionality:

1. Submit the entry form with email `test@example.com`
2. Check that a new row is created
3. Complete the survey
4. Check that the same row is updated (not a new row)
5. Click share buttons and referral
6. Verify all updates go to the same row

## Column Layout

Your sheet should have these columns (A to S):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | company_name | email | phone_number | survey_q1 | survey_q2 | survey_q3 | click_share_linkedin | click_share_whatsapp | click_tngo | click_more_huat | referral_name | referral_phone | referral_position | referral_email | referral_companyname | utm_campaign | utm_source | utm_medium |
