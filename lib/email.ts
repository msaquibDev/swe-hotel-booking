// lib/email.ts
interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

interface BookingEmailData {
  booking_id: string;
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  hotel_name: string;
  hotel_address: string;
  hotel_image?: string;
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  total_amount: number;
  company_name?: string;
  address?: string;
  state?: string;
  gst_number?: string;
}

/**
 * Send email using ZeptoMail API
 * Docs: https://www.zoho.com/zeptomail/help/api/email-sending.html
 */
export async function sendEmail({
  to,
  toName = "Guest",
  subject,
  htmlBody,
  textBody,
}: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch(process.env.ZEPTO_URL!, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: process.env.ZEPTO_TOKEN!,
      },
      body: JSON.stringify({
        from: {
          address: process.env.ZEPTO_FROM,
          name: process.env.ZEPTO_FROM_NAME || "Hotel Booking",
        },
        to: [
          {
            email_address: {
              address: to,
              name: toName,
            },
          },
        ],
        subject: subject,
        htmlbody: htmlBody,
        textbody: textBody || htmlBody.replace(/<[^>]*>/g, ""),
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("ZeptoMail API error:", responseText);
      return false;
    }

    console.log(`Email sent to ${to}:`, responseText);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Format currency in Indian format
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Indian format
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate number of nights
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate booking confirmation email HTML
 */
export function generateBookingConfirmationEmail(
  booking: BookingEmailData,
): string {
  const nights = calculateNights(booking.check_in_date, booking.check_out_date);
  const fullName = `${booking.title} ${booking.first_name} ${booking.last_name}`;
  const amountFormatted = formatCurrency(booking.total_amount);
  const checkInFormatted = formatDate(booking.check_in_date);
  const checkOutFormatted = formatDate(booking.check_out_date);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f7;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:40px 30px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;background-color:rgba(255,255,255,0.2);border-radius:50%;line-height:64px;margin-bottom:16px;">
                <span style="font-size:32px;color:#ffffff;">✓</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Booking Confirmed!</h1>
              <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">Thank you for your booking</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 30px 16px;">
              <p style="margin:0;font-size:16px;color:#1f2937;line-height:1.6;">
                Dear <strong>${fullName}</strong>,
              </p>
              <p style="margin:12px 0 0;font-size:15px;color:#4b5563;line-height:1.6;">
                Your booking has been successfully confirmed and your payment has been received. We look forward to hosting you!
              </p>
            </td>
          </tr>

          <!-- Booking ID Banner -->
          <tr>
            <td style="padding:8px 30px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);border-radius:10px;border-left:4px solid #2563eb;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Booking Reference</p>
                    <p style="margin:4px 0 0;font-size:20px;color:#1e40af;font-weight:700;font-family:'Courier New',monospace;">${booking.booking_id}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hotel Details -->
          <tr>
            <td style="padding:0 30px 24px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">🏨 Hotel Details</h2>
              ${booking.hotel_image ? `<img src="${booking.hotel_image}" alt="${booking.hotel_name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;" />` : ""}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#6b7280;font-size:14px;">Hotel Name</span><br>
                    <span style="color:#111827;font-size:15px;font-weight:600;">${booking.hotel_name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#6b7280;font-size:14px;">Address</span><br>
                    <span style="color:#111827;font-size:15px;">${booking.hotel_address}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stay Details -->
          <tr>
            <td style="padding:0 30px 24px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📅 Stay Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="padding:8px 0;vertical-align:top;">
                          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:4px;">Check-in</span>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${checkInFormatted}</span>
                        </td>
                        <td width="50%" style="padding:8px 0;vertical-align:top;">
                          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:4px;">Check-out</span>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${checkOutFormatted}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:8px 0;vertical-align:top;">
                          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:4px;">Room Type</span>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${booking.room_type}</span>
                        </td>
                        <td width="50%" style="padding:8px 0;vertical-align:top;">
                          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:4px;">Duration</span>
                          <span style="color:#111827;font-size:15px;font-weight:600;">${nights} Night${nights > 1 ? "s" : ""}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Details -->
          <tr>
            <td style="padding:0 30px 24px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">👤 Guest Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="color:#6b7280;font-size:13px;display:block;">Name</span>
                    <span style="color:#111827;font-size:14px;">${fullName}</span>
                  </td>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="color:#6b7280;font-size:13px;display:block;">Email</span>
                    <span style="color:#111827;font-size:14px;">${booking.email}</span>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="color:#6b7280;font-size:13px;display:block;">Mobile</span>
                    <span style="color:#111827;font-size:14px;">${booking.mobile}</span>
                  </td>
                  ${
                    booking.company_name
                      ? `
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="color:#6b7280;font-size:13px;display:block;">Company</span>
                    <span style="color:#111827;font-size:14px;">${booking.company_name}</span>
                  </td>`
                      : "<td></td>"
                  }
                </tr>
                ${
                  booking.gst_number
                    ? `
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="color:#6b7280;font-size:13px;display:block;">GST Number</span>
                    <span style="color:#111827;font-size:14px;">${booking.gst_number}</span>
                  </td>
                  <td></td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Payment Summary -->
          <tr>
            <td style="padding:0 30px 24px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">💳 Payment Summary</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);border-radius:10px;color:#ffffff;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="color:rgba(255,255,255,0.85);font-size:14px;">Total Amount Paid</td>
                        <td align="right" style="color:#ffffff;font-size:24px;font-weight:700;">${amountFormatted}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.2);">
                          <span style="background-color:#10b981;color:#ffffff;font-size:12px;padding:4px 10px;border-radius:12px;font-weight:600;">✓ PAID</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Info -->
          <tr>
            <td style="padding:0 30px 24px;">
              <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:700;">📌 Important Information</p>
                <ul style="margin:0;padding-left:20px;font-size:13px;color:#78350f;line-height:1.8;">
                  <li>Please carry a valid government-issued ID proof during check-in.</li>
                  <li>Check-in time is typically 2:00 PM and check-out is 12:00 PM.</li>
                  <li>For any changes or cancellations, please contact us at least 24 hours in advance.</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:0 30px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Need help? Contact us at</p>
              <a href="mailto:info@synergymeetings.in" style="color:#2563eb;font-size:15px;font-weight:600;text-decoration:none;">info@synergymeetings.in</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This is an automated email. Please do not reply directly to this message.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">
                © ${new Date().getFullYear()} Conference Hotel Booking System. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version for email clients that don't support HTML
 */
export function generateBookingConfirmationText(
  booking: BookingEmailData,
): string {
  const nights = calculateNights(booking.check_in_date, booking.check_out_date);
  const fullName = `${booking.title} ${booking.first_name} ${booking.last_name}`;

  return `Dear ${fullName},

Your booking is CONFIRMED!

BOOKING REFERENCE: ${booking.booking_id}

HOTEL DETAILS
-------------
Hotel: ${booking.hotel_name}
Address: ${booking.hotel_address}

STAY DETAILS
------------
Check-in: ${formatDate(booking.check_in_date)}
Check-out: ${formatDate(booking.check_out_date)}
Room Type: ${booking.room_type}
Duration: ${nights} Night${nights > 1 ? "s" : ""}

PAYMENT SUMMARY
---------------
Total Amount Paid: ${formatCurrency(booking.total_amount)}
Status: PAID

IMPORTANT INFORMATION
---------------------
- Please carry a valid government-issued ID proof during check-in.
- Check-in time is typically 2:00 PM and check-out is 12:00 PM.
- For any changes or cancellations, please contact us at least 24 hours in advance.

For queries: info@synergymeetings.in

Thank you for booking with us!
© ${new Date().getFullYear()} Conference Hotel Booking System`;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  booking: BookingEmailData,
): Promise<boolean> {
  const subject = `Booking Confirmed - ${booking.booking_id} | ${booking.hotel_name}`;
  const htmlBody = generateBookingConfirmationEmail(booking);
  const textBody = generateBookingConfirmationText(booking);

  return sendEmail({
    to: booking.email,
    toName: `${booking.first_name} ${booking.last_name}`,
    subject,
    htmlBody,
    textBody,
  });
}
