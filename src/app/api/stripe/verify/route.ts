import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { createBooking, updateHotelRoom } from '@/libs/apis';
import { adminClient } from '@/libs/sanity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id não fornecido' }, { status: 400 });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Pagamento não confirmado pelo Stripe' },
        { status: 402 }
      );
    }

    const metadata = stripeSession.metadata as any;
    const {
      adults,
      checkinDate,
      checkoutDate,
      children,
      hotelRoom,
      numberOfDays,
      user,
      discount,
      totalPrice,
    } = metadata;

    // Verifica se já existe reserva para esse sessionId (evita duplicata com webhook)
    const existingBooking = await adminClient.fetch(
      `*[_type == "booking" && stripeSessionId == $sid][0]`,
      { sid: sessionId }
    );

    if (!existingBooking) {
      await createBooking({
        adults: Number(adults),
        checkinDate,
        checkoutDate,
        children: Number(children),
        hotelRoom,
        numberOfDays: Number(numberOfDays),
        discount: Number(discount),
        totalPrice: Number(totalPrice),
        user,
      });

      await updateHotelRoom(hotelRoom);
    }

    return NextResponse.json(
      {
        success: true,
        roomName: stripeSession.line_items?.data?.[0]?.description ?? '',
        totalPrice,
        numberOfDays,
        checkinDate,
        checkoutDate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar pagamento' },
      { status: 500 }
    );
  }
}
