import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const recipientName = name || "Valued Patron";

    // Luxury HTML template for the email
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fafaf8; padding: 40px 20px; color: #09090b;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; padding: 40px;">
          <div style="text-align: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 24px; margin-bottom: 30px;">
            <span style="font-size: 24px; font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; color: #09090b; display: block;">
              M O Z A R T
            </span>
            <span style="font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #71717a; margin-top: 4px; display: block;">
              High Fashion • Paris
            </span>
          </div>

          <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #09090b; margin-bottom: 16px;">
            Studio Account Verification
          </h2>

          <p style="font-size: 13px; line-height: 1.6; color: #52525b; margin-bottom: 24px;">
            Dear ${recipientName},<br/><br/>
            Thank you for requesting entry to the Mozart Private Studio. To authenticate your client profile and finalize your membership, please enter the following 6-digit confidential code:
          </p>

          <div style="text-align: center; background-color: #09090b; padding: 24px; margin: 28px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #fafaf8; display: inline-block;">
              ${code}
            </span>
            <span style="display: block; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #a1a1aa; margin-top: 8px;">
              Valid for 10 minutes
            </span>
          </div>

          <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin-bottom: 28px;">
            If you did not initiate this request, please disregard this transmission. Never share this code with anyone; our concierge will never solicit your verification code.
          </p>

          <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center; font-size: 10px; color: #a1a1aa; letter-spacing: 0.15em; text-transform: uppercase;">
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
          subject: `${code} is your Mozart Studio Verification Code`,
          text: `Dear ${recipientName}, your confidential Mozart verification code is: ${code}. Valid for 10 minutes.`,
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
      message: realEmailSent
        ? "Real email dispatched via Gmail SMTP."
        : "Email generated. Check your Gmail inbox or use the local Webmail client.",
      emailData: {
        to: email,
        recipientName,
        subject: `${code} is your Mozart Studio Verification Code`,
        code,
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
