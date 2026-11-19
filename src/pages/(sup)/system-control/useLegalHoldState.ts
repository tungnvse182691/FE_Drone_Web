import { useState, useMemo, useEffect } from 'react'
import { LegalHoldProject } from '../../../types/domain'
import { retentionService } from '../../../api/services/retentionService'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

export function useLegalHoldState(
  currentUser: { id?: string; full_name?: string } | null,
  isSupervisor: boolean,
  triggerNotice: (msg: string) => void
) {
  const [legalHoldProjects, setLegalHoldProjects] = useState<LegalHoldProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const writeGuard = useSubmitGuard()

  // Modal xem chi tiết dự án & quyết định phong tỏa pháp lý
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<LegalHoldProject | null>(null)
  const [showProjectDetailModal, setShowProjectDetailModal] = useState<boolean>(false)

  // Tải dữ liệu bất đồng bộ từ In-Memory API Service
  const reloadData = async () => {
    try {
      setIsLoading(true)
      setLegalHoldProjects(await retentionService.getRetentionProjects())
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

  // Modal Thiết lập Phong tỏa Pháp lý (Legal Hold - QT14, BR-45)
  const [projectToSetLegalHold, setProjectToSetLegalHold] = useState<LegalHoldProject | null>(null)
  const [showLegalHoldModal, setShowLegalHoldModal] = useState<boolean>(false)

  const handleOpenLegalHoldModal = (project: LegalHoldProject) => {
    if (!isSupervisor) {
      alert('Chỉ tài khoản Giám sát / Chủ đầu tư mới có thẩm quyền bật/tắt Phong tỏa pháp lý.')
      return
    }
    setProjectToSetLegalHold(project)
    setShowLegalHoldModal(true)
  }

  const handleConfirmLegalHold = async (payload: {
    enabled: boolean
    reason?: string
    authority?: string
    reference?: string
  }) => {
    if (!projectToSetLegalHold) return
    if (!writeGuard.acquire()) return

    try {
      await retentionService.setLegalHold(projectToSetLegalHold.project_id, payload)
      await reloadData()
      triggerNotice(
        payload.enabled
          ? `Đã kích hoạt chế độ Phong tỏa pháp lý cho dự án [${projectToSetLegalHold.project_name}] thành công!`
          : `Đã gỡ bỏ lệnh Phong tỏa pháp lý cho dự án [${projectToSetLegalHold.project_name}]!`
      )
    } catch (err: unknown) {
      alert((err as Error).message || 'Có lỗi xảy ra khi cập nhật phong tỏa pháp lý')
    } finally { writeGuard.release() }
  }

  const handleToggleLegalHold = async (projectId: string) => {
    const proj = legalHoldProjects.find((p) => p.project_id === projectId)
    if (proj) {
      handleOpenLegalHoldModal(proj)
    }
  }

  const handleViewProjectDetail = (p: LegalHoldProject) => {
    setSelectedProjectForDetail(p)
    setShowProjectDetailModal(true)
  }

  return {
    legalHoldProjects,
    setLegalHoldProjects,
    isLoading,
    activeLegalHoldProject,
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    showProjectDetailModal,
    setShowProjectDetailModal,
    handleViewProjectDetail,
    projectToSetLegalHold,
    setProjectToSetLegalHold,
    showLegalHoldModal,
    setShowLegalHoldModal,
    handleOpenLegalHoldModal,
    handleConfirmLegalHold,
    handleToggleLegalHold
  }
}
