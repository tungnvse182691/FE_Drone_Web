import React from 'react'
import {
  Archive,
  RefreshCw,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  AlertCircle,
  Download,
  ExternalLink,
  Trash2,
  ShieldCheck
} from 'lucide-react'
import { ExportRecord } from './types'

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
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
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
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
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
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
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
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
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
                      sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#C9A227]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
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
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C9A227]">
                      {record.code}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${record.type_badge_color}`}>
                          {record.type}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 mt-1">
                          Mã DA: {record.project_code} • {record.dossier_no}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                      {record.scope_display}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {record.as_of_time}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{record.file_size}</span>
                        <span className="text-slate-500 text-[11px]">({record.format_display})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {record.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          COMPLETED
                        </span>
                      ) : record.status === 'PROCESSING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                          PROCESSING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          FAILED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleDownloadFile(`${record.code}.zip`)}
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#C9A227] hover:bg-slate-100 transition cursor-pointer"
                            title="Tải xuống gói hồ sơ"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedRecordForDetail(record)
                            setIsPreviewModalOpen(true)
                          }}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Xem chi tiết hồ sơ & mã băm SHA-256"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {record.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryRecord(record.id)}
                            type="button"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Thử lại (Retry)"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRecord(record.id, record.code)}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa hồ sơ khỏi kho"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 lg:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3 flex-1">
          <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-sansation text-sm text-slate-900 block font-bold">
              Tiêu chuẩn pháp lý & Toàn vẹn chứng từ số (RPT-07)
            </span>
            <p className="text-slate-500 leading-relaxed text-[11px] lg:text-xs">
              Hồ sơ kỹ thuật xuất từ hệ thống RoadGuard (Nhà thầu Hoàng Hải) tự động đính kèm mã băm SHA-256 Checksum cho từng tệp ảnh và gói nén, đáp ứng đầy đủ tiêu chuẩn nghiệm thu và kiểm toán kỹ thuật công trình giao thông (TCVN 8819 &amp; TCVN 8864).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="font-sansation font-bold text-slate-900 text-xs">Mã băm SHA-256: Toàn vẹn</span>
            <span className="font-mono text-[10px] text-slate-500 font-semibold">Chuẩn đối soát bảo hành: v2.2</span>
          </div>
        </div>
      </div>
    </>
  )
}
