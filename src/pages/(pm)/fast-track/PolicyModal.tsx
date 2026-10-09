import React from 'react'
import { ShieldCheck, X, CheckCircle2, Lock, AlertTriangle } from 'lucide-react'
import { PolicyThresholdConfig } from './types'

export interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  currentPolicy: PolicyThresholdConfig
  formVersionName: string
  setFormVersionName: (v: string) => void
  formMaxArea: string
  setFormMaxArea: (v: string) => void
  formMaxDepth: string
  setFormMaxDepth: (v: string) => void
  formSlaHours: string
  setFormSlaHours: (v: string) => void
  formMaxPerimeter: string
  setFormMaxPerimeter: (v: string) => void
  formPolicyNote: string
  setFormPolicyNote: (v: string) => void
  handleApplyPolicy: (action: 'DRAFT' | 'ACTIVATE') => void
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  currentPolicy,
  formVersionName,
  setFormVersionName,
  formMaxArea,
  setFormMaxArea,
  formMaxDepth,
  setFormMaxDepth,
  formSlaHours,
  setFormSlaHours,
  formMaxPerimeter,
  setFormMaxPerimeter,
  formPolicyNote,
  setFormPolicyNote,
  handleApplyPolicy
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Tạo Phiên Bản Chính Sách Fast Track Mới</h3>
              <span className="text-[10px] text-slate-500">Kế thừa và điều chỉnh từ {currentPolicy.version}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tên phiên bản chính sách</label>
            <input
              type="text"
              value={formVersionName}
              onChange={(e) => setFormVersionName(e.target.value)}
              placeholder="Ví dụ: Policy v2.2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Ngưỡng diện tích tối đa (m²)</label>
              <input
                type="number"
                step="0.05"
                value={formMaxArea}
                onChange={(e) => setFormMaxArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxAreaM2} m²</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Ngưỡng độ sâu tối đa (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formMaxDepth}
                onChange={(e) => setFormMaxDepth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxDepthCm} cm</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Thời hạn SLA hoàn thành (giờ)</label>
              <input
                type="number"
                value={formSlaHours}
                onChange={(e) => setFormSlaHours(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.slaHours} giờ</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Chu vi tối đa (m)</label>
              <input
                type="number"
                step="0.1"
                value={formMaxPerimeter}
                onChange={(e) => setFormMaxPerimeter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {currentPolicy.maxPerimeterM} m</span>
            </div>
          </div>

          {/* Cấu hình Mức độ nghiêm trọng áp dụng */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mức độ nghiêm trọng cho phép áp dụng Fast Track
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>LOW (Nhẹ)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>MEDIUM (Vừa)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Quy chuẩn an toàn cấm tự duyệt Fast Track với lỗi nặng">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>HIGH (Khóa)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Quy chuẩn an toàn cấm tự duyệt Fast Track với lỗi khẩn cấp/nguy hiểm">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>CRITICAL (Khóa)</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              🔒 <strong>Ràng buộc bất biến:</strong> Theo quy định BR-04 &amp; BR-08, Fast Track chỉ áp dụng cho hư hỏng nhỏ/vừa (LOW &amp; MEDIUM). Hư hỏng kết cấu nặng (HIGH/CRITICAL) bắt buộc phải qua thẩm duyệt Supervisor hoặc Đội cứu hộ khẩn cấp.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Ghi chú căn cứ &amp; lý do ban hành</label>
            <textarea
              rows={2}
              value={formPolicyNote}
              onChange={(e) => setFormPolicyNote(e.target.value)}
              placeholder="Ghi rõ cơ sở điều chỉnh..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Quy tắc hệ thống:</strong> Khi chọn <em>Kích hoạt chính sách ngay</em>, hệ thống sẽ tự động cập nhật bảng khiếm khuyết theo ngưỡng mới và lưu bản hiện tại ({currentPolicy.version}) vào kho lưu trữ (ARCHIVED).
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyPolicy('DRAFT')}
              type="button"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-xl border border-amber-200 shadow-2xs cursor-pointer transition-colors"
            >
              Lưu dự thảo (DRAFT)
            </button>
            <button
              onClick={() => handleApplyPolicy('ACTIVATE')}
              type="button"
              className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kích hoạt chính sách ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
