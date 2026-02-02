// Google Sheets Integration via Server API Route
// Uses Google Sheets API with Service Account authentication

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

// Submit data to Google Sheets via server API route
export async function submitToGoogleSheets(data: SheetSubmissionData): Promise<{ success: boolean; error?: string }> {
  console.log('[v0] Submitting to Google Sheets:', data);

  try {
    const response = await fetch('/api/submit-to-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('[v0] Google Sheets submission successful');
      return { success: true };
    } else {
      console.error('[v0] Google Sheets error:', result.error);
      return { success: false, error: result.error };
    }
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
