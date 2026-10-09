import React, { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AuditEvent } from '../../types/domain'
import { auditService, AUDIT_PROJECT_OPTIONS } from '../../api/services'
import { TimeFilter, ExportFormat, ImageModalData } from './audit-trail/types'
import { AuditTrailHeader } from './audit-trail/AuditTrailHeader'
import { AuditTrailMetrics } from './audit-trail/AuditTrailMetrics'
import { AuditTrailFilters } from './audit-trail/AuditTrailFilters'
import { AuditTrailTable } from './audit-trail/AuditTrailTable'
import { AuditTrailInspector } from './audit-trail/AuditTrailInspector'
import { AuditTrailModals } from './audit-trail/AuditTrailModals'

// Bộ lọc thời gian chuẩn theo mốc thời gian hệ thống
const matchTimeFilter = (occurredAtStr: string, filter: TimeFilter) => {
  if (filter === 'all') return true
  const eventTime = new Date(occurredAtStr).getTime()
  // Mốc thời gian hệ thống hiện hành: 10/10/2026 12:00:00 UTC
  const now = new Date('2026-10-10T12:00:00Z').getTime()
  const diffHours = (now - eventTime) / (1000 * 60 * 60)
  if (filter === '24h') return diffHours <= 24 && diffHours >= 0
  if (filter === '7d') return diffHours <= 7 * 24 && diffHours >= 0
  if (filter === '30d') return diffHours <= 30 * 24 && diffHours >= 0
  return true
}

export const AuditTrail: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Dữ liệu dòng sự kiện hoạt động bất đồng bộ từ auditService (In-Memory Mock API, zero localStorage)
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Phân định phạm vi dự án (Mặc định: Tất cả dự án phụ trách)
  const [selectedProject, setSelectedProject] = useState<string>('all')

  // Bộ lọc tiêu chí nghiệp vụ
  const [selectedActorRole, setSelectedActorRole] = useState<string>('all')
  const [selectedActionType, setSelectedActionType] = useState<string>('all')
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d')

  // Trạng thái sao chép và Modal
  const [copiedEventId, setCopiedEventId] = useState<boolean>(false)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF')
  const [exportSuccess, setExportSuccess] = useState<boolean>(false)

  // Xem ảnh phóng to (Lightbox)
  const [activeImageModal, setActiveImageModal] = useState<ImageModalData | null>(null)

  // Trạng thái mở ngăn kéo (Drawer) xem chi tiết sự kiện
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false)

  // Đóng Drawer khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInspectorOpen(false)
      }
    }
    if (isInspectorOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isInspectorOpen])

  // Tải dữ liệu bất đồng bộ từ auditService
  useEffect(() => {
    let mounted = true
    const loadEvents = async () => {
      try {
        setLoading(true)
        const data = await auditService.getAuditEvents({
          projectId: selectedProject
        })
        if (mounted) {
          setEvents(data)
          if (data.length > 0) {
            setSelectedEventId((prev) => prev || data[0].id)
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadEvents()
    return () => {
      mounted = false
    }
  }, [selectedProject])

  // Lọc dữ liệu theo vai trò, dự án, mốc thời gian và từ khóa
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Lọc theo dự án đã chọn
      if (selectedProject !== 'all' && ev.project_id !== selectedProject) {
        return false
      }

      // 2. Lọc theo khoảng thời gian thực tế
      if (!matchTimeFilter(ev.occurred_at, timeFilter)) {
        return false
      }

      // 3. Lọc theo vai trò tác nhân
      if (selectedActorRole !== 'all' && ev.actor_role !== selectedActorRole) {
        return false
      }

      // 4. Lọc theo loại hành động nghiệp vụ
      if (selectedActionType !== 'all' && ev.action_type !== selectedActionType) {
        return false
      }

      // 5. Lọc theo loại thực thể tác động
      if (selectedEntityType !== 'all' && ev.target_entity_type !== selectedEntityType) {
        return false
      }

      // 6. Tìm kiếm từ khóa
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        const matchId = ev.event_id.toLowerCase().includes(q)
        const matchActor = ev.actor_name.toLowerCase().includes(q)
        const matchEntity = ev.target_entity_name.toLowerCase().includes(q)
        const matchAction = ev.action_label_vi.toLowerCase().includes(q)
        const matchLocation = ev.target_location?.toLowerCase().includes(q) || false
        const matchReason = ev.reason.toLowerCase().includes(q)
        if (!matchId && !matchActor && !matchEntity && !matchAction && !matchLocation && !matchReason) {
          return false
        }
      }

      return true
    })
  }, [events, selectedProject, timeFilter, selectedActorRole, selectedActionType, selectedEntityType, searchKeyword])

  // Đồng bộ selectedEventId khi bộ lọc hoặc dự án thay đổi
  useEffect(() => {
    if (filteredEvents.length > 0) {
      const exists = filteredEvents.some((e) => e.id === selectedEventId)
      if (!exists) {
        setSelectedEventId(filteredEvents[0].id)
      }
    }
  }, [filteredEvents, selectedEventId])

  // Sự kiện đang được chọn để soi chi tiết
  const selectedEvent = useMemo(() => {
    return filteredEvents.find((e) => e.id === selectedEventId) || filteredEvents[0] || events[0]
  }, [filteredEvents, selectedEventId, events])

  // Thống kê số liệu tính toán động theo danh sách đang hiển thị
  const calculatedStats = useMemo(() => {
    const totalEventsInScope = filteredEvents.length
    const stateTransitions = filteredEvents.filter((e) => Boolean(e.from_status && e.to_status)).length
    const approvalDecisions = filteredEvents.filter(
      (e) =>
        e.action_type === 'APPROVE_BATCH' ||
        e.action_type === 'ACCEPT_WORK_ORDER' ||
        e.action_type === 'REJECT_BATCH' ||
        e.action_type === 'LOCK_LEGAL_HOLD'
    ).length

    return {
      total_events: totalEventsInScope,
      state_transitions: stateTransitions,
      approval_decisions: approvalDecisions
    }
  }, [filteredEvents])

  // Sao chép Mã sự kiện
  const handleCopyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId)
    setCopiedEventId(true)
    setTimeout(() => setCopiedEventId(false), 2000)
  }

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await auditService.getAuditEvents({
        projectId: selectedProject
      })
      setEvents(data)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Xuất báo cáo nhật ký
  const handleExport = async () => {
    await auditService.exportAuditTrail(exportFormat, selectedProject)
    setExportSuccess(true)
    setTimeout(() => {
      setExportSuccess(false)
      setShowExportModal(false)
    }, 1600)
  }

  const handleResetFilters = () => {
    setSelectedActorRole('all')
    setSelectedActionType('all')
    setSelectedEntityType('all')
    setSearchKeyword('')
    setTimeFilter('all')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-16 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-16">
      <AuditTrailHeader
        isSupervisor={isSupervisor}
        isPM={isPM}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      <AuditTrailMetrics
        calculatedStats={calculatedStats}
        isSupervisor={isSupervisor}
      />

      <AuditTrailFilters
        selectedActorRole={selectedActorRole}
        onChangeActorRole={setSelectedActorRole}
        selectedActionType={selectedActionType}
        onChangeActionType={setSelectedActionType}
        selectedEntityType={selectedEntityType}
        onChangeEntityType={setSelectedEntityType}
        searchKeyword={searchKeyword}
        onChangeSearchKeyword={setSearchKeyword}
        timeFilter={timeFilter}
        onChangeTimeFilter={setTimeFilter}
        onResetFilters={handleResetFilters}
        filteredCount={filteredEvents.length}
        isSupervisor={isSupervisor}
      />

      {/* 3. BẢNG DÒNG SỰ KIỆN HOẠT ĐỘNG (FULL CHIỀU RỘNG, THOÁNG ĐÃNG) */}
      <div className="w-full">
        <AuditTrailTable
          filteredEvents={filteredEvents}
          selectedEventId={selectedEvent?.id || selectedEventId}
          onSelectEventId={(id) => {
            setSelectedEventId(id)
          }}
          onOpenDetails={(id) => {
            setSelectedEventId(id)
            setIsInspectorOpen(true)
          }}
        />
      </div>

      {/* 4. SLIDE-OVER DRAWER: CHI TIẾT SỰ KIỆN (CHỈ HIỂN THỊ KHI BẤM XEM CHI TIẾT) */}
      {isInspectorOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Nền mờ (Backdrop) */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsInspectorOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
            <div className="w-screen max-w-lg md:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-200">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                <AuditTrailInspector
                  selectedEvent={selectedEvent}
                  copiedEventId={copiedEventId}
                  onCopyEventId={handleCopyEventId}
                  onSelectImage={setActiveImageModal}
                  onClose={() => setIsInspectorOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <AuditTrailModals
        activeImageModal={activeImageModal}
        onCloseImageModal={() => setActiveImageModal(null)}
        showExportModal={showExportModal}
        onCloseExportModal={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        onChangeExportFormat={setExportFormat}
        isPM={isPM}
        selectedProject={selectedProject}
        projectList={AUDIT_PROJECT_OPTIONS}
        filteredCount={filteredEvents.length}
        exportSuccess={exportSuccess}
        onExport={handleExport}
      />
    </div>
  )
}

export default AuditTrail
