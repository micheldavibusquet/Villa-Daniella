import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminClient } from '@/libs/sanity';
import { sendWelcomeEmail } from '@/libs/email';

/**
 * POST /api/auth/register
 *
 * Cria uma nova conta de usuário com senha criptografada.
 *
 * Regras:
 * - Email não pode já estar cadastrado
 * - Senha é criptografada com bcrypt antes de salvar (salt rounds: 10)
 * - Novos usuários não têm acesso administrativo por padrão (isAdmin: false)
 *
 * Body esperado: { name, email, password }
 */
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Valida campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios.' },
        { status: 400 },
      );
    }

    // Verifica se o email já está cadastrado
    const existingUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email },
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado.' },
        { status: 409 },
      );
    }

    // Criptografa a senha com bcrypt
    // salt rounds = 10 é o padrão recomendado (equilíbrio entre segurança e performance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no Sanity
    const newUser = await adminClient.create({
      _type: 'user',
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      about: '',
    });

    // Email de boas-vindas — falha silenciosa para não bloquear o cadastro
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.warn('⚠️ Email de boas-vindas não enviado:', emailError);
    }

    return NextResponse.json(
      { success: true, userId: newUser._id },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar conta.' },
      { status: 500 },
    );
  }
}
