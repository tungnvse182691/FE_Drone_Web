import { useState, useMemo, useEffect } from 'react'
import { LegalHoldProject, DataDeletionRequest } from '../../../types/domain'
import { retentionService } from '../../../api/services/retentionService'

export function useLegalHoldState(
  currentUser: { id?: string; full_name?: string } | null,
  isSupervisor: boolean,
  triggerNotice: (msg: string) => void
) {
  const [legalHoldProjects, setLegalHoldProjects] = useState<LegalHoldProject[]>([])
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [showCreateDeletionRequestModal, setShowCreateDeletionRequestModal] = useState<boolean>(false)
  const [newDelProject, setNewDelProject] = useState<string>('proj-04')
  const [newDelDataType, setNewDelDataType] = useState<string>('Ảnh thô Drone phân giải cao (RAW)')
  const [newDelSize, setNewDelSize] = useState<number>(250)
  const [newDelJustification, setNewDelJustification] = useState<string>('')

  // Modal xem chi tiết yêu cầu xóa (GET /retention/deletion-requests/{requestId})
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<DataDeletionRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)

  // Modal xem chi tiết dự án & quyết định phong tỏa pháp lý
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<LegalHoldProject | null>(null)
  const [showProjectDetailModal, setShowProjectDetailModal] = useState<boolean>(false)

  // Tải dữ liệu bất đồng bộ từ In-Memory API Service
  const reloadData = async () => {
    try {
      setIsLoading(true)
      const [projs, reqs] = await Promise.all([
        retentionService.getRetentionProjects(),
        retentionService.getDeletionRequests()
      ])
      setLegalHoldProjects(projs)
      setDeletionRequests(reqs)
    } catch {
      triggerNotice('Không thể tải dữ liệu lưu trữ hồ sơ.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    reloadData()
  }, [])

  const activeLegalHoldProject = useMemo(() => {
    return legalHoldProjects.find((p) => p.is_legal_hold)
  }, [legalHoldProjects])

  const handleToggleLegalHold = async (projectId: string) => {
    if (!isSupervisor) {
      alert('Chỉ tài khoản Giám sát / Chủ đầu tư mới có thẩm quyền bật/tắt Phong tỏa pháp lý (Legal Hold).')
      return
    }

    try {
      await retentionService.toggleLegalHold(projectId)
      await reloadData()
      triggerNotice('Đã cập nhật trạng thái Phong tỏa pháp lý cho dự án thành công!')
    } catch (err: unknown) {
      alert((err as Error).message || 'Có lỗi xảy ra khi cập nhật phong tỏa pháp lý')
    }
  }

  const handleApprovePurge = async (requestId: string) => {
    if (!isSupervisor) {
      alert('Chỉ Supervisor mới có quyền phê duyệt xóa dữ liệu lưu trữ.')
      return
    }

    try {
      await retentionService.decideDeletion(requestId, 'APPROVE')
      await reloadData()
      triggerNotice('Đã phê duyệt giải phóng dữ liệu hồ sơ thành công!')
    } catch (err: unknown) {
      alert((err as Error).message || 'Không thể phê duyệt yêu cầu xóa')
    }
  }

  const handleRejectDeletion = async (requestId: string) => {
    if (!isSupervisor) return
    const reason = prompt('Nhập lý do từ chối yêu cầu xóa dữ liệu:', 'Chưa đủ căn cứ pháp lý theo quy định')
    if (reason === null) return

    try {
      await retentionService.decideDeletion(requestId, 'REJECT', reason)
      await reloadData()
      triggerNotice('Đã từ chối yêu cầu xóa dữ liệu.')
    } catch (err: unknown) {
      alert((err as Error).message || 'Không thể từ chối yêu cầu')
    }
  }

  const handleCreateDeletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const proj = legalHoldProjects.find((p) => p.project_id === newDelProject)
    if (proj?.is_legal_hold) {
      alert('HỆ THỐNG TỰ ĐỘNG CHẶN: Dự án đang có lệnh Phong tỏa pháp lý (Legal Hold) phục vụ thanh tra. Nghiêm cấm gửi đề xuất xóa dữ liệu!')
      return
    }

    if (!proj?.is_warranty_expired || (proj?.years_since_warranty_end || 0) < 5) {
      alert('HỆ THỐNG TỰ ĐỘNG CHẶN: Hồ sơ chưa đủ thời hạn 5 năm sau bảo hành theo quy định BR-45!')
      return
    }

    try {
      const created = await retentionService.requestDeletion({
        projectId: newDelProject,
        dataType: newDelDataType,
        sizeGb: newDelSize,
        justification:
          newDelJustification ||
          'Dự án đã kết thúc bảo hành trên 5 năm theo quy định lưu trữ công trình.',
        requestedById: currentUser?.id || 'usr-pm-01',
        requestedByName: currentUser?.full_name || 'Đỗ Quốc Hoàng (Chỉ huy trưởng)'
      })

      await reloadData()
      setShowCreateDeletionRequestModal(false)
      setNewDelJustification('')
      triggerNotice(`Đã gửi yêu cầu ${created.request_code} sang Giám sát thẩm duyệt!`)

      // Mở ngay cửa sổ xem chi tiết yêu cầu vừa tạo để người dùng đối chiếu
      setSelectedDeletionRequest(created)
      setShowDetailModal(true)
    } catch (err: unknown) {
      alert((err as Error).message || 'Có lỗi xảy ra khi gửi yêu cầu')
    }
  }

  const handleViewDetail = (req: DataDeletionRequest) => {
    setSelectedDeletionRequest(req)
    setShowDetailModal(true)
  }

  const handleViewProjectDetail = (p: LegalHoldProject) => {
    setSelectedProjectForDetail(p)
    setShowProjectDetailModal(true)
  }

  const handleOpenCreateDeletionForProject = (projectId: string) => {
    setNewDelProject(projectId)
    setShowCreateDeletionRequestModal(true)
  }

  return {
    legalHoldProjects,
    setLegalHoldProjects,
    deletionRequests,
    setDeletionRequests,
    isLoading,
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
    selectedDeletionRequest,
    setSelectedDeletionRequest,
    showDetailModal,
    setShowDetailModal,
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    showProjectDetailModal,
    setShowProjectDetailModal,
    handleViewDetail,
    handleViewProjectDetail,
    handleOpenCreateDeletionForProject,
    handleToggleLegalHold,
    handleApprovePurge,
    handleRejectDeletion,
    handleCreateDeletionSubmit
  }
}
