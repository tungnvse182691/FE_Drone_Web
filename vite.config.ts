import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec, spawn } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'roadguard-dev-db-sync',
      configureServer(server) {
        // GET /__dev/complete-survey-plan - Đánh dấu hoàn thành đợt bay và tạo Survey trong CSDL SQL Server Docker
        server.middlewares.use('/__dev/complete-survey-plan', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const planId = url.searchParams.get('id') || ''
          const projectId = (url.searchParams.get('projectId') || '').replace(/[^a-fA-F0-9-]/g, '')
          const roadSectionVersionId = (url.searchParams.get('roadSectionVersionId') || '').replace(/[^a-fA-F0-9-]/g, '')
          const cleanId = planId.replace(/[^a-fA-F0-9-]/g, '')
          if (cleanId && cleanId.length >= 4) {
            const sql = [
              'SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;',
              `UPDATE dbo.SurveyPlans SET Status = 4 WHERE CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%';`,
              `UPDATE dbo.SurveyRequests SET Status = 6 WHERE (CAST(SurveyPlanId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${cleanId}%') AND Status IN (1, 2, 8);`,
              `INSERT INTO dbo.Surveys (Id, SurveyRequestId, ProjectId, RoadSectionVersionId, SurveyType, IsBaselineConfirmed, Status) SELECT NEWID(), sr.Id, COALESCE(sr.ProjectId, '${projectId || '72F84201-C001-4000-8000-000000000001'}'), COALESCE(sr.RoadSectionVersionId, '${roadSectionVersionId || '5BAF3408-6489-432F-89ED-127A89E905A5'}'), sr.SurveyType, 0, 3 FROM dbo.SurveyRequests sr WHERE (CAST(sr.SurveyPlanId AS VARCHAR(36)) LIKE '${cleanId}%' OR CAST(sr.Id AS VARCHAR(36)) LIKE '${cleanId}%') AND NOT EXISTS (SELECT 1 FROM dbo.Surveys s WHERE s.SurveyRequestId = sr.Id);`,
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

        // GET /__dev/save-defect - Lưu khiếm khuyết được PM phê duyệt vào CSDL Docker SQL Server cho đúng dự án và tuyến
        server.middlewares.use('/__dev/save-defect', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const projectId = (url.searchParams.get('projectId') || '').replace(/[^a-fA-F0-9-]/g, '')
          const roadSectionVersionId = (url.searchParams.get('roadSectionVersionId') || '').replace(/[^a-fA-F0-9-]/g, '')
          const defectTypeCode = url.searchParams.get('type') === 'POTHOLE' ? 'POTHOLE' : 'CRACK'
          const severityStr = (url.searchParams.get('severity') || '').toUpperCase()
          const severityNum = severityStr.includes('CRITICAL') || severityStr.includes('KHẨN') ? 4 : severityStr.includes('HIGH') || severityStr.includes('NGHIÊM') ? 3 : severityStr.includes('LOW') || severityStr.includes('NHẸ') ? 1 : 2

          if (!projectId || !roadSectionVersionId) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'projectId and roadSectionVersionId are required' }))
            return
          }

          const sql = [
            'SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;',
            'DECLARE @newId UNIQUEIDENTIFIER = NEWID();',
            `INSERT INTO dbo.Defects (Id, ProjectId, RoadSectionVersionId, SourceAIDetectionId, DefectTypeCode, CauseCategoryCode, Severity, Status, ReportedAt) VALUES (@newId, '${projectId}', '${roadSectionVersionId}', NULL, '${defectTypeCode}', NULL, ${severityNum}, 1, SYSUTCDATETIME());`,
            'SELECT CAST(@newId AS VARCHAR(36));'
          ].join(' ')

          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -h -1 -W -Q "${sql}"`
          exec(cmd, (_err, stdout) => {
            const lines = (stdout || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[0-9a-fA-F-]{36}$/.test(l))
            const defectId = lines[0] || crypto.randomUUID()
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, defectId }))
          })
        })

        // GET /__dev/lock-baseline - Khóa Baseline và đồng bộ trạng thái vào CSDL SQL Server Docker
        server.middlewares.use('/__dev/lock-baseline', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const planId = (url.searchParams.get('id') || '').replace(/[^a-fA-F0-9-]/g, '')
          const projectId = (url.searchParams.get('projectId') || '').replace(/[^a-fA-F0-9-]/g, '')

          const sql = [
            'SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON;',
            planId ? `UPDATE dbo.SurveyPlans SET Status = 4 WHERE CAST(Id AS VARCHAR(36)) LIKE '${planId}%';` : '',
            planId ? `UPDATE dbo.SurveyRequests SET Status = 6 WHERE CAST(SurveyPlanId AS VARCHAR(36)) LIKE '${planId}%' OR CAST(Id AS VARCHAR(36)) LIKE '${planId}%';` : '',
            projectId ? `UPDATE dbo.Surveys SET IsBaselineConfirmed = 1, BaselineConfirmedAt = SYSUTCDATETIME() WHERE ProjectId = '${projectId}' OR CAST(Id AS VARCHAR(36)) LIKE '${planId}%' OR CAST(SurveyRequestId AS VARCHAR(36)) LIKE '${planId}%';` : '',
            (projectId && planId) ? `INSERT INTO dbo.Surveys (Id, SurveyRequestId, ProjectId, RoadSectionVersionId, SurveyType, IsBaselineConfirmed, Status, BaselineConfirmedAt) SELECT NEWID(), sr.Id, sr.ProjectId, sr.RoadSectionVersionId, sr.SurveyType, 1, 3, SYSUTCDATETIME() FROM dbo.SurveyRequests sr WHERE (CAST(sr.SurveyPlanId AS VARCHAR(36)) LIKE '${planId}%' OR CAST(sr.Id AS VARCHAR(36)) LIKE '${planId}%') AND NOT EXISTS (SELECT 1 FROM dbo.Surveys s WHERE s.SurveyRequestId = sr.Id);` : '',
            projectId ? `DECLARE @selId UNIQUEIDENTIFIER = NEWID(); INSERT INTO dbo.BaselineSelections (Id, ProjectId, Reason, SelectedAt) VALUES (@selId, '${projectId}', N'PM thẩm định hoàn tất 100% dữ liệu không ảnh và xác nhận khóa Baseline', SYSUTCDATETIME()); IF EXISTS (SELECT 1 FROM dbo.BaselineCurrentPointers WHERE ProjectId = '${projectId}') UPDATE dbo.BaselineCurrentPointers SET SelectionId = @selId WHERE ProjectId = '${projectId}'; ELSE INSERT INTO dbo.BaselineCurrentPointers (ProjectId, SelectionId) VALUES ('${projectId}', @selId);` : ''
          ].filter(Boolean).join(' ')

          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -h -1 -W -Q "${sql}"`
          exec(cmd, (_err, _stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          })
        })
        // GET /__dev/project-policy-meta - Lấy metadata trạng thái chính sách thực tế từ CSDL Docker
        server.middlewares.use('/__dev/project-policy-meta', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const projectId = (url.searchParams.get('projectId') || '').replace(/[^a-fA-F0-9-]/g, '')
          if (!projectId) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'projectId is required' }))
            return
          }
          const sql = `SET NOCOUNT ON; SELECT TOP 1 CAST(d.ProjectId AS VARCHAR(36)) AS projectId, CAST(d.CurrentChangeId AS VARCHAR(36)) AS currentChangeId, CAST(d.PublishedRevisionId AS VARCHAR(36)) AS publishedRevisionId, CAST(r.Id AS VARCHAR(36)) AS revisionId, r.Revision AS revision, r.ChecklistVersion AS checklistVersion, r.DefectTypeCode AS defectTypeCode, r.StopConditions AS stopConditions, CONVERT(VARCHAR(33), r.PublishedAt, 127) AS publishedAt, (SELECT Code AS code, Unit AS unit, Minimum AS minimum, Maximum AS maximum FROM dbo.RepairPolicyMeasurementRules m WHERE m.PolicyRevisionId = r.Id FOR JSON PATH) AS measurementRules FROM dbo.RepairPolicyDrafts d LEFT JOIN dbo.RepairPolicyRevisions r ON d.PublishedRevisionId = r.Id WHERE d.ProjectId = '${projectId}' FOR JSON PATH;`
          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -y 8000 -Q "${sql}"`
          let responded = false
          const child = exec(cmd, (_err, stdout) => {
            if (responded) return
            responded = true
            try {
              const lines = (stdout || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'))
              const jsonStr = lines.join('')
              const rows = jsonStr ? JSON.parse(jsonStr) : []
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, data: rows[0] || null }))
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, data: null }))
            }
          })
          setTimeout(() => {
            if (!responded) {
              responded = true
              try { child.kill() } catch {}
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, data: null }))
            }
          }, 4000)
        })

        // GET /__dev/project-defects - Lấy danh sách khiếm khuyết thực tế từ CSDL Docker
        server.middlewares.use('/__dev/project-defects', (req, res) => {
          const url = new URL(req.url || '', 'http://localhost')
          const projectId = (url.searchParams.get('projectId') || '').replace(/[^a-fA-F0-9-]/g, '')
          if (!projectId) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'projectId is required' }))
            return
          }
          const sql = `SET NOCOUNT ON; SELECT CAST(d.Id AS VARCHAR(36)) AS id, CAST(d.ProjectId AS VARCHAR(36)) AS projectId, d.DefectTypeCode AS defectTypeCode, CASE d.Severity WHEN 1 THEN 'LOW' WHEN 2 THEN 'MEDIUM' WHEN 3 THEN 'HIGH' WHEN 4 THEN 'CRITICAL' ELSE 'LOW' END AS severity, CASE d.Status WHEN 1 THEN 'OPEN' WHEN 2 THEN 'IN_PROGRESS' WHEN 3 THEN 'COMPLETED' ELSE 'OPEN' END AS status, CONVERT(VARCHAR(33), d.ReportedAt, 127) AS reportedAt FROM dbo.Defects d WHERE d.ProjectId = '${projectId}' ORDER BY d.ReportedAt DESC FOR JSON PATH;`
          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -y 8000 -Q "${sql}"`
          let responded = false
          const child = exec(cmd, (_err, stdout) => {
            if (responded) return
            responded = true
            try {
              const lines = (stdout || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'))
              const jsonStr = lines.join('')
              const rows = jsonStr ? JSON.parse(jsonStr) : []
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: rows }))
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          })
          setTimeout(() => {
            if (!responded) {
              responded = true
              try { child.kill() } catch {}
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          }, 800)
        })

        // GET /__dev/projects - Lấy danh mục dự án thực tế từ CSDL Docker
        server.middlewares.use('/__dev/projects', (_req, res) => {
          const sql = `SET NOCOUNT ON; SELECT CAST(Id AS VARCHAR(36)) AS projectId, ProjectCode AS projectCode, Name AS name FROM dbo.Projects ORDER BY ProjectCode FOR JSON PATH;`
          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -y 8000 -Q "${sql}"`
          let responded = false
          const child = exec(cmd, (_err, stdout) => {
            if (responded) return
            responded = true
            try {
              const lines = (stdout || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'))
              const jsonStr = lines.join('')
              const rows = jsonStr ? JSON.parse(jsonStr) : []
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: rows }))
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          })
          setTimeout(() => {
            if (!responded) {
              responded = true
              try { child.kill() } catch {}
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          }, 4000)
        })

        // GET /__dev/projects - Lấy danh mục dự án thực tế từ CSDL Docker
        server.middlewares.use('/__dev/projects', (_req, res) => {
          const sql = `SET NOCOUNT ON; SELECT CAST(Id AS VARCHAR(36)) AS projectId, ProjectCode AS projectCode, Name AS name FROM dbo.Projects ORDER BY ProjectCode FOR JSON PATH;`
          const cmd = `docker exec roadguard-fe-starter01-sql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF" -d RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a -y 8000 -Q "${sql}"`
          let responded = false
          const child = exec(cmd, (_err, stdout) => {
            if (responded) return
            responded = true
            try {
              const lines = (stdout || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'))
              const jsonStr = lines.join('')
              const rows = jsonStr ? JSON.parse(jsonStr) : []
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: rows }))
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          })
          setTimeout(() => {
            if (!responded) {
              responded = true
              try { child.kill() } catch {}
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: true, items: [] }))
            }
          }, 4000)
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


        // GET /__dev/conflicts - Lấy 100% dữ liệu xung đột thật từ bảng dbo.OfflineSyncConflicts trong SQL Server Docker


        server.middlewares.use('/__dev/conflicts', (req, res) => {
          if (req.method !== 'GET') {
            res.writeHead(405).end();
            return;
          }
          const sql = "SET NOCOUNT ON; SELECT c.Id, c.ConflictCode, c.ProjectId, c.ConflictType, c.DefectCode, c.DefectId, c.ChainageKm, c.Status, c.OfflineActorId, ISNULL(u_off.DisplayName, c.OfflineActorName) AS OfflineActorName, c.ServerActorId, ISNULL(u_srv.DisplayName, c.ServerActorName) AS ServerActorName, c.OfflineDataJson, c.ServerDataJson, c.ResolutionDecision, c.ResolutionReason, ISNULL(u_dec.DisplayName, c.DecidedBy) AS DecidedBy, c.DecidedAt, c.CreatedAt FROM dbo.OfflineSyncConflicts c LEFT JOIN RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a.dbo.Users u_off ON u_off.Id = c.OfflineActorId LEFT JOIN RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a.dbo.Users u_srv ON u_srv.Id = c.ServerActorId LEFT JOIN RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a.dbo.Users u_dec ON (TRY_CAST(c.DecidedBy AS uniqueidentifier) IS NOT NULL AND u_dec.Id = TRY_CAST(c.DecidedBy AS uniqueidentifier)) ORDER BY c.CreatedAt DESC FOR JSON PATH;";
          const child = spawn('docker', [
            'exec',
            '-i',
            'roadguard-fe-starter01-sql-1',
            '/opt/mssql-tools/bin/sqlcmd',
            '-S', 'localhost',
            '-U', 'sa',
            '-P', 'Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF',
            '-d', 'RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a',
            '-f', '65001',
            '-y', '0'
          ]);

          const stdoutBufs: Buffer[] = [];
          const stderrBufs: Buffer[] = [];
          child.stdout.on('data', chunk => stdoutBufs.push(chunk));
          child.stderr.on('data', chunk => stderrBufs.push(chunk));

          child.on('error', err => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
          });

          child.on('close', code => {
            try {
              const stdout = Buffer.concat(stdoutBufs).toString('utf8');
              const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'));
              const jsonStr = lines.join('');
              const data = jsonStr ? JSON.parse(jsonStr) : [];
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, items: data }));
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, items: [] }));
            }
          });

          child.stdin.write(Buffer.from(sql, 'utf8'));
          child.stdin.end();
        });

        // POST /__dev/resolve-conflict - Hòa giải và cập nhật trực tiếp vào SQL Server Docker (dùng stdin UTF-8 an toàn)
        server.middlewares.use('/__dev/resolve-conflict', (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405).end();
            return;
          }
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const conflictId = (payload.conflictId || '').replace(/[^a-zA-Z0-9-]/g, '');
              const decision = (payload.decision || '').replace(/[^a-zA-Z0-9_]/g, '');
              const reason = (payload.reason || '').replace(/'/g, "''");
              const decidedBy = (payload.decidedBy || 'Chỉ huy trưởng (PM)').replace(/'/g, "''");

              if (!conflictId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'conflictId is required' }));
                return;
              }

              let targetStatus = 'RESOLVED';
              if (decision === 'SUBMIT_RESCUE_TO_SUP') {
                targetStatus = 'SUBMITTED_TO_SUPERVISOR';
              } else if (decision === 'REQUEST_ADDITIONAL_EVIDENCE') {
                targetStatus = 'EVIDENCE_REQUIRED';
              } else if (decision === 'SUPERVISOR_REJECT_RESCUE') {
                targetStatus = 'REJECTED';
              }

              const sql = `SET NOCOUNT ON; SET QUOTED_IDENTIFIER ON; UPDATE dbo.OfflineSyncConflicts SET Status = '${targetStatus}', ResolutionDecision = '${decision}', ResolutionReason = N'${reason}', DecidedBy = N'${decidedBy}', DecidedAt = SYSDATETIMEOFFSET() WHERE ConflictCode = '${conflictId}' OR (TRY_CAST('${conflictId}' AS uniqueidentifier) IS NOT NULL AND Id = TRY_CAST('${conflictId}' AS uniqueidentifier)); SELECT Id, ConflictCode, ProjectId, ConflictType, DefectCode, DefectId, ChainageKm, Status, OfflineActorId, OfflineActorName, ServerActorId, ServerActorName, OfflineDataJson, ServerDataJson, ResolutionDecision, ResolutionReason, DecidedBy, DecidedAt, CreatedAt FROM dbo.OfflineSyncConflicts WHERE ConflictCode = '${conflictId}' OR (TRY_CAST('${conflictId}' AS uniqueidentifier) IS NOT NULL AND Id = TRY_CAST('${conflictId}' AS uniqueidentifier)) FOR JSON PATH;`;

              const child = spawn('docker', [
                'exec',
                '-i',
                'roadguard-fe-starter01-sql-1',
                '/opt/mssql-tools/bin/sqlcmd',
                '-S', 'localhost',
                '-U', 'sa',
                '-P', 'Rg1!fgCnk8NH_i5xzu-nLaGIkeVkdAujaH9icPczFdy2uN7UCmvua_bF0huYucfLhyYF',
                '-d', 'RoadGuard_FE_e0d8c8837e114a99b56531b87e84165a',
                '-f', '65001',
                '-y', '0'
              ]);

              const stdoutBufs: Buffer[] = [];
              const stderrBufs: Buffer[] = [];
              child.stdout.on('data', chunk => stdoutBufs.push(chunk));
              child.stderr.on('data', chunk => stderrBufs.push(chunk));

              child.on('error', err => {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: `Lỗi kết nối Docker: ${err.message}` }));
              });

              child.on('close', code => {
                const stdout = Buffer.concat(stdoutBufs).toString('utf8');
                const stderr = Buffer.concat(stderrBufs).toString('utf8');

                try {
                  const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('JSON_') && !l.startsWith('---'));
                  const jsonStr = lines.join('');
                  if (!jsonStr) {
                    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: `Không tìm thấy ca xung đột với mã: ${conflictId}` }));
                    return;
                  }
                  const rows = JSON.parse(jsonStr);
                  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                  res.end(JSON.stringify({ ok: true, item: rows[0] || null }));
                } catch (parseErr: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                  res.end(JSON.stringify({ error: stderr || `Lỗi cập nhật CSDL: ${parseErr.message}` }));
                }
              });

              child.stdin.write(Buffer.from(sql, 'utf8'));
              child.stdin.end();
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
          });
        });
      },
    },
  ],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'https://localhost:28443',
        changeOrigin: true,
        secure: false, // Dev proxy only: local backend uses its own TLS certificate.
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
