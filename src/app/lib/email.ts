/**
 * Sends a 6-digit OTP verification email by calling the server-side
 * Netlify function, which talks to Resend. The Resend API key never
 * reaches the browser bundle — Resend blocks direct client-side calls
 * (CORS) by design to prevent API key exposure, so this must go through
 * a backend relay.
 */
export async function sendOtpViaResend(
  recipientEmail: string,
  otpCode: string,
  threadId: string,
  isResend = false
) {
  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recipientEmail, otp: otpCode, threadId, isResend }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || `Request failed with status ${response.status}` };
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error("OTP email dispatch failed:", err);
    return { success: false, error: err.message || "Network error while sending OTP email" };
  }
}
