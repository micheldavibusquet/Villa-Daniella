import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'hotel-management',

  // 🔧 COLOCA VALORES DIRETOS (não usar process.env aqui)
  projectId: 'rlbqpbtu',
  dataset: 'production',

  basePath: "/studio",

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})