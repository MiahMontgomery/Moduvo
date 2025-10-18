import nodemailer from "nodemailer";
let transporter: nodemailer.Transporter | null = null;

export async function createEmailTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  try { await transporter.verify(); } catch { /* log-only; do not throw on boot */ }
  return transporter;
}

export async function sendQuoteEmail(to: string, subject: string, html: string) {
  const t = await createEmailTransporter();
  return t.sendMail({ from: process.env.FROM_EMAIL!, to, subject, html });
}

