import { defineField } from 'sanity';

/**
 * Schema do usuário no Sanity CMS.
 *
 * Controla a estrutura dos dados de cada usuário cadastrado,
 * incluindo campos de autenticação, perfil e nível de acesso.
 *
 * Campos de acesso:
 * - isAdmin: mantido por compatibilidade com o sistema existente
 * - role: novo campo para controle granular de permissões (RBAC)
 */
const user = {
  name: 'user',
  title: 'Usuario',
  type: 'document',
  fields: [
    defineField({
      name: 'isAdmin',
      title: 'Is Admin',
      type: 'boolean',
      description: 'Indica se o usuario tem acesso ao painel administrativo',
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'role',
      title: 'Perfil de Acesso',
      type: 'string',
      description:
        'Define o nivel de permissao do usuario no painel administrativo. ' +
        'Super Admin gerencia tudo inclusive outros usuarios. ' +
        'Admin gerencia acomodacoes e reservas. ' +
        'Viewer apenas visualiza sem poder editar.',
      options: {
        list: [
          { title: 'Super Administrador', value: 'superAdmin' },
          { title: 'Administrador', value: 'admin' },
          { title: 'Somente Visualizacao', value: 'viewer' },
        ],
        layout: 'radio',
      },
      initialValue: 'viewer',
    }),
    defineField({
      name: 'active',
      title: 'Conta Ativa',
      type: 'boolean',
      description:
        'Desative para bloquear o acesso sem excluir o historico do usuario.',
      initialValue: true,
    }),

    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'Nome completo do usuario (preenchido automaticamente via OAuth)',
      readOnly: true,
      validation: (Rule) => Rule,
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'url',
    }),

    defineField({
      name: 'password',
      type: 'string',
      // Oculto no Studio pois e gerenciado pelo sistema de autenticacao
      hidden: true,
    }),

    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'emailVerified',
      type: 'datetime',
      // Oculto no Studio — gerenciado internamente pelo NextAuth
      hidden: true,
    }),

    defineField({
      name: 'phone',
      title: 'Telefone',
      type: 'string',
    }),

    defineField({
      name: 'about',
      title: 'About',
      type: 'text',
      description: 'Breve descricao sobre o usuario',
    }),
  ],
};

export default user;
