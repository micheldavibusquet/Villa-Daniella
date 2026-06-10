import NextAuth from 'next-auth';
import { authOptions } from '@/libs/auth';

/**
 * Rota principal do NextAuth.
 * Captura todas as requisições em /api/auth/* e delega para o NextAuth.
 * Inclui: login, logout, callback OAuth, sessão, CSRF token, etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
