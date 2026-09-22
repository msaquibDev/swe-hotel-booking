// app/api/booking/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = await getDb();

    // Try to find by booking_id first, then by _id
    let booking = await db
      .collection("bookings")
      .findOne({ booking_id: params.id });

    if (!booking && ObjectId.isValid(params.id)) {
      booking = await db
        .collection("bookings")
        .findOne({ _id: new ObjectId(params.id) });
    }

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Fetch hotel details
    const hotel = await db.collection("hotels").findOne({ _id: booking.hotel });

    return NextResponse.json({
      ...booking,
      hotel: hotel,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { message: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}
