import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'samhiag9958@gmail.com',
    pass: 'aqdi upyn iejn hpeo',
  },
});

export async function POST(request: Request) {
  try {
    const { email, otp, appName } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: `"${appName || 'LankaCare'}" <samhiag9958@gmail.com>`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f766e; margin: 0;">${appName || 'LankaCare'}</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Recovery System</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; text-align: center;">
            <p style="color: #334155; font-size: 16px; margin-bottom: 16px;">
              You have requested to reset your password. Use the following One-Time Password (OTP) to proceed:
            </p>
            
            <div style="background-color: #ffffff; border: 2px dashed #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="color: #0f766e; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h2>
            </div>
            
            <p style="color: #64748b; font-size: 13px;">
              This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ${appName || 'LankaCare'} Digital Health System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP email', details: error.message },
      { status: 500 }
    );
  }
}
