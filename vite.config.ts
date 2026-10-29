import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'roadguard-dev-db-sync',
      configureServer(server) {
        server.middlewares.use('/__dev/complete-survey-plan', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const planId = url.searchParams.get('id') || ''
          const cleanId = planId.replace(/[^a-fA-F0-9-]/g, '')
          if (cleanId && cleanId.length >= 4) {
            const sql = [
              'SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;',
              `UPDATE dbo.SurveyPlans SET Status = 4 WHERE CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.SurveyRequests SET Status = 6 WHERE (CAST(SurveyPlanId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%') AND Status IN (1, 2, 8);`,
              `INSERT INTO dbo.Surveys (Id, SurveyRequestId, ProjectId, RoadSectionVersionId, SurveyType, IsBaselineConfirmed, Status) SELECT NEWID(), sr.Id, sr.ProjectId, sr.RoadSectionVersionId, sr.SurveyType, 0, 3 FROM dbo.SurveyRequests sr WHERE (CAST(sr.SurveyPlanId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(sr.Id AS VARCHAR(36)) LIKE '${cleanId}%') AND NOT EXISTS (SELECT 1 FROM dbo.Surveys s WHERE s.SurveyRequestId = sr.Id);`,
              `SELECT TOP 1 CAST(Id AS VARCHAR(36)) FROM dbo.SurveyRequests WHERE CAST(SurveyPlanId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%' ORDER BY RequestedAt DESC;`
            ].join(' ')
            const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -h -1 -W -Q "${sql}"`
            exec(cmd, (_err, stdout) => {
              const lines = (stdout || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[0-9a-fA-F-]{36}$/.test(l))
              const taskId = lines[0] || ''
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, taskId }))
            })
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false }))
          }
        })
      },
    },
  ],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://localhost:18443',
        changeOrigin: true,
        secure: false,
        headers: {
          'X-Forwarded-Proto': 'https',
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const authHeader = proxyReq.getHeader('authorization')
            if (authHeader) {
              // Ngăn lỗi "Credentials identify different actors" khi browser còn lưu cookie cũ khác actor với Bearer token
              proxyReq.removeHeader('cookie')
            }
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            // Log response nếu có lỗi
            if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
              console.log(`[PROXY RES] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
            }
          })
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
