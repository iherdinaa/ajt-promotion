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

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires no-cors for web apps
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // With no-cors, we can't read the response, so we assume success
    console.log('[v0] Data submitted to Google Sheets');
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
