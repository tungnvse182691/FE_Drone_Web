import React, { useMemo } from 'react'
import { validateHandoverFile } from '../../../api/services/handoverUploadService'
import { Icon } from '../../../components/ui/Icon'

export interface PmOption {
  id: string
  name: string
  email: string
  status?: string
}

export interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  engineeringCrs?: string
  onChangeEngineeringCrs?: (value: string) => void
  projectName: string
  onChangeProjectName: (val: string) => void
  projectCode: string
  onChangeProjectCode: (val: string) => void
  projectRegion: string
  onChangeProjectRegion: (val: string) => void
  projectPM: string
  onChangeProjectPM: (val: string) => void
  pmOptions?: PmOption[]
  startDate: string // handoverDate
  onChangeStartDate: (val: string) => void
  endDate: string // warrantyEndDate
  onChangeEndDate: (val: string) => void
  handoverFile?: File | null
  onChangeHandoverFile?: (file: File | null) => void
  stepLabel?: string
  pmLoading?: boolean
  pmError?: string | null
  onRetryPms?: () => void
  pendingCreate?: boolean
  receivedCreate?: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit: (e: React.FormEvent) => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  engineeringCrs = '', onChangeEngineeringCrs,
  projectName,
  onChangeProjectName,
  projectCode,
  onChangeProjectCode,
  projectRegion,
  onChangeProjectRegion,
  projectPM,
  onChangeProjectPM,
  pmOptions = [],
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  handoverFile = null,
  onChangeHandoverFile,
  stepLabel = '',
  pmLoading = false,
  pmError = null,
  onRetryPms,
  pendingCreate = false,
  receivedCreate = false,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}) => {
  // Tự động chuẩn hóa mã dự án: in hoa, bỏ khoảng trắng
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toUpperCase().replace(/\s+/g, '')
    onChangeProjectCode(sanitized)
  }

  // Validate rule BR-01 / FR-04: warrantyEndDate >= handoverDate
  const isDateInvalid = useMemo(() => {
    if (!startDate || !endDate) return false
    return new Date(endDate).getTime() < new Date(startDate).getTime()
  }, [startDate, endDate])

  const isFormValid = useMemo(() => {
    if (validateHandoverFile(handoverFile)) return false
    if (pendingCreate) return !isSubmitting
    return (
      ['32648', '32649'].includes(engineeringCrs) &&
      projectName.trim().length > 0 && projectName.trim().length <= 255 &&
      projectCode.trim().length > 0 && projectCode.trim().length <= 50 &&
      pmOptions.some(option => option.id === projectPM && option.status === 'ACTIVE') &&
      projectPM.trim().length > 0 &&
      projectPM !== '-- Để trống --' &&
      startDate.length > 0 &&
      endDate.length > 0 &&
      !isDateInvalid &&
      !isSubmitting
    )
  }, [engineeringCrs, projectName, projectCode, projectPM, startDate, endDate, isDateInvalid, isSubmitting, pendingCreate, pmOptions, handoverFile])

  if (!isOpen) return null

  const crsInvalid = !pendingCreate && !['32648', '32649'].includes(engineeringCrs)
  const busy = pendingCreate || isSubmitting
  const codeError = !!errorMessage && errorMessage.toLowerCase().includes('mã dự án')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-surfaceAlt border-b border-brand-border flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
              <Icon name="add_road" size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-brand-dark font-headline leading-tight">
                Khởi tạo dự án bảo hành mới
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-body leading-snug">
                Thiết lập thông tin bàn giao &amp; chỉ định 1 PM chính
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1 text-xs font-body">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {errorMessage && (
              <div className="rg-alert rg-alert-error" role="alert">
                <Icon name="error" size={18} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-relaxed min-w-0">
                  <span className="font-bold block mb-0.5">Trạng thái yêu cầu tạo dự án:</span>
                  <span className="whitespace-pre-line break-words">{errorMessage}</span>
                </div>
              </div>
            )}

            {pmError && (
              <div className="rg-alert rg-alert-warn" role="alert">
                <Icon name="warning" size={16} className="shrink-0 mt-px" />
                <p className="min-w-0 break-words">
                  {pmError}{' '}
                  <button type="button" onClick={onRetryPms} className="font-semibold underline cursor-pointer">
                    Thử lại danh sách PM
                  </button>
                </p>
              </div>
            )}

            <fieldset disabled={busy} className="space-y-4 border-0 p-0 m-0 min-w-0">
              {/* 1. Thông tin dự án */}
              <section className="rounded-xl border border-brand-border p-4 space-y-3">
                <div className="rg-section-title"><Icon name="badge" size={16} className="text-brand-navy" /><p>Thông tin dự án</p></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="rg-label" htmlFor="project-code">
                      Mã dự án <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="project-code"
                      type="text"
                      required
                      maxLength={50}
                      value={projectCode}
                      onChange={handleCodeChange}
                      placeholder="VD: PRJ-QL1A-03"
                      aria-invalid={codeError}
                      className={`rg-field w-full font-mono font-bold ${codeError ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : ''}`}
                    />
                    <p className="rg-hint">Mã in hoa, không dấu, không trùng dự án đã có.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="rg-label" htmlFor="project-name">
                      Tên công trình dự án <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="project-name"
                      type="text"
                      required
                      maxLength={255}
                      value={projectName}
                      onChange={(e) => onChangeProjectName(e.target.value)}
                      placeholder="VD: Quốc lộ 1A - Đoạn Diễn Châu"
                      className="rg-field w-full"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="rg-label" htmlFor="project-region">Khu vực địa bàn quản lý</label>
                    <input
                      id="project-region"
                      type="text"
                      value={projectRegion}
                      onChange={(e) => onChangeProjectRegion(e.target.value)}
                      placeholder="VD: Nghệ An - Hà Tĩnh"
                      className="rg-field w-full"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Quản lý & hệ tọa độ */}
              <section className="rounded-xl border border-brand-border p-4 space-y-3">
                <div className="rg-section-title"><Icon name="manage_accounts" size={16} className="text-brand-navy" /><p>Phụ trách &amp; hệ tọa độ</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="rg-label" htmlFor="project-pm">
                      Chỉ định 1 PM chính <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="project-pm"
                      required
                      value={projectPM}
                      onChange={(e) => onChangeProjectPM(e.target.value)}
                      className="rg-field w-full font-medium"
                    >
                      <option value="">Chọn PM chính</option>
                      {pendingCreate && projectPM && !pmOptions.some(option => option.id === projectPM) && <option value={projectPM}>PM của yêu cầu đang đối chiếu</option>}
                      {pmOptions.length === 0 ? (
                        <option value="">{pmLoading ? 'Đang tải danh sách PM...' : 'Không có PM đủ điều kiện'}</option>
                      ) : (
                        pmOptions.map((pm) => (
                          <option key={pm.id} value={pm.id}>
                            {pm.name} ({pm.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="rg-label" htmlFor="project-crs">
                      CRS kỹ thuật dự án <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="project-crs"
                      required
                      aria-label="CRS kỹ thuật dự án"
                      aria-invalid={crsInvalid}
                      aria-describedby="project-crs-help project-crs-error"
                      value={engineeringCrs}
                      onChange={event => onChangeEngineeringCrs?.(event.target.value)}
                      className={`rg-field w-full ${crsInvalid ? 'border-rose-300' : ''}`}
                    >
                      <option value="">Chọn CRS theo hồ sơ tọa độ</option>
                      <option value="32648">WGS 84 / UTM múi 48 Bắc — EPSG:32648</option>
                      <option value="32649">WGS 84 / UTM múi 49 Bắc — EPSG:32649</option>
                    </select>
                  </div>
                </div>
                <p id="project-crs-help" className="rg-hint">
                  Chọn theo hồ sơ tọa độ kỹ thuật của dự án, không suy từ địa điểm. CRS nguồn tuyến phải khớp; FE không tự chuyển tọa độ.
                </p>
                {crsInvalid && (
                  <p id="project-crs-error" role="alert" className="text-[11px] font-medium text-rose-700">
                    Bắt buộc chọn CRS kỹ thuật trước khi tạo dự án.
                  </p>
                )}
              </section>

              {/* 3. Thời hạn */}
              <section className="rounded-xl border border-brand-border p-4 space-y-3">
                <div className="rg-section-title"><Icon name="calendar_month" size={16} className="text-brand-navy" /><p>Thời hạn nghiệm thu &amp; hiệu lực bảo hành</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="rg-label" htmlFor="project-handover">
                      Ngày bàn giao đưa vào sử dụng <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="project-handover"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => onChangeStartDate(e.target.value)}
                      className="rg-field w-full"
                    />
                  </div>
                  <div>
                    <label className="rg-label" htmlFor="project-warranty-end">
                      Ngày hết hạn bảo hành <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="project-warranty-end"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => onChangeEndDate(e.target.value)}
                      aria-invalid={isDateInvalid}
                      className={`rg-field w-full ${isDateInvalid ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400' : ''}`}
                    />
                  </div>
                </div>
                {isDateInvalid && (
                  <div className="rg-alert rg-alert-error" role="alert">
                    <Icon name="error" size={16} className="shrink-0 mt-px" />
                    <span className="min-w-0">
                      <strong>Lỗi quy tắc:</strong> Ngày hết hạn bảo hành (<code className="font-mono">{endDate}</code>) không được nhỏ hơn ngày nghiệm thu bàn giao (<code className="font-mono">{startDate}</code>).
                    </span>
                  </div>
                )}
              </section>

              {/* 4. Tài liệu bàn giao — BẮT BUỘC (BE: thiếu file trả 428 handover_required) */}
              <section className="rounded-xl border border-brand-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="rg-section-title"><Icon name="attach_file" size={16} className="text-brand-navy" /><p>Tài liệu / Biên bản bàn giao ban đầu</p></div>
                  <span className="rg-pill rg-pill-warn">Bắt buộc</span>
                </div>
                <p className="rg-hint">
                  Biên bản bàn giao (PDF, tối đa 20 MiB) được tải lên và xác minh trước khi tạo dự án. Điều phối nhanh dùng tài liệu này làm căn cứ bàn giao khi xác nhận độ phủ, nên không thể tạo dự án thiếu biên bản.
                </p>
                <label htmlFor="project-handover-file" className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg text-slate-600 ${busy ? 'border-brand-border bg-slate-50/60 cursor-not-allowed' : 'border-brand-border bg-slate-50/60 hover:border-brand-gold cursor-pointer'}`}>
                  <input
                    id="project-handover-file"
                    data-testid="project-handover-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => { onChangeHandoverFile?.(e.target.files?.[0] || null); e.target.value = '' }}
                  />
                  <Icon name="upload_file" size={18} className="text-slate-400" />
                  <span>{handoverFile ? 'Chọn tệp khác' : 'Chọn biên bản bàn giao (PDF)'}</span>
                </label>
                {handoverFile ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-brand-border text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      <Icon name="description" size={16} className="text-brand-gold shrink-0" />
                      <span className="truncate font-medium text-slate-800" data-testid="project-handover-name">{handoverFile.name}</span>
                      <span className="text-slate-500 shrink-0">{(handoverFile.size / 1048576).toFixed(2)} MB</span>
                    </div>
                    <button type="button" disabled={busy} onClick={() => onChangeHandoverFile?.(null)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer" title="Bỏ tệp">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-600 text-center" role="note">Chưa chọn biên bản bàn giao — không thể khởi tạo dự án.</p>
                )}
                {handoverFile && validateHandoverFile(handoverFile) && <p className="text-[11px] text-rose-600" role="alert">{validateHandoverFile(handoverFile)}</p>}
                {pendingCreate && <p className="rg-hint">Có yêu cầu tạo dự án đang chờ đối chiếu: chọn lại đúng tệp PDF đã dùng lần trước.</p>}
                {isSubmitting && stepLabel && <p className="rg-hint" role="status">{stepLabel}</p>}
              </section>
            </fieldset>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-brand-border bg-brand-surfaceAlt flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rg-btn !px-4 !py-2 !text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                isFormValid
                  ? 'bg-brand-gold text-white hover:bg-brand-goldMuted cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Icon
                name={isSubmitting ? 'sync' : 'add'}
                size={16}
                className={isSubmitting ? 'animate-spin' : ''}
              />
              <span>{isSubmitting ? 'Đang khởi tạo...' : pendingCreate ? receivedCreate ? 'Đọc lại kết quả' : 'Gửi lại đúng yêu cầu' : 'Khởi tạo dự án'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
