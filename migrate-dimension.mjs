// Script de migração: copia 'dimension' → 'maxGuests' em todos os hotelRoom
// Uso: node migrate-dimension.mjs
// Remover após a migração concluída.

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

// Lê as variáveis do .env.local manualmente
const env = readFileSync('.env.local', 'utf-8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : null;
};

const client = createClient({
  projectId: getEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: getEnv('NEXT_PUBLIC_SANITY_DATASET'),
  token: getEnv('SANITY_API_TOKEN'),
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function migrate() {
  console.log('🔍 Buscando acomodações...\n');

  // Busca todos os hotelRoom que têm 'dimension' definido
  const rooms = await client.fetch(
    `*[_type == "hotelRoom" && defined(dimension)]{ _id, name, dimension, maxGuests }`,
  );

  if (rooms.length === 0) {
    console.log('✅ Nenhuma acomodação com "dimension" para migrar.');
    return;
  }

  console.log(`📦 ${rooms.length} acomodações encontradas:\n`);

  for (const room of rooms) {
    const dimensionValue = Number(room.dimension);

    if (isNaN(dimensionValue)) {
      console.log(
        `⚠️  ${room.name}: dimension não é número (${room.dimension}), pulando.`,
      );
      continue;
    }

    // Copia dimension → maxGuests e remove dimension
    await client
      .patch(room._id)
      .set({ maxGuests: dimensionValue })
      .unset(['dimension'])
      .commit();

    console.log(
      `✅ ${room.name}: maxGuests = ${dimensionValue} (dimension removido)`,
    );
  }

  console.log('\n🎉 Migração concluída!');
}

migrate().catch((err) => {
  console.error('❌ Erro na migração:', err.message);
  process.exit(1);
});
