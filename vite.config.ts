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

        server.middlewares.use('/__dev/reset-ai-candidate', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const sourceId = url.searchParams.get('id') || ''
          const cleanId = sourceId.replace(/[^a-fA-F0-9-]/g, '')
          if (cleanId && cleanId.length >= 8) {
            const sql = [
              'SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;',
              `DECLARE @defId UNIQUEIDENTIFIER;`,
              `SELECT TOP 1 @defId = DefectId FROM dbo.DefectSourceLinks WHERE CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `DELETE FROM dbo.DefectSourceLinks WHERE CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.SourceDecisions SET SupersedesDecisionId = NULL WHERE CAST(Source_Id AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `DELETE FROM dbo.SourceDecisions WHERE CAST(Source_Id AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.CandidateDecisions SET SupersedesDecisionId = NULL WHERE CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `DELETE FROM dbo.CandidateDecisions WHERE CAST(SourceId AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.AiRunDetections SET DispositionId = NULL, DecisionId = NULL WHERE CAST(Detection_Id AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.AiMockRunDetections SET DispositionId = NULL, DecisionId = NULL WHERE CAST(DetectionId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `IF @defId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.DefectSourceLinks WHERE DefectId = @defId) AND NOT EXISTS (SELECT 1 FROM dbo.CaseConclusionDefects WHERE DefectId = @defId) AND NOT EXISTS (SELECT 1 FROM dbo.RepairItems WHERE DefectId = @defId) DELETE FROM dbo.Defects WHERE Id = @defId;`
            ].join(' ')
            const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -h -1 -W -Q "${sql}"`
            const child = exec(cmd, () => {
              // Xử lý callback nếu hoàn thành
            })
            // Đặt timeout 600ms phòng khi docker exec trên Windows stdout không đóng stream
            setTimeout(() => {
              try { child.kill() } catch {}
            }, 600)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false }))
          }
        })

        server.middlewares.use('/__dev/update-ai-candidate', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const sourceId = (url.searchParams.get('id') || '').replace(/[^a-fA-F0-9-]/g, '')
          const x = parseFloat(url.searchParams.get('x') || '')
          const y = parseFloat(url.searchParams.get('y') || '')
          const w = parseFloat(url.searchParams.get('w') || '')
          const h = parseFloat(url.searchParams.get('h') || '')
          const typeCode = (url.searchParams.get('typeCode') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
          const typeName = (url.searchParams.get('typeName') || '').replace(/'/g, "''").slice(0, 128)

          const sqlParts: string[] = ['SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;']
          if (typeCode) {
            const display = typeName || typeCode
            sqlParts.push(
              `IF NOT EXISTS (SELECT 1 FROM dbo.DefectTypes WHERE Code = '${typeCode}') INSERT INTO dbo.DefectTypes (Code, Name, IsActive) VALUES ('${typeCode}', N'${display}', 1);`
            )
          }
          if (sourceId && sourceId.length >= 8 && !isNaN(x) && !isNaN(y) && !isNaN(w) && !isNaN(h)) {
            sqlParts.push(
              `IF OBJECT_ID('dbo.AiMockRunDetections', 'U') IS NOT NULL UPDATE dbo.AiMockRunDetections SET BboxX = ${x.toFixed(4)}, BboxY = ${y.toFixed(4)}, BboxW = ${w.toFixed(4)}, BboxH = ${h.toFixed(4)}${typeCode ? `, TypeCode = '${typeCode}'` : ''} WHERE CAST(DetectionId AS VARCHAR(36)) LIKE '${sourceId}%';`,
              `IF OBJECT_ID('dbo.AiRunDetections', 'U') IS NOT NULL UPDATE dbo.AiRunDetections SET Bbox_X = ${x.toFixed(4)}, Bbox_Y = ${y.toFixed(4)}, Bbox_Width = ${w.toFixed(4)}, Bbox_Height = ${h.toFixed(4)}${typeCode ? `, Type_Code = '${typeCode}'` : ''} WHERE CAST(Detection_Id AS VARCHAR(36)) LIKE '${sourceId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${sourceId}%';`
            )
          }

          if (sqlParts.length > 1) {
            const sql = sqlParts.join(' ')
            const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -h -1 -W -Q "${sql}"`
            const child = exec(cmd, () => {
              if (!res.writableEnded) {
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ ok: true }))
              }
            })
            setTimeout(() => {
              try { child.kill() } catch {}
            }, 600)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
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
