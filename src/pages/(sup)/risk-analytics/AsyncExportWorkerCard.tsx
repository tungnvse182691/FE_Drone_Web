import React from 'react'
import {
  FolderArchive,
  CheckCircle2,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
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
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 lg:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] text-[#C9A227] border border-amber-200/70 flex items-center justify-center shrink-0">
            <FolderArchive className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sansation text-lg font-bold text-slate-900">
                Hàng đợi xuất dữ liệu bất đồng bộ (Async Export Worker)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200">
                Mã phiên: {activeJob ? `#${activeJob.id}` : 'Không có tác vụ chạy'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xử lý kết xuất tệp bằng chứng nén ZIP và báo cáo đối soát PDF chuẩn A-1a
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeJob && activeJob.status === 'PROCESSING' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
              <span>Đang thực thi nền (202 Accepted)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Worker rảnh rỗi (Ready)</span>
            </span>
          )}
        </div>
      </div>

      {activeJob && activeJob.status === 'PROCESSING' && (
        <div className="bg-slate-50 rounded-xl border border-slate-200/90 p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-[#C9A227] animate-spin" />
              <span className="font-semibold text-slate-800 text-sm">
                Đang đóng gói hồ sơ nghiệm thu {activeJob.name}...
              </span>
              <span className="font-sansation text-[#C9A227] font-bold text-base">
                {activeJob.progress}%
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>
                Đã ghép: <strong className="text-slate-800 font-semibold font-mono">{activeJob.processedItems}/{activeJob.totalItems} mục</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Còn lại: <strong className="text-slate-800 font-semibold font-mono">{activeJob.estimatedSecondsRemaining} giây</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Dung lượng tạm: <strong className="text-slate-800 font-semibold font-mono">{activeJob.tempSizeMb} MB</strong>
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
            <div
              className="h-full bg-[#C9A227] rounded-full transition-all duration-500 relative"
              style={{
                width: `${activeJob.progress}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25) 10px, transparent 10px, transparent 20px)'
              }}
            ></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Ghi chú kỹ thuật: Đang ghép 48 cặp ảnh BEFORE/AFTER và biên bản nghiệm thu TCVN 8819 kèm tọa độ WGS-84.
            </span>
            <button
              onClick={handleCancelActiveJob}
              type="button"
              className="text-rose-600 hover:text-rose-800 hover:underline self-start sm:self-auto font-semibold cursor-pointer"
            >
              Hủy tác vụ này
            </button>
          </div>
        </div>
      )}

      <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-500">Bản sao lưu gần nhất:</span>
          <span className="font-mono font-semibold text-slate-800">{currentProject.code}_Final.zip (142 MB)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadFile(`${currentProject.code}_Final.zip`)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải gói ZIP (142 MB)</span>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem trước báo cáo PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
