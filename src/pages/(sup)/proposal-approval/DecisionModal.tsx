import React from 'react'
import {
  Camera,
  X,
  Send
} from 'lucide-react'
import { RepairItemDetail } from './types'

export interface DecisionModalProps {
  activeModalItem: RepairItemDetail | null
  onClose: () => void
  modalFeedbackType: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  setModalFeedbackType: (type: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => void
  modalNotes: string
  setModalNotes: (notes: string) => void
  modalDirectives: { [key: string]: boolean }
  setModalDirectives: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  onSubmit: () => void
  onViewPhoto: (item: RepairItemDetail) => void
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  activeModalItem,
  onClose,
  modalFeedbackType,
  setModalFeedbackType,
  modalNotes,
  setModalNotes,
  modalDirectives,
  setModalDirectives,
  onSubmit,
  onViewPhoto
}) => {
  if (!activeModalItem) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-brand-border rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-brand-surfaceAlt border-b border-brand-border p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92700C] flex items-center justify-center shrink-0 shadow-2xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-sansation">
                Yêu cầu bổ sung bằng chứng / Từ chối duyệt phương án
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Mã hạng mục: {activeModalItem.item_code} ({activeModalItem.defect_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="bg-brand-surfaceAlt border border-brand-border p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">
                {activeModalItem.chainage} ({activeModalItem.lane_info})
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{activeModalItem.solution_title}</span>
            </div>
            <span className="font-mono font-bold text-[#92700C]">
              Diện tích: {activeModalItem.volume_display} • Sâu: {activeModalItem.volume_sub}
            </span>
          </div>

          {/* Radio Switch for Technical Action Type */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-slate-900 block font-sansation">
              Loại phản hồi kỹ thuật của Supervisor:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setModalFeedbackType('EVIDENCE')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  modalFeedbackType === 'EVIDENCE'
                    ? 'bg-[#FEF9E7] border-brand-gold ring-1 ring-brand-gold'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'EVIDENCE'}
                  onChange={() => setModalFeedbackType('EVIDENCE')}
                  className="mt-0.5 accent-brand-gold"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#92700C] block">Cần bằng chứng</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Thước đo độ sâu, ảnh lún nứt chi tiết
                  </span>
                </div>
              </label>

              <label
                onClick={() => setModalFeedbackType('RECONSIDER')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  modalFeedbackType === 'RECONSIDER'
                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'RECONSIDER'}
                  onChange={() => setModalFeedbackType('RECONSIDER')}
                  className="mt-0.5 accent-amber-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-amber-800 block">Xem lại giải pháp</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Điều chỉnh chiều dày hoặc vật liệu móng
                  </span>
                </div>
              </label>

              <label
                onClick={() => setModalFeedbackType('REJECT')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  modalFeedbackType === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'REJECT'}
                  onChange={() => setModalFeedbackType('REJECT')}
                  className="mt-0.5 text-rose-600 accent-rose-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-rose-700 block">Từ chối phương án</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Sai quy chuẩn hoặc trùng lặp gói khác
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Technical Explanation Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="modal-supervisor-notes" className="font-bold text-xs text-slate-900 flex items-center justify-between">
              <span>
                Nội dung giải trình kỹ thuật của Supervisor <span className="text-rose-600">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Gửi trực tiếp đến PM &amp; Đội đo đạc</span>
            </label>
            <textarea
              id="modal-supervisor-notes"
              rows={4}
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              className="w-full rounded-xl bg-white border border-brand-border text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all resize-none shadow-2xs font-medium"
              placeholder="Nhập lý do cụ thể và yêu cầu kỹ thuật chi tiết đối với hạng mục này..."
            />
          </div>

          {/* Specific Field Directives */}
          <div className="space-y-2 bg-brand-surfaceAlt border border-brand-border p-3.5 rounded-xl text-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
              Chỉ thị bổ sung hiện trường:
            </span>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.laser}
                onChange={(e) => setModalDirectives({ ...modalDirectives, laser: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m</span>
            </label>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.height}
                onChange={(e) => setModalDirectives({ ...modalDirectives, height: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm</span>
            </label>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.close_photo}
                onChange={(e) => setModalDirectives({ ...modalDirectives, close_photo: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Chụp lại ảnh cận cảnh có đặt thước tỷ lệ chuẩn 50cm</span>
            </label>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.core_sample}
                onChange={(e) => setModalDirectives({ ...modalDirectives, core_sample: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Khoan mẫu kiểm tra độ chặt lớp móng K98</span>
            </label>
          </div>

          {/* Visual Evidence Preview Thumbnail */}
          <div className="flex items-center gap-3 bg-brand-surfaceAlt border border-brand-border p-2.5 rounded-xl">
            <img
              src={activeModalItem.image_url}
              alt={activeModalItem.defect_title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0 text-xs">
              <span className="font-semibold text-slate-900 block truncate font-mono">
                {activeModalItem.ortho_code}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Tọa độ: {activeModalItem.gps_coords} • {activeModalItem.resolution}
              </span>
            </div>
            <button
              onClick={() => onViewPhoto(activeModalItem)}
              type="button"
              className="px-3 py-1.5 bg-white border border-brand-border text-[#92700C] rounded-lg text-xs font-bold font-sansation hover:bg-slate-50 transition shrink-0 cursor-pointer"
            >
              Xem ảnh gốc
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-brand-surfaceAlt border-t border-brand-border px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-4 h-9 bg-white border border-brand-border text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSubmit}
            type="button"
            className={`px-5 h-9 text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer ${
              modalFeedbackType === 'REJECT'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-gold hover:bg-[#B38E1F]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Xác nhận gửi quyết định</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default DecisionModal
