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

// Find row by email AND phone number to prevent duplicates
async function findRowByEmailAndPhone(accessToken: string, email: string, phone: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:X`;
  
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
  
  // Find row with matching email AND phone number
  // email is column E (index 4), phone is column F (index 5)
  for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
    const rowEmail = (rows[i][4] || '').trim(); // Column E
    const rowPhone = (rows[i][5] || '').trim(); // Column F
    
    if (rowEmail === email.trim() && rowPhone === phone.trim()) {
      return i + 1; // Return 1-indexed row number
    }
  }
  
  return null;
}

// Update existing row
async function updateRow(accessToken: string, rowNumber: number, rowData: string[]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${rowNumber}:X${rowNumber}?valueInputOption=USER_ENTERED`;

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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:X:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

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

  try {
    const data = req.body;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing Google credentials',
      });
    }

    const accessToken = await getAccessToken();

    // Prepare row data matching the headers (A-X)
    // Headers: timestamp, action, entry_point, company_name, email, phone_number, survey_q1, survey_q2, survey_q3, gift, 
    //          click_share_linkedin, click_share_whatsapp, click_tngo, click_more_huat, click_register, click_login,
    //          referral_name, referral_phone, referral_position, referral_email, referral_companyname, 
    //          utm_source, utm_medium, utm_campaign
    const rowData = [
      data.timestamp || new Date().toISOString(),               // A: timestamp
      data.action || '',                                         // B: action
      data.entry_point || '',                                    // C: entry_point
      data.company_name || '',                                   // D: company_name
      data.email || '',                                          // E: email (unique key 1)
      data.phone_number || '',                                   // F: phone_number (unique key 2)
      data.survey_q1 || '',                                      // G: survey_q1
      data.survey_q2 || '',                                      // H: survey_q2
      data.survey_q3 || '',                                      // I: survey_q3
      data.gift || '',                                           // J: gift
      data.click_share_linkedin || 'no',                         // K: click_share_linkedin
      data.click_share_whatsapp || 'no',                         // L: click_share_whatsapp
      data.click_tngo || 'no',                                   // M: click_tngo
      data.click_more_huat || 'no',                              // N: click_more_huat
      data.click_register || 'no',                               // O: click_register
      data.click_login || 'no',                                  // P: click_login
      data.referral_name || '',                                  // Q: referral_name
      data.referral_phone || '',                                 // R: referral_phone
      data.referral_position || '',                              // S: referral_position
      data.referral_email || '',                                 // T: referral_email
      data.referral_companyname || '',                           // U: referral_companyname
      data.utm_source || 'direct',                               // V: utm_source
      data.utm_medium || 'direct',                               // W: utm_medium
      data.utm_campaign || 'direct',                             // X: utm_campaign
    ];

    // Check if row exists for this email AND phone number
    const existingRow = await findRowByEmailAndPhone(accessToken, data.email, data.phone_number);
    
    if (existingRow) {
      await updateRow(accessToken, existingRow, rowData);
    } else {
      await appendToSheet(accessToken, rowData);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
}
