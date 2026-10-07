import React from 'react'
import { Plus, X, Send, Wrench, Sparkles } from 'lucide-react'
import type { RouteSegmentOption, UnassignedDefectItem } from './types'
import { ProposalBOQCard } from './ProposalBOQCard'

export interface CreateProposalModalProps {
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  formPackageName: string
  setFormPackageName: (name: string) => void
  formRouteId: string
  handleRouteChange: (routeId: string) => void
  availableRoutes: { id: string; name: string; code: string }[]
  formSegmentId: string
  handleSegmentChange: (segId: string) => void
  currentRouteSegments: RouteSegmentOption[]
  currentSegment: RouteSegmentOption | undefined
  currentRoute: { id: string; name: string; code: string } | undefined
  formContractor: string
  setFormContractor: (c: string) => void
  formDurationDays: number
  setFormDurationDays: (d: number) => void
  formTechnicalMethod: string
  setFormTechnicalMethod: (method: string) => void
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  modalCalculations: { count: number; description: string }
  handleSaveDraft: (andSubmit: boolean) => void
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formPackageName,
  setFormPackageName,
  formRouteId,
  handleRouteChange,
  availableRoutes,
  formSegmentId,
  handleSegmentChange,
  currentRouteSegments,
  currentSegment: _currentSegment,
  currentRoute: _currentRoute,
  formContractor,
  setFormContractor,
  formDurationDays,
  setFormDurationDays,
  formTechnicalMethod,
  setFormTechnicalMethod,
  unassignedDefects,
  handleToggleDefect,
  modalCalculations,
  handleSaveDraft,
}) => {
  if (!isCreateModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <Plus className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Khởi tạo gói đề xuất sửa chữa kỹ thuật mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gom các khiếm khuyết độc lập thành gói thi công tập trung để tối ưu hóa máy móc và nhân lực.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Tên gói */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase text-[11px]">
              Tên gói đề xuất công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formPackageName}
              onChange={(e) => setFormPackageName(e.target.value)}
              placeholder="Ví dụ: Xử lý ổ gà và trám nứt mặt đường đoạn Km 1028 - Km 1033..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          {/* Chọn Tuyến đường & Phân đoạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Tuyến đường phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={formRouteId}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                {availableRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Phân đoạn lý trình <span className="text-rose-500">*</span>
              </label>
              <select
                value={formSegmentId}
                onChange={(e) => handleSegmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                {currentRouteSegments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tổ đội thi công & Thời gian dự kiến */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Đơn vị thi công dự kiến <span className="text-rose-500">*</span>
              </label>
              <select
                value={formContractor}
                onChange={(e) => setFormContractor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                <option value="Tổ vá dặm cơ giới 01">Tổ vá dặm cơ giới 01 (Hoàng Hải)</option>
                <option value="Xí nghiệp Cầu Đường 4">Xí nghiệp Cầu Đường 4</option>
                <option value="Tổ duy tu bảo dưỡng đường bộ 03">Tổ duy tu bảo dưỡng đường bộ 03</option>
                <option value="Đội cơ động">Đội cơ động khắc phục sự cố khẩn cấp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Thời gian thi công dự kiến (ngày) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          {/* Danh sách khiếm khuyết & Khối lượng kỹ thuật */}
          <ProposalBOQCard
            unassignedDefects={unassignedDefects}
            handleToggleDefect={handleToggleDefect}
            modalCalculations={modalCalculations}
          />

          {/* Phương án kỹ thuật sửa chữa tổng quát */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-gold" />
                <span>Phương án kỹ thuật sửa chữa tổng quát <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                Chỉ huy trưởng (PM) soạn thảo • Trình Giám sát duyệt (WF-07)
              </span>
            </div>

            {/* Các nút gợi ý phương án nhanh */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-gold" /> Gợi ý nhanh:
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Cào bóc sâu 5cm theo hình chữ nhật vát cạnh, làm sạch bề mặt, tưới nhựa dính bám và thảm hoàn trả bằng bê tông nhựa nóng C12.5 lu lèn tiêu chuẩn.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                Cào bóc &amp; thảm BTN
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Xẻ rãnh chữ U kích thước 1.5x1.5cm dọc theo tim nứt, làm khô sạch bụi bẩn và bơm chèn kín bằng keo mastic polymer đàn hồi chịu nhiệt.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                Xẻ rãnh rót Mastic
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Đục tẩy vuông thành sắc cạnh, dọn sạch đáy ổ gà, rải đều vật liệu rải nguội Carboncor Asphalt lớp dày 3-4cm đầm nén chặt K95.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                Vá dặm Carboncor
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormTechnicalMethod(
                    'Cào bóc san phẳng vệt hằn lún bánh xe, bù lún bằng lớp bê tông nhựa chặt kết hợp thảm phủ mặt đầm lèn đạt độ chặt K98.'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 hover:text-amber-900 text-slate-700 rounded-lg text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                Bù lún vệt bánh xe
              </button>
              {formTechnicalMethod && (
                <button
                  type="button"
                  onClick={() => setFormTechnicalMethod('')}
                  className="px-2 py-1 text-slate-400 hover:text-rose-600 text-[11px] font-medium transition-colors ml-auto cursor-pointer"
                >
                  Xóa nội dung
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={formTechnicalMethod}
              onChange={(e) => setFormTechnicalMethod(e.target.value)}
              placeholder="Nhập phương án sửa chữa kỹ thuật tổng quát cho các khiếm khuyết được chọn..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => handleSaveDraft(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lưu bản nháp</span>
          </button>
          <button
            onClick={() => handleSaveDraft(true)}
            type="button"
            className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Khóa &amp; Trình duyệt ngay</span>
          </button>
        </div>
      </div>
    </div>
  )
}
