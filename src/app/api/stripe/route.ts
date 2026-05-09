import Stripe from 'stripe';

import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getRoom } from '@/libs/apis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

type RequestData = {
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children: number;
  numberOfDays: number;
  hotelRoomSlug: string;
};

export async function POST(req: Request) {

  const {
    checkinDate,
    adults,
    checkoutDate,
    children,
    hotelRoomSlug,
    numberOfDays,
  }: RequestData = await req.json();

  if (
  !checkinDate ||
  !checkoutDate ||
  !hotelRoomSlug ||
  numberOfDays === undefined ||
  numberOfDays <= 0
) {
  return new NextResponse(
    'Please all fields are required',
    { status: 400 }
  );
}

  const origin =
    req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Autenticação requerida', { status: 400 });
  }

  const userId = session.user.id;

  const formattedCheckoutDate = checkoutDate.split('T')[0];
  const formattedCheckinDate = checkinDate.split('T')[0];

  try {

    
    console.log("hotelRoomSlug:", hotelRoomSlug);
    
    const room = await getRoom(hotelRoomSlug);

    console.log("room encontrada:", room);

    const discount = room.discount || 0;

    const discountPrice =
      room.price - (room.price / 100) * discount;
    const totalPrice = discountPrice * numberOfDays;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: room.name,
              images: [],
            },
            unit_amount: Math.round(totalPrice * 100),
          },
        },
      ],

      payment_method_types: ['card'],

      success_url: `${origin}/users/${userId}`,
      cancel_url: `${origin}/rooms`,

      metadata: {
        adults,
        checkinDate: formattedCheckinDate,
        checkoutDate: formattedCheckoutDate,
        children,
        hotelRoom: room._id,
        numberOfDays,
        user: userId,
        discount,
        totalPrice,
      },
    });

    return NextResponse.json(stripeSession, {
      status: 200,
      statusText: 'Sessão de pagamento criada',
    });

  } catch (error: any) {
    console.log('Falha no pagamento', error);

    return new NextResponse('Erro ao criar sessão de pagamento', {
      status: 500,
    });
  }
}
