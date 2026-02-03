# Updated Google Sheet Column Structure (A-X)

## All Columns in Order

Your Google Sheet should have these columns:

| Column | Header | Description | Example Values |
|--------|--------|-------------|----------------|
| A | timestamp | Entry submission time | 2026-02-03T10:30:00.000Z |
| B | action | Action type (if tracked) | entry, update, referral |
| C | entry_point | Where user came from | landing_page |
| D | company_name | User's company name | ABC Sdn Bhd |
| E | email | User email (unique key 1) | john@abc.com |
| F | phone_number | Phone with country code (unique key 2) | +60123456789 |
| G | survey_q1 | Resignation frequency | Rarely (less than 5% quit) |
| H | survey_q2 | Hiring plan | Yes, hiring soon |
| I | survey_q3 | Headcount | 11 - 30 people |
| J | gift | Calculated reward based on headcount | Disc RM988 off AJobThing Voucher + FREE Billboard Ad |
| K | click_share_linkedin | LinkedIn share button clicked | yes / no |
| L | click_share_whatsapp | WhatsApp share button clicked | yes / no |
| M | click_tngo | TnG reload button clicked | yes / no |
| N | click_more_huat | Want More Huat button clicked | yes / no |
| O | click_register | Register button clicked | yes / no |
| P | click_login | Login button clicked | yes / no |
| Q | referral_name | Referred friend's name | Jane Smith |
| R | referral_phone | Referred friend's phone | 0198765432 |
| S | referral_position | Referred friend's position | HR/Recruiter |
| T | referral_email | Referred friend's email | jane@xyz.com |
| U | referral_companyname | Referred friend's company | XYZ Corp |
| V | utm_source | UTM source | facebook, direct |
| W | utm_medium | UTM medium | social, direct |
| X | utm_campaign | UTM campaign | cny2026, direct |

## Gift Logic (Column J)

The gift is automatically calculated based on survey_q3 (headcount):

| Headcount (Column I) | Gift (Column J) |
|---------------------|-----------------|
| 1 - 5 people | Disc RM288 off AJobThing Voucher |
| 6 - 10 people | Disc RM588 off AJobThing Voucher + FREE Billboard Ad |
| 11 - 30 people | Disc RM988 off AJobThing Voucher + FREE Billboard Ad |
| 31 - 100 people | Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad |
| 100 people | Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad |

## UTM Default Values

If no UTM parameters are present in the URL:
- utm_source → "direct"
- utm_medium → "direct"
- utm_campaign → "direct"

## Click Tracking

All click fields default to "no" and update to "yes" when:
- **click_share_linkedin**: User clicks "Share on LinkedIn"
- **click_share_whatsapp**: User clicks "Share on WhatsApp"
- **click_tngo**: User clicks TnG reload card
- **click_more_huat**: User clicks "Want More Huat?" button
- **click_register**: User clicks "Register Account" button (NEW)
- **click_login**: User clicks "Login & Claim" button (NEW)

## Button URLs

Register button: `https://www.ajobthing.com/register?redirect=/campaign/rewards`
Login button: `https://www.ajobthing.com/login?redirect=/campaign/rewards`

## Duplicate Prevention

The system prevents duplicates by checking BOTH:
1. Email (Column E)
2. Phone Number (Column F)

If a matching email AND phone number is found, the existing row is updated instead of creating a new row.

## Setup Your Sheet Header Row

Copy this row as your first row in the sheet:

```
timestamp | action | entry_point | company_name | email | phone_number | survey_q1 | survey_q2 | survey_q3 | gift | click_share_linkedin | click_share_whatsapp | click_tngo | click_more_huat | click_register | click_login | referral_name | referral_phone | referral_position | referral_email | referral_companyname | utm_source | utm_medium | utm_campaign
```
