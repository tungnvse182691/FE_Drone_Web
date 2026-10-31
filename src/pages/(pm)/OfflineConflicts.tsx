import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { conflictService } from '../../api/services/conflictService'
import { projectService } from '../../api/services/projectService'
import { SyncConflictItem, HubProject } from '../../types/domain'
import { Icon } from '../../components/ui/Icon'
import { ConflictsTab } from './field-tasks/ConflictsTab'
import { ConflictResolveModal } from './field-tasks/ConflictResolveModal'

/**
 * ============================================================================
 * TRANG QUẢN LÝ & PHÂN GIẢI XUNG ĐỘT NGOẠI TUYẾN (OFFLINE SYNC CONFLICTS)
 * ĐỘC LẬP THEO CHUẨN CANDIDATE3 SPEC W09 & BR-16
 * 100% DỮ LIỆU THẬT TỪ CSDL DATABASE SQL SERVER DOCKER (dbo.OfflineSyncConflicts)
 * ============================================================================
 */
export const OfflineConflicts: React.FC = () => {
  const [searchParams] = useSearchParams()
  const highlightCode = searchParams.get('highlightCode')

  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Danh mục tuyến đường / dự án lấy thật 100% từ CSDL Backend
  const [availableProjects, setAvailableProjects] = useState<HubProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL')

  const loadProjects = useCallback(async () => {
    try {
      const hubProjects = await projectService.fetchProjects()
      setAvailableProjects(hubProjects)
    } catch (err: any) {
      console.error('Lỗi tải danh mục dự án từ CSDL:', err)
    }
  }, [])

  // Dữ liệu xung đột ngoại tuyến qua conflictService từ CSDL Backend
  const [conflicts, setConflicts] = useState<SyncConflictItem[]>([])
  const [isLoadingConflicts, setIsLoadingConflicts] = useState<boolean>(true)
  const [selectedConflictId, setSelectedConflictId] = useState<string>('')
  const [activeSubTab, setActiveSubTab] = useState<'QUEUE' | 'DETAIL'>('QUEUE')

  const loadConflicts = useCallback(async () => {
    setIsLoadingConflicts(true)
    try {
      const data = await conflictService.getConflicts()
      setConflicts(data)
      if (data.length > 0 && !data.some((c) => c.id === selectedConflictId)) {
        if (highlightCode) {
          const match = data.find((c) => c.conflict_code === highlightCode || c.defect_code === highlightCode)
          if (match) {
            setSelectedConflictId(match.id)
          } else {
            setSelectedConflictId(data[0].id)
          }
        } else {
          setSelectedConflictId(data[0].id)
        }
      }
    } catch (err: any) {
      console.warn('Lỗi kiểm tra xung đột từ CSDL:', err)
    } finally {
      setIsLoadingConflicts(false)
    }
  }, [selectedConflictId, highlightCode])

  useEffect(() => {
    loadProjects()
    loadConflicts()
  }, [loadProjects, loadConflicts])

  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false)
  const [pendingDecision, setPendingDecision] = useState<
    | 'ACCEPT_INCOMING'
    | 'KEEP_SERVER_STATE'
    | 'FORK_NEW_ATTEMPT'
    | 'SUBMIT_RESCUE_TO_SUP'
    | 'AUTHORIZE_RESCUE'
    | 'SUPERVISOR_REJECT_RESCUE'
    | 'REQUEST_ADDITIONAL_EVIDENCE'
    | null
  >(null)
  const [resolutionReason, setResolutionReason] = useState<string>('')
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<boolean>(false)
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Lọc tập dữ liệu theo Tuyến đường / Dự án được chọn
  const projectScopedConflicts = useMemo(() => {
    if (selectedProjectId === 'ALL') return conflicts
    return conflicts.filter((c) => (c.project_id || '').toLowerCase() === selectedProjectId.toLowerCase())
  }, [conflicts, selectedProjectId])

  // Tìm item đang được chọn để soi chi tiết Side-by-side
  const selectedConflict = useMemo(() => {
    if (projectScopedConflicts.length === 0) return null
    return projectScopedConflicts.find((c) => c.id === selectedConflictId) || projectScopedConflicts[0]
  }, [projectScopedConflicts, selectedConflictId])

  // Thống kê đếm các chỉ số theo phạm vi dự án
  const stats = useMemo(() => {
    const total = projectScopedConflicts.length
    const pending = projectScopedConflicts.filter((c) => c.status === 'CONFLICT_INTAKE').length
    const reassign = projectScopedConflicts.filter((c) => c.conflict_type === 'ASSIGNMENT_REASSIGNED').length
    const policyMismatch = projectScopedConflicts.filter((c) => c.conflict_type === 'POLICY_VERSION_MISMATCH').length
    const rescuePending = projectScopedConflicts.filter(
      (c) => c.conflict_type === 'DEVICE_RESCUE_PENDING' && c.status === 'CONFLICT_INTAKE'
    ).length
    return { total, pending, reassign, policyMismatch, rescuePending }
  }, [projectScopedConflicts])

  // Lọc danh sách xung đột (theo project, search, filterType)
  const filteredConflicts = useMemo(() => {
    return projectScopedConflicts.filter((item) => {
      const matchSearch =
        item.conflict_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.defect_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chainage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.offline_actor.name.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      if (filterType === 'PENDING') {
        return item.status === 'CONFLICT_INTAKE'
      }
      if (filterType === 'RESCUE') {
        return item.conflict_type === 'DEVICE_RESCUE_PENDING'
      }
      if (filterType === 'RESOLVED') {
        return item.status !== 'CONFLICT_INTAKE'
      }
      return true
    })
  }, [projectScopedConflicts, searchTerm, filterType])

  const handleOpenResolve = (
    decision:
      | 'ACCEPT_INCOMING'
      | 'KEEP_SERVER_STATE'
      | 'FORK_NEW_ATTEMPT'
      | 'SUBMIT_RESCUE_TO_SUP'
      | 'AUTHORIZE_RESCUE'
      | 'SUPERVISOR_REJECT_RESCUE'
      | 'REQUEST_ADDITIONAL_EVIDENCE'
  ) => {
    setPendingDecision(decision)
    setResolutionReason('')
    setResolutionError(null)
    setIsResolveModalOpen(true)
  }

  const handleConfirmResolve = async () => {
    if (!selectedConflict || !pendingDecision) return
    setIsSubmittingResolution(true)
    setResolutionError(null)
    try {
      const updated = await conflictService.resolveConflict(selectedConflict.id, {
        decision: pendingDecision,
        reason: resolutionReason || 'Đã phân giải theo quyết định hiện trường',
        decidedBy: (user as any)?.displayName || user?.full_name || (isSupervisor ? 'Synthetic supervisor' : 'Synthetic pm-a'),
        decidedByRole: isSupervisor ? 'SUPERVISOR' : 'PROJECT_MANAGER'
      })

      setConflicts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setIsResolveModalOpen(false)
      if (pendingDecision === 'SUBMIT_RESCUE_TO_SUP') {
        showToast(`Đã gửi tờ trình cứu hộ ${updated.conflict_code} thành công`, 'success')
      } else if (pendingDecision === 'REQUEST_ADDITIONAL_EVIDENCE') {
        showToast(`Đã phát lệnh yêu cầu đo lại ${updated.conflict_code} thành công`, 'success')
      } else if (pendingDecision === 'AUTHORIZE_RESCUE') {
        showToast(`Đã xác nhận dữ liệu cứu hộ ${updated.conflict_code} thành công`, 'success')
      } else if (pendingDecision === 'SUPERVISOR_REJECT_RESCUE') {
        showToast(`Đã từ chối gói cứu hộ ${updated.conflict_code} thành công`, 'success')
      } else {
        showToast(`Đã xử lý ca ${updated.conflict_code} thành công`, 'success')
      }
    } catch (err: any) {
      const detailError = err.message || 'Lỗi khi cập nhật CSDL'
      setResolutionError(detailError)
      showToast(detailError, 'error')
    } finally {
      setIsSubmittingResolution(false)
    }
  }

  const currentProject = useMemo(() => {
    return availableProjects.find((p) => p.id === selectedProjectId)
  }, [availableProjects, selectedProjectId])

  const conflictProject = useMemo(() => {
    if (!selectedConflict?.project_id) return null
    return availableProjects.find((p) => p.id.toLowerCase() === selectedConflict.project_id?.toLowerCase())
  }, [availableProjects, selectedConflict])

  return (
    <div className="space-y-4">
      {/* Toast Notification đơn giản, không chèn icon */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.type === 'info'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity ml-2 cursor-pointer font-bold"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB */}
      <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <a
          href={isSupervisor ? '#/sup/dashboard' : '#/pm/dashboard'}
          className="hover:text-[#C9A227] transition-colors flex items-center gap-1"
        >
          <Icon name="home" size={14} />
          <span>Trang chủ</span>
        </a>
        <Icon name="chevron_right" size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-800">Xử lý xung đột ngoại tuyến</span>
      </nav>

      {/* 2. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-[#E2E5E9] shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Xử Lý Xung Đột Ngoại Tuyến
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phạm vi: <strong className="text-slate-800 font-semibold">Tiếp nhận kết quả đo thực địa & phân giải xung đột đồng bộ từ thiết bị hiện trường.</strong>
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Khi ở chi tiết xung đột: Ẩn thanh lọc tìm kiếm, hiển thị trực tiếp tên tuyến đường của lỗi xung đột */}
          {activeSubTab === 'DETAIL' ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
              <Icon name="alt_route" size={16} className="text-[#C9A227] shrink-0" />
              <span className="text-slate-500 font-normal">Tuyến đường:</span>
              <span className="text-slate-900 font-bold">
                {conflictProject
                  ? `${conflictProject.code} • ${conflictProject.name}`
                  : (selectedConflict?.route_name || 'Quốc lộ 1A')}
              </span>
            </div>
          ) : (
            /* Bộ chọn tuyến đường / dự án (chỉ hiển thị ở hàng đợi danh sách) */
            <div className="relative min-w-[270px]">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C9A227] text-xs cursor-pointer appearance-none font-semibold transition-all shadow-2xs"
                title="Lọc ca xung đột theo tuyến đường dự án"
              >
                <option value="ALL">
                  Toàn bộ tuyến đường ({availableProjects.length} Dự án)
                </option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} • {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="expand_more" size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. KPI CARDS CHO CÁC CA XUNG ĐỘT (CHỈ HIỂN THỊ KHI Ở HÀNG ĐỢI, ẨN KHI XEM CHI TIẾT ĐỐI CHIẾU) */}
      {activeSubTab === 'QUEUE' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* KPI 1: Tổng ca xung đột */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E5D8B4',
              background: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #C9A227, #D97706)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#C9A227', boxShadow: '0 0 0 4px rgba(201, 162, 39, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Tổng ca xung đột
                  </span>
                </div>
                <Icon name="layers" size={16} className="text-[#C9A227]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.total}</span>
                <span className="text-xs text-amber-700 font-semibold font-mono">({stats.pending} chờ xử lý)</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Đổi đội ngoại tuyến */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #B8C5D9',
              background: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #1E40AF, #3B82F6)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#1E40AF', boxShadow: '0 0 0 4px rgba(30, 64, 175, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Đổi đội ngoại tuyến
                  </span>
                </div>
                <Icon name="call_split" size={16} className="text-[#1E40AF]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.reassign}</span>
                <span className="text-xs text-slate-500 font-medium">hồ sơ</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Lệch chính sách */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E3D3AC',
              background: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#B45309', boxShadow: '0 0 0 4px rgba(180, 83, 9, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Lệch chính sách
                  </span>
                </div>
                <Icon name="warning" size={16} className="text-[#B45309]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{stats.policyMismatch}</span>
                <span className="text-xs text-slate-500 font-medium">hồ sơ</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Cứu hộ thiết bị */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            style={{
              border: '1.5px solid #E6A8A8',
              background: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #B91C1C, #EF4444)' }} />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: '#B91C1C', boxShadow: '0 0 0 4px rgba(185, 28, 28, 0.15)' }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Cứu hộ thiết bị
                  </span>
                </div>
                <Icon name="phonelink_erase" size={16} className="text-[#B91C1C]" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold font-mono text-[#B91C1C]">{stats.rescuePending}</span>
                <span className="text-xs text-rose-700 font-medium">chờ Giám sát ký</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. NỘI DUNG CHÍNH: HÀNG ĐỢI CA XUNG ĐỘT & ĐỐI CHIẾU SIDE-BY-SIDE */}
      <ConflictsTab
        conflicts={conflicts}
        filteredConflicts={filteredConflicts}
        selectedConflict={selectedConflict}
        setSelectedConflictId={setSelectedConflictId}
        filterType={filterType}
        setFilterType={setFilterType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={stats}
        isPM={isPM}
        isSupervisor={isSupervisor}
        handleOpenResolve={handleOpenResolve}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* 5. MODAL XÁC NHẬN PHÂN GIẢI */}
      <ConflictResolveModal
        isResolveModalOpen={isResolveModalOpen}
        setIsResolveModalOpen={(open) => {
          setIsResolveModalOpen(open)
          if (!open) setResolutionError(null)
        }}
        selectedConflict={selectedConflict}
        pendingDecision={pendingDecision}
        resolutionReason={resolutionReason}
        setResolutionReason={setResolutionReason}
        isSubmitting={isSubmittingResolution}
        errorMessage={resolutionError}
        onClearError={() => setResolutionError(null)}
        handleExecuteResolution={async (e) => {
          e.preventDefault()
          await handleConfirmResolve()
        }}
      />
    </div>
  )
}
