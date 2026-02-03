import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = '1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo';
const SHEET_NAME = 'Ahuathing';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Create JWT and get access token
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google credentials');
  }

  // Create JWT header and claim
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Base64url encode
  const base64urlEncode = (obj: object) => {
    const str = JSON.stringify(obj);
    const base64 = Buffer.from(str).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerEncoded = base64urlEncode(header);
  const claimEncoded = base64urlEncode(claim);
  const signatureInput = `${headerEncoded}.${claimEncoded}`;

  // Sign with private key
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(privateKey, 'base64');
  const signatureEncoded = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt = `${signatureInput}.${signatureEncoded}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Find row by email
async function findRowByEmail(accessToken: string, email: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:R`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const rows = data.values || [];
  
  // Find row with matching email (email is column 5, index 4)
  for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
    if (rows[i][4] === email) {
      return i + 1; // Return 1-indexed row number
    }
  }
  
  return null;
}

// Update existing row
async function updateRow(accessToken: string, rowNumber: number, rowData: string[]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${rowNumber}:R${rowNumber}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update row: ${errorText}`);
  }
}

// Append new row to Google Sheet
async function appendToSheet(accessToken: string, rowData: string[]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:R:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to append to sheet: ${errorText}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('[v0] API route called');

  try {
    const data = req.body;
    console.log('[v0] Received data:', JSON.stringify(data));

    // Check environment variables
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY;
    console.log('[v0] Has service account email:', hasEmail);
    console.log('[v0] Has private key:', hasKey);

    if (!hasEmail || !hasKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Google credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.',
      });
    }

    // Get access token
    console.log('[v0] Getting access token...');
    const accessToken = await getAccessToken();
    console.log('[v0] Got access token');

    // Prepare row data matching the headers
    // Headers: timestamp, action, entry_point, company_name, email, phone_number, survey_q1, survey_q2, survey_q3, gift, referral_name, referral_company, referral_email, referral_phone, referral_position, utm_source, utm_medium, utm_campaign
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.action || '',
      data.entry_point || '',
      data.company_name || '',
      data.email || '',
      data.phone_number || '',
      data.survey_q1 || '',
      data.survey_q2 || '',
      data.survey_q3 || '',
      data.gift || '',
      data.referral_name || '',
      data.referral_company || '',
      data.referral_email || '',
      data.referral_phone || '',
      data.referral_position || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
    ];
    console.log('[v0] Row data prepared');

    // Check if row exists for this email
    console.log('[v0] Checking for existing row...');
    const existingRow = await findRowByEmail(accessToken, data.email);
    
    if (existingRow) {
      // Update existing row
      console.log('[v0] Updating existing row:', existingRow);
      await updateRow(accessToken, existingRow, rowData);
      console.log('[v0] Successfully updated row');
    } else {
      // Append new row
      console.log('[v0] Appending new row...');
      await appendToSheet(accessToken, rowData);
      console.log('[v0] Successfully appended to sheet');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[v0] Error submitting to Google Sheets:', error);
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
}
