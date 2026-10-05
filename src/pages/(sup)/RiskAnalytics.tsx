import React, { useState, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import {
  ProjectConfig,
  ExportRecord,
  AsyncExportJob,
  ExportFormState
} from './risk-analytics/types'
import { PROJECTS_CONFIG, INITIAL_EXPORT_RECORDS } from './risk-analytics/mockData'
import { RiskHeader } from './risk-analytics/RiskHeader'
import { RiskMetricsGrid } from './risk-analytics/RiskMetricsGrid'
import { RiskExportsTable } from './risk-analytics/RiskExportsTable'
import { RiskModals } from './risk-analytics/RiskModals'

export const RiskAnalytics: React.FC = () => {
  // State Bộ lọc đa chiều
  const [selectedProject, setSelectedProject] = useState('prj-ql1a-02')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Q3_2026')
  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // State Sắp xếp (Sort)
  const [sortField, setSortField] = useState<'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'>('as_of_timestamp')
  const [sortAsc, setSortAsc] = useState(false) // Mặc định: mới nhất trước

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Current project config kết hợp biến thiên theo Nhánh và Kỳ hạn
  const currentProject = useMemo(() => {
    const base = PROJECTS_CONFIG[selectedProject] || PROJECTS_CONFIG['prj-ql1a-02']
    
    // Nếu lọc theo Nhánh Fast Track
    if (selectedTrack === 'FAST_TRACK') {
      return {
        ...base,
        met01_ratio: Math.min(94.2, +(base.met01_ratio + 12.5).toFixed(1)),
        met01_completed_text: '100% khiếm khuyết xử lý dưới 24h không qua Ban thẩm duyệt',
        met04_mtta: Math.max(0.8, +(base.met04_pm_days).toFixed(1)),
        met04_change: '-1.8 ngày',
        met08_recurrence: Math.max(1.2, +(base.met08_recurrence - 1.5).toFixed(1)),
        met08_status: 'ĐẠT CHUẨN' as const,
        met08_note: 'Quy trình xử lý khẩn cấp kiểm soát tốt tái phát nứt lún cục bộ'
      }
    }

    // Nếu lọc theo Nhánh Approval Track
    if (selectedTrack === 'APPROVAL_TRACK') {
      return {
        ...base,
        met01_ratio: Math.max(65.0, +(base.met01_ratio - 4.2).toFixed(1)),
        met01_completed_text: 'Các đợt sửa chữa lớn có lập hồ sơ khối lượng & TVGS thẩm định',
        met04_mtta: +(base.met04_sup_days).toFixed(1),
        met04_change: '+0.5 ngày'
      }
    }

    // Nếu lọc theo Nhánh Emergency
    if (selectedTrack === 'EMERGENCY') {
      return {
        ...base,
        met01_ratio: Math.min(88.0, +(base.met01_ratio + 5.0).toFixed(1)),
        met01_completed_text: '100% sự cố thông xe khẩn cấp dưới 4h, chuyển tiếp hồ sơ sang Approval Track',
        met04_mtta: 0.5,
        met04_change: '-2.5 ngày',
        met08_recurrence: base.met08_recurrence,
        met08_note: 'Sự cố sạt lở & ổ gà sâu được xử lý tạm thời chống ùn tắc giao thông'
      }
    }

    // Nếu lọc theo Quý 2
    if (selectedTimeRange === 'Q2_2026') {
      return {
        ...base,
        met01_ratio: Math.max(62.0, +(base.met01_ratio - 4.2).toFixed(1)),
        met01_change: '-0.8% Q1',
        met04_mtta: +(base.met04_mtta + 1.1).toFixed(1),
        met04_change: '+1.1 ngày'
      }
    }

    return base
  }, [selectedProject, selectedTrack, selectedTimeRange])

  // State Hàng đợi xuất bất đồng bộ (Async Export Worker)
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

  // State Danh mục hồ sơ giải trình
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>(INITIAL_EXPORT_RECORDS)

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ExportRecord | null>(null)

  // Form state cho modal New Export chuẩn theo Backend v2.2 ExportRequest
  const [exportForm, setExportForm] = useState({
    reportType: 'DOSSIER_COMPLETE',
    scope: 'PRJ-QL1A-02',
    asOfDate: '2026-08-25T21:45',
    includeOriginalFiles: true,
    includeSha256Checksum: true,
    compressRawTiff: false,
    format: 'ZIP_PDF'
  })

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Tự động tăng nhẹ tiến độ active job để giao diện sinh động và trung thực
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

  // Lọc và Sắp xếp danh sách hồ sơ (Filter & Sort Engine)
  const processedRecords = useMemo(() => {
    let result = exportRecords.filter((rec) => {
      // 1. Lọc theo Dự án
      if (selectedProject !== 'ALL' && rec.project_id !== selectedProject) {
        return false
      }

      // 2. Lọc theo Trạng thái xuất
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
        return false
      }

      // 3. Lọc theo Khung kỳ hạn (Quý / Thời gian)
      if (selectedTimeRange === 'Q3_2026') {
        if (rec.quarter !== 'Q3_2026' && rec.quarter !== 'MONTH_08_2026') return false
      } else if (selectedTimeRange === 'Q2_2026') {
        if (rec.quarter !== 'Q2_2026') return false
      } else if (selectedTimeRange === 'MONTH_08_2026') {
        if (rec.quarter !== 'MONTH_08_2026') return false
      }

      // 4. Lọc theo Nhánh quy trình
      if (selectedTrack !== 'ALL') {
        if (rec.track !== 'ALL' && (rec.track as string) !== selectedTrack) return false
      }

      // 5. Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchCode = rec.code.toLowerCase().includes(query)
        const matchType = rec.type.toLowerCase().includes(query)
        const matchScope = rec.scope_display.toLowerCase().includes(query)
        const matchDossier = rec.dossier_no.toLowerCase().includes(query)
        if (!matchCode && !matchType && !matchScope && !matchDossier) return false
      }
      return true
    })

    // Sắp xếp
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'as_of_timestamp') {
        comparison = a.as_of_timestamp - b.as_of_timestamp
      } else if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code)
      } else if (sortField === 'scope_display') {
        comparison = a.scope_display.localeCompare(b.scope_display)
      } else if (sortField === 'file_size_mb') {
        comparison = a.file_size_mb - b.file_size_mb
      } else if (sortField === 'status') {
        const statusOrder = { PROCESSING: 1, COMPLETED: 2, FAILED: 3 }
        comparison = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      }
      return sortAsc ? comparison : -comparison
    })

    return result
  }, [exportRecords, selectedProject, statusFilter, selectedTimeRange, selectedTrack, searchQuery, sortField, sortAsc])

  // Đổi cột sort
  const handleToggleSort = (field: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false) // default desc for new field
    }
  }

  // Xử lý tạo yêu cầu xuất hồ sơ mới
  const handleCreateExportJob = (e: React.FormEvent) => {
    e.preventDefault()
    setIsExportModalOpen(false)
    const newJobId = `JOB-EXP-${Math.floor(Math.random() * 8999 + 1000)}`
    const newExportCode = `#EXP-2026-${Math.floor(Math.random() * 899 + 100)}`

    // Đặt active job
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

    // Bổ sung vào danh sách hồ sơ
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

  // Hủy tác vụ đang chạy
  const handleCancelActiveJob = () => {
    if (!activeJob) return
    setActiveJob((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null))
    showToast(`Đã dừng tác vụ ${activeJob.id}`)
  }

  // Thao tác xóa bản ghi
  const handleDeleteRecord = (id: string, code: string) => {
    setExportRecords((prev) => prev.filter((r) => r.id !== id))
    showToast(`Đã xóa hồ sơ lưu trữ ${code}`)
  }

  // Thử lại bản ghi FAILED
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

  // Tải file mô phỏng
  const handleDownloadFile = (filename: string) => {
    showToast(`Đang tải tệp: ${filename} (Chứng thực chữ ký số SHA-256 hợp lệ)`)
  }

  // Làm mới danh sách
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Dữ liệu chỉ số KPI và hàng đợi xuất đã được đồng bộ mới nhất!')
    }, 600)
  }

  // Đặt lại bộ lọc
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

  return (
    <div className="space-y-6 pb-16 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <RiskHeader
        currentProject={currentProject}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        setIsTimeRangeModalOpen={setIsTimeRangeModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}
        sortField={sortField}
        setSortField={setSortField}
        sortAsc={sortAsc}
        setSortAsc={setSortAsc}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        resetFilters={resetFilters}
        showToast={showToast}
        projectsConfig={PROJECTS_CONFIG}
      />

      {/* KPI Metrics & Async Export Queue */}
      <RiskMetricsGrid
        currentProject={currentProject}
        activeJob={activeJob}
        handleCancelActiveJob={handleCancelActiveJob}
        handleDownloadFile={handleDownloadFile}
        processedRecords={processedRecords}
        exportRecords={exportRecords}
        setSelectedRecordForDetail={setSelectedRecordForDetail}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
      />

      {/* Export Records Table & Legal Strip */}
      <RiskExportsTable
        processedRecords={processedRecords}
        exportRecords={exportRecords}
        sortField={sortField}
        sortAsc={sortAsc}
        handleToggleSort={handleToggleSort}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        handleDownloadFile={handleDownloadFile}
        setSelectedRecordForDetail={setSelectedRecordForDetail}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        handleRetryRecord={handleRetryRecord}
        handleDeleteRecord={handleDeleteRecord}
      />

      {/* All Modal Windows */}
      <RiskModals
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        exportForm={exportForm}
        setExportForm={setExportForm}
        handleCreateExportJob={handleCreateExportJob}
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        selectedRecordForDetail={selectedRecordForDetail}
        handleDownloadFile={handleDownloadFile}
        isTimeRangeModalOpen={isTimeRangeModalOpen}
        setIsTimeRangeModalOpen={setIsTimeRangeModalOpen}
        showToast={showToast}
      />
    </div>
  )
}
