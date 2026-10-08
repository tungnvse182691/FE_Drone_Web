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
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-3.5">
      {/* Severity & Urgency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            Mức độ nghiêm trọng <span className="text-red-500">*</span>
          </label>
          <select
            value={currentSeverity}
            onChange={(e) => setCurrentSeverity(e.target.value as any)}
            className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer ${
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
            value={currentUrgency}
            onChange={(e) => setCurrentUrgency(e.target.value as any)}
            className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            <option value="NORMAL">Bình thường (Theo lịch 7 ngày)</option>
            <option value="URGENT">Khẩn cấp (Trong 24 - 48 giờ)</option>
            <option value="EMERGENCY">Đặc biệt khẩn cấp (Xử lý ngay 4 giờ)</option>
          </select>
        </div>
      </div>

      {/* Area & Depth Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-600 mb-1">Diện tích hư hại</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-brand-gold focus-within:border-brand-gold">
            <input
              type="number"
              step="0.01"
              value={currentArea}
              onChange={(e) => setCurrentArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold ml-1">m²</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            AI ước tính: {selectedCase.ai_area_sqm} m²
          </span>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-600 mb-1">Độ sâu lớn nhất</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-brand-gold focus-within:border-brand-gold">
            <input
              type="number"
              step="0.1"
              value={currentDepth}
              onChange={(e) => setCurrentDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-semibold ml-1">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            AI ước tính: {selectedCase.ai_depth_cm} cm
          </span>
        </div>
      </div>

      {/* PM Notes */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold text-slate-700">Ghi chú thẩm định PM</label>
          <span className="text-[10px] text-slate-400 font-normal">Lưu nhật ký công trình</span>
        </div>
        <textarea
          rows={2}
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          placeholder="Nhập ghi chú kỹ thuật, chỉ đạo vá nóng cấp bách hoặc đề xuất cắm biển cảnh báo tạm..."
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
        />
      </div>

      {/* Decision Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onVerifyDefect(selectedCase)}
          className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            selectedCase.conclusion === 'DEFECT_FOUND'
              ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
              : 'bg-brand-gold hover:bg-[#B38E1F]'
          }`}
        >
          <Icon name="check_circle" size={16} />
          <span>
            {selectedCase.conclusion === 'DEFECT_FOUND'
              ? '✓ Đã xác minh có khiếm khuyết (Bấm để cập nhật lại)'
              : 'Xác minh có khiếm khuyết (Hợp lệ)'}
          </span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onOpenNoDefectModal(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.conclusion === 'NO_DEFECT'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-white border-slate-200 hover:bg-red-50 text-red-600'
            }`}
            title="Không có khiếm khuyết (Bắt buộc lý do giải trình theo BR-39)"
          >
            <Icon name="close" size={14} />
            <span>{selectedCase.conclusion === 'NO_DEFECT' ? 'Đã báo sai' : 'Không có lỗi (BR-39)'}</span>
          </button>
          <button
            type="button"
            onClick={() => onConclusionOutOfScope(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.conclusion === 'OUT_OF_SCOPE'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white border-slate-200 hover:bg-amber-50 text-amber-700'
            }`}
            title="Ngoài phạm vi bảo hành Hoàng Hải"
          >
            <Icon name="warning" size={14} />
            <span>{selectedCase.conclusion === 'OUT_OF_SCOPE' ? 'Đã loại trừ' : 'Ngoài phạm vi'}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenRequestSurveyModal(selectedCase)}
            className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
              selectedCase.status === 'NEED_SURVEY'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Yêu cầu khảo sát lại hiện trường hoặc bay drone bù"
          >
            <Icon name="photo_camera" size={14} />
            <span>{selectedCase.status === 'NEED_SURVEY' ? 'Đã giao đo lại' : 'Yêu cầu đo lại'}</span>
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

      {/* Compliance Note & Direct Action Links */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
          <Icon name="verified_user" size={16} className="text-brand-gold shrink-0" />
          <span>Đã đủ điều kiện kích hoạt lệnh thi công sửa chữa cấp bách.</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate(`/pm/defects/${selectedCase.id}/verify-a`)}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Icon name="visibility" size={14} className="text-brand-gold" />
            <span>Thẩm định BBox &amp; Đa kỳ</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateFastTrack(selectedCase)}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Icon name="send" size={14} className="text-brand-gold" />
            <span>Điều phối xử lý nhanh</span>
          </button>
        </div>
      </div>
    </div>
  )
}
