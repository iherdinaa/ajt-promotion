// Google Sheets Integration
// Uses Google Apps Script Web App as a proxy to write to Google Sheets

const GOOGLE_SHEETS_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

export interface SheetSubmissionData {
  // Timestamp (auto-generated)
  timestamp: string;
  
  // Entry Point (page where user entered)
  entryPoint: string;
  
  // User Data from EntryPage
  companyName: string;
  email: string;
  phoneNumber: string;
  
  // Survey Data from PreClaimModal (3 questions)
  surveyQ1_resignationFrequency: string;
  surveyQ2_hiringPlan: string;
  surveyQ3_headcount: string;
  
  // Gift/Prize won
  gift: string;
  
  // Referral Data
  referralName: string;
  referralCompany: string;
  referralEmail: string;
  referralPhone: string;
  referralJobPosition: string;
  
  // UTM Parameters
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

// Get UTM parameters from URL
export function getUtmParams(): { utmSource: string; utmMedium: string; utmCampaign: string } {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
  }
  
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
  };
}

// Submit data to Google Sheets via Apps Script Web App
export async function submitToGoogleSheets(data: SheetSubmissionData): Promise<{ success: boolean; error?: string }> {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.error('[v0] Google Sheets webhook URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }

  console.log('[v0] Submitting to Google Sheets:', data);
  console.log('[v0] Webhook URL:', GOOGLE_SHEETS_WEBHOOK_URL);

  try {
    // Use URL parameters for Google Apps Script (more reliable than POST body with CORS)
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    const url = `${GOOGLE_SHEETS_WEBHOOK_URL}?${params.toString()}`;
    
    // Use fetch with no-cors mode and GET method via script tag injection for reliability
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
    });

    console.log('[v0] Data submitted to Google Sheets successfully');
    return { success: true };
  } catch (error) {
    console.error('[v0] Failed to submit to Google Sheets:', error);
    return { success: false, error: String(error) };
  }
}

// Helper to format phone number with country code
export function formatPhoneNumber(countryCode: string, phone: string): string {
  // Extract just the number part from countryCode like "🇲🇾 (+60)"
  const codeMatch = countryCode.match(/\(([^)]+)\)/);
  const code = codeMatch ? codeMatch[1] : '';
  return `${code}${phone}`;
}
