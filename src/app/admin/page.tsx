'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminRooms from './AdminRooms';
import AdminBookings from './AdminBookings';
import AdminUsers from './AdminUsers';
import { signOut } from 'next-auth/react';
import Chart from '@/components/Chart/Chart';
import { Booking } from '@/models/booking';

/**
 * Tipos de abas disponíveis no painel.
 * A aba 'users' só é exibida para Super Admin.
 */
type Tab = 'dashboard' | 'rooms' | 'bookings' | 'users';

/**
 * Roles disponíveis no sistema (RBAC).
 * - superAdmin: acesso total + gerencia usuários
 * - admin: gerencia acomodações e reservas
 * - viewer: somente visualização
 */
type Role = 'superAdmin' | 'admin' | 'viewer';

/** Estatísticas exibidas na Visão Geral do painel */
type Stats = {
  totalRooms: number;
  confirmedBookings: number;
  pendingBookings: number;
  occupancyRate: number;
  totalReviews: number;
};
/** Estrutura das reservas retornadas pelo endpoint admin */
type AdminBooking = {
  _id: string;
  hotelRoom: { name: string; slug: { current: string } };
  user?: { name: string; email: string };
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  adults: number;
  children: number;
  totalPrice: number;
  discount: number;
  paymentStatus?: boolean;
};

/** Labels exibidos no sidebar para cada role */
const ROLE_LABELS: Record<Role, string> = {
  superAdmin: 'Super Administrador',
  admin: 'Administrador',
  viewer: 'Visualizacao',
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [authState, setAuthState] = useState<'checking' | 'allowed' | 'denied'>(
    'checking',
  );

  // Role e ID do usuário logado — usados para controle de acesso
  const [userRole, setUserRole] = useState<Role>('viewer');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }

    // Busca os dados do usuário logado incluindo role
    axios
      .get(`/api/users?email=${encodeURIComponent(session.user.email)}`)
      .then(({ data }) => {
        if (data?.isAdmin === true) {
          setAuthState('allowed');
          // Define o role: usa o campo role se disponível,
          // caso contrário trata como admin por compatibilidade
          setUserRole(data.role ?? 'admin');
          setCurrentUserId(data._id ?? '');
        } else {
          setAuthState('denied');
          setTimeout(() => router.push('/'), 2500);
        }
      })
      .catch(() => {
        setAuthState('denied');
        setTimeout(() => router.push('/'), 2500);
      });
  }, [session, status, router]);

  if (status === 'loading' || authState === 'checking') {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinnerRing} className='animate-spin' />
        <p style={styles.loadingText}>Verificando credenciais...</p>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.deniedIcon}>X</span>
        <p style={styles.deniedTitle}>Acesso Negado</p>
        <p style={styles.loadingText}>
          Voce nao tem permissao de administrador.
        </p>
        <p style={styles.redirectText}>Redirecionando...</p>
      </div>
    );
  }

  // Abas disponíveis — Usuários só aparece para Super Admin
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Visao Geral', icon: '#' },
    { id: 'rooms', label: 'Acomodacoes', icon: '[]' },
    { id: 'bookings', label: 'Reservas', icon: '<>' },
    ...(userRole === 'superAdmin'
      ? [{ id: 'users' as Tab, label: 'Usuarios', icon: '@' }]
      : []),
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>*</span>
            <span style={styles.logoText}>VILLA</span>
          </div>
          <p style={styles.logoSub}>Painel Administrativo</p>
        </div>

        <nav style={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.navItem,
                ...(activeTab === tab.id ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Box informativo — conteúdo varia conforme o role */}
        {userRole === 'superAdmin' && (
          <div style={styles.adminPromoBox}>
            <p style={styles.adminPromoTitle}>Gerenciar Usuarios</p>
            <p style={styles.adminPromoText}>
              Acesse a aba{' '}
              <strong style={{ color: '#b8a06a' }}>Usuarios</strong> para
              alterar perfis de acesso sem precisar do Sanity Studio.
            </p>
          </div>
        )}

        {/* Viewer vê aviso de acesso limitado */}
        {userRole === 'viewer' && (
          <div style={{ ...styles.adminPromoBox, borderColor: '#3a3060' }}>
            <p style={{ ...styles.adminPromoTitle, color: '#6a8fb8' }}>
              Acesso Limitado
            </p>
            <p style={styles.adminPromoText}>
              Voce tem permissao somente de visualizacao. Contate um
              administrador para obter acesso de edicao.
            </p>
          </div>
        )}

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {session?.user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div>
              <p style={styles.userName}>{session?.user?.name ?? 'Admin'}</p>
              <p style={styles.userRole}>{ROLE_LABELS[userRole]}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              marginTop: '12px',
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid #2e2a22',
              borderRadius: '6px',
              padding: '8px',
              color: '#6b6355',
              fontSize: '12px',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            Sair do painel
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topBar}>
          <h1 style={styles.pageTitle}>
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
          <span style={styles.dateBadge}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </header>

        <div style={styles.content}>
          {activeTab === 'dashboard' && <DashboardOverview />}

          {/* Passa readOnly=true para Viewer — bloqueia ações de edição */}
          {activeTab === 'rooms' && (
            <AdminRooms readOnly={userRole === 'viewer'} />
          )}
          {activeTab === 'bookings' && (
            <AdminBookings readOnly={userRole === 'viewer'} />
          )}

          {/* Aba de usuários — exclusiva para Super Admin */}
          {activeTab === 'users' && userRole === 'superAdmin' && (
            <AdminUsers currentUserId={currentUserId} />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    occupancyRate: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminBookings, setAdminBookings] = useState<AdminBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [roomsRes, bookingsRes, reviewsRes] = await Promise.all([
          axios.get('/api/rooms'),
          axios.get('/api/admin/bookings'),
          axios.get('/api/room-reviews/all').catch(() => ({ data: [] })),
        ]);

        const rooms = roomsRes.data ?? [];
        const bookings: AdminBooking[] = bookingsRes.data ?? [];
        const reviews = reviewsRes.data ?? [];

        // Armazena para o gráfico
        setAdminBookings(bookings);

        // Comparação estrita — paymentStatus ausente não é confirmado
        const confirmedBookings = bookings.filter(
          (b) => b.paymentStatus === true,
        ).length;

        const pendingBookings = bookings.filter(
          (b) => b.paymentStatus !== true,
        ).length;

        // ✅ Corrigido — confirmadas + pendentes = quarto ocupado
        const occupancyRate =
          rooms.length > 0
            ? Math.round(
                ((confirmedBookings + pendingBookings) / rooms.length) * 100,
              )
            : 0;

        setStats({
          totalRooms: rooms.length,
          confirmedBookings,
          pendingBookings,
          occupancyRate,
          totalReviews: reviews.length,
        });
      } catch (err) {
        console.error('Erro ao buscar stats:', err);
        setError('Não foi possível carregar os dados do painel.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // UI de erro — exibida quando qualquer API falha
  if (error) {
    return (
      <div style={styles.errorCard}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <p style={{ color: '#e8e0d0', margin: '8px 0 0', fontSize: '14px' }}>
          {error}
        </p>
        <p style={{ color: '#6b6355', margin: '4px 0 0', fontSize: '12px' }}>
          Verifique sua conexão ou tente recarregar a página.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Acomodacoes',
      value: loading ? '--' : String(stats.totalRooms),
      color: '#b8a06a',
      desc: 'quartos cadastrados',
    },
    {
      label: 'Confirmadas',
      value: loading ? '--' : String(stats.confirmedBookings),
      color: '#6ab88a',
      desc: 'pagamentos confirmados',
    },
    {
      label: 'Pendentes',
      value: loading ? '--' : String(stats.pendingBookings),
      color: '#b8a06a',
      desc: 'aguardando pagamento',
    },
    {
      label: 'Avaliacoes',
      value: loading ? '--' : String(stats.totalReviews),
      color: '#8fb86a',
      desc: 'reviews de hospedes',
    },
    {
      label: 'Taxa de Ocupacao',
      value: loading ? '--' : `${stats.occupancyRate}%`,
      color: '#b86a8f',
      desc: 'quartos ocupados',
    },
  ];

  return (
    <div>
      <div
        style={{ ...styles.statsGrid, gridTemplateColumns: 'repeat(5, 1fr)' }}
      >
        {statCards.map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div>
              <p style={styles.statValue}>{stat.value}</p>
              <p style={{ ...styles.statLabel, color: stat.color }}>
                {stat.label}
              </p>
              <p style={styles.statDesc}>{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de receita por reserva */}
      {!loading && adminBookings.length > 0 && (
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Receita por Reserva</p>
          {/* Cast necessário: AdminBooking tem os campos name e totalPrice
              que o Chart utiliza — _id e price não são acessados internamente */}
          <Chart userBookings={adminBookings as unknown as Booking[]} />
        </div>
      )}

      <div style={styles.welcomeCard}>
        <h2 style={styles.welcomeTitle}>Bem-vindo ao Painel</h2>
        <p style={styles.welcomeText}>
          Use o menu lateral para gerenciar <strong>acomodacoes</strong> e{' '}
          <strong>reservas</strong>. Super Administradores tambem podem
          gerenciar <strong>usuarios</strong> e perfis de acesso.
        </p>
        <div style={styles.howToBox}>
          <p style={styles.howToTitle}>Como promover um administrador</p>
          <ol style={styles.howToList}>
            <li>O usuario deve criar uma conta normalmente no site</li>
            <li>
              Acesse a aba{' '}
              <strong style={{ color: '#b8a06a' }}>Usuarios</strong> no menu
              lateral (visivel apenas para Super Admin)
            </li>
            <li>Encontre o usuario pelo nome ou e-mail na tabela</li>
            <li>Selecione o novo perfil de acesso no seletor da linha</li>
            <li>A alteracao e salva automaticamente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f0e0c',
    color: '#e8e0d0',
    fontFamily: 'Georgia, Times New Roman, serif',
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    backgroundColor: '#1a1814',
    borderRight: '1px solid #2e2a22',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  sidebarHeader: {
    padding: '32px 24px 24px',
    borderBottom: '1px solid #2e2a22',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  logoIcon: { fontSize: '20px', color: '#b8a06a' },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '6px',
    color: '#e8e0d0',
  },
  logoSub: {
    fontSize: '11px',
    color: '#6b6355',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    marginTop: '4px',
  },
  nav: {
    padding: '20px 12px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#8a7f70',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    fontFamily: 'Georgia, serif',
  },
  navItemActive: {
    backgroundColor: '#2e2a22',
    color: '#b8a06a',
    borderLeft: '2px solid #b8a06a',
  },
  navIcon: { fontSize: '14px', width: '20px', textAlign: 'center' as const },
  adminPromoBox: {
    margin: '0 12px 16px',
    backgroundColor: '#1e1c16',
    border: '1px solid #3e3820',
    borderRadius: '8px',
    padding: '16px',
  },
  adminPromoTitle: {
    fontSize: '12px',
    color: '#b8a06a',
    margin: '0 0 8px 0',
  },
  adminPromoText: {
    fontSize: '11px',
    color: '#6b6355',
    margin: '0',
    lineHeight: '1.6',
  },
  sidebarFooter: {
    padding: '20px 24px',
    borderTop: '1px solid #2e2a22',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#b8a06a',
    color: '#0f0e0c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
  },
  userName: { fontSize: '13px', color: '#e8e0d0', margin: 0 },
  userRole: {
    fontSize: '11px',
    color: '#6b6355',
    margin: 0,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    padding: '24px 32px',
    borderBottom: '1px solid #2e2a22',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1814',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '400',
    letterSpacing: '2px',
    color: '#e8e0d0',
    margin: 0,
    textTransform: 'uppercase' as const,
  },
  dateBadge: { fontSize: '12px', color: '#6b6355', letterSpacing: '1px' },
  content: { padding: '32px', flex: 1 },
  statsGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#e8e0d0',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    margin: '0 0 2px 0',
    fontWeight: '600',
  },
  statDesc: { fontSize: '11px', color: '#4a4540', margin: 0 },
  welcomeCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '32px',
  },
  welcomeTitle: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#b8a06a',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  welcomeText: {
    fontSize: '14px',
    color: '#8a7f70',
    lineHeight: '1.8',
    marginBottom: '24px',
  },
  howToBox: {
    backgroundColor: '#0f0e0c',
    border: '1px solid #2e2a22',
    borderRadius: '8px',
    padding: '20px 24px',
  },
  howToTitle: {
    fontSize: '13px',
    color: '#b8a06a',
    margin: '0 0 12px 0',
    letterSpacing: '1px',
  },
  howToList: {
    margin: 0,
    padding: '0 0 0 18px',
    color: '#8a7f70',
    fontSize: '13px',
    lineHeight: '2',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0e0c',
    gap: '16px',
  },
  spinnerRing: {
    width: '36px',
    height: '36px',
    border: '2px solid #2e2a22',
    borderTop: '2px solid #b8a06a',
    borderRadius: '50%',
  },
  loadingText: {
    color: '#6b6355',
    fontSize: '13px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  deniedIcon: { fontSize: '32px', color: '#b86a6a' },
  deniedTitle: {
    fontSize: '18px',
    color: '#e8e0d0',
    margin: 0,
    letterSpacing: '2px',
  },
  redirectText: {
    fontSize: '11px',
    color: '#4a4540',
    margin: 0,
    letterSpacing: '1px',
  },
  errorCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #5a2a2a',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  chartCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '32px',
    marginBottom: '32px',
  },
  chartTitle: {
    fontSize: '13px',
    color: '#b8a06a',
    margin: '0 0 16px 0',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
};
