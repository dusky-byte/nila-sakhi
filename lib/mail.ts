import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string, type: "signup" | "reset") {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env");
    return;
  }
  const subject = type === "signup" ? "Your Clove Verification Code" : "Reset Your Clove Password";
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">Clove</h2>
      <p style="font-size: 16px; color: #4a4a4a;">Here is your 6-digit code:</p>
      <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #71717a;">This code will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Clove" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
