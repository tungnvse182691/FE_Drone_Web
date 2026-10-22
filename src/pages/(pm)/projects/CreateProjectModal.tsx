import React, { useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onChangeProjectName: (val: string) => void
  projectCode: string
  onChangeProjectCode: (val: string) => void
  projectRegion: string
  onChangeProjectRegion: (val: string) => void
  projectPM: string
  onChangeProjectPM: (val: string) => void
  startDate: string // handoverDate
  onChangeStartDate: (val: string) => void
  endDate: string // warrantyEndDate
  onChangeEndDate: (val: string) => void
  handoverFiles?: string[]
  onChangeHandoverFiles?: (files: string[]) => void
  isSubmitting?: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onChangeProjectName,
  projectCode,
  onChangeProjectCode,
  projectRegion,
  onChangeProjectRegion,
  projectPM,
  onChangeProjectPM,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  handoverFiles = [],
  onChangeHandoverFiles,
  isSubmitting = false,
  onSubmit,
}) => {
  // Validate rule BR-01 / FR-04: warrantyEndDate >= handoverDate
  const isDateInvalid = useMemo(() => {
    if (!startDate || !endDate) return false
    return new Date(endDate).getTime() < new Date(startDate).getTime()
  }, [startDate, endDate])

  const isFormValid = useMemo(() => {
    return (
      projectName.trim().length > 0 &&
      projectCode.trim().length > 0 &&
      projectPM.trim().length > 0 &&
      projectPM !== '-- Để trống --' &&
      startDate.length > 0 &&
      endDate.length > 0 &&
      !isDateInvalid &&
      !isSubmitting
    )
  }, [projectName, projectCode, projectPM, startDate, endDate, isDateInvalid, isSubmitting])

  const handleToggleSampleFile = (fileName: string) => {
    if (!onChangeHandoverFiles) return
    if (handoverFiles.includes(fileName)) {
      onChangeHandoverFiles(handoverFiles.filter((f) => f !== fileName))
    } else {
      onChangeHandoverFiles([...handoverFiles, fileName])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header - Minimalism */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
              <Icon name="domain_add" size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-headline">
                Khởi tạo dự án bảo hành mới
              </h2>
              <p className="text-xs text-slate-500 font-body">
                Thiết lập thông tin bàn giao &amp; chỉ định 1 PM chính
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Đóng"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-body">
          {/* Mã dự án & Tên dự án */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Mã dự án (Code) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => onChangeProjectCode(e.target.value.toUpperCase())}
                placeholder="PRJ-QL14-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block font-medium text-slate-700">
                Tên công trình dự án <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => onChangeProjectName(e.target.value)}
                placeholder="VD: Quốc lộ 14 - Đoạn Chơn Thành"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          {/* Khu vực & Chỉ định PM chính (BR-01) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Khu vực địa bàn quản lý
              </label>
              <input
                type="text"
                value={projectRegion}
                onChange={(e) => onChangeProjectRegion(e.target.value)}
                placeholder="VD: Bình Phước - Bình Dương"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-medium text-slate-700">
                  Chỉ định 1 PM chính <span className="text-rose-600">*</span>
                </label>
              </div>
              <select
                required
                value={projectPM}
                onChange={(e) => onChangeProjectPM(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
              >
                <option value="Đỗ Quốc Hoàng (pmhoang@gmail.com)">Kỹ sư Đỗ Quốc Hoàng (pmhoang@gmail.com)</option>
                <option value="Trần Minh Tâm (tam.tm@hoanghai-infra.vn)">Kỹ sư Trần Minh Tâm (tam.tm@hoanghai-infra.vn)</option>
                <option value="Lê Văn Cường (cuong.lv@hoanghai-infra.vn)">Kỹ sư Lê Văn Cường (cuong.lv@hoanghai-infra.vn)</option>
              </select>
            </div>
          </div>

          {/* Thời hạn bảo hành & Bàn giao (FR-04) */}
          <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
              <Icon name="calendar_month" size={16} className="text-brand-gold" />
              <span>Thời hạn nghiệm thu &amp; hiệu lực bảo hành (FR-04)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-600">Ngày bàn giao đưa vào sử dụng (handoverDate) *</span>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-600">Ngày hết hạn bảo hành (warrantyEndDate) *</span>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className={`w-full px-3 py-1.5 bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                    isDateInvalid
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-brand-gold'
                  }`}
                />
              </div>
            </div>

            {/* Cảnh báo vi phạm validation FR-04 */}
            {isDateInvalid && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
                <Icon name="error" size={16} className="shrink-0 text-rose-600" />
                <span>
                  <strong>Lỗi quy tắc:</strong> Ngày hết hạn bảo hành (<code className="font-mono">{endDate}</code>) không được nhỏ hơn ngày nghiệm thu bàn giao (<code className="font-mono">{startDate}</code>).
                </span>
              </div>
            )}
          </div>

          {/* Đính kèm tài liệu bàn giao ban đầu (handoverFileIds - Tùy chọn) */}
          <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800 flex items-center gap-1.5 text-xs">
                <Icon name="attach_file" size={16} className="text-slate-500" />
                <span>Tài liệu / Biên bản bàn giao ban đầu (handoverFileIds)</span>
              </span>
              <span className="text-[10px] text-slate-400 italic">Tùy chọn (được phép để trống)</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Đính kèm các biên bản nghiệm thu hoàn thành công trình để làm căn cứ đối soát hồ sơ gốc (DA04).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { id: 'FILE-BB-BG-01', label: 'BB_NghiemThu_BanGiao_2026.pdf', size: '2.4 MB' },
                { id: 'FILE-BV-HC-02', label: 'BanVe_HoanCong_MatDuong.pdf', size: '8.1 MB' },
              ].map((file) => {
                const isSelected = handoverFiles.includes(file.id)
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleToggleSampleFile(file.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-[11px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-brand-gold/60 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon
                        name={isSelected ? 'check_box' : 'check_box_outline_blank'}
                        size={16}
                        className={isSelected ? 'text-brand-gold' : 'text-slate-400'}
                      />
                      <span className="truncate font-medium">{file.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">{file.size}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ghi chú phạm vi Supervisor theo DA01 */}
          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 flex items-start gap-2">
            <Icon name="info" size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Theo quy tắc <strong>DA01</strong>: Supervisor tạo hồ sơ bảo hành và giao PM. Phần nhập chuỗi GPS tim đường, bề rộng và phân đoạn sẽ do PM phụ trách thực hiện ở bước tiếp theo.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg font-medium shadow-xs transition flex items-center gap-1.5 text-xs text-white ${
                isFormValid
                  ? 'bg-brand-gold hover:bg-brand-goldMuted cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Icon
                name={isSubmitting ? 'sync' : 'add'}
                size={16}
                className={isSubmitting ? 'animate-spin' : ''}
              />
              <span>{isSubmitting ? 'Đang khởi tạo...' : 'Khởi tạo dự án'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
