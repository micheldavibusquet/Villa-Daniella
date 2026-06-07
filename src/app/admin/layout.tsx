import { NextAuthProvider } from '@/components/AuthProvider/AuthProvider';

export const metadata = {
  title: 'Admin | Villa Daniella',
  description: 'Painel Administrativo',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
