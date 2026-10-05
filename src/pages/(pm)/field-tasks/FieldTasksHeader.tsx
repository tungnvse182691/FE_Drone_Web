import React from 'react'
import {
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Ruler,
  HardDriveDownload,
  Split,
  AlertTriangle,
  Smartphone
} from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SyncConflictItem, FieldTask } from '../../../types/domain'

export interface FieldTasksHeaderProps {
  isSupervisor: boolean
  isPM: boolean
  activeTab: 'CONFLICTS' | 'MEASUREMENTS'
  setActiveTab: (tab: 'CONFLICTS' | 'MEASUREMENTS') => void
  conflicts: SyncConflictItem[]
  fieldTasks: FieldTask[]
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
  handleResetData: () => void
}

export const FieldTasksHeader: React.FC<FieldTasksHeaderProps> = ({
  isSupervisor,
  isPM: _isPM,
  activeTab,
  setActiveTab,
  conflicts,
  fieldTasks,
  stats,
  handleResetData
}) => {
  return (
    <>
      {/* 1. BREADCRUMB & METADATA OVERLINE */}
      <nav aria-label="Đường dẫn trang" className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <a href="#/pm/dashboard" className="hover:text-slate-800 transition-colors">
          Trang chủ
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Ngoại tuyến &amp; Đo đạc</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">Xung đột đồng bộ &amp; Nhiệm vụ hiện trường</span>
      </nav>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-sansation text-brand-dark tracking-tight">
              Trung Tâm Xử Lý Xung Đột &amp; Đo Đạc Bổ Sung
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-100 text-purple-800 border border-purple-300">
              WF-15 / FR-22 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dự án: <strong className="text-slate-800">QL1A - Giai đoạn 2 (PRJ-QL1A-02 • Km 1024 - Km 1045)</strong>. Tiếp
            nhận, đối soát dữ liệu đo đạc &amp; thi công gửi muộn từ hiện trường theo quy tắc{' '}
            <strong className="text-slate-700">D05/Q04</strong> và cứu dữ liệu thiết bị hỏng{' '}
            <strong className="text-slate-700">Q17/D06/42A</strong>.
          </p>
        </div>

        {/* Action & Role Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              isSupervisor
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSupervisor
                ? 'Chế độ Giám Sát (Kiểm tra & Phê duyệt cứu hộ thiết bị)'
                : 'Chế độ Chỉ Huy Trưởng PM (Thẩm quyền phân giải nghiệp vụ)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Khôi phục dữ liệu ban đầu để test lại"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Reset Data Test</span>
          </button>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('CONFLICTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer font-sansation ${
            activeTab === 'CONFLICTS'
              ? 'border-[#C9A227] text-[#C9A227] bg-[#FBF6E9]/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hàng Đợi Xử Lý Xung Đột Ngoại Tuyến ({stats.pending} ca chờ)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MEASUREMENTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer font-sansation ${
            activeTab === 'MEASUREMENTS'
              ? 'border-[#C9A227] text-[#C9A227] bg-[#FBF6E9]/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Nhật Ký Nhiệm Vụ Đo Đạc Hiện Trường ({fieldTasks.length} nhiệm vụ)</span>
        </button>
      </div>

      {/* KPI & BANNER SECTION (ONLY IN CONFLICTS TAB) */}
      {activeTab === 'CONFLICTS' && (
        <div className="space-y-4">
          {/* BANNER GIÁM SÁT TIẾN TRÌNH OFFLINE BATCH SYNC */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2E5E9] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C9A227]"></div>
            <div className="flex items-start md:items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] text-[#C9A227] flex items-center justify-center shrink-0 shadow-2xs">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    HTTP 200 IDEMPOTENT SYNC
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    HÀNG ĐỢI ĐỒNG BỘ: {conflicts.length} GÓI DỮ LIỆU NGOẠI TUYẾN (QL1A PK-04)
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    {conflicts.length - stats.pending} Đã Phân Giải / ACK
                  </span>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200 animate-pulse">
                    {stats.pending} Xung đột chờ xử lý
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Các gói nhiệm vụ thi công ngoại tuyến tự động kiểm tra xung đột phiên bản máy chủ khi bắt được sóng 4G/Wifi.
                  Toàn bộ dữ liệu được bảo vệ toàn vẹn bằng mã băm SHA-256 theo tiêu chuẩn{' '}
                  <strong className="text-slate-700">TCVN 8819:2011</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-2 lg:pl-0">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Tiêu chuẩn kiểm toán:</span>
                <span className="font-mono text-xs font-bold text-slate-800">BR-15 • BR-19 • D05</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Độ tin cậy vị trí GPS:</span>
                <span className="font-mono text-xs font-bold text-emerald-700">RTK Sub-meter (&lt;1.5m)</span>
              </div>
            </div>
          </div>

          {/* 4 THẺ CHỈ SỐ KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-[#C9A227] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Tổng ca xung đột
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Hàng đợi Conflict</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FBF6E9] text-[#C9A227] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-[#C9A227]">{stats.total}</span>
                <span className="text-xs text-slate-500">hồ sơ ghi nhận</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Đang chờ phân giải:</span>
                <span className="font-bold text-amber-600 font-mono">{stats.pending} ca</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-[#C9A227] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Đổi đội khi ngoại tuyến
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Reassigned (D05)</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Split className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-slate-900">{stats.reassign}</span>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Q04 Rule
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Nguyên tắc:</span>
                <span className="font-medium text-slate-700">Không ghi đè dữ liệu cũ</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-[#C9A227] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Lệch chính sách Fast Track
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Policy Mismatch</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-slate-900">{stats.policyMismatch}</span>
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                  Snapshot Stale
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Xử lý:</span>
                <span className="font-medium text-slate-700">Chuyển thẩm duyệt có Giám sát</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-brand-border relative overflow-hidden group hover:border-[#C9A227] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Cứu dữ liệu thiết bị hỏng
                  </span>
                  <h3 className="text-xl font-bold font-sansation text-slate-900 mt-1">Rescue Data (Q17)</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-sansation text-purple-700">{stats.rescuePending}</span>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                  Cần Sup Ký
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Thẩm quyền:</span>
                <span className="font-bold text-purple-800">D06 / Quyết định 42A</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
