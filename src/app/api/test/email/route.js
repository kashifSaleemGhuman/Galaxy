import { NextResponse } from 'next/server';
import emailService from '@/lib/email';

// Test endpoint to check email service
export async function POST(req) {
  try {
    const { to } = await req.json();
    
    if (!to) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    console.log('Testing email service...');
    const providers = emailService.getConfiguredProviders();
    console.log('Configured providers:', providers);
    
    const testResult = await emailService.sendEmail({
      to,
      subject: 'Test Email from Galaxy ERP',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Galaxy ERP email service.</p>
        <p>If you received this, the email service is working correctly.</p>
      `,
    });

    return NextResponse.json({
      success: testResult.success,
      provider: testResult.provider,
      messageId: testResult.messageId,
      error: testResult.message,
      details: testResult,
    });
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

