let nodemailer: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require('nodemailer');
} catch {}

function getTransport() {
  // Map provided envs to SMTP_*
  const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const SMTP_PORT = process.env.SMTP_PORT || process.env.EMAIL_PORT || '587';
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (nodemailer && SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return null;
}

/**
 * Send OTP email
 */
export async function sendOTP(
  email: string, 
  otpCode: string, 
  subject: string = 'Password Change Verification'
): Promise<void> {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'AI Toolbox';
    const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@ai-toolbox.local';
    const from = `${fromName} <${fromEmail}>`;
    
    const text = `Your verification code is ${otpCode}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">AI Toolbox</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${subject}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Your Verification Code</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
            Use the following verification code to complete your password change:
          </p>
          
          <div style="background: #f8f9fa; border: 2px dashed #dee2e6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #495057; letter-spacing: 4px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </span>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px; line-height: 1.5;">
            <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              This is an automated message from AI Toolbox. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const transport = getTransport();
    if (!transport) {
      console.log(`[DEV EMAIL] To: ${email}\nFrom: ${from}\nSubject: ${subject}\n${text}`);
      return;
    }

    await transport.sendMail({ from, to: email, subject, text, html });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}


/**
 * Send welcome email
 */
/**
 * Send password change confirmation email
 */
export async function sendPasswordChangeConfirmation(email: string, username: string): Promise<void> {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'AI Toolbox';
    const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@ai-toolbox.local';
    const from = `${fromName} <${fromEmail}>`;
    
    const text = `Your password has been successfully changed. If you did not make this change, please contact support immediately.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔒 Password Changed Successfully</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Security Update Confirmation</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${username}!</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
            Your password has been successfully changed. This is a security confirmation to let you know that your account password was updated.
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #0c4a6e; margin: 0; font-weight: 500;">
              <strong>Security Information:</strong>
            </p>
            <ul style="color: #0c4a6e; margin: 10px 0 0 0; padding-left: 20px;">
              <li>Password changed on: ${new Date().toLocaleString()}</li>
              <li>If you made this change, no further action is required</li>
              <li>If you did NOT make this change, please contact support immediately</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              This is an automated security notification from AI Toolbox. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const transport = getTransport();
    if (!transport) {
      console.log(`[DEV EMAIL] To: ${email}\nFrom: ${from}\nSubject: Password Changed Successfully\n${text}`);
      return;
    }

    await transport.sendMail({ from, to: email, subject: '🔒 Password Changed Successfully', text, html });
    console.log(`✅ Password change confirmation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send password change confirmation email:', error);
    throw new Error('Failed to send password change confirmation email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, username: string, resetUrl: string): Promise<void> {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'AI Toolbox';
    const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@ai-toolbox.local';
    const from = `${fromName} <${fromEmail}>`;

    const text = `Reset your password by clicking the link: ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Reset Your Password</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${username}!</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
            We received a request to reset your password for your AI Toolbox account. If you made this request, click the button below to reset your password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <div style="background: #f8f9fa; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Security Information:</strong><br>
              • This link will expire in 1 hour<br>
              • If you didn't request this reset, please ignore this email<br>
              • Your password will remain unchanged until you click the link above
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              This is an automated security message from AI Toolbox. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const transport = getTransport();
    if (!transport) {
      console.log(`[DEV EMAIL] To: ${email}\nFrom: ${from}\nSubject: Reset Your Password\n${text}`);
      return;
    }

    await transport.sendMail({ from, to: email, subject: '🔐 Reset Your Password', text, html });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'AI Toolbox';
    const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@ai-toolbox.local';
    const from = `${fromName} <${fromEmail}>`;
    
    const text = `Welcome to AI Toolbox, ${username}! Get ready to supercharge your productivity with our collection of AI-powered tools.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to AI Toolbox!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered productivity suite</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${username}!</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
            Welcome to AI Toolbox! We're excited to have you on board. Get ready to supercharge your productivity with our collection of AI-powered tools.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">What you can do:</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Generate comprehensive SWOT analyses</li>
              <li>Get personalized financial advice</li>
              <li>Create QR codes and shorten URLs</li>
              <li>Track product prices with AI</li>
              <li>And much more!</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Get Started
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              This is an automated message from AI Toolbox. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const transport = getTransport();
    if (!transport) {
      console.log(`[DEV EMAIL] To: ${email}\nFrom: ${from}\nSubject: Welcome to AI Toolbox!\n${text}`);
      return;
    }

    await transport.sendMail({ from, to: email, subject: 'Welcome to AI Toolbox!', text, html });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}
