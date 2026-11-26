import React, { useCallback, useEffect, useRef, useState } from 'react'
import { safetyResolutionService, type SafetyContext } from '../../../api/services/repairSafetyService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Loading, PanelButton, PanelShell } from '../../../components/ui/PanelKit'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { SafetyResolveForm } from './SafetyResolveForm'
import { useProjectChoice, type ProjectChoice } from './ProjectSelect'

type Row = { obligationId: string; originProjectId?: string | null; currentProjectId: string; safetyContext: SafetyContext }
const short = (id?: string | null) => (id ? id.slice(0, 8).toUpperCase() : '—')

/**
 * PM: kết thúc biện pháp an toàn tạm thời thuộc trách nhiệm của dự án đang xem.
 * Nguồn: GET /projects/{B}/lifecycle → responsibilities[].safetyContext {packageId,itemId,measureId,formalObligationId}; không suy context từ formal, không tự chọn ID.
 */
export const SafetyResolutionPanel: React.FC<{ projects: ProjectChoice[]; initialProjectId?: string }> = ({ projects, initialProjectId }) => {
  const { projectId, select } = useProjectChoice(projects, initialProjectId)
  const user = useAuthStore((s) => s.user)
  const epoch = useAuthStore((s) => s.authEpoch)
  const [rows, setRows] = useState<Row[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [error, setError] = useState('')
  const [picked, setPicked] = useState('')
  const seq = useRef(0)
  const isPm = user?.role === RoleCode.PROJECT_MANAGER

  const load = useCallback(async () => {
    const my = ++seq.current
    setPicked(''); setRows([])
    if (!projectId) { setState('idle'); return }
    setState('loading'); setError('')
    try {
      const r = await safetyResolutionService.contexts(projectId)
      if (seq.current === my) { setRows(r); setState('ready') }
    } catch (e) { if (seq.current === my) { setError(exportError(e)); setState('error') } }
  }, [projectId])
  useEffect(() => { void load(); return () => { seq.current++ } }, [load, epoch])

  if (!isPm) return null
  const row = rows.find((r) => r.obligationId === picked)
  return (
    <PanelShell icon="health_and_safety" title="Kết thúc biện pháp an toàn tạm thời (PM)" subtitle="Biện pháp thuộc trách nhiệm an toàn của dự án đang xem, lấy từ vòng đời (lifecycle) của dự án." data-testid="safety-resolution-panel">
      {select}
      {state === 'loading' && <Loading>Đang đọc vòng đời dự án…</Loading>}
      {state === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được vòng đời dự án: {error}</p><PanelButton onClick={() => { void load() }}>Thử lại</PanelButton></div>}
      {state === 'ready' && !rows.length && <Empty icon="shield">Dự án này hiện không có biện pháp an toàn tạm thời nào mang ngữ cảnh (safetyContext) để kết thúc.</Empty>}
      {state === 'ready' && rows.length > 0 && (
        <select aria-label="Biện pháp an toàn cần kết thúc" className="rg-field w-full" value={picked} onChange={(e) => setPicked(e.target.value)}>
          <option value="">Chọn biện pháp an toàn</option>
          {rows.map((r) => <option key={r.obligationId} value={r.obligationId}>Biện pháp #{short(r.safetyContext.measureId)} · gói {short(r.safetyContext.packageId)} · hạng mục {short(r.safetyContext.itemId)}{r.originProjectId && r.originProjectId !== projectId ? ` · nguồn dự án ${short(r.originProjectId)}` : ''}</option>)}
        </select>
      )}
      {row && <SafetyResolveForm key={row.safetyContext.measureId} projectId={projectId} packageId={row.safetyContext.packageId} itemId={row.safetyContext.itemId} measureId={row.safetyContext.measureId} />}
    </PanelShell>
  )
}
