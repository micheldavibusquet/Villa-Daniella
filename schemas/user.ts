import { defineField } from 'sanity';

const user = {
  name: 'user',
  title: 'Usuário',
  type: 'document',
  fields: [
    defineField({
      name: 'isAdmin',
      title: 'Is Admin',
      type: 'boolean',
      description: 'Check if the user is admin',
      initialValue: false,
      validation: Rule => Rule.required(),
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
      description: 'Name of the user',
      readOnly: true,
      validation: Rule => Rule
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'url',
    }),

    defineField({
      name: 'password',
      type: 'string',
      hidden: true, // 🔒 não aparece no painel
    }),

    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      // 🔧 Agora obrigatório
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'emailVerified',
      type: 'datetime',
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
      description: 'A brief description about the user',
    }),
    defineField({
      name: 'resetToken',
      type: 'string',
      // Oculto no Studio — gerenciado exclusivamente pela API de reset
      hidden: true,
    }),
    defineField({
      name: 'resetTokenExpiry',
      type: 'datetime',
      // Expiração do token — 1 hora após geração
      hidden: true,
    }),
  ],
};

export default user;