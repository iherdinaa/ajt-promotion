import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

// Get OAuth2 access token
async function getAccessToken(): Promise<string> {
  const jwtClient = require('google-auth-library').JWT;
  
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const client = new jwtClient({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const tokens = await client.authorize();
  return tokens.access_token;
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
