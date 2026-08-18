const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Extract the reset URL or fall back to the raw URL from message text
  const resetUrl =
    options.resetUrl ||
    (options.message && options.message.match(/https?:\/\/[^\s]+/)?.[0]) ||
    "#";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        /* General resets for email clients */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F7FAFC; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      <!-- Outer Container Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7FAFC; padding: 40px 10px;">
        <tr>
          <td align="center">
            
            <!-- Email Card -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              
              <!-- Header / Branding -->
              <tr>
                <td style="padding: 32px 32px 0 32px; text-align: left;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color: #2F80ED; border-radius: 10px; width: 36px; height: 36px; text-align: center; vertical-align: middle;">
                        <span style="color: #FFFFFF; font-weight: bold; font-size: 18px; line-height: 36px;">J</span>
                      </td>
                      <td style="padding-left: 12px; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
                        Jobnique<span style="color: #2F80ED;">.</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 28px 32px 32px 32px; color: #374151; font-size: 15px; line-height: 24px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">
                    Password Reset Request
                  </h1>
                  <p style="margin: 0 0 16px 0; color: #4B5563;">
                    We received a request to reset the password for your <strong>Jobnique</strong> account. Click the button below to choose a new password:
                  </p>
                  
                  <!-- Call-to-Action Button -->
                  <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                    <tr>
                      <td align="center" style="border-radius: 25px; background-color: #2F80ED;">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 25px; background-color: #2F80ED; border: 1px solid #2F80ED;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">
                    This link is valid for <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email—your password will remain unchanged.
                  </p>

                  <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 24px 0;" />

                  <!-- Plain Text Fallback Link -->
                  <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 18px; word-break: break-all;">
                    Button not working? Copy and paste this URL into your browser:<br />
                    <a href="${resetUrl}" style="color: #2F80ED; text-decoration: underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

            </table>
            
            <!-- Footer Notes -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin-top: 20px;">
              <tr>
                <td style="text-align: center; font-size: 12px; color: #9CA3AF; line-height: 18px;">
                  &copy; ${new Date().getFullYear()} Jobnique Inc. All rights reserved.<br />
                  This is an automated system notification. Please do not reply directly to this email.
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Jobnique Support" <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject || "Reset your Jobnique password",
    text: `You requested a password reset for your Jobnique account. Please visit this URL to complete the reset: ${resetUrl}`, // Plain text fallback
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent successfully. Message ID:", info.messageId);
};

module.exports = sendEmail;