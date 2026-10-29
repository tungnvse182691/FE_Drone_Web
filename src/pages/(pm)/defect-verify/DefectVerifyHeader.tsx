import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Defect } from '../../../types/domain'
import { Severity } from '../../../types/enums'
import { Icon } from '../../../components/ui/Icon'

interface DefectVerifyHeaderProps {
  defect: Defect
  severity: Severity
  viewMode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP'
  setViewMode: (mode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP') => void
  onBack: () => void
  availableItems?: Array<{ id: string; label: string }>
  basePath?: string
  isRecurrent?: boolean
  linkedPriorCode?: string | null
}

export const DefectVerifyHeader: React.FC<DefectVerifyHeaderProps> = ({
  defect,
  severity,
  viewMode,
  setViewMode,
  onBack,
  availableItems = [],
  basePath = '/pm',
  isRecurrent = false,
  linkedPriorCode = null
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex items-center justify-between gap-4 flex-wrap font-body">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-[#1E40AF] to-slate-200" />
      {/* Cột trái: Nút quay lại + Tiêu đề + Badge + Selector đổi ứng viên AI / Defect từ API CSDL */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-[#E2E5E9]"
          title="Quay lại danh sách"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1D20] tracking-tight font-headline">
              Thẩm Định Khiếm Khuyết CSDL: {defect.code}
            </h1>
            <StatusBadge status={defect.status} />
            <StatusBadge status={severity} />
            {defect.decision_kind === 'LINK_EXISTING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Icon name="link" size={14} className="text-[#C9A227]" />
                <span>
                  Đã gom vào hồ sơ cũ ({linkedPriorCode || (defect.linked_defect_id ? `#DEF-${defect.linked_defect_id.slice(0, 8).toUpperCase()}` : 'Khiếm khuyết')})
                </span>
              </span>
            )}
            {defect.decision_kind === 'KEEP_NEW' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <Icon name="check_circle" size={14} className="text-emerald-600" />
                <span>
                  Đã duyệt tạo mới {defect.linked_defect_id ? `(#DEF-${defect.linked_defect_id.slice(0, 8).toUpperCase()})` : ''}
                </span>
              </span>
            )}
            {defect.decision_kind === 'REJECT' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                <Icon name="cancel" size={14} className="text-rose-600" />
                <span>Đã từ chối (Báo sai)</span>
              </span>
            )}

            {/* Selector nhanh giữa các AI Candidate / Defect thực tế trong CSDL */}
            {availableItems.length > 0 && (
              <div className="ml-2 flex items-center gap-1.5 text-xs bg-[#F8F9FA] px-3 py-1 rounded-full border border-[#E2E5E9]">
                <Icon name="swap_horiz" size={16} className="text-slate-400" />
                <span className="text-slate-500 font-semibold">Hồ sơ CSDL:</span>
                <select
                  value={defect.id}
                  onChange={(e) =>
                    navigate(
                      `${basePath}/defects/${e.target.value}/${viewMode === 'TEMPORAL' ? 'verify-b' : 'verify-a'}`,
                      { state: location.state }
                    )
                  }
                  className="bg-transparent font-bold text-[#1A1D20] cursor-pointer focus:outline-none max-w-[280px] truncate"
                  title="Chuyển sang xem khiếm khuyết khác từ CSDL Backend"
                >
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dự án: <span className="font-semibold text-slate-700">{defect.project_name}</span> • Lý trình:{' '}
            <strong className="text-slate-800 font-mono">
              Km {Math.floor(defect.chainage_km)}+
              {String(Math.round((defect.chainage_km % 1) * 1000)).padStart(3, '0')}
            </strong>
            {defect.fixture_version && (
              <>
                {' '}
                • Mô hình AI: <span className="font-mono font-semibold text-slate-700">{defect.fixture_version}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cột phải: View Mode Toggle */}
      <div className="flex items-center bg-[#F8F9FA] p-1.5 rounded-full border border-[#E2E5E9] gap-1">
        <button
          type="button"
          onClick={() => {
            setViewMode('SINGLE')
            navigate(`${basePath}/defects/${defect.id}/verify-a`, { replace: true, state: location.state })
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            viewMode === 'SINGLE'
              ? 'bg-white text-[#1A1D20] shadow-2xs border border-[#E2E5E9] ring-2 ring-slate-900/5'
              : 'text-slate-600 hover:text-[#1A1D20]'
          }`}
        >
          <Icon name="layers" size={16} className={viewMode === 'SINGLE' ? 'text-[#8C6D1F]' : 'text-slate-400'} />
          <span>Khung bao AI (Đơn kỳ)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewMode('TEMPORAL')
            navigate(`${basePath}/defects/${defect.id}/verify-b`, { replace: true, state: location.state })
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            viewMode === 'TEMPORAL'
              ? 'bg-white text-[#8C6D1F] shadow-2xs border border-[#E2E5E9] ring-2 ring-slate-900/5'
              : 'text-slate-600 hover:text-[#1A1D20]'
          }`}
        >
          <Icon name="compare" size={16} className={viewMode === 'TEMPORAL' ? 'text-[#C9A227]' : 'text-slate-400'} />
          <span>So sánh đa kỳ (Trước / Sau)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('GIS_MAP')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            viewMode === 'GIS_MAP'
              ? 'bg-[#C9A227] text-white shadow-2xs'
              : 'text-slate-600 hover:text-[#1A1D20]'
          }`}
        >
          <Icon name="map" size={16} className={viewMode === 'GIS_MAP' ? 'text-white' : 'text-slate-400'} />
          <span>Vị trí GIS & Không gian</span>
        </button>
      </div>
    </div>
  )
}

export default DefectVerifyHeader
