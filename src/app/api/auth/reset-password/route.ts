import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/reset-password
 *
 * Valida o token de reset, atualiza a senha com bcrypt
 * e limpa o token do documento do usuário no Sanity.
 */
export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Dados incompletos.' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 },
      );
    }

    // Busca usuário pelo email E pelo token — ambos devem coincidir
    const user = await adminClient.fetch(
      `*[_type == "user" && email == $email && resetToken == $token][0]{
        _id,
        resetTokenExpiry
      }`,
      { email, token },
    );

    // Token não encontrado ou não pertence a esse email
    if (!user) {
      return NextResponse.json(
        { error: 'Link inválido. Solicite um novo.' },
        { status: 400 },
      );
    }

    // Verifica expiração — token válido por 1 hora
    const expiry = new Date(user.resetTokenExpiry);
    if (expiry < new Date()) {
      return NextResponse.json(
        { error: 'Este link expirou. Solicite um novo.' },
        { status: 400 },
      );
    }

    // Criptografa a nova senha com bcrypt (mesmo padrão do cadastro)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha e remove o token do documento
    // .unset() garante que resetToken e resetTokenExpiry não existam mais
    await adminClient
      .patch(user._id)
      .set({ password: hashedPassword })
      .unset(['resetToken', 'resetTokenExpiry'])
      .commit();

    console.log(`✅ Senha redefinida para: ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
