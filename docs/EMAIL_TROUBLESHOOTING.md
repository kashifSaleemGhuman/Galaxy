# Email Troubleshooting Guide

## Common Issues and Solutions

### Issue: Emails Not Being Received

#### Problem 1: Hotmail/Gmail/Yahoo as "From" Address with Resend

**Symptom**: Emails appear to send successfully but are never received.

**Cause**: Resend (and most email services) don't allow free email providers (Hotmail, Gmail, Yahoo) as "from" addresses unless you verify the domain. You cannot verify `hotmail.com` or `gmail.com` domains.

**Solution Options**:

1. **Use SMTP with Hotmail/Outlook** (Recommended for testing):
   ```env
   # Remove or comment out Resend
   # RESEND_API_KEY="..."
   
   # Use SMTP instead
   SMTP_HOST="smtp-mail.outlook.com"
   SMTP_PORT="587"
   SMTP_USER="kashif_saleem_23@hotmail.com"
   SMTP_PASS="your-hotmail-password-or-app-password"
   SMTP_FROM_EMAIL="kashif_saleem_23@hotmail.com"
   ```

2. **Verify Your Own Domain in Resend**:
   - Go to Resend Dashboard → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Add the required DNS records
   - Use `noreply@yourdomain.com` as the from address

3. **Use SendGrid with Domain Verification**:
   - Similar process - verify your domain
   - Use verified domain email as "from" address

#### Problem 2: Email Going to Spam

**Symptom**: Email is sent but ends up in spam folder.

**Solutions**:
- Verify your domain in Resend/SendGrid
- Use a professional "from" address (not free email providers)
- Include proper SPF/DKIM records (automatically handled when domain is verified)
- Avoid spam trigger words in subject/content

#### Problem 3: Resend API Errors

**Common Errors**:

- **"Invalid 'from' field"**: The from email is not verified
- **"Unauthorized"**: API key is invalid
- **"Forbidden"**: Domain not verified

**Solutions**:
1. Check Resend dashboard → Domains to verify domain
2. Verify API key is correct
3. Use a verified email address as "from"

### Testing Email Service

Use the test endpoint to verify email configuration:

```bash
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Or use the browser console:
```javascript
fetch('/api/test/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'your-email@example.com' })
})
.then(r => r.json())
.then(console.log);
```

### Quick Fix for Hotmail/Outlook

If you're using Hotmail/Outlook, switch to SMTP:

1. **Get App Password** (if 2FA enabled):
   - Go to Microsoft Account Security
   - Create App Password
   - Use that password in SMTP_PASS

2. **Update `.env`**:
   ```env
   # Disable Resend (comment out)
   # RESEND_API_KEY="..."
   
   # Enable SMTP
   SMTP_HOST="smtp-mail.outlook.com"
   SMTP_PORT="587"
   SMTP_USER="kashif_saleem_23@hotmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM_EMAIL="kashif_saleem_23@hotmail.com"
   EMAIL_FROM="kashif_saleem_23@hotmail.com"
   ```

3. **Restart your server**

### Checking Email Logs

Check your server console/logs for:
- `✓ Email sent successfully via [provider]` - Email was sent
- `✗ Failed to send via [provider]` - Email failed, check error details
- `Attempting to send email via [provider]...` - Shows which provider is being tried

### Resend Domain Verification

To use Resend with your own domain:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `purelogics.net`)
4. Add the DNS records shown:
   - SPF record
   - DKIM records
   - DMARC record (optional)
5. Wait for verification (usually a few minutes)
6. Update `.env`:
   ```env
   RESEND_FROM_EMAIL="noreply@purelogics.net"
   EMAIL_FROM="noreply@purelogics.net"
   ```

### Best Practices

1. **Always verify your domain** when using Resend/SendGrid
2. **Use professional email addresses** (not free providers)
3. **Test with the test endpoint** before sending real emails
4. **Check spam folders** if emails aren't received
5. **Monitor email service logs** for errors
6. **Use SMTP as fallback** for development/testing

