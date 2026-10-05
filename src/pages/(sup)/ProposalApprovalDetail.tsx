import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { repairService } from '../../api/services'
import { mockRepairBatches } from '../../data/mockData'
import { ItemApprovalStatus, RepairItemDetail } from './proposal-approval/types'
import { ApprovalDetailHeader } from './proposal-approval/ApprovalDetailHeader'
import { ApprovalStatsBar } from './proposal-approval/ApprovalStatsBar'
import { ApprovalItemsTable } from './proposal-approval/ApprovalItemsTable'
import { ApprovalModals } from './proposal-approval/ApprovalModals'

export type { ItemApprovalStatus, RepairItemDetail }

export const ProposalApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Role detection
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const matchedBatch = useMemo(() => {
    if (!id) return null
    return mockRepairBatches.find(
      (b) => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase() === id.toLowerCase()
    )
  }, [id])

  // Package Data State
  const [packageCode] = useState(
    matchedBatch?.code || (id?.toUpperCase().startsWith('PKG-') ? id.toUpperCase() : `PKG-2026-${id?.toUpperCase() || '05'}`)
  )
  const [packageName] = useState(matchedBatch?.name || 'Gói đề xuất sửa chữa mặt đường BTXM')
  const [items, setItems] = useState<RepairItemDetail[]>(() => repairService.getItems(packageCode))

  useEffect(() => {
    const handleStateChange = () => {
      setItems(repairService.getItems(packageCode))
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [packageCode])

  // Filter State
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REQUEST_EVIDENCE' | 'REJECTED'>(
    'ALL'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Modal States
  const [activeModalItem, setActiveModalItem] = useState<RepairItemDetail | null>(null)
  const [modalFeedbackType, setModalFeedbackType] = useState<'EVIDENCE' | 'RECONSIDER' | 'REJECT'>('EVIDENCE')
  const [modalNotes, setModalNotes] = useState('')
  const [modalDirectives, setModalDirectives] = useState<{ [key: string]: boolean }>({
    laser: true,
    height: false,
    close_photo: false,
    core_sample: false
  })

  // Lightbox Modal for Defect Photo
  const [viewingPhotoItem, setViewingPhotoItem] = useState<RepairItemDetail | null>(null)

  // Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [dispatchDeadline, setDispatchDeadline] = useState('28/08/2026')
  const [dispatchNotice, setDispatchNotice] = useState(
    'Yêu cầu rào chắn cọc tiêu phản quang 50m trước vị trí thi công, bố trí 2 người điều tiết giao thông theo TCVN.'
  )

  // Batch Approve Modal
  const [isBatchApproveConfirmOpen, setIsBatchApproveConfirmOpen] = useState(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Derived Statistics
  const stats = useMemo(() => {
    const total = items.length
    const approved = items.filter((i) => i.status === 'APPROVED').length
    const evidence = items.filter((i) => i.status === 'REQUEST_EVIDENCE').length
    const reconsider = items.filter((i) => i.status === 'REQUEST_RECONSIDER').length
    const rejected = items.filter((i) => i.status === 'REJECTED').length
    const pending = items.filter((i) => i.status === 'PENDING').length

    const approvedArea = items
      .filter((i) => i.status === 'APPROVED')
      .reduce((sum, item) => sum + item.area_m2, 0)
    const totalProposedArea = items.reduce((sum, item) => sum + item.area_m2, 0)

    const percent = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0

    return {
      total,
      approved,
      evidence,
      reconsider,
      rejected,
      pending,
      percent,
      approvedArea: Math.round(approvedArea * 10) / 10,
      totalProposedArea: Math.round(totalProposedArea * 10) / 10
    }
  }, [items])

  // Filtering & Pagination
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (filterTab === 'APPROVED' && item.status !== 'APPROVED') return false
      if (filterTab === 'PENDING' && item.status !== 'PENDING') return false
      if (filterTab === 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_EVIDENCE' && item.status !== 'REQUEST_RECONSIDER')
        return false
      if (filterTab === 'REJECTED' && item.status !== 'REJECTED') return false

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchCode = item.item_code.toLowerCase().includes(q)
        const matchDefect = item.defect_code.toLowerCase().includes(q)
        const matchChainage = item.chainage.toLowerCase().includes(q)
        const matchTitle = item.defect_title.toLowerCase().includes(q)
        const matchSol = item.solution_title.toLowerCase().includes(q)
        return matchCode || matchDefect || matchChainage || matchTitle || matchSol
      }

      return true
    })
  }, [items, filterTab, searchTerm])

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1
  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  // Supervisor Decision Handlers
  const handleQuickApproveItem = (itemId: string) => {
    const autoCrew = 'Tổ thi công Asphalt 01'
    repairService.updateItemDecision(packageCode, itemId, {
      status: 'APPROVED',
      status_label: 'APPROVED',
      assigned_crew: autoCrew,
      supervisor_notes: 'Đã phê duyệt thông qua phương án kỹ thuật và khối lượng bóc tách.'
    })
    setItems(repairService.getItems(packageCode))
    showToast(`Hạng mục ${itemId.toUpperCase()} đã được Supervisor phê duyệt (APPROVED)!`)
  }

  const handleOpenDecisionModal = (item: RepairItemDetail, initialType: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => {
    setActiveModalItem(item)
    setModalFeedbackType(initialType)
    if (initialType === 'EVIDENCE') {
      setModalNotes(
        item.supervisor_notes ||
          'Hình ảnh hiện trường từ Drone chưa làm rõ được độ sụt lún của lớp móng CPĐD. Đề nghị Tổ đo đạc bổ sung ảnh chụp thước đo cốt cao độ đáy ổ gà và kết quả đo độ nẩy bánh xe trước khi duyệt định mức bóc tách.'
      )
    } else if (initialType === 'RECONSIDER') {
      setModalNotes(
        item.supervisor_notes ||
          'Đề nghị PM xem xét lại giải pháp kỹ thuật: cần tăng chiều sâu cào bóc từ 5cm lên 7cm hoặc thay đổi mác bê tông nhựa để đảm bảo tuổi thọ khai thác.'
      )
    } else {
      setModalNotes(
        item.supervisor_notes ||
          'Phương án kỹ thuật đề xuất không phù hợp với quy chuẩn TCVN hoặc trùng lặp với kế hoạch đại tu. Từ chối duyệt phương án này.'
      )
    }
  }

  const handleSubmitDecisionModal = () => {
    if (!activeModalItem) return
    if (!modalNotes.trim()) {
      alert('Vui lòng nhập nội dung giải trình kỹ thuật của Supervisor trước khi gửi!')
      return
    }

    const selectedDirectivesList: string[] = []
    if (modalDirectives.laser)
      selectedDirectivesList.push('Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m')
    if (modalDirectives.height)
      selectedDirectivesList.push('Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm')
    if (modalDirectives.close_photo)
      selectedDirectivesList.push('Chụp lại ảnh cận cảnh có đặt thước tỷ lệ 50cm')
    if (modalDirectives.core_sample)
      selectedDirectivesList.push('Khoan mẫu kiểm tra độ chặt lớp móng K98')

    let nextStatus: ItemApprovalStatus = 'REQUEST_EVIDENCE'
    if (modalFeedbackType === 'RECONSIDER') nextStatus = 'REQUEST_RECONSIDER'
    if (modalFeedbackType === 'REJECT') nextStatus = 'REJECTED'

    repairService.updateItemDecision(packageCode, activeModalItem.id, {
      status: nextStatus,
      status_label: nextStatus,
      assigned_crew: nextStatus === 'REJECTED' ? '' : activeModalItem.assigned_crew,
      supervisor_notes: modalNotes,
      evidence_directives: selectedDirectivesList,
      feedback_type: modalFeedbackType
    })
    setItems(repairService.getItems(packageCode))

    const labelMap = {
      EVIDENCE: 'yêu cầu bổ sung bằng chứng (REQUEST_EVIDENCE)',
      RECONSIDER: 'yêu cầu xem lại phương án (REQUEST_RECONSIDER)',
      REJECT: 'từ chối giải pháp kỹ thuật (REJECTED)'
    }

    showToast(`Đã gửi phản hồi ${labelMap[modalFeedbackType]} cho hạng mục ${activeModalItem.item_code}!`)
    setActiveModalItem(null)
  }

  // Batch Approve All
  const handleBatchApproveAll = () => {
    items.forEach((it) => {
      if (it.status !== 'APPROVED') {
        repairService.updateItemDecision(packageCode, it.id, {
          status: 'APPROVED',
          status_label: 'APPROVED',
          assigned_crew: it.assigned_crew || 'Tổ thi công Asphalt 01',
          supervisor_notes: 'Đã thẩm duyệt phê duyệt hàng loạt thông qua.'
        })
      }
    })
    setItems(repairService.getItems(packageCode))
    setIsBatchApproveConfirmOpen(false)
    showToast('Đã phê duyệt nhanh toàn bộ các hạng mục hợp lệ trong gói đề xuất!')
  }

  // PM Assign Crew handler
  const handleCrewChange = (itemId: string, newCrew: string) => {
    repairService.updateItemDecision(packageCode, itemId, { assigned_crew: newCrew })
    setItems(repairService.getItems(packageCode))
    showToast(`Đã cập nhật phân công đội thi công: [${newCrew}] cho hạng mục!`)
  }

  // Dispatch Work Order submit
  const handleConfirmDispatch = () => {
    repairService.dispatchPackage(packageCode, dispatchDeadline, dispatchNotice)
    setIsDispatchModalOpen(false)
    showToast(
      `Đã phát Lệnh công tác thi công (Work Order) thành công cho ${stats.approved} hạng mục đã APPROVED! Hạn hoàn thành: ${dispatchDeadline}`
    )
  }

  return (
    <div className="space-y-6 pb-20 text-[#1F2937]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section with Breadcrumb and Actions */}
      <ApprovalDetailHeader
        packageCode={packageCode}
        packageName={packageName}
        basePath={basePath}
        stats={stats}
        isSupervisor={isSupervisor}
        onNavigateHome={() => navigate(`${basePath}/dashboard`)}
        onNavigateProposals={() => navigate(`${basePath}/proposals`)}
        onOpenBatchApprove={() => setIsBatchApproveConfirmOpen(true)}
        onExportPdf={() => showToast(`Đang kết xuất hồ sơ thẩm duyệt gói [${packageCode}] sang tệp PDF tiêu chuẩn...`)}
        onOpenDispatch={() => setIsDispatchModalOpen(true)}
      />

      {/* Technical volume summary bar */}
      <ApprovalStatsBar stats={stats} />

      {/* Items table & filter toolbar */}
      <ApprovalItemsTable
        items={items}
        filteredItems={filteredItems}
        displayedItems={displayedItems}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        stats={stats}
        onViewPhoto={(item) => setViewingPhotoItem(item)}
        onQuickApprove={handleQuickApproveItem}
        onOpenDecisionModal={handleOpenDecisionModal}
        onCrewChange={handleCrewChange}
        isSupervisor={isSupervisor}
      />

      {/* Decision, Dispatch, Batch Approve, and Lightbox Modals */}
      <ApprovalModals
        activeModalItem={activeModalItem}
        onCloseDecisionModal={() => setActiveModalItem(null)}
        modalFeedbackType={modalFeedbackType}
        setModalFeedbackType={setModalFeedbackType}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        modalDirectives={modalDirectives}
        setModalDirectives={setModalDirectives}
        onSubmitDecisionModal={handleSubmitDecisionModal}
        onViewPhoto={(item) => setViewingPhotoItem(item)}

        isDispatchModalOpen={isDispatchModalOpen}
        onCloseDispatchModal={() => setIsDispatchModalOpen(false)}
        packageCode={packageCode}
        items={items}
        stats={stats}
        dispatchDeadline={dispatchDeadline}
        setDispatchDeadline={setDispatchDeadline}
        dispatchNotice={dispatchNotice}
        setDispatchNotice={setDispatchNotice}
        onConfirmDispatch={handleConfirmDispatch}

        isBatchApproveConfirmOpen={isBatchApproveConfirmOpen}
        onCloseBatchApproveConfirm={() => setIsBatchApproveConfirmOpen(false)}
        onBatchApproveAll={handleBatchApproveAll}

        viewingPhotoItem={viewingPhotoItem}
        onCloseViewingPhoto={() => setViewingPhotoItem(null)}
      />
    </div>
  )
}
