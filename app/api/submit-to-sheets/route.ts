import { NextRequest, NextResponse } from 'next/server';

const SPREADSHEET_ID = '1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo';
const SHEET_NAME = 'Ahuathing';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Get access token using service account
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service account credentials');
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
  const base64url = (obj: object) => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const encodedHeader = base64url(header);
  const encodedClaim = base64url(claim);
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Sign with private key using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureInput);

  // Import the private key
  const pemContents = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, data);
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Append row to Google Sheet
async function appendToSheet(accessToken: string, values: string[]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:Q:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [values],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  console.log('[v0] API route called');
  
  try {
    const data = await request.json();
    console.log('[v0] Received data:', JSON.stringify(data));

    // Check environment variables
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY;
    console.log('[v0] Has service account email:', hasEmail);
    console.log('[v0] Has private key:', hasKey);

    if (!hasEmail || !hasKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Google credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.' },
        { status: 500 }
      );
    }

    // Get access token
    console.log('[v0] Getting access token...');
    const accessToken = await getAccessToken();
    console.log('[v0] Got access token');

    // Prepare row data matching the headers
    const rowData = [
      data.timestamp || new Date().toISOString(),
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
    console.log('[v0] Row data prepared:', rowData);

    // Append to sheet
    console.log('[v0] Appending to sheet...');
    await appendToSheet(accessToken, rowData);
    console.log('[v0] Successfully appended to sheet');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error submitting to Google Sheets:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
