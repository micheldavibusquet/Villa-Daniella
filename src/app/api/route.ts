// src/app/api/users/route.ts
// Adicione o suporte a ?email= na rota existente de usuários

import { NextResponse } from 'next/server';
import { client } from '@/libs/sanity';

// GET /api/users?email=fulano@email.com
// Retorna o usuário com o campo isAdmin
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
  }

  try {
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{
        _id,
        name,
        email,
        image,
        isAdmin
      }`,
      { email },
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
