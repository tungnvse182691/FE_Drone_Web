import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'

interface CloseProjectModalProps {
  isOpen: boolean
  project: HubProject | null
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export const CloseProjectModal: React.FC<CloseProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('')
  const [earlyAcknowledge, setEarlyAcknowledge] = useState(false)
  const [irrevocableAcknowledge, setIrrevocableAcknowledge] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen || !project) return null

  const hasOpenDefects = (project.open_defects || 0) > 0
  const isEarlyClose = (project.days_remaining || 0) > 0 || (project.warranty_passed_percent || 0) < 100

  // Điều kiện để submit:
  // 1. Không còn hư hỏng mở (Bắt buộc tuyệt đối)
  // 2. Phải có lý do đóng
  // 3. Phải cam kết hiểu rõ hành động không thể đảo ngược
  // 4. Nếu đóng trước hạn, phải cam kết có thỏa thuận bằng văn bản
  const canSubmit =
    !hasOpenDefects &&
    reason.trim().length >= 10 &&
    irrevocableAcknowledge &&
    (!isEarlyClose || earlyAcknowledge)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasOpenDefects) {
      setErrorMsg(`Không thể đóng dự án. Vẫn còn ${project.open_defects} điểm hư hỏng chưa được xử lý và nghiệm thu đạt (PASSED).`)
      return
    }

    if (reason.trim().length < 10) {
      setErrorMsg('Vui lòng nhập lý do / kết luận nghiệm thu chi tiết (tối thiểu 10 ký tự).')
      return
    }

    if (!irrevocableAcknowledge) {
      setErrorMsg('Vui lòng xác nhận cam kết đóng băng hồ sơ vĩnh viễn.')
      return
    }

    if (isEarlyClose && !earlyAcknowledge) {
      setErrorMsg('Vui lòng xác nhận đã có văn bản chấp thuận đóng bảo hành trước hạn.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      await onConfirm(reason.trim())
      setReason('')
      setEarlyAcknowledge(false)
      setIrrevocableAcknowledge(false)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đóng dự án')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrorMsg(null)
    setReason('')
    setEarlyAcknowledge(false)
    setIrrevocableAcknowledge(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150 font-body">
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hasOpenDefects ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-800'}`}>
              <Icon name={hasOpenDefects ? 'block' : 'lock'} size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-headline">
                Đóng dự án bảo hành (DA12)
              </h3>
              <p className="text-[11px] text-slate-500">
                Đóng băng hồ sơ, kết thúc bảo hành &amp; lưu trữ số 5 năm (QT13, BR-45)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* TÓM TẮT DỰ ÁN */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{project.name}</span>
              <span className="font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                {project.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600 text-[11px]">
              <div>
                <span className="text-slate-400">Lý trình: </span>
                <span className="font-mono font-medium text-slate-800">{project.stationing_text}</span>
              </div>
              <div>
                <span className="text-slate-400">PM phụ trách: </span>
                <span className="font-medium text-slate-800">{project.pm_name}</span>
              </div>
              <div>
                <span className="text-slate-400">Tiến độ bảo hành: </span>
                <span className={`font-mono font-medium ${isEarlyClose ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                  {project.warranty_passed_percent}%
                </span>
                <span className="text-slate-400">
                  {project.days_remaining > 0 ? ` (còn ${project.days_remaining} ngày)` : ' (Đã hết hạn)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Hư hỏng đang mở: </span>
                <span className={`font-mono font-bold ${hasOpenDefects ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {project.open_defects} điểm {hasOpenDefects ? '(Chưa đạt điều kiện)' : '(Đạt chuẩn)'}
                </span>
              </div>
            </div>
          </div>

          {/* 1. KHÓA CỨNG: CÒN HƯ HỎNG CHƯA KHẮC PHỤC */}
          {hasOpenDefects && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <Icon name="error" size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] space-y-1">
                <strong className="font-bold block text-rose-800">
                  VI PHẠM ĐIỀU KIỆN ĐÓNG BẢO HÀNH (BR-45):
                </strong>
                <span>
                  Công trình vẫn còn <strong>{project.open_defects} điểm khiếm khuyết</strong> chưa hoàn thành sửa chữa hoặc chưa qua nghiệm thu đạt chuẩn (PASSED). Giám sát viên không được phép ký đóng dự án khi còn tồn đọng lỗi.
                </span>
              </div>
            </div>
          )}

          {/* 2. CẢNH BÁO NẾU ĐÓNG TRƯỚC HẠN */}
          {!hasOpenDefects && isEarlyClose && (
            <div className="p-3 bg-amber-50/90 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Icon name="warning" size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] space-y-1">
                <strong className="font-bold block text-amber-900">
                  CẢNH BÁO ĐÓNG DỰ ÁN TRƯỚC THỜI HẠN:
                </strong>
                <span>
                  Dự án mới trôi qua <strong>{project.warranty_passed_percent}%</strong> thời gian bảo hành (còn lại {project.days_remaining} ngày). Việc đóng trước hạn chỉ được áp dụng khi có văn bản chấp thuận của Chủ đầu tư/Cục Quản lý đường bộ.
                </span>
                <label htmlFor="chk-early-ack" className="flex items-center gap-2 pt-1 font-medium text-amber-900 cursor-pointer select-none">
                  <input
                    id="chk-early-ack"
                    type="checkbox"
                    checked={earlyAcknowledge}
                    onChange={(e) => setEarlyAcknowledge(e.target.checked)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Tôi xác nhận có văn bản đồng thuận kết thúc bảo hành trước hạn</span>
                </label>
              </div>
            </div>
          )}

          {/* 3. CAM KẾT KHÔNG THỂ HOÀN TÁC (IRREVERSIBLE RULE) */}
          {!hasOpenDefects && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <Icon name="lock" size={18} className="text-slate-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] space-y-1">
                <strong className="font-bold block text-slate-900">
                  QUY CHẾ ĐÓNG BĂNG VĨNH VIỄN (KHÔNG THỂ MỞ LẠI):
                </strong>
                <span>
                  Sau khi đóng, hồ sơ kỹ thuật sẽ bị khóa chỉ đọc, chuyển vào kho số lưu trữ tối thiểu <strong>5 năm</strong>. Toàn bộ tính năng lập khảo sát và tạo đợt sửa chữa sẽ bị ngừng vĩnh viễn.
                </span>
                <label htmlFor="chk-irrevocable-ack" className="flex items-center gap-2 pt-1 font-medium text-slate-900 cursor-pointer select-none">
                  <input
                    id="chk-irrevocable-ack"
                    type="checkbox"
                    checked={irrevocableAcknowledge}
                    onChange={(e) => setIrrevocableAcknowledge(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Tôi hiểu rằng dự án đã đóng sẽ KHÔNG THỂ mở lại</span>
                </label>
              </div>
            </div>
          )}

          {/* LÝ DO / KẾT LUẬN NGHIỆM THU ĐÓNG DỰ ÁN */}
          <div className="space-y-1.5">
            <label htmlFor="close-reason" className="block text-xs font-semibold text-slate-700">
              Lý do / Kết luận nghiệm thu đóng bảo hành <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="close-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting || hasOpenDefects}
              placeholder={
                hasOpenDefects
                  ? 'Bị khóa do công trình còn khiếm khuyết chưa khắc phục...'
                  : 'Nhập số biên bản nghiệm thu hết hạn bảo hành, quyết định giải tỏa bảo lãnh hoặc kết luận hoàn thành trách nhiệm công trình...'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold resize-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400">
              Nội dung kết luận sẽ được lưu vĩnh viễn vào hồ sơ lưu trữ và nhật ký kiểm toán (Audit Trail).
            </p>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <Icon name="error" size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODAL FOOTER */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Icon name="sync" size={16} className="animate-spin text-white" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Icon name="lock" size={16} />
                  <span>Xác nhận đóng dự án (DA12)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
