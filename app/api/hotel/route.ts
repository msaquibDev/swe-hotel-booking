// app/api/hotel/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const hotels = await db.collection("hotels").find({}).toArray();

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { message: "Failed to fetch hotels" },
      { status: 500 },
    );
  }
}
