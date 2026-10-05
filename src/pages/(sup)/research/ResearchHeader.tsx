import React from 'react'
import { Sparkles, Download, PlayCircle, Verified } from 'lucide-react'
import { MeasurementValidationRun } from '../../../types/domain'

interface ResearchHeaderProps {
  activeRun: MeasurementValidationRun
  isExporting: boolean
  isRunningVal: boolean
  onExport: () => void
  onTriggerValidation: () => void
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({
  activeRun,
  isExporting,
  isRunningVal,
  onExport,
  onTriggerValidation
}) => {
  return (
    <>
      {/* 1. Header & Active Model Specs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Hệ thống báo cáo</span>
            <span>/</span>
            <span className="text-brand-goldDark font-semibold">RPT-09: Báo cáo thực nghiệm (Research Validation)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Chuẩn v2.2 (FR-31 / BR-44)
            </span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            Báo Cáo Nghiên Cứu &amp; Kiểm Chứng Thực Nghiệm (RPT-09)
            <Sparkles className="w-5 h-5 text-brand-gold" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối soát kết quả ghép cặp giữa số đo thực tế (Ground Truth) và số đo mô hình (Derived) — Tính toán Bias, MAE, RMSE theo RS01–RS06, BR-44, MET-12
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            title="Xuất bảng đối soát số đo thực tế và dự đoán AI theo quy chuẩn RPT-09"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isExporting ? 'Đang kết xuất...' : 'Xuất CSV Dữ Liệu Đối Soát'}</span>
          </button>

          <button
            onClick={onTriggerValidation}
            disabled={isRunningVal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-navy hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 text-brand-gold" />
            <span>{isRunningVal ? 'Đang khởi tạo Job...' : 'Chạy Thẩm Định Mới'}</span>
          </button>
        </div>
      </div>

      {/* Model & Dataset Metadata Ribbon */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Mô hình AI:</span>
            <span className="font-bold text-brand-dark">{activeRun.algorithm_version}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {activeRun.run_code}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tập dữ liệu:</span>
            <span className="font-semibold text-slate-700">{activeRun.dataset_name}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Phương pháp đo:</span>
            <span className="font-semibold text-slate-700">Thước thẳng 3m &amp; Thước đo sâu điện tử (Straightedge/Depth gauge)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Verified className="w-3.5 h-3.5" />
            {activeRun.is_mock_data ? 'Dữ liệu Giả Lập (MOCK)' : 'Dữ Liệu Thực Địa (REAL - BR-44)'}
          </span>
          <span className="text-[11px] text-slate-400">
            Cập nhật: {activeRun.executed_at}
          </span>
        </div>
      </div>
    </>
  )
}
