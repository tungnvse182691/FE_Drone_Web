import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerDecisionFormProps {
  selectedCase: TriageCase
  currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency: (u: 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  isSupervisor?: boolean
  onVerifyDefect: (c?: TriageCase) => void
  onOpenNoDefectModal: (c?: TriageCase) => void
  onConclusionOutOfScope: (c?: TriageCase) => void
  onOpenRequestSurveyModal: (c?: TriageCase) => void
  onOpenPublishModal: (c?: TriageCase) => void
  onNavigateFastTrack: (c: TriageCase) => void
}

export const DrawerDecisionForm: React.FC<DrawerDecisionFormProps> = ({
  selectedCase,
  currentSeverity,
  setCurrentSeverity,
  currentUrgency,
  setCurrentUrgency,
  currentArea,
  setCurrentArea,
  currentDepth,
  setCurrentDepth,
  currentNotes,
  setCurrentNotes,
  isSupervisor = false,
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
}) => {
  const navigate = useNavigate()
  const basePath = isSupervisor ? '/sup' : '/pm'
  const isEligibleEmergency =
    selectedCase.urgency === 'EMERGENCY' || selectedCase.severity === 'CRITICAL'

  return (
    <div className="space-y-3.5">
      {/* Supervisor Read-only Banner */}
      {isSupervisor && (
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 flex items-start gap-2 text-slate-800 text-xs">
          <Icon name="visibility" size={16} className="text-[#2D3748] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[12px] text-[#1A1D20]">Chế độ Giám sát (Chỉ đọc)</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Hồ sơ khiếm khuyết do Chỉ huy trưởng (PM) phụ trách thẩm định, phân loại kỹ thuật và lập đề xuất sửa chữa.
            </div>
          </div>
        </div>
      )}

      {/* Severity & Urgency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            Mức độ nghiêm trọng <span className="text-red-500">*</span>
          </label>
          <select
            disabled={isSupervisor}
            value={currentSeverity}
            onChange={(e) => setCurrentSeverity(e.target.value as any)}
            className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-gold ${
              isSupervisor ? 'cursor-default opacity-85' : 'cursor-pointer'
            } ${
              currentSeverity === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : currentSeverity === 'HIGH'
                ? 'bg-amber-50 text-[#8F7212] border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <option value="LOW">Nhẹ (Cấp 1 - Theo dõi)</option>
            <option value="MEDIUM">Vừa (Cấp 2 - Kế hoạch)</option>
            <option value="HIGH">Nghiêm trọng (Cấp 3 - Ưu tiên)</option>
            <option value="CRITICAL">Khẩn cấp (Cấp 4 - Nguy hiểm)</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            Tính khẩn cấp <span className="text-red-500">*</span>
          </label>
          <select
            disabled={isSupervisor}
            value={currentUrgency}
            onChange={(e) => setCurrentUrgency(e.target.value as any)}
            className={`w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold ${
              isSupervisor ? 'cursor-default opacity-85' : 'cursor-pointer'
            }`}
          >
            <option value="NORMAL">Bình thường (Theo lịch 7 ngày)</option>
            <option value="URGENT">Khẩn cấp (Trong 24 - 48 giờ)</option>
            <option value="EMERGENCY">Đặc biệt khẩn cấp (Xử lý ngay 4 giờ)</option>
          </select>
        </div>
      </div>

      {/* Thông số kỹ thuật từ CSDL Candidate3 */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span className="text-slate-400 block">Nguồn tiếp nhận:</span>
          <span className="font-semibold text-slate-800">{selectedCase.source_label}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Phân loại / Độ tin cậy:</span>
          <span className="font-bold text-slate-800">
            {selectedCase.defect_type === 'POTHOLE'
              ? 'Ổ gà mặt đường'
              : selectedCase.defect_type === 'CRACK'
              ? 'Vết nứt mặt đường'
              : selectedCase.defect_type}
            {selectedCase.ai_confidence > 0 ? ` • ${selectedCase.ai_confidence}%` : ''}
          </span>
        </div>
        {selectedCase.fixture_version && (
          <div>
            <span className="text-slate-400 block">Mô hình nhận diện AI:</span>
            <span className="font-mono text-slate-700">{selectedCase.fixture_version}</span>
          </div>
        )}
        {selectedCase.linked_defect_id && (
          <div>
            <span className="text-slate-400 block">Hồ sơ khiếm khuyết CSDL:</span>
            <span className="font-mono font-bold text-emerald-700">
              #DEF-{selectedCase.linked_defect_id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* PM Notes */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold text-slate-700">Ghi chú thẩm định PM</label>
          <span className="text-[10px] text-slate-400 font-normal">Lưu nhật ký công trình</span>
        </div>
        <textarea
          rows={2}
          disabled={isSupervisor || !selectedCase.project_id}
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          placeholder={
            !selectedCase.project_id
              ? 'Hồ sơ chưa được gán vào dự án • Đang chờ Giám sát điều phối tuyến...'
              : 'Nhập ghi chú kỹ thuật, chỉ đạo vá nóng cấp bách hoặc đề xuất cắm biển cảnh báo tạm...'
          }
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>

      {/* Decision Action Buttons or Status Card for Supervisor */}
      {isSupervisor ? (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Kết luận thẩm định kỹ thuật:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCase.conclusion === 'DEFECT_FOUND' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Icon name="check_circle" size={14} className="text-emerald-600" />
                Xác minh có khiếm khuyết (Hợp lệ)
              </span>
            )}
            {selectedCase.conclusion === 'NO_DEFECT' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <Icon name="cancel" size={14} className="text-red-600" />
                Không có khiếm khuyết (Báo sai)
              </span>
            )}
            {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Icon name="warning" size={14} className="text-amber-600" />
                Ngoài phạm vi bảo hành
              </span>
            )}
            {!selectedCase.conclusion && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Icon name="hourglass_empty" size={14} className="text-slate-500" />
                Đang chờ PM thẩm định
              </span>
            )}
          </div>
          {selectedCase.is_published && (
            <div className="text-[11px] text-sky-700 flex items-center gap-1 pt-1.5 border-t border-slate-100">
              <Icon name="campaign" size={14} className="text-sky-600" />
              <span>Đã công bố tiến độ cho người dân ({selectedCase.published_at || 'Hôm nay'})</span>
            </div>
          )}
        </div>
      ) : !selectedCase.project_id ? (
        /* Khi ca chưa được Supervisor gán vào dự án mà PM phụ trách */
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Icon name="hourglass_empty" size={15} className="text-amber-600 shrink-0" />
            <span>Chờ Giám sát (Supervisor) điều phối dự án</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Theo quy định Spec 17_10, phản ánh từ người dân phải được Giám sát điều phối gán vào dự án cụ thể trước khi Chỉ huy trưởng (PM) có thẩm quyền kết luận và phát hành công khai.
          </p>
        </div>
      ) : selectedCase.conclusion ? (
        /* Khi hồ sơ đã có kết luận thẩm định: Hiển thị trạng thái đã kết luận rõ ràng, tránh gửi kết luận đè lên hồ sơ đã đóng */
        <div className="space-y-3 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Kết luận thẩm định kỹ thuật</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Đã ghi nhận CSDL
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedCase.conclusion === 'DEFECT_FOUND' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                  <Icon name="check_circle" size={16} className="text-emerald-600" />
                  <span>Xác minh có khiếm khuyết (Hợp lệ)</span>
                </div>
              )}
              {selectedCase.conclusion === 'NO_DEFECT' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 w-full">
                  <Icon name="cancel" size={16} className="text-red-600" />
                  <span>Không có khiếm khuyết (Báo sai)</span>
                </div>
              )}
              {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-full">
                  <Icon name="warning" size={16} className="text-amber-600" />
                  <span>Ngoài phạm vi bảo hành Hoàng Hải</span>
                </div>
              )}
            </div>

            {(selectedCase.conclusion_reason || selectedCase.pm_notes) && (
              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">Lý do thẩm định ghi nhận:</span>
                {selectedCase.conclusion_reason || selectedCase.pm_notes}
              </div>
            )}

            {/* Cho phép PM đổi lại quyết định đối với ứng viên AI Drone khi chưa khóa mốc chuẩn */}
            {selectedCase.source === 'DRONE_AI' && (
              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                {selectedCase.conclusion !== 'DEFECT_FOUND' && (
                  <button
                    type="button"
                    onClick={() => onVerifyDefect(selectedCase)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Icon name="check_circle" size={14} />
                    <span>Đổi sang Hợp lệ</span>
                  </button>
                )}
                {selectedCase.conclusion !== 'NO_DEFECT' && (
                  <button
                    type="button"
                    onClick={() => onOpenNoDefectModal(selectedCase)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Icon name="cancel" size={14} />
                    <span>Đổi sang Báo sai</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Công bố thông báo người dân (API-021) */}
          <button
            type="button"
            onClick={() => onOpenPublishModal(selectedCase)}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
              selectedCase.is_published
                ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <Icon name="campaign" size={16} className="text-blue-600" />
            <span>
              {selectedCase.is_published
                ? `Đã công bố tiến độ cho người dân (${selectedCase.published_at || 'Hôm nay'})`
                : 'Công bố tiến độ cho người dân (API-021)'}
            </span>
          </button>
        </div>
      ) : (
        /* Khi hồ sơ chưa thẩm định: Hiển thị bộ nút thao tác thẩm định cho PM */
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onVerifyDefect(selectedCase)}
            className="w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer bg-brand-gold hover:bg-[#B38E1F]"
          >
            <Icon name="check_circle" size={16} />
            <span>Xác minh có khiếm khuyết (Hợp lệ)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenNoDefectModal(selectedCase)}
              className="border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer bg-white border-slate-200 hover:bg-red-50 text-red-600"
              title="Không có khiếm khuyết (Bắt buộc ghi rõ lý do giải trình)"
            >
              <Icon name="close" size={14} />
              <span>Không có lỗi</span>
            </button>
            <button
              type="button"
              onClick={() => onConclusionOutOfScope(selectedCase)}
              className="border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer bg-white border-slate-200 hover:bg-amber-50 text-amber-700"
              title="Ngoài phạm vi bảo hành Hoàng Hải"
            >
              <Icon name="warning" size={14} />
              <span>Ngoài phạm vi</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenRequestSurveyModal(selectedCase)}
              className="border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              title="Yêu cầu khảo sát, đo đạc hiện trường bổ sung"
            >
              <Icon name="photo_camera" size={14} />
              <span>Yêu cầu đo đạc</span>
            </button>
          </div>

          {/* Public Notice Action */}
          <button
            type="button"
            onClick={() => onOpenPublishModal(selectedCase)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
              selectedCase.is_published
                ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Icon name="campaign" size={16} className="text-blue-600" />
            <span>
              {selectedCase.is_published
                ? `Đã công bố tiến độ cho người dân (${selectedCase.published_at || 'Hôm nay'})`
                : 'Công bố tiến độ cho người dân'}
            </span>
          </button>
        </div>
      )}

      {/* Direct Action Links */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        {isEligibleEmergency && (
          <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 px-3 py-2 rounded-lg text-[#8F7212] text-[11px]">
            <Icon name="verified_user" size={16} className="text-brand-gold shrink-0" />
            <span>Đủ điều kiện kích hoạt xử lý cấp bách (Fast-Track).</span>
          </div>
        )}
        <div className={`grid ${isEligibleEmergency ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/defects/${selectedCase.id}/verify-a`)}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Icon name="visibility" size={14} className="text-brand-gold" />
            <span>Thẩm định khung nhận diện &amp; Đa kỳ</span>
          </button>
          {isEligibleEmergency && (
            <button
              type="button"
              onClick={() => onNavigateFastTrack(selectedCase)}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Icon name="send" size={14} className="text-brand-gold" />
              <span>{isSupervisor ? 'Theo dõi ca cấp bách' : 'Điều phối xử lý nhanh'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
