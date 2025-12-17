# Resend Domain Verification Guide

## Is Domain Verification Free?

**Yes!** Domain verification in Resend is completely free. You just need:
1. A domain you own (e.g., `purelogics.net`, `yourcompany.com`)
2. Access to your domain's DNS settings
3. About 5-10 minutes to set it up

## Why Verify a Domain?

When using Resend's test email (`onboarding@resend.dev`), you can **only send emails to your own verified email address** (the one you signed up with).

To send emails to **any recipient** (like vendors), you need to verify your own domain.

## Step-by-Step: Verify Your Domain in Resend

### Step 1: Go to Resend Dashboard

1. Visit [https://resend.com/domains](https://resend.com/domains)
2. Log in to your Resend account
3. Click **"Add Domain"** button

### Step 2: Enter Your Domain

1. Enter your domain (e.g., `purelogics.net`)
   - **Don't** include `www` or `http://`
   - Just the domain: `purelogics.net`
2. Click **"Add"**

### Step 3: Add DNS Records

Resend will show you DNS records to add. You'll need to add these to your domain's DNS settings:

#### Required Records:

1. **SPF Record** (TXT)
   ```
   v=spf1 include:resend.com ~all
   ```
   - **Name/Host**: `@` or your domain root
   - **Type**: `TXT`
   - **Value**: `v=spf1 include:resend.com ~all`
   - **TTL**: `3600` (or default)

2. **DKIM Records** (2 TXT records)
   - Resend will provide 2 unique DKIM records
   - They look like:
     ```
     resend._domainkey.purelogics.net
     ```
   - Add both as `TXT` records with the values Resend provides

3. **DMARC Record** (Optional but recommended)
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@purelogics.net
   ```
   - **Name/Host**: `_dmarc`
   - **Type**: `TXT`
   - **Value**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

### Step 4: Add Records to Your DNS Provider

Where to add DNS records depends on where your domain is hosted:

#### Common DNS Providers:

**Cloudflare:**
1. Go to Cloudflare Dashboard → Your Domain → DNS
2. Click "Add record"
3. Select type (TXT), enter name and value
4. Click "Save"

**GoDaddy:**
1. Go to GoDaddy → My Products → DNS
2. Click "Add" under Records
3. Select type, enter name and value
4. Click "Save"

**Namecheap:**
1. Go to Namecheap → Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. Select type, enter host and value
4. Click "Save"

**Google Domains:**
1. Go to Google Domains → DNS
2. Click "Custom records"
3. Click "Add record"
4. Enter type, name, and value
5. Click "Save"

### Step 5: Wait for Verification

1. After adding DNS records, go back to Resend dashboard
2. Click **"Verify"** or wait for automatic verification
3. Verification usually takes **5-30 minutes** (can take up to 48 hours)
4. You'll see a green checkmark when verified ✅

### Step 6: Update Your Environment Variables

Once verified, update your `.env` file:

```env
# Use your verified domain email
RESEND_FROM_EMAIL="noreply@purelogics.net"
EMAIL_FROM="noreply@purelogics.net"
EMAIL_FROM_NAME="Galaxy ERP"
RESEND_API_KEY="re_your_api_key_here"
```

**Important:** The `from` email must use your verified domain (e.g., `noreply@purelogics.net`), not `onboarding@resend.dev` or a free email provider.

## Quick Setup Checklist

- [ ] Log in to Resend dashboard
- [ ] Go to Domains section
- [ ] Add your domain (e.g., `purelogics.net`)
- [ ] Copy the DNS records Resend provides
- [ ] Add SPF record to your DNS
- [ ] Add 2 DKIM records to your DNS
- [ ] (Optional) Add DMARC record
- [ ] Wait for verification (5-30 minutes)
- [ ] Update `.env` with verified domain email
- [ ] Restart your server
- [ ] Test sending an email

## Troubleshooting

### "Domain not verified" after adding records

1. **Wait longer**: DNS propagation can take up to 48 hours
2. **Check DNS records**: Use `dig` or online DNS checker:
   ```bash
   dig TXT purelogics.net
   dig TXT resend._domainkey.purelogics.net
   ```
3. **Verify record format**: Make sure there are no extra spaces or quotes
4. **Check TTL**: Lower TTL (300-600) helps with faster propagation

### "Invalid from address"

- Make sure the `from` email uses your verified domain
- Don't use `onboarding@resend.dev` after verification
- Don't use free email providers (Hotmail, Gmail, etc.)

### DNS Records Not Showing

- Wait 5-10 minutes after adding records
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or restart your router
- Use online DNS checker: [mxtoolbox.com](https://mxtoolbox.com)

## Alternative: Use SMTP (No Domain Needed)

If you don't have a domain or don't want to verify one, you can use SMTP instead:

```env
# Comment out Resend
# RESEND_API_KEY="..."

# Use SMTP (Gmail/Hotmail/Outlook)
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="kashif_saleem_23@hotmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="kashif_saleem_23@hotmail.com"
EMAIL_FROM="kashif_saleem_23@hotmail.com"
```

## Cost Comparison

| Method | Cost | Setup Time | Limitations |
|--------|------|------------|-------------|
| **Resend (Test Email)** | Free | Instant | Only to your email |
| **Resend (Verified Domain)** | Free | 10-30 min | Need domain |
| **SMTP (Gmail/Hotmail)** | Free | 5 min | Daily sending limits |
| **Resend Paid Plan** | $20/month | 10-30 min | Higher limits |

## Next Steps

1. **Verify your domain** in Resend (recommended for production)
2. **Or use SMTP** for quick testing (no domain needed)
3. **Update `.env`** with the correct from address
4. **Restart server** and test email sending

## Need Help?

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- DNS Checker: https://mxtoolbox.com/SuperTool.aspx

