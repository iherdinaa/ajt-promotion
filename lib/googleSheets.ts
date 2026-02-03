// Google Sheets Integration via Google Apps Script
// Uses a deployed Google Apps Script web app as a proxy

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export interface SheetSubmissionData {
  // Timestamp
  timestamp: string;
  
  // User Data from EntryPage
  company_name: string;
  email: string;
  phone_number: string;
  
  // Survey Data from PreClaimModal (3 questions)
  survey_q1: string;
  survey_q2: string;
  survey_q3: string;
  
  // Click tracking (yes/no)
  click_share_linkedin: string;
  click_share_whatsapp: string;
  click_tngo: string;
  click_more_huat: string;
  
  // Referral Data
  referral_name: string;
  referral_phone: string;
  referral_position: string;
  referral_email: string;
  referral_companyname: string;
  
  // UTM Parameters
  utm_campaign: string;
  utm_source: string;
  utm_medium: string;
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

// Submit data to Google Sheets via Google Apps Script
// This will UPDATE existing row if email exists, otherwise create new row
export async function submitToGoogleSheets(data: SheetSubmissionData): Promise<{ success: boolean; error?: string }> {
  if (!GOOGLE_SCRIPT_URL) {
    console.error('[v0] Google Script URL not configured');
    return { success: false, error: 'Google Script URL not configured' };
  }

  console.log('[v0] Submitting to Google Sheets:', data);

  try {
    // Add a flag to indicate we want to update existing rows
    const params = new URLSearchParams();
    params.append('action', 'upsert'); // upsert = update or insert
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    // Use fetch with redirect follow to handle Google's redirect
    // Set a timeout to ensure fast responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    console.log('[v0] Google Sheets response status:', response.status);
    
    // Try to parse response
    try {
      const result = await response.json();
      console.log('[v0] Google Sheets response:', result);
      if (result.success) {
        return { success: true };
      }
    } catch {
      // If can't parse JSON, check if response was ok
      if (response.ok) {
        console.log('[v0] Request completed successfully');
        return { success: true };
      }
    }
    
    return { success: true }; // Assume success if no error thrown
  } catch (error) {
    console.error('[v0] Failed to submit to Google Sheets:', error);
    // Don't block UI on sheet errors - return success anyway
    return { success: true, error: String(error) };
  }
}

// Helper to format phone number with country code
export function formatPhoneNumber(countryCode: string, phone: string): string {
  // Extract just the number part from countryCode like "🇲🇾 (+60)"
  const codeMatch = countryCode.match(/\(([^)]+)\)/);
  const code = codeMatch ? codeMatch[1] : '';
  return `${code}${phone}`;
}
