import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

/**
 * GET /api/admin/users
 *
 * Retorna todos os usuários cadastrados no sistema.
 * Acessível apenas por Super Administradores.
 *
 * Campos retornados: _id, name, email, image, role, isAdmin, _createdAt
 */
export async function GET(req: Request) {
  try {
    // Verifica se o usuário logado é Super Admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    // Busca o usuário logado para verificar seu role
    const currentUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0] { _id, role, isAdmin }`,
      { email: session.user.email },
    );

    // Somente Super Admin pode acessar a lista de usuários
    if (currentUser?.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Busca todos os usuários ordenados pelo nome
    const users = await adminClient.fetch(`
  *[_type == "user"] {
    _id,
    name,
    email,
    image,
    role,
    isAdmin,
    active,
    _createdAt
  } | order(name asc)
`);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuarios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuarios' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/users
 *
 * Atualiza o perfil de acesso (role) de um usuário.
 * Acessível apenas por Super Administradores.
 *
 * Regras de negócio:
 * - Só Super Admin pode alterar roles
 * - Super Admin não pode rebaixar a si mesmo se for o único Super Admin
 * - isAdmin é sincronizado automaticamente com o role
 *   (true para superAdmin e admin, false para viewer)
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { targetUserId, newRole, active } = await req.json();

    if (!targetUserId || (newRole === undefined && active === undefined)) {
      return NextResponse.json(
        { error: 'targetUserId e newRole ou active sao obrigatorios.' },
        { status: 400 },
      );
    }

    // Valida o role apenas quando ele for enviado
    if (newRole !== undefined) {
      const validRoles = ['superAdmin', 'admin', 'viewer'];
      if (!validRoles.includes(newRole)) {
        return NextResponse.json({ error: 'Role invalido' }, { status: 400 });
      }
    }

    // Busca o usuário logado para verificar seu role
    const currentUser = await adminClient.fetch(
      `*[_type == "user" && email == $email][0] { _id, role }`,
      { email: session.user.email },
    );

    if (currentUser?.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Proteção: impede que o único Super Admin se rebaixe
    const isSelf = currentUser._id === targetUserId;
    const isDowngrade = newRole !== 'superAdmin';

    if (isSelf && isDowngrade) {
      // Conta quantos Super Admins existem no sistema
      const superAdmins = await adminClient.fetch(
        `count(*[_type == "user" && role == "superAdmin"])`,
      );

      if (superAdmins <= 1) {
        return NextResponse.json(
          {
            error:
              'Voce e o unico Super Admin. Promova outro usuario antes de alterar seu proprio perfil.',
          },
          { status: 400 },
        );
      }
    }

    // Monta objeto de atualização dinamicamente
    const updates: Record<string, any> = {};

    if (newRole !== undefined) {
      updates.role = newRole;
      updates.isAdmin = newRole === 'superAdmin' || newRole === 'admin';
    }

    if (active !== undefined) {
      updates.active = active;
      // Desativar remove acesso admin por segurança
      if (!active) updates.isAdmin = false;
    }

    await adminClient.patch(targetUserId).set(updates).commit();

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil de acesso' },
      { status: 500 },
    );
  }
}
