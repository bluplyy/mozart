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

    // Luxury Haute Couture HTML template for email clients (Gmail, Apple Mail, Outlook)
    const htmlTemplate = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm Your Mozart Membership</title>
        <style type="text/css">
          body { margin: 0 !important; padding: 0 !important; background-color: #f7f7f5 !important; }
          table { border-collapse: collapse !important; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
          a { text-decoration: none !important; color: inherit !important; }
          @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .card-content { padding: 32px 20px !important; }
            .cta-button { display: block !important; width: 100% !important; padding: 18px 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7f7f5" style="background-color: #f7f7f5; padding: 48px 0 64px 0;">
          <tr>
            <td align="center" valign="top">
              <div style="display: none; font-size: 1px; color: #f7f7f5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                Confirm your email address to activate your private membership privilege at MOZART Haute Couture Paris.
              </div>

              <table class="email-container" width="600" border="0" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; margin: 0 auto;">
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <span style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; letter-spacing: 0.38em; text-transform: uppercase; color: #09090b; display: block;">
                      M O Z A R T
                    </span>
                  </td>
                </tr>

                <!-- Main Card -->
                <tr>
                  <td align="center">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background-color: #ffffff; border: 1px solid #e7e7e5; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                      <tr>
                        <td class="card-content" style="padding: 48px 44px;">
                          <!-- Heading -->
                          <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: #09090b;">
                              Confirm Your Account
                            </h1>
                            <div style="width: 36px; height: 1px; background-color: #09090b; margin: 18px auto 0 auto; opacity: 0.2;"></div>
                          </div>

                          <!-- Body -->
                          <div style="font-size: 14px; line-height: 1.75; color: #3f3f46; margin-bottom: 32px;">
                            <p style="margin: 0 0 16px 0; font-weight: 500; color: #18181b;">
                              Dear ${recipientName},
                            </p>
                            <p style="margin: 0; font-weight: 300; color: #52525b;">
                              Thank you for requesting entry to the <strong>MOZART Private Studio</strong>. To authenticate your patron profile and finalize your membership registration, please confirm your email address:
                            </p>
                          </div>

                          <!-- Button -->
                          <div style="text-align: center; margin-bottom: 36px;">
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                              <tr>
                                <td align="center" bgcolor="#09090b" style="background-color: #09090b; border: 1px solid #09090b; color: #ffffff !important;">
                                  <a class="cta-button" href="${confirmLink}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: #ffffff !important; text-decoration: none !important; padding: 18px 40px; display: inline-block;">
                                    <span style="color: #ffffff !important; text-decoration: none !important; font-weight: 600;">
                                      Confirm Account &amp; Activate &rarr;
                                    </span>
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <div style="padding-top: 20px; font-size: 11px; color: #a1a1aa; line-height: 1.5; font-weight: 300; border-top: 1px solid #f0f0ee;">
                            This confidential link will expire in 24 hours. If you did not create an account on MOZART, no further action is required.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top: 36px; padding-bottom: 24px;">
                    <div style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #a1a1aa; line-height: 1.9; text-align: center;">
                      <span style="color: #71717a; font-weight: 600;">MOZART HAUTE COUTURE</span><br/>
                      12 Place Vendôme, 75001 Paris, France<br/>
                      © ${new Date().getFullYear()} MOZART STUDIO • All Rights Reserved<br/>
                      <span style="font-size: 9px; color: #c4c4c0; letter-spacing: 0.15em;">CONFIDENTIAL ATELIER TRANSMISSION</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
