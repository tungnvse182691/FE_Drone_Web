import React from 'react'
import { MeasurementValidationRun } from '../../../types/domain'
import { ValidationProjectOption } from '../../../api/services/validationService'

interface ResearchHeaderProps {
  selectedProject: string
  onSelectProject: (projectId: string) => void
  projectOptions: ValidationProjectOption[]
  activeRun: MeasurementValidationRun
  isExporting: boolean
  isRunningVal: boolean
  onExport: () => void
  onTriggerValidation: () => void
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({
  selectedProject,
  onSelectProject,
  projectOptions,
  activeRun,
  isExporting,
  isRunningVal,
  onExport,
  onTriggerValidation
}) => {
  return (
    <>
      {/* 1. Header & Active Model Specs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Báo cáo &amp; Hồ sơ</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Thực nghiệm AI (RPT-09)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Quy chuẩn v2.2 (FR-31 / BR-44)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sansation">
            <span>Thực Nghiệm Đối Soát Mô Hình AI &amp; Thực Địa</span>
            <span className="material-symbols-outlined text-[22px] text-brand-gold">science</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối soát kết quả ghép cặp giữa số đo thực tế ngoài hiện trường và số đo mô hình trích xuất từ Drone — Đánh giá sai số Bias, MAE, RMSE theo RS01–RS06, MET-12
          </p>
        </div>

        {/* Toolbar: Bộ chọn dự án phụ trách + Nút hành động */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dropdown Bộ chọn dự án (Dành cho PM phụ trách nhiều dự án) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-brand-gold">folder_open</span>
            <span className="text-slate-500 font-medium text-[11px] hidden sm:inline">Dự án:</span>
            <select
              value={selectedProject}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-hidden cursor-pointer pr-1"
              title="Chọn dự án để lọc tập dữ liệu kiểm nghiệm"
            >
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nút Xuất tệp CSV */}
          <button
            onClick={onExport}
            disabled={isExporting}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Xuất bảng đối soát số đo thực tế và dự đoán AI theo quy chuẩn RPT-09"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span className="hidden sm:inline">{isExporting ? 'Đang xuất tệp...' : 'Xuất tệp đối soát (CSV)'}</span>
            <span className="sm:hidden">Xuất CSV</span>
          </button>

          {/* Nút Chạy kiểm định mới (1 CTA chính duy nhất màu vàng đồng) */}
          <button
            onClick={onTriggerValidation}
            disabled={isRunningVal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-900 bg-brand-gold hover:bg-amber-400 shadow-2xs transition disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-900">
              {isRunningVal ? 'sync' : 'play_arrow'}
            </span>
            <span>{isRunningVal ? 'Đang khởi tạo...' : 'Chạy kiểm định mới'}</span>
          </button>
        </div>
      </div>

      {/* Model & Dataset Metadata Ribbon */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Mô hình AI:</span>
            <span className="font-bold text-slate-800">{activeRun.algorithm_version}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {activeRun.run_code}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tập dữ liệu:</span>
            <span className="font-semibold text-slate-800">{activeRun.dataset_name}</span>
          </div>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Phương pháp đo:</span>
            <span className="font-semibold text-slate-700">Thước thẳng 3m &amp; Thước đo sâu điện tử (TCVN 8864)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>{activeRun.is_mock_data ? 'Dữ liệu giả lập (Thử nghiệm)' : 'Dữ liệu thực địa (Quy chuẩn BR-44)'}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Cập nhật: {activeRun.executed_at}
          </span>
        </div>
      </div>
    </>
  )
}
