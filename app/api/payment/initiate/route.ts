// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { initiatePayment } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    // Validate required fields
    const requiredFields = [
      "hotel",
      "title",
      "first_name",
      "last_name",
      "gender",
      "email",
      "mobile",
      "address",
      "state",
      "company_name",
      "check_in_date",
      "check_out_date",
      "room_type",
      "total_amount",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Validate hotel ID
    if (!ObjectId.isValid(body.hotel)) {
      return NextResponse.json(
        { message: "Invalid hotel ID" },
        { status: 400 },
      );
    }

    // Find hotel
    const hotel = await db.collection("hotels").findOne({
      _id: new ObjectId(body.hotel),
    });

    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    // Generate booking ID
    const timestamp = Date.now().toString(36).toUpperCase();

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    const bookingId = `BK${timestamp}${random}`;

    // Create booking
    const booking = {
      booking_id: bookingId,
      hotel: new ObjectId(body.hotel),

      title: body.title,
      first_name: body.first_name,
      middle_name: body.middle_name || "",
      last_name: body.last_name,
      gender: body.gender,

      email: body.email,
      mobile: body.mobile,

      address: body.address,
      state: body.state,

      company_name: body.company_name,
      gst_number: body.gst_number || "",

      check_in_date: body.check_in_date,
      check_out_date: body.check_out_date,
      room_type: body.room_type,

      total_amount: body.total_amount,

      // Payment starts as pending
      payment_status: "pending",

      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection("bookings").insertOne(booking);

    // Instamojo redirects customer here after payment
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/payment/success`;

    // Initiate Instamojo payment
    const { paymentUrl, paymentRequestId } = await initiatePayment({
      bookingId,

      amount: body.total_amount,

      customerName: `${body.first_name} ${body.last_name}`,

      customerEmail: body.email,

      customerPhone: body.mobile,

      description: `Hotel Booking - ${hotel.hotel_name} - ${bookingId}`,

      redirectUrl,
    });

    console.log("Payment initiated successfully:", {
      bookingId,
      paymentRequestId,
      paymentUrl,
    });

    return NextResponse.json({
      success: true,
      booking_id: bookingId,

      payment_url: paymentUrl,

      // This is the Instamojo PAYMENT REQUEST ID
      payment_request_id: paymentRequestId,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to initiate payment",
      },
      { status: 500 },
    );
  }
}
