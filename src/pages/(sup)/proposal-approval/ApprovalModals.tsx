import React from 'react'
import {
  Camera,
  X,
  Send,
  Truck,
  CheckCircle2,
  CheckCheck,
  MapPin
} from 'lucide-react'
import { RepairItemDetail } from './types'

export interface ApprovalModalsProps {
  activeModalItem: RepairItemDetail | null
  onCloseDecisionModal: () => void
  modalFeedbackType: 'EVIDENCE' | 'RECONSIDER' | 'REJECT'
  setModalFeedbackType: (type: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => void
  modalNotes: string
  setModalNotes: (notes: string) => void
  modalDirectives: { [key: string]: boolean }
  setModalDirectives: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
  onSubmitDecisionModal: () => void
  onViewPhoto: (item: RepairItemDetail) => void

  isDispatchModalOpen: boolean
  onCloseDispatchModal: () => void
  packageCode: string
  items: RepairItemDetail[]
  stats: {
    total: number
    approved: number
    evidence: number
    reconsider: number
    rejected: number
    pending: number
    percent: number
    approvedArea: number
    totalProposedArea: number
  }
  dispatchDeadline: string
  setDispatchDeadline: (dl: string) => void
  dispatchNotice: string
  setDispatchNotice: (notice: string) => void
  onConfirmDispatch: () => void

  isBatchApproveConfirmOpen: boolean
  onCloseBatchApproveConfirm: () => void
  onBatchApproveAll: () => void

  viewingPhotoItem: RepairItemDetail | null
  onCloseViewingPhoto: () => void
}

export const ApprovalModals: React.FC<ApprovalModalsProps> = ({
  activeModalItem,
  onCloseDecisionModal,
  modalFeedbackType,
  setModalFeedbackType,
  modalNotes,
  setModalNotes,
  modalDirectives,
  setModalDirectives,
  onSubmitDecisionModal,
  onViewPhoto,

  isDispatchModalOpen,
  onCloseDispatchModal,
  packageCode,
  items,
  stats,
  dispatchDeadline,
  setDispatchDeadline,
  dispatchNotice,
  setDispatchNotice,
  onConfirmDispatch,

  isBatchApproveConfirmOpen,
  onCloseBatchApproveConfirm,
  onBatchApproveAll,

  viewingPhotoItem,
  onCloseViewingPhoto
}) => {
  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST EVIDENCE / RECONSIDER / REJECTION MODAL                  */}
      {/* ========================================================================= */}
      {activeModalItem && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={onCloseDecisionModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="bg-[#F8F9FA] border-b border-[#E2E5E9] p-5 flex items-start justify-between">
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
                onClick={onCloseDecisionModal}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-[#F8F9FA] border border-[#E2E5E9] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
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
                        ? 'bg-[#FEF9E7] border-[#C9A227] ring-1 ring-[#C9A227]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-type"
                      checked={modalFeedbackType === 'EVIDENCE'}
                      onChange={() => setModalFeedbackType('EVIDENCE')}
                      className="mt-0.5 accent-[#C9A227]"
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
                  className="w-full rounded-xl bg-white border border-[#E2E5E9] text-slate-800 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A227] transition-all resize-none shadow-2xs font-medium"
                  placeholder="Nhập lý do cụ thể và yêu cầu kỹ thuật chi tiết đối với hạng mục này..."
                />
              </div>

              {/* Specific Field Directives */}
              <div className="space-y-2 bg-[#F8F9FA] border border-[#E2E5E9] p-3.5 rounded-xl text-xs">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Chỉ thị bổ sung hiện trường:
                </span>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.laser}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, laser: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Yêu cầu đo đạc lại hiện trường bằng máy laser thủy bình hoặc thước 3m</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.height}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, height: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Yêu cầu đo đạc lại cao độ trắc dọc và bề dày lớp móng cấp phối đá dăm</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.close_photo}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, close_photo: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Chụp lại ảnh cận cảnh có đặt thước tỷ lệ chuẩn 50cm</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDirectives.core_sample}
                    onChange={(e) => setModalDirectives({ ...modalDirectives, core_sample: e.target.checked })}
                    className="rounded accent-[#C9A227]"
                  />
                  <span>Khoan mẫu kiểm tra độ chặt lớp móng K98</span>
                </label>
              </div>

              {/* Visual Evidence Preview Thumbnail */}
              <div className="flex items-center gap-3 bg-[#F8F9FA] border border-[#E2E5E9] p-2.5 rounded-xl">
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
                  className="px-3 py-1.5 bg-white border border-[#E2E5E9] text-[#92700C] rounded-lg text-xs font-bold font-sansation hover:bg-slate-50 transition shrink-0 cursor-pointer"
                >
                  Xem ảnh gốc
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={onCloseDecisionModal}
                type="button"
                className="px-4 h-9 bg-white border border-[#E2E5E9] text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onSubmitDecisionModal}
                type="button"
                className={`px-5 h-9 text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer ${
                  modalFeedbackType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#C9A227] hover:bg-[#B38E1F]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Xác nhận gửi quyết định</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DISPATCH WORK ORDER MODAL                                        */}
      {/* ========================================================================= */}
      {isDispatchModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={onCloseDispatchModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="bg-[#F8F9FA] border-b border-[#E2E5E9] p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-sansation">
                    Ban hành Lệnh công tác thi công (Work Order Dispatch)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Gói: {packageCode} • {stats.approved} hạng mục đã có quyết định APPROVED
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseDispatchModal}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 leading-relaxed">
                <strong>Điều kiện bàn giao hợp lệ:</strong> Toàn bộ {stats.approved} hạng mục dưới đây đã được
                Supervisor phê duyệt chính thức giải pháp kỹ thuật và khối lượng. Các hạng mục chưa đạt (
                {stats.total - stats.approved}) sẽ được tiếp tục giải trình ở đợt sau.
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Danh sách hạng mục bàn giao xuất quân:
                </span>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {items
                    .filter((i) => i.status === 'APPROVED')
                    .map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono font-bold text-slate-800">{item.item_code}</span>
                          <span className="text-slate-500">({item.chainage})</span>
                          <span className="text-slate-700 font-medium truncate max-w-xs">{item.defect_title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#92700C]">{item.volume_display}</span>
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-semibold">
                            {item.assigned_crew}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Thời hạn hoàn thành thi công (Deadline):</label>
                  <input
                    type="text"
                    value={dispatchDeadline}
                    onChange={(e) => setDispatchDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Người phát lệnh (PM / Điều phối):</label>
                  <input
                    type="text"
                    disabled
                    value="Kỹ sư Đỗ Quốc Hoàng (Project Manager)"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Chỉ dẫn an toàn giao thông &amp; tổ chức phân luồng:
                </label>
                <textarea
                  rows={3}
                  value={dispatchNotice}
                  onChange={(e) => setDispatchNotice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A227] resize-none font-medium"
                />
              </div>
            </div>

            <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={onCloseDispatchModal}
                type="button"
                className="px-4 h-9 bg-white border border-[#E2E5E9] text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onConfirmDispatch}
                type="button"
                className="px-5 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh xuất quân (Dispatch)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BATCH APPROVE ALL CONFIRMATION MODAL                            */}
      {/* ========================================================================= */}
      {isBatchApproveConfirmOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={onCloseBatchApproveConfirm}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-md overflow-hidden z-10 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-900 font-sansation">Phê duyệt nhanh tất cả mục hợp lệ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn phê duyệt thông qua toàn bộ các hạng mục chưa duyệt trong gói{' '}
                <strong className="text-slate-900">{packageCode}</strong>? Sau khi duyệt, PM có quyền phát lệnh thi công
                ngay cho hiện trường.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Số hạng mục sẽ chuyển APPROVED:</span>
                <span className="font-bold text-slate-900">{stats.total - stats.approved} mục</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng diện tích thi công hoàn tất:</span>
                <span className="font-mono font-bold text-[#92700C]">{stats.totalProposedArea} m²</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={onCloseBatchApproveConfirm}
                type="button"
                className="w-1/2 h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onBatchApproveAll}
                type="button"
                className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                Xác nhận phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DEFECT ORIGINAL PHOTO & EXIF LIGHTBOX MODAL                     */}
      {/* ========================================================================= */}
      {viewingPhotoItem && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={onCloseViewingPhoto}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          ></div>

          <div className="relative bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full z-10 border border-slate-700 max-h-[95vh] flex flex-col">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#C9A227]">{viewingPhotoItem.item_code}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-sm">{viewingPhotoItem.defect_title}</span>
                <span className="text-xs text-slate-400 font-mono">({viewingPhotoItem.chainage})</span>
              </div>
              <button
                onClick={onCloseViewingPhoto}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[380px] max-h-[550px]">
              <img
                src={viewingPhotoItem.image_url}
                alt={viewingPhotoItem.defect_title}
                className="max-h-full max-w-full object-contain"
              />

              <div className="absolute top-1/4 left-1/3 w-40 h-28 border-2 border-[#C9A227] bg-[#C9A227]/20 rounded-md pointer-events-none">
                <span className="absolute -top-6 left-0 bg-[#C9A227] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                  {viewingPhotoItem.defect_measurements}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A227]" /> GPS: {viewingPhotoItem.gps_coords}
                </span>
                <span>File: {viewingPhotoItem.ortho_code}</span>
                <span>Độ phân giải: {viewingPhotoItem.resolution}</span>
              </div>
              <button
                onClick={onCloseViewingPhoto}
                className="px-4 py-1.5 bg-[#C9A227] text-white font-bold rounded-xl text-xs hover:bg-[#B38E1F] transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
