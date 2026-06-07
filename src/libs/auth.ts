import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
//import { SanityAdapter } from 'next-auth-sanity';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { client, adminClient } from './sanity';

console.log('GOOGLE ID:', process.env.GOOGLE_CLIENT_ID);

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔵 GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // 🔐 EMAIL / SENHA
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;

        const user = await client.fetch(
          `*[_type == "user" && email == $email][0]{
            _id,
            name,
            email,
            password
          }`,
          { email },
        );

        // ❌ usuário não existe — envia erro específico para o frontend
        if (!user) throw new Error('USER_NOT_FOUND');

        // ❌ usuário criado via Google
        if (!user.password) {
          throw new Error('Use login com Google');
        }

        // ❌ senha incorreta
        // ✅ SEGURO — comparação com hash bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return null;
        }

        // ✅ sucesso
        return {
          id: user._id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  session: {
    strategy: 'jwt',
  },

  //adapter: SanityAdapter(adminClient as any),

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await client.fetch(
          `*[_type == "user" && email == $email][0]{
            _id
          }`,
          { email: user.email },
        );

        if (!existingUser) {
          await adminClient.create({
            _type: 'user',
            name: user.name,
            email: user.email,
            image: user.image || '',
            isAdmin: false,
            about: '',
          });
        }
      }

      return true;
    },

    async session({ session, token }) {
      try {
        const userEmail = token?.email;

        if (!userEmail) {
          return session;
        }

        const userIdObj = await client.fetch<{ _id: string }>(
          `*[_type == "user" && email == $email][0] {
            _id
          }`,
          { email: userEmail },
        );

        return {
          ...session,
          user: {
            ...session.user,
            id: userIdObj?._id || null,
          },
        };
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
};
