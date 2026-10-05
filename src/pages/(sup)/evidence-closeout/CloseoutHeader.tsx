import React from 'react'
import {
  FileCheck,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileDown,
  RotateCcw,
  UserCheck,
  Share2,
  Lock,
  Send,
  AlertCircle,
  History,
  Layers
} from 'lucide-react'
import { CaseItem } from './types'

export interface CloseoutHeaderProps {
  currentItem: CaseItem
  caseItems: CaseItem[]
  selectedItemId: string
  setSelectedItemId: (id: string) => void
  activeRoleView: 'SUPERVISOR' | 'PROJECT_MANAGER'
  setActiveRoleView: (r: 'SUPERVISOR' | 'PROJECT_MANAGER') => void
  isSupervisorView: boolean
  isPMView: boolean
  basePath: string
  isCaseClosed: boolean
  allItemsAccepted: boolean
  acceptedCount: number
  onOpenExportModal: () => void
  onOpenReworkModal: () => void
  onAcceptItem: () => void
  onPMCloseFastTrack: () => void
  onPMSubmitToSupervisor: () => void
  onOpenPublishModal: () => void
  onOpenCloseCaseModal: () => void
  onNavigateHome: () => void
  onNavigateProposals: () => void
}

export const CloseoutHeader: React.FC<CloseoutHeaderProps> = ({
  currentItem,
  caseItems,
  selectedItemId,
  setSelectedItemId,
  activeRoleView: _activeRoleView,
  setActiveRoleView,
  isSupervisorView,
  isPMView,
  basePath: _basePath,
  isCaseClosed,
  allItemsAccepted,
  acceptedCount,
  onOpenExportModal,
  onOpenReworkModal,
  onAcceptItem,
  onPMCloseFastTrack,
  onPMSubmitToSupervisor,
  onOpenPublishModal,
  onOpenCloseCaseModal,
  onNavigateHome,
  onNavigateProposals
}) => {
  return (
    <>
      {/* TOP CONTEXT BAR & BREADCRUMB */}
      <section className="bg-white border border-[#E2E5E9] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Breadcrumb & Identity */}
          <div className="flex flex-col gap-1.5">
            <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={onNavigateHome}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={onNavigateProposals}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Gói đề xuất sửa chữa
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Nghiệm thu hồ sơ {currentItem.defect_code}</span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sansation">
                Hồ sơ nghiệm thu kỹ thuật: {currentItem.defect_code}
              </h1>
              <span className="font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs">
                {currentItem.chainage}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Dự án: <strong className="text-slate-800">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</strong> • Gói đề xuất: <strong className="text-slate-800">PKG-2026-08</strong> • Hạng mục: <strong className="text-[#92700C]">{currentItem.item_code}</strong> • Phân đoạn: Thừa Thiên Huế - Đà Nẵng
            </p>
          </div>

          {/* Role Switcher Widget (Theo thiết kế chuẩn Stitch 11) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-2xs border border-slate-200" role="tablist">
              <button
                onClick={() => setActiveRoleView('SUPERVISOR')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSupervisorView
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Kỹ sư Giám sát</span>
              </button>
              <button
                onClick={() => setActiveRoleView('PROJECT_MANAGER')}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPMView
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Chỉ huy trưởng (PM)</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Quy trình nghiệm thu</span>
            </div>
          </div>
        </div>

        {/* Status & Policy Indicator Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Track badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-2xs border ${
                currentItem.track_type === 'APPROVAL_TRACK'
                  ? 'bg-purple-100 text-purple-900 border-purple-200'
                  : currentItem.track_type === 'FAST_TRACK'
                  ? 'bg-sky-100 text-sky-900 border-sky-200'
                  : 'bg-rose-100 text-rose-900 border-rose-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Nhánh:{' '}
              {currentItem.track_type === 'APPROVAL_TRACK'
                ? 'Phê duyệt tiêu chuẩn'
                : currentItem.track_type === 'FAST_TRACK'
                ? 'Xử lý cấp bách'
                : 'Điều phối trực tiếp'}
            </span>

            {/* Status badge */}
            {currentItem.status === 'ACCEPTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                TRẠNG THÁI: {currentItem.status_label}
              </span>
            )}
            {currentItem.status === 'PENDING_INSPECTION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                TRẠNG THÁI: {currentItem.status_label}
              </span>
            )}
            {currentItem.status === 'REWORK_REQUIRED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                TRẠNG THÁI: YÊU CẦU SỬA LẠI (REWORK)
              </span>
            )}

            {/* Attempt badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
              <History className="w-3 h-3" />
              Lần thi công: #{currentItem.attempt_number}
            </span>

            {/* SLA badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              SLA Nghiệm thu: Còn 18h
            </span>

            <span className="font-mono text-slate-500 text-[11px] px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs">
              Mã băm SHA-256: 7B8F..A49
            </span>
          </div>

          {/* Dynamic Role Actions Container */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Nút Xuất Hồ Sơ Bằng Chứng RPT-07 */}
            <button
              onClick={onOpenExportModal}
              type="button"
              className="px-3.5 h-9 bg-white border border-[#E2E5E9] hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#C9A227]" />
              <span>Xuất hồ sơ (RPT-07)</span>
            </button>

            {/* SUPERVISOR ACTIONS */}
            {isSupervisorView && (
              <>
                <button
                  onClick={onOpenReworkModal}
                  type="button"
                  className="px-3.5 h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Yêu cầu sửa lại (Rework)</span>
                </button>

                <button
                  onClick={onAcceptItem}
                  disabled={currentItem.status === 'ACCEPTED'}
                  type="button"
                  className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 ${
                    currentItem.status === 'ACCEPTED'
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white hover:opacity-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {currentItem.status === 'ACCEPTED' ? 'Đã nghiệm thu (Ký số)' : 'Chấp thuận nghiệm thu (Ký số)'}
                  </span>
                </button>
              </>
            )}

            {/* PROJECT MANAGER ACTIONS */}
            {isPMView && (
              <>
                {currentItem.track_type === 'FAST_TRACK' ? (
                  <button
                    onClick={onPMCloseFastTrack}
                    disabled={currentItem.status === 'ACCEPTED'}
                    type="button"
                    className={`px-4 h-9 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer ${
                      currentItem.status === 'ACCEPTED'
                        ? 'bg-emerald-700 text-white cursor-default'
                        : 'bg-[#C9A227] hover:bg-[#B38E1F] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {currentItem.status === 'ACCEPTED' ? 'Fast Track đã đóng' : 'Chấp thuận & Đóng lỗi Fast Track'}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onPMSubmitToSupervisor}
                      type="button"
                      className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-purple-700" />
                      <span>Trình Supervisor nghiệm thu</span>
                    </button>

                    {currentItem.status !== 'ACCEPTED' ? (
                      <div className="relative group">
                        <button
                          disabled
                          type="button"
                          className="px-3.5 h-9 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Đợi Giám sát nghiệm thu</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-medium">
                          Hạng mục APPROVAL_TRACK yêu cầu Supervisor duyệt đạt mới được phép công bố cho người dân.
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={onOpenPublishModal}
                        type="button"
                        className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{currentItem.citizen_published ? 'Đã công bố (Cập nhật)' : 'Công bố kết quả (Citizen App)'}</span>
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active Authority Micro-Banner */}
        <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 font-medium">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0" />
          {isSupervisorView ? (
            <span>
              Thẩm quyền: <strong className="text-slate-900">Ban Giám sát độc lập (Supervisor)</strong> — Bắt buộc ký số PKI &amp; kiểm tra các chỉ tiêu kỹ thuật TCVN 8819 (Độ chặt K98, độ phẳng thước 3m) trước khi cho phép đóng gói hoàn công.
            </span>
          ) : (
            <span>
              Thẩm quyền: <strong className="text-slate-900">Project Manager (PM Chỉ huy trưởng)</strong> — Trực tiếp đóng lỗi nhánh Fast Track trong 48h; đối với nhánh Approval Track, PM kiểm tra hiện trường, trình Giám sát duyệt rồi phát hành dữ liệu lên Citizen App.
            </span>
          )}
        </div>
      </section>

      {/* COMPOSITE CASE ALERT (Mixed Case Closeout Banner) */}
      <section className="p-6 bg-white border border-[#E2E5E9] rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#C9A227]" />
              <h3 className="font-bold text-lg text-slate-900 font-sansation">
                Vụ việc phức hợp liên quan: #CASE-2026-0842
              </h3>
              {isCaseClosed ? (
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-2xs">
                  ✓ HỒ SƠ ĐÃ ĐÓNG TỔNG THỂ &amp; LƯU TRỮ PHÁP LÝ
                </span>
              ) : allItemsAccepted ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH {acceptedCount}/{caseItems.length} HẠNG MỤC (ĐỦ ĐIỀU KIỆN ĐÓNG VỤ VIỆC)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
                  ĐÃ HOÀN THÀNH {acceptedCount}/{caseItems.length} HẠNG MỤC
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Phạm vi công trình: Đoạn Km 1024+350 - Km 1024+450 (Gói bảo trì QL1A PKG-2026-08). Nghiệm thu toàn bộ các hạng mục thành phần sẽ cho phép Supervisor bấm Đóng tổng thể vụ việc.
            </p>

            {/* List of items in this case for fast switching */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {caseItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                    selectedItemId === item.id
                      ? 'bg-[#FEF9E7] text-[#92700C] border border-[#FDE68A] shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {item.status === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : item.status === 'REWORK_REQUIRED' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                  <span>
                    {item.item_code}: {item.title} ({item.track_type === 'FAST_TRACK' ? 'Fast Track' : 'Approval'})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Close Composite Case Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            {isSupervisorView ? (
              <button
                onClick={onOpenCloseCaseModal}
                disabled={!allItemsAccepted || isCaseClosed}
                type="button"
                className={`px-4 h-10 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 ${
                  isCaseClosed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : allItemsAccepted
                    ? 'border border-[#C9A227] text-[#92700C] bg-[#FEF9E7] hover:bg-[#FDF0CD] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
                title={
                  !allItemsAccepted
                    ? 'Chặn đóng tổng theo quy tắc CASE_HAS_OPEN_REQUIRED_ITEMS: Phải nghiệm thu 100% hạng mục'
                    : undefined
                }
              >
                <FileCheck className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {isCaseClosed ? 'Vụ việc đã được đóng tổng' : 'Đóng tổng thể vụ việc (Supervisor Closeout)'}
                </span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                * Chỉ Supervisor mới có quyền Đóng tổng thể vụ việc.
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          * Quy tắc kiểm soát Backend v2.2: Nút sẽ tự động vô hiệu hóa nếu còn bất kỳ hạng mục nào dở dang (
          <span className="font-mono text-slate-700 font-bold">CASE_HAS_OPEN_REQUIRED_ITEMS = {!allItemsAccepted ? 'TRUE' : 'FALSE'}</span>
          ).
        </p>
      </section>

    </>
  )
}
