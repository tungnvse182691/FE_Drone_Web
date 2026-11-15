import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../api/services/projectService'
import { repairWorkflowService as service, type RepairPackage, type RepairItem, type RepairHistory, type RepairEligibility, type RoadCoverage } from '../../api/services/repairWorkflowService'
import { exportError } from '../../api/services/projectExportService'

const states: Record<string, string> = { AwaitingApproval: 'Chờ Giám sát phê duyệt', ReadyToAssign: 'Sẵn sàng giao việc', Assigned: 'Đã giao việc', InProgress: 'Đang thi công', Submitted: 'Chờ PM rà soát', Reviewed: 'Chờ xác nhận cuối', Confirmed: 'Đã xác nhận', Cancelled: 'Đã hủy', CorrectionRequired: 'Cần hiệu chỉnh' }
const results: Record<string, string> = { UNREPAIRED: 'Chưa sửa chữa', REPORTED_AWAITING_REVIEW: 'Đã báo cáo, chờ kiểm tra', CONFIRMED: 'Đã xác nhận' }

export const repairStates = states
export const repairResults = results

export function useRepairWorkspace({ acceptance = false, fastTrack = false, packageId }: { acceptance?: boolean; fastTrack?: boolean; packageId?: string } = {}) {
  const epoch = useAuthStore(s => s.authEpoch), role = useAuthStore(s => s.user?.role)
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof projectService.fetchProjects>>>([])
  const [project, setProject] = useState(''), [revision, setRevision] = useState(0)
  const [packages, setPackages] = useState<Array<RepairPackage & { items: RepairItem[] }>>([])
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{pkg: string; item: RepairItem} | null>(null)
  const [history, setHistory] = useState<RepairHistory | null>(null), [historyError, setHistoryError] = useState('')
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const [pendingAction, setPendingAction] = useState<'approve' | 'final-confirmation' | null>(null)
  const [creating, setCreating] = useState(false)
  const [coverage, setCoverage] = useState<RoadCoverage | null>(null), [coverageError, setCoverageError] = useState('')
  const [eligibility, setEligibility] = useState<RepairEligibility | null>(null), [eligibilityError, setEligibilityError] = useState('')
  useEffect(() => {
    const c = new AbortController(); setCoverage(null); setCoverageError('')
    if (fastTrack && project) service.coverage(project, c.signal).then(data => {if (!c.signal.aborted) setCoverage(data)}).catch(e => {if (!c.signal.aborted) setCoverageError(exportError(e))})
    return () => c.abort()
  }, [fastTrack, project, revision, epoch, role])
  useEffect(() => {
    let current = true
    setProjects([]); setProject(''); setPackages([]); setSelected(null)
    projectService.fetchProjects().then(rows => { if (current) { setProjects(rows); setProject(rows[0]?.id || '') } }).catch(e => { if (current) setError(exportError(e)) })
    return () => { current = false }
  }, [epoch, role])
  useEffect(() => {
    const c = new AbortController()
    setPackages([]); setSelected(null); setHistory(null); setError(''); setLoading(!!project)
    if (project) (async () => {
      const rows = await service.packages(project, c.signal)
      const detailed = []
      for (const pkg of rows.filter(p => !packageId || p.id === packageId)) detailed.push({ ...pkg, items: await service.items(project, pkg.id, c.signal) })
      if (!c.signal.aborted) setPackages(detailed)
    })().catch(e => { if (!c.signal.aborted) setError(exportError(e)) }).finally(() => { if (!c.signal.aborted) setLoading(false) })
    return () => c.abort()
  }, [project, packageId, revision, epoch, role])
  useEffect(() => {
    const c = new AbortController()
    setHistory(null); setHistoryError(''); setReason(''); setPendingAction(null)
    setEligibility(null); setEligibilityError('')
    if (selected) {
      try {
        for (const action of ['approve', 'final-confirmation'] as const) {
          const held = service.pending(project, selected.pkg, selected.item.id, action)
          if (held) { setReason(held.body.reason); setPendingAction(action); break }
        }
      } catch (e) { setHistoryError(exportError(e)) }
      service.history(project, selected.pkg, selected.item.id, c.signal).then(data => { if (!c.signal.aborted) setHistory(data) }).catch(e => { if (!c.signal.aborted) setHistoryError(exportError(e)) })
      if (selected.item.mode === 'FastTrack') service.eligibility(project, selected.pkg, selected.item.id, c.signal).then(data => {if (!c.signal.aborted) setEligibility(data)}).catch(e => {if (!c.signal.aborted) setEligibilityError(exportError(e))})
    }
    return () => c.abort()
  }, [selected, project, epoch, role])
  const decide = async (action: 'approve' | 'final-confirmation') => {
    if (!selected || busy) return
    setBusy(true); setNotice('')
    try {
      await service.decide(project, selected.pkg, selected.item.id, action, reason)
      setNotice('Đã đọc lại hạng mục từ Backend sau quyết định.'); setRevision(n => n + 1)
    } catch (e) { setHistoryError(exportError(e)); setPendingAction(service.pending(project, selected.pkg, selected.item.id, action) ? action : null) } finally { setBusy(false) }
  }
  const currentItem = history?.item || selected?.item
  const canApprove = role === 'SUPERVISOR' && currentItem?.mode === 'Normal' && currentItem.state === 'AwaitingApproval'
  const canConfirm = currentItem?.state === 'Reviewed' && role === (currentItem.mode === 'Normal' ? 'SUPERVISOR' : 'PROJECT_MANAGER')
  const filtered = packages.map(p => ({...p, items: p.items.filter(i => !fastTrack || i.mode === 'FastTrack')})).filter(p => (!fastTrack || p.items.length) && (!search.trim() || projects.find(pr => pr.id === p.projectId)?.name.toLowerCase().includes(search.toLowerCase()) || p.items.some(i => (states[i.state] || i.state).toLowerCase().includes(search.toLowerCase()))))
  return { epoch, role, projects, project, setProject, revision, setRevision, packages, loading, error, search, setSearch, selected, setSelected, history, historyError, reason, setReason, busy, notice, setNotice, pendingAction, creating, setCreating, coverage, coverageError, eligibility, eligibilityError, decide, currentItem, canApprove, canConfirm, filtered }
}
