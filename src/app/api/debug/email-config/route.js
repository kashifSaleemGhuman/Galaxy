import { NextResponse } from 'next/server';
import emailService from '@/lib/email';

// Debug endpoint to check email configuration
export async function GET() {
  try {
    const config = {
      resendConfigured: emailService.isProviderConfigured('resend'),
      sendgridConfigured: emailService.isProviderConfigured('sendgrid'),
      smtpConfigured: emailService.isProviderConfigured('smtp'),
      configuredProviders: emailService.getConfiguredProviders(),
      fromEmail: emailService.fromEmail,
      fromName: emailService.fromName,
      env: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET',
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_USER: process.env.SMTP_USER || 'NOT SET',
        EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
      }
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

