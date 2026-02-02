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
// Handles GET requests with URL parameters (works better with CORS)

var SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name

// Headers for the spreadsheet
var HEADERS = [
  'timestamp',
  'entry_point', 
  'company_name',
  'email',
  'phone_number',
  'survey_q1_resignation',
  'survey_q2_hiring',
  'survey_q3_headcount',
  'gift',
  'referral_name',
  'referral_company',
  'referral_email',
  'referral_phone',
  'referral_job_position',
  'utm_source',
  'utm_medium',
  'utm_campaign'
];

// Ensure headers exist in the sheet
function ensureHeaders(sheet) {
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var hasHeaders = firstRow[0] !== '';
  
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    // Make headers bold
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

// Handle GET requests with URL parameters
function doGet(e) {
  try {
    var params = e.parameter;
    
    // If no data params, just return status
    if (!params.timestamp && !params.email) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'OK', message: 'AJT Promotion Webhook is running' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.getSheets()[0]; // Fallback to first sheet
    }
    
    // Ensure headers exist
    ensureHeaders(sheet);
    
    // Append the data as a new row
    sheet.appendRow([
      params.timestamp || new Date().toISOString(),
      params.entryPoint || '',
      params.companyName || '',
      params.email || '',
      params.phoneNumber || '',
      params.surveyQ1_resignationFrequency || '',
      params.surveyQ2_hiringPlan || '',
      params.surveyQ3_headcount || '',
      params.gift || '',
      params.referralName || '',
      params.referralCompany || '',
      params.referralEmail || '',
      params.referralPhone || '',
      params.referralJobPosition || '',
      params.utmSource || '',
      params.utmMedium || '',
      params.utmCampaign || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Also handle POST requests (backup method)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    ensureHeaders(sheet);
    
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
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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

**IMPORTANT**: If you already have a deployment, you must create a **NEW deployment** after updating the code. Go to **Deploy > New deployment** (not "Manage deployments") to get a new URL.

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
