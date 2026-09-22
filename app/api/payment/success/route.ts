// app/api/payment/success/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id");
    const paymentRequestId = searchParams.get("payment_request_id");
    const status = searchParams.get("status");

    console.log("Payment success handler:", {
      paymentId,
      paymentRequestId,
      status,
    });

    const db = await getDb();

    // Find booking
    let booking = await db.collection("bookings").findOne({
      payment_id: paymentRequestId,
    });

    if (!booking && paymentRequestId) {
      booking = await db.collection("bookings").findOne({
        payment_request_id: paymentRequestId,
      });
    }

    if (!booking) {
      console.error("Booking not found:", paymentRequestId);
      return NextResponse.redirect(
        new URL(
          "/booking-error?message=BookingNotFound",
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    }

    if (status === "Credit" || booking.payment_status === "success") {
      // Update booking status if not already updated by webhook
      if (booking.payment_status !== "success") {
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

        // Send email if webhook didn't already send it
        const hotel = await db
          .collection("hotels")
          .findOne({ _id: booking.hotel });

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
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      return NextResponse.redirect(
        new URL(
          `/booking-success?id=${booking.booking_id}`,
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    } else {
      return NextResponse.redirect(
        new URL(
          `/booking-failure?id=${booking.booking_id}`,
          process.env.NEXT_PUBLIC_API_URL,
        ),
      );
    }
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
