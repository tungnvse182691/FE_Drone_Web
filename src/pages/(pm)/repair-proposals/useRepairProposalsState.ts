import { useState, useMemo, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { repairService } from '../../../api/services'
import { AVAILABLE_ROUTES, DEFECTS_BY_SEGMENT } from './mockData'
import type { ProposalWorkPackage, UnassignedDefectItem } from './types'

export function useRepairProposalsState() {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = !isSupervisor
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [packages, setPackages] = useState<ProposalWorkPackage[]>(() => repairService.getPackages())

  useEffect(() => {
    const handleStateChange = () => {
      setPackages(repairService.getPackages())
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'>('ALL')
  const [isPDFPreviewModalOpen, setIsPDFPreviewModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  const [advRoute, setAdvRoute] = useState<string>('ALL')
  const [advScale, setAdvScale] = useState<string>('ALL')
  const [advContractor, setAdvContractor] = useState<string>('ALL')

  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<ProposalWorkPackage | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // MODAL TẠO GÓI ĐỀ XUẤT MỚI STATE
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formRouteId, setFormRouteId] = useState('QL1A_PK04')
  const [formSegmentId, setFormSegmentId] = useState('seg-02')
  const [formPackageName, setFormPackageName] = useState('Khắc phục hằn lún bánh xe & trám nứt Km 1028 - Km 1033')
  const [formContractor, setFormContractor] = useState('Đội thi công sửa chữa Hoàng Hải 01')
  const [formDurationDays, setFormDurationDays] = useState(3)
  const [formTechnicalMethod, setFormTechnicalMethod] = useState('')

  const currentRoute = useMemo(() => {
    return AVAILABLE_ROUTES.find((r) => r.id === formRouteId) || AVAILABLE_ROUTES[0]
  }, [formRouteId])

  const currentRouteSegments = useMemo(() => {
    return currentRoute.segments
  }, [currentRoute])

  const currentSegment = useMemo(() => {
    return (
      currentRouteSegments.find((s) => s.id === formSegmentId) ||
      currentRouteSegments[0]
    )
  }, [currentRouteSegments, formSegmentId])

  const [unassignedDefects, setUnassignedDefects] = useState<UnassignedDefectItem[]>(
    DEFECTS_BY_SEGMENT['seg-02'] || []
  )

  const handleRouteChange = (newRouteId: string) => {
    setFormRouteId(newRouteId)
    const targetRoute = AVAILABLE_ROUTES.find((r) => r.id === newRouteId) || AVAILABLE_ROUTES[0]
    const defaultSeg = targetRoute.segments[0]
    setFormSegmentId(defaultSeg.id)
    setUnassignedDefects(DEFECTS_BY_SEGMENT[defaultSeg.id] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${defaultSeg.chainage_display}`)
  }

  const handleSegmentChange = (newSegmentId: string) => {
    setFormSegmentId(newSegmentId)
    const targetSeg = currentRouteSegments.find((s) => s.id === newSegmentId) || currentRouteSegments[0]
    setUnassignedDefects(DEFECTS_BY_SEGMENT[newSegmentId] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${targetSeg.chainage_display}`)
  }

  const modalCalculations = useMemo(() => {
    const selected = unassignedDefects.filter((d) => d.selected)
    const count = selected.length
    const totalArea = selected.reduce((sum, item) => sum + item.area_m2, 0).toFixed(2)
    const totalLength = count * 15
    return {
      count,
      totalArea,
      totalLength,
      description: count > 0 ? `${totalArea} m² cào bóc / ${totalLength}m trám` : 'Chưa chọn khiếm khuyết'
    }
  }, [unassignedDefects])

  const handleToggleDefect = (id: string) => {
    setUnassignedDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    )
  }

  const handleSaveDraft = (submitDirectly: boolean = false) => {
    if (modalCalculations.count === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết để khởi tạo gói đề xuất!')
      return
    }

    const newPackage: ProposalWorkPackage = {
      id: `pkg-${Date.now()}`,
      code: `PKG-2026-${Math.floor(10 + Math.random() * 90)}`,
      title: formPackageName,
      route_id: currentRoute.id,
      route_name: currentRoute.name,
      chainage_start: currentSegment.chainage_start || '',
      chainage_end: currentSegment.chainage_end || '',
      chainage_display: currentSegment.chainage_display || '',
      segments_count: 1,
      defect_count: modalCalculations.count,
      defect_summary: `${modalCalculations.count} điểm hư hỏng gom mới (${currentSegment.code})`,
      technical_scope: `Cào bóc thảm: ${modalCalculations.totalArea} m²`,
      material_scope: 'Vật tư theo phương án kỹ thuật',
      technical_method: formTechnicalMethod.trim() || 'Cào bóc vá dặm xử lý theo quy trình bảo trì mặt đường',
      duration_days: formDurationDays,
      date_range: `Dự kiến ${formDurationDays} ngày`,
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: 'Vừa tạo - Hôm nay',
      status: submitDirectly ? 'SUBMITTED' : 'DRAFT',
      status_label: submitDirectly ? 'Chờ duyệt' : 'Bản nháp',
      approved_items: 0,
      total_items: modalCalculations.count,
      contractor_name: formContractor
    }

    repairService.createPackage(newPackage)
    setPackages(repairService.getPackages())
    setIsCreateModalOpen(false)
    setCurrentPage(1)
    showToast(
      submitDirectly
        ? `Đã tạo và gửi trình duyệt Gói đề xuất [${newPackage.code}] sang Giám sát trưởng!`
        : `Đã lưu bản nháp Gói đề xuất [${newPackage.code}] thành công!`
    )
  }

  const handleSubmitDraftPackage = (id: string, code: string) => {
    repairService.submitPackage(id)
    setPackages(repairService.getPackages())
    showToast(`Đã khóa hồ sơ và gửi gói [${code}] lên Giám sát trưởng phê duyệt!`)
  }

  const handleDeleteDraft = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản nháp [${code}]?`)) {
      setPackages((prev) => prev.filter((p) => p.id !== id))
      showToast(`Đã xóa bản nháp [${code}].`)
    }
  }

  const handleQuickApprove = (id: string, code: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'DECIDED',
              status_label: 'Đã phê duyệt',
              approved_items: p.total_items
            }
          : p
      )
    )
    showToast(`[GIÁM SÁT]: Đã phê duyệt chính thức gói [${code}] và ban hành lệnh công tác!`)
  }

  const stats = useMemo(() => {
    const draft = packages.filter((p) => p.status === 'DRAFT').length
    const submitted = packages.filter((p) => p.status === 'SUBMITTED').length
    const decided = packages.filter((p) => p.status === 'DECIDED').length
    const dispatched = packages.filter((p) => p.status === 'DISPATCHED').length
    return { draft, submitted, decided, dispatched, total: packages.length }
  }, [packages])

  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      if (activeFilterTab !== 'ALL' && p.status !== activeFilterTab) return false
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchCode = p.code.toLowerCase().includes(term)
        const matchTitle = p.title.toLowerCase().includes(term)
        const matchChainage = p.chainage_display.toLowerCase().includes(term)
        const matchContractor = p.contractor_name.toLowerCase().includes(term)
        if (!matchCode && !matchTitle && !matchChainage && !matchContractor) return false
      }
      if (advRoute !== 'ALL' && p.route_id !== advRoute) return false
      if (advScale === 'LARGE' && p.defect_count < 10) return false
      if (advScale === 'MEDIUM' && (p.defect_count < 5 || p.defect_count >= 10)) return false
      if (advScale === 'SMALL' && p.defect_count >= 5) return false
      if (advContractor !== 'ALL' && !p.contractor_name.includes(advContractor)) return false

      return true
    })
  }, [packages, activeFilterTab, searchTerm, advRoute, advScale, advContractor])

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize))
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPackages.slice(start, start + pageSize)
  }, [filteredPackages, currentPage, pageSize])

  const handleTabChange = (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => {
    setActiveFilterTab(tab)
    setCurrentPage(1)
  }

  return {
    isSupervisor,
    isPM,
    basePath,
    packages,
    searchTerm,
    setSearchTerm,
    activeFilterTab,
    handleTabChange,
    isPDFPreviewModalOpen,
    setIsPDFPreviewModalOpen,
    toastMessage,
    setToastMessage,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    advRoute,
    setAdvRoute,
    advScale,
    setAdvScale,
    advContractor,
    setAdvContractor,
    selectedPackageForDetail,
    setSelectedPackageForDetail,
    showToast,
    isCreateModalOpen,
    setIsCreateModalOpen,
    formRouteId,
    formSegmentId,
    formPackageName,
    setFormPackageName,
    formContractor,
    setFormContractor,
    formDurationDays,
    setFormDurationDays,
    formTechnicalMethod,
    setFormTechnicalMethod,
    currentRoute,
    currentRouteSegments,
    currentSegment,
    unassignedDefects,
    handleRouteChange,
    handleSegmentChange,
    modalCalculations,
    handleToggleDefect,
    handleSaveDraft,
    handleSubmitDraftPackage,
    handleDeleteDraft,
    handleQuickApprove,
    stats,
    filteredPackages,
    paginatedPackages,
  }
}
