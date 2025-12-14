# SendGrid Email Integration Setup

This document explains how to set up Twilio SendGrid for sending RFQ and Purchase Order emails to vendors.

## Overview

The Galaxy ERP system uses SendGrid to send professional HTML emails to vendors when:
- An RFQ (Request for Quotation) is sent to a vendor
- A Purchase Order (PO) is sent to a vendor

## Prerequisites

1. A SendGrid account (sign up at https://sendgrid.com)
2. A verified sender email address in SendGrid
3. A SendGrid API key

## Setup Steps

### 1. Create a SendGrid Account

1. Go to https://sendgrid.com and sign up for a free account
2. Complete the account verification process

### 2. Verify Your Sender Email

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your sender information:
   - **From Email**: The email address that will appear as the sender (e.g., `noreply@yourdomain.com`)
   - **From Name**: Display name (e.g., "Galaxy ERP")
   - Complete the verification process

### 3. Create an API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Galaxy ERP Production")
4. Select **Full Access** or **Restricted Access** with Mail Send permissions
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again!

### 4. Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY="SG.your-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="Galaxy ERP"
```

**For Production (Vercel):**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the three variables above with your actual values

## Email Templates

The system includes two professional HTML email templates:

### RFQ Email Template
- Sent when an RFQ is sent to a vendor
- Includes:
  - RFQ number and order deadline
  - List of requested items with quantities
  - Professional styling with gradient header
  - Clear call-to-action for vendor response

### Purchase Order Email Template
- Sent when a PO is sent to a vendor
- Includes:
  - PO number and date
  - Complete itemized list with prices
  - Total amount
  - Reference to source RFQ (if applicable)
  - Professional styling with green gradient header

## Usage

### Sending RFQ Emails

When a user clicks "Send to Vendor" on an RFQ:
1. The system updates the RFQ status to "sent"
2. An email is automatically sent to the vendor's email address
3. The email includes all RFQ details and requested items

**API Endpoint:** `POST /api/rfqs/[id]/send`

### Sending PO Emails

When a user clicks "Send to Vendor" on a Purchase Order:
1. The system updates the PO status to "sent"
2. An email is automatically sent to the supplier's email address
3. The email includes complete PO details with pricing

**API Endpoint:** `POST /api/purchase/purchase-orders/[id]/send`

## Error Handling

The email service is designed to be non-blocking:
- If email sending fails, the operation (RFQ/PO send) still succeeds
- Errors are logged to the console for debugging
- The system will continue to function even if SendGrid is not configured

## Testing

### Test Mode

If `SENDGRID_API_KEY` is not configured:
- The system will log a warning
- Email sending will be skipped
- The operation will still complete successfully
- This allows development without SendGrid credentials

### Production Testing

1. Ensure all environment variables are set correctly
2. Send a test RFQ or PO
3. Check the vendor's email inbox
4. Verify the email appears correctly formatted
5. Check SendGrid dashboard for delivery status

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `SENDGRID_API_KEY` is set correctly
2. **Check Sender Verification**: Ensure sender email is verified in SendGrid
3. **Check Logs**: Review server logs for error messages
4. **Check SendGrid Dashboard**: Look for bounce or block notifications

### Common Errors

- **"Unauthorized"**: API key is invalid or missing
- **"Forbidden"**: Sender email is not verified
- **"Bad Request"**: Email format or recipient address is invalid

### SendGrid Limits

- **Free Tier**: 100 emails/day
- **Essentials**: 40,000 emails/month
- Monitor usage in SendGrid dashboard

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically
4. **Use restricted API keys** with minimal required permissions
5. **Monitor API key usage** in SendGrid dashboard

## Support

For SendGrid-specific issues:
- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com

For application-specific issues:
- Check application logs
- Review error messages in API responses
- Verify database records for RFQ/PO status

