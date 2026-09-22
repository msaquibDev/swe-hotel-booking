import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const paymentId = searchParams.get("payment_id");
    const paymentRequestId = searchParams.get("payment_request_id");
    const paymentStatus = searchParams.get("payment_status");

    console.log("=== INSTAMOJO SUCCESS ===");
    console.log({
      paymentId,
      paymentRequestId,
      paymentStatus,
    });

    // Use the actual request origin.
    // This avoids problems with NEXT_PUBLIC_API_URL on Vercel.
    const baseUrl = request.nextUrl.origin;

    console.log("Callback origin:", baseUrl);

    if (!paymentRequestId) {
      console.error("Missing payment_request_id");

      return NextResponse.redirect(
        new URL("/booking-error?message=MissingPaymentRequestId", baseUrl),
      );
    }

    const db = await getDb();

    console.log("Searching booking:", paymentRequestId);

    const booking = await db.collection("bookings").findOne({
      payment_request_id: paymentRequestId,
    });

    if (!booking) {
      console.error("Booking not found:", paymentRequestId);

      return NextResponse.redirect(
        new URL("/booking-error?message=BookingNotFound", baseUrl),
      );
    }

    console.log("Booking found:", booking.booking_id);

    // -----------------------------------------
    // PAYMENT SUCCESS
    // -----------------------------------------

    if (paymentStatus === "Credit") {
      console.log("Payment is Credit. Updating booking...");

      const updateResult = await db.collection("bookings").updateOne(
        {
          _id: booking._id,
        },
        {
          $set: {
            payment_status: "success",
            payment_id: paymentId,
            payment_request_id: paymentRequestId,
            updated_at: new Date(),
          },
        },
      );

      console.log("Booking payment update:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
      });

      // -----------------------------------------
      // EMAIL
      // -----------------------------------------

      try {
        const hotel = await db.collection("hotels").findOne({
          _id: booking.hotel,
        });

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
          `Confirmation email ${
            emailSent ? "sent" : "FAILED"
          } for ${booking.booking_id}`,
        );
      } catch (emailError) {
        console.error("Confirmation email error:", emailError);
      }

      // -----------------------------------------
      // SUCCESS REDIRECT
      // -----------------------------------------

      const successUrl = new URL(
        `/booking-success?id=${booking.booking_id}`,
        baseUrl,
      );

      console.log("Redirecting to:", successUrl.toString());

      return NextResponse.redirect(successUrl);
    }

    // -----------------------------------------
    // PAYMENT FAILED
    // -----------------------------------------

    console.log("Payment was not successful:", paymentStatus);

    await db.collection("bookings").updateOne(
      {
        _id: booking._id,
      },
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
      new URL(`/booking-failure?id=${booking.booking_id}`, baseUrl),
    );
  } catch (error) {
    console.error("=== PAYMENT SUCCESS HANDLER ERROR ===", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    const baseUrl = request.nextUrl.origin;

    return NextResponse.redirect(
      new URL("/booking-error?message=InternalError", baseUrl),
    );
  }
}
