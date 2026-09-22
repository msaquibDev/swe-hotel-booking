// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Instamojo sends form data for webhooks
    const formData = await request.formData();

    // Extract all form data into an object
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("Payment callback received:", data);

    // Extract key fields
    const paymentId = data.payment_id;
    const paymentRequestId = data.payment_request_id;
    const status = data.status;

    const db = await getDb();

    // Find booking by payment_id (payment_request_id from Instamojo)
    let booking = await db.collection("bookings").findOne({
      payment_id: paymentRequestId,
    });

    // Fallback
    if (!booking && paymentRequestId) {
      booking = await db.collection("bookings").findOne({
        payment_request_id: paymentRequestId,
      });
    }

    if (!booking) {
      console.error("Booking not found for payment:", paymentRequestId);
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    if (status === "Credit") {
      // Payment successful
      await db.collection("bookings").updateOne(
        { _id: booking._id },
        {
          $set: {
            payment_status: "success",
            payment_id: paymentId || booking.payment_id,
            payment_request_id: paymentRequestId,
            updated_at: new Date(),
          },
        },
      );

      // Fetch hotel details for email
      const hotel = await db
        .collection("hotels")
        .findOne({ _id: booking.hotel });

      // Send confirmation email
      try {
        const emailSent = await sendBookingConfirmationEmail({
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

        console.log(
          `Booking ${booking.booking_id} confirmed, Email ${emailSent ? "sent" : "failed"}`,
        );
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }
    } else {
      // Payment failed
      await db.collection("bookings").updateOne(
        { _id: booking._id },
        {
          $set: {
            payment_status: "failed",
            payment_request_id: paymentRequestId,
            updated_at: new Date(),
          },
        },
      );

      console.log(`Booking ${booking.booking_id} payment failed`);
    }

    // Return success response for webhook
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
