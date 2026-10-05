import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  X,
  AlertCircle,
  Camera,
  Send,
  ShieldCheck,
  Eye,
} from 'lucide-react'
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
            className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer ${
              currentSeverity === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : currentSeverity === 'HIGH'
                ? 'bg-amber-50 text-[#8F7212] border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <option value="LOW">LOW (Nhẹ - Cấp 1)</option>
            <option value="MEDIUM">MEDIUM (Vừa - Cấp 2)</option>
            <option value="HIGH">HIGH (Nghiêm trọng - Cấp 3)</option>
            <option value="CRITICAL">CRITICAL (Nguy hiểm - Cấp 4)</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-slate-700 mb-1">
            Tính khẩn cấp <span className="text-red-500">*</span>
          </label>
          <select
            value={currentUrgency}
            onChange={(e) => setCurrentUrgency(e.target.value as any)}
            className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
          >
            <option value="NORMAL">NORMAL (Theo lịch 7 ngày)</option>
            <option value="URGENT">URGENT (Trong 24-48 giờ)</option>
            <option value="EMERGENCY">EMERGENCY (Xử lý ngay 4h)</option>
          </select>
        </div>
      </div>

      {/* Area & Depth Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-600 mb-1">Diện tích hư hại</label>
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
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
          <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
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
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
        />
      </div>

      {/* Decision Action Buttons (PA05: DEFECT_FOUND / NO_DEFECT / OUT_OF_SCOPE) */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onVerifyDefect(selectedCase)}
          className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            selectedCase.conclusion === 'DEFECT_FOUND'
              ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
              : 'bg-[#C9A227] hover:bg-[#B38E1F]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {selectedCase.conclusion === 'DEFECT_FOUND'
              ? '✓ Đã Xác Minh DEFECT_FOUND (Bấm để cập nhật lại)'
              : 'Xác minh có khiếm khuyết (DEFECT_FOUND - PA05)'}
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
            <X className="w-3.5 h-3.5" />
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
            <AlertCircle className="w-3.5 h-3.5" />
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
            title="Yêu cầu khảo sát lại hiện trường hoặc bay drone bù (WF-11)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{selectedCase.status === 'NEED_SURVEY' ? 'Đã giao đo lại' : 'Yêu cầu đo lại'}</span>
          </button>
        </div>

        {/* Public Notice Action (PA07) */}
        <button
          type="button"
          onClick={() => onOpenPublishModal(selectedCase)}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
            selectedCase.is_published
              ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {selectedCase.is_published
              ? `📢 Đã công bố tiến độ cho người dân (${selectedCase.published_at || 'Hôm nay'})`
              : 'Công bố tiến độ cho người dân (PA07)'}
          </span>
        </button>
      </div>

      {/* Compliance Note & Direct Action Links */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
          <span>Đã đủ điều kiện kích hoạt lệnh thi công sửa chữa cấp bách (WF-05).</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate(`/pm/defects/${selectedCase.id}/verify`)}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>So sánh đa kỳ & BBox</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateFastTrack(selectedCase)}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Điều phối Fast Track</span>
          </button>
        </div>
      </div>
    </div>
  )
}
