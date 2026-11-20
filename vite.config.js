import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

import { partyApi } from './server/party-api.js'
function partyMiddleware(server) {
  server.middlewares.use('/api/party', (req, res) => partyApi(req, res, true))
}

export default defineConfig({
  plugins: [react(), { name: 'party-room', configureServer: partyMiddleware, configurePreviewServer: partyMiddleware }],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
