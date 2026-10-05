import React from 'react'
import {
  Plus,
  X,
  FileCheck2,
  Send,
  SlidersHorizontal,
  FileText,
  Check,
  Wrench,
  Sparkles,
} from 'lucide-react'
import type { ProposalWorkPackage, UnassignedDefectItem, RouteSegmentOption } from './types'

interface ProposalModalsProps {
  // Create Modal
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

  // PDF Preview Modal
  isPDFPreviewModalOpen: boolean
  setIsPDFPreviewModalOpen: (open: boolean) => void
  packages: ProposalWorkPackage[]
  showToast: (msg: string) => void

  // Detail Modal
  selectedPackageForDetail: ProposalWorkPackage | null
  setSelectedPackageForDetail: React.Dispatch<React.SetStateAction<ProposalWorkPackage | null>>
  isSupervisor: boolean
  isPM: boolean
  handleQuickApprove: (id: string, code: string) => void
  handleSubmitDraftPackage: (id: string, code: string) => void
}

export const ProposalModals: React.FC<ProposalModalsProps> = ({
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
  currentSegment,
  currentRoute,
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
  isPDFPreviewModalOpen,
  setIsPDFPreviewModalOpen,
  packages,
  showToast,
  selectedPackageForDetail,
  setSelectedPackageForDetail,
  isSupervisor,
  isPM,
  handleQuickApprove,
  handleSubmitDraftPackage,
}) => {
  return (
    <>
      {/* 1. MODAL: KHỞI TẠO GÓI ĐỀ XUẤT SỬA CHỮA KỸ THUẬT MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227] shrink-0">
                  <Plus className="w-5 h-5 text-[#C9A227]" />
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

            {/* Modal Body (Scrollable Form) */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              {/* Tuyến đường & Phân đoạn lý trình (Phân cấp) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Dự án / Tuyến đường <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRouteId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    {availableRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Phạm vi lý trình / Phân đoạn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSegmentId}
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    {currentRouteSegments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.code}: {seg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Đơn vị thi công & Thời gian thi công */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Đơn vị thi công dự kiến <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formContractor}
                    onChange={(e) => setFormContractor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    <option value="Đội thi công sửa chữa Hoàng Hải 01">
                      Đội thi công sửa chữa Hoàng Hải 01
                    </option>
                    <option value="Tổ rải thảm nóng Polime 02 - Xí nghiệp Cầu Đường 4">
                      Tổ rải thảm nóng Polime 02 - Xí nghiệp Cầu Đường 4
                    </option>
                    <option value="Đội cơ động khắc phục sự cố khẩn cấp Sơn Trà">
                      Đội cơ động khắc phục sự cố khẩn cấp Sơn Trà
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Thời gian thi công dự kiến
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(parseInt(e.target.value, 10) || 1)}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">ngày kể từ khi được duyệt</span>
                  </div>
                </div>
              </div>

              {/* Danh sách khiếm khuyết chưa gán gói */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Chọn khiếm khuyết đưa vào gói (Unassigned Open Defects)
                  </label>
                  <span className="text-[11px] text-slate-600 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Đoạn {currentSegment?.code} ({currentRoute?.code}) có {unassignedDefects.length} điểm tồn đọng
                  </span>
                </div>

                {unassignedDefects.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
                    Phân đoạn này hiện không có khiếm khuyết tồn đọng nào cần lập gói sửa chữa.
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-2.5 space-y-2 border border-slate-200">
                    {unassignedDefects.map((def) => (
                      <label
                        key={def.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          def.selected
                            ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={def.selected}
                            onChange={() => handleToggleDefect(def.id)}
                            className="w-4 h-4 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#8F7212]">{def.code}</span>
                              <span className="font-semibold text-brand-dark truncate">{def.title}</span>
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                                {def.stationing}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5">{def.lane_detail}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 shrink-0 ml-3 bg-slate-100 px-2 py-0.5 rounded">
                          {def.area_m2} m² (Sâu {def.depth_cm}cm)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* KHỐI NHẬP PHƯƠNG ÁN KỸ THUẬT SỬA CHỮA (SPEC V2.2 - methodDescription DO PM SOẠN THẢO) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Phương án kỹ thuật sửa chữa tổng quát <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                    Chỉ huy trưởng (PM) soạn thảo • Trình Giám sát duyệt (WF-07)
                  </span>
                </div>

                {/* Các nút gợi ý phương án nhanh */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C9A227]" /> Gợi ý nhanh:
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
                    ⚡ Cào bóc &amp; thảm BTN
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
                    ⚡ Xẻ rãnh rót Mastic
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
                    ⚡ Vá dặm Carboncor
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
                    ⚡ Bù lún vệt bánh xe
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
                  placeholder="Nhập phương án sửa chữa kỹ thuật tổng quát cho các khiếm khuyết được chọn (Ví dụ: Cào bóc 5cm & thảm lại BTN C12.5, hoặc Xẻ rãnh thổi bụi và rót mastic chèn khe...)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] leading-relaxed"
                />
              </div>

              {/* Summary Technical Scope Calculation Box */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-amber-950">Tổng kết kỹ thuật tự động</span>
                    <span className="text-[11px] text-amber-900">
                      Đã chọn: <strong>{modalCalculations.count} hạng mục khiếm khuyết</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Khối lượng thi công ước tính</span>
                  <span className="font-mono text-base font-black text-[#8F7212]">
                    {modalCalculations.description}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Bóc tách theo phương án kỹ thuật</span>
                </div>
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
                className="px-5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Khóa &amp; Trình duyệt ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: XUẤT KẾ HOẠCH KỸ THUẬT PDF PREVIEW */}
      {isPDFPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base text-brand-dark">Kế Hoạch Sửa Chữa Kỹ Thuật (PDF)</h3>
              </div>
              <button
                onClick={() => setIsPDFPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-800">CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG HOÀNG HẢI</div>
              <div className="text-slate-600">Ban Điều Hành Dự Án Bảo Trì Quốc Lộ 1A (PK-04)</div>
              <div className="font-mono text-[11px] text-slate-500">Mã văn bản: KH-2026/QL1A-PK04-O&amp;M</div>
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                Tập hợp tổng hợp <strong>{packages.length} gói đề xuất kỹ thuật</strong> với tổng số{' '}
                <strong className="text-brand-dark font-mono">
                  {packages.reduce((sum, p) => sum + p.defect_count, 0)} hạng mục khiếm khuyết
                </strong>{' '}
                được lập phương án thi công trên toàn tuyến.
              </div>
              <div className="text-[11px] text-slate-500">
                • Trạng thái hồ sơ: Đã đồng bộ với máy chủ O&amp;M Hoàng Hải
                <br />
                • Tiêu chuẩn nghiệm thu: TCVN 8819:2011 &amp; QCVN 41:2019/BGTVT
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPDFPreviewModalOpen(false)}
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsPDFPreviewModalOpen(false)
                  showToast('Đang tạo và tải xuống file PDF: Ke_hoach_ky_thuat_QL1A_PK04.pdf')
                }}
                type="button"
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Tải xuống file PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CHI TIẾT HỒ SƠ GÓI ĐỀ XUẤT KỸ THUẬT */}
      {selectedPackageForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header chi tiết */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0 ${
                    selectedPackageForDetail.status === 'SUBMITTED'
                      ? 'bg-[#C9A227] text-white'
                      : selectedPackageForDetail.status === 'DECIDED'
                      ? 'bg-emerald-600 text-white'
                      : selectedPackageForDetail.status === 'DISPATCHED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {selectedPackageForDetail.code.split('-').pop()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                      {selectedPackageForDetail.code}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedPackageForDetail.status === 'SUBMITTED'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedPackageForDetail.status === 'DECIDED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPackageForDetail.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {selectedPackageForDetail.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Snapshot: v1.0 (Immutable)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-dark mt-1">
                    {selectedPackageForDetail.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>Tuyến: <strong className="text-slate-700">{selectedPackageForDetail.route_name}</strong></span>
                    <span>•</span>
                    <span>Phạm vi: <strong className="text-slate-700 font-mono">{selectedPackageForDetail.chainage_display}</strong></span>
                    <span>•</span>
                    <span>Nhà thầu: <strong className="text-slate-700">{selectedPackageForDetail.contractor_name}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPackageForDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: Danh sách các RepairItems */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Số lượng khiếm khuyết</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {selectedPackageForDetail.defect_count} hạng mục
                  </span>
                  <span className="text-[11px] text-slate-500">{selectedPackageForDetail.defect_summary}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Khối lượng kỹ thuật dự toán</span>
                  <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
                    {selectedPackageForDetail.technical_scope}
                  </span>
                  <span className="text-[11px] text-slate-500">{selectedPackageForDetail.material_scope}</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-900 font-medium block">Thời hạn &amp; Tiến độ kế hoạch</span>
                  <span className="text-lg font-mono font-black text-[#8F7212] mt-0.5 block">
                    {selectedPackageForDetail.duration_days} ngày thi công
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Kế hoạch: {selectedPackageForDetail.date_range}
                  </span>
                </div>
              </div>

              {/* Phương án kỹ thuật sửa chữa tổng quát của gói (Do PM nhập) */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Phương án kỹ thuật sửa chữa tổng quát (PM đề xuất):</span>
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded font-mono border border-slate-200">
                    methodDescription
                  </span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed font-medium">
                  {selectedPackageForDetail.technical_method ||
                    'Cào bóc xử lý hư hỏng theo quy trình bảo trì mặt đường'}
                </p>
                <div className="text-[11px] text-slate-600 pt-1.5 border-t border-amber-200/60 flex items-center gap-3 flex-wrap">
                  <span>Quy mô: <strong className="text-slate-800">{selectedPackageForDetail.technical_scope}</strong></span>
                </div>
              </div>

              {/* Danh sách RepairItems chi tiết */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-brand-dark">
                    Danh sách hạng mục sửa chữa chi tiết (RepairItems - {selectedPackageForDetail.defect_count})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tiến độ thẩm định: {selectedPackageForDetail.approved_items}/{selectedPackageForDetail.total_items} mục đạt
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  <div className="p-3 bg-slate-50/70 flex items-center justify-between gap-3 text-slate-600 font-semibold text-[11px]">
                    <span className="w-24">Mã hư hỏng</span>
                    <span className="w-32">Lý trình / Vị trí</span>
                    <span className="flex-1">Phương án kỹ thuật &amp; Vật tư</span>
                    <span className="w-32 text-right">Khối lượng &amp; Quy cách</span>
                    <span className="w-24 text-right">Trạng thái</span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-102</span>
                    <span className="w-32 font-mono text-slate-600">Km 1029+200 (Làn phải)</span>
                    <span className="flex-1 text-slate-700">Cào bóc 5cm, trám thảm BTN C19 lu lèn tiêu chuẩn</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">0.45 m² (Sâu 5.2cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        APPROVED
                      </span>
                    </span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-105</span>
                    <span className="w-32 font-mono text-slate-600">Km 1029+800 (Tim đường)</span>
                    <span className="flex-1 text-slate-700">Xẻ rãnh làm sạch, thổi bụi và rót nhựa mastic polymer</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">0.85 m² (Sâu 3.1cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        APPROVED
                      </span>
                    </span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-108</span>
                    <span className="w-32 font-mono text-slate-600">Km 1030+150 (Vệt bánh)</span>
                    <span className="flex-1 text-slate-700">Cào bóc sâu 4.5cm, bù vênh đá dăm lu lèn lớp mặt C19</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">1.25 m² (Sâu 4.5cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer hành động theo vai trò */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Người lập: <strong className="text-slate-800">{selectedPackageForDetail.created_by_name}</strong> •{' '}
                {selectedPackageForDetail.created_at}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPackageForDetail(null)}
                  type="button"
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Đóng
                </button>

                {/* Nếu Supervisor và gói đang SUBMITTED */}
                {isSupervisor && selectedPackageForDetail.status === 'SUBMITTED' && (
                  <button
                    onClick={() => {
                      handleQuickApprove(selectedPackageForDetail.id, selectedPackageForDetail.code)
                      setSelectedPackageForDetail((prev) =>
                        prev
                          ? { ...prev, status: 'DECIDED', status_label: 'Đã phê duyệt', approved_items: prev.total_items }
                          : null
                      )
                    }}
                    type="button"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Phê duyệt chính thức gói</span>
                  </button>
                )}

                {/* Nếu PM và gói đang DRAFT */}
                {isPM && selectedPackageForDetail.status === 'DRAFT' && (
                  <button
                    onClick={() => {
                      handleSubmitDraftPackage(selectedPackageForDetail.id, selectedPackageForDetail.code)
                      setSelectedPackageForDetail((prev) =>
                        prev ? { ...prev, status: 'SUBMITTED', status_label: 'Chờ duyệt' } : null
                      )
                    }}
                    type="button"
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Khóa &amp; Trình duyệt gói</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
