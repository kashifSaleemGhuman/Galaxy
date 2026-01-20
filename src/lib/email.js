// Import email providers - these are safe imports that won't fail if packages are installed
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dns from 'dns';

/**
 * Multi-provider email service with automatic fallback
 * Supports: Resend, SendGrid, and SMTP (via Nodemailer)
 */
class EmailService {
  constructor() {
    // Common email settings
    // For Resend: Use onboarding@resend.dev if no verified domain, otherwise use configured email
    const defaultFromEmail = process.env.RESEND_FROM_EMAIL || 
                             process.env.EMAIL_FROM || 
                             process.env.SENDGRID_FROM_EMAIL || 
                             process.env.SMTP_FROM_EMAIL ||
                             process.env.SMTP_USER || 
                             'onboarding@resend.dev'; // Resend's test email that works without verification
    
    this.fromEmail = defaultFromEmail;
    this.fromName = process.env.EMAIL_FROM_NAME || 
                    process.env.RESEND_FROM_NAME || 
                    process.env.SENDGRID_FROM_NAME || 
                    'Galaxy ERP';
    
    // Lazy initialization - providers are initialized on first use
    this._resend = null;
    this._sendgridConfigured = null;
    this._smtpTransporter = null;
  }

  /**
   * Initialize Resend (lazy)
   * @private
   */
  _initResend() {
    if (this._resend !== null) return this._resend;
    
    if (!Resend) {
      this._resend = false;
      return false;
    }
    
    if (process.env.RESEND_API_KEY) {
      try {
        this._resend = new Resend(process.env.RESEND_API_KEY);
      } catch (error) {
        console.warn('Failed to initialize Resend:', error.message);
        this._resend = false;
      }
    } else {
      this._resend = false;
    }
    return this._resend;
  }

  /**
   * Initialize SendGrid (lazy)
   * @private
   */
  _initSendGrid() {
    if (this._sendgridConfigured !== null) return this._sendgridConfigured;
    
    if (!sgMail) {
      this._sendgridConfigured = false;
      return false;
    }
    
    if (process.env.SENDGRID_API_KEY) {
      try {
        // Fix DNS resolution issues by forcing IPv4 and using system DNS
        // This helps resolve ENOTFOUND errors when system DNS works but Node.js DNS fails
        try {
          // Set DNS lookup order to prefer IPv4 (avoids IPv6 DNS resolution issues)
          if (dns.setDefaultResultOrder) {
            dns.setDefaultResultOrder('ipv4first');
          }
        } catch (dnsError) {
          // Ignore if DNS setting fails (older Node.js versions)
          console.debug('Could not set DNS order:', dnsError.message);
        }
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        this._sendgridConfigured = true;
      } catch (error) {
        console.warn('Failed to initialize SendGrid:', error.message);
        this._sendgridConfigured = false;
      }
    } else {
      this._sendgridConfigured = false;
    }
    return this._sendgridConfigured;
  }

  /**
   * Initialize SMTP transporter (lazy)
   * @private
   */
  _initSMTP() {
    if (this._smtpTransporter !== null) return this._smtpTransporter;
    
    if (!nodemailer) {
      this._smtpTransporter = false;
      return false;
    }
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this._smtpTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        });
      } catch (error) {
        console.warn('Failed to initialize SMTP:', error.message);
        this._smtpTransporter = false;
      }
    } else {
      this._smtpTransporter = false;
    }
    return this._smtpTransporter;
  }

  /**
   * Check if a provider is configured
   * @param {string} providerName - Name of the provider
   * @returns {boolean}
   */
  isProviderConfigured(providerName) {
    switch (providerName) {
      case 'resend':
        return !!this._initResend();
      case 'sendgrid':
        return this._initSendGrid();
      case 'smtp':
        return !!this._initSMTP();
      default:
        return false;
    }
  }

  /**
   * Get list of configured providers in priority order
   * @returns {Array<string>} List of provider names
   */
  getConfiguredProviders() {
    const providers = [];
    if (this.isProviderConfigured('resend')) providers.push('resend');
    if (this.isProviderConfigured('sendgrid')) providers.push('sendgrid');
    if (this.isProviderConfigured('smtp')) providers.push('smtp');
    return providers;
  }

  /**
   * Send email using multiple providers with automatic fallback
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @returns {Promise<Object>} Send result with provider info
   */
  async sendEmail({ to, subject, html, text }) {
    // Define providers in priority order
    const providers = [
      { name: 'sendgrid', fn: () => this.sendViaSendGrid({ to, subject, html, text }) },
      { name: 'resend', fn: () => this.sendViaResend({ to, subject, html, text }) },
      { name: 'smtp', fn: () => this.sendViaSMTP({ to, subject, html, text }) },
    ];

    const errors = [];
    
    // Try each provider in order until one succeeds
    for (const provider of providers) {
      if (!this.isProviderConfigured(provider.name)) {
        continue; // Skip unconfigured providers
      }

      try {
        console.log(`Attempting to send email via ${provider.name}...`);
        const result = await provider.fn();
        if (result.success) {
          console.log(`✓ Email sent successfully via ${provider.name}`);
          return result;
        }
      } catch (error) {
        const errorMsg = error.message || error.toString();
        console.error(`✗ Failed to send via ${provider.name}:`, errorMsg);
        errors.push({ provider: provider.name, error: errorMsg });
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    const configuredProviders = this.getConfiguredProviders();
    const errorMessage = configuredProviders.length === 0
      ? 'No email providers configured'
      : `All email providers failed. Tried: ${configuredProviders.join(', ')}`;

    console.error('✗ Email sending failed:', errorMessage);
    console.error('Errors:', errors);
    
    return {
      success: false,
      message: errorMessage,
      errors,
      providersAttempted: configuredProviders,
    };
  }

  /**
   * Send email via Resend
   * @private
   */
  async sendViaResend({ to, subject, html, text }) {
    const resend = this._initResend();
    if (!resend) {
      throw new Error('Resend not configured');
    }

    // Use Resend's onboarding email if user's email is not verified
    // onboarding@resend.dev works without domain verification for testing
    let fromAddress = this.fromEmail;
    
    // Check if using a free email provider (hotmail, gmail, yahoo, etc.)
    const freeEmailDomains = ['hotmail.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'live.com'];
    const emailDomain = this.fromEmail.split('@')[1]?.toLowerCase();
    
    if (freeEmailDomains.includes(emailDomain)) {
      console.warn(`Using Resend's test email (onboarding@resend.dev) because ${this.fromEmail} is not verified. For production, verify your domain in Resend.`);
      fromAddress = 'onboarding@resend.dev';
    }

    const fromEmail = `${this.fromName} <${fromAddress}>`;
    console.log('Sending email via Resend:', {
      from: fromEmail,
      to: [to],
      subject,
      usingTestEmail: fromAddress === 'onboarding@resend.dev',
    });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text: text || this.stripHtml(html),
    });

    if (error) {
      console.error('Resend API error:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        response: error.response,
      });
      throw new Error(`Resend API error: ${error.message || 'Unknown error'}`);
    }

    console.log('Resend email sent successfully:', {
      messageId: data?.id,
      to: [to],
    });

    return {
      success: true,
      response: data,
      provider: 'resend',
      messageId: data?.id,
    };
  }

  /**
   * Send email via SendGrid
   * @private
   */
  async sendViaSendGrid({ to, subject, html, text }) {
    if (!this._initSendGrid()) {
      throw new Error('SendGrid not configured');
    }

    // Use SendGrid-specific email if available, otherwise fall back to default
    const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || this.fromEmail;
    const sendGridFromName = process.env.SENDGRID_FROM_NAME || this.fromName;

    const msg = {
      to,
      from: {
        email: sendGridFromEmail,
        name: sendGridFromName,
      },
      subject,
      html,
      text: text || this.stripHtml(html),
    };

    try {
      const response = await sgMail.send(msg);
      
      console.log('✓ SendGrid email sent successfully:', {
        from: sendGridFromEmail,
        to: to,
        subject: subject,
        statusCode: response[0]?.statusCode,
      });
      
      return {
        success: true,
        response,
        provider: 'sendgrid',
        statusCode: response[0]?.statusCode,
        from: sendGridFromEmail,
        to: to,
        subject: subject,
      };
    } catch (error) {
      // Extract detailed error information from SendGrid
      let errorMessage = error.message || 'Unknown error';
      let errorDetails = null;

      // Handle network/DNS errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = `SendGrid network error: Unable to connect to api.sendgrid.com. This may be due to network connectivity issues, firewall, or DNS problems.`;
        errorDetails = {
          code: error.code,
          hostname: error.hostname || 'api.sendgrid.com',
          syscall: error.syscall
        };
      } else if (error.response) {
        // Handle API errors (403 Forbidden, 401 Unauthorized, etc.)
        const statusCode = error.response.statusCode || error.code;
        const body = error.response.body || {};
        const errors = body.errors || [];
        
        if (statusCode === 403 || errorMessage.includes('Forbidden')) {
          const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || this.fromEmail;
          errorMessage = `SendGrid Forbidden (403): The sender email "${sendGridFromEmail}" is not verified in your SendGrid account.\n\n` +
            `To fix this:\n` +
            `1. Go to SendGrid Dashboard → Settings → Sender Authentication\n` +
            `2. Click "Verify a Single Sender" or "Authenticate Your Domain"\n` +
            `3. Verify the email address: ${sendGridFromEmail}\n` +
            `4. Make sure your .env has SENDGRID_FROM_EMAIL="${sendGridFromEmail}"\n` +
            `   (Note: SENDGRID_FROM_EMAIL takes precedence over EMAIL_FROM for SendGrid)\n` +
            `   Current EMAIL_FROM: ${this.fromEmail}\n` +
            `   Current SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || 'NOT SET'}`;
          errorDetails = {
            statusCode: 403,
            senderEmail: sendGridFromEmail,
            errors: errors,
            body: body
          };
        } else if (statusCode === 401 || errorMessage.includes('Unauthorized')) {
          errorMessage = `SendGrid Unauthorized (401): API key is invalid, expired, or missing permissions.\n\n` +
            `To fix this:\n` +
            `1. Check your SENDGRID_API_KEY in .env file\n` +
            `2. Generate a new API key: SendGrid Dashboard → Settings → API Keys\n` +
            `3. Make sure the API key has "Mail Send" permissions\n` +
            `4. Update SENDGRID_API_KEY in your .env file and restart the server`;
          errorDetails = {
            statusCode: 401,
            errors: errors,
            body: body
          };
        } else if (errors.length > 0) {
          errorMessage = errors.map(e => e.message || e).join('; ');
          errorDetails = {
            statusCode: statusCode,
            errors: errors,
            body: body
          };
        } else if (body.message) {
          errorMessage = body.message;
          errorDetails = body;
        }
      }

      // Create a more descriptive error
      const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || this.fromEmail;
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.details = errorDetails;
      enhancedError.code = error.code || error.response?.statusCode;
      enhancedError.fromEmail = sendGridFromEmail;
      
      throw enhancedError;
    }
  }

  /**
   * Send email via SMTP (Nodemailer)
   * @private
   */
  async sendViaSMTP({ to, subject, html, text }) {
    const transporter = this._initSMTP();
    if (!transporter) {
      throw new Error('SMTP not configured');
    }

    const info = await transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      html,
      text: text || this.stripHtml(html),
    });

    return {
      success: true,
      response: info,
      provider: 'smtp',
      messageId: info.messageId,
    };
  }

  /**
   * Strip HTML tags from HTML string to create plain text version
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate RFQ email template
   * @param {Object} rfq - RFQ data
   * @returns {Object} Email content with subject, html, and text
   */
  generateRFQEmail(rfq) {
    const vendorName = rfq.vendor?.name || 'Vendor';
    const vendorEmail = rfq.vendor?.email || '';
    const rfqNumber = rfq.rfqNumber || rfq.id;
    const orderDeadline = rfq.orderDeadline 
      ? new Date(rfq.orderDeadline).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'N/A';
    
    const items = rfq.items || [];
    const totalItems = items.length;
    
    // Calculate total if items have prices
    const totalAmount = items.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return sum + (unitPrice * quantity);
    }, 0);

    const subject = `Request for Quotation: ${rfqNumber}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Request for Quotation</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${vendorName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We are pleased to invite you to submit a quotation for the following items. Please review the details below and provide your best pricing and delivery terms.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">RFQ Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">RFQ Number:</td>
          <td style="padding: 8px 0;">${rfqNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order Deadline:</td>
          <td style="padding: 8px 0;">${orderDeadline}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Number of Items:</td>
          <td style="padding: 8px 0;">${totalItems}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Items Requested</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Quantity</th>
            <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold;">Unit</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-size: 14px;">${item.product?.name || item.name || 'Product'}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">${item.quantity || 0}</td>
              <td style="padding: 12px; font-size: 14px;">${item.unit || 'EA'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Important:</strong> Please provide your quotation including unit prices, total amounts, expected delivery dates, and any special terms or conditions.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      We look forward to receiving your quotation. If you have any questions, please do not hesitate to contact us.
    </p>
    
    <p style="font-size: 16px; margin-top: 20px;">
      Best regards,<br>
      <strong>Galaxy ERP Procurement Team</strong>
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">This is an automated email from Galaxy ERP System.</p>
      <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, html };
  }

  /**
   * Generate Purchase Order email template
   * @param {Object} po - Purchase Order data
   * @returns {Object} Email content with subject, html, and text
   */
  generatePOEmail(po) {
    // Handle both camelCase (Prisma) and snake_case (API response) formats
    const supplierName = po.supplier?.name || po.supplier_name || 'Supplier';
    const supplierEmail = po.supplier?.email || po.supplier_email || '';
    const poId = po.poId || po.po_id || 'N/A';
    const rfqId = po.rfqId || po.rfq_id || null;
    const dateCreated = po.dateCreated || po.date_created || po.createdAt 
      ? new Date(po.dateCreated || po.date_created || po.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : new Date().toLocaleDateString();
    
    const lines = po.lines || [];
    const totalAmount = po.total_amount || po.totalAmount || lines.reduce((sum, line) => {
      // Handle both camelCase and snake_case
      const lineTotal = parseFloat(line.line_total) || parseFloat(line.lineTotal);
      const price = parseFloat(line.price) || 0;
      const quantity = parseFloat(line.quantity_ordered) || parseFloat(line.quantityOrdered) || 0;
      return sum + (lineTotal || (price * quantity));
    }, 0);
    
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(totalAmount);

    const subject = `Purchase Order: ${poId}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Purchase Order</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${supplierName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We are pleased to issue the following purchase order. Please confirm receipt and proceed with fulfillment according to the terms and conditions specified below.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Purchase Order Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">PO Number:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #10b981;">${poId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${dateCreated}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #10b981; font-size: 18px;">${formattedTotal}</td>
        </tr>
        ${rfqId ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Reference RFQ:</td>
          <td style="padding: 8px 0;">${rfqId}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Quantity</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Unit Price</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((line, index) => {
            // Handle both camelCase and snake_case
            const productName = line.product?.name || line.product_name || 'Product';
            const quantity = line.quantity_ordered || line.quantityOrdered || line.quantity || 0;
            const unitPrice = parseFloat(line.price) || 0;
            const lineTotal = parseFloat(line.line_total) || parseFloat(line.lineTotal) || (unitPrice * quantity);
            const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(unitPrice);
            const formattedLineTotal = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(lineTotal);
            
            return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-size: 14px;">${productName}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">${quantity}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">${formattedPrice}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">${formattedLineTotal}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background: #f3f4f6; border-top: 2px solid #e5e7eb;">
            <td colspan="3" style="padding: 12px; text-align: right; font-size: 16px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #10b981;">${formattedTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0; font-size: 14px; color: #065f46;">
        <strong>Action Required:</strong> Please confirm receipt of this purchase order and provide an estimated delivery date. If you have any questions or concerns, please contact us immediately.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      We appreciate your prompt attention to this order and look forward to working with you.
    </p>
    
    <p style="font-size: 16px; margin-top: 20px;">
      Best regards,<br>
      <strong>Galaxy ERP Procurement Team</strong>
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">This is an automated email from Galaxy ERP System.</p>
      <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, html };
  }

  /**
   * Send RFQ email to vendor
   * @param {Object} rfq - RFQ data
   * @returns {Promise<Object>} Send result
   */
  async sendRFQEmail(rfq) {
    const vendorEmail = rfq.vendor?.email;
    if (!vendorEmail) {
      throw new Error('Vendor email is required');
    }

    const { subject, html } = this.generateRFQEmail(rfq);
    return await this.sendEmail({
      to: vendorEmail,
      subject,
      html,
    });
  }

  /**
   * Send Purchase Order email to vendor
   * @param {Object} po - Purchase Order data
   * @returns {Promise<Object>} Send result
   */
  async sendPOEmail(po) {
    // Handle both camelCase (Prisma) and snake_case (API response) formats
    const supplierEmail = po.supplier?.email || po.supplier_email;
    if (!supplierEmail) {
      throw new Error('Supplier email is required');
    }

    const { subject, html } = this.generatePOEmail(po);
    return await this.sendEmail({
      to: supplierEmail,
      subject,
      html,
    });
  }

  /**
   * Generate Sales Quotation email template
   * @param {Object} quotation - Sales Quotation data
   * @returns {Object} Email content with subject, html, and text
   */
  generateSalesQuotationEmail(quotation) {
    const customerName = quotation.customerName || 'Valued Customer';
    const customerEmail = quotation.customerEmail || '';
    const quotationNumber = quotation.quotationNumber || quotation.id;
    const validityDate = quotation.validityDate
      ? new Date(quotation.validityDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A';

    const items = quotation.items || [];
    const totalAmount = parseFloat(quotation.totalAmount) || 0;
    const taxAmount = parseFloat(quotation.taxAmount) || 0;
    const discountAmount = parseFloat(quotation.discountAmount) || 0;
    const freightCharges = parseFloat(quotation.freightCharges) || 0;
    const finalNetPrice = parseFloat(quotation.finalNetPrice) || 0;

    const subject = `Sales Quotation: ${quotationNumber}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Sales Quotation</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your interest in our products. We are pleased to provide you with the following quotation.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Quotation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Quotation Number:</td>
          <td style="padding: 8px 0;">${quotationNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Validity Date:</td>
          <td style="padding: 8px 0;">${validityDate}</td>
        </tr>
        ${quotation.customerCompanyName ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Company:</td>
          <td style="padding: 8px 0;">${quotation.customerCompanyName}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Qty</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Ex-Factory Price</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Tax</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Freight</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Discount</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => {
            const qty = parseInt(item.quantity) || 0;
            const exFactory = parseFloat(item.exFactoryPrice) || 0;
            const tax = parseFloat(item.taxCharges) || 0;
            const freight = parseFloat(item.freightCharges) || 0;
            const discount = parseFloat(item.discountAmount) || 0;
            const itemTotal = parseFloat(item.finalNetPrice) || 0;
            
            return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-size: 14px;">${item.productName || 'Product'}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">${qty}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">$${exFactory.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">$${tax.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">$${freight.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">$${discount.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">$${itemTotal.toFixed(2)}</td>
            </tr>
          `;
          }).join('')}
        </tbody>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Price Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 70%;">Subtotal (Ex-Factory):</td>
          <td style="padding: 8px 0; text-align: right;">$${totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tax Charges:</td>
          <td style="padding: 8px 0; text-align: right;">$${taxAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Freight Charges:</td>
          <td style="padding: 8px 0; text-align: right;">$${freightCharges.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Discount:</td>
          <td style="padding: 8px 0; text-align: right;">-$${discountAmount.toFixed(2)}</td>
        </tr>
        <tr style="border-top: 2px solid #667eea; margin-top: 10px;">
          <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Final Net Price:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">$${finalNetPrice.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    ${quotation.termsAndConditions ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0; font-size: 16px; color: #92400e;">Terms and Conditions</h3>
      <p style="margin: 0; font-size: 14px; color: #92400e; white-space: pre-wrap;">${quotation.termsAndConditions}</p>
    </div>
    ` : ''}
    
    <p style="font-size: 16px; margin-top: 30px;">
      This quotation is valid until ${validityDate}. If you have any questions or would like to proceed with this quotation, please contact us.
    </p>
    
    <p style="font-size: 16px; margin-top: 20px;">
      Best regards,<br>
      <strong>Galaxy ERP Sales Team</strong>
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">This is an automated email from Galaxy ERP System.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      subject,
      html,
      text: this.stripHtml(html)
    };
  }

  /**
   * Send Sales Quotation email to customer
   * @param {Object} quotation - Sales Quotation data
   * @returns {Promise<Object>} Send result
   */
  async sendSalesQuotationEmail(quotation) {
    const customerEmail = quotation.customerEmail;
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    const { subject, html } = this.generateSalesQuotationEmail(quotation);
    return await this.sendEmail({
      to: customerEmail,
      subject,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
