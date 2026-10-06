import { useState, useEffect, useMemo } from 'react'
import { ExportRecord, AsyncExportJob } from './types'
import { PROJECTS_CONFIG, INITIAL_EXPORT_RECORDS } from './data'
import { computeProjectMetrics, filterAndSortRecords } from './riskAnalyticsCalculations'

export function useRiskAnalyticsState() {
  const [selectedProject, setSelectedProject] = useState('prj-ql1a-02')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Q3_2026')
  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortField, setSortField] = useState<
    'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'
  >('as_of_timestamp')
  const [sortAsc, setSortAsc] = useState(false)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentProject = useMemo(() => {
    const base = PROJECTS_CONFIG[selectedProject] || PROJECTS_CONFIG['prj-ql1a-02']
    return computeProjectMetrics(base, selectedTrack, selectedTimeRange)
  }, [selectedProject, selectedTrack, selectedTimeRange])

  const [activeJob, setActiveJob] = useState<AsyncExportJob | null>({
    id: 'JOB-EXP-8842',
    name: 'QL1A_Q3_2026.zip',
    progress: 65,
    processedItems: 31,
    totalItems: 48,
    estimatedSecondsRemaining: 18,
    tempSizeMb: 92.4,
    status: 'PROCESSING'
  })

  const [exportRecords, setExportRecords] = useState<ExportRecord[]>(INITIAL_EXPORT_RECORDS)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ExportRecord | null>(null)

  const [exportForm, setExportForm] = useState({
    reportType: 'DOSSIER_COMPLETE',
    scope: 'PRJ-QL1A-02',
    asOfDate: '2026-08-25T21:45',
    includeOriginalFiles: true,
    includeSha256Checksum: true,
    compressRawTiff: false,
    format: 'ZIP_PDF'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    if (!activeJob || activeJob.status !== 'PROCESSING') return
    const interval = setInterval(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'PROCESSING') return prev
        if (prev.progress >= 98) {
          showToast('Tác vụ #JOB-EXP-8842 đã đóng gói thành công!')
          return {
            ...prev,
            progress: 100,
            status: 'COMPLETED',
            estimatedSecondsRemaining: 0
          }
        }
        const nextProgress = Math.min(prev.progress + 2, 98)
        const nextItems = Math.min(Math.floor((nextProgress / 100) * prev.totalItems), prev.totalItems)
        const nextTime = Math.max(Math.round(((100 - nextProgress) / 100) * 24), 2)
        return {
          ...prev,
          progress: nextProgress,
          processedItems: nextItems,
          estimatedSecondsRemaining: nextTime
        }
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [activeJob?.status])

  const processedRecords = useMemo(() => {
    return filterAndSortRecords(
      exportRecords,
      selectedProject,
      statusFilter,
      selectedTimeRange,
      selectedTrack,
      searchQuery,
      sortField,
      sortAsc
    )
  }, [exportRecords, selectedProject, statusFilter, selectedTimeRange, selectedTrack, searchQuery, sortField, sortAsc])

  const handleToggleSort = (field: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const handleCreateExportJob = (e: React.FormEvent) => {
    e.preventDefault()
    setIsExportModalOpen(false)
    const newJobId = `JOB-EXP-${Math.floor(Math.random() * 8999 + 1000)}`
    const newExportCode = `#EXP-2026-${Math.floor(Math.random() * 899 + 100)}`

    setActiveJob({
      id: newJobId,
      name: `BaoCao_KiemToan_${currentProject.shortName.replace(/\s+/g, '_')}_Q3.zip`,
      progress: 5,
      processedItems: 2,
      totalItems: 42,
      estimatedSecondsRemaining: 32,
      tempSizeMb: 14.5,
      status: 'PROCESSING'
    })

    const newRecord: ExportRecord = {
      id: `rec-${Date.now()}`,
      code: newExportCode,
      project_id: selectedProject === 'ALL' ? 'prj-ql1a-02' : selectedProject,
      project_code: currentProject.code,
      quarter: 'Q3_2026',
      track: selectedTrack === 'FAST_TRACK' ? 'FAST_TRACK' : 'APPROVAL_TRACK',
      type:
        exportForm.reportType === 'DOSSIER_COMPLETE'
          ? 'Hồ sơ kiểm toán & Bằng chứng số tổng hợp'
          : exportForm.reportType === 'BEFORE_AFTER_ZIP'
          ? 'Gói ảnh nghiệm thu Before/After (Gốc)'
          : 'Báo cáo trắc dọc & Bình đồ GIS',
      type_badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      type_category_name: 'Dossier Hoàn công',
      dossier_no: 'SHA-256 Checksum Verified',
      scope_display: currentProject.chainage,
      as_of_time: '25/08/2026 21:50',
      as_of_timestamp: Date.now(),
      file_size: 'Đang nén...',
      file_size_mb: 45,
      format_display: 'Đang xếp hàng đợi',
      status: 'PROCESSING',
      total_items: 42,
      hash_sha256: '9a4f21e0b5c192d77a94efbc1249826189af0e74cb29471928dfb81a029381ea'
    }

    setExportRecords([newRecord, ...exportRecords])
    showToast(`Đã khởi tạo lệnh xuất bất đồng bộ (${newJobId})!`)
  }

  const handleCancelActiveJob = () => {
    if (!activeJob) return
    setActiveJob((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null))
    showToast(`Đã dừng tác vụ ${activeJob.id}`)
  }

  const handleDeleteRecord = (id: string, code: string) => {
    setExportRecords((prev) => prev.filter((r) => r.id !== id))
    showToast(`Đã xóa hồ sơ lưu trữ ${code}`)
  }

  const handleRetryRecord = (id: string) => {
    setExportRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'PROCESSING',
            format_display: 'Đang xếp lại hàng đợi',
            file_size: 'Đang nén...'
          }
        }
        return r
      })
    )
    showToast('Đã gửi yêu cầu chạy lại tiến trình xuất!')
  }

  const handleDownloadFile = (filename: string) => {
    showToast(`Đang tải tệp: ${filename} (Chứng thực chữ ký số SHA-256 hợp lệ)`)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Dữ liệu chỉ số KPI và hàng đợi xuất đã được đồng bộ mới nhất!')
    }, 600)
  }

  const resetFilters = () => {
    setSelectedProject('prj-ql1a-02')
    setSelectedTimeRange('Q3_2026')
    setSelectedTrack('ALL')
    setStatusFilter('ALL')
    setSearchQuery('')
    setSortField('as_of_timestamp')
    setSortAsc(false)
    showToast('Đã đặt lại toàn bộ bộ lọc và sắp xếp mặc định')
  }

  return {
    selectedProject,
    setSelectedProject,
    selectedTimeRange,
    setSelectedTimeRange,
    selectedTrack,
    setSelectedTrack,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    isRefreshing,
    toastMessage,
    currentProject,
    activeJob,
    exportRecords,
    isExportModalOpen,
    setIsExportModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isTimeRangeModalOpen,
    setIsTimeRangeModalOpen,
    selectedRecordForDetail,
    setSelectedRecordForDetail,
    exportForm,
    setExportForm,
    showToast,
    processedRecords,
    handleToggleSort,
    handleCreateExportJob,
    handleCancelActiveJob,
    handleDeleteRecord,
    handleRetryRecord,
    handleDownloadFile,
    handleRefresh,
    resetFilters
  }
}
