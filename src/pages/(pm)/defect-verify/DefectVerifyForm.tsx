import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { Defect } from '../../../types/domain'
import { DefectStatus, Severity, DefectType } from '../../../types/enums'
import {
  BackendDefectDto,
  CandidateMatchItemDto,
  formatDefectTypeLabel
} from '../../../api/services/surveyService'
import { BoundingBoxCoords } from './DefectBoundingBoxViewer'

interface DefectVerifyFormProps {
  defect: Defect
  currentType?: DefectType | string
  onTypeChange?: (val: DefectType | string) => void
  customTypeText?: string
  onCustomTypeTextChange?: (val: string) => void
  liveBbox?: BoundingBoxCoords
  isBboxModified?: boolean
  onSaveBbox?: () => Promise<void> | void
  isSavingBbox?: boolean
  severity: Severity
  setSeverity: (val: Severity) => void
  notes: string
  setNotes: (val: string) => void
  onVerify: (status: DefectStatus) => void
  onResetDecision?: () => void
  onLinkRecurrence?: (targetDefectId: string, targetVersion: string, notes: string) => void
  existingDefects?: BackendDefectDto[]
  candidateMatches?: CandidateMatchItemDto[]
  isSubmitting?: boolean
  isSupervisor?: boolean
}

export const DefectVerifyForm: React.FC<DefectVerifyFormProps> = ({
  defect,
  currentType,
  onTypeChange,
  customTypeText = '',
  onCustomTypeTextChange,
  liveBbox,
  isBboxModified = false,
  onSaveBbox,
  isSavingBbox = false,
  severity,
  setSeverity,
  notes,
  setNotes,
  onVerify,
  onResetDecision,
  onLinkRecurrence,
  existingDefects = [],
  candidateMatches = [],
  isSubmitting = false,
  isSupervisor = false
}) => {
  const [modalMode, setModalMode] = useState<'NONE' | 'LINK_EXISTING'>('NONE')

  // State cho Gom / Liên kết với khiếm khuyết hiện hữu trong CSDL
  const [selectedTargetDefectId, setSelectedTargetDefectId] = useState<string>('')
  const [linkNotes, setLinkNotes] = useState(
    'Gom ứng viên AI trùng vị trí lý trình vào hồ sơ khiếm khuyết hiện hữu trong CSDL.'
  )

  // Chỉ lấy danh sách các khiếm khuyết hiện hữu ĐƯỢC BACKEND ĐỀ XUẤT qua API GET /candidates (candidateMatches)
  const recommendedDefects = candidateMatches.map((match) => {
    const detail = existingDefects.find((d) => d.id.toLowerCase() === match.defectId.toLowerCase())
    return {
      match,
      detail
    }
  })

  useEffect(() => {
    if (recommendedDefects.length > 0 && !selectedTargetDefectId) {
      setSelectedTargetDefectId(recommendedDefects[0].match.defectId)
    }
  }, [recommendedDefects, selectedTargetDefectId])

  const effectiveType = currentType || defect.defect_type
  const isCustomMode = effectiveType === 'CUSTOM'
  const origTypeLabel = formatDefectTypeLabel(defect.defect_type)
  const effectiveTypeLabel = isCustomMode
    ? customTypeText.trim() || 'Loại lỗi tự nhập'
    : formatDefectTypeLabel(effectiveType)
  const isTypeAdjusted = Boolean(
    currentType && (currentType !== defect.defect_type || (isCustomMode && customTypeText.trim()))
  )

  const displayBbox = liveBbox || defect.bounding_box
  const stationingLabel = `Km ${Math.floor(defect.chainage_km)}+${String(
    Math.round((defect.chainage_km % 1) * 1000)
  ).padStart(3, '0')}`

  const decisionKindVi =
    defect.decision_kind === 'KEEP_NEW'
      ? 'Đã chấp nhận'
      : defect.decision_kind === 'LINK_EXISTING'
      ? 'Đã gom vào lỗi hiện hữu'
      : defect.decision_kind === 'REJECT'
      ? 'Đã báo sai'
      : defect.decision_kind || ''

  const formatDefectTypeVi = (code?: string | null) => formatDefectTypeLabel(code)

  const formatSeverityVi = (sev?: string | null) => {
    if (sev === 'CRITICAL') return 'Khẩn cấp'
    if (sev === 'HIGH') return 'Nghiêm trọng'
    if (sev === 'LOW') return 'Nhẹ'
    return 'Trung bình'
  }

  const formatStatusVi = (st?: string | null) => {
    if (st === 'VERIFIED') return 'Đã xác minh'
    if (st === 'REJECTED') return 'Báo sai'
    return 'Chờ xử lý'
  }

  const formatReasonCodeVi = (code: string) => {
    const upper = code.toUpperCase()
    if (upper.includes('SEGMENT')) return 'Cùng đoạn tuyến đường'
    if (upper.includes('DISTANCE') || upper.includes('RADIUS') || upper.includes('PROXIMITY'))
      return 'Nằm trong bán kính lân cận'
    if (upper.includes('ROUTE') || upper.includes('SECTION')) return 'Cùng tuyến đường khảo sát'
    if (upper.includes('TYPE')) return 'Cùng loại hư hỏng mặt đường'
    return code
  }

  const selectedRecommendation = recommendedDefects.find(
    (r) => r.match.defectId.toLowerCase() === selectedTargetDefectId.toLowerCase()
  )

  const handleConfirmLinkExisting = () => {
    if (!selectedTargetDefectId) return
    const matchedDef = existingDefects.find((d) => d.id === selectedTargetDefectId)
    const matchedCand = candidateMatches.find((c) => c.defectId === selectedTargetDefectId)
    const targetVersion = matchedDef?.version || matchedCand?.version || ''
    if (onLinkRecurrence) {
      onLinkRecurrence(selectedTargetDefectId, targetVersion, linkNotes)
    }
    setModalMode('NONE')
  }

  return (
    <>
      <div className="rounded-[20px] border-[1.5px] border-[#E2E5E9] bg-white p-5 shadow-2xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-[#1E40AF] to-slate-200" />
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#E2E5E9]">
          <div className="w-8 h-8 rounded-[10px] bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#C9A227] shrink-0">
            <Icon name={isSupervisor ? 'verified_user' : 'rate_review'} size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1A1D20]">
              {isSupervisor ? 'Thẩm Tra Kỹ Thuật Khiếm Khuyết' : 'Xác Minh & Quyết Định Thẩm Định'}
            </h2>
            <p className="text-[11px] text-slate-500">
              Phân loại lỗi, mức độ nghiêm trọng và ra quyết định thẩm định
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Supervisor Read-only Banner */}
          {isSupervisor && (
            <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-3 flex items-start gap-2.5 text-slate-800 text-xs">
              <Icon name="visibility" size={16} className="text-[#2D3748] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[12px] text-[#1A1D20]">Chế độ Giám sát (Chỉ đọc)</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Thẩm tra mô hình khung nhận diện, tọa độ và ảnh đa kỳ từ CSDL.
                </div>
              </div>
            </div>
          )}

          {/* Banner trạng thái quyết định trong CSDL */}
          {defect.disposition_id && (
            <div
              className={`rounded-[12px] p-3.5 space-y-2 text-xs border ${
                defect.decision_kind === 'REJECT'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : defect.decision_kind === 'LINK_EXISTING'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2 min-w-0">
                  <Icon
                    name={
                      defect.decision_kind === 'REJECT'
                        ? 'cancel'
                        : defect.decision_kind === 'LINK_EXISTING'
                        ? 'link'
                        : 'check_circle'
                    }
                    size={18}
                    className={
                      defect.decision_kind === 'REJECT'
                        ? 'text-rose-600 shrink-0 mt-0.5'
                        : defect.decision_kind === 'LINK_EXISTING'
                        ? 'text-amber-700 shrink-0 mt-0.5'
                        : 'text-emerald-600 shrink-0 mt-0.5'
                    }
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-[12px]">
                      {defect.decision_kind === 'LINK_EXISTING'
                        ? 'Đã gom vào hồ sơ khiếm khuyết cũ'
                        : `Trạng thái thẩm định: ${decisionKindVi}`}
                    </div>
                    {defect.decision_kind === 'LINK_EXISTING' && defect.linked_defect_id && (
                      <div className="text-[11px] mt-0.5 font-mono text-slate-700">
                        Mã hồ sơ đích:{' '}
                        <strong className="text-slate-900 font-bold">
                          #DEF-{defect.linked_defect_id.slice(0, 8).toUpperCase()}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {!isSupervisor && onResetDecision && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onResetDecision}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
                    title={
                      defect.decision_kind === 'LINK_EXISTING'
                        ? 'Tách ứng viên AI ra khỏi hồ sơ khiếm khuyết cũ'
                        : 'Đặt lại về trạng thái Chờ duyệt'
                    }
                  >
                    <Icon
                      name={
                        isSubmitting
                          ? 'refresh'
                          : defect.decision_kind === 'LINK_EXISTING'
                          ? 'link_off'
                          : 'restart_alt'
                      }
                      size={14}
                      className={
                        isSubmitting
                          ? 'animate-spin text-slate-600'
                          : defect.decision_kind === 'LINK_EXISTING'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }
                    />
                    <span>
                      {isSubmitting
                        ? 'Đang xử lý...'
                        : defect.decision_kind === 'LINK_EXISTING'
                        ? 'Tách ra (Hủy gom)'
                        : 'Mở lại (Chờ duyệt)'}
                    </span>
                  </button>
                )}
              </div>

              {defect.decision_kind === 'LINK_EXISTING' && defect.linked_defect_id && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-amber-900">
                    Ứng viên AI này được lưu trữ làm bằng chứng bổ sung cho hồ sơ #DEF-
                    {defect.linked_defect_id.slice(0, 8).toUpperCase()}.
                  </span>
                  <a
                    href={`/pm/defects/${defect.linked_defect_id}/verify-a`}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                  >
                    <Icon name="visibility" size={13} />
                    <span>Xem hồ sơ #DEF</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 1. Phân Loại Khiếm Khuyết (Hỗ trợ danh mục chuẩn TCVN & Tự nhập loại lỗi) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Loại Khiếm Khuyết Mặt Đường
              </label>
              {isTypeAdjusted && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  Đã đổi: {origTypeLabel} → {effectiveTypeLabel}
                </span>
              )}
            </div>
            <select
              disabled={isSupervisor}
              value={effectiveType}
              onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
              className={`w-full px-3 py-2 bg-white border rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold text-slate-800 transition-colors ${
                isSupervisor ? 'cursor-default opacity-80 bg-slate-50' : 'cursor-pointer'
              } ${isTypeAdjusted ? 'border-amber-400 bg-amber-50/20' : 'border-[#E2E5E9]'}`}
            >
              <option value={DefectType.LONGITUDINAL_CRACK}>Vết nứt mặt đường (Nứt dọc)</option>
              <option value={DefectType.POTHOLE}>Ổ gà mặt đường</option>
              <option value={DefectType.TRANSVERSE_CRACK}>Nứt ngang mặt đường</option>
              <option value={DefectType.ALLIGATOR_CRACK}>Nứt mạng lưới (da cá sấu)</option>
              <option value={DefectType.RUTTING}>Lún vệt bánh xe</option>
              <option value={DefectType.RAVELING}>Bong bật cốt liệu</option>
              <option value="CUSTOM">+ Khác (PM tự nhập loại lỗi...)</option>
            </select>

            {isCustomMode && !isSupervisor && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customTypeText}
                  onChange={(e) => onCustomTypeTextChange && onCustomTypeTextChange(e.target.value)}
                  placeholder="Nhập tên loại khiếm khuyết (VD: Sụt lún mép lề đường, Vỡ khe co giãn...)"
                  className="w-full px-3 py-2 bg-amber-50/30 border border-amber-400 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold text-slate-800 text-xs"
                />
              </div>
            )}
          </div>

          {/* 2. Mức Độ Nghiêm Trọng */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Mức Độ Nghiêm Trọng
            </label>
            <select
              value={severity}
              disabled={isSupervisor}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-default transition-colors"
            >
              <option value={Severity.CRITICAL}>Khẩn cấp / Nguy cấp</option>
              <option value={Severity.HIGH}>Nghiêm trọng</option>
              <option value={Severity.MEDIUM}>Trung bình</option>
              <option value={Severity.LOW}>Nhẹ / Theo dõi</option>
            </select>
          </div>

          {/* 3. Thông Số Nhận Diện AI (Đã lược bỏ các mã UUID kỹ thuật nội bộ) */}
          <div className="p-3 bg-[#F8F9FA] rounded-[14px] border border-[#E2E5E9] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Thông Số Nhận Diện AI
              </span>
              {isBboxModified && !isSupervisor && onSaveBbox ? (
                <button
                  type="button"
                  disabled={isSavingBbox}
                  onClick={onSaveBbox}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#C9A227] hover:bg-[#8C6D1F] text-white flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                >
                  <Icon name="save" size={12} />
                  <span>{isSavingBbox ? 'Đang lưu...' : 'Lưu tọa độ khung bao'}</span>
                </button>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border text-emerald-800 bg-emerald-50 border-emerald-200 flex items-center gap-1">
                  <Icon name="verified" size={12} className="text-emerald-700" />
                  <span>Mô hình {defect.fixture_version || 'Road-YOLOv9'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div
                className={`p-2 rounded-[10px] border transition-colors ${
                  isBboxModified ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-slate-400 text-[10px] block">
                  Tọa độ khung bao (X, Y, Rộng, Cao):
                </span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  ({displayBbox.x.toFixed(2)}, {displayBbox.y.toFixed(2)},{' '}
                  {displayBbox.width.toFixed(2)}, {displayBbox.height.toFixed(2)})
                </div>
                {isBboxModified && (
                  <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                    Đã chỉnh trên khung ảnh
                  </span>
                )}
              </div>

              <div className="bg-white p-2 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Độ tin cậy AI:</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {(defect.confidence_score * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Xác suất mô hình nhận diện
                </span>
              </div>

              <div className="bg-white p-2 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Thời điểm trích xuất:</span>
                <div className="font-semibold text-slate-700 mt-0.5">
                  {defect.timestamp_ms != null
                    ? `${(defect.timestamp_ms / 1000).toFixed(2)} giây (Mốc ${defect.timestamp_ms}ms)`
                    : 'Ảnh tĩnh khảo sát'}
                </div>
              </div>

              <div className="bg-white p-2 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Vị trí lý trình:</span>
                <div className="font-mono font-bold text-slate-700 mt-0.5">
                  {stationingLabel}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Ghi Chú / Ý Kiến Thẩm Định */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                {isSupervisor ? 'Ghi Chú Thẩm Định Kỹ Thuật' : 'Ý Kiến Thẩm Định Của PM'}{' '}
                {!isSupervisor && <span className="text-red-500">*</span>}
              </label>
              {!isSupervisor && !notes.trim() && (
                <span className="text-[10px] text-red-500 font-semibold">(Bắt buộc nhập lý do)</span>
              )}
            </div>
            <textarea
              value={notes}
              disabled={isSupervisor}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-white border rounded-[10px] focus:outline-none focus:ring-1 font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors ${
                !isSupervisor && !notes.trim()
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                  : 'border-[#E2E5E9] focus:ring-[#C9A227]'
              }`}
              placeholder={
                isSupervisor
                  ? 'Chưa có ghi chú thẩm định...'
                  : 'Nhập lý do kết luận thẩm định (bắt buộc trước khi bấm Chấp nhận hoặc Báo sai)...'
              }
            />
          </div>

          {/* Action Buttons ngắn gọn, rõ ràng */}
          {isSupervisor ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  <Icon name="verified_user" size={16} className="text-emerald-600" />
                  <span>Trạng Thái Hồ Sơ</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Trạng thái hiện tại: <strong className="text-slate-900">{formatStatusVi(defect.status)}</strong>.
                  Giám sát kiểm tra trực quan khung nhận diện AI và so sánh ảnh đa kỳ đối chiếu thực tế.
                </p>
              </div>
            </div>
          ) : defect.source_kind === 'AI_DETECTION' && defect.decision_kind ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  <Icon name="lock" size={15} className="text-slate-500" />
                  <span>Ứng viên AI đã được xác lập quyết định</span>
                </div>
                <p className="leading-relaxed">
                  {defect.decision_kind === 'LINK_EXISTING' ? (
                    <>
                      Ứng viên này đang được gom vào hồ sơ cũ{' '}
                      <strong className="text-slate-900">
                        {defect.linked_defect_id
                          ? `#DEF-${defect.linked_defect_id.slice(0, 8).toUpperCase()}`
                          : ''}
                      </strong>
                      . Theo nghiệp vụ, không thể đồng thời chấp nhận tạo mới hoặc báo sai khi đang gom. Để đổi quyết định, vui lòng bấm nút{' '}
                      <strong className="text-amber-800 font-bold">"Tách ra (Hủy gom)"</strong> ở khung phía trên.
                    </>
                  ) : (
                    <>
                      Ứng viên này đã được{' '}
                      <strong className="text-slate-900 font-bold">
                        {defect.decision_kind === 'KEEP_NEW' ? 'Chấp nhận tạo mới' : 'Báo sai'}
                      </strong>
                      . Để thẩm định lại hoặc đổi sang gom lỗi, vui lòng bấm nút{' '}
                      <strong className="text-slate-900 font-bold">"Mở lại (Chờ duyệt)"</strong> ở khung phía trên.
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Chấp nhận */}
                <Button
                  disabled={!notes.trim() || isSubmitting || (isCustomMode && !customTypeText.trim())}
                  onClick={() => onVerify(DefectStatus.VERIFIED)}
                  className="w-full bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-bold rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  icon={<Icon name="check_circle" size={18} />}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Chấp nhận'}
                </Button>

                {/* 2. Báo sai */}
                <Button
                  variant="outline"
                  disabled={!notes.trim() || isSubmitting}
                  onClick={() => onVerify(DefectStatus.REJECTED)}
                  className="w-full text-[#E5484D] border-rose-200 hover:bg-rose-50 font-bold rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
                  icon={<Icon name="cancel" size={18} />}
                >
                  Báo sai
                </Button>
              </div>

              {/* 3. Gom vào khiếm khuyết hiện hữu (Chỉ bật khi Backend đề xuất ứng viên khớp điều kiện) */}
              {defect.source_kind !== 'DEFECT' && recommendedDefects.length > 0 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setModalMode('LINK_EXISTING')}
                  className="w-full py-2 px-3 bg-white hover:bg-amber-50 text-[#8C6D1F] border border-amber-300 font-bold rounded-[10px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <Icon name="link" size={15} className="text-[#C9A227]" />
                  <span>Gom vào lỗi hiện hữu ({recommendedDefects.length} đề xuất gần đây)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: GOM / LIÊN KẾT VỚI KHIẾM KHUYẾT HIỆN HỮU TRONG CSDL                 */}
      {/* ========================================================================= */}
      {modalMode === 'LINK_EXISTING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-amber-500 to-amber-200" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="link" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D20]">
                    Gom Vào Khiếm Khuyết Hiện Hữu
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Liên kết ứng viên AI {defect.code} vào hồ sơ khiếm khuyết đã có trong dự án
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-[8px] cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Danh sách lỗi hiện hữu được Backend đề xuất (thỏa điều kiện vị trí &amp; tuyến đường):
                </label>
                <select
                  value={selectedTargetDefectId}
                  onChange={(e) => setSelectedTargetDefectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  {recommendedDefects.map(({ match, detail }) => (
                    <option key={match.defectId} value={match.defectId}>
                      #DEF-{match.defectId.slice(0, 8).toUpperCase()} —{' '}
                      {detail
                        ? `${formatDefectTypeVi(detail.defectTypeCode)} (${formatSeverityVi(detail.severity)}) • ${formatStatusVi(detail.status)}`
                        : 'Hồ sơ khiếm khuyết CSDL'}
                      {match.distanceMeters != null ? ` • Cách ${match.distanceMeters.toFixed(1)}m` : ''}
                      {` • Ưu tiên nhóm ${match.priorityGroup}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRecommendation && (
                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Điều kiện khớp từ thuật toán Backend:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                      Nhóm ưu tiên {selectedRecommendation.match.priorityGroup}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                    <div>
                      Khoảng cách tâm:{' '}
                      <strong className="text-slate-900">
                        {selectedRecommendation.match.distanceMeters != null
                          ? `${selectedRecommendation.match.distanceMeters.toFixed(1)} mét`
                          : 'Cùng đoạn tuyến'}
                      </strong>
                    </div>
                    <div>
                      Số nguồn đã gom trước đó:{' '}
                      <strong className="text-slate-900">
                        {selectedRecommendation.match.historySummary?.sourceLinkCount ?? 1} nguồn
                      </strong>
                    </div>
                  </div>
                  {selectedRecommendation.match.reasonCodes &&
                    selectedRecommendation.match.reasonCodes.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {selectedRecommendation.match.reasonCodes.map((rc) => (
                          <span
                            key={rc}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-medium"
                          >
                            ✓ {formatReasonCodeVi(rc)}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú thẩm định khi gom lỗi:
                </label>
                <textarea
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  placeholder="Ghi chú căn cứ liên kết với khiếm khuyết hiện hữu..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-[10px] text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!selectedTargetDefectId}
                onClick={handleConfirmLinkExisting}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-[10px] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-40"
              >
                <Icon name="link" size={16} />
                <span>Xác nhận gom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DefectVerifyForm
