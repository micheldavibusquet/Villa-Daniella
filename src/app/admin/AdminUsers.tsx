'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Tipo que representa um usuário cadastrado no sistema.
 * Reflete os campos retornados pela API GET /api/admin/users.
 */
type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: 'superAdmin' | 'admin' | 'viewer';
  isAdmin?: boolean;
  _createdAt: string;
};

/** Labels e cores para exibição dos roles na interface */
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  superAdmin: { label: 'Super Admin', color: '#b86a8f' },
  admin: { label: 'Administrador', color: '#b8a06a' },
  viewer: { label: 'Visualizacao', color: '#6a8fb8' },
};

type Props = {
  /** ID do usuário atualmente logado — usado para destacar na tabela */
  currentUserId: string;
};

export default function AdminUsers({ currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  /** Busca a lista de usuários da API */
  async function fetchUsers() {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/users');
      setUsers(data);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao carregar usuarios.' });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Atualiza o role de um usuário via API.
   * Exibe feedback de sucesso ou erro após a operação.
   */
  async function handleRoleChange(userId: string, newRole: string) {
    try {
      setUpdatingId(userId);
      setFeedback(null);

      await axios.patch('/api/admin/users', {
        targetUserId: userId,
        newRole,
      });

      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      await fetchUsers();
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ?? 'Erro ao atualizar perfil de acesso.';
      setFeedback({ type: 'error', msg });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      {/* Cabeçalho da seção */}
      <div style={s.headerBar}>
        <div>
          <h2 style={s.sectionTitle}>Usuarios</h2>
          <p style={s.sectionSub}>Gerenciamento de perfis de acesso</p>
        </div>
      </div>

      {/* Feedback de sucesso ou erro */}
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

      {/* Legenda dos roles */}
      <div style={s.legendBox}>
        <p style={s.legendTitle}>Niveis de acesso:</p>
        <div style={s.legendRow}>
          {Object.entries(ROLE_LABELS).map(([key, { label, color }]) => (
            <span
              key={key}
              style={{ ...s.legendBadge, borderColor: color, color }}
            >
              {label}
            </span>
          ))}
        </div>
        <p style={s.legendDesc}>
          <strong style={{ color: '#b86a8f' }}>Super Admin</strong> — acesso
          total + gerencia usuarios. &nbsp;
          <strong style={{ color: '#b8a06a' }}>Administrador</strong> — gerencia
          acomodacoes e reservas. &nbsp;
          <strong style={{ color: '#6a8fb8' }}>Visualizacao</strong> — somente
          leitura.
        </p>
      </div>

      {/* Tabela de usuários */}
      {loading ? (
        <div style={s.emptyState}>Carregando usuarios...</div>
      ) : users.length === 0 ? (
        <div style={s.emptyState}>Nenhum usuario encontrado.</div>
      ) : (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  'Usuario',
                  'Email',
                  'Perfil Atual',
                  'Alterar Perfil',
                  'Desde',
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user._id === currentUserId;
                const roleInfo = ROLE_LABELS[user.role ?? 'viewer'];

                return (
                  <tr key={user._id} style={s.tr}>
                    {/* Nome e avatar */}
                    <td style={s.td}>
                      <div style={s.userCell}>
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            style={s.avatar}
                          />
                        ) : (
                          <div style={s.avatarEmpty}>
                            {user.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div>
                          <div style={s.userName}>
                            {user.name ?? 'Sem nome'}
                            {/* Destaca o usuário logado */}
                            {isSelf && <span style={s.selfBadge}>Voce</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={s.td}>
                      <span style={s.email}>{user.email}</span>
                    </td>

                    {/* Role atual */}
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.roleBadge,
                          borderColor: roleInfo?.color ?? '#4a4540',
                          color: roleInfo?.color ?? '#4a4540',
                        }}
                      >
                        {roleInfo?.label ?? 'Sem perfil'}
                      </span>
                    </td>

                    {/* Seletor de role */}
                    <td style={s.td}>
                      <select
                        style={s.roleSelect}
                        value={user.role ?? 'viewer'}
                        disabled={updatingId === user._id}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                      >
                        <option value='superAdmin'>Super Administrador</option>
                        <option value='admin'>Administrador</option>
                        <option value='viewer'>Somente Visualizacao</option>
                      </select>
                    </td>

                    {/* Data de cadastro */}
                    <td style={s.td}>
                      <span style={s.date}>
                        {new Date(user._createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
  legendBox: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  legendTitle: {
    fontSize: '11px',
    color: '#6b6355',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    margin: '0 0 10px 0',
  },
  legendRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '10px',
    flexWrap: 'wrap' as const,
  },
  legendBadge: {
    border: '1px solid',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
  },
  legendDesc: {
    fontSize: '12px',
    color: '#6b6355',
    margin: 0,
    lineHeight: '1.8',
  },
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
  userCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  avatarEmpty: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#2e2a22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b8a06a',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userName: {
    color: '#e8e0d0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selfBadge: {
    fontSize: '10px',
    backgroundColor: '#2e2a22',
    color: '#b8a06a',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '1px',
  },
  email: { color: '#6b6355', fontSize: '12px' },
  roleBadge: {
    border: '1px solid',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
  },
  roleSelect: {
    backgroundColor: '#0f0e0c',
    border: '1px solid #2e2a22',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#e8e0d0',
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    outline: 'none',
  },
  date: { fontSize: '11px', color: '#4a4540' },
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
