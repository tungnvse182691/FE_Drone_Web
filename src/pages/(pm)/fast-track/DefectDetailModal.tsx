import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { DefectItem } from './types'

export interface DefectDetailModalProps {
  detailDefect: DefectItem | null
  onClose: () => void
}

function formatDefectTypeVi(code?: string): string {
  if (!code) return 'Chưa phân loại'
  const c = code.toUpperCase()
  if (c.includes('POTHOLE')) return 'Ổ gà'
  if (c.includes('CRACK')) return 'Nứt mặt đường'
  if (c.includes('RUT')) return 'Vệt lún bánh xe'
  if (c.includes('RAVEL')) return 'Bong bật cốt liệu'
  return code
}

function formatSeverityVi(sev?: string): string {
  switch (sev?.toUpperCase()) {
    case 'LOW':
      return 'Thấp (Nhẹ)'
    case 'MEDIUM':
      return 'Trung bình (Vừa)'
    case 'HIGH':
      return 'Cao (Nặng)'
    case 'CRITICAL':
      return 'Khẩn cấp (Rất nặng)'
    default:
      return sev || 'Chưa xác định'
  }
}

function formatStatusVi(st?: string): string {
  switch (st?.toUpperCase()) {
    case 'OPEN':
      return 'Chờ xử lý'
    case 'IN_PROGRESS':
      return 'Đang thi công'
    case 'RESOLVED':
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'CLOSED':
      return 'Đã đóng hồ sơ'
    default:
      return st || 'Đang theo dõi'
  }
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  detailDefect,
  onClose
}) => {
  if (!detailDefect) return null

  const isEligible = detailDefect.isFastTrackEligible ?? true
  const missingReasons = detailDefect.violationReason ? [detailDefect.violationReason] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-brand-dark font-mono">{detailDefect.code}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isEligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isEligible ? 'Đạt chuẩn xử lý nhanh' : 'Không đủ điều kiện'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Loại khiếm khuyết: <strong className="text-slate-800">{formatDefectTypeVi(detailDefect.defectTypeCode)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Mức độ nghiêm trọng:</span>
              <div className="font-bold text-sm text-brand-dark">
                {formatSeverityVi(detailDefect.severity)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Trạng thái hiện tại:</span>
              <div className="font-bold text-sm text-brand-dark">
                {formatStatusVi(detailDefect.status)}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>Mã định danh CSDL: <strong className="font-mono text-slate-800">{detailDefect.id}</strong></div>
            <div>Đội thi công phụ trách: <strong>{detailDefect.assignedCrew || 'Chưa phân công'}</strong></div>
            {detailDefect.version && (
              <div>Phiên bản bản ghi: <strong className="font-mono text-slate-800">{detailDefect.version}</strong></div>
            )}
          </div>

          {!isEligible && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <Icon name="report" size={14} className="text-rose-600 shrink-0" />
                <span>Lý do không đủ điều kiện xử lý nhanh:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 font-medium">
                {missingReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
