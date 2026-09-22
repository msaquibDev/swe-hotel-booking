// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // console.log("Payment callback received:", data);

    const paymentId = data.payment_id;
    const paymentRequestId = data.payment_request_id;
    const status = data.status;

    // console.log("Payment details:", {
    //   paymentId,
    //   paymentRequestId,
    //   status,
    // });

    if (!paymentRequestId) {
      return NextResponse.json(
        { message: "Missing payment_request_id" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const booking = await db.collection("bookings").findOne({
      payment_request_id: paymentRequestId,
    });

    if (!booking) {
      console.error("Booking not found:", paymentRequestId);

      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    if (status === "Credit") {
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

      // console.log(`Booking ${booking.booking_id} payment successful`);
    } else if (status === "Failed") {
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

      // console.log(`Booking ${booking.booking_id} payment failed`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
