import { projectExportService, exportError } from '../../api/services/projectExportService'
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { RepairTrackType, ItemReviewStatus, CaseItem } from './evidence-closeout/types'
import { CloseoutHeader } from './evidence-closeout/CloseoutHeader'
import { ComparisonViewer } from './evidence-closeout/ComparisonViewer'
import { TechnicalCriteriaCard } from './evidence-closeout/TechnicalCriteriaCard'
import { CloseoutModals } from './evidence-closeout/CloseoutModals'
import { DefectClosurePanel } from './evidence-closeout/DefectClosurePanel'
import { acceptanceService, AcceptancePackage, AcceptanceStaleError, AcceptanceStepError } from '../../api/services/acceptanceService'
import { ReviewModalVariant } from './evidence-closeout/DeclareConstructionModal'
import { beErrorText, repairStateLabel } from './evidence-closeout/acceptanceLabels'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

export type { RepairTrackType, ItemReviewStatus, CaseItem }

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

  // Tải dữ liệu thật từ BE (gói + hạng mục + bản nộp hiện hành). keepSelection: giữ hạng mục đang xem sau khi ghi.
  const [reloadTick, setReloadTick] = useState(0)
  const reload = useCallback(async (keepSelection: boolean): Promise<CaseItem[]> => {
    const targetPkgId = batchId || id || ''
    // Tuần tự: gói trước (làm mới danh sách), rồi hạng mục dùng danh sách vừa đọc, tránh tải trùng song song.
    const pkg = await acceptanceService.getAcceptancePackageById(targetPkgId)
    const items = await acceptanceService.getCloseoutItems(targetPkgId)
    const statusInfo = await acceptanceService.getCaseCloseoutStatus(targetPkgId)
    setCurrentPackage(pkg)
    setCaseItems(items)
    setIsCaseClosed(statusInfo.isCaseClosed)
    setSelectedItemId((prev) => (keepSelection && items.some((it) => it.id === prev) ? prev : items[0]?.id || ''))
    return items
  }, [id, batchId])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setLoadError(null)
    reload(false)
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu nghiệm thu:', err)
        if (isMounted) setLoadError(beErrorText(err))
      })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => {
      isMounted = false
    }
  }, [reload, reloadTick])

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

  // Form yêu cầu bổ sung (PM review SUPPLEMENT): mặc định trống, không tích sẵn lỗi hay chỉ đạo mẫu
  const [reworkNotes, setReworkNotes] = useState('')
  const [reworkChecklist, setReworkChecklist] = useState({
    bond_coat: false,
    flatness_3m: false,
    temperature_slip: false,
    compaction_k98: false,
    other_defect: false
  })
  const [otherDefectText, setOtherDefectText] = useState('')
  const resetReworkForm = () => {
    setReworkNotes('')
    setReworkChecklist({ bond_coat: false, flatness_3m: false, temperature_slip: false, compaction_k98: false, other_defect: false })
    setOtherDefectText('')
  }

  // Export Form State
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [includeSha256Checksum, setIncludeSha256Checksum] = useState(true)
  const [includeDroneRawTiff, setIncludeDroneRawTiff] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Status Success feedback
  const [isCaseClosed, setIsCaseClosed] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [modalError, setModalError] = useState('')
  const [reviewVariant, setReviewVariant] = useState<ReviewModalVariant>('normal')
  // Thông báo cần đối soát bền vững (ghi thành công một phần / đã đổi dữ liệu)
  const [reconcileNote, setReconcileNote] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 6000)
  }

  // Composite Case Status Calculation
  const acceptedCount = useMemo(() => {
    return caseItems.filter((i) => i.status === 'ACCEPTED').length
  }, [caseItems])

  const allItemsAccepted = caseItems.length > 0 && acceptedCount === caseItems.filter((i) => i.status !== 'CANCELLED').length

  // Đọc lại từ BE; trả hạng mục vừa thao tác để so sánh với trạng thái BE đã lưu.
  const refreshAfterWrite = async (itemId: string): Promise<CaseItem | undefined> => {
    const items = await reload(true)
    return items.find((it) => it.id === itemId)
  }
  const expectOf = (it: CaseItem) => ({ submissionId: it.submission_id, version: it.item_version })

  // Lỗi chung của thao tác ghi: stale -> tải lại; còn lại -> hiện đúng status/code/mã đối chiếu (không chỉ "Repair request failed")
  const onWriteError = async (err: unknown, prefix: string) => {
    const message = err instanceof AcceptanceStaleError || err instanceof AcceptanceStepError ? err.message : beErrorText(err)
    setModalError(`${prefix}: ${message}`)
    if (err instanceof AcceptanceStepError || err instanceof AcceptanceStaleError) setReconcileNote(`${prefix}: ${message}`)
    try { await reload(true) } catch (e) { setReconcileNote(`Không tải lại được trạng thái từ BE: ${beErrorText(e)}`) }
    showToast(`${prefix}: ${message}`)
  }

  // PM yêu cầu bổ sung hồ sơ = review SUPPLEMENT (khác yêu cầu sửa lại/hiệu chỉnh)
  const handleSubmitRework = async () => {
    if (!currentItem) return
    if (reworkChecklist.other_defect && !otherDefectText.trim()) return
    if (!writeGuard.acquire()) return
    setBusy(true); setModalError('')
    const selectedIssues: string[] = []
    if (reworkChecklist.bond_coat) selectedIssues.push('Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám')
    if (reworkChecklist.flatness_3m) selectedIssues.push('Độ bằng phẳng thước 3m vượt quá dung sai (> 3mm)')
    if (reworkChecklist.temperature_slip) selectedIssues.push('Thiếu phiếu cân và biên bản đo nhiệt độ thảm')
    if (reworkChecklist.compaction_k98) selectedIssues.push('Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định')
    if (reworkChecklist.other_defect && otherDefectText.trim()) selectedIssues.push(otherDefectText.trim())
    const note = reworkNotes.trim()
    const combinedReason = `${selectedIssues.join('; ')}${selectedIssues.length && note ? '. Ghi chú: ' : ''}${note}`.slice(0, 2000)
    try {
      await acceptanceService.pmSupplementReview(currentItem.id, combinedReason, expectOf(currentItem))
      const fresh = await refreshAfterWrite(currentItem.id)
      setIsReworkModalOpen(false)
      resetReworkForm()
      setReconcileNote('')
      showToast(
        fresh?.pending_step === 'SUPPLEMENT'
          ? `Đã gửi yêu cầu bổ sung hồ sơ (review SUPPLEMENT) cho ${currentItem.item_code}. BE ghi nhận: Cần bổ sung, chờ Crew nộp bản bổ sung.`
          : `Đã gửi review SUPPLEMENT cho ${currentItem.item_code} nhưng BE chưa phản ánh trạng thái Cần bổ sung (hiện: ${repairStateLabel(fresh?.be_state)}); hãy tải lại để đối soát.`
      )
    } catch (err) {
      await onWriteError(err, 'Không gửi được yêu cầu bổ sung')
    } finally { writeGuard.release(); setBusy(false) }
  }

  // Giám sát xác nhận cuối (Normal): mở hộp thoại xác nhận có lý do, chỉ chạy khi BE đang ở Reviewed
  const handleAcceptItem = () => {
    if (!currentItem) return
    setModalError(''); setReviewVariant('supervisor-final'); setIsDeclareModalOpen(true)
  }

  const handlePMCloseFastTrack = () => {
    if (!currentItem) return
    setModalError(''); setReviewVariant('fast-track'); setIsDeclareModalOpen(true)
  }

  const handlePMSubmitToSupervisor = () => {
    setModalError(''); setReviewVariant('normal'); setIsDeclareModalOpen(true)
  }

  // Xác nhận trong hộp thoại: gọi đúng thao tác theo vai trò/nhánh, đọc lại BE rồi mới báo kết quả
  const handleConfirmDeclaration = async (notes: string) => {
    if (!currentItem) return
    if (!writeGuard.acquire()) return
    setBusy(true); setModalError('')
    const expect = expectOf(currentItem)
    try {
      if (reviewVariant === 'supervisor-final') {
        await acceptanceService.supervisorFinalConfirm(currentItem.id, notes, expect)
        const fresh = await refreshAfterWrite(currentItem.id)
        setIsDeclareModalOpen(false); setReconcileNote('')
        showToast(fresh?.be_state === 'Confirmed' ? `Giám sát đã xác nhận nghiệm thu hạng mục ${currentItem.item_code}. BE ghi nhận: Đã nghiệm thu.` : `Đã gửi xác nhận cuối nhưng BE chưa phản ánh trạng thái Đã nghiệm thu (hiện: ${repairStateLabel(fresh?.be_state)}); hãy tải lại để đối soát.`)
      } else if (reviewVariant === 'fast-track') {
        const r = await acceptanceService.closeFastTrackItem(currentItem.id, notes, expect)
        const fresh = await refreshAfterWrite(currentItem.id)
        setIsDeclareModalOpen(false); setReconcileNote('')
        showToast(fresh?.be_state === 'Confirmed' ? `PM đã hoàn tất: ${r.completed.join(' → ')} cho ${currentItem.item_code}. BE ghi nhận: Đã nghiệm thu.` : `Đã gửi các bước (${r.completed.join(' → ')}) nhưng BE chưa phản ánh trạng thái Đã nghiệm thu (hiện: ${repairStateLabel(fresh?.be_state)}); hãy tải lại để đối soát.`)
      } else {
        await acceptanceService.pmAcceptReview(currentItem.id, notes, expect)
        const fresh = await refreshAfterWrite(currentItem.id)
        setIsDeclareModalOpen(false); setReconcileNote('')
        showToast(fresh?.be_state === 'Reviewed' ? `PM đã chấp nhận hồ sơ ${currentItem.item_code} (review ACCEPT). BE ghi nhận: ${repairStateLabel(fresh.be_state)} — chờ Giám sát xác nhận cuối.` : `Đã gửi review ACCEPT nhưng BE chưa phản ánh trạng thái PM đã chấp nhận (hiện: ${repairStateLabel(fresh?.be_state)}); hãy tải lại để đối soát.`)
      }
    } catch (err) {
      await onWriteError(err, reviewVariant === 'supervisor-final' ? 'Không xác nhận được nghiệm thu' : reviewVariant === 'fast-track' ? 'Không đóng được Fast Track' : 'Không chấp nhận được hồ sơ')
    } finally { writeGuard.release(); setBusy(false) }
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
        <div role="status" className="fixed bottom-6 right-6 z-[10000] max-w-[calc(100vw-3rem)] md:max-w-xl flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#C9A227]">check_circle</span>
          <span className="text-xs font-medium break-words min-w-0">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {reconcileNote && (
        <div role="alert" data-testid="reconcile-note" className="p-3 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-lg flex flex-wrap items-center justify-between gap-2">
          <span className="break-words min-w-0">{reconcileNote}</span>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await reload(true); setReconcileNote('') } catch (e) { setReconcileNote(`Không tải lại được từ BE: ${beErrorText(e)}`) } finally { setBusy(false) } }} className="px-3 h-7 rounded-md bg-white border border-amber-400 text-amber-900 font-semibold cursor-pointer disabled:opacity-50">Tải lại để đối soát</button>
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
        busy={busy}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenReworkModal={() => { setModalError(''); setIsReworkModalOpen(true) }}
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
        setIsDeclareModalOpen={(open) => { if (!busy) setIsDeclareModalOpen(open) }}
        onConfirmDeclaration={handleConfirmDeclaration}
        reviewVariant={reviewVariant}
        busy={busy}
        modalError={modalError}
      />
    </div>
  )
}
export default EvidenceCloseoutDetail
