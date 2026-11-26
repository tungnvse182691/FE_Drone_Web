import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projectService } from '../../../api/services/projectService'
import { repairWorkflowService, type RepairItem } from '../../../api/services/repairWorkflowService'
import { readProposalPackages, type ProposalRead } from '../../../api/services/proposalReadModel'
import { exportError } from '../../../api/services/projectExportService'
import { useAuthStore } from '../../../store/authStore'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'
import { ItemApprovalStatus, RepairItemDetail } from './types'

const NO_SOURCE = '—'
const NO_API = 'Máy chủ chưa có API cho thao tác này trên màn phê duyệt; chưa gửi và chưa lưu gì.'

// Trạng thái hạng mục theo RepairItemState (docs/specs/17_10/02_Business-Workflows/07_NORMAL-Repair-and-Acceptance.md)
function toApprovalStatus(state: string): ItemApprovalStatus {
  if (state === 'AwaitingApproval') return 'PENDING'
  if (state === 'Cancelled') return 'REJECTED'
  if (state === 'CorrectionRequired') return 'REQUEST_RECONSIDER'
  return 'APPROVED'
}

export function useProposalApprovalState(id: string | undefined) {
  const [params] = useSearchParams()
  const requestedProject = params.get('projectId')
  const isSupervisorRole = useAuthStore((s) => s.user?.role === 'SUPERVISOR')
  const [read, setRead] = useState<ProposalRead | null>(null)
  const [defectTypes, setDefectTypes] = useState<Record<string, string>>({})
  const [scopes, setScopes] = useState<Array<{ obligationId: string; from: number; to: number; offsetFrom: number; offsetTo: number }>>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [revision, setRevision] = useState(0)
  const approveGuard = useSubmitGuard()

  // Đọc gói + hạng mục thật từ BE (GET repair-packages, items, road-coverage, defects)
  useEffect(() => {
    const c = new AbortController()
    setRead(null)
    setLoadError('')
    if (!id) return
    setLoading(true)
    ;(async () => {
      const projects = await projectService.fetchProjects()
      const candidates = requestedProject ? projects.filter((p) => p.id === requestedProject) : projects
      if (requestedProject && !candidates.length) throw new Error('Dự án liên kết không thuộc danh mục được phép đọc.')
      const wanted = id.trim().toLowerCase()
      for (const project of candidates) {
        const rows = await readProposalPackages([project], c.signal)
        const hit = rows.find((r) => r.raw.id.toLowerCase() === wanted || r.view.code.toLowerCase() === wanted)
        if (!hit) continue
        // Supervisor không có quyền đọc /defects (HTTP 403 đã kiểm thật): chỉ PM đọc loại khiếm khuyết, Supervisor hiện '—'
        const [defects, coverage] = await Promise.all([
          useAuthStore.getState().user?.role === 'PROJECT_MANAGER' ? repairWorkflowService.defects(project.id, c.signal) : Promise.resolve([]),
          repairWorkflowService.coverage(project.id, c.signal)
        ])
        if (c.signal.aborted) return
        setDefectTypes(Object.fromEntries(defects.map((d) => [d.id, d.defectTypeCode || ''])))
        setScopes(coverage.scopes)
        setRead(hit)
        return
      }
      throw new Error('Không tìm thấy gói sửa chữa này trong các dự án được phép đọc.')
    })()
      .catch((e) => {
        if (!c.signal.aborted) setLoadError(exportError(e))
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false)
      })
    return () => c.abort()
  }, [id, requestedProject, revision])

  const rawItems: RepairItem[] = read?.items ?? []
  const items = useMemo<RepairItemDetail[]>(
    () =>
      rawItems.map((it) => {
        const sc = scopes.find((s) => s.obligationId === it.obligationId)
        return {
          id: it.id,
          item_code: `ITEM-${it.id.slice(0, 8).toUpperCase()}`,
          defect_code: `DEF-${it.defectId.slice(0, 8).toUpperCase()}`,
          chainage: sc ? `${sc.from}–${sc.to} m` : NO_SOURCE,
          lane_info: sc ? `Lệch ${sc.offsetFrom}–${sc.offsetTo} m` : NO_SOURCE,
          defect_title: defectTypes[it.defectId] || NO_SOURCE,
          defect_measurements: NO_SOURCE,
          solution_title: `Luồng ${it.mode}`,
          solution_standard: NO_SOURCE,
          volume_display: NO_SOURCE,
          volume_sub: NO_SOURCE,
          area_m2: 0,
          status: toApprovalStatus(it.state),
          status_label: `${it.mode}: ${it.state}`,
          assigned_crew: '',
          image_url: '',
          ortho_code: NO_SOURCE,
          gps_coords: NO_SOURCE,
          resolution: NO_SOURCE
        }
      }),
    [rawItems, scopes, defectTypes]
  )

  // Package Data State (chỉ dữ liệu BE; thiếu nguồn thì hiện "—")
  const packageCode = read?.view.code || (id ? id.toUpperCase() : NO_SOURCE)
  const packageName = read?.view.title || NO_SOURCE
  const routeDisplay = read?.view.route_name || NO_SOURCE
  const chainageDisplay = read?.view.chainage_display || NO_SOURCE
  const createdByName = NO_SOURCE
  const createdAt = NO_SOURCE
  const packageStatus = read?.view.status || ''
  const activeProjectId = read?.view.route_id || ''
  const activePackageId = read?.raw.id || ''

  // Filter State
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED'>(
    'ALL'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Lightbox Modal for Defect Photo
  const [viewingPhotoItem, setViewingPhotoItem] = useState<RepairItemDetail | null>(null)

  // Batch Approve Modal
  const [isBatchApproveConfirmOpen, setIsBatchApproveConfirmOpen] = useState(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Derived Statistics
  const stats = useMemo(() => {
    const total = items.length
    const approved = items.filter((i) => i.status === 'APPROVED').length
    const evidence = items.filter((i) => i.status === 'REQUEST_EVIDENCE').length
    const reconsider = items.filter((i) => i.status === 'REQUEST_RECONSIDER').length
    const rejected = items.filter((i) => i.status === 'REJECTED').length
    const pending = items.filter((i) => i.status === 'PENDING').length

    const approvedArea = items
      .filter((i) => i.status === 'APPROVED')
      .reduce((sum, item) => sum + item.area_m2, 0)
    const totalProposedArea = items.reduce((sum, item) => sum + item.area_m2, 0)
    const percent = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0

    return {
      total,
      approved,
      evidence,
      reconsider,
      rejected,
      pending,
      percent,
      approvedArea: Math.round(approvedArea * 10) / 10,
      totalProposedArea: Math.round(totalProposedArea * 10) / 10
    }
  }, [items])

  // Filtering & Pagination
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterTab === 'APPROVED' && item.status !== 'APPROVED') return false
      if (filterTab === 'PENDING' && item.status !== 'PENDING') return false
      if (filterTab === 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_RECONSIDER')
        return false
      if (filterTab === 'REJECTED' && item.status !== 'REJECTED') return false

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchCode = item.item_code.toLowerCase().includes(q)
        const matchDefect = item.defect_code.toLowerCase().includes(q)
        const matchChainage = item.chainage.toLowerCase().includes(q)
        const matchTitle = item.defect_title.toLowerCase().includes(q)
        const matchSol = item.solution_title.toLowerCase().includes(q)
        return matchCode || matchDefect || matchChainage || matchTitle || matchSol
      }

      return true
    })
  }, [items, filterTab, searchTerm])

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1
  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  // Phê duyệt hạng mục Normal: POST .../items/{id}/approve qua repairWorkflowService.decide (Idempotency-Key + If-Match), rồi GET đối chiếu
  const approveOne = async (itemId: string, reasonInput: string) => {
    if (!activeProjectId || !activePackageId) throw new Error('Chưa đọc được gói sửa chữa từ máy chủ.')
    const held = repairWorkflowService.pending(activeProjectId, activePackageId, itemId, 'approve')
    return repairWorkflowService.decide(activeProjectId, activePackageId, itemId, 'approve', held?.body.reason || reasonInput)
  }

  const handleQuickApproveItem = async (itemId: string) => {
    if (!isSupervisorRole) return showToast('Chỉ Giám sát được phê duyệt hạng mục.')
    try {
      const held = repairWorkflowService.pending(activeProjectId, activePackageId, itemId, 'approve')
      const reason = held?.body.reason || window.prompt('Nhập lý do phê duyệt hạng mục:') || ''
      if (!reason.trim()) return showToast('Cần nhập lý do để phê duyệt.')
      if (!approveGuard.acquire()) return
      try {
        const row = await approveOne(itemId, reason)
        showToast(`Đã GET đối chiếu hạng mục ${row.id.slice(0, 8).toUpperCase()}: ${row.state}.`)
        setRevision((n) => n + 1)
      } finally { approveGuard.release() }
    } catch (e) {
      showToast(exportError(e))
    }
  }

  // Chưa có endpoint BE cho yêu cầu bổ sung/xem lại/từ chối từ màn này: không giả vờ lưu
  const handleBatchApproveAll = async () => {
    setIsBatchApproveConfirmOpen(false)
    if (!isSupervisorRole) return showToast('Chỉ Giám sát được phê duyệt hạng mục.')
    const targets = rawItems.filter((it) => it.mode === 'Normal' && it.state === 'AwaitingApproval')
    if (!targets.length) return showToast('Không có hạng mục Normal nào đang chờ duyệt.')
    const reason = window.prompt(`Nhập lý do phê duyệt ${targets.length} hạng mục:`) || ''
    if (!reason.trim()) return showToast('Cần nhập lý do để phê duyệt.')
    let done = 0
    if (!approveGuard.acquire()) return
    try {
      for (const it of targets) {
        await approveOne(it.id, reason)
        done++
      }
      showToast(`Đã duyệt và GET đối chiếu ${done}/${targets.length} hạng mục.`)
    } catch (e) {
      showToast(`Đã duyệt ${done}/${targets.length}; dừng do lỗi: ${exportError(e)}`)
    } finally { approveGuard.release() }
    setRevision((n) => n + 1)
  }

  return {
    loading,
    loadError,
    packageCode,
    packageName,
    routeDisplay,
    chainageDisplay,
    createdByName,
    createdAt,
    packageStatus,
    items,
    stats,
    filterTab,
    setFilterTab,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    displayedItems,
    viewingPhotoItem,
    setViewingPhotoItem,
    isBatchApproveConfirmOpen,
    setIsBatchApproveConfirmOpen,
    toastMessage,
    setToastMessage,
    showToast,
    handleQuickApproveItem,
    handleBatchApproveAll,
    activeProjectId,
    activePackageId
  }
}
