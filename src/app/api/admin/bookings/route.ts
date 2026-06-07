import { NextResponse } from 'next/server';
import { client } from '@/libs/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Autenticacao Requerida', { status: 401 });
  }

  try {
    const bookings = await client.fetch(
      `*[_type == "booking"] {
        _id,
        checkinDate,
        checkoutDate,
        numberOfDays,
        adults,
        children,
        totalPrice,
        paymentStatus,
        hotelRoom -> { name, slug },
        user -> { name, email }
      } | order(_createdAt desc)`,
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
