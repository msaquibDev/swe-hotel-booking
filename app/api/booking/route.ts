// app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const bookingId = generateBookingId();

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
      payment_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 },
    );
  }
}
