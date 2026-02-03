import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = '1kppk_NJn7U3xdj1yYGPPsGiHS1LXCVTv7HldkyJbHlo';
const SHEET_NAME = 'Ahuathing';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Get OAuth2 access token using JWT
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
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
}
}

// Check if user already exists by email AND phone
async function checkUserExists(accessToken: string, email: string, phone: string): Promise<boolean> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:X`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  const rows = data.values || [];
  
  // Find row with matching email AND phone number
  // email is column E (index 4), phone is column F (index 5)
  for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
    const rowEmail = (rows[i][4] || '').trim();
    const rowPhone = (rows[i][5] || '').trim();
    
    if (rowEmail === email.trim() && rowPhone === phone.trim()) {
      return true;
    }
  }
  
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email and phone are required',
      });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing Google credentials',
      });
    }

    const accessToken = await getAccessToken();
    const exists = await checkUserExists(accessToken, email, phone);

    return res.status(200).json({ 
      success: true,
      exists: exists
    });
  } catch (error) {
    console.error('[v0] Error checking user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check user',
    });
  }
}
