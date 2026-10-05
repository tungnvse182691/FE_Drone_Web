import React, { useState, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockAuditEvents } from '../../api/mock/data'
import { AuditEvent } from '../../types/domain'
import { TimeFilter, ExportFormat, ImageModalData } from './audit-trail/types'
import { AUDIT_PROJECT_LIST } from './audit-trail/mockData'
import { AuditTrailHeader } from './audit-trail/AuditTrailHeader'
import { AuditTrailMetrics } from './audit-trail/AuditTrailMetrics'
import { AuditTrailFilters } from './audit-trail/AuditTrailFilters'
import { AuditTrailTable } from './audit-trail/AuditTrailTable'
import { AuditTrailInspector } from './audit-trail/AuditTrailInspector'
import { AuditTrailModals } from './audit-trail/AuditTrailModals'

export const AuditTrail: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Dữ liệu dòng sự kiện hoạt động (Activity Timeline / Audit Log) theo v2.2 (RPT-10, US-29, FR-34)
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents)
  const [selectedEventId, setSelectedEventId] = useState<string>(mockAuditEvents[0]?.id || '')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Phân định phạm vi dự án theo vai trò (Role Scope - US-29-AC-02 & UAT-08)
  // PM: Khóa cứng ở dự án phụ trách 'proj-01' (QL1A - Giai đoạn 2)
  // Supervisor: Xem toàn hệ thống ('all') hoặc từng dự án cụ thể
  const [selectedProject, setSelectedProject] = useState<string>(isPM ? 'proj-01' : 'all')

  // Bộ lọc chuẩn theo v2.2 Phần 11.4
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

  // Lọc dữ liệu theo vai trò và tiêu chí lọc nghiệp vụ (v2.2 US-29, Phần 11.4)
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Phân định quyền truy cập theo vai trò (Role Scope - BR-45 & US-29-AC-02 & UAT-08)
      // PM chỉ được xem các sự kiện thuộc dự án được phân công (proj-01)
      if (isPM && ev.project_id !== 'proj-01') {
        return false
      }

      // Supervisor có thể lọc theo dự án được chọn
      if (isSupervisor && selectedProject !== 'all' && ev.project_id !== selectedProject) {
        return false
      }

      // 2. Lọc theo vai trò tác nhân (Actor Role)
      if (selectedActorRole !== 'all') {
        if (ev.actor_role !== selectedActorRole) return false
      }

      // 3. Lọc theo loại hành động nghiệp vụ (Action Type)
      if (selectedActionType !== 'all') {
        if (ev.action_type !== selectedActionType) return false
      }

      // 4. Lọc theo loại thực thể tác động (Entity Type)
      if (selectedEntityType !== 'all') {
        if (ev.target_entity_type !== selectedEntityType) return false
      }

      // 5. Tìm kiếm từ khóa (Mã sự kiện event_id, Tên người, Tên thực thể, Lý trình, Lý do nghiệp vụ)
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
  }, [events, isPM, isSupervisor, selectedProject, selectedActorRole, selectedActionType, selectedEntityType, searchKeyword])

  // Sự kiện đang được chọn để soi chi tiết trong Drawer bên phải
  const selectedEvent = useMemo(() => {
    return filteredEvents.find((e) => e.id === selectedEventId) || filteredEvents[0] || events[0]
  }, [filteredEvents, selectedEventId, events])

  // Thống kê số liệu thực tế trong phạm vi dự án hiện hành (Chuẩn v2.2 Phần 11.2 - RPT-10)
  const calculatedStats = useMemo(() => {
    const totalEventsInScope = filteredEvents.length
    // Đếm các sự kiện có chuyển đổi trạng thái (from_status -> to_status)
    const stateTransitions = filteredEvents.filter((e) => Boolean(e.from_status && e.to_status)).length
    // Đếm số quyết định phê duyệt / từ chối / nghiệm thu của Supervisor
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

  // Hàm sao chép Event ID
  const handleCopyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId)
    setCopiedEventId(true)
    setTimeout(() => setCopiedEventId(false), 2000)
  }

  // Thao tác làm mới dữ liệu (Refresh theo v2.2 Điều 11.1)
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setEvents([...mockAuditEvents])
      setIsRefreshing(false)
    }, 500)
  }

  // Xử lý xuất báo cáo lịch sử hoạt động (FR-35, US-16, Điều 11.5)
  const handleExport = () => {
    setExportSuccess(true)
    setTimeout(() => {
      setExportSuccess(false)
      setShowExportModal(false)
    }, 1800)
  }

  const handleResetFilters = () => {
    setSelectedActorRole('all')
    setSelectedActionType('all')
    setSelectedEntityType('all')
    setSearchKeyword('')
    setTimeFilter('30d')
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1720px] mx-auto w-full pb-16">
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <AuditTrailTable
          filteredEvents={filteredEvents}
          selectedEventId={selectedEvent?.id || selectedEventId}
          onSelectEventId={setSelectedEventId}
        />

        {selectedEvent && (
          <AuditTrailInspector
            selectedEvent={selectedEvent}
            copiedEventId={copiedEventId}
            onCopyEventId={handleCopyEventId}
            onSelectImage={setActiveImageModal}
          />
        )}
      </div>

      <AuditTrailModals
        activeImageModal={activeImageModal}
        onCloseImageModal={() => setActiveImageModal(null)}
        showExportModal={showExportModal}
        onCloseExportModal={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        onChangeExportFormat={setExportFormat}
        isPM={isPM}
        selectedProject={selectedProject}
        projectList={AUDIT_PROJECT_LIST}
        filteredCount={filteredEvents.length}
        exportSuccess={exportSuccess}
        onExport={handleExport}
      />
    </div>
  )
}

export default AuditTrail
