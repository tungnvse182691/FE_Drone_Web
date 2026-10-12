import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl text-left shadow-xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-[#F8F9FA] border-b border-slate-200 p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
              <Icon name="photo_camera" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-headline">
                Yêu cầu bổ sung bằng chứng / Từ chối duyệt phương án
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Mã hạng mục: {activeModalItem.item_code} ({activeModalItem.defect_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="bg-[#F8F9FA] border border-slate-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">
                {activeModalItem.chainage} ({activeModalItem.lane_info})
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{activeModalItem.solution_title}</span>
            </div>
            <span className="font-mono font-bold text-brand-gold">
              Khối lượng: {activeModalItem.volume_display} • Sâu: {activeModalItem.volume_sub}
            </span>
          </div>

          {/* Radio Switch for Technical Action Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-slate-900 block font-headline">
              Loại phản hồi kỹ thuật của Supervisor:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                onClick={() => setModalFeedbackType('EVIDENCE')}
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  modalFeedbackType === 'EVIDENCE'
                    ? 'bg-[#E0F2FE] border-[#0284C7] ring-1 ring-[#0284C7]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'EVIDENCE'}
                  onChange={() => setModalFeedbackType('EVIDENCE')}
                  className="mt-0.5 accent-[#0284C7]"
                />
                <div>
                  <span className="font-bold text-[#0284C7] block">Cần bằng chứng</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Thước đo độ sâu, ảnh lún nứt chi tiết
                  </span>
                </div>
              </label>

              <label
                onClick={() => setModalFeedbackType('RECONSIDER')}
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  modalFeedbackType === 'RECONSIDER'
                    ? 'bg-[#FEF3E2] border-[#F59E0B] ring-1 ring-[#F59E0B]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'RECONSIDER'}
                  onChange={() => setModalFeedbackType('RECONSIDER')}
                  className="mt-0.5 accent-[#F59E0B]"
                />
                <div>
                  <span className="font-bold text-[#F59E0B] block">Xem lại giải pháp</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Điều chỉnh chiều dày hoặc vật liệu móng
                  </span>
                </div>
              </label>

              <label
                onClick={() => setModalFeedbackType('REJECT')}
                className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  modalFeedbackType === 'REJECT'
                    ? 'bg-[#FDECEC] border-[#E5484D] ring-1 ring-[#E5484D]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  checked={modalFeedbackType === 'REJECT'}
                  onChange={() => setModalFeedbackType('REJECT')}
                  className="mt-0.5 accent-[#E5484D]"
                />
                <div>
                  <span className="font-bold text-[#E5484D] block">Từ chối phương án</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Sai quy chuẩn hoặc trùng lặp gói khác
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Technical Explanation Textarea */}
          <div className="space-y-1">
            <label htmlFor="modal-supervisor-notes" className="font-bold text-xs text-slate-900 flex items-center justify-between">
              <span>
                Nội dung giải trình kỹ thuật của Supervisor <span className="text-rose-600">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Gửi trực tiếp đến PM &amp; Đội đo đạc</span>
            </label>
            <textarea
              id="modal-supervisor-notes"
              rows={3}
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-800 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all resize-none shadow-2xs font-normal"
              placeholder="Nhập lý do cụ thể và yêu cầu kỹ thuật chi tiết đối với hạng mục này..."
            />
          </div>

          {/* Specific Field Directives */}
          <div className="space-y-1.5 bg-[#F8F9FA] border border-slate-200 p-3 rounded-lg text-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
              Chỉ thị bổ sung hiện trường:
            </span>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.laser}
                onChange={(e) => setModalDirectives({ ...modalDirectives, laser: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.height}
                onChange={(e) => setModalDirectives({ ...modalDirectives, height: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modalDirectives.close_photo}
                onChange={(e) => setModalDirectives({ ...modalDirectives, close_photo: e.target.checked })}
                className="rounded accent-brand-gold"
              />
              <span>Chụp lại ảnh cận cảnh có đặt thước tỷ lệ chuẩn 50cm</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
          <div className="flex items-center gap-3 bg-[#F8F9FA] border border-slate-200 p-2.5 rounded-lg">
            <img
              src={activeModalItem.image_url}
              alt={activeModalItem.defect_title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
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
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 transition shrink-0 cursor-pointer"
            >
              Xem ảnh gốc
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-lg font-medium text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSubmit}
            type="button"
            className={`px-4 py-1.5 text-white transition rounded-lg font-medium text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer ${
              modalFeedbackType === 'REJECT'
                ? 'bg-[#E5484D] hover:bg-rose-700'
                : 'bg-brand-gold hover:bg-brand-goldMuted'
            }`}
          >
            <Icon name="send" size={14} />
            <span>Xác nhận gửi quyết định</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DecisionModal
