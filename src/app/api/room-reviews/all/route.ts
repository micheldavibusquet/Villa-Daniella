/**
 * GET /api/room-reviews/all
 *
 * Retorna todas as avaliações cadastradas no sistema,
 * ordenadas da mais recente para a mais antiga.
 *
 * Utilizado pelo painel administrativo para exibir
 * o total de avaliações na Visão Geral.
 *
 * Campos retornados:
 * - _id, _createdAt, text, userRating
 * - hotelRoom: nome e slug da acomodação avaliada
 * - user: nome e e-mail do hóspede que avaliou
 */
import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';

export async function GET() {
  try {
    // Busca todas as avaliações expandindo as referências
    // de acomodação e usuário para exibição no painel
    const reviews = await adminClient.fetch(`
      *[_type == "review"] {
        _id,
        _createdAt,
        text,
        userRating,
        hotelRoom -> {
          name,
          slug
        },
        user -> {
          name,
          email
        }
      } | order(_createdAt desc)
    `);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliacoes' },
      { status: 500 },
    );
  }
}
