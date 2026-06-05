'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

type Booking = {
  _id: string;
  hotelRoom: { name: string; slug: { current: string } };
  user: { name: string; email: string };
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  totalPrice: number;
  adults: number;
  children: number;
  paymentStatus?: boolean;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/room-bookings');
      setBookings(data);
    } catch {
      console.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter((b) => {
    if (filter === 'paid') return b.paymentStatus === true;
    if (filter === 'pending') return !b.paymentStatus;
    return true;
  });

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus)
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div>
      <div style={s.headerBar}>
        <div>
          <h2 style={s.sectionTitle}>Reservas</h2>
          <p style={s.sectionSub}>RF7 - Gerenciamento de reservas</p>
        </div>
        <button style={s.btnRefresh} onClick={fetchBookings}>
          Atualizar
        </button>
      </div>

      <div style={s.summaryGrid}>
        <div style={s.summaryCard}>
          <p style={s.summaryValue}>{bookings.length}</p>
          <p style={s.summaryLabel}>Total de Reservas</p>
        </div>
        <div style={s.summaryCard}>
          <p style={{ ...s.summaryValue, color: '#8ab88a' }}>
            {bookings.filter((b) => b.paymentStatus).length}
          </p>
          <p style={s.summaryLabel}>Confirmadas</p>
        </div>
        <div style={s.summaryCard}>
          <p style={{ ...s.summaryValue, color: '#b8b08a' }}>
            {bookings.filter((b) => !b.paymentStatus).length}
          </p>
          <p style={s.summaryLabel}>Pendentes</p>
        </div>
        <div style={s.summaryCard}>
          <p style={{ ...s.summaryValue, color: '#b8a06a' }}>
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </p>
          <p style={s.summaryLabel}>Receita Confirmada</p>
        </div>
      </div>

      <div style={s.filters}>
        {(['all', 'paid', 'pending'] as const).map((f) => (
          <button
            key={f}
            style={{
              ...s.filterBtn,
              ...(filter === f ? s.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : f === 'paid' ? 'Confirmadas' : 'Pendentes'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.emptyState}>Carregando reservas...</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>Nenhuma reserva encontrada.</div>
      ) : (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  'Hospede',
                  'Acomodacao',
                  'Check-in',
                  'Check-out',
                  'Dias',
                  'Hospedes',
                  'Total',
                  'Status',
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking._id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.guestName}>{booking.user?.name ?? '--'}</div>
                    <div style={s.guestEmail}>
                      {booking.user?.email ?? '--'}
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={s.roomName}>
                      {booking.hotelRoom?.name ?? '--'}
                    </div>
                  </td>
                  <td style={s.td}>{formatDate(booking.checkinDate)}</td>
                  <td style={s.td}>{formatDate(booking.checkoutDate)}</td>
                  <td style={{ ...s.td, textAlign: 'center' as const }}>
                    {booking.numberOfDays}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' as const }}>
                    {booking.adults}A{' '}
                    {booking.children > 0 ? `+ ${booking.children}C` : ''}
                  </td>
                  <td style={s.td}>
                    <span style={s.price}>
                      R$ {booking.totalPrice?.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span
                      style={
                        booking.paymentStatus ? s.statusPaid : s.statusPending
                      }
                    >
                      {booking.paymentStatus ? 'Confirmada' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '400',
    color: '#e8e0d0',
    margin: '0 0 4px 0',
    letterSpacing: '1px',
  },
  sectionSub: {
    fontSize: '11px',
    color: '#6b6355',
    margin: 0,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
  },
  btnRefresh: {
    backgroundColor: 'transparent',
    color: '#8a7f70',
    border: '1px solid #2e2a22',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  summaryValue: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#e8e0d0',
    margin: '0 0 4px 0',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#6b6355',
    margin: 0,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: {
    backgroundColor: 'transparent',
    color: '#6b6355',
    border: '1px solid #2e2a22',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#2e2a22',
    color: '#b8a06a',
    borderColor: '#b8a06a',
  },
  tableWrapper: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '14px 16px',
    textAlign: 'left' as const,
    fontSize: '10px',
    color: '#6b6355',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid #2e2a22',
    backgroundColor: '#141210',
    whiteSpace: 'nowrap' as const,
  },
  tr: { borderBottom: '1px solid #1e1c18' },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#c8c0b0',
    whiteSpace: 'nowrap' as const,
  },
  guestName: { color: '#e8e0d0', marginBottom: '2px' },
  guestEmail: { fontSize: '11px', color: '#4a4540' },
  roomName: {
    color: '#c8c0b0',
    maxWidth: '160px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  price: { color: '#b8a06a', fontWeight: '500' },
  statusPaid: {
    backgroundColor: '#1a2e1a',
    color: '#8ab88a',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  statusPending: {
    backgroundColor: '#2e2a1a',
    color: '#b8b08a',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  emptyState: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center' as const,
    color: '#4a4540',
    fontSize: '14px',
  },
};
