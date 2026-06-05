'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

type Room = {
  _id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  dimension: number;
  numberOfBeds: number;
  slug: { current: string };
  isBooked?: boolean;
};

type RoomForm = {
  name: string;
  description: string;
  type: string;
  price: string;
  dimension: string;
  numberOfBeds: string;
};

const ROOM_TYPES = ['Islandtype', 'basicRoom', 'deluxe', 'suite', 'penthouse'];

const emptyForm: RoomForm = {
  name: '',
  description: '',
  type: 'basicRoom',
  price: '',
  dimension: '',
  numberOfBeds: '',
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/rooms');
      setRooms(data);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao carregar acomodacoes.' });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.numberOfBeds) {
      setFeedback({
        type: 'error',
        msg: 'Preencha nome, preco e numero de camas.',
      });
      return;
    }
    try {
      setSaving(true);
      await axios.post('/api/rooms', {
        name: form.name,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        dimension: Number(form.dimension),
        numberOfBeds: Number(form.numberOfBeds),
        slug: { current: form.name.toLowerCase().replace(/\s+/g, '-') },
        isFeatured: false,
        isBooked: false,
      });
      setFeedback({
        type: 'success',
        msg: 'Acomodacao cadastrada com sucesso!',
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchRooms();
    } catch {
      setFeedback({
        type: 'error',
        msg: 'Erro ao cadastrar. Verifique a API.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={s.headerBar}>
        <div>
          <h2 style={s.sectionTitle}>Acomodacoes</h2>
          <p style={s.sectionSub}>RF1 - Cadastro e gerenciamento de quartos</p>
        </div>
        <button
          style={s.btnPrimary}
          onClick={() => {
            setShowForm(!showForm);
            setFeedback(null);
          }}
        >
          {showForm ? 'Fechar formulario' : '+ Nova Acomodacao'}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            ...s.feedback,
            ...(feedback.type === 'error'
              ? s.feedbackError
              : s.feedbackSuccess),
          }}
        >
          {feedback.msg}
        </div>
      )}

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Nova Acomodacao</h3>
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.label}>Nome *</label>
              <input
                style={s.input}
                name='name'
                value={form.name}
                onChange={handleChange}
                placeholder='Ex: Suite Villa Daniella'
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Tipo *</label>
              <select
                style={s.input}
                name='type'
                value={form.type}
                onChange={handleChange}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Preco por noite (R$) *</label>
              <input
                style={s.input}
                name='price'
                type='number'
                value={form.price}
                onChange={handleChange}
                placeholder='Ex: 450'
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Numero de Camas *</label>
              <input
                style={s.input}
                name='numberOfBeds'
                type='number'
                value={form.numberOfBeds}
                onChange={handleChange}
                placeholder='Ex: 2'
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Dimensao (m2)</label>
              <input
                style={s.input}
                name='dimension'
                type='number'
                value={form.dimension}
                onChange={handleChange}
                placeholder='Ex: 35'
              />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descricao</label>
            <textarea
              style={{ ...s.input, ...s.textarea }}
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='Descreva a acomodacao...'
            />
          </div>
          <div style={s.formNote}>
            Para adicionar imagens, acesse o{' '}
            <a href='/studio' style={s.link}>
              Sanity Studio
            </a>{' '}
            apos criar a acomodacao.
          </div>
          <div style={s.formActions}>
            <button
              style={s.btnSecondary}
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </button>
            <button
              style={s.btnPrimary}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Acomodacao'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={s.emptyState}>Carregando acomodacoes...</div>
      ) : rooms.length === 0 ? (
        <div style={s.emptyState}>Nenhuma acomodacao cadastrada ainda.</div>
      ) : (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  'Acomodacao',
                  'Tipo',
                  'Camas',
                  'Preco / noite',
                  'Status',
                  'Acoes',
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.roomName}>{room.name}</div>
                    <div style={s.roomSlug}>/{room.slug?.current}</div>
                  </td>
                  <td style={s.td}>
                    <span style={s.typeBadge}>{room.type}</span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    {room.numberOfBeds}
                  </td>
                  <td style={s.td}>
                    <span style={s.price}>
                      R$ {room.price?.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={room.isBooked ? s.statusBooked : s.statusFree}>
                      {room.isBooked ? 'Ocupado' : 'Disponivel'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <a
                      href={`/studio/structure/hotelRoom;${room._id}`}
                      style={s.editLink}
                      target='_blank'
                      rel='noreferrer'
                    >
                      Editar no Studio
                    </a>
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
  btnPrimary: {
    backgroundColor: '#b8a06a',
    color: '#0f0e0c',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#8a7f70',
    border: '1px solid #2e2a22',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  feedback: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  feedbackSuccess: {
    backgroundColor: '#1a2e1a',
    border: '1px solid #4a8a4a',
    color: '#8ab88a',
  },
  feedbackError: {
    backgroundColor: '#2e1a1a',
    border: '1px solid #8a4a4a',
    color: '#b88a8a',
  },
  formCard: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#b8a06a',
    margin: '0 0 20px 0',
    letterSpacing: '1px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '11px',
    color: '#6b6355',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: '#0f0e0c',
    border: '1px solid #2e2a22',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#e8e0d0',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  textarea: { minHeight: '90px', resize: 'vertical' as const },
  formNote: {
    backgroundColor: '#1e1c16',
    border: '1px solid #3e3820',
    borderRadius: '6px',
    padding: '12px 16px',
    fontSize: '12px',
    color: '#8a7f50',
    marginBottom: '20px',
  },
  link: { color: '#b8a06a', textDecoration: 'none' },
  formActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  tableWrapper: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    overflow: 'hidden',
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
  },
  tr: { borderBottom: '1px solid #1e1c18' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#c8c0b0' },
  roomName: { color: '#e8e0d0', marginBottom: '2px' },
  roomSlug: { fontSize: '11px', color: '#4a4540' },
  typeBadge: {
    backgroundColor: '#2e2a22',
    color: '#8a7f70',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  price: { color: '#b8a06a', fontWeight: '500' },
  statusBooked: {
    backgroundColor: '#2e1a1a',
    color: '#b88a8a',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  statusFree: {
    backgroundColor: '#1a2e1a',
    color: '#8ab88a',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  editLink: { color: '#6a8fb8', fontSize: '12px', textDecoration: 'none' },
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
