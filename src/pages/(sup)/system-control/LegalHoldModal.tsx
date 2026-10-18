import React, { useState, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { LegalHoldProject } from '../../../types/domain'
import { useToastStore } from '../../../store/toastStore'

export interface LegalHoldModalProps {
  isOpen: boolean
  project: LegalHoldProject | null
  onClose: () => void
  onConfirm: (payload: {
    enabled: boolean
    reason?: string
    authority?: string
    reference?: string
  }) => Promise<void>
}

export const LegalHoldModal: React.FC<LegalHoldModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm
}) => {
  const toast = useToastStore()
  const [reason, setReason] = useState('')
  const [authority, setAuthority] = useState('')
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEnabling = project ? !project.is_legal_hold : true

  useEffect(() => {
    if (project && project.is_legal_hold) {
      // Nếu đang bật, điền sẵn thông tin hiện tại để xem trước khi gỡ
      setReason(project.hold_reason || '')
      setAuthority(project.hold_authority || '')
      setReference(project.hold_reference || '')
    } else {
      setReason('')
      setAuthority('')
      setReference('')
    }
  }, [project, isOpen])

  if (!isOpen || !project) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEnabling) {
      if (!reason.trim() || !authority.trim() || !reference.trim()) {
        toast.warning('Vui lòng nhập đầy đủ lý do, cơ quan yêu cầu và số hiệu công văn căn cứ.')
        return
      }

      try {
        setIsSubmitting(true)
        await onConfirm({
          enabled: true,
          reason: reason.trim(),
          authority: authority.trim(),
          reference: reference.trim()
        })
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        setIsSubmitting(true)
        await onConfirm({ enabled: false })
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4 font-body animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isEnabling
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              <Icon name={isEnabling ? 'gavel' : 'lock_open'} size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-headline">
                {isEnabling
                  ? 'Thiết lập Phong tỏa Pháp lý (Legal Hold)'
                  : 'Gỡ bỏ Phong tỏa Pháp lý (Legal Hold)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                PUT /projects/{'{projectId}'}/legal-hold • QT14, BR-45
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* THÔNG TIN DỰ ÁN */}
        <div className="px-5 pt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block truncate">
                {project.project_name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Mã dự án: {project.project_code} • Hạn BH: {project.warranty_end_date}
              </span>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                project.is_legal_hold
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {project.is_legal_hold ? 'ĐANG PHONG TỎA' : 'BÌNH THƯỜNG'}
            </span>
          </div>
        </div>

        {/* FORM / BODY */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {isEnabling ? (
            <>
              {/* CẢNH BÁO PHÁP LÝ */}
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2.5 leading-relaxed">
                <Icon name="warning" size={17} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cơ chế bảo vệ dữ liệu (QT14 &amp; BR-45):</strong> Khi kích hoạt, hệ thống sẽ khóa cứng toàn bộ dữ liệu công trình. Mọi yêu cầu giải phóng/xóa dữ liệu sẽ bị <strong>từ chối tự động</strong> kể cả khi đã hết hạn bảo hành trên 5 năm.
                </div>
              </div>

              {/* LÝ DO PHONG TỎA */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Lý do phong tỏa hồ sơ công trình: <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Quy chuẩn thanh tra</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập chi tiết lý do (ví dụ: Thanh tra đột xuất hồ sơ hoàn công và kiểm tra chất lượng khe co giãn BTXM...)"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* CƠ QUAN YÊU CẦU & SỐ HIỆU VĂN BẢN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Cơ quan có thẩm quyền: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="VD: Ban QLDA Thăng Long, Cục Đường Bộ..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Số hiệu công văn / Quyết định: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="VD: Công văn số 8492/BGTVT-TTr..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-mono"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* XÁC NHẬN GỠ BỎ PHONG TỎA */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2.5 leading-relaxed">
                <Icon name="info" size={17} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Xác nhận gỡ bỏ phong tỏa:</strong> Bạn có chắc chắn muốn hủy cờ Legal Hold cho dự án này không? Sau khi gỡ bỏ, hồ sơ hết hạn bảo hành trên 5 năm sẽ có thể được đề xuất giải phóng dữ liệu theo quy định lưu trữ.
                </div>
              </div>

              {/* XEM LẠI LÝ DO ĐANG PHONG TỎA */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Icon name="lock" size={14} className="text-rose-600" />
                  <span>Lý do phong tỏa hiện tại:</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "{project.hold_reason || 'Không có lý do chi tiết'}"
                </p>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                  Cơ quan: {project.hold_authority || 'N/A'} • VB: {project.hold_reference || 'N/A'}
                </div>
              </div>
            </>
          )}

          {/* FOOTER ACTION */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 ${
                isEnabling
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Icon name="sync" size={15} className="animate-spin text-white" />
                  <span>Đang xử lý...</span>
                </>
              ) : isEnabling ? (
                <>
                  <Icon name="gavel" size={15} />
                  <span>Kích hoạt Phong tỏa (Legal Hold)</span>
                </>
              ) : (
                <>
                  <Icon name="lock_open" size={15} />
                  <span>Xác nhận Gỡ phong tỏa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
