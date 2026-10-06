import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { RepairTrackType, ItemReviewStatus, CaseItem } from './evidence-closeout/types'
import { INITIAL_CASE_ITEMS } from './evidence-closeout/mockData'
import { CloseoutHeader } from './evidence-closeout/CloseoutHeader'
import { ComparisonViewer } from './evidence-closeout/ComparisonViewer'
import { TechnicalCriteriaCard } from './evidence-closeout/TechnicalCriteriaCard'
import { CloseoutModals } from './evidence-closeout/CloseoutModals'

export type { RepairTrackType, ItemReviewStatus, CaseItem }

export const EvidenceCloseoutDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Chế độ xem vai trò (mặc định theo role đăng nhập, hỗ trợ Switcher như Stitch 11)
  const [activeRoleView, setActiveRoleView] = useState<'SUPERVISOR' | 'PROJECT_MANAGER'>(
    user?.role === RoleCode.SUPERVISOR ? 'SUPERVISOR' : 'PROJECT_MANAGER'
  )

  const isSupervisorView = activeRoleView === 'SUPERVISOR'
  const isPMView = activeRoleView === 'PROJECT_MANAGER'
  const basePath = isSupervisorView ? '/sup' : '/pm'

  // Items State
  const [caseItems, setCaseItems] = useState<CaseItem[]>(INITIAL_CASE_ITEMS)
  const [selectedItemId, setSelectedItemId] = useState<string>('item-01')

  const currentItem = useMemo(() => {
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
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false)
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

  const allItemsAccepted = acceptedCount === caseItems.length

  // Handlers
  const handleSubmitRework = () => {
    if (reworkChecklist.other_defect && !otherDefectText.trim()) return

    const selectedIssues: string[] = []
    if (reworkChecklist.bond_coat) selectedIssues.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám')
    if (reworkChecklist.flatness_3m) selectedIssues.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip) selectedIssues.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm')
    if (reworkChecklist.compaction_k98) selectedIssues.push('Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định')
    if (reworkChecklist.other_defect && otherDefectText.trim()) selectedIssues.push(otherDefectText.trim())

    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'REWORK_REQUIRED',
            status_label: 'YÊU CẦU SỬA LẠI (LẦN ' + (it.attempt_number + 1) + ')',
            attempt_number: it.attempt_number + 1,
            rework_reason: reworkNotes,
            rework_directives: selectedIssues
          }
        }
        return it
      })
    )

    setIsReworkModalOpen(false)
    showToast(
      `Đã phát lệnh yêu cầu tái thi công (REWORK) thành công cho hạng mục ${currentItem.item_code}! Hồ sơ đã chuyển về PM và Đội thi công.`
    )
  }

  const handleAcceptItem = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'ACCEPTED',
            status_label: 'ĐÃ NGHIỆM THU ĐẠT'
          }
        }
        return it
      })
    )
    showToast(`Supervisor đã chấp thuận nghiệm thu thành công hạng mục ${currentItem.item_code} (Xác thực toàn vẹn SHA-256)!`)
  }

  const handlePMCloseFastTrack = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return {
            ...it,
            status: 'ACCEPTED',
            status_label: 'ĐÃ ĐÓNG (FAST-TRACK RESOLVED)'
          }
        }
        return it
      })
    )
    showToast(`PM đã chấp thuận và đóng lỗi Fast Track ${currentItem.item_code}! Lỗi chuyển trạng thái RESOLVED, thông báo đã gửi Giám sát.`)
  }

  const handlePMSubmitToSupervisor = () => {
    showToast(`PM đã xác nhận đủ điều kiện và trình hồ sơ ${currentItem.item_code} lên Ban Giám sát nghiệm thu!`)
  }

  const handleConfirmPublish = () => {
    setCaseItems((prev) =>
      prev.map((it) => {
        if (it.id === currentItem.id) {
          return { ...it, citizen_published: true }
        }
        return it
      })
    )
    setIsPublishModalOpen(false)
    setIsPublishedSuccess(true)
    showToast(`Đã công bố thành công kết quả khắc phục lên Citizen App & Cổng thông tin giao thông!`)
  }

  const handleConfirmCloseCase = () => {
    if (!allItemsAccepted) {
      showToast('Lỗi CASE_HAS_OPEN_REQUIRED_ITEMS: Không thể đóng tổng vụ việc khi còn hạng mục dở dang!')
      return
    }
    setIsCloseCaseModalOpen(false)
    setIsCaseClosed(true)
    showToast(`Đã đóng tổng thể vụ việc #CASE-2026-0842 thành công! Toàn bộ hồ sơ đã được khóa cứng và lưu trữ bảo hành.`)
  }

  const handleTriggerExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setIsExportModalOpen(false)
      showToast(
        exportFormat === 'PDF_A'
          ? `Đã tạo tệp PDF/A thành công: Bien_Ban_Nghiem_Thu_${currentItem.defect_code}_TCVN8819.pdf!`
          : `Đã đóng gói tệp nén ZIP: Dossier_${currentItem.defect_code}_SHA256_Verified.zip (Kèm file checksum.sha256)!`
      )
    }, 1200)
  }

  return (
    <div className="space-y-6 pb-20 text-[#1F2937]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-brand-gold shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
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
        activeRoleView={activeRoleView}
        setActiveRoleView={setActiveRoleView}
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
          setCaseItems((prev) =>
            prev.map((it) =>
              it.id === currentItem.id ? { ...it, citizen_published: !it.citizen_published } : it
            )
          )
        }}
      />

      {/* Technical Criteria Checklist (TCVN 8819) */}
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
