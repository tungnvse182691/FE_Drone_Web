import React from 'react'
import {
  Archive,
  RefreshCw,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react'
import { ExportRecord } from './types'
import { ExportRecordRow } from './ExportRecordRow'
import { LegalAuditStrip } from './LegalAuditStrip'

interface RiskExportsTableProps {
  processedRecords: ExportRecord[]
  exportRecords: ExportRecord[]
  sortField: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'
  sortAsc: boolean
  handleToggleSort: (field: any) => void
  handleRefresh: () => void
  isRefreshing: boolean
  handleDownloadFile: (fileName: string) => void
  setSelectedRecordForDetail: (record: ExportRecord) => void
  setIsPreviewModalOpen: (open: boolean) => void
  handleRetryRecord: (id: string) => void
  handleDeleteRecord: (id: string, code: string) => void
}

export const RiskExportsTable: React.FC<RiskExportsTableProps> = ({
  processedRecords,
  exportRecords,
  sortField,
  sortAsc,
  handleToggleSort,
  handleRefresh,
  isRefreshing,
  handleDownloadFile,
  setSelectedRecordForDetail,
  setIsPreviewModalOpen,
  handleRetryRecord,
  handleDeleteRecord
}) => {
  return (
    <>
      {/* 6. RECENT EXPORTS TABLE CARD WITH SORTABLE COLUMNS & COLOR LEGEND */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Table Header & Controls */}
        <div className="p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-sansation text-lg lg:text-xl font-bold text-slate-900">
                Danh mục hồ sơ giải trình đã kết xuất
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                {processedRecords.length} / {exportRecords.length} gói lưu trữ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Lịch sử lưu trữ hồ sơ hoàn công, biên bản đối chứng nghiệm thu và gói bằng chứng số phục vụ giám sát kỹ thuật, kiểm định công trình hạ tầng
            </p>

            {/* CHÚ GIẢI MÀU SẮC PHÂN LOẠI TÀI LIỆU KỸ THUẬT */}
            <div className="pt-1.5 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Màu phân loại chứng từ:</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-medium">
                🟣 Dossier Hoàn công
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium">
                🟢 Nghiệm thu Đối chứng
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-medium">
                🔵 Trắc dọc & Bình đồ GIS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                🟡 Thí nghiệm Vật liệu
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 italic">Trạng thái xử lý hiển thị ở cột bên phải</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleRefresh}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition border border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px] select-none">
              <tr>
                <th
                  onClick={() => handleToggleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Mã gói"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mã gói xuất</span>
                    {sortField === 'code' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-brand-gold" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4">Loại hồ sơ</th>

                <th
                  onClick={() => handleToggleSort('scope_display')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Phạm vi / Tuyến"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phạm vi / Tuyến</span>
                    {sortField === 'scope_display' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-brand-gold" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('as_of_timestamp')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Thời gian As-Of"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mốc As-Of</span>
                    {sortField === 'as_of_timestamp' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-brand-gold" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('file_size_mb')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Dung lượng tệp"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kích thước & Định dạng</span>
                    {sortField === 'file_size_mb' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-brand-gold" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition"
                  title="Nhấn để sắp xếp theo Trạng thái"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Trạng thái</span>
                    {sortField === 'status' ? (
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-brand-gold" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <Archive className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại</p>
                    <p className="text-xs text-slate-400">Hãy thử đổi dự án, điều chỉnh quý/nhánh hoặc nhấn "Đặt lại".</p>
                  </td>
                </tr>
              ) : (
                processedRecords.map((record) => (
                  <ExportRecordRow
                    key={record.id}
                    record={record}
                    onDownloadFile={handleDownloadFile}
                    onSelectDetail={setSelectedRecordForDetail}
                    onRetry={handleRetryRecord}
                    onDelete={handleDeleteRecord}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/90 font-medium">
          <span>Hiển thị {processedRecords.length} trong tổng số {exportRecords.length} hồ sơ lưu trữ điện tử</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              type="button"
              className="px-3 py-1 rounded-full bg-white text-slate-400 shadow-2xs border border-slate-200 cursor-not-allowed opacity-60"
            >
              Trước
            </button>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-mono text-slate-800 font-semibold shadow-2xs">
              1 / {Math.max(1, Math.ceil(processedRecords.length / 5))}
            </span>
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-white text-slate-700 hover:text-slate-900 shadow-2xs border border-slate-200 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* 7. LEGAL & SECURITY AUDIT STRIP */}
      <LegalAuditStrip />
    </>
  )
}
