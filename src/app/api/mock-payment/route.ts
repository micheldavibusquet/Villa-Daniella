import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { createBooking, getRoom, updateHotelRoom } from '@/libs/apis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const {
    roomSlug,
    checkinDate,
    checkoutDate,
    adults,
    children,
    numberOfDays,
    totalPrice,
    discount,
  } = await req.json();

  if (!roomSlug || !checkinDate || !checkoutDate || !numberOfDays) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  const room = await getRoom(roomSlug);

  if (!room) {
    return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 });
  }

  await createBooking({
    adults: Number(adults),
    checkinDate,
    checkoutDate,
    children: Number(children),
    hotelRoom: room._id,
    numberOfDays: Number(numberOfDays),
    discount: Number(discount ?? 0),
    totalPrice: Number(totalPrice),
    user: session.user.id,
  });

  await updateHotelRoom(room._id);

  return NextResponse.json({ success: true, userId: session.user.id });
}
