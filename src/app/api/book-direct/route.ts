import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { getRoom } from '@/libs/apis';
import { adminClient } from '@/libs/sanity';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { checkinDate, checkoutDate, adults, children, numberOfDays, hotelRoomSlug } =
    await req.json();

  if (!checkinDate || !checkoutDate || !hotelRoomSlug || !numberOfDays) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  const room = await getRoom(hotelRoomSlug);

  if (!room) {
    return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 });
  }

  const discount = room.discount || 0;
  const discountPrice = room.price - (room.price / 100) * discount;
  const totalPrice = Math.round(discountPrice * numberOfDays * 1.1 * 100) / 100;

  await adminClient.create({
    _type: 'booking',
    adults,
    checkinDate: checkinDate.split('T')[0],
    checkoutDate: checkoutDate.split('T')[0],
    children,
    numberOfDays,
    discount,
    totalPrice,
    user: { _type: 'reference', _ref: session.user.id },
    hotelRoom: { _type: 'reference', _ref: room._id },
  });

  return NextResponse.json({
    success: true,
    checkinDate: checkinDate.split('T')[0],
    checkoutDate: checkoutDate.split('T')[0],
    numberOfDays,
    totalPrice,
  });
}
