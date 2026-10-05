import React from 'react'
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { TriageCase, ViewSourceMode } from './types'
import { BatchActionBar } from './BatchActionBar'
import { CitizenTriageTable } from './CitizenTriageTable'
import { DroneAiQueueView } from './DroneAiQueueView'

export interface ReviewCasesTableProps {
  viewSourceMode: ViewSourceMode
  cases: TriageCase[]
  filteredCases: TriageCase[]
  selectedCase: TriageCase
  onSelectCase: (c: TriageCase) => void
  selectedReportIds: string[]
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onSelectAllReports: () => void
  collapseMergedRows: boolean
  setCollapseMergedRows: (val: boolean) => void
  expandedMasterIds: string[]
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenLinkReportsModal: () => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onResetTriageData: () => void
  onClearSelectedReports: () => void
}

export const ReviewCasesTable: React.FC<ReviewCasesTableProps> = ({
  viewSourceMode,
  cases,
  filteredCases,
  selectedCase,
  onSelectCase,
  selectedReportIds,
  onToggleSelectReport,
  onSelectAllReports,
  collapseMergedRows,
  setCollapseMergedRows,
  expandedMasterIds,
  onToggleExpandMaster,
  searchQuery,
  setSearchQuery,
  onOpenTriageProject,
  onOpenLinkReportsModal,
  onUnlinkReport,
  onOpenMergeModal,
  onResetTriageData,
  onClearSelectedReports
}) => {
  return (
    <div className="flex-1 w-full bg-white rounded-xl border border-brand-border shadow-2xs p-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Floating Batch Action Bar when items selected */}
        <BatchActionBar
          selectedReportIds={selectedReportIds}
          cases={cases}
          onOpenLinkReportsModal={onOpenLinkReportsModal}
          onOpenTriageProject={onOpenTriageProject}
          onClearSelectedReports={onClearSelectedReports}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-brand-dark">
              {viewSourceMode === 'CITIZEN_TRIAGE'
                ? 'Bảng Phản Ánh Người Dân & Tuần Đường (Cần Triage & Link)'
                : viewSourceMode === 'DRONE_AI'
                ? 'Danh Sách Lỗi Do Drone AI Tự Động Quét Phát Hiện'
                : 'Toàn Bộ Hồ Sơ Khiếm Khuyết Chờ Phân Loại'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>
                Hiển thị {filteredCases.length} / {cases.length} hồ sơ
              </span>
              {viewSourceMode === 'CITIZEN_TRIAGE' && (
                <>
                  <span>•</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={collapseMergedRows}
                      onChange={(e) => setCollapseMergedRows(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                    />
                    <span>Gộp báo trùng theo cây (Master-Tree)</span>
                  </label>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onResetTriageData}
                    className="text-slate-500 hover:text-brand-dark hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    title="Đặt lại dữ liệu mẫu phản ánh ban đầu"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại dữ liệu</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, người gửi, SĐT, lý trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>
        </div>

        {/* View Mode 1: CITIZEN_TRIAGE Dedicated Table */}
        {viewSourceMode === 'CITIZEN_TRIAGE' ? (
          <CitizenTriageTable
            cases={cases}
            filteredCases={filteredCases}
            selectedCase={selectedCase}
            selectedReportIds={selectedReportIds}
            collapseMergedRows={collapseMergedRows}
            expandedMasterIds={expandedMasterIds}
            onSelectCase={onSelectCase}
            onToggleSelectReport={onToggleSelectReport}
            onSelectAllReports={onSelectAllReports}
            onToggleExpandMaster={onToggleExpandMaster}
            onOpenTriageProject={onOpenTriageProject}
            onOpenMergeModal={onOpenMergeModal}
            onUnlinkReport={onUnlinkReport}
          />
        ) : (
          /* View Mode 2: DRONE_AI or ALL (Card Queue View) */
          <DroneAiQueueView
            filteredCases={filteredCases}
            selectedCase={selectedCase}
            onSelectCase={onSelectCase}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          Trang 1 / 3 (Tổng số {filteredCases.length} bản ghi)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold bg-[#C9A227] text-white shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            2
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            3
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
