interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "ContentFlow <noreply@contentflow.io>";

  if (!apiKey || apiKey.startsWith("re_demo")) {
    // In dev / test / demo environment without live API key, log to console
    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false };
  }
}

export function getPasswordResetEmailTemplate(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="color: #334155; line-height: 1.6;">You requested a password reset for your ContentFlow account. Click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function getNewsletterWelcomeEmailTemplate(unsubscribeUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 16px;">Welcome to ContentFlow!</h2>
      <p style="color: #334155; line-height: 1.6;">Thank you for subscribing to our newsletter. You will receive high-quality curated articles, development insights, and updates directly in your inbox.</p>
      <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        <a href="${unsubscribeUrl}" style="color: #94a3b8; font-size: 12px; text-decoration: underline;">Unsubscribe from this newsletter</a>
      </div>
    </div>
  `;
}
