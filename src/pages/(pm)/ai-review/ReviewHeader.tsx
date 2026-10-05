import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Download,
  Link2,
  Users,
  Plane,
  Building2,
} from 'lucide-react'
import type { TriageCase, ViewSourceMode } from './types'

export interface ReviewHeaderProps {
  basePath: string
  isSupervisor: boolean
  viewSourceMode: ViewSourceMode
  setViewSourceMode: (mode: ViewSourceMode) => void
  cases: TriageCase[]
  unassignedCitizenCount: number
  pendingCount: number
  citizenCount: number
  droneAICount: number
  selectedReportIds: string[]
  setSelectedReportIds: React.Dispatch<React.SetStateAction<string[]>>
  selectedCase: TriageCase
  onOpenLinkReportsModal: () => void
  onNavigateFastTrack: (c: TriageCase) => void
  showToast: (msg: string) => void
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  basePath,
  isSupervisor,
  viewSourceMode,
  setViewSourceMode,
  cases,
  unassignedCitizenCount,
  pendingCount,
  citizenCount,
  droneAICount,
  selectedReportIds,
  setSelectedReportIds,
  selectedCase,
  onOpenLinkReportsModal,
  onNavigateFastTrack,
  showToast,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/dashboard`)}>
            Trang chủ
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-brand-dark cursor-pointer" onClick={() => navigate(`${basePath}/surveys`)}>
            Khiếm khuyết
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-[#8F7212]">Hộp thư tiếp nhận (Triage WF-04)</span>
        </nav>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Đồng bộ cảm biến GIS thời gian thực: 25/08/2026 21:45</span>
        </div>
      </div>

      {/* Page Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              {viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'Bảng Tiếp Nhận & Điều Phối Phản Ánh Người Dân (PA03, PA04)'
                : viewSourceMode === 'DRONE_AI'
                ? 'Hộp Thư Tiếp Nhận & Thẩm Định Lỗi Drone AI (AI01-AI08)'
                : 'Hộp Thư Tiếp Nhận Sự Cố & Triage Khiếm Khuyết Hỗn Hợp'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
              {isSupervisor ? 'Giám sát Triage Hub' : 'PM Triage Hub'}
            </span>
            {unassignedCitizenCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {unassignedCitizenCount} phản ánh cần điều phối dự án
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              {pendingCount} ca chờ xác minh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận và điều phối phản ánh người dân (PA03), liên kết báo trùng lặp lân cận (PA04) và phân cấp hư hỏng theo 2 trục Severity × Urgency (SC14).
          </p>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất danh sách hồ sơ Triage ra file Excel TCVN...')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất danh sách</span>
          </button>
          <button
            onClick={onOpenLinkReportsModal}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              selectedReportIds.length >= 2
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-400 shadow-sm animate-pulse'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Link2 className="w-4 h-4 text-[#C9A227]" />
            <span>Liên kết báo trùng ({selectedReportIds.length >= 2 ? selectedReportIds.length : 2})</span>
          </button>
          <button
            onClick={() => onNavigateFastTrack(selectedCase)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Điều phối Fast Track (WF-05)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Module Switcher: Citizen Triage vs Drone AI vs All */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setViewSourceMode('CITIZEN_TRIAGE')
              setSelectedReportIds([])
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'bg-[#C9A227] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bảng Tiếp Nhận &amp; Điều Phối Phản Ánh Dân (PA03, PA04)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                viewSourceMode === 'CITIZEN_TRIAGE' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {citizenCount}
            </span>
            {unassignedCitizenCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold animate-pulse">
                {unassignedCitizenCount} chưa gán
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewSourceMode('DRONE_AI')
              setSelectedReportIds([])
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewSourceMode === 'DRONE_AI'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Hộp Thư Drone AI Quét (AI01-AI08)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                viewSourceMode === 'DRONE_AI' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {droneAICount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewSourceMode('ALL')
              setSelectedReportIds([])
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewSourceMode === 'ALL'
                ? 'bg-white text-brand-dark shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Tất cả nguồn</span>
            <span className="text-[10px] opacity-70 font-mono">({cases.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2 flex items-center gap-1.5 self-center">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Quy trình: <strong>Dân báo &rarr; PM Điều phối (PA03) &rarr; Liên kết trùng (PA04) &rarr; Thẩm định (PA05)</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
