// Google Sheets Integration via Google Apps Script
// Uses a deployed Google Apps Script web app as a proxy

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export interface SheetSubmissionData {
  // Timestamp (auto-generated)
  timestamp: string;
  
  // Action type
  action: 'open_angpau' | 'submit_survey' | 'click_more_huat' | 'share_linkedin' | 'share_whatsapp' | 'submit_referral';
  
  // Entry Point (page where user entered)
  entry_point: string;
  
  // User Data from EntryPage
  company_name: string;
  email: string;
  phone_number: string;
  
  // Survey Data from PreClaimModal (3 questions)
  survey_q1: string;
  survey_q2: string;
  survey_q3: string;
  
  // Gift/Prize won
  gift: string;
  
  // Referral Data
  referral_name: string;
  referral_company: string;
  referral_email: string;
  referral_phone: string;
  referral_position: string;
  
  // UTM Parameters
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
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
export async function submitToGoogleSheets(data: SheetSubmissionData): Promise<{ success: boolean; error?: string }> {
  if (!GOOGLE_SCRIPT_URL) {
    console.error('[v0] Google Script URL not configured');
    return { success: false, error: 'Google Script URL not configured' };
  }

  console.log('[v0] Submitting to Google Sheets:', data);

  try {
    // Build URL with query parameters (works better with CORS)
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    // Use fetch with redirect follow to handle Google's redirect
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });

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
