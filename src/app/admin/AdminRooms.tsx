'use client';

import { useState, useEffect, useRef } from 'react';
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
  coverImage?: { url?: string; assetUrl?: string };
  images?: { _key: string; url?: string }[];
};

type RoomForm = {
  name: string;
  description: string;
  type: string;
  price: string;
  maxGuests: string;
  numberOfBeds: string;
};

/**
 * Tipos de acomodação predefinidos.
 * Devem ser idênticos aos valores usados no filtro de busca (Search.tsx)
 * para garantir que a pesquisa retorne resultados corretos.
 */
const ROOM_TYPES = [
  { value: 'casa_inteira', label: 'Casa Inteira' },
  { value: 'suite', label: 'Suíte' },
  { value: 'quarto_compartilhado', label: 'Quarto Compartilhado' },
  { value: 'cabana', label: 'Cabana' },
  { value: 'personalizado', label: 'Personalizado...' },
];

const emptyForm: RoomForm = {
  name: '',
  description: '',
  type: 'casa_inteira',
  price: '',
  maxGuests: '',
  numberOfBeds: '',
};

export default function AdminRooms({
  readOnly = false,
}: {
  readOnly?: boolean;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  // Armazena o tipo personalizado quando o admin seleciona "Personalizado"
  const [customType, setCustomType] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [removedGalleryKeys, setRemovedGalleryKeys] = useState<string[]>([]);
  const [removeCover, setRemoveCover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const editGalleryInputRef = useRef<HTMLInputElement>(null);

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

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setRemoveCover(false);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const combined = [...galleryFiles, ...files].slice(0, 20);
    setGalleryFiles(combined);
    const newPreviews: string[] = [];
    let loaded = 0;
    combined.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loaded++;
        if (loaded === combined.length) setGalleryPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeGalleryNewImage(index: number) {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await axios.post('/api/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.assetId ?? null;
    } catch (error: any) {
      console.error('Erro upload:', error?.response?.data ?? error?.message);
      return null;
    }
  }

  // ── Criar nova acomodacao ──────────────────────────────────────────────────

  async function handleCreate() {
    if (!form.name || !form.price || !form.numberOfBeds) {
      setFeedback({
        type: 'error',
        msg: 'Preencha nome, preco e numero de camas.',
      });
      return;
    }
    try {
      setSaving(true);
      setUploading(true);
      let coverImageAssetId: string | null = null;
      if (coverFile) {
        coverImageAssetId = await uploadFile(coverFile);
        if (!coverImageAssetId) {
          setFeedback({ type: 'error', msg: 'Erro no upload da capa.' });
          return;
        }
      }
      const galleryAssetIds: string[] = [];
      for (const file of galleryFiles) {
        const id = await uploadFile(file);
        if (id) galleryAssetIds.push(id);
      }
      setUploading(false);
      await axios.post('/api/rooms', {
        name: form.name,
        description: form.description,
        // Se personalizado, usa o texto digitado; caso contrário usa o valor do select
        type: form.type === 'personalizado' ? customType : form.type,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests || 2),
        numberOfBeds: Number(form.numberOfBeds),
        slug: { current: form.name.toLowerCase().replace(/\s+/g, '-') },
        isFeatured: false,
        isBooked: false,
        coverImageAssetId,
        galleryAssetIds,
      });
      setFeedback({
        type: 'success',
        msg: 'Acomodacao cadastrada com sucesso!',
      });
      resetNewForm();
      fetchRooms();
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao cadastrar.' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  // ── Salvar edicao ──────────────────────────────────────────────────────────

  async function handleSaveEdit() {
    if (!editingRoom) return;
    try {
      setSaving(true);
      setUploading(galleryFiles.length > 0 || !!coverFile);
      let coverImageAssetId: string | null = null;
      if (coverFile) {
        coverImageAssetId = await uploadFile(coverFile);
      }
      const addGalleryAssetIds: string[] = [];
      for (const file of galleryFiles) {
        const id = await uploadFile(file);
        if (id) addGalleryAssetIds.push(id);
      }
      setUploading(false);
      await axios.patch(`/api/rooms/${editingRoom._id}`, {
        name: form.name,
        description: form.description,
        // Se personalizado, usa o texto digitado; caso contrário usa o valor do select
        type: form.type === 'personalizado' ? customType : form.type,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests),
        numberOfBeds: Number(form.numberOfBeds),
        coverImageAssetId,
        removeCover,
        addGalleryAssetIds,
        removeGalleryKeys: removedGalleryKeys,
      });
      setFeedback({
        type: 'success',
        msg: 'Acomodacao atualizada com sucesso!',
      });
      setEditingRoom(null);
      resetEditState();
      await fetchRooms();
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao salvar alteracoes.' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  // ── Excluir acomodacao ─────────────────────────────────────────────────────

  async function handleDelete() {
    if (!editingRoom) return;
    try {
      setSaving(true);
      await axios.delete(`/api/rooms/${editingRoom._id}`);
      setEditingRoom(null);
      setConfirmDelete(false);
      await fetchRooms();
      setFeedback({ type: 'success', msg: 'Acomodacao excluida com sucesso.' });
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao excluir.' });
    } finally {
      setSaving(false);
    }
  }

  function openEdit(room: Room) {
    setEditingRoom(room);
    setShowForm(false);
    setForm({
      name: room.name ?? '',
      description: room.description ?? '',
      type: room.type ?? 'casa_inteira',
      price: String(room.price ?? ''),
      maxGuests: String(room.dimension ?? ''),
      numberOfBeds: String(room.numberOfBeds ?? ''),
    });
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setRemovedGalleryKeys([]);
    setRemoveCover(false);
    setConfirmDelete(false);
    setFeedback(null);
  }

  function resetNewForm() {
    setShowForm(false);
    setForm(emptyForm);
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  }

  function resetEditState() {
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setRemovedGalleryKeys([]);
    setRemoveCover(false);
    setConfirmDelete(false);
  }

  const coverUrl = editingRoom
    ? removeCover
      ? null
      : coverPreview ||
        editingRoom.coverImage?.url ||
        editingRoom.coverImage?.assetUrl
    : coverPreview;

  return (
    <div>
      {/* ── Header ── */}
      <div style={s.headerBar}>
        <div>
          <h2 style={s.sectionTitle}>Acomodacoes</h2>
          <p style={s.sectionSub}>RF1 - Cadastro e gerenciamento de quartos</p>
        </div>
        {!editingRoom && !readOnly && (
          <button
            style={s.btnPrimary}
            onClick={() => {
              setShowForm(!showForm);
              setFeedback(null);
              setEditingRoom(null);
            }}
          >
            {showForm ? 'Fechar formulario' : '+ Nova Acomodacao'}
          </button>
        )}
        {editingRoom && (
          <button
            style={s.btnSecondary}
            onClick={() => {
              setEditingRoom(null);
              resetEditState();
              setFeedback(null);
            }}
          >
            Voltar para lista
          </button>
        )}
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

      {readOnly && (
        <div style={s.readOnlyBanner}>
          Voce esta em modo de visualizacao. Contate um administrador para
          editar acomodacoes.
        </div>
      )}

      {/* ── Painel de edicao ── */}
      {editingRoom && (
        <div style={s.editPanel}>
          <h3 style={s.editTitle}>Editar: {editingRoom.name}</h3>

          {/* Foto de capa atual */}
          <div style={s.imageSection}>
            <p style={s.imageLabel}>Foto de Capa</p>
            <div style={s.coverEditRow}>
              {coverUrl ? (
                <img src={coverUrl} alt='Capa' style={s.coverEditThumb} />
              ) : (
                <div style={s.coverEditEmpty}>Sem foto de capa</div>
              )}
              <div style={s.coverEditActions}>
                <button
                  style={s.btnSmall}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverUrl ? 'Trocar foto' : 'Adicionar foto'}
                </button>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={handleCoverChange}
            />
          </div>

          {/* Galeria existente */}
          <div style={s.imageSection}>
            <div style={s.galleryHeader}>
              <p style={s.imageLabel}>
                Galeria (
                {(editingRoom.images?.filter(
                  (img) => !removedGalleryKeys.includes(img._key),
                ).length ?? 0) + galleryFiles.length}
                /20)
              </p>
              <button
                style={s.btnAddGallery}
                onClick={() => editGalleryInputRef.current?.click()}
              >
                + Adicionar fotos
              </button>
            </div>
            <input
              ref={editGalleryInputRef}
              type='file'
              accept='image/*'
              multiple
              style={{ display: 'none' }}
              onChange={handleGalleryChange}
            />

            <div style={s.galleryGrid}>
              {/* Fotos existentes */}
              {editingRoom.images?.map((img) => {
                const imgUrl = img.url;
                const removed = removedGalleryKeys.includes(img._key);
                if (removed) return null;
                return (
                  <div key={img._key} style={s.galleryItem}>
                    {imgUrl && (
                      <img src={imgUrl} alt='' style={s.galleryThumb} />
                    )}
                    <button
                      style={s.galleryRemoveBtn}
                      onClick={() =>
                        setRemovedGalleryKeys((prev) => [...prev, img._key])
                      }
                    >
                      x
                    </button>
                  </div>
                );
              })}
              {/* Fotos novas a adicionar */}
              {galleryPreviews.map((src, i) => (
                <div
                  key={`new_${i}`}
                  style={{ ...s.galleryItem, border: '2px solid #b8a06a' }}
                >
                  <img src={src} alt='' style={s.galleryThumb} />
                  <button
                    style={s.galleryRemoveBtn}
                    onClick={() => removeGalleryNewImage(i)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Campos editaveis */}
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.label}>Nome</label>
              <input
                style={s.input}
                name='name'
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Tipo</label>
              <select
                style={s.input}
                name='type'
                value={form.type}
                onChange={handleChange}
              >
                {ROOM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Preco / noite (R$)</label>
              <input
                style={s.input}
                name='price'
                type='number'
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Numero de Camas</label>
              <input
                style={s.input}
                name='numberOfBeds'
                type='number'
                value={form.numberOfBeds}
                onChange={handleChange}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Max. Hospedes</label>
              <input
                style={s.input}
                name='maxGuests'
                type='number'
                value={form.maxGuests}
                onChange={handleChange}
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
            />
          </div>

          {uploading && <div style={s.uploadStatus}>Enviando imagens...</div>}

          {/* Acoes */}
          <div style={s.editActions}>
            {!confirmDelete ? (
              <button
                style={s.btnDanger}
                onClick={() => setConfirmDelete(true)}
              >
                Excluir acomodacao
              </button>
            ) : (
              <div style={s.confirmDelete}>
                <span style={s.confirmText}>
                  Tem certeza? Esta acao nao pode ser desfeita.
                </span>
                <button
                  style={s.btnDanger}
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? 'Excluindo...' : 'Sim, excluir'}
                </button>
                <button
                  style={s.btnSecondary}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={s.btnSecondary}
                onClick={() => {
                  setEditingRoom(null);
                  resetEditState();
                }}
              >
                Cancelar
              </button>
              <button
                style={s.btnPrimary}
                onClick={handleSaveEdit}
                disabled={saving || uploading}
              >
                {uploading
                  ? 'Enviando imagens...'
                  : saving
                    ? 'Salvando...'
                    : 'Salvar alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulario de nova acomodacao ── */}
      {showForm && !editingRoom && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Nova Acomodacao</h3>
          <div style={s.imageSection}>
            <p style={s.imageLabel}>Foto de Capa</p>
            <div
              style={{
                ...s.dropZone,
                ...(coverPreview ? s.dropZoneActive : {}),
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt='Capa' style={s.coverPreview} />
              ) : (
                <div style={s.dropContent}>
                  <span style={s.dropIcon}>+</span>
                  <p style={s.dropText}>
                    Clique para selecionar a foto principal
                  </p>
                  <p style={s.dropSub}>JPG, PNG ou WEBP</p>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={handleCoverChange}
            />
            {coverPreview && (
              <button
                style={s.btnRemove}
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              >
                Remover foto de capa
              </button>
            )}
          </div>

          <div style={s.imageSection}>
            <div style={s.galleryHeader}>
              <p style={s.imageLabel}>
                Miniaturas da Galeria ({galleryFiles.length}/20)
              </p>
              {galleryFiles.length < 20 && (
                <button
                  style={s.btnAddGallery}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  + Adicionar fotos
                </button>
              )}
            </div>
            <input
              ref={galleryInputRef}
              type='file'
              accept='image/*'
              multiple
              style={{ display: 'none' }}
              onChange={handleGalleryChange}
            />
            {galleryPreviews.length === 0 ? (
              <div
                style={s.galleryEmpty}
                onClick={() => galleryInputRef.current?.click()}
              >
                <span style={s.dropIcon}>+</span>
                <p style={s.dropText}>Clique para adicionar miniaturas</p>
                <p style={s.dropSub}>Ate 20 fotos</p>
              </div>
            ) : (
              <div style={s.galleryGrid}>
                {galleryPreviews.map((src, i) => (
                  <div key={i} style={s.galleryItem}>
                    <img
                      src={src}
                      alt={`Miniatura ${i + 1}`}
                      style={s.galleryThumb}
                    />
                    <button
                      style={s.galleryRemoveBtn}
                      onClick={() => removeGalleryNewImage(i)}
                    >
                      x
                    </button>
                  </div>
                ))}
                {galleryFiles.length < 20 && (
                  <div
                    style={s.galleryAddMore}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <span style={{ fontSize: '24px', color: '#4a4540' }}>
                      +
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

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
                {ROOM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {/* Campo visível apenas quando "Personalizado" é selecionado */}
              {form.type === 'personalizado' && (
                <input
                  style={{ ...s.input, marginTop: '8px' }}
                  placeholder='Digite o tipo personalizado...'
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                />
              )}
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
              <label style={s.label}>Max. de Hospedes *</label>
              <input
                style={s.input}
                name='maxGuests'
                type='number'
                value={form.maxGuests}
                onChange={handleChange}
                placeholder='Ex: 4'
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
          {uploading && (
            <div style={s.uploadStatus}>
              Enviando imagens para o servidor...
            </div>
          )}
          <div style={s.formActions}>
            <button style={s.btnSecondary} onClick={resetNewForm}>
              Cancelar
            </button>
            <button
              style={s.btnPrimary}
              onClick={handleCreate}
              disabled={saving || uploading}
            >
              {uploading
                ? 'Enviando imagens...'
                : saving
                  ? 'Salvando...'
                  : 'Salvar Acomodacao'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tabela ── */}
      {!editingRoom &&
        (loading ? (
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
                    'Max. Hospedes',
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
                      <div style={s.roomCell}>
                        {room.coverImage?.url || room.coverImage?.assetUrl ? (
                          <img
                            src={
                              room.coverImage?.url || room.coverImage?.assetUrl
                            }
                            alt={room.name}
                            style={s.roomThumb}
                          />
                        ) : (
                          <div style={s.roomThumbEmpty}>?</div>
                        )}
                        <div>
                          <div style={s.roomName}>{room.name}</div>
                          <div style={s.roomSlug}>/{room.slug?.current}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.typeBadge}>{room.type}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      {room.numberOfBeds}
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      {room.dimension ?? '--'}
                    </td>
                    <td style={s.td}>
                      <span style={s.price}>
                        R$ {room.price?.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span
                        style={room.isBooked ? s.statusBooked : s.statusFree}
                      >
                        {room.isBooked ? 'Ocupado' : 'Disponivel'}
                      </span>
                    </td>
                    <td style={s.td}>
                      {!readOnly ? (
                        <button
                          style={s.editBtn}
                          onClick={() => openEdit(room)}
                        >
                          Editar acomodacao
                        </button>
                      ) : (
                        <span style={{ color: '#4a4540', fontSize: '12px' }}>
                          Sem permissao
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
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
  btnDanger: {
    backgroundColor: '#2e1a1a',
    color: '#b88a8a',
    border: '1px solid #4a2a2a',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  btnSmall: {
    backgroundColor: 'transparent',
    color: '#b8a06a',
    border: '1px solid #b8a06a',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  btnSmallDanger: {
    backgroundColor: 'transparent',
    color: '#b88a8a',
    border: '1px solid #4a2a2a',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  btnRemove: {
    backgroundColor: 'transparent',
    color: '#b88a8a',
    border: '1px solid #4a2a2a',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    marginTop: '8px',
  },
  btnAddGallery: {
    backgroundColor: 'transparent',
    color: '#b8a06a',
    border: '1px solid #b8a06a',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  editBtn: {
    backgroundColor: 'transparent',
    color: '#b8a06a',
    border: '1px solid #b8a06a',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
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
  editPanel: {
    backgroundColor: '#1a1814',
    border: '1px solid #b8a06a',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '24px',
  },
  editTitle: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#b8a06a',
    margin: '0 0 24px 0',
    letterSpacing: '1px',
  },
  editActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  coverEditRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  coverEditThumb: {
    width: '120px',
    height: '80px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    flexShrink: 0,
  },
  coverEditEmpty: {
    width: '120px',
    height: '80px',
    backgroundColor: '#2e2a22',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4a4540',
    fontSize: '12px',
    flexShrink: 0,
  },
  coverEditActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  confirmDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  confirmText: { fontSize: '12px', color: '#b88a8a' },
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
    margin: '0 0 24px 0',
    letterSpacing: '1px',
  },
  imageSection: { marginBottom: '24px' },
  imageLabel: {
    fontSize: '11px',
    color: '#6b6355',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px 0',
  },
  dropZone: {
    width: '100%',
    height: '160px',
    border: '2px dashed #2e2a22',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#0f0e0c',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  },
  dropZoneActive: { border: '2px solid #b8a06a', height: '200px' },
  dropContent: { textAlign: 'center' as const },
  dropIcon: {
    fontSize: '28px',
    color: '#4a4540',
    display: 'block',
    marginBottom: '8px',
  },
  dropText: { fontSize: '13px', color: '#6b6355', margin: '0 0 4px 0' },
  dropSub: { fontSize: '11px', color: '#4a4540', margin: 0 },
  coverPreview: { width: '100%', height: '100%', objectFit: 'cover' as const },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  galleryEmpty: {
    width: '100%',
    height: '100px',
    border: '2px dashed #2e2a22',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#0f0e0c',
    gap: '4px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
  },
  galleryItem: {
    position: 'relative' as const,
    borderRadius: '6px',
    overflow: 'hidden',
    aspectRatio: '1',
    backgroundColor: '#0f0e0c',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  galleryRemoveBtn: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#e8e0d0',
    border: 'none',
    borderRadius: '4px',
    width: '22px',
    height: '22px',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryAddMore: {
    border: '2px dashed #2e2a22',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1',
    cursor: 'pointer',
    backgroundColor: '#0f0e0c',
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
  uploadStatus: {
    backgroundColor: '#1e1c16',
    border: '1px solid #3e3820',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '12px',
    color: '#b8a06a',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
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
  roomCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  roomThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  roomThumbEmpty: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    backgroundColor: '#2e2a22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4a4540',
    fontSize: '18px',
    flexShrink: 0,
  },
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
  emptyState: {
    backgroundColor: '#1a1814',
    border: '1px solid #2e2a22',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center' as const,
    color: '#4a4540',
    fontSize: '14px',
  },
  readOnlyBanner: {
    backgroundColor: '#1a1c2e',
    border: '1px solid #3a3060',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#6a8fb8',
    marginBottom: '20px',
  },
};
