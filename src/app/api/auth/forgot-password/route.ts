import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/libs/email';

/**
 * POST /api/auth/forgot-password
 *
 * Gera um token seguro de reset e salva no Sanity com expiração de 1 hora.
 * Em desenvolvimento retorna o link diretamente na resposta.
 * Em produção o link deve ser enviado por email.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório.' },
        { status: 400 },
      );
    }

    // Busca o usuário — campos mínimos necessários
    const user = await adminClient.fetch(
      `*[_type == "user" && email == $email][0]{ _id, password }`,
      { email },
    );

    // Resposta genérica por segurança — não revela se o email existe
    // Isso evita ataques de enumeração de usuários
    if (!user) {
      return NextResponse.json({
        message:
          'Se este email estiver cadastrado, você receberá as instruções em breve.',
      });
    }

    // Conta Google não tem senha — reset por email não se aplica
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            'Esta conta usa login com Google. Use o botão "Entrar com Google".',
        },
        { status: 400 },
      );
    }

    // Gera token criptograficamente seguro (32 bytes = 64 chars hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Token expira em 1 hora
    const resetTokenExpiry = new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString();

    // Persiste o token no documento do usuário no Sanity
    await adminClient
      .patch(user._id)
      .set({ resetToken, resetTokenExpiry })
      .commit();

    // Monta a URL de reset com token e email como parâmetros
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Envia email real com o link de reset
    await sendPasswordResetEmail(email, resetUrl);

    console.log(`📧 Email de reset enviado para: ${email}`);

    return NextResponse.json({
      message: 'Link de recuperação enviado para o seu email.',
    });
  } catch (error) {
    console.error('Erro ao gerar token de reset:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
