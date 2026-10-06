import React from 'react'
import { ExportRecord } from './types'
import { NewExportModal } from './NewExportModal'
import { DossierDetailModal } from './DossierDetailModal'
import { TimeRangeModal } from './TimeRangeModal'

export interface RiskModalsProps {
  isExportModalOpen: boolean
  setIsExportModalOpen: (open: boolean) => void
  exportForm: {
    reportType: string
    scope: string
    asOfDate: string
    includeOriginalFiles: boolean
    includeSha256Checksum: boolean
    compressRawTiff: boolean
    format: string
  }
  setExportForm: React.Dispatch<React.SetStateAction<{
    reportType: string
    scope: string
    asOfDate: string
    includeOriginalFiles: boolean
    includeSha256Checksum: boolean
    compressRawTiff: boolean
    format: string
  }>>
  handleCreateExportJob: (e: React.FormEvent) => void
  isPreviewModalOpen: boolean
  setIsPreviewModalOpen: (open: boolean) => void
  selectedRecordForDetail: ExportRecord | null
  handleDownloadFile: (fileName: string) => void
  isTimeRangeModalOpen: boolean
  setIsTimeRangeModalOpen: (open: boolean) => void
  showToast: (msg: string) => void
}

export const RiskModals: React.FC<RiskModalsProps> = ({
  isExportModalOpen,
  setIsExportModalOpen,
  exportForm,
  setExportForm,
  handleCreateExportJob,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  selectedRecordForDetail,
  handleDownloadFile,
  isTimeRangeModalOpen,
  setIsTimeRangeModalOpen,
  showToast
}) => {
  return (
    <>
      <NewExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportForm={exportForm}
        setExportForm={setExportForm}
        onSubmit={handleCreateExportJob}
      />

      <DossierDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        record={selectedRecordForDetail}
        onDownloadFile={handleDownloadFile}
      />

      <TimeRangeModal
        isOpen={isTimeRangeModalOpen}
        onClose={() => setIsTimeRangeModalOpen(false)}
        onApply={() => {
          setIsTimeRangeModalOpen(false)
          showToast('Đã áp dụng khung thời gian mới cho toàn bộ chỉ số KPI!')
        }}
      />
    </>
  )
}
