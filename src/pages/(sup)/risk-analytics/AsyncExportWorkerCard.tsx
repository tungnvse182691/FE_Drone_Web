import React from 'react'
import { ProjectConfig, AsyncExportJob, ExportRecord } from './types'

export interface AsyncExportWorkerCardProps {
  currentProject: ProjectConfig
  activeJob: AsyncExportJob | null
  handleCancelActiveJob: () => void
  handleDownloadFile: (fileName: string) => void
  processedRecords: ExportRecord[]
  exportRecords: ExportRecord[]
  setSelectedRecordForDetail: (r: ExportRecord) => void
  setIsPreviewModalOpen: (open: boolean) => void
}

export const AsyncExportWorkerCard: React.FC<AsyncExportWorkerCardProps> = ({
  currentProject,
  activeJob,
  handleCancelActiveJob,
  handleDownloadFile,
  processedRecords,
  exportRecords,
  setSelectedRecordForDetail,
  setIsPreviewModalOpen
}) => {
  const latest=processedRecords.find(r=>r.status==='COMPLETED')
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#8C6D1F] border border-amber-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">folder_zip</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sansation text-base font-bold text-slate-900">
                Hàng đợi xuất dữ liệu bất đồng bộ
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
                {activeJob ? `#${activeJob.id}` : 'Không có tác vụ chạy'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xử lý kết xuất tệp bằng chứng nén ZIP và báo cáo đối soát kỹ thuật PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeJob && activeJob.status === 'PROCESSING' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-[#8C6D1F] animate-pulse"></span>
              <span>Đang thực thi nền</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              <span>Hệ thống sẵn sàng</span>
            </span>
          )}
        </div>
      </div>

      {activeJob && activeJob.status === 'PROCESSING' && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2" role="status">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#8C6D1F] animate-spin">sync</span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">Máy chủ đang tạo hồ sơ xuất {activeJob.name}…</span>
          </div>
          <p className="text-xs text-slate-500">BE chỉ trả trạng thái job (QUEUED/RUNNING/SUCCEEDED/FAILED), không có phần trăm, thời gian ước tính hay lệnh hủy. Tải lại danh mục để đọc trạng thái mới.</p>
        </div>
      )}

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="text-slate-500">Bản sao lưu gần nhất:</span>
          <span className="font-mono font-medium text-slate-800">{latest?`${latest.id} (${latest.format_display})`:'Chưa có export hoàn tất trong danh mục'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!latest}
            onClick={() => {if(latest)handleDownloadFile(latest.id)}}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Tải hồ sơ hoàn tất</span>
          </button>

          <button
            onClick={() => {
              const completedRec = processedRecords.find((r) => r.status === 'COMPLETED') || exportRecords[0]
              if (completedRec) {
                setSelectedRecordForDetail(completedRec)
                setIsPreviewModalOpen(true)
              }
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-500">visibility</span>
            <span>Xem trước báo cáo PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
