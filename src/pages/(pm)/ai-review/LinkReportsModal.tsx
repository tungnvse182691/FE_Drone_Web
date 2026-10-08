import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface LinkReportsModalProps {
  isOpen: boolean
  onClose: () => void
  cases: TriageCase[]
  selectedReportIds: string[]
  linkMasterCaseId: string
  setLinkMasterCaseId: (id: string) => void
  linkAuditNotes: string
  setLinkAuditNotes: (notes: string) => void
  onConfirmLinkReports: () => void
}

export const LinkReportsModal: React.FC<LinkReportsModalProps> = ({
  isOpen,
  onClose,
  cases,
  selectedReportIds,
  linkMasterCaseId,
  setLinkMasterCaseId,
  linkAuditNotes,
  setLinkAuditNotes,
  onConfirmLinkReports,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-brand-gold border border-amber-200">
              <Icon name="link" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Liên Kết Báo Trùng Phản Ánh (PA04)</h3>
              <p className="text-xs text-slate-500">
                Quy chuẩn BR-30, BR-31: Hợp nhất nhiều báo cáo thành 1 Master Case
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Pick Master Case */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              1. Chọn Hồ Sơ Tiếp Nhận Chính (Master Case):
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {cases
                .filter((c) => selectedReportIds.includes(c.id))
                .map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      linkMasterCaseId === c.id
                        ? 'bg-amber-50 border-brand-gold text-brand-dark'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="masterCaseSelect"
                        checked={linkMasterCaseId === c.id}
                        onChange={() => setLinkMasterCaseId(c.id)}
                        className="text-brand-gold focus:ring-brand-gold accent-brand-gold"
                      />
                      <div>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-slate-500 ml-2">
                          ({c.stationing} - {c.defect_title})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{c.reporter_name || c.source_label}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Audit justification */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              2. Lý do liên kết &amp; đối chiếu không gian (Audit Log):
            </label>
            <textarea
              rows={2}
              value={linkAuditNotes}
              onChange={(e) => setLinkAuditNotes(e.target.value)}
              placeholder="Nhập lý do liên kết (ví dụ: các phản ánh cách nhau dưới 2m, cùng phản ánh ổ gà Km 1025+390)..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Icon name="warning" size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Các phản ánh vệ tinh sẽ được gắn cờ <strong>MERGED</strong>, toàn bộ ảnh hiện trường và thông tin
              người dân được giữ nguyên và tổng hợp vào hồ sơ chính, đảm bảo không tạo 2 lệnh sửa chữa cùng 1 lỗi.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmLinkReports}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="link" size={16} />
            <span>Xác Nhận Liên Kết {selectedReportIds.length} Báo Cáo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
