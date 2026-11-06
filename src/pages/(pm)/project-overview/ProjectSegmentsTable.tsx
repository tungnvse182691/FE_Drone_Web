import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { Segment } from './types'

interface ProjectSegmentsTableProps {
  projectId: string
  segments: Segment[]
  branches?: any[]
  mainlineLengthKm?: number
  branchesLengthKm?: number
  basePath: string
  onNavigate: (path: string) => void
  onViewSegment: (code: string) => void
  activeTab?: 'MAINLINE' | 'BRANCHES'
  onTabChange?: (tab: 'MAINLINE' | 'BRANCHES') => void
}

export const ProjectSegmentsTable: React.FC<ProjectSegmentsTableProps> = ({
  projectId,
  segments,
  branches = [],
  mainlineLengthKm = 0,
  branchesLengthKm = 0,
  basePath,
  onNavigate,
  onViewSegment,
  activeTab: controlledTab,
  onTabChange
}) => {
  const [internalTab, setInternalTab] = useState<'MAINLINE' | 'BRANCHES'>('MAINLINE')
  const currentTab = controlledTab !== undefined ? controlledTab : internalTab

  const handleTabSwitch = (tab: 'MAINLINE' | 'BRANCHES') => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalTab(tab)
    }
  }

  return (
    <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs overflow-hidden flex flex-col gap-4 font-body">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-slate-200" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDEFF2]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
            <h2 className="text-base font-bold text-slate-900 font-headline">
              Hình học tuyến &amp; Phân đoạn công trình
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý chi tiết phân đoạn lý trình của trục chính và hệ thống các tuyến nhánh phụ.
          </p>
        </div>

        <button
          onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
          type="button"
          className="text-xs text-[#8C6D1F] hover:text-[#C9A227] flex items-center gap-1 font-bold cursor-pointer shrink-0 transition-colors"
        >
          <span>Xem bản đồ GIS phân đoạn</span>
          <Icon name="chevron_right" size={16} />
        </button>
      </div>

      {/* Tab Switcher dạng Pill */}
      <div className="flex items-center gap-2 border-b border-[#EDEFF2] pb-3">
        <button
          type="button"
          onClick={() => handleTabSwitch('MAINLINE')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'MAINLINE'
              ? 'bg-[#1E40AF] text-white shadow-2xs ring-2 ring-[#1E40AF]/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${currentTab === 'MAINLINE' ? 'bg-white' : 'bg-[#1E40AF]'}`} />
          <span>Tuyến chính</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
            currentTab === 'MAINLINE' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {segments.length} đoạn • {mainlineLengthKm > 0 ? `${mainlineLengthKm}km` : '0km'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('BRANCHES')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'BRANCHES'
              ? 'bg-[#C9A227] text-white shadow-2xs ring-2 ring-[#C9A227]/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${currentTab === 'BRANCHES' ? 'bg-white' : 'bg-amber-500'}`} />
          <span>Tuyến phụ</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
            currentTab === 'BRANCHES' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {(() => {
              const branchesSegmentsCount = branches.reduce((acc, b) => acc + (b.segments && Array.isArray(b.segments) && b.segments.length > 0 ? b.segments.length : 1), 0)
              return branches.length > 0
                ? `${branches.length} nhánh (${branchesSegmentsCount} đoạn) • ${branchesLengthKm}km`
                : '0 nhánh'
            })()}
          </span>
        </button>
      </div>

      {/* CONTENT TAB 1: TUYẾN CHÍNH */}
      {currentTab === 'MAINLINE' && (
        <>
          {segments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Icon name="alt_route" size={22} />
              </div>
              <div className="max-w-md">
                <h4 className="text-xs font-bold text-slate-800">Chưa có phân đoạn lý trình nào trên tuyến chính</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Dự án mới khởi tạo. Kỹ sư PM cần nạp tọa độ GPX/KML và thiết lập tim tuyến để hệ thống tự động sinh các phân đoạn quản lý.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
                className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 mt-1 shadow-2xs"
              >
                <Icon name="add" size={14} />
                <span>Thiết lập tim tuyến</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-y border-[#EDEFF2] select-none">
                    <th className="py-3 px-3">Mã đoạn</th>
                    <th className="py-3 px-3">Phạm vi lý trình</th>
                    <th className="py-3 px-3">Chiều dài</th>
                    <th className="py-3 px-3">Tình trạng mặt đường</th>
                    <th className="py-3 px-3">Khiếm khuyết mở</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEFF2]">
                  {segments.map((seg) => (
                    <tr
                      key={seg.code}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        seg.status_type === 'WARNING' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{seg.code}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{seg.stationing}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{seg.length_km} km</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                            seg.status_type === 'GOOD'
                              ? 'bg-emerald-50 text-[#047857] border border-emerald-200'
                              : seg.status_type === 'WARNING'
                              ? 'bg-rose-50 text-[#B91C1C] border border-rose-200'
                              : seg.status_type === 'REPAIRING'
                              ? 'bg-amber-50 text-[#B45309] border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {seg.status_label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {seg.defects_count > 0 ? (
                          <span className="font-mono font-bold text-[#B91C1C] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px]">
                            {seg.open_defects}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">0 điểm</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onViewSegment(seg.code)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer text-xs inline-flex items-center gap-1"
                        >
                          <Icon name="visibility" size={14} />
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CONTENT TAB 2: TUYẾN PHỤ (BRANCHES) */}
      {currentTab === 'BRANCHES' && (
        <>
          {branches.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Icon name="call_split" size={22} />
              </div>
              <div className="max-w-md">
                <h4 className="text-xs font-bold text-slate-800">Dự án hiện chưa có tuyến phụ (nhánh rẽ)</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Công trình đang chỉ bao gồm trục chính. Kỹ sư PM có thể vào màn hình thiết lập tim tuyến để bổ sung các nhánh rẽ kết nối (nút giao, đường gom, nhánh phụ).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
                className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 mt-1 shadow-2xs"
              >
                <Icon name="add" size={14} />
                <span>Thêm tuyến nhánh phụ</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-y border-[#EDEFF2] select-none">
                    <th className="py-3 px-3">Mã &amp; Tên tuyến nhánh</th>
                    <th className="py-3 px-3">Điểm tách nhánh (Diverge)</th>
                    <th className="py-3 px-3">Chiều dài</th>
                    <th className="py-3 px-3">Quy mô mặt cắt</th>
                    <th className="py-3 px-3 text-center">Phân đoạn nội bộ</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEFF2]">
                  {branches.map((b: any) => {
                    const bLen = b.lengthKm || (b.coords && b.coords.length >= 2 ? 0.5 : 0)
                    const divergeKmText = b.divergeStationKm !== undefined
                      ? `Km ${b.divergeStationKm.toFixed(3).replace('.', '+')}`
                      : 'Đầu tuyến'
                    const sideText = b.divergeSide === 'LEFT' ? 'Bên Trái' : 'Bên Phải'

                    return (
                      <tr key={b.id || b.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] mr-1.5">
                            {b.code}
                          </span>
                          <span className="font-bold text-slate-900">{b.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          <span>{divergeKmText}</span>
                          <span className="ml-1 text-[11px] text-slate-500">({sideText})</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {bLen >= 1 ? `${bLen.toFixed(2)} km` : `${Math.round(bLen * 1000)} m`}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <div className="font-semibold">Rộng {b.roadWidthM || 8.0}m • {b.laneCount || 2} làn</div>
                          <div className="text-[11px] text-slate-500 font-mono">{b.surfaceMaterial || 'Mặt BTN C12.5'}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-semibold text-slate-800">
                            {b.segments && b.segments.length > 0 ? `${b.segments.length} đoạn` : '1 đoạn'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer text-xs inline-flex items-center gap-1"
                          >
                            <Icon name="map" size={14} />
                            <span>Bản đồ</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

