import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { fieldTaskService } from '../../api/services/fieldTaskService'
import { conflictService } from '../../api/services/conflictService'
import { SyncConflictItem, ResolutionStatus, FieldTask } from '../../types/domain'
import { Icon } from '../../components/ui/Icon'
import { FieldTasksHeader } from './field-tasks/FieldTasksHeader'
import { ConflictsTab } from './field-tasks/ConflictsTab'
import { MeasurementsTab } from './field-tasks/MeasurementsTab'
import { ConflictResolveModal } from './field-tasks/ConflictResolveModal'

export const FieldTasks: React.FC = () => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const highlightCode = searchParams.get('highlightCode')

  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Tab chuyển đổi: Nhật ký đo đạc hiện trường (Ưu tiên mặc định cho PM-12) vs Xử lý xung đột
  const [activeTab, setActiveTab] = useState<'CONFLICTS' | 'MEASUREMENTS'>(
    tabParam === 'CONFLICTS' ? 'CONFLICTS' : 'MEASUREMENTS'
  )

  useEffect(() => {
    if (tabParam === 'MEASUREMENTS') {
      setActiveTab('MEASUREMENTS')
    } else if (tabParam === 'CONFLICTS') {
      setActiveTab('CONFLICTS')
    }
  }, [tabParam])

  // Dữ liệu danh sách nhiệm vụ đo đạc hiện trường qua Mock API Service
  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true)

  const loadTasks = async () => {
    setIsLoadingTasks(true)
    try {
      const data = await fieldTaskService.getTasks()
      setFieldTasks(data)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Dữ liệu xung đột ngoại tuyến qua Mock API Service (conflictService)
  const [conflicts, setConflicts] = useState<SyncConflictItem[]>([])
  const [isLoadingConflicts, setIsLoadingConflicts] = useState<boolean>(true)
  const [selectedConflictId, setSelectedConflictId] = useState<string>('conf-01')

  const loadConflicts = async () => {
    setIsLoadingConflicts(true)
    try {
      const data = await conflictService.getConflicts()
      setConflicts(data)
      if (data.length > 0 && !data.some((c) => c.id === selectedConflictId)) {
        setSelectedConflictId(data[0].id)
      }
    } finally {
      setIsLoadingConflicts(false)
    }
  }

  useEffect(() => {
    loadTasks()
    loadConflicts()
  }, [])

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
    | null
  >(null)
  const [resolutionReason, setResolutionReason] = useState<string>('')

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Tìm item đang được chọn để soi chi tiết Side-by-side
  const selectedConflict = useMemo(() => {
    return conflicts.find((c) => c.id === selectedConflictId) || conflicts[0]
  }, [conflicts, selectedConflictId])

  // Thống kê đếm các chỉ số
  const stats = useMemo(() => {
    const total = conflicts.length
    const pending = conflicts.filter((c) => c.status === 'CONFLICT_INTAKE').length
    const reassign = conflicts.filter((c) => c.conflict_type === 'ASSIGNMENT_REASSIGNED').length
    const policyMismatch = conflicts.filter((c) => c.conflict_type === 'POLICY_VERSION_MISMATCH').length
    const rescuePending = conflicts.filter(
      (c) => c.conflict_type === 'DEVICE_RESCUE_PENDING' && c.status === 'CONFLICT_INTAKE'
    ).length
    return { total, pending, reassign, policyMismatch, rescuePending }
  }, [conflicts])

  // Lọc danh sách xung đột
  const filteredConflicts = useMemo(() => {
    return conflicts.filter((item) => {
      const matchSearch =
        item.conflict_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.defect_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chainage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.offline_actor.name.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      if (filterType === 'ALL') return true
      if (filterType === 'PENDING') return item.status === 'CONFLICT_INTAKE'
      if (filterType === 'RESCUE') return item.conflict_type === 'DEVICE_RESCUE_PENDING'
      if (filterType === 'RESOLVED') return item.status !== 'CONFLICT_INTAKE'
      return true
    })
  }, [conflicts, searchTerm, filterType])

  // Reset dữ liệu về ban đầu phục vụ người dùng test qua API
  const handleResetData = async () => {
    setIsLoadingTasks(true)
    setIsLoadingConflicts(true)
    try {
      const [resetTasks, resetConflicts] = await Promise.all([
        fieldTaskService.resetTasks(),
        conflictService.resetConflicts()
      ])
      setFieldTasks(resetTasks)
      setConflicts(resetConflicts)
      if (resetConflicts.length > 0) {
        setSelectedConflictId(resetConflicts[0].id)
      }
      showToast('Đã khôi phục toàn bộ dữ liệu mẫu API ban đầu cho cả 2 tab!', 'info')
    } finally {
      setIsLoadingTasks(false)
      setIsLoadingConflicts(false)
    }
  }

  // Mở modal xác nhận hành động
  const handleOpenResolve = (
    decision:
      | 'ACCEPT_INCOMING'
      | 'KEEP_SERVER_STATE'
      | 'FORK_NEW_ATTEMPT'
      | 'SUBMIT_RESCUE_TO_SUP'
      | 'AUTHORIZE_RESCUE'
      | 'SUPERVISOR_REJECT_RESCUE'
  ) => {
    setPendingDecision(decision)
    setResolutionReason('')
    setIsResolveModalOpen(true)
  }

  // Thực thi phân giải qua Mock API Service (conflictService.resolveConflict)
  const handleExecuteResolution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingDecision || !selectedConflict) return

    try {
      const updatedItem = await conflictService.resolveConflict(selectedConflict.id, {
        decision: pendingDecision,
        reason: resolutionReason,
        decidedBy: user?.full_name || 'Đỗ Quốc Hoàng (PM)',
        decidedByRole: isSupervisor ? 'SUPERVISOR' : 'PROJECT_MANAGER'
      })

      setConflicts((prev) => prev.map((c) => (c.id === updatedItem.id ? updatedItem : c)))
      setIsResolveModalOpen(false)
      showToast(
        `Xác nhận thành công: ${updatedItem.resolution?.decision} cho hồ sơ ${updatedItem.conflict_code}!`,
        'success'
      )
    } catch (err: any) {
      showToast(`Lỗi phân giải: ${err?.message || 'Không thể xử lý'}`, 'error')
    }
  }

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification (Minimalist & Non-blocking) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1A1D20] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Icon
            name={toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
            size={18}
            className={
              toast.type === 'error'
                ? 'text-rose-400'
                : toast.type === 'info'
                ? 'text-blue-400'
                : 'text-[#C9A227]'
            }
          />
          <span className="text-xs font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header, Tab Switchers & KPI Cards */}
      <FieldTasksHeader
        isSupervisor={isSupervisor}
        isPM={isPM}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conflicts={conflicts}
        fieldTasks={fieldTasks}
        stats={stats}
        handleResetData={handleResetData}
      />

      {/* View A: Xử Lý Xung Đột Ngoại Tuyến */}
      {activeTab === 'CONFLICTS' && (
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
        />
      )}

      {/* View B: Nhật Ký Nhiệm Vụ Đo Đạc Hiện Trường */}
      {activeTab === 'MEASUREMENTS' && (
        <MeasurementsTab
          fieldTasks={fieldTasks}
          onRefreshTasks={loadTasks}
          highlightCode={highlightCode}
          isLoading={isLoadingTasks}
          showToast={showToast}
        />
      )}

      {/* Modal Xác Nhận Phân Giải & Audit Trail */}
      <ConflictResolveModal
        isResolveModalOpen={isResolveModalOpen}
        setIsResolveModalOpen={setIsResolveModalOpen}
        selectedConflict={selectedConflict}
        pendingDecision={pendingDecision}
        resolutionReason={resolutionReason}
        setResolutionReason={setResolutionReason}
        handleExecuteResolution={handleExecuteResolution}
      />
    </div>
  )
}
