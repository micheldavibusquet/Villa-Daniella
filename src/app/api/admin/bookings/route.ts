import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { adminClient } from '@/libs/sanity';

/**
 * GET /api/admin/bookings
 *
 * Retorna todas as reservas cadastradas no sistema.
 * Acessível apenas por usuários com isAdmin = true.
 *
 * Campos retornados: dados da reserva, quarto e hóspede.
 */
export async function GET() {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verifica se é administrador
    const currentUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]{ isAdmin }`,
      { email: session.user?.email },
    );

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Busca todas as reservas com dados do quarto e do hóspede
    const bookings = await adminClient.fetch(`
      *[_type == "booking"] | order(_createdAt desc) {
        _id,
        checkinDate,
        checkoutDate,
        numberOfDays,
        adults,
        children,
        totalPrice,
        discount,
        paymentStatus,
        hotelRoom -> {
          name,
          slug
        },
        user -> {
          name,
          email
        }
      }
    `);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 },
    );
  }
}
