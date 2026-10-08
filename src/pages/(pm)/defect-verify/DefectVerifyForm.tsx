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
  onRequestSurvey
}) => {
  // Modal trạng thái: 'NONE' | 'RESURVEY' (Bay bổ sung KS11) | 'MEASURE' (Đo thực địa AI13)
  const [modalMode, setModalMode] = useState<'NONE' | 'RESURVEY' | 'MEASURE'>('NONE')
  const [resurveyReason, setResurveyReason] = useState('Ảnh mờ / thiếu độ nét nhận diện')
  const [resurveyPilot, setResurveyPilot] = useState('Lê Hoàng Long')
  const [resurveyDetail, setResurveyDetail] = useState('')
  const [measureType, setMeasureType] = useState('Đo chiều sâu hố lún / ổ gà')
  const [measureCrew, setMeasureCrew] = useState('Đội Kiểm định & Đo đạc Hiện trường 01')

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
      <Card title="Xác Minh & Thẩm Định Hư Hỏng">
        <div className="space-y-4 text-xs">
          {/* 1. Phân Loại Khiếm Khuyết (Defect Type) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                Phân Loại Khiếm Khuyết
              </label>
              {isTypeAdjusted && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                  Đã đổi loại
                </span>
              )}
            </div>
            <select
              value={effectiveType}
              onChange={(e) => onTypeChange && onTypeChange(e.target.value as DefectType)}
              className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-semibold text-slate-800 cursor-pointer ${
                isTypeAdjusted ? 'border-amber-400 bg-amber-50/20' : 'border-[#E2E5E9]'
              }`}
            >
              <option value={DefectType.POTHOLE}>Ổ gà / Hố sụt bản mặt đường (POTHOLE)</option>
              <option value={DefectType.LONGITUDINAL_CRACK}>Nứt dọc / Nứt đơn (LONGITUDINAL CRACK)</option>
              <option value={DefectType.TRANSVERSE_CRACK}>Nứt ngang (TRANSVERSE CRACK)</option>
              <option value={DefectType.ALLIGATOR_CRACK}>Nứt lưới / Nứt chân vịt (ALLIGATOR CRACK)</option>
              <option value={DefectType.RUTTING}>Hằn lún vệt bánh xe (RUTTING)</option>
              <option value={DefectType.RAVELING}>Bong bật cốt liệu / Phong hóa (RAVELING)</option>
            </select>
            {isTypeAdjusted && (
              <p className="text-[11px] text-amber-800 mt-1 flex items-center gap-1 font-medium bg-amber-50/80 p-1.5 rounded border border-amber-200">
                <Icon name="info" size={13} className="text-amber-600 shrink-0" />
                <span>AI nhận diện ban đầu: <strong>{defect.defect_type}</strong> → PM điều chỉnh sang: <strong>{effectiveType}</strong></span>
              </p>
            )}
          </div>

          {/* 2. Mức Độ Nghiêm Trọng (Severity) */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mức Độ Nghiêm Trọng (Severity)
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-medium"
            >
              <option value={Severity.CRITICAL}>CRITICAL — Đặc biệt khẩn cấp</option>
              <option value={Severity.HIGH}>HIGH — Nghiêm trọng</option>
              <option value={Severity.MEDIUM}>MEDIUM — Trung bình</option>
              <option value={Severity.LOW}>LOW — Nhẹ</option>
            </select>
          </div>

          {/* 3. Kích Thước Hình Học Chuẩn Kỹ Thuật (NFR-12: Tách biệt rõ m / mm / cm) */}
          <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E5E9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Kích Thước Hình Học (TCVN)
              </span>
              {isBboxModified ? (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
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
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Chiều dài (L):</span>
                <div className="font-bold text-xs text-[#1A1D20] font-mono">
                  {typeof lengthM === 'number' ? lengthM.toFixed(2) : lengthM} m
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] block">
                  {effectiveType.includes('CRACK') ? 'Bề rộng khe nứt:' : 'Chiều rộng (W):'}
                </span>
                <div className="font-bold text-xs text-[#1A1D20] font-mono">
                  {effectiveType.includes('CRACK')
                    ? `${(widthM < 0.1 ? widthM * 1000 : widthM).toFixed(1)} mm`
                    : `${widthM} m`}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] block">
                  {effectiveType.includes('POTHOLE') || effectiveType.includes('RUT')
                    ? 'Chiều sâu (H):'
                    : 'Diện tích (S):'}
                </span>
                <div className="font-bold text-xs text-[#C9A227] font-mono">
                  {effectiveType.includes('POTHOLE') || effectiveType.includes('RUT')
                    ? defect.depth_mm
                      ? `${(defect.depth_mm / 10).toFixed(1)} cm`
                      : 'Chờ đo thực địa (AI13)'
                    : `${areaM2} m²`}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                Ý Kiến Thẩm Định Của PM <span className="text-red-500">*</span>
              </label>
              {!notes.trim() && (
                <span className="text-[10px] text-red-500 font-semibold">
                  (Bắt buộc nhập lý do)
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 font-medium ${
                !notes.trim()
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                  : 'border-[#E2E5E9] focus:ring-[#C9A227]'
              }`}
              placeholder="Nhập lý do thẩm định (Bắt buộc: ví dụ đã đối chiếu thước đo thực tế, hoặc phát hiện bóng đổ nhiễu AI)..."
            />
            {!notes.trim() && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <Icon name="error" size={14} className="text-red-500" />
                <span>Bắt buộc nhập lý do/ý kiến thẩm định trước khi bấm xác nhận hoặc từ chối.</span>
              </p>
            )}
          </div>

          {/* Action Buttons - 4 Nhánh Quyết Định Nghiệp Vụ Chuẩn Spec v2.2 */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {/* 1. Xác nhận hư hỏng thực tế (VERIFIED) */}
            <Button
              disabled={!notes.trim()}
              onClick={() => onVerify(DefectStatus.VERIFIED)}
              className="w-full bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              icon={<Icon name="check_circle" size={18} />}
            >
              Xác Nhận Hư Hỏng Thực Tế (VERIFIED)
            </Button>

            {/* 2. Yêu cầu đo đạc thực tế khi cần căn cứ vật lý (AI13 / TN01 / NEEDS_MEASUREMENT) */}
            <button
              type="button"
              onClick={() => setModalMode('MEASURE')}
              className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Icon name="straighten" size={16} className="text-blue-600" />
              <span>Yêu Cầu Đo Đạc Thực Địa (AI13)</span>
            </button>

            {/* 3. Yêu cầu bay bổ sung khi dữ liệu chưa đạt (KS11 / BR-43) */}
            <button
              type="button"
              onClick={() => setModalMode('RESURVEY')}
              className="w-full py-2.5 px-3 bg-white hover:bg-amber-50 text-[#8C6D1F] border border-amber-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Icon name="photo_camera" size={16} className="text-[#C9A227]" />
              <span>Yêu Cầu Bay Bổ Sung (KS11 / BR-43)</span>
            </button>

            {/* 4. Từ chối / Báo giả (REJECTED / DISCARDED) */}
            <Button
              variant="outline"
              disabled={!notes.trim()}
              onClick={() => onVerify(DefectStatus.REJECTED)}
              className="w-full text-[#E5484D] border-rose-200 hover:bg-rose-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              icon={<Icon name="cancel" size={18} />}
            >
              Từ Chối / Báo Giả (REJECTED)
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: YÊU CẦU BAY BỔ SUNG (KS11 / BR-43)                                */}
      {/* ========================================================================= */}
      {modalMode === 'RESURVEY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#8C6D1F] border border-amber-200">
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
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
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
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Ảnh mờ / thiếu độ nét nhận diện">Ảnh mờ / thiếu độ nét nhận diện</option>
                  <option value="Lóa sáng / ngược sáng mặt đường">Lóa sáng / ngược sáng mặt đường</option>
                  <option value="Khuất mép đường / thiếu vùng phủ (Coverage)">Khuất mép đường / thiếu vùng phủ (Coverage)</option>
                  <option value="Lệch tọa độ RTK / GPS trôi">Lệch tọa độ RTK / GPS trôi</option>
                  <option value="Cần góc chụp thẳng đứng NADIR chi tiết hơn">Cần góc chụp thẳng đứng NADIR chi tiết hơn</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chỉ định Drone Operator (Phi công điều khiển):
                </label>
                <select
                  value={resurveyPilot}
                  onChange={(e) => setResurveyPilot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Lê Hoàng Long">Lê Hoàng Long (Drone Operator chính - Sẵn sàng)</option>
                  <option value="Hoàng Quốc Bảo">Hoàng Quốc Bảo (Pilot RTK Level 3)</option>
                  <option value="Trần Quang Khải">Trần Quang Khải (Pilot Chuyên gia đo quét)</option>
                  <option value="Nguyễn Văn An">Nguyễn Văn An (Đội bay Hoàng Hải 02)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  * PM có quyền đổi Operator theo BR-43 nếu chuyến bay trước chưa đáp ứng yêu cầu chất lượng.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú cụ thể cho Drone Operator:</label>
                <textarea
                  value={resurveyDetail}
                  onChange={(e) => setResurveyDetail(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  placeholder="Ví dụ: Hạ độ cao xuống 25m, bay quét lại từ Km 1025.2 đến Km 1025.6..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-[#8C6D1F]">
                <strong>Quy tắc BR-43:</strong> PM xác nhận phạm vi bay bổ sung, giữ nguyên các dữ liệu đã đạt ở đợt trước và không giới hạn số lượt hợp lệ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResurvey}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
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
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
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
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Đo chiều sâu hố lún / ổ gà (cm)">Đo chiều sâu hố lún / ổ gà (cm)</option>
                  <option value="Đo bề rộng khe nứt mặt đường (mm)">Đo bề rộng khe nứt mặt đường (mm)</option>
                  <option value="Đo độ lún chênh cốt bản bê tông (Faulting mm)">Đo độ lún chênh cốt bản bê tông (Faulting mm)</option>
                  <option value="Đo diện tích cào bóc thực tế (m²)">Đo diện tích cào bóc thực tế (m²)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn vị nhận nhiệm vụ (Repair Crew):</label>
                <select
                  value={measureCrew}
                  onChange={(e) => setMeasureCrew(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] font-medium"
                >
                  <option value="Đội Kiểm định & Đo đạc Hiện trường 01">Đội Kiểm định & Đo đạc Hiện trường 01</option>
                  <option value="Tổ Tuần đường Khẩn cấp - Huyện đội 02">Tổ Tuần đường Khẩn cấp - Huyện đội 02</option>
                  <option value="Đội Thi công Sửa chữa Hoàng Hải - Trực ban">Đội Thi công Sửa chữa Hoàng Hải - Trực ban</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900">
                <strong>Quy tắc AI13 & TN01:</strong> Khi ảnh drone chưa đủ số đo vật lý, PM bắt buộc giao Repair Crew đo thực tế; trạng thái hồ sơ chuyển sang <code>NEEDS_MEASUREMENT</code> chờ nộp bằng chứng trước khi kết luận.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmMeasure}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Icon name="assignment" size={16} />
                <span>Giao Nhiệm Vụ Đo Đạc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DefectVerifyForm
