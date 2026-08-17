import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { randomUUID } from "node:crypto";

const MAIL_DOMAIN = "rhirepro.com";
const THREAD_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

const resendApiKey = process.env.RESEND_API_KEY || "";

function otpEmailHtml(otpCode: string) {
  const digits = otpCode.split("");

  const digitCells = digits
    .map(
      (d) => `
        <td style="padding: 0 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; height: 52px; background-color: #1e293b; border: 1px solid #334155; border-radius: 10px; text-align: center; vertical-align: middle; font-size: 24px; font-weight: 700; color: #60a5fa;">
                ${d}
              </td>
            </tr>
          </table>
        </td>`
    )
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; max-width: 480px; margin: 0 auto;">
      <div style="text-align:center; margin-bottom: 8px;">
        <span style="display:inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.35); color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">ClaimSense Security</span>
      </div>
      <h2 style="color: #f8fafc; margin: 18px 0 4px; text-align:center; font-size: 20px;">Your verification code</h2>
      <p style="color: #94a3b8; font-size: 13px; text-align:center; margin: 0 0 22px;">Enter this code to finish signing in to ClaimSense.</p>

      <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 22px;">
        <tr>${digitCells}</tr>
      </table>

      <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align:center; margin: 0;">
        This code expires in <strong style="color:#94a3b8;">10 minutes</strong>.<br/>
        Didn't request this? You can safely ignore this email.
      </p>

      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #1e293b; text-align:center;">
        <span style="color:#475569; font-size: 11px;">256-bit Encrypted &nbsp;&bull;&nbsp; IRDAI Compliant</span>
      </div>
    </div>
  `;
}

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }

  if (!resendApiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "RESEND_API_KEY is not configured on the server" }),
    };
  }

  try {
    const { email, otp, threadId, isResend } = JSON.parse(event.body || "{}");

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Invalid email address" }) };
    }
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Invalid OTP code" }) };
    }

    // Thread every fresh sign-in/sign-up attempt as its own email conversation,
    // and only chain "Resend code" clicks onto that same thread — Gmail groups
    // messages by these RFC 2822 headers (falling back to matching subject +
    // sender when absent, which was collapsing unrelated sign-in attempts
    // together).
    const emailHeaders: Record<string, string> = {};
    if (typeof threadId === "string" && THREAD_ID_PATTERN.test(threadId)) {
      const rootMessageId = `<${threadId}@${MAIL_DOMAIN}>`;
      if (isResend) {
        emailHeaders["Message-ID"] = `<${randomUUID()}@${MAIL_DOMAIN}>`;
        emailHeaders["In-Reply-To"] = rootMessageId;
        emailHeaders["References"] = rootMessageId;
      } else {
        emailHeaders["Message-ID"] = rootMessageId;
      }
    }

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: "ClaimSense Security <otp@rhirepro.com>",
      to: [email],
      subject: "Your ClaimSense Verification Code",
      html: otpEmailHtml(otp),
      headers: Object.keys(emailHeaders).length ? emailHeaders : undefined,
    });

    if (error) {
      return { statusCode: 502, headers, body: JSON.stringify({ success: false, error: error.message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: data?.id }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message || "Unknown error" }) };
  }
};
