import React, { useState } from 'react'
import { fastTrackService } from '../../../api/services/fastTrackService'
import { fastTrackStorage } from '../../../api/services/fastTrackJournal'
import { exportError } from '../../../api/services/projectExportService'
import { Icon } from '../../../components/ui/Icon'
import { PolicyThresholdConfig } from './types'

export interface PolicyModalProps {
  projectId: string
  actionError: string
  isOpen: boolean
  onClose: () => void
  currentPolicy: PolicyThresholdConfig | null
  formVersionName: string
  setFormVersionName: (v: string) => void
  formMaxArea: string
  setFormMaxArea: (v: string) => void
  formMaxDepth: string
  setFormMaxDepth: (v: string) => void
  formPolicyNote: string
  setFormPolicyNote: (v: string) => void
  handleApplyPolicy: (action: 'DRAFT' | 'ACTIVATE') => void
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  projectId, actionError,
  isOpen,
  onClose,
  currentPolicy,
  formVersionName,
  setFormVersionName,
  formMaxArea,
  setFormMaxArea,
  formMaxDepth,
  setFormMaxDepth,
  formPolicyNote,
  setFormPolicyNote,
  handleApplyPolicy
}) => {
  const [reference,setReference]=useState(''),[referenceKind,setReferenceKind]=useState<'drafts'|'revisions'>('revisions'),[error,setError]=useState('')
  const [type,setType]=useState(()=>localStorage.getItem(fastTrackStorage(projectId,'policy-type')) || '')
  const readReference=async()=>{try{setError('');await fastTrackService.readPolicy(projectId,reference.trim(),referenceKind);window.dispatchEvent(new Event('fasttrack-refresh'));setError('Đã đọc chính sách từ hệ thống.')}catch(e){setError(exportError(e))}}
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="verified_user" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Lập Dự Thảo &amp; Điều Chỉnh Chính Sách</h3>
              <span className="text-[10px] text-slate-500">Chỉ huy trưởng (PM) lập dự thảo &amp; xuất bản chính sách kỹ thuật xử lý nhanh</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {(error || actionError) && <p role="alert" className="text-red-800">{error || actionError}</p>}
          <div className="space-y-2"><label>Đọc chính sách đã có (tham chiếu từ hồ sơ)</label><div className="flex gap-2"><select value={referenceKind} onChange={e=>setReferenceKind(e.target.value as 'drafts'|'revisions')} className="border rounded-lg p-2"><option value="revisions">Đã xuất bản</option><option value="drafts">Dự thảo</option></select><input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Tham chiếu chính sách" className="border rounded-lg p-2 min-w-0 flex-1"/><button onClick={readReference} className="border rounded-lg p-2">Đọc</button></div></div>
          <label className="block">Mã loại hư hỏng từ hồ sơ nguồn<input value={type} onChange={e=>{setType(e.target.value);localStorage.setItem(fastTrackStorage(projectId,'policy-type'),e.target.value)}} className="block w-full border rounded-lg p-2 mt-1"/></label>
          <p className="text-slate-500">Dự thảo này dùng khoảng từ 0 đến ngưỡng nhập cho Area (m²), DepressionDepth (mm); chưa khai báo điều kiện dừng bổ sung. Không phải ngưỡng TCVN mặc định.</p>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tên phiên bản chính sách</label>
            <input
              type="text"
              value={formVersionName}
              onChange={(e) => setFormVersionName(e.target.value)}
              placeholder="Ví dụ: TCVN-8819-2011"
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
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {(Number.isFinite(currentPolicy?.maxAreaM2) ? currentPolicy?.maxAreaM2 : '—')} m²</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Ngưỡng độ sâu tối đa (mm)</label>
              <input
                type="number"
                step="0.5"
                value={formMaxDepth}
                onChange={(e) => setFormMaxDepth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hiện hành: ≤ {(Number.isFinite(currentPolicy?.maxDepthCm) ? currentPolicy?.maxDepthCm : '—')} mm</span>
            </div>
          </div>

          {/* Cấu hình Mức độ nghiêm trọng áp dụng */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mức độ hư hỏng (tham khảo, không quyết định điều kiện Fast Track)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <Icon name="check_circle" size={14} className="text-emerald-600 shrink-0" />
                <span>Thấp (Nhẹ)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                <Icon name="check_circle" size={14} className="text-blue-600 shrink-0" />
                <span>Trung bình (Vừa)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Mức độ hư hỏng không thay thế đánh giá đủ điều kiện">
                <Icon name="lock" size={14} className="text-slate-400 shrink-0" />
                <span>HIGH</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Mức độ hư hỏng không thay thế đánh giá đủ điều kiện">
                <Icon name="lock" size={14} className="text-slate-400 shrink-0" />
                <span>CRITICAL</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Điều kiện thi công do chính sách, số đo, vị trí, độ phủ và quyền hiện hành quyết định; không suy từ mức độ hư hỏng.
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
            <Icon name="info" size={16} className="text-[#C9A227] shrink-0 mt-0.5" />
            <span>
              <strong>Thẩm quyền PM:</strong> Chỉ huy trưởng có quyền lập dự thảo, điều chỉnh ngưỡng kỹ thuật và xuất bản chính sách. Khi giao việc cần chọn đúng phiên bản chính sách. Crew đánh giá điều kiện thi công sau khi nhận nhiệm vụ.
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
              title="Lưu bản ghi dự thảo chính sách"
            >
              Lưu dự thảo
            </button>
            <button
              onClick={() => handleApplyPolicy('ACTIVATE')}
              type="button"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              title="Xuất bản chính thức áp dụng toàn tuyến"
            >
              <Icon name="check_circle" size={14} />
              <span>Xuất bản chính sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
