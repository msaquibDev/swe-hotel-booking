// app/api/payment/success/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const paymentId = searchParams.get("payment_id");
    const paymentRequestId = searchParams.get("payment_request_id");
    const paymentStatus = searchParams.get("payment_status");

    console.log("Payment success handler:", {
      paymentId,
      paymentRequestId,
      paymentStatus,
    });

    const db = await getDb();

    if (!paymentRequestId) {
      console.error("Missing payment_request_id");

      return NextResponse.redirect(
        new URL(
          "/booking-error?message=MissingPaymentRequestId",
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    }

    // Find booking using the payment request ID
    const booking = await db.collection("bookings").findOne({
      payment_request_id: paymentRequestId,
    });

    if (!booking) {
      console.error("Booking not found for payment request:", paymentRequestId);

      return NextResponse.redirect(
        new URL(
          "/booking-error?message=BookingNotFound",
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    }

    console.log("Booking found:", booking.booking_id);

    // Instamojo uses "Credit" for successful payments
    if (paymentStatus === "Credit") {
      await db.collection("bookings").updateOne(
        { _id: booking._id },
        {
          $set: {
            payment_status: "success",
            payment_id: paymentId,
            payment_request_id: paymentRequestId,
            updated_at: new Date(),
          },
        },
      );

      // Fetch hotel
      const hotel = await db
        .collection("hotels")
        .findOne({ _id: booking.hotel });

      // Send confirmation email
      try {
        await sendBookingConfirmationEmail({
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

        console.log(`Confirmation email sent for ${booking.booking_id}`);
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      return NextResponse.redirect(
        new URL(
          `/booking-success?id=${booking.booking_id}`,
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    }

    // Payment failed
    await db.collection("bookings").updateOne(
      { _id: booking._id },
      {
        $set: {
          payment_status: "failed",
          payment_id: paymentId,
          payment_request_id: paymentRequestId,
          updated_at: new Date(),
        },
      },
    );

    return NextResponse.redirect(
      new URL(
        `/booking-failure?id=${booking.booking_id}`,
        process.env.NEXT_PUBLIC_API_URL,
      ),
    );
  } catch (error) {
    console.error("Payment success handler error:", error);

    return NextResponse.redirect(
      new URL(
        "/booking-error?message=InternalError",
        process.env.NEXT_PUBLIC_API_URL,
      ),
    );
  }
}
