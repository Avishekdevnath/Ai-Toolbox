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
  const html = `<p>Your verification code is <b>${code}</b>.</p><p>It expires in 10 minutes.</p>`;

  const transport = getTransport();
  if (!transport) {
    console.log(`[DEV EMAIL] To: ${to}\nFrom: ${from}\nSubject: ${subject}\n${text}`);
    return { queued: true, dev: true };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { queued: true };
}
