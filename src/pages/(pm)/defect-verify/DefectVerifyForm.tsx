import React, { useState } from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { Defect } from '../../../types/domain'
import { DefectStatus, Severity, DefectType } from '../../../types/enums'

interface DefectVerifyFormProps {
  defect: Defect
  currentType?: DefectType
  onTypeChange?: (val: DefectType) => void
  dimensions?: { lengthM: number; widthM: number }
  isBboxModified?: boolean
  severity: Severity
  setSeverity: (val: Severity) => void
  notes: string
  setNotes: (val: string) => void
  onVerify: (status: DefectStatus) => void
  onRequestSurvey?: (reason: string, mode: 'DRONE_RESURVEY' | 'MEASURE_ONLY') => void
  onLinkRecurrence?: (priorId: string, reason: string, notes: string) => void
  isSupervisor?: boolean
}

export const DefectVerifyForm: React.FC<DefectVerifyFormProps> = ({
  defect,
  currentType,
  onTypeChange,
  dimensions,
  isBboxModified = false,
  severity,
  setSeverity,
  notes,
  setNotes,
  onVerify,
  onRequestSurvey,
  onLinkRecurrence,
  isSupervisor = false
}) => {
  // Modal trạng thái: 'NONE' | 'RESURVEY' (Bay bổ sung KS11) | 'MEASURE' (Đo thực địa AI13) | 'RECURRENCE' (Liên kết tái phát API-110)
  const [modalMode, setModalMode] = useState<'NONE' | 'RESURVEY' | 'MEASURE' | 'RECURRENCE'>('NONE')
  const [resurveyReason, setResurveyReason] = useState('Ảnh mờ / thiếu độ nét nhận diện')
  const [resurveyPilot, setResurveyPilot] = useState('Lê Hoàng Long')
  const [resurveyDetail, setResurveyDetail] = useState('')
  const [measureType, setMeasureType] = useState('Đo chiều sâu hố lún / ổ gà')
  const [measureCrew, setMeasureCrew] = useState('Đội Kiểm định & Đo đạc Hiện trường 01')

  // State cho Liên kết tái phát khiếm khuyết (API-110 / recurrences)
  const [priorDefectId, setPriorDefectId] = useState('DEF-2025-0412')
  const [recurrenceReason, setRecurrenceReason] = useState('Nứt phản xạ qua lớp vá cũ do tải trọng xe nặng')
  const [recurrenceNotes, setRecurrenceNotes] = useState(
    'Đối chiếu chuỗi ảnh đa kỳ: vị trí nứt mới trùng khớp 100% với mép vá cũ tháng 11/2025. Cần liên kết tái phát để theo dõi độ suy thoái.'
  )
  const [isLinkedRecurrence, setIsLinkedRecurrence] = useState(false)
  const [linkedPriorCode, setLinkedPriorCode] = useState<string | null>(null)

  const effectiveType = currentType || defect.defect_type
  const isTypeAdjusted = currentType && currentType !== defect.defect_type
  const lengthM = dimensions?.lengthM ?? defect.length_m ?? 1.2
  const widthM = dimensions?.widthM ?? defect.width_m ?? 0.8
  const areaM2 = (lengthM * widthM).toFixed(2)

  const handleConfirmResurvey = () => {
    const fullReason = `${resurveyReason} • Phi công: ${resurveyPilot}${resurveyDetail ? ` - ${resurveyDetail}` : ''}`
    if (onRequestSurvey) {
      onRequestSurvey(fullReason, 'DRONE_RESURVEY')
    }
    setModalMode('NONE')
  }

  const handleConfirmMeasure = () => {
    const fullReason = `${measureType} • Giao cho ${measureCrew}`
    if (onRequestSurvey) {
      onRequestSurvey(fullReason, 'MEASURE_ONLY')
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
              {isSupervisor ? 'Thẩm Tra Kỹ Thuật Khiếm Khuyết AI' : 'Xác Minh & Thẩm Định Hư Hỏng'}
            </h2>
            <p className="text-[11px] text-slate-500">Đối chiếu kích thước hình học, phân loại và kết luận thẩm định</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Supervisor Read-only Banner (AI01 & AI10) */}
          {isSupervisor && (
            <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-3 flex items-start gap-2.5 text-slate-800 text-xs">
              <Icon name="visibility" size={16} className="text-[#2D3748] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[12px] text-[#1A1D20]">Chế độ Giám sát (Chỉ đọc)</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Thẩm tra mô hình khung nhận diện, kích thước và ảnh đa kỳ đối chiếu Baseline theo AI01 &amp; AI10.
                </div>
              </div>
            </div>
          )}

          {/* Recurrent Defect Banner (API-110 / BR-37) */}
          {isLinkedRecurrence && (
            <div className="bg-amber-50 border border-amber-300 rounded-[12px] p-3 flex items-start gap-2.5 text-amber-900 text-xs">
              <Icon name="history" size={18} className="text-[#C9A227] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[12px] text-amber-950 flex items-center gap-1.5">
                  <span>ĐÃ LIÊN KẾT TÁI PHÁT (RECURRENT DEFECT)</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-200/80 rounded text-amber-900 font-semibold">API-110</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Liên kết với lỗi cũ: <strong className="font-mono">{linkedPriorCode}</strong> • Nguyên nhân: {recurrenceReason}
                </div>
              </div>
            </div>
          )}

          {/* 1. Phân Loại Khiếm Khuyết (Defect Type) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Phân Loại Khiếm Khuyết
              </label>
              {isTypeAdjusted && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  Đã đổi loại
                </span>
              )}
            </div>
            <select
              disabled={isSupervisor}
              value={effectiveType}
              onChange={(e) => onTypeChange && onTypeChange(e.target.value as DefectType)}
              className={`w-full px-3 py-2 bg-white border rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold text-slate-800 transition-colors ${
                isSupervisor ? 'cursor-default opacity-85' : 'cursor-pointer'
              } ${
                isTypeAdjusted ? 'border-amber-400 bg-amber-50/20' : 'border-[#E2E5E9]'
              }`}
            >
              <option value={DefectType.POTHOLE}>Ổ gà / Hố sụt bản mặt đường</option>
              <option value={DefectType.LONGITUDINAL_CRACK}>Nứt dọc / Nứt đơn (LONGITUDINAL CRACK)</option>
              <option value={DefectType.TRANSVERSE_CRACK}>Nứt ngang (TRANSVERSE CRACK)</option>
              <option value={DefectType.ALLIGATOR_CRACK}>Nứt lưới / Nứt chân vịt (ALLIGATOR CRACK)</option>
              <option value={DefectType.RUTTING}>Hằn lún vệt bánh xe (RUTTING)</option>
              <option value={DefectType.RAVELING}>Bong bật cốt liệu / Phong hóa (RAVELING)</option>
            </select>
            {isTypeAdjusted && (
              <p className="text-[11px] text-amber-800 mt-1.5 flex items-center gap-1.5 font-medium bg-amber-50/80 p-2 rounded-[10px] border border-amber-200">
                <Icon name="info" size={13} className="text-amber-600 shrink-0" />
                <span>AI nhận diện ban đầu: <strong>{defect.defect_type}</strong> → PM điều chỉnh sang: <strong>{effectiveType}</strong></span>
              </p>
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
              className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <option value={Severity.CRITICAL}>Nguy cấp — Đặc biệt khẩn cấp</option>
              <option value={Severity.HIGH}>HIGH — Nghiêm trọng</option>
              <option value={Severity.MEDIUM}>MEDIUM — Trung bình</option>
              <option value={Severity.LOW}>LOW — Nhẹ</option>
            </select>
          </div>

          {/* 3. Kích Thước Hình Học Chuẩn Kỹ Thuật (NFR-12: Tách biệt rõ m / mm / cm) */}
          <div className="p-3 bg-[#F8F9FA] rounded-[14px] border border-[#E2E5E9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Kích Thước Hình Học (TCVN)
              </span>
              {isBboxModified ? (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Icon name="straighten" size={12} />
                  <span>Theo khung kéo</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  Đơn vị chuẩn kỹ thuật
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Chiều dài (L):</span>
                <div className="font-bold text-xs text-[#1A1D20] font-mono mt-0.5">
                  {typeof lengthM === 'number' ? lengthM.toFixed(2) : lengthM} m
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">
                  {effectiveType.includes('CRACK') ? 'Bề rộng khe nứt:' : 'Chiều rộng (W):'}
                </span>
                <div className="font-bold text-xs text-[#1A1D20] font-mono mt-0.5">
                  {effectiveType.includes('CRACK')
                    ? `${(widthM < 0.1 ? widthM * 1000 : widthM).toFixed(1)} mm`
                    : `${widthM} m`}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-[10px] border border-slate-200">
                <span className="text-slate-400 text-[10px] block">
                  {effectiveType.includes('POTHOLE') || effectiveType.includes('RUT')
                    ? 'Chiều sâu (H):'
                    : 'Diện tích (S):'}
                </span>
                <div className="font-bold text-xs text-[#C9A227] font-mono mt-0.5">
                  {effectiveType.includes('POTHOLE') || effectiveType.includes('RUT')
                    ? defect.depth_mm
                      ? `${(defect.depth_mm / 10).toFixed(1)} cm`
                      : 'Chờ đo thực địa (AI13)'
                    : `${areaM2} m²`}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Ghi Chú / Ý Kiến Thẩm Định */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                {isSupervisor ? 'Ý Kiến Thẩm Định Kỹ Thuật (PM)' : 'Ý Kiến Thẩm Định Của PM'} {!isSupervisor && <span className="text-red-500">*</span>}
              </label>
              {!isSupervisor && !notes.trim() && (
                <span className="text-[10px] text-red-500 font-semibold">
                  (Bắt buộc nhập lý do)
                </span>
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
              placeholder={isSupervisor ? 'Chưa có ghi chú thẩm định...' : 'Nhập lý do thẩm định (Bắt buộc: ví dụ đã đối chiếu thước đo thực tế, hoặc phát hiện bóng đổ nhiễu AI)...'}
            />
            {!isSupervisor && !notes.trim() && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <Icon name="error" size={14} className="text-red-500" />
                <span>Bắt buộc nhập lý do/ý kiến thẩm định trước khi bấm xác nhận hoặc từ chối.</span>
              </p>
            )}
          </div>

          {/* Action Buttons: Phân định quyền PM (4 nút thẩm định) vs Supervisor (Thẩm tra đối chiếu AI01/AI10) */}
          {isSupervisor ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  <Icon name="verified_user" size={16} className="text-emerald-600" />
                  <span>Kết Quả Thẩm Tra Kỹ Thuật (BR-02 / FR-13)</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Trạng thái hiện tại: <strong className="text-slate-900 font-mono">{defect.status}</strong>. Supervisor thực hiện thẩm tra trực quan hình ảnh AI BBox và so sánh ảnh đa kỳ (Temporal) đối chiếu thực tế. Quyền phê duyệt/từ chối giải pháp được thực hiện tại màn hình <em>Thẩm duyệt đợt sửa chữa</em>.
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {/* 1. Xác nhận hư hỏng thực tế (VERIFIED) */}
              <Button
                disabled={!notes.trim()}
                onClick={() => onVerify(DefectStatus.VERIFIED)}
                className="w-full bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-bold rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                icon={<Icon name="check_circle" size={18} />}
              >
                Xác Nhận Hư Hỏng Thực Tế
              </Button>

              {/* 2. Liên kết tái phát khiếm khuyết (RECURRENCES / LINK_EXISTING - API-110) */}
              <button
                type="button"
                onClick={() => setModalMode('RECURRENCE')}
                className="w-full py-2.5 px-3 bg-white hover:bg-amber-50 text-[#8C6D1F] border border-amber-300 font-bold rounded-[10px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Icon name="history" size={16} className="text-[#C9A227]" />
                <span>Liên Kết Tái Phát (Recurrences - API-110)</span>
              </button>

              {/* 3. Yêu cầu đo đạc thực tế khi cần căn cứ vật lý (AI13 / TN01 / NEEDS_MEASUREMENT) */}
              <button
                type="button"
                onClick={() => setModalMode('MEASURE')}
                className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold rounded-[10px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Icon name="straighten" size={16} className="text-blue-600" />
                <span>Yêu Cầu Đo Đạc Thực Địa (AI13)</span>
              </button>

              {/* 3. Yêu cầu bay bổ sung khi dữ liệu chưa đạt (KS11 / BR-43) */}
              <button
                type="button"
                onClick={() => setModalMode('RESURVEY')}
                className="w-full py-2.5 px-3 bg-white hover:bg-amber-50 text-[#8C6D1F] border border-amber-300 font-bold rounded-[10px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Icon name="photo_camera" size={16} className="text-[#C9A227]" />
                <span>Yêu Cầu Bay Bổ Sung (KS11 / BR-43)</span>
              </button>

              {/* 4. Từ chối / Báo giả (REJECTED / DISCARDED) */}
              <Button
                variant="outline"
                disabled={!notes.trim()}
                onClick={() => onVerify(DefectStatus.REJECTED)}
                className="w-full text-[#E5484D] border-rose-200 hover:bg-rose-50 font-bold rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
                icon={<Icon name="cancel" size={18} />}
              >
                Từ Chối / Báo Giả
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: YÊU CẦU BAY BỔ SUNG (KS11 / BR-43)                                */}
      {/* ========================================================================= */}
      {modalMode === 'RESURVEY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-amber-300" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-amber-50 text-[#8C6D1F] border border-amber-200">
                  <Icon name="photo_camera" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D20]">Yêu Cầu Bay Bổ Sung (KS11 / BR-43)</h3>
                  <p className="text-[11px] text-slate-500">Chỉ định bay quét lại đoạn Km {defect.chainage_km}</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Lý do kỹ thuật chưa đạt:</label>
                <select
                  value={resurveyReason}
                  onChange={(e) => setResurveyReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Ảnh mờ / thiếu độ nét nhận diện">Ảnh mờ / thiếu độ nét nhận diện</option>
                  <option value="Lóa sáng / ngược sáng mặt đường">Lóa sáng / ngược sáng mặt đường</option>
                  <option value="Khuất mép đường / thiếu vùng phủ">Khuất mép đường / thiếu vùng phủ</option>
                  <option value="Lệch tọa độ RTK / GPS trôi">Lệch tọa độ RTK / GPS trôi</option>
                  <option value="Cần góc chụp thẳng đứng NADIR chi tiết hơn">Cần góc chụp thẳng đứng NADIR chi tiết hơn</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chỉ định phi công thiết bị bay:
                </label>
                <select
                  value={resurveyPilot}
                  onChange={(e) => setResurveyPilot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Lê Hoàng Long">Lê Hoàng Long (Phi công thiết bị bay chính - Sẵn sàng)</option>
                  <option value="Hoàng Quốc Bảo">Hoàng Quốc Bảo (Phi công RTK cấp 3)</option>
                  <option value="Trần Quang Khải">Trần Quang Khải (Phi công chuyên gia đo quét)</option>
                  <option value="Nguyễn Văn An">Nguyễn Văn An (Đội bay Hoàng Hải 02)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  * PM có quyền đổi Operator theo BR-43 nếu chuyến bay trước chưa đáp ứng yêu cầu chất lượng.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú cụ thể cho phi công thiết bị bay:</label>
                <textarea
                  value={resurveyDetail}
                  onChange={(e) => setResurveyDetail(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  placeholder="Ví dụ: Hạ độ cao xuống 25m, bay quét lại từ Km 1025.2 đến Km 1025.6..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-[12px] border border-amber-200 text-[11px] text-[#8C6D1F]">
                <strong>Quy tắc BR-43:</strong> PM xác nhận phạm vi bay bổ sung, giữ nguyên các dữ liệu đã đạt ở đợt trước và không giới hạn số lượt hợp lệ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-[10px] text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResurvey}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-[10px] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Icon name="send" size={16} />
                <span>Gửi Lệnh Bay Bổ Sung</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: YÊU CẦU ĐO ĐẠC THỰC ĐỊA (AI13 / TN01 / NEEDS_MEASUREMENT)        */}
      {/* ========================================================================= */}
      {modalMode === 'MEASURE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-300" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-blue-50 text-blue-600 border border-blue-200">
                  <Icon name="straighten" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D20]">Giao Đo Đạc Hiện Trường (AI13 / TN01)</h3>
                  <p className="text-[11px] text-slate-500">Xác thực căn cứ vật lý cho lỗi {defect.code}</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Nội dung phép đo yêu cầu:</label>
                <select
                  value={measureType}
                  onChange={(e) => setMeasureType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Đo chiều sâu hố lún / ổ gà (cm)">Đo chiều sâu hố lún / ổ gà (cm)</option>
                  <option value="Đo bề rộng khe nứt mặt đường (mm)">Đo bề rộng khe nứt mặt đường (mm)</option>
                  <option value="Đo độ lún chênh cốt bản bê tông (Faulting mm)">Đo độ lún chênh cốt bản bê tông (Faulting mm)</option>
                  <option value="Đo diện tích cào bóc thực tế (m²)">Đo diện tích cào bóc thực tế (m²)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn vị nhận nhiệm vụ:</label>
                <select
                  value={measureCrew}
                  onChange={(e) => setMeasureCrew(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Đội Kiểm định & Đo đạc Hiện trường 01">Đội Kiểm định & Đo đạc Hiện trường 01</option>
                  <option value="Tổ Tuần đường Khẩn cấp - Huyện đội 02">Tổ Tuần đường Khẩn cấp - Huyện đội 02</option>
                  <option value="Đội Thi công Sửa chữa Hoàng Hải - Trực ban">Đội Thi công Sửa chữa Hoàng Hải - Trực ban</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-[12px] border border-blue-200 text-[11px] text-blue-900">
                <strong>Quy tắc AI13 & TN01:</strong> Khi ảnh drone chưa đủ số đo vật lý, PM bắt buộc giao Repair Crew đo thực tế; trạng thái hồ sơ chuyển sang <code>NEEDS_MEASUREMENT</code> chờ nộp bằng chứng trước khi kết luận.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-[10px] text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmMeasure}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Icon name="assignment" size={16} />
                <span>Giao Nhiệm Vụ Đo Đạc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LIÊN KẾT TÁI PHÁT KHIẾM KHUYẾT (RECURRENCES / API-110 / BR-37)    */}
      {/* ========================================================================= */}
      {modalMode === 'RECURRENCE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-amber-500 to-amber-200" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="history" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D20]">Liên Kết Khiếm Khuyết Tái Phát (API-110)</h3>
                  <p className="text-[11px] text-slate-500">Móc nối chuỗi lịch sử hư hỏng cho {defect.code}</p>
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
                  Chọn khiếm khuyết / quyết định sửa chữa cũ tại vị trí này:
                </label>
                <select
                  value={priorDefectId}
                  onChange={(e) => setPriorDefectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="DEF-2025-0412">DEF-2025-0412 — Vết nứt dọc đã trám nhựa (Tháng 11/2025) • Quyết định: DEC-2025-089</option>
                  <option value="DEF-2025-0219">DEF-2025-0219 — Ổ gà bù vênh BTN C12.5 (Tháng 08/2025) • Quyết định: DEC-2025-045</option>
                  <option value="DEF-2024-0980">DEF-2024-0980 — Bong bật rỗ tổ ong mặt đường (Tháng 04/2024) • Quyết định: DEC-2024-012</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Căn cứ kỹ thuật tái phát:</label>
                <select
                  value={recurrenceReason}
                  onChange={(e) => setRecurrenceReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Nứt phản xạ qua lớp vá cũ do tải trọng xe nặng">Nứt phản xạ qua lớp vá cũ do tải trọng xe nặng</option>
                  <option value="Lún sụt nền móng đường cục bộ tái diễn">Lún sụt nền móng đường cục bộ tái diễn</option>
                  <option value="Bong tróc mép vuốt nối giữa lớp thảm mới và cũ">Bong tróc mép vuốt nối giữa lớp thảm mới và cũ</option>
                  <option value="Khuyết tật nứt mỏi kết cấu áo đường">Khuyết tật nứt mỏi kết cấu áo đường</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú đối chiếu chuỗi ảnh đa kỳ (Temporal Audit):</label>
                <textarea
                  value={recurrenceNotes}
                  onChange={(e) => setRecurrenceNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  placeholder="Ghi chú đối chiếu tọa độ và lịch sử..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-[12px] border border-amber-200 text-[11px] text-[#8C6D1F]">
                <strong>Quy tắc Spec 17_10 &amp; BR-37:</strong> Khi liên kết tái phát, dữ liệu được móc nối vào chuỗi Audit Trail bảo hành của dự án, giữ nguyên lịch sử hư hỏng cũ và tính vào chỉ số suy thoái mặt đường. Cấm dùng lệnh chỉnh sửa thường (repair correction) để tạo tái phát tùy ý.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-[10px] text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLinkedRecurrence(true)
                  setLinkedPriorCode(priorDefectId)
                  if (onLinkRecurrence) {
                    onLinkRecurrence(priorDefectId, recurrenceReason, recurrenceNotes)
                  }
                  setModalMode('NONE')
                }}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-[10px] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Icon name="link" size={16} />
                <span>Xác Nhận Liên Kết Tái Phát</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DefectVerifyForm
