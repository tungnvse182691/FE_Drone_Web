import React from 'react'
import { FileText, X } from 'lucide-react'
import type { ProposalWorkPackage } from './types'

export interface ProposalPDFPreviewModalProps {
  isPDFPreviewModalOpen: boolean
  setIsPDFPreviewModalOpen: (open: boolean) => void
  packages: ProposalWorkPackage[]
  showToast: (msg: string) => void
}

export const ProposalPDFPreviewModal: React.FC<ProposalPDFPreviewModalProps> = ({
  isPDFPreviewModalOpen,
  setIsPDFPreviewModalOpen,
  packages,
  showToast,
}) => {
  if (!isPDFPreviewModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-base text-brand-dark">Kế Hoạch Sửa Chữa Kỹ Thuật (PDF)</h3>
          </div>
          <button
            onClick={() => setIsPDFPreviewModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div className="font-bold text-slate-800">CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG HOÀNG HẢI</div>
          <div className="text-slate-600">Ban Điều Hành Dự Án Bảo Trì Quốc Lộ 1A (PK-04)</div>
          <div className="font-mono text-[11px] text-slate-500">Mã văn bản: KH-2026/QL1A-PK04-O&amp;M</div>
          <div className="pt-2 border-t border-slate-200 text-slate-700">
            Tập hợp tổng hợp <strong>{packages.length} gói đề xuất kỹ thuật</strong> với tổng số{' '}
            <strong className="text-brand-dark font-mono">
              {packages.reduce((sum, p) => sum + p.defect_count, 0)} hạng mục khiếm khuyết
            </strong>{' '}
            được lập phương án thi công trên toàn tuyến.
          </div>
          <div className="text-[11px] text-slate-500">
            • Trạng thái hồ sơ: Đã đồng bộ với máy chủ O&amp;M Hoàng Hải
            <br />
            • Tiêu chuẩn nghiệm thu: TCVN 8819:2011 &amp; QCVN 41:2019/BGTVT
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsPDFPreviewModalOpen(false)}
            type="button"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              setIsPDFPreviewModalOpen(false)
              showToast('Đang tạo và tải xuống file PDF: Ke_hoach_ky_thuat_QL1A_PK04.pdf')
            }}
            type="button"
            className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Tải xuống file PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
