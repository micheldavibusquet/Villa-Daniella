import { NextResponse } from "next/server";
import { client } from "@/libs/sanity";
import { getRoomBookingsQuery } from "@/libs/sanityQueries";

export async function POST(req: Request) {
  try {
    const { roomId } = await req.json();

    const bookings = await client.fetch(getRoomBookingsQuery, { roomId });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}