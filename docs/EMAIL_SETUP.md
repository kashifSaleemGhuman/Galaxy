# Email Service Setup - Multi-Provider Support

This document explains how to configure the Galaxy ERP email service, which supports multiple email providers with automatic fallback.

## Overview

The Galaxy ERP system uses a **multi-provider email service** that automatically tries different email providers in order until one succeeds. This provides:

- **Resilience**: If one provider is down, it automatically falls back to another
- **Flexibility**: Easy to switch providers without code changes
- **Reliability**: Multiple backup options ensure emails are delivered

## Supported Providers

The system supports three email providers (in priority order):

1. **Resend** (Recommended) - Modern, developer-friendly API
2. **SendGrid** (Twilio) - Popular transactional email service
3. **SMTP** (via Nodemailer) - Works with any SMTP server (Gmail, Outlook, custom)

## Provider Priority & Fallback

When sending an email, the system will:

1. Try **Resend** first (if configured)
2. If Resend fails or isn't configured, try **SendGrid** (if configured)
3. If SendGrid fails or isn't configured, try **SMTP** (if configured)
4. If all providers fail, return an error with details

## Quick Setup

### Option 1: Resend (Recommended - Easiest Setup)

1. **Sign up** at [https://resend.com](https://resend.com)
2. **Get API Key**: Dashboard → API Keys → Create API Key
3. **Verify Domain**: Add your domain and verify DNS records
4. **Add to `.env`**:
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
   ```

**Free Tier**: 3,000 emails/month

### Option 2: SendGrid

1. **Sign up** at [https://sendgrid.com](https://sendgrid.com)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Verify Sender**: Settings → Sender Authentication → Verify Single Sender
4. **Add to `.env`**:
   ```env
   SENDGRID_API_KEY="SG.your-api-key-here"
   SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
   ```

**Free Tier**: 100 emails/day

### Option 3: SMTP (Gmail, Outlook, etc.)

#### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Create App Password**: Google Account → Security → App Passwords
3. **Add to `.env`**:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   SMTP_FROM_EMAIL="your-email@gmail.com"
   ```

#### Outlook Setup

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM_EMAIL="your-email@outlook.com"
```

#### Custom SMTP Server

```env
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```

## Environment Variables

### Common Settings (Used by All Providers)

```env
# Common email settings (fallback if provider-specific settings not provided)
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Galaxy ERP"
```

### Resend Configuration

```env
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Optional, uses EMAIL_FROM if not set
RESEND_FROM_NAME="Galaxy ERP"                # Optional, uses EMAIL_FROM_NAME if not set
```

### SendGrid Configuration

```env
SENDGRID_API_KEY="SG.your-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"  # Optional
SENDGRID_FROM_NAME="Galaxy ERP"                # Optional
```

### SMTP Configuration

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"                    # 587 for TLS, 465 for SSL
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="your-email@gmail.com"  # Optional
```

## Multi-Provider Setup (Recommended)

For maximum reliability, configure multiple providers:

```env
# Primary: Resend
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Fallback 1: SendGrid
SENDGRID_API_KEY="SG.your-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Fallback 2: SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Common settings
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Galaxy ERP"
```

With this setup:
- System tries Resend first
- If Resend fails, automatically tries SendGrid
- If SendGrid fails, automatically tries SMTP
- Only fails if all three providers fail

## Email Templates

The system includes two professional HTML email templates:

### RFQ Email Template
- Sent when an RFQ is sent to a vendor
- Includes RFQ number, order deadline, and itemized list
- Professional styling with purple gradient header

### Purchase Order Email Template
- Sent when a PO is sent to a vendor
- Includes PO number, complete itemized list with prices, and total amount
- Professional styling with green gradient header

## Usage

### Sending RFQ Emails

When a user clicks "Send to Vendor" on an RFQ:
1. System updates RFQ status to "sent"
2. Email is automatically sent using the configured provider(s)
3. If primary provider fails, automatically tries next provider

**API Endpoint:** `POST /api/rfqs/[id]/send`

### Sending PO Emails

When a user clicks "Send to Vendor" on a Purchase Order:
1. System updates PO status to "sent"
2. Email is automatically sent using the configured provider(s)
3. If primary provider fails, automatically tries next provider

**API Endpoint:** `POST /api/purchase/purchase-orders/[id]/send`

## Error Handling

The email service is designed to be resilient:

- **Non-blocking**: If email sending fails, the operation (RFQ/PO send) still succeeds
- **Automatic Fallback**: Tries next provider if current one fails
- **Error Logging**: All errors are logged with provider details
- **Graceful Degradation**: System continues to function even if all providers fail

## Monitoring & Debugging

### Check Provider Status

The service logs which provider was used:
```
✓ Email sent successfully via resend
```

Or if a provider fails:
```
✗ Failed to send via sendgrid: Unauthorized
Attempting to send email via smtp...
✓ Email sent successfully via smtp
```

### Common Issues

#### "No email providers configured"
- **Solution**: Configure at least one provider in `.env`

#### "All email providers failed"
- **Check**: Provider credentials are correct
- **Check**: Sender email is verified (for Resend/SendGrid)
- **Check**: SMTP credentials are valid (for SMTP)
- **Check**: Network connectivity

#### Resend: "Unauthorized"
- **Solution**: Verify API key is correct
- **Solution**: Ensure domain is verified in Resend dashboard

#### SendGrid: "Forbidden"
- **Solution**: Verify sender email is verified in SendGrid
- **Solution**: Check API key permissions

#### SMTP: "Authentication failed"
- **Solution**: For Gmail, use App Password (not regular password)
- **Solution**: Ensure 2FA is enabled for Gmail
- **Solution**: Check SMTP credentials are correct

## Best Practices

1. **Configure Multiple Providers**: Set up at least 2 providers for redundancy
2. **Verify Sender Emails**: Always verify sender addresses in provider dashboards
3. **Monitor Logs**: Check server logs to see which provider is being used
4. **Test Regularly**: Send test emails to verify all providers work
5. **Keep Credentials Secure**: Never commit API keys or passwords to version control
6. **Use Environment Variables**: Store all credentials in `.env` file

## Provider Comparison

| Feature | Resend | SendGrid | SMTP |
|---------|--------|----------|------|
| Setup Difficulty | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| Free Tier | 3,000/month | 100/day | Unlimited* |
| Deliverability | ⭐⭐⭐ Excellent | ⭐⭐⭐ Excellent | ⭐⭐ Good |
| API Quality | ⭐⭐⭐ Excellent | ⭐⭐ Good | N/A |
| Cost at Scale | ⭐⭐ Medium | ⭐ Low | ⭐⭐⭐ Free* |
| Recommended For | Modern apps | Enterprise | Budget-conscious |

*SMTP free tier depends on your email provider (Gmail has limits)

## Support

### Resend
- Documentation: https://resend.com/docs
- Support: support@resend.com

### SendGrid
- Documentation: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

### SMTP Issues
- Gmail: https://support.google.com/mail
- Outlook: https://support.microsoft.com/outlook

## Migration Guide

### From SendGrid Only to Multi-Provider

1. Keep your existing SendGrid configuration
2. Add Resend configuration (recommended as primary)
3. Optionally add SMTP as final fallback
4. No code changes needed - system automatically uses best available provider

### Testing Provider Priority

To test which provider is being used:
1. Configure multiple providers
2. Send a test email
3. Check server logs for provider name
4. Temporarily disable primary provider to test fallback

