import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { RepairTrackType, ItemReviewStatus, CaseItem } from './evidence-closeout/types'
import { CloseoutHeader } from './evidence-closeout/CloseoutHeader'
import { ComparisonViewer } from './evidence-closeout/ComparisonViewer'
import { TechnicalCriteriaCard } from './evidence-closeout/TechnicalCriteriaCard'
import { CloseoutModals } from './evidence-closeout/CloseoutModals'
import { acceptanceService } from '../../api/services/acceptanceService'

export type { RepairTrackType, ItemReviewStatus, CaseItem }

export const EvidenceCloseoutDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Thẩm quyền xác thực trực tiếp từ phiên đăng nhập (KHÔNG dùng widget switcher đổi role giả lập)
  const isSupervisorView = user?.role === RoleCode.SUPERVISOR
  const isPMView = user?.role === RoleCode.PROJECT_MANAGER
  const basePath = isSupervisorView ? '/sup' : '/pm'

  // Items State được đồng bộ từ Async Mock API Service (Zero localStorage)
  const [caseItems, setCaseItems] = useState<CaseItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedItemId, setSelectedItemId] = useState<string>('item-01')

  // Load dữ liệu từ Mock API
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [items, statusInfo] = await Promise.all([
          acceptanceService.getCloseoutItems(),
          acceptanceService.getCaseCloseoutStatus()
        ])
        if (isMounted) {
          setCaseItems(items)
          setIsCaseClosed(statusInfo.isCaseClosed)
          if (id && items.some((it) => it.id === id || it.defect_code === id)) {
            setSelectedItemId(id)
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu nghiệm thu từ Mock API:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [id])

  const currentItem = useMemo(() => {
    if (!caseItems.length) return null
    return caseItems.find((it) => it.id === selectedItemId) || caseItems[0]
  }, [caseItems, selectedItemId])

  // View mode comparison: Side-by-side vs Slider vs Metadata
  const [viewMode, setViewMode] = useState<'side' | 'slider' | 'meta'>('side')
  const [sliderPosition, setSliderPosition] = useState<number>(50)

  // Modals state
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isCloseCaseModalOpen, setIsCloseCaseModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [publishHeadline, setPublishHeadline] = useState('Thông báo: Hoàn thành bảo trì mặt đường Quốc Lộ 1A - Đoạn Km 28+400')

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

    const selectedIssues: string[] = []
    if (reworkChecklist.bond_coat) selectedIssues.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám')
    if (reworkChecklist.flatness_3m) selectedIssues.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip) selectedIssues.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm')
    if (reworkChecklist.compaction_k98) selectedIssues.push('Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định')
    if (reworkChecklist.other_defect && otherDefectText.trim()) selectedIssues.push(otherDefectText.trim())

    try {
      const updated = await acceptanceService.reworkCloseoutItem(currentItem.id, {
        notes: reworkNotes,
        directives: selectedIssues
      })
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      setIsReworkModalOpen(false)
      showToast(`Đã phát lệnh yêu cầu sửa lại (REWORK) cho hạng mục ${currentItem.item_code}!`)
    } catch (err) {
      showToast('Có lỗi xảy ra khi phát lệnh sửa lại.')
    }
  }

  const handleAcceptItem = async () => {
    if (!currentItem) return
    try {
      const updated = await acceptanceService.acceptCloseoutItem(currentItem.id)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      showToast(`Giám sát đã chấp thuận nghiệm thu thành công hạng mục ${currentItem.item_code} (Ký số SHA-256)!`)
    } catch (err) {
      showToast('Có lỗi xảy ra khi ký số nghiệm thu.')
    }
  }

  const handlePMCloseFastTrack = async () => {
    if (!currentItem) return
    try {
      const updated = await acceptanceService.closeFastTrackItem(currentItem.id)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      showToast(`PM đã chấp thuận và đóng lỗi Fast Track ${currentItem.item_code} (BR-25)!`)
    } catch (err) {
      showToast('Có lỗi khi đóng lỗi Fast Track.')
    }
  }

  const handlePMSubmitToSupervisor = async () => {
    if (!currentItem) return
    try {
      await acceptanceService.submitItemToSupervisor(currentItem.id)
      showToast(`PM đã trình hồ sơ ${currentItem.item_code} lên Giám sát nghiệm thu!`)
    } catch (err) {
      showToast('Có lỗi khi trình hồ sơ.')
    }
  }

  const handleConfirmPublish = async () => {
    if (!currentItem) return
    try {
      const updated = await acceptanceService.publishCitizenResult(currentItem.id, true)
      setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      setIsPublishModalOpen(false)
      showToast(`Đã công bố thành công kết quả khắc phục lên Citizen App!`)
    } catch (err) {
      showToast('Có lỗi khi công bố kết quả.')
    }
  }

  const handleConfirmCloseCase = async () => {
    if (!allItemsAccepted) {
      showToast('Chưa thể đóng vụ việc khi còn hạng mục chưa nghiệm thu đạt!')
      return
    }
    try {
      await acceptanceService.closeCompositeCase('#CASE-2026-0842')
      setIsCloseCaseModalOpen(false)
      setIsCaseClosed(true)
      showToast(`Đã đóng tổng thể vụ việc #CASE-2026-0842 thành công! Hồ sơ đã lưu trữ bảo hành.`)
    } catch (err: any) {
      showToast(err.message || 'Có lỗi khi đóng vụ việc.')
    }
  }

  const handleTriggerExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setIsExportModalOpen(false)
      showToast(
        exportFormat === 'PDF_A'
          ? `Đã tạo tệp PDF/A: Bien_Ban_Nghiem_Thu_${currentItem?.defect_code}_TCVN8819.pdf!`
          : `Đã đóng gói tệp nén: Dossier_${currentItem?.defect_code}_SHA256_Verified.zip!`
      )
    }, 1000)
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
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenCloseCaseModal={() => setIsCloseCaseModalOpen(true)}
        onNavigateHome={() => navigate(`${basePath}/dashboard`)}
        onNavigateProposals={() => navigate(`${basePath}/proposals`)}
      />

      {/* Before / After Inspection Viewer */}
      <ComparisonViewer
        currentItem={currentItem}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sliderPosition={sliderPosition}
        setSliderPosition={setSliderPosition}
        isPMView={isPMView}
        onToggleCitizenPublish={() => {
          acceptanceService.publishCitizenResult(currentItem.id, !currentItem.citizen_published).then((updated) => {
            setCaseItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
          })
        }}
      />

      {/* Technical Criteria Checklist (TCVN 8819:2011) */}
      <TechnicalCriteriaCard
        currentItem={currentItem}
        isSupervisorView={isSupervisorView}
        onAcceptItem={handleAcceptItem}
      />

      {/* Modals */}
      <CloseoutModals
        currentItem={currentItem}
        caseItems={caseItems}
        acceptedCount={acceptedCount}
        publishHeadline={publishHeadline}
        setPublishHeadline={setPublishHeadline}
        isReworkModalOpen={isReworkModalOpen}
        setIsReworkModalOpen={setIsReworkModalOpen}
        reworkChecklist={reworkChecklist}
        setReworkChecklist={setReworkChecklist}
        otherDefectText={otherDefectText}
        setOtherDefectText={setOtherDefectText}
        reworkNotes={reworkNotes}
        setReworkNotes={setReworkNotes}
        handleSubmitRework={handleSubmitRework}
        isPublishModalOpen={isPublishModalOpen}
        setIsPublishModalOpen={setIsPublishModalOpen}
        onConfirmPublish={handleConfirmPublish}
        isCloseCaseModalOpen={isCloseCaseModalOpen}
        setIsCloseCaseModalOpen={setIsCloseCaseModalOpen}
        onConfirmCloseCase={handleConfirmCloseCase}
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
      />
    </div>
  )
}
export default EvidenceCloseoutDetail
