import { useState, useMemo } from 'react'
import { LegalHoldProject, DataDeletionRequest } from '../../../types/domain'
import { mockLegalHoldProjects, mockDataDeletionRequests } from '../../../api/mock/data'

export function useLegalHoldState(
  currentUser: { id?: string; full_name?: string } | null,
  isSupervisor: boolean,
  triggerNotice: (msg: string) => void
) {
  const [legalHoldProjects, setLegalHoldProjects] = useState<LegalHoldProject[]>(mockLegalHoldProjects)
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>(mockDataDeletionRequests)

  const [showCreateDeletionRequestModal, setShowCreateDeletionRequestModal] = useState<boolean>(false)
  const [newDelProject, setNewDelProject] = useState<string>('proj-01')
  const [newDelDataType, setNewDelDataType] = useState<string>('Ảnh thô Drone (RAW)')
  const [newDelSize, setNewDelSize] = useState<number>(250)
  const [newDelJustification, setNewDelJustification] = useState<string>('')

  const activeLegalHoldProject = useMemo(() => {
    return legalHoldProjects.find((p) => p.is_legal_hold)
  }, [legalHoldProjects])

  const handleToggleLegalHold = (projectId: string) => {
    if (!isSupervisor) {
      alert('Chỉ tài khoản Giám sát / Chủ đầu tư (Supervisor) mới có thẩm quyền bật/tắt Legal Hold (BR-45).')
      return
    }

    setLegalHoldProjects((prev) =>
      prev.map((p) => {
        if (p.project_id === projectId) {
          const nextState = !p.is_legal_hold
          setDeletionRequests((dPrev) =>
            dPrev.map((req) => {
              if (req.project_id === projectId) {
                return { ...req, blocked_by_legal_hold: nextState }
              }
              return req
            })
          )
          return {
            ...p,
            is_legal_hold: nextState,
            hold_since: nextState ? new Date().toLocaleString('vi-VN') : undefined,
            hold_reason: nextState ? 'Thanh tra đột xuất hồ sơ hoàn công và phân xử tranh chấp' : undefined,
            hold_authority: nextState ? 'Thanh tra Bộ GTVT' : undefined,
            hold_reference: nextState ? 'Công văn số 8492/BGTVT-TTr' : undefined
          }
        }
        return p
      })
    )
    triggerNotice('Đã cập nhật trạng thái Phong tỏa pháp lý (Legal Hold) cho dự án!')
  }

  const handleApprovePurge = (requestId: string) => {
    if (!isSupervisor) {
      alert('Chỉ Supervisor mới có quyền phê duyệt xóa dữ liệu lưu trữ hết hạn.')
      return
    }

    const req = deletionRequests.find((r) => r.id === requestId)
    if (!req) return

    if (req.blocked_by_legal_hold) {
      alert('LỖI LEGAL_HOLD_ACTIVE: Dự án đang có lệnh phong tỏa pháp lý thanh tra. Nghiêm cấm xóa dữ liệu!')
      return
    }

    if (!req.is_eligible_5years) {
      alert('LỖI RETENTION_NOT_EXPIRED: Dữ liệu chưa đủ thời hạn 5 năm sau bảo hành theo quy định BR-45.')
      return
    }

    setDeletionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED_PURGED' } : r))
    )
    triggerNotice(`Đã phê duyệt xóa vĩnh viễn dữ liệu yêu cầu ${req.request_code} thành công!`)
  }

  const handleRejectDeletion = (requestId: string) => {
    if (!isSupervisor) return
    const reason = prompt('Nhập lý do từ chối yêu cầu xóa dữ liệu:', 'Chưa đủ căn cứ pháp lý hết hạn')
    if (reason === null) return

    setDeletionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'REJECTED', rejection_reason: reason } : r
      )
    )
    triggerNotice('Đã từ chối yêu cầu xóa dữ liệu.')
  }

  const handleCreateDeletionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const proj = legalHoldProjects.find((p) => p.project_id === newDelProject)

    const isLegalHoldActive = proj?.is_legal_hold || false
    const isEligible5Y = (proj?.years_since_warranty_end || 0) >= 5

    const newReq: DataDeletionRequest = {
      id: `req-${Date.now()}`,
      request_code: `#REQ-DEL-2026-0${deletionRequests.length + 1}`,
      project_id: newDelProject,
      project_name: proj?.project_name || 'Dự án chỉ định',
      requested_by_id: currentUser?.id || 'usr-pm',
      requested_by_name: currentUser?.full_name || 'PM Đỗ Quốc Hoàng',
      requested_at: new Date().toLocaleString('vi-VN'),
      data_type: newDelDataType,
      data_description: `Yêu cầu xóa dữ liệu: ${newDelDataType} dung lượng ${newDelSize} GB`,
      data_size_gb: newDelSize,
      warranty_end_date: proj?.warranty_end_date || 'N/A',
      years_since_warranty: proj?.years_since_warranty_end || 0,
      is_eligible_5years: isEligible5Y,
      status: 'PENDING_APPROVAL',
      blocked_by_legal_hold: isLegalHoldActive,
      justification_notes: newDelJustification || 'Căn cứ thời hạn bảo hành dự án đã đủ thời gian lưu trữ.'
    }

    setDeletionRequests([newReq, ...deletionRequests])
    setShowCreateDeletionRequestModal(false)
    setNewDelJustification('')
    triggerNotice(`Đã gửi yêu cầu xóa dữ liệu ${newReq.request_code} tới Supervisor thẩm duyệt!`)
  }

  return {
    legalHoldProjects,
    setLegalHoldProjects,
    deletionRequests,
    setDeletionRequests,
    showCreateDeletionRequestModal,
    setShowCreateDeletionRequestModal,
    newDelProject,
    setNewDelProject,
    newDelDataType,
    setNewDelDataType,
    newDelSize,
    setNewDelSize,
    newDelJustification,
    setNewDelJustification,
    activeLegalHoldProject,
    handleToggleLegalHold,
    handleApprovePurge,
    handleRejectDeletion,
    handleCreateDeletionSubmit
  }
}
