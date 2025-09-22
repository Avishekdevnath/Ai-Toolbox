let nodemailer: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require('nodemailer');
} catch {}

function resolveEnv(value?: string, fallback?: string) {
  return value ?? fallback ?? '';
}

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

export async function sendOtpEmail(to: string, code: string) {
  const fromName = process.env.EMAIL_FROM_NAME || 'AI Toolbox';
  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || 'no-reply@ai-toolbox.local';
  const from = `${fromName} <${fromEmail}>`;
  const subject = 'Your AI Toolbox verification code';
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code - AI Toolbox</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 20px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">AI Toolbox</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0; font-weight: 400;">Your Ultimate AI Tools Collection</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 50px 30px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Verify Your Email</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">Please use the verification code below to complete your account setup:</p>
          </div>

          <!-- Code Box -->
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #d1d5db; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #374151; font-size: 14px; font-weight: 500; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Verification Code</p>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <span style="color: #1f2937; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
            </div>
          </div>

          <!-- Info Box -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 30px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span style="color: #92400e; font-weight: 600; font-size: 14px;">Important</span>
            </div>
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.4;">This code will expire in <strong>10 minutes</strong> for security reasons. If you didn't request this code, please ignore this email.</p>
          </div>

          <!-- Instructions -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">How to use this code:</h3>
            <ol style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Return to the AI Toolbox sign-up page</li>
              <li style="margin-bottom: 8px;">Enter the verification code above</li>
              <li style="margin-bottom: 8px;">Complete your account setup</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">This email was sent by AI Toolbox</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you have any questions, please contact our support team.</p>
          <div style="margin-top: 20px;">
            <a href="https://aitoolbox-v1.vercel.app" style="display: inline-flex; align-items: center; color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Visit AI Toolbox
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const transport = getTransport();
  if (!transport) {
    console.log(`[DEV EMAIL] To: ${to}\nFrom: ${from}\nSubject: ${subject}\n${text}`);
    return { queued: true, dev: true };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { queued: true };
}
