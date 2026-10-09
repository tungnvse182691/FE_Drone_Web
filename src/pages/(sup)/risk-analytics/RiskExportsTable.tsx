import React from 'react'
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
  setIsPreviewModalOpen: _setIsPreviewModalOpen,
  handleRetryRecord,
  handleDeleteRecord
}) => {
  return (
    <div className="space-y-4">
      {/* EXPORTS TABLE CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header & Controls */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-sansation text-lg font-bold text-slate-900">
                Danh mục hồ sơ giải trình đã kết xuất
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                {processedRecords.length} / {exportRecords.length} gói lưu trữ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Lịch sử lưu trữ hồ sơ hoàn công, biên bản đối chứng nghiệm thu và gói bằng chứng số phục vụ kiểm toán kỹ thuật
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleRefresh}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition border border-slate-200 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[15px] ${isRefreshing ? 'animate-spin text-[#8C6D1F]' : 'text-slate-500'}`}>
                refresh
              </span>
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] select-none">
              <tr>
                <th
                  onClick={() => handleToggleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                  title="Nhấn để sắp xếp theo Mã gói"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã hồ sơ</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      {sortField === 'code' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                    </span>
                  </div>
                </th>

                <th className="py-3 px-4">Loại chứng từ</th>

                <th
                  onClick={() => handleToggleSort('scope_display')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                  title="Nhấn để sắp xếp theo Phạm vi"
                >
                  <div className="flex items-center gap-1">
                    <span>Lý trình đoạn tuyến</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      {sortField === 'scope_display' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('as_of_timestamp')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                  title="Nhấn để sắp xếp theo Thời gian chốt"
                >
                  <div className="flex items-center gap-1">
                    <span>Thời gian chốt</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      {sortField === 'as_of_timestamp' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('file_size_mb')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                  title="Nhấn để sắp xếp theo Dung lượng"
                >
                  <div className="flex items-center gap-1">
                    <span>Dung lượng & Định dạng</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      {sortField === 'file_size_mb' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                  title="Nhấn để sắp xếp theo Trạng thái"
                >
                  <div className="flex items-center gap-1">
                    <span>Trạng thái</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      {sortField === 'status' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                    </span>
                  </div>
                </th>

                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 mx-auto block">
                      folder_open
                    </span>
                    <p className="text-sm font-medium text-slate-700">Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại</p>
                    <p className="text-xs text-slate-400">Hãy thử đổi dự án, điều chỉnh kỳ báo cáo hoặc nhấn "Đặt lại".</p>
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
        <div className="p-4 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 font-medium">
          <span>Hiển thị {processedRecords.length} trong tổng số {exportRecords.length} hồ sơ lưu trữ</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              type="button"
              className="px-2.5 py-1 rounded-md bg-white text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 text-xs"
            >
              Trước
            </button>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-800 text-xs font-semibold">
              1 / {Math.max(1, Math.ceil(processedRecords.length / 10))}
            </span>
            <button
              type="button"
              className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer text-xs"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* LEGAL & SECURITY AUDIT STRIP */}
      <LegalAuditStrip />
    </div>
  )
}
