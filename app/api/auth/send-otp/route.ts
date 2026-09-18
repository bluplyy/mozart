import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name, code, token, confirmationUrl: customConfirmationUrl } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const recipientName = name || "Valued Patron";

    // Determine base URL from headers or fallback
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    // Compute activation link
    const confirmToken = token || code || "verify";
    const confirmLink = customConfirmationUrl || `${baseUrl}/confirm?token=${encodeURIComponent(confirmToken)}&email=${encodeURIComponent(email)}`;

    // Luxury HTML template for email confirmation
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fafaf8; padding: 40px 20px; color: #09090b;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; padding: 44px 36px;">
          <div style="text-align: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 24px; margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; color: #09090b; display: block;">
              M O Z A R T
            </span>
            <span style="font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #71717a; margin-top: 4px; display: block;">
              Haute Couture • Paris
            </span>
          </div>

          <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #09090b; margin-bottom: 18px; text-align: center;">
            Confirm Your Client Profile
          </h2>

          <p style="font-size: 13px; line-height: 1.7; color: #52525b; margin-bottom: 28px;">
            Dear ${recipientName},<br/><br/>
            Thank you for requesting entry to the Mozart Private Studio. To confirm your account and finalize your membership privilege, please confirm your email address by clicking the button below:
          </p>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${confirmLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #09090b; color: #fafaf8; padding: 18px 36px; font-size: 11px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; border: 1px solid #09090b;">
              Confirm Account &amp; Activate &rarr;
            </a>
          </div>

          <p style="font-size: 11px; line-height: 1.6; color: #71717a; margin-bottom: 24px; text-align: center;">
            If the button above does not work, copy and paste this link into your browser:<br/>
            <a href="${confirmLink}" style="color: #09090b; word-break: break-all; text-decoration: underline;">
              ${confirmLink}
            </a>
          </p>

          <p style="font-size: 11px; line-height: 1.6; color: #a1a1aa; margin-top: 28px; border-top: 1px solid #f4f4f5; pt-4; text-align: center;">
            This confirmation link will remain valid for 24 hours. If you did not create a Mozart account, please disregard this transmission.
          </p>

          <div style="border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 24px; text-align: center; font-size: 10px; color: #a1a1aa; letter-spacing: 0.15em; text-transform: uppercase;">
            12 Vendome Square, 75001 Paris, France<br/>
            © ${new Date().getFullYear()} MOZART STUDIO. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    `;

    // Check if real Gmail SMTP credentials exist
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    let realEmailSent = false;
    let smtpError: string | null = null;

    if (gmailUser && gmailAppPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        await transporter.sendMail({
          from: `"Mozart Studio Paris" <${gmailUser}>`,
          to: email,
          subject: `Confirm Your Mozart Private Studio Membership`,
          text: `Dear ${recipientName}, please confirm your Mozart Private Studio account by visiting this link: ${confirmLink}`,
          html: htmlTemplate,
        });

        realEmailSent = true;
      } catch (err: any) {
        console.error("Nodemailer Gmail dispatch error:", err);
        smtpError = err?.message || "Failed to dispatch via Gmail SMTP";
      }
    }

    return NextResponse.json({
      success: true,
      realEmailSent,
      smtpConfigured: !!(gmailUser && gmailAppPassword),
      smtpError,
      confirmationUrl: confirmLink,
      message: realEmailSent
        ? "Confirmation email dispatched via Gmail SMTP."
        : "Confirmation email generated. Check your email or use the Webmail client.",
      emailData: {
        to: email,
        recipientName,
        subject: `Confirm Your Mozart Private Studio Membership`,
        code: code || confirmToken,
        token: confirmToken,
        confirmationUrl: confirmLink,
        sentAt: new Date().toISOString(),
        htmlContent: htmlTemplate,
      },
    });
  } catch (error: any) {
    console.error("send-otp route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
