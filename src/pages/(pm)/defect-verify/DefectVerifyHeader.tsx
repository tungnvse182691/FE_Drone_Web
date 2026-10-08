import React from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Defect } from '../../../types/domain'
import { Severity } from '../../../types/enums'
import { Icon } from '../../../components/ui/Icon'
import { mockDefects } from '../../../api/mock/data'

interface DefectVerifyHeaderProps {
  defect: Defect
  severity: Severity
  viewMode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP'
  setViewMode: (mode: 'SINGLE' | 'TEMPORAL' | 'GIS_MAP') => void
  onBack: () => void
  availableItems?: Array<{ id: string; label: string }>
}

export const DefectVerifyHeader: React.FC<DefectVerifyHeaderProps> = ({
  defect,
  severity,
  viewMode,
  setViewMode,
  onBack,
  availableItems
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Cột trái: Nút quay lại + Tiêu đề + Badge + Selector đổi defect từ API */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Quay lại danh sách"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1D20] tracking-tight">
              Thẩm Định Chi Tiết Hư Hỏng: {defect.code}
            </h1>
            <StatusBadge status={defect.status} />
            <StatusBadge status={severity} />

            {/* Selector nhanh giữa các Defect thực tế trong đợt bay */}
            <div className="ml-2 flex items-center gap-1.5 text-xs bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#E2E5E9]">
              <Icon name="swap_horiz" size={16} className="text-slate-400" />
              <span className="text-slate-500 font-medium">Hồ sơ:</span>
              <select
                value={defect.id}
                onChange={(e) => navigate(`/pm/defects/${e.target.value}/${viewMode === 'TEMPORAL' ? 'verify-b' : 'verify-a'}`)}
                className="bg-transparent font-semibold text-[#1A1D20] cursor-pointer focus:outline-none"
                title="Chuyển sang xem hư hỏng khác trong đợt bay"
              >
                {availableItems && availableItems.length > 0
                  ? availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))
                  : mockDefects.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} (Km{d.chainage_km} • {d.previous_epoch_image_url ? 'Có ảnh kỳ trước' : 'Mốc Baseline T0'})
                      </option>
                    ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dự án: <span className="font-medium text-slate-700">{defect.project_name}</span> • Lý trình: <strong className="text-slate-800">Km{defect.chainage_km}</strong> • Tọa độ GPS: ({defect.gps_lat}, {defect.gps_lng})
          </p>
        </div>
      </div>

      {/* Cột phải: View Mode Toggle (Material Symbols) */}
      <div className="flex items-center bg-[#F8F9FA] p-1 rounded-xl border border-[#E2E5E9]">
        <button
          type="button"
          onClick={() => {
            setViewMode('SINGLE')
            navigate(`/pm/defects/${defect.id}/verify-a`, { replace: true })
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'SINGLE'
              ? 'bg-white text-[#1A1D20] shadow-2xs font-bold border border-[#E2E5E9]'
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
            navigate(`/pm/defects/${defect.id}/verify-b`, { replace: true })
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'TEMPORAL'
              ? 'bg-white text-[#8C6D1F] shadow-2xs font-bold border border-[#E2E5E9]'
              : 'text-slate-600 hover:text-[#1A1D20]'
          }`}
        >
          <Icon name="compare" size={16} className={viewMode === 'TEMPORAL' ? 'text-[#C9A227]' : 'text-slate-400'} />
          <span>So sánh đa kỳ (Trước / Sau)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('GIS_MAP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            viewMode === 'GIS_MAP'
              ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
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
