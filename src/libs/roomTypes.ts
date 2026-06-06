/**
 * Tipos de acomodação disponíveis no sistema.
 *
 * Este arquivo é a fonte única da verdade (Single Source of Truth) para os
 * tipos de acomodação. Qualquer alteração aqui reflete automaticamente em:
 * - Filtro de busca na página pública (Search.tsx)
 * - Formulário de cadastro/edição no painel admin (AdminRooms.tsx)
 * - Listagem de tipos na seção hero da homepage (ClientComponent.tsx)
 *
 * Valores devem usar snake_case e corresponder exatamente ao campo `type`
 * cadastrado nas acomodações no Sanity CMS.
 */
export const ROOM_TYPES = [
  { value: 'casa_inteira', label: 'Casa Inteira' },
  { value: 'suite', label: 'Suíte' },
  { value: 'quarto_compartilhado', label: 'Quarto Compartilhado' },
  { value: 'cabana', label: 'Cabana' },
  { value: 'personalizado', label: 'Personalizado...' },
];

/**
 * Tipos exibidos publicamente na homepage e no filtro de busca.
 * Exclui a opção "Personalizado" que é exclusiva do painel admin.
 */
export const PUBLIC_ROOM_TYPES = ROOM_TYPES.filter(
  (t) => t.value !== 'personalizado',
);
