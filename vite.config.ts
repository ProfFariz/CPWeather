import type { ServerResponse } from 'node:http'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import dashboardHandler from './api/dashboard.ts'

function createDevApiResponse(res: ServerResponse) {
  return {
    setHeader(name: string, value: string) {
      res.setHeader(name, value)
    },
    status(statusCode: number) {
      res.statusCode = statusCode
      return this
    },
    json(body: unknown) {
      if (!res.hasHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }

      res.end(JSON.stringify(body))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'local-dashboard-api',
      configureServer(server) {
        server.middlewares.use('/api/dashboard', (req, res) => {
          dashboardHandler(
            {
              method: req.method,
              url: req.url,
            },
            createDevApiResponse(res),
          )
        })
      },
    },
  ],
})
