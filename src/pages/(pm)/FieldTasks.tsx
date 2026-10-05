import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { mockSyncConflicts, mockFieldTasks } from '../../api/mock/data'
import { SyncConflictItem, ResolutionStatus, FieldTask } from '../../types/domain'
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

  // Tab chuyển đổi: Xử lý xung đột vs Nhật ký đo đạc hiện trường
  const [activeTab, setActiveTab] = useState<'CONFLICTS' | 'MEASUREMENTS'>(
    tabParam === 'MEASUREMENTS' ? 'MEASUREMENTS' : 'CONFLICTS'
  )

  useEffect(() => {
    if (tabParam === 'MEASUREMENTS') {
      setActiveTab('MEASUREMENTS')
    } else if (tabParam === 'CONFLICTS') {
      setActiveTab('CONFLICTS')
    }
  }, [tabParam])

  // Dữ liệu danh sách nhiệm vụ đo đạc hiện trường (Đồng bộ từ LocalStorage + mockFieldTasks)
  const [fieldTasks] = useState<FieldTask[]>(() => {
    try {
      const saved = localStorage.getItem('roadguard_field_tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: FieldTask[] = parsed.map((item: any, idx: number) => ({
            id: item.id || `ft-local-${idx}`,
            code: item.code || `TSK-MEAS-2026-${String(idx + 10).padStart(3, '0')}`,
            defect_id: item.defectId || item.defect_id || 'def-01',
            defect_code: item.defectCode || item.defect_code || '#REP-2026-0813',
            measurement_type:
              item.mode === 'DRONE_RESURVEY'
                ? 'Bay quét Drone bổ sung (DRONE_RESURVEY)'
                : 'Đo thước cơ học & độ sâu lòng hố (MEASURE_ONLY)',
            chainage_km:
              parseFloat((item.stationing || 'Km 1024+300').replace(/[^0-9.]/g, '')) || 1024.3,
            status: item.status || 'ASSIGNED',
            measured_value: item.measured_value || undefined,
            evidence_photo_url: item.evidence_photo_url || undefined,
            technician_name: item.assignedTo || 'Tổ đo đạc hiện trường 01'
          }))
          return [...mapped, ...mockFieldTasks]
        }
      }
    } catch (e) {
      console.warn('Failed to parse roadguard_field_tasks', e)
    }
    return mockFieldTasks
  })

  // Dữ liệu xung đột được quản lý tập trung từ mockSyncConflicts
  const [conflicts, setConflicts] = useState<SyncConflictItem[]>(mockSyncConflicts)
  const [selectedConflictId, setSelectedConflictId] = useState<string>(mockSyncConflicts[0]?.id || 'conf-01')
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

  // Reset dữ liệu về ban đầu phục vụ người dùng test
  const handleResetData = () => {
    setConflicts([...mockSyncConflicts])
    setSelectedConflictId(mockSyncConflicts[0]?.id || 'conf-01')
    alert('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu để bạn tiếp tục test!')
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

  // Thực thi phân giải
  const handleExecuteResolution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingDecision || !selectedConflict) return

    let nextStatus: ResolutionStatus = 'RESOLVED_ACCEPT_INCOMING'
    let decisionText = 'Chấp nhận chứng cứ ngoại tuyến (Accept Incoming)'

    if (pendingDecision === 'KEEP_SERVER_STATE') {
      nextStatus = 'RESOLVED_KEEP_SERVER'
      decisionText = 'Bảo lưu trạng thái máy chủ (Keep Server State)'
    } else if (pendingDecision === 'FORK_NEW_ATTEMPT') {
      nextStatus = 'RESOLVED_FORK_ATTEMPT'
      decisionText = 'Tách thành lần sửa chữa độc lập mới (Fork New Attempt)'
    } else if (pendingDecision === 'SUBMIT_RESCUE_TO_SUP') {
      nextStatus = 'CONFLICT_INTAKE'
      decisionText = 'PM đã lập tờ trình cứu hộ thiết bị gửi Giám sát (Q17/Decision 42A)'
    } else if (pendingDecision === 'AUTHORIZE_RESCUE') {
      nextStatus = 'RESCUE_AUTHORIZED'
      decisionText = 'Supervisor ký số Phê duyệt đưa gói cứu hộ vào kho chứng cứ (Decision 42A)'
    } else if (pendingDecision === 'SUPERVISOR_REJECT_RESCUE') {
      nextStatus = 'RESCUE_REJECTED'
      decisionText = 'Supervisor từ chối gói cứu hộ thiết bị (Bắt buộc đo đạc lại hiện trường)'
    }

    const updated = conflicts.map((c) => {
      if (c.id === selectedConflict.id) {
        return {
          ...c,
          status: nextStatus,
          status_label:
            nextStatus === 'RESCUE_AUTHORIZED'
              ? 'ĐÃ DUYỆT CỨU HỘ (42A)'
              : nextStatus === 'RESCUE_REJECTED'
              ? 'TỪ CHỐI CỨU HỘ'
              : nextStatus === 'RESOLVED_ACCEPT_INCOMING'
              ? 'ĐÃ DUYỆT NGOẠI TUYẾN'
              : nextStatus === 'RESOLVED_KEEP_SERVER'
              ? 'ĐÃ BẢO LƯU MÁY CHỦ'
              : nextStatus === 'RESOLVED_FORK_ATTEMPT'
              ? 'ĐÃ TÁCH LẦN SỬA'
              : 'CHỜ SUP DUYỆT CỨU HỘ',
          resolution: {
            decision: decisionText,
            decided_by: user?.full_name || 'Đỗ Quốc Hoàng (PM)',
            decided_by_role: isSupervisor ? 'SUPERVISOR' : 'PROJECT_MANAGER',
            decided_at: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) + ' Hôm nay',
            reason: resolutionReason.trim() || 'Thực hiện phân giải theo đúng thẩm quyền và hồ sơ kiểm toán TCVN.',
            audit_hash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...SHA256'
          }
        }
      }
      return c
    })

    setConflicts(updated)
    setIsResolveModalOpen(false)
    alert(`Xác nhận thành công: ${decisionText} cho hồ sơ ${selectedConflict.conflict_code}!`)
  }

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
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
          highlightCode={highlightCode}
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
