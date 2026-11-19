import { projectExportService, exportError } from '../../api/services/projectExportService'
import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { RepairTrackType, ItemReviewStatus, CaseItem } from './evidence-closeout/types'
import { CloseoutHeader } from './evidence-closeout/CloseoutHeader'
import { ComparisonViewer } from './evidence-closeout/ComparisonViewer'
import { TechnicalCriteriaCard } from './evidence-closeout/TechnicalCriteriaCard'
import { CloseoutModals } from './evidence-closeout/CloseoutModals'
import { DefectClosurePanel } from './evidence-closeout/DefectClosurePanel'
import { acceptanceService, AcceptancePackage } from '../../api/services/acceptanceService'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

export type { RepairTrackType, ItemReviewStatus, CaseItem }

const beErrorText = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { detail?: string; title?: string; code?: string } }; message?: string }
  const status = e?.response?.status
  const detail = e?.response?.data?.detail || e?.response?.data?.title || e?.response?.data?.code || e?.message || 'Lỗi không xác định'
  return status ? `HTTP ${status}: ${detail}` : detail
}

export const EvidenceCloseoutDetail: React.FC = () => {
  const { id, batchId } = useParams<{ id?: string; batchId?: string }>()
  const navigate = useNavigate()
  const { user, authEpoch } = useAuthStore()

  // Thẩm quyền xác thực trực tiếp từ phiên đăng nhập (KHÔNG dùng widget switcher đổi role giả lập)
  const isSupervisorView = user?.role === RoleCode.SUPERVISOR
  const isPMView = user?.role === RoleCode.PROJECT_MANAGER
  const basePath = isSupervisorView ? '/sup' : '/pm'

  // Package & Items State được đồng bộ từ Async Mock API Service (Zero localStorage)
  const [currentPackage, setCurrentPackage] = useState<AcceptancePackage | null>(null)
  const [caseItems, setCaseItems] = useState<CaseItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const writeGuard = useSubmitGuard()
  const [selectedItemId, setSelectedItemId] = useState<string>('')

  // Load dữ liệu từ Mock API
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const targetPkgId = batchId || id || ''
        const [pkg, items, statusInfo] = await Promise.all([
          acceptanceService.getAcceptancePackageById(targetPkgId),
          acceptanceService.getCloseoutItems(targetPkgId),
          acceptanceService.getCaseCloseoutStatus(targetPkgId)
        ])
        if (isMounted) {
          setCurrentPackage(pkg)
          setCaseItems(items)
          setIsCaseClosed(statusInfo.isCaseClosed)
          if (items.length > 0) {
            setSelectedItemId(items[0].id)
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu nghiệm thu:', err)
        if (isMounted) setLoadError(beErrorText(err))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [id, batchId])

  const currentItem = useMemo(() => {
    if (!caseItems.length) return null
    return caseItems.find((it) => it.id === selectedItemId) || caseItems[0]
  }, [caseItems, selectedItemId])

  // View mode comparison: Side-by-side vs Slider
  const [viewMode, setViewMode] = useState<'side' | 'slider'>('side')
  const [sliderPosition, setSliderPosition] = useState<number>(50)

  // Modals state
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false)

  // Rework Form State
  const [reworkNotes, setReworkNotes] = useState(
    'Mép nối thảm nhựa có hiện tượng bong bật rỗ tổ ong cục bộ, độ dính bám chưa đảm bảo. Yêu cầu cào bóc lại 3m dài và tưới dính bám nhũ tương CRS-1 trước khi thảm hoàn thiện lớp BTN C12.5.'
  )
  const [reworkChecklist, setReworkChecklist] = useState({
    bond_coat: true,
    flatness_3m: true,
    temperature_slip: false,
    compaction_k98: false,
    other_defect: false
  })
  const [otherDefectText, setOtherDefectText] = useState('')

  // Export Form State
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [includeSha256Checksum, setIncludeSha256Checksum] = useState(true)
  const [includeDroneRawTiff, setIncludeDroneRawTiff] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Status Success feedback
  const [isCaseClosed, setIsCaseClosed] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Composite Case Status Calculation
  const acceptedCount = useMemo(() => {
    return caseItems.filter((i) => i.status === 'ACCEPTED').length
  }, [caseItems])

  const allItemsAccepted = caseItems.length > 0 && acceptedCount === caseItems.length

  // Handlers gọi bất đồng bộ qua Mock API Service
  const handleSubmitRework = async () => {
    if (!currentItem) return
    if (reworkChecklist.other_defect && !otherDefectText.trim()) return
    if (!writeGuard.acquire()) return

    const selectedIssues: string[] = []
    if (reworkChecklist.bond_coat) selectedIssues.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám')
    if (reworkChecklist.flatness_3m) selectedIssues.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip) selectedIssues.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm')
    if (reworkChecklist.compaction_k98) selectedIssues.push('Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định')
    if (reworkChecklist.other_defect && otherDefectText.trim()) selectedIssues.push(otherDefectText.trim())

    try {
      const combinedReason = (
        selectedIssues.length > 0
          ? `${selectedIssues.join('; ')}${reworkNotes ? `. Ghi chú: ${reworkNotes}` : ''}`
          : reworkNotes.trim() || 'Chưa đạt tiêu chuẩn kỹ thuật thi công TCVN 8819:2011'
      ).slice(0, 2000)

      const updated = await acceptanceService.reworkCloseoutItem(currentItem.id, {
        decision: 'SUPPLEMENT',
        reason: combinedReason,
        notes: reworkNotes,
        directives: selectedIssues
      })
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      if (currentPackage) {
        const refreshedPkg = await acceptanceService.getAcceptancePackageById(currentPackage.id)
        if (refreshedPkg) setCurrentPackage(refreshedPkg)
      }
      setIsReworkModalOpen(false)
      showToast(`Đã phát lệnh yêu cầu sửa lại cho hạng mục ${currentItem.item_code}!`)
    } catch (err) {
      showToast('Không gửi được yêu cầu sửa lại: ' + beErrorText(err))
    } finally { writeGuard.release() }
  }

  const handleAcceptItem = async () => {
    if (!currentItem) return
    if (!writeGuard.acquire()) return
    try {
      const updated = await acceptanceService.acceptCloseoutItem(currentItem.id)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      if (currentPackage) {
        const refreshedPkg = await acceptanceService.getAcceptancePackageById(currentPackage.id)
        if (refreshedPkg) setCurrentPackage(refreshedPkg)
      }
      showToast(`Giám sát đã chấp thuận nghiệm thu đạt hạng mục ${currentItem.item_code}!`)
    } catch (err) {
      showToast('Không xác nhận được nghiệm thu: ' + beErrorText(err))
    } finally { writeGuard.release() }
  }

  const handlePMCloseFastTrack = async () => {
    if (!currentItem) return
    if (!writeGuard.acquire()) return
    try {
      const updated = await acceptanceService.closeFastTrackItem(currentItem.id)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      if (currentPackage) {
        const refreshedPkg = await acceptanceService.getAcceptancePackageById(currentPackage.id)
        if (refreshedPkg) setCurrentPackage(refreshedPkg)
      }
      showToast(`PM đã chấp thuận và đóng lỗi xử lý nhanh ${currentItem.item_code} (BR-25)!`)
    } catch (err) {
      showToast('Có lỗi khi đóng lỗi xử lý nhanh.')
    } finally { writeGuard.release() }
  }

  const handlePMSubmitToSupervisor = () => {
    setIsDeclareModalOpen(true)
  }

  const handleConfirmDeclaration = async (evidenceIds: string[], notes: string) => {
    if (!currentItem) return
    if (!writeGuard.acquire()) return
    try {
      const updated = await acceptanceService.submitItemToSupervisor(currentItem.id)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      if (currentPackage) {
        const refreshedPkg = await acceptanceService.getAcceptancePackageById(currentPackage.id)
        if (refreshedPkg) setCurrentPackage(refreshedPkg)
      }
      showToast(
        `PM đã gửi Khai Báo Hoàn Thành Thi Công (API-110) cho ${currentItem.item_code} kèm ${evidenceIds.length} bằng chứng! Gói đã chuyển sang Chờ Giám Sát Nghiệm Thu.`
      )
    } catch (err) {
      showToast('Có lỗi khi gửi khai báo hoàn thành thi công.')
    } finally { writeGuard.release() }
  }

  // Xuất hồ sơ nghiệm thu theo hạng mục: POST /projects/{p}/exports {kind:DOSSIER, repairItemIds:[item]} → poll SUCCEEDED → tải nội dung (BE bản mới).
  const handleTriggerExport = async () => {
    const projectId = currentPackage?.project_id
    if (!currentItem || !projectId) { showToast('Chưa xác định hạng mục/dự án để xuất hồ sơ.'); return }
    if (!writeGuard.acquire()) return
    setIsExporting(true)
    try {
      const format = exportFormat === 'PDF_A' ? 'PDF' : 'ZIP'
      const created = await projectExportService.create(projectId, { kind: 'DOSSIER', format, includeOriginalFiles: format === 'ZIP' && includeDroneRawTiff, repairItemIds: [currentItem.id] })
      let job = created
      for (let i = 0; i < 60 && !['SUCCEEDED', 'FAILED'].includes(job.status); i++) { await new Promise((r) => setTimeout(r, 2000)); job = await projectExportService.detail(projectId, created.id) }
      if (job.status === 'FAILED') throw new Error(`Máy chủ không tạo được hồ sơ xuất (${job.errorCode || 'FAILED'}).`)
      if (job.status !== 'SUCCEEDED') throw new Error('Hồ sơ xuất chưa hoàn tất sau 120 giây; xem lại ở mục "Hồ sơ xuất" của Phân tích rủi ro.')
      const file = await projectExportService.content(projectId, created.id)
      const url = URL.createObjectURL(file.blob)
      const a = document.createElement('a'); a.href = url; a.download = file.fileName; document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setIsExportModalOpen(false)
      showToast(`Đã tạo và tải hồ sơ nghiệm thu (${format})${job.completeness === 'PARTIAL' ? ' — chưa đầy đủ: ' + (job.missingSections || []).join(', ') : ''}.`)
    } catch (err: any) {
      showToast(exportError(err))
    } finally { setIsExporting(false); writeGuard.release() }
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg max-w-xl">
          Không tải được hồ sơ nghiệm thu: {loadError}
        </div>
      </div>
    )
  }
  if (!isLoading && !currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs text-slate-500">
        Không có hạng mục nghiệm thu trong CSDL cho gói này.
      </div>
    )
  }
  if (!isLoading && !currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="rg-empty" role="status">Không có hồ sơ nghiệm thu để hiển thị. Chọn một hạng mục từ danh sách nghiệm thu hoặc kiểm tra quyền truy cập dự án.</p>
      </div>
    )
  }
  if (isLoading || !currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <span className="w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-medium">Đang tải hồ sơ nghiệm thu...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-16 text-[#1A1D20]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#C9A227]">check_circle</span>
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header, Identity & Case Selector */}
      <CloseoutHeader
        currentPackage={currentPackage}
        currentItem={currentItem}
        caseItems={caseItems}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        isSupervisorView={isSupervisorView}
        isPMView={isPMView}
        basePath={basePath}
        isCaseClosed={isCaseClosed}
        allItemsAccepted={allItemsAccepted}
        acceptedCount={acceptedCount}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenReworkModal={() => setIsReworkModalOpen(true)}
        onAcceptItem={handleAcceptItem}
        onPMCloseFastTrack={handlePMCloseFastTrack}
        onPMSubmitToSupervisor={handlePMSubmitToSupervisor}
        onNavigateHome={() => navigate(`${basePath}/dashboard`)}
        onNavigateProposals={() => navigate(`${basePath}/acceptance`)}
      />

      {/* Before / After Inspection Viewer */}
      <ComparisonViewer
        currentItem={currentItem}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sliderPosition={sliderPosition}
        setSliderPosition={setSliderPosition}
        isPMView={isPMView}
      />

      {/* Technical Criteria Checklist (TCVN 8819:2011) */}
      <TechnicalCriteriaCard
        currentItem={currentItem}
        isSupervisorView={isSupervisorView}
        onAcceptItem={handleAcceptItem}
      />

      {isSupervisorView && !loadError && currentPackage?.project_id && currentItem.package_id === currentPackage.id && (
        <DefectClosurePanel
          key={`${authEpoch}:${currentPackage.project_id}:${currentPackage.id}:${currentItem.id}:${currentItem.status}`}
          projectId={currentPackage.project_id}
          packageId={currentPackage.id}
          itemId={currentItem.id}
        />
      )}
      {/* Modals */}
      <CloseoutModals
        currentItem={currentItem}
        caseItems={caseItems}
        isReworkModalOpen={isReworkModalOpen}
        setIsReworkModalOpen={setIsReworkModalOpen}
        reworkChecklist={reworkChecklist}
        setReworkChecklist={setReworkChecklist}
        otherDefectText={otherDefectText}
        setOtherDefectText={setOtherDefectText}
        reworkNotes={reworkNotes}
        setReworkNotes={setReworkNotes}
        handleSubmitRework={handleSubmitRework}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        includeSha256Checksum={includeSha256Checksum}
        setIncludeSha256Checksum={setIncludeSha256Checksum}
        includeDroneRawTiff={includeDroneRawTiff}
        setIncludeDroneRawTiff={setIncludeDroneRawTiff}
        isExporting={isExporting}
        handleTriggerExport={handleTriggerExport}
        currentPackage={currentPackage}
        isDeclareModalOpen={isDeclareModalOpen}
        setIsDeclareModalOpen={setIsDeclareModalOpen}
        onConfirmDeclaration={handleConfirmDeclaration}
      />
    </div>
  )
}
export default EvidenceCloseoutDetail
