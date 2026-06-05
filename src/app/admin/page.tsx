'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminRooms from './AdminRooms';
import AdminBookings from './AdminBookings';

type Tab = 'dashboard' | 'rooms' | 'bookings';

type Stats = {
  totalRooms: number;
  activeBookings: number;
  totalReviews: number;
  occupancyRate: number;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [authState, setAuthState] = useState<'checking' | 'allowed' | 'denied'>(
    'checking',
  );

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }
    axios
      .get(`/api/users?email=${encodeURIComponent(session.user.email)}`)
      .then(({ data }) => {
        if (data?.isAdmin === true) {
          setAuthState('allowed');
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
        <div style={styles.spinnerRing} />
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Visao Geral', icon: '#' },
    { id: 'rooms', label: 'Acomodacoes', icon: '[]' },
    { id: 'bookings', label: 'Reservas', icon: '<>' },
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

        <div style={styles.adminPromoBox}>
          <p style={styles.adminPromoTitle}>Promover Administrador</p>
          <p style={styles.adminPromoText}>
            Acesse o Sanity Studio, encontre o usuario e marque{' '}
            <strong style={{ color: '#b8a06a' }}>Administrador = true</strong>.
          </p>
          <a
            href='/studio'
            target='_blank'
            rel='noreferrer'
            style={styles.adminPromoLink}
          >
            Abrir Sanity Studio
          </a>
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {session?.user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div>
              <p style={styles.userName}>{session?.user?.name ?? 'Admin'}</p>
              <p style={styles.userRole}>Administrador</p>
            </div>
          </div>
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
          {activeTab === 'rooms' && <AdminRooms />}
          {activeTab === 'bookings' && <AdminBookings />}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    activeBookings: 0,
    totalReviews: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [roomsRes, bookingsRes, reviewsRes] = await Promise.all([
          axios.get('/api/rooms'),
          axios.get('/api/admin/bookings'),
          axios.get('/api/room-reviews/all').catch(() => ({ data: [] })),
        ]);

        const rooms = roomsRes.data ?? [];
        const bookings = bookingsRes.data ?? [];
        const reviews = reviewsRes.data ?? [];

        const activeBookings = bookings.filter(
          (b: any) => b.paymentStatus,
        ).length;
        const bookedRooms = rooms.filter((r: any) => r.isBooked).length;
        const occupancyRate =
          rooms.length > 0 ? Math.round((bookedRooms / rooms.length) * 100) : 0;

        setStats({
          totalRooms: rooms.length,
          activeBookings,
          totalReviews: reviews.length,
          occupancyRate,
        });
      } catch (err) {
        console.error('Erro ao buscar stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Acomodacoes',
      value: loading ? '--' : String(stats.totalRooms),
      color: '#b8a06a',
      desc: 'quartos cadastrados',
    },
    {
      label: 'Reservas Ativas',
      value: loading ? '--' : String(stats.activeBookings),
      color: '#6a8fb8',
      desc: 'pagamentos confirmados',
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
      <div style={styles.statsGrid}>
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

      <div style={styles.welcomeCard}>
        <h2 style={styles.welcomeTitle}>Bem-vindo ao Painel</h2>
        <p style={styles.welcomeText}>
          Use o menu lateral para gerenciar <strong>acomodacoes</strong> e{' '}
          <strong>reservas</strong>. Para conceder acesso de administrador a
          outro usuario, use o atalho no menu lateral.
        </p>

        <div style={styles.howToBox}>
          <p style={styles.howToTitle}>Como promover um administrador</p>
          <ol style={styles.howToList}>
            <li>O usuario deve criar uma conta normalmente no site</li>
            <li>
              Acesse{' '}
              <a
                href='/studio'
                style={styles.link}
                target='_blank'
                rel='noreferrer'
              >
                /studio
              </a>{' '}
              e va em <strong>User</strong>
            </li>
            <li>Encontre o usuario pelo nome ou e-mail</li>
            <li>
              Marque o campo{' '}
              <strong style={{ color: '#b8a06a' }}>Administrador</strong> como{' '}
              <strong>verdadeiro</strong>
            </li>
            <li>Clique em Publicar - o acesso e imediato</li>
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
    margin: '0 0 10px 0',
    lineHeight: '1.6',
  },
  adminPromoLink: {
    fontSize: '11px',
    color: '#6a8fb8',
    textDecoration: 'none',
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
    gridTemplateColumns: 'repeat(4, 1fr)',
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
  statDesc: {
    fontSize: '11px',
    color: '#4a4540',
    margin: 0,
  },
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
  link: { color: '#b8a06a', textDecoration: 'none' },
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
};
