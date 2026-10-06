import React from 'react'
import { MOCK_RISK_ITEMS } from './mockData'
import { RiskPortfolioItem } from './types'
import {
  FileDown,
  X,
  FileText,
  FileArchive,
  Download
} from 'lucide-react'

export interface DashboardExportModalProps {
  selectedProject: string
  selectedMonth: string
  isExportModalOpen: boolean
  setIsExportModalOpen: (open: boolean) => void
  exportFormat: 'PDF_A' | 'ZIP_PACKAGE'
  setExportFormat: (f: 'PDF_A' | 'ZIP_PACKAGE') => void
  isExporting: boolean
  onTriggerExport: () => void
  filteredCount: number
}

export const DashboardExportModal: React.FC<DashboardExportModalProps> = ({
  selectedProject,
  selectedMonth,
  isExportModalOpen,
  setIsExportModalOpen,
  exportFormat,
  setExportFormat,
  isExporting,
  onTriggerExport,
  filteredCount
}) => {
  if (!isExportModalOpen) return null

  return (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsExportModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-brand-gold" />
                <h3 className="font-bold text-base font-sansation">
                  Xuất hồ sơ điều hành &amp; rủi ro bảo hành (RPT-01)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Hệ thống khởi tạo tác vụ xuất bất đồng bộ (<code>POST /api/v1/exports</code>), kết xuất toàn bộ dữ liệu 5 dự án bảo hành, ma trận rủi ro suy thoái mặt đường RPT-06 và danh sách hư hỏng trọng yếu.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Chọn định dạng hồ sơ kết xuất:</label>

                {/* Option 1: PDF/A */}
                <div
                  onClick={() => setExportFormat('PDF_A')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'PDF_A'
                      ? 'bg-[#FEF9E7] border-brand-gold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'PDF_A'}
                    onChange={() => setExportFormat('PDF_A')}
                    className="mt-0.5 accent-brand-gold"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Báo cáo điều hành tổng hợp (PDF/A)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Tệp PDF chuẩn pháp lý ISO 19005, tích hợp biểu đồ KPI, bản đồ GIS phân bổ hư hỏng và bảng danh mục rủi ro RPT-06.
                    </span>
                  </div>
                </div>

                {/* Option 2: ZIP Package */}
                <div
                  onClick={() => setExportFormat('ZIP_PACKAGE')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'ZIP_PACKAGE'
                      ? 'bg-[#FEF9E7] border-brand-gold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'ZIP_PACKAGE'}
                    onChange={() => setExportFormat('ZIP_PACKAGE')}
                    className="mt-0.5 accent-brand-gold"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Gói hồ sơ bằng chứng số nén (ZIP Dossier)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Chứa toàn bộ dữ liệu GeoJSON tim tuyến, hình ảnh trực giao Drone Orthorphoto, số đo TCVN 8819 và bảng băm <code>checksum.sha256</code>.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Phạm vi kết xuất:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedProject === 'ALL' ? 'Toàn bộ 5 dự án bảo hành (293.8 km)' : MOCK_RISK_ITEMS.find((it: RiskPortfolioItem) => it.project_id === selectedProject)?.project_name || 'Dự án'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kỳ đánh giá As-Of:</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedMonth} (Cập nhật 21:45 25/08/2026)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bảo mật chống chối bỏ:</span>
                  <span className="font-mono text-purple-700 font-bold">SHA256:4C82..FE19 (Pass)</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsExportModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onTriggerExport}
                disabled={isExporting}
                type="button"
                className="px-5 h-9 bg-brand-gold hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang khởi tạo Job...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải xuống hồ sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
  )
}
