import { Resend } from 'resend';

// Initialize Resend with the environment key
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

/**
 * Sends a 6-digit OTP verification email via Resend API
 */
export async function sendOtpViaResend(recipientEmail: string, otpCode: string) {
  if (!resendApiKey) {
    console.warn("Resend API key missing in .env");
    return { success: false, error: "Resend API key missing in .env" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ClaimSense Security <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: 'Your ClaimSense Verification Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">ClaimSense Security</h2>
          <p style="color: #94a3b8; font-size: 14px;">Your 6-digit OTP verification code is:</p>
          
          <div style="background-color: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #60a5fa; text-align: center; margin: 20px 0;">
            ${otpCode}
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
            This verification code will expire in <strong>10 minutes</strong>.<br/>
            If you did not request this code, please ignore this message.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Resend Exception:", err);
    return { success: false, error: err.message };
  }
}
