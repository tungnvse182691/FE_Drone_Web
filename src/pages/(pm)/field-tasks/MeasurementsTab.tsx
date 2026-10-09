import React, { useState, useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { FieldTask } from '../../../types/domain'
import { SafeImage } from '../../../components/common/SafeImage'
import { fieldTaskService, CreateFieldTaskPayload } from '../../../api/services/fieldTaskService'
import { PhotoLightboxModal } from '../../../components/common/PhotoLightboxModal'
import { ImageComparisonSlider } from '../../../components/common/ImageComparisonSlider'

export interface MeasurementsTabProps {
  fieldTasks: FieldTask[]
  onRefreshTasks: () => Promise<void>
  highlightCode: string | null
  isLoading?: boolean
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void
}

export const MeasurementsTab: React.FC<MeasurementsTabProps> = ({
  fieldTasks,
  onRefreshTasks,
  highlightCode,
  isLoading = false,
  showToast
}) => {
  // Bộ lọc trạng thái & từ khóa
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Hàm thông báo an toàn
  const notify = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (showToast) {
      showToast(msg, type)
    }
  }

  // Modal Tạo nhiệm vụ mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newDefectCode, setNewDefectCode] = useState('DEF-2026-0842')
  const [newChainage, setNewChainage] = useState(1025.4)
  const [newLane, setNewLane] = useState('Làn cơ giới 1')
  const [newMethod, setNewMethod] = useState('Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách')
  const [newTechnician, setNewTechnician] = useState('Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)')
  const [newNotes, setNewNotes] = useState('Kiểm tra đo đạc chi tiết theo yêu cầu PM')

  // Modal Ghi nhận số đo
  const [isSubmitValueModalOpen, setIsSubmitValueModalOpen] = useState(false)
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<FieldTask | null>(null)
  const [inputMeasuredValue, setInputMeasuredValue] = useState<number>(38)
  const [submitNotes, setSubmitNotes] = useState<string>('')

  // Modal Xem chi tiết & Ảnh thước đo
  const [selectedDetailTask, setSelectedDetailTask] = useState<FieldTask | null>(null)
  const [modalPhotoTab, setModalPhotoTab] = useState<'RULER' | 'DRONE' | 'SPLIT'>('RULER')

  // Modal Lightbox Phóng to ảnh & So sánh song song
  const [lightboxTask, setLightboxTask] = useState<FieldTask | null>(null)
  const [lightboxInitialMode, setLightboxInitialMode] = useState<'PRIMARY' | 'SECONDARY' | 'SPLIT'>('PRIMARY')

  // Đếm theo từng trạng thái phục vụ hiển thị số lượng trên Tab lọc
  const counts = useMemo(() => {
    return {
      all: fieldTasks.length,
      assigned: fieldTasks.filter((t) => t.status === 'ASSIGNED').length,
      inProgress: fieldTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      submitted: fieldTasks.filter((t) => t.status === 'SUBMITTED').length,
      verified: fieldTasks.filter((t) => t.status === 'VERIFIED').length
    }
  }, [fieldTasks])

  // Lọc danh sách theo Tab trạng thái và Tìm kiếm
  const filteredTasks = useMemo(() => {
    return fieldTasks.filter((task) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false
      }
      // 2. Lọc theo từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase()
        const match =
          task.code.toLowerCase().includes(q) ||
          task.defect_code.toLowerCase().includes(q) ||
          task.measurement_type.toLowerCase().includes(q) ||
          task.technician_name.toLowerCase().includes(q) ||
          (task.lane && task.lane.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [fieldTasks, statusFilter, searchTerm])

  // Xử lý tạo nhiệm vụ mới qua API
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: CreateFieldTaskPayload = {
        defect_code: newDefectCode.trim().toUpperCase(),
        chainage_km: Number(newChainage) || 1025.4,
        lane: newLane,
        measurement_type: newMethod,
        technician_name: newTechnician,
        notes: newNotes
      }
      const created = await fieldTaskService.createTask(payload)
      setIsCreateModalOpen(false)
      await onRefreshTasks()
      notify(`Đã khởi tạo thành công phiếu đo đạc [${created.code}] cho khiếm khuyết [${created.defect_code}]!`, 'success')
    } catch (err: any) {
      notify(`Lỗi khi tạo nhiệm vụ: ${err?.message || 'Không thể tạo'}`, 'error')
    }
  }

  // Xử lý chuyển sang trạng thái Đang đo đạc (IN_PROGRESS)
  const handleStartMeasuring = async (taskId: string, code: string) => {
    setActionLoadingId(taskId)
    try {
      await fieldTaskService.startMeasuring(taskId)
      await onRefreshTasks()
      notify(`Đã chuyển phiếu [${code}] sang trạng thái ĐANG ĐO ĐẠC ngoài hiện trường`, 'info')
    } catch (err: any) {
      notify(`Lỗi: ${err?.message || 'Không thể cập nhật'}`, 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Mở modal nhập số đo
  const handleOpenSubmitModal = (task: FieldTask) => {
    setSelectedTaskToSubmit(task)
    setInputMeasuredValue(task.measured_value || 42)
    setSubmitNotes(task.notes || '')
    setIsSubmitValueModalOpen(true)
  }

  // Xác nhận nộp số đo thực tế (chuyển sang SUBMITTED)
  const handleConfirmSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaskToSubmit) return

    setActionLoadingId(selectedTaskToSubmit.id)
    try {
      await fieldTaskService.recordMeasurement(
        selectedTaskToSubmit.id,
        Number(inputMeasuredValue) || 40,
        selectedTaskToSubmit.evidence_photo_url ||
          'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
        submitNotes
      )
      const code = selectedTaskToSubmit.code
      const val = inputMeasuredValue
      setIsSubmitValueModalOpen(false)
      setSelectedTaskToSubmit(null)
      await onRefreshTasks()
      notify(`Đã ghi nhận số đo thực tế ${val} mm cho phiếu [${code}]!`, 'success')
    } catch (err: any) {
      notify(`Lỗi: ${err?.message || 'Không thể ghi nhận số đo'}`, 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Xác minh số liệu vào hồ sơ (chuyển sang VERIFIED)
  const handleVerifyTask = async (taskId: string, code: string) => {
    setActionLoadingId(taskId)
    try {
      await fieldTaskService.verifyTask(taskId)
      await onRefreshTasks()
      notify(`Đã xác minh số liệu cho phiếu [${code}] và chốt vào hồ sơ sửa chữa!`, 'success')
    } catch (err: any) {
      notify(`Lỗi: ${err?.message || 'Không thể xác minh'}`, 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white">
      {/* Banner thông báo khi được chuyển tiếp từ Triage */}
      {highlightCode && (
        <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Icon name="bolt" size={16} className="text-[#C9A227]" />
            <span>
              Đang lọc theo hồ sơ Triage: <strong className="font-mono text-slate-900">{highlightCode}</strong>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Đã đồng bộ từ Hộp thư lỗi</span>
        </div>
      )}

      {/* TOOLBAR: FILTER TABS & ACTIONS */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Bộ lọc trạng thái (Pills) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ASSIGNED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'ASSIGNED'
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Cần thực hiện ({counts.assigned})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đang đo đạc ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'SUBMITTED'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đã có số đo ({counts.submitted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đã xác minh ({counts.verified})
          </button>
        </div>

        {/* Search input & Nút Tạo nhiệm vụ */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã, lỗi, kỹ sư..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C9A227] w-48 sm:w-56"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Icon name="add" size={15} />
            <span>Tạo nhiệm vụ</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-[#F8F9FA] text-[#2D3748]">
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Mã Nhiệm Vụ</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Khiếm Khuyết & Vị Trí</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Phương Pháp Đo</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Số Đo Thực Tế</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Kỹ Sư Phụ Trách</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider">Ảnh Đối Chứng</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider text-center">Trạng Thái</th>
              <th className="py-2.5 px-3.5 font-medium uppercase text-[11px] tracking-wider text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="sync" size={16} className="animate-spin text-[#C9A227]" />
                    <span>Đang tải dữ liệu từ máy chủ...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Icon name="search_off" size={24} className="text-slate-300" />
                    <span>Không tìm thấy nhiệm vụ đo đạc phù hợp</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isHighlighted =
                  Boolean(highlightCode) &&
                  (task.defect_code.toLowerCase().includes(highlightCode!.toLowerCase()) ||
                    task.code.toLowerCase().includes(highlightCode!.toLowerCase()))
                const isProcessing = actionLoadingId === task.id

                return (
                  <tr
                    key={task.id}
                    className={`transition-colors hover:bg-slate-50 ${
                      isHighlighted ? 'bg-amber-50/80 border-l-4 border-l-[#C9A227]' : ''
                    }`}
                  >
                    {/* Mã nhiệm vụ */}
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailTask(task)}
                        className="flex items-center gap-1.5 hover:text-[#C9A227] text-left transition-colors cursor-pointer group"
                        title="Bấm để xem chi tiết & ảnh phóng to"
                      >
                        {isHighlighted && <Icon name="bolt" size={13} className="text-[#C9A227]" />}
                        <span className="font-semibold underline decoration-slate-300 group-hover:decoration-[#C9A227] underline-offset-2">
                          {task.code}
                        </span>
                      </button>
                    </td>

                    {/* Khiếm khuyết & Vị trí */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-semibold text-slate-900">{task.defect_code}</div>
                      {task.defect_name && (
                        <div className="text-[11px] text-slate-600 line-clamp-1">{task.defect_name}</div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Km {task.chainage_km} {task.lane ? `• ${task.lane}` : ''}
                      </div>
                    </td>

                    {/* Phương pháp đo */}
                    <td className="py-3 px-3.5 text-slate-700 max-w-xs">
                      <div className="line-clamp-2 leading-relaxed">{task.measurement_type}</div>
                    </td>

                    {/* Số đo thực tế */}
                    <td className="py-3 px-3.5 font-mono">
                      {task.status === 'ASSIGNED' ? (
                        <span className="text-slate-400 italic text-[11px]">Chưa đo</span>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <span className="text-blue-600 italic text-[11px] flex items-center gap-1">
                          <Icon name="pending" size={13} />
                          <span>Đang thực hiện</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900 text-xs">
                          {task.measured_value} mm
                        </span>
                      )}
                    </td>

                    {/* Kỹ sư phụ trách */}
                    <td className="py-3 px-3.5 text-slate-700">
                      <span>{task.technician_name}</span>
                    </td>

                    {/* Ảnh đối chứng (Drone & Thước đo) */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* 1. Ảnh Drone khảo sát ban đầu */}
                        {task.defect_photo_url && (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxTask(task)
                              setLightboxInitialMode('SECONDARY')
                            }}
                            className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block cursor-pointer transition-transform hover:scale-105 shrink-0"
                            title="Ảnh Drone khảo sát ban đầu (Bấm để phóng to)"
                          >
                            <img
                              src={task.defect_photo_url}
                              alt="Ảnh Drone"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Icon name="zoom_in" size={14} />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] font-mono font-bold text-amber-300 text-center py-0.2">
                              Drone
                            </span>
                          </button>
                        )}

                        {/* 2. Ảnh thước đo hiện trường */}
                        {task.evidence_photo_url ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxTask(task)
                              setLightboxInitialMode('PRIMARY')
                            }}
                            className="relative group w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 bg-slate-100 block cursor-pointer transition-transform hover:scale-105 shrink-0"
                            title="Ảnh thước đo đối chứng từ Mobile (Bấm để phóng to)"
                          >
                            <img
                              src={task.evidence_photo_url}
                              alt="Thước đo"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Icon name="zoom_in" size={14} />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-900/90 text-[8px] font-mono font-bold text-emerald-200 text-center py-0.2">
                              Thước đo
                            </span>
                          </button>
                        ) : (
                          <span
                            className="text-[10px] text-slate-400 italic px-1.5 py-0.5 rounded bg-slate-50 border border-dashed border-slate-200 whitespace-nowrap"
                            title="Chưa có ảnh thước đo (Kỹ sư ngoài hiện trường chưa nộp)"
                          >
                            Chờ nộp đo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái (Pill chuẩn DESIGN.md) */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {task.status === 'ASSIGNED' ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          CẦN THỰC HIỆN
                        </span>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          ĐANG ĐO ĐẠC
                        </span>
                      ) : task.status === 'SUBMITTED' ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          ĐÃ CÓ SỐ ĐO
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ĐÃ XÁC MINH
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {isProcessing ? (
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <Icon name="sync" size={13} className="animate-spin" />
                          <span>Đang lưu...</span>
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailTask(task)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Xem chi tiết phiếu đo & ảnh phóng to"
                          >
                            <Icon name="visibility" size={13} className="text-slate-500" />
                            <span>Chi tiết & Ảnh</span>
                          </button>

                          {task.status === 'ASSIGNED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenSubmitModal(task)}
                              className="px-2 py-0.5 rounded border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[10px] transition-colors cursor-pointer"
                              title="Công cụ test: Mô phỏng Mobile App của Crew gửi số đo về máy chủ"
                            >
                              [Test] Sync
                            </button>
                          )}

                          {task.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => handleOpenSubmitModal(task)}
                              className="px-2 py-0.5 rounded border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-[10px] transition-colors cursor-pointer"
                              title="Công cụ test: Mô phỏng Mobile App của Crew gửi số đo về máy chủ"
                            >
                              [Test] Sync
                            </button>
                          )}

                          {task.status === 'SUBMITTED' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyTask(task.id, task.code)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Chỉ huy trưởng (PM) thẩm định ảnh đối chứng & xác minh số liệu"
                            >
                              <Icon name="check" size={13} />
                              <span>Xác minh số liệu</span>
                            </button>
                          )}

                          {task.status === 'VERIFIED' && (
                            <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                              <Icon name="check_circle" size={14} className="text-emerald-600" />
                              <span>Đã lưu</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: TẠO NHIỆM VỤ ĐO ĐẠC MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tạo Nhiệm Vụ Đo Đạc Hiện Trường</h3>
                  <p className="text-[11px] text-slate-500">Chỉ định vị trí, phương pháp và người đo (KT01, KT02)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="font-medium text-slate-700 mb-1">Mã khiếm khuyết <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newDefectCode}
                    onChange={(e) => setNewDefectCode(e.target.value)}
                    placeholder="VD: DEF-2026-0842"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] font-mono uppercase"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-slate-700 mb-1">Lý trình (Km) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={newChainage}
                    onChange={(e) => setNewChainage(parseFloat(e.target.value) || 0)}
                    placeholder="VD: 1025.4"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Vị trí làn đường</label>
                <input
                  type="text"
                  value={newLane}
                  onChange={(e) => setNewLane(e.target.value)}
                  placeholder="VD: Làn cơ giới 1"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Phương pháp & Thiết bị đo <span className="text-rose-500">*</span></label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách">
                    Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách
                  </option>
                  <option value="Thước đo kính hiển vi quang học độ mở rộng khe nứt BTXM">
                    Thước đo kính hiển vi quang học độ mở rộng khe nứt BTXM
                  </option>
                  <option value="Thước laser trắc địa đo độ chênh cốt hai mép khe co giãn tấm BTXM">
                    Thước laser trắc địa đo độ chênh cốt hai mép khe co giãn tấm BTXM
                  </option>
                  <option value="Thước đo độ sâu hố sụt lòng đường & vệt lún bánh xe">
                    Thước đo độ sâu hố sụt lòng đường & vệt lún bánh xe
                  </option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Kỹ sư thực hiện <span className="text-rose-500">*</span></label>
                <select
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)">Kỹ sư Phạm Văn Hùng (Tổ cơ động 02)</option>
                  <option value="Kỹ sư Lê Quốc Tuấn (Đội tuần đường)">Kỹ sư Lê Quốc Tuấn (Đội tuần đường)</option>
                  <option value="Kỹ sư Hoàng Văn Bách (Tổ kết cấu)">Kỹ sư Hoàng Văn Bách (Tổ kết cấu)</option>
                  <option value="Kỹ sư Nguyễn Trọng Hải (Tổ cơ động 01)">Kỹ sư Nguyễn Trọng Hải (Tổ cơ động 01)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Ghi chú chỉ dẫn</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="check" size={15} />
                  <span>Khởi tạo phiếu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GHI NHẬN SỐ ĐO THỰC ĐỊA */}
      {isSubmitValueModalOpen && selectedTaskToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">[Mô Phỏng Mobile] Đồng Bộ Số Đo Hiện Trường</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Giả lập App Mobile của Crew nộp số đo cho {selectedTaskToSubmit.code} • {selectedTaskToSubmit.defect_code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitValueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmitValue} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                <div className="font-medium text-slate-800">{selectedTaskToSubmit.measurement_type}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Người đo: <strong>{selectedTaskToSubmit.technician_name}</strong>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">
                  Giá trị đo thực tế (mm) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white border border-slate-300 px-3 py-2 rounded-lg focus-within:border-[#C9A227]">
                  <input
                    type="number"
                    step="0.1"
                    value={inputMeasuredValue}
                    onChange={(e) => setInputMeasuredValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-sm font-bold text-slate-900 focus:outline-none"
                    required
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-500 ml-2">mm</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Ghi chú hiện trường</label>
                <input
                  type="text"
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="Ghi chú thêm về điều kiện đo đạc..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitValueModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="check" size={15} />
                  <span>Xác nhận nộp số liệu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT NHIỆM VỤ & ẢNH THƯỚC ĐO */}
      {selectedDetailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-3xl w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Chi Tiết Phiếu Đo Đạc Hiện Trường</h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedDetailTask.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Đối chiếu ảnh chụp thực địa và số đo do Repair Crew nộp về</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Content: 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái: Xem ảnh với Tabs chuyển đổi & Chế độ so sánh song song */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Hình ảnh kỹ thuật đối chứng
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Tab Ảnh Thước đo */}
                    {selectedDetailTask.evidence_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab('RULER')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'RULER'
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Thước đo
                      </button>
                    )}

                    {/* Tab Ảnh Drone */}
                    {selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab('DRONE')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'DRONE'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Drone
                      </button>
                    )}

                    {/* Tab Chia đôi nội bộ */}
                    {selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab(modalPhotoTab === 'SPLIT' ? 'RULER' : 'SPLIT')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'SPLIT'
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Xem 2 ảnh cạnh nhau trong bảng này"
                      >
                        Chia đôi
                      </button>
                    )}

                    {/* Nút So sánh 2 ảnh Fullscreen */}
                    {selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxTask(selectedDetailTask)
                          setLightboxInitialMode('SPLIT')
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 bg-[#C9A227] hover:bg-[#b08d20] text-white shadow-2xs"
                        title="Bung toàn màn hình so sánh song song 1-1 giữa Ảnh Drone và Ảnh Thước đo Mobile"
                      >
                        <Icon name="vertical_split" size={13} />
                        <span>So sánh 2 ảnh</span>
                      </button>
                    )}

                    {/* Nút Phóng to toàn màn hình */}
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode(
                          modalPhotoTab === 'SPLIT'
                            ? 'SPLIT'
                            : modalPhotoTab === 'DRONE'
                            ? 'SECONDARY'
                            : 'PRIMARY'
                        )
                      }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Phóng to toàn màn hình để soi chi tiết vạch thước kẻ"
                    >
                      <Icon name="zoom_in" size={13} />
                      <span>Phóng to</span>
                    </button>
                  </div>
                </div>

                {/* KHUNG HIỂN THỊ ẢNH THEO CHẾ ĐỘ ĐANG CHỌN */}
                <div className="space-y-2">
                  {modalPhotoTab === 'SPLIT' && selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url ? (
                    /* 1. CHẾ ĐỘ KÉO THANH TRƯỢT SPLIT-SCREEN SO SÁNH TRỰC TIẾP */
                    <div className="space-y-2">
                      <ImageComparisonSlider
                        leftImageUrl={selectedDetailTask.defect_photo_url}
                        leftLabel="Không ảnh Drone"
                        leftSubLabel="Triage"
                        rightImageUrl={selectedDetailTask.evidence_photo_url}
                        rightLabel="Thước đo Mobile"
                        rightSubLabel={selectedDetailTask.exif_device || 'Thực địa'}
                        aspectRatioClass="h-56"
                        showControls={true}
                        showPresets={true}
                      />
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-900 flex items-center justify-between">
                        <span>Kéo thanh trượt để đối chiếu sự tương ứng giữa Không ảnh Drone và Thước đo thực địa</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxTask(selectedDetailTask)
                            setLightboxInitialMode('SPLIT')
                          }}
                          className="font-bold underline hover:text-amber-950 cursor-pointer flex items-center gap-0.5"
                        >
                          <span>Toàn màn hình</span>
                          <Icon name="open_in_full" size={11} />
                        </button>
                      </div>
                    </div>
                  ) : modalPhotoTab === 'DRONE' && selectedDetailTask.defect_photo_url ? (
                    /* 2. CHẾ ĐỘ XEM ẢNH DRONE KHẢO SÁT BAN ĐẦU */
                    <div
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode('SECONDARY')
                      }}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={selectedDetailTask.defect_photo_url}
                        alt="Ảnh Drone khảo sát ban đầu"
                        className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-opacity">
                          <Icon name="zoom_in" size={16} />
                          <span>Bấm để phóng to ảnh Drone</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="flight" size={13} className="text-amber-400" />
                          <span className="font-medium text-amber-300">Ảnh Drone khảo sát ban đầu</span>
                        </div>
                        <span className="font-mono text-slate-300 text-[10px]">
                          Zenmuse P1 (GSD 0.8cm/px)
                        </span>
                      </div>
                    </div>
                  ) : selectedDetailTask.evidence_photo_url ? (
                    /* 3. CHẾ ĐỘ XEM ẢNH THƯỚC ĐO HIỆN TRƯỜNG */
                    <div
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode('PRIMARY')
                      }}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={selectedDetailTask.evidence_photo_url}
                        alt="Ảnh thước đo đối chứng"
                        className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-opacity">
                          <Icon name="zoom_in" size={16} />
                          <span>Bấm để phóng to & soi chi tiết vạch thước</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="straighten" size={13} className="text-emerald-400" />
                          <span className="font-medium text-emerald-300">Ảnh thước đo Mobile</span>
                        </div>
                        <span className="font-mono text-slate-300 text-[10px]">
                          {selectedDetailTask.exif_device || 'EXIF Verified'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <Icon name="pending" size={28} className="text-slate-300 mb-1" />
                      <span className="font-medium text-slate-600">Đang chờ Repair Crew đo đạc ngoài hiện trường</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Số đo và ảnh thước đo sẽ tự động đồng bộ khi kỹ sư nộp</span>
                    </div>
                  )}

                  {/* Thumbnail chuyển đổi nhanh ở phía dưới */}
                  {modalPhotoTab !== 'SPLIT' && (
                    <div className="flex items-center gap-2 pt-1">
                      {selectedDetailTask.evidence_photo_url && (
                        <button
                          type="button"
                          onClick={() => setModalPhotoTab('RULER')}
                          className={`flex-1 p-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer ${
                            modalPhotoTab === 'RULER'
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={selectedDetailTask.evidence_photo_url}
                            alt="Thước đo"
                            className="w-10 h-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-800 block truncate">
                              Ảnh thước đo
                            </span>
                            <span className="text-[9px] text-slate-500 block">Mobile hiện trường</span>
                          </div>
                        </button>
                      )}

                      {selectedDetailTask.defect_photo_url && (
                        <button
                          type="button"
                          onClick={() => setModalPhotoTab('DRONE')}
                          className={`flex-1 p-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer ${
                            modalPhotoTab === 'DRONE'
                              ? 'bg-amber-50/70 border-amber-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={selectedDetailTask.defect_photo_url}
                            alt="Drone"
                            className="w-10 h-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-800 block truncate">
                              Ảnh Drone
                            </span>
                            <span className="text-[9px] text-slate-500 block">Flycam ban đầu</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Thông số kỹ thuật & Số đo */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Trạng thái:</span>
                  <div>
                    {selectedDetailTask.status === 'ASSIGNED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        CẦN THỰC HIỆN
                      </span>
                    ) : selectedDetailTask.status === 'IN_PROGRESS' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        ĐANG ĐO ĐẠC
                      </span>
                    ) : selectedDetailTask.status === 'SUBMITTED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        ĐÃ CÓ SỐ ĐO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ĐÃ XÁC MINH
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mã khiếm khuyết liên kết:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedDetailTask.defect_code}
                    </span>
                    {selectedDetailTask.defect_name && (
                      <span className="text-slate-600 block text-xs mt-0.5 font-medium">
                        {selectedDetailTask.defect_name}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Vị trí lý trình:</span>
                    <span className="font-semibold text-slate-800">
                      Km {selectedDetailTask.chainage_km} {selectedDetailTask.lane ? `• ${selectedDetailTask.lane}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Phương pháp & Thiết bị:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedDetailTask.measurement_type}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Kỹ sư / Đội thực hiện:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedDetailTask.technician_name}
                    </span>
                  </div>

                  {/* Giá trị đo đạc nổi bật */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 mt-2">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Kết quả đo thực tế (mm):
                    </span>
                    {selectedDetailTask.measured_value ? (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-rose-600">
                          {selectedDetailTask.measured_value} mm
                        </span>
                        <span className="text-[11px] text-rose-600 font-medium">
                          (Vượt ngưỡng kỹ thuật cho phép)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs mt-1 block">
                        Chưa có số đo nộp về
                      </span>
                    )}
                  </div>

                  {selectedDetailTask.notes && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">Ghi chú hiện trường:</span>
                      <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200 text-[11px] mt-0.5">
                        "{selectedDetailTask.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Thẩm quyền: Chỉ huy trưởng (PM) kiểm tra ảnh & xác minh
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDetailTask(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                {selectedDetailTask.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedDetailTask.id
                      const code = selectedDetailTask.code
                      setSelectedDetailTask(null)
                      handleVerifyTask(id, code)
                    }}
                    className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Icon name="check" size={15} />
                    <span>Xác minh số liệu này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIGHTBOX PHÓNG TO ẢNH FULLSCREEN VỚI ZOOM & EXIF */}
      {lightboxTask && (
        <PhotoLightboxModal
          isOpen={Boolean(lightboxTask)}
          onClose={() => setLightboxTask(null)}
          title={`Phiếu Đo: ${lightboxTask.code} • ${lightboxTask.defect_code}`}
          subtitle={`${lightboxTask.defect_name || lightboxTask.measurement_type} — Km ${lightboxTask.chainage_km} (${lightboxTask.lane || 'Làn cơ giới'})`}
          initialViewMode={lightboxInitialMode}
          primaryPhotoUrl={lightboxTask.evidence_photo_url || ''}
          primaryPhotoLabel="Ảnh Thước Đo (Hiện trường)"
          secondaryPhotoUrl={lightboxTask.defect_photo_url || ''}
          secondaryPhotoLabel="Ảnh Khảo Sát Drone"
          measuredValue={lightboxTask.measured_value}
          unit="mm"
          chainage={lightboxTask.chainage_km}
          lane={lightboxTask.lane}
          gpsLat={lightboxTask.gps_lat || 16.2405}
          gpsLng={lightboxTask.gps_lng || 108.1310}
          deviceInfo={lightboxTask.exif_device || 'Samsung Galaxy Tab Active 4 Pro'}
          capturedAt={lightboxTask.exif_captured_at || lightboxTask.created_at}
          technicianName={lightboxTask.technician_name}
          notes={lightboxTask.notes}
          statusBadge={
            lightboxTask.status === 'ASSIGNED' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-200">
                CẦN THỰC HIỆN
              </span>
            ) : lightboxTask.status === 'IN_PROGRESS' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/80 text-blue-200">
                ĐANG ĐO ĐẠC
              </span>
            ) : lightboxTask.status === 'SUBMITTED' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/80 text-amber-200">
                ĐÃ CÓ SỐ ĐO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/80 text-emerald-200">
                ĐÃ XÁC MINH
              </span>
            )
          }
          onVerifyAction={
            lightboxTask.status === 'SUBMITTED'
              ? () => {
                  const id = lightboxTask.id
                  const code = lightboxTask.code
                  setLightboxTask(null)
                  handleVerifyTask(id, code)
                }
              : undefined
          }
          verifyButtonText="Xác minh số liệu này ngay"
        />
      )}
    </Card>
  )
}
