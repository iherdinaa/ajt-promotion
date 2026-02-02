# Google Sheets Integration Setup

This guide explains how to set up the Google Sheets integration for the AJT Promotion app.

## Step 1: Set Up Your Google Sheet

Your Google Sheet should have the following columns in the first row (headers):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | entry_point | company_name | email | phone_number | survey_q1_resignation | survey_q2_hiring | survey_q3_headcount | gift | referral_name | referral_company | referral_email | referral_phone | referral_job_position | utm_source | utm_medium | utm_campaign |

## Step 2: Create Google Apps Script Web App

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo/edit

2. Go to **Extensions > Apps Script**

3. Delete any existing code and paste the following:

```javascript
// Google Apps Script - Web App for receiving form submissions

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet - use your spreadsheet ID
    const ss = SpreadsheetApp.openById('1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo');
    const sheet = ss.getSheetByName('Sheet1'); // Change to your sheet name if different
    
    // Append the data as a new row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.entryPoint || '',
      data.companyName || '',
      data.email || '',
      data.phoneNumber || '',
      data.surveyQ1_resignationFrequency || '',
      data.surveyQ2_hiringPlan || '',
      data.surveyQ3_headcount || '',
      data.gift || '',
      data.referralName || '',
      data.referralCompany || '',
      data.referralEmail || '',
      data.referralPhone || '',
      data.referralJobPosition || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || ''
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'AJT Promotion Webhook is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (Ctrl+S or Cmd+S)

5. Click **Deploy > New deployment**

6. Click the gear icon next to "Select type" and choose **Web app**

7. Configure the deployment:
   - **Description**: AJT Promotion Form Webhook
   - **Execute as**: Me
   - **Who has access**: Anyone

8. Click **Deploy**

9. **Authorize** the app when prompted (click through the warnings for unverified apps)

10. Copy the **Web app URL** that appears (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

## Step 3: Add Environment Variable

Add the following environment variable to your Vercel project:

```
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with your actual deployment ID from Step 2.

## Data Flow

1. **Entry Form Submission** (EntryPage):
   - company_name, email, phone_number are captured
   
2. **Survey Submission** (PreClaimModal):
   - 3 survey questions are captured
   - Gift/prize is determined based on headcount
   - Data is submitted to Google Sheets (without referral info)

3. **Referral Submission** (PrizeReveal - optional):
   - Referral info is captured
   - A new row is added with complete data including referral

## UTM Tracking

The app automatically captures UTM parameters from the URL:
- `utm_source`
- `utm_medium`
- `utm_campaign`

Example URL: `https://your-app.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=cny2026`

## Troubleshooting

1. **Data not appearing**: 
   - Check the Apps Script execution logs (View > Executions)
   - Verify the environment variable is set correctly

2. **CORS errors**: 
   - The app uses `mode: 'no-cors'` to avoid CORS issues with Google Apps Script

3. **Authorization issues**:
   - Re-deploy the Apps Script if you make changes
   - Make sure "Anyone" has access to the web app
