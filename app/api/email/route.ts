// app/api/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail, sendEmail } from "@/lib/email";

/**
 * POST /api/email
 * Send a custom email OR resend booking confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If bookingId provided, resend booking confirmation
    if (body.bookingId) {
      const db = await getDb();
      const booking = await db
        .collection("bookings")
        .findOne({ booking_id: body.bookingId });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 },
        );
      }

      const hotel = await db
        .collection("hotels")
        .findOne({ _id: booking.hotel });

      const success = await sendBookingConfirmationEmail({
        booking_id: booking.booking_id,
        title: booking.title,
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        mobile: booking.mobile,
        hotel_name: hotel?.hotel_name || "Hotel",
        hotel_address: hotel?.address || "",
        hotel_image: hotel?.main_image_url || "",
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        room_type: booking.room_type,
        total_amount: booking.total_amount,
        company_name: booking.company_name,
        address: booking.address,
        state: booking.state,
        gst_number: booking.gst_number,
      });

      return NextResponse.json({ success });
    }

    // Otherwise, send custom email
    const { to, toName, subject, htmlBody, textBody } = body;

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { message: "Missing required fields: to, subject, htmlBody" },
        { status: 400 },
      );
    }

    const success = await sendEmail({
      to,
      toName,
      subject,
      htmlBody,
      textBody,
    });

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 },
    );
  }
}
