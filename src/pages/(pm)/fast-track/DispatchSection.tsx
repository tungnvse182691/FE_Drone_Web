import React from 'react'
import {
  Users2,
  Layers,
  Wrench,
  Flame,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Eye,
  MapPin,
  Send
} from 'lucide-react'
import { DefectItem, RouteConfig, PolicyThresholdConfig, WorkMode } from './types'

interface DispatchSectionProps {
  defects: DefectItem[]
  filteredDefects: DefectItem[]
  selectedDefectIds: string[]
  workMode: WorkMode
  routeFilter: string
  crewFilter: string
  statusFilter: string
  currentPolicy: PolicyThresholdConfig
  currentRouteConfig: RouteConfig
  mapLayer: 'SATELLITE' | 'VECTOR'
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  hasViolationItem: boolean
  surveyDistanceM: number
  selectedItems: DefectItem[]
  handleChangeWorkMode: (mode: WorkMode) => void
  handleRouteChange: (routeId: string) => void
  setCrewFilter: (crew: string) => void
  setStatusFilter: (status: string) => void
  handleSelectAll: (checked: boolean) => void
  handleToggleSelect: (id: string) => void
  handleAssignCrew: (defectId: string, crew: string) => void
  setDetailDefect: (defect: DefectItem | null) => void
  setMapLayer: (layer: 'SATELLITE' | 'VECTOR') => void
  setSelectedDefectIds: React.Dispatch<React.SetStateAction<string[]>>
  showToast: (msg: string) => void
  handleDispatchBatch: () => void
  handleRepairDirect: () => void
  handleEmergencyDispatch: () => void
}

export const DispatchSection: React.FC<DispatchSectionProps> = ({
  defects,
  filteredDefects,
  selectedDefectIds,
  workMode,
  routeFilter,
  crewFilter,
  statusFilter,
  currentPolicy,
  currentRouteConfig,
  mapLayer,
  mapContainerRef,
  hasViolationItem,
  surveyDistanceM,
  selectedItems,
  handleChangeWorkMode,
  handleRouteChange,
  setCrewFilter,
  setStatusFilter,
  handleSelectAll,
  handleToggleSelect,
  handleAssignCrew,
  setDetailDefect,
  setMapLayer,
  setSelectedDefectIds,
  showToast,
  handleDispatchBatch,
  handleRepairDirect,
  handleEmergencyDispatch
}) => {
  return (
    <div id="dispatch-table-section" className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
      {/* Header Dispatch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
            <Users2 className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-dark">Điều phối & Giao việc đội ngũ kỹ thuật hiện trường</h2>
            <p className="text-xs text-slate-500">
              Phê duyệt lệnh xuất quân, lựa chọn phương thức thi công và quản lý trách nhiệm hiện trường
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
          <span>{defects.length} khiếm khuyết đang chờ xử lý</span>
        </div>
      </div>

      {/* 3 Large Radio Tabs for Work Mode */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Chế độ giao việc (Work Dispatch Mode)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tab 1: Gom lô đo đạc (MEASURE_ONLY) */}
          <label
            onClick={() => handleChangeWorkMode('MEASURE_ONLY')}
            className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
              workMode === 'MEASURE_ONLY'
                ? 'bg-amber-50/50 border-2 border-brand-gold shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#C9A227]">
                  <Layers className="w-5 h-5 text-[#C9A227]" />
                </span>
                <span className="font-bold text-sm text-brand-dark">Gom lô đo đạc</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C9A227] text-white">
                Đã chọn {selectedDefectIds.length} lỗi
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Gom nhiều khiếm khuyết cùng tuyến để đội Crew đo 1 lượt, nghiêm cấm tự ý sửa khi chưa lập phương án.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-[#8F7212]">
              <span className="px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-[10px]">
                MEASURE_ONLY
              </span>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-gold flex items-center justify-center">
                {workMode === 'MEASURE_ONLY' && <span className="w-2 h-2 rounded-full bg-brand-gold"></span>}
              </span>
            </div>
          </label>

          {/* Tab 2: Đo và Sửa ngay (INSPECT_AND_REPAIR) */}
          <label
            onClick={() => handleChangeWorkMode('INSPECT_AND_REPAIR')}
            className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
              workMode === 'INSPECT_AND_REPAIR'
                ? 'bg-emerald-50/60 border-2 border-emerald-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-brand-dark">Đo và Sửa ngay</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Fast Track Direct
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Chỉ áp dụng cho 1 lỗi mức LOW đơn lẻ thỏa mãn policy Fast Track. Cho phép mang vật liệu vá nguội trực tiếp.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-emerald-700">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[10px]">
                INSPECT_AND_REPAIR
              </span>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                {workMode === 'INSPECT_AND_REPAIR' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
              </span>
            </div>
          </label>

          {/* Tab 3: Xử lý khẩn cấp (EMERGENCY) */}
          <label
            onClick={() => handleChangeWorkMode('EMERGENCY')}
            className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
              workMode === 'EMERGENCY'
                ? 'bg-rose-50/60 border-2 border-rose-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-sm text-brand-dark">Xử lý khẩn cấp</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                24/7 Priority
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Khắc phục tạm thời để thông xe nhanh, phân luồng an toàn khẩn cấp, không đóng lỗi gốc trên hệ thống.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-rose-700">
              <span className="px-2 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-[10px]">
                EMERGENCY_DISPATCH
              </span>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-600 flex items-center justify-center">
                {workMode === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase">Tuyến đường & Phân đoạn</label>
          <select
            value={routeFilter}
            onChange={(e) => handleRouteChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
          >
            <option value="QL1A_PK04">QL1A - Giai đoạn 2 (Km 1025 - Km 1045)</option>
            <option value="QL1A_PK01">QL1A - Giai đoạn 1 (Km 1000 - Km 1025)</option>
            <option value="EXPRESSWAY_LINK">Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)</option>
            <option value="PHANTHIET_DAUGIAY">Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase">Đội hiện trường phân bổ</label>
          <select
            value={crewFilter}
            onChange={(e) => setCrewFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
          >
            <option value="ALL">Tất cả các tổ đội</option>
            <option value="Tổ tuần tra số 01">Tổ tuần tra số 01 - Kỹ sư Kiên</option>
            <option value="Tổ đo đạc số 02">Tổ đo đạc số 02 - Kỹ sư Minh</option>
            <option value="Tổ cơ động">Tổ cơ động bảo dưỡng đường bộ 03</option>
            <option value="Chưa chỉ định">Chưa chỉ định phân công</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase">Trạng thái Fast Track</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          >
            <option value="ALL">Tất cả trạng thái tiêu chuẩn</option>
            <option value="ELIGIBLE">Chỉ hiển thị Đạt chuẩn (≤ 0.5 m²)</option>
            <option value="VIOLATION">Chỉ hiển thị Vi phạm ngưỡng (&gt; 0.5 m²)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setCrewFilter('ALL')
              setStatusFilter('ALL')
            }}
            type="button"
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>

      {/* BẢNG CHỌN KHIẾM KHUYẾT (Defect Selection Table) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left bg-white text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3 w-12 text-center">
                <input
                  type="checkbox"
                  disabled={workMode !== 'MEASURE_ONLY'}
                  title={workMode !== 'MEASURE_ONLY' ? 'Chế độ Sửa nhanh/Khẩn cấp chỉ áp dụng cho 1 lỗi đơn lẻ (BR-08)' : 'Chọn tất cả'}
                  checked={workMode === 'MEASURE_ONLY' && selectedDefectIds.length === filteredDefects.length && filteredDefects.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-[#C9A227] disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </th>
              <th className="p-3">Mã Defect</th>
              <th className="p-3">Vị trí (Km / Tuyến / Làn)</th>
              <th className="p-3">Loại khiếm khuyết</th>
              <th className="p-3">Kích thước sơ bộ</th>
              <th className="p-3">Đánh giá Fast Track v2.1</th>
              <th className="p-3">Đội đo đạc phân công</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDefects.map((defect) => {
              const isChecked = selectedDefectIds.includes(defect.id)
              const isEligible = defect.isFastTrackEligible

              return (
                <tr
                  key={defect.id}
                  className={`transition-colors ${
                    !isEligible
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isChecked
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type={workMode === 'MEASURE_ONLY' ? 'checkbox' : 'radio'}
                      name="defect-selection"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(defect.id)}
                      className={`w-4 h-4 cursor-pointer accent-[#C9A227] ${workMode === 'MEASURE_ONLY' ? 'rounded' : 'rounded-full'}`}
                    />
                  </td>
                  <td className="p-3 font-mono font-bold">
                    <span className={isEligible ? 'text-brand-dark' : 'text-rose-600'}>{defect.code}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {defect.stationing}
                      </span>
                      <span className="text-slate-500 text-[11px]">{defect.lane}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <span className={isEligible ? 'text-[#C9A227]' : 'text-rose-600'}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <span>{defect.type}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={isEligible ? 'font-semibold text-slate-800' : 'font-bold text-rose-600'}>
                      {defect.areaM2} m²
                    </span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className={isEligible ? 'text-slate-700' : 'font-bold text-rose-600'}>
                      {defect.depthCm} cm
                    </span>
                  </td>
                  <td className="p-3">
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đạt chuẩn Fast Track</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        <span>Vi phạm ngưỡng (Over-limit)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={defect.assignedCrew}
                      onChange={(e) => handleAssignCrew(defect.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                    >
                      <option value="Tổ tuần tra số 01">Tổ tuần tra số 01</option>
                      <option value="Tổ đo đạc số 02">Tổ đo đạc số 02</option>
                      <option value="Tổ cơ động bảo dưỡng 03">Tổ cơ động 03</option>
                      <option value="Chưa chỉ định">Chưa chỉ định</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDetailDefect(defect)}
                      type="button"
                      className="p-1 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 cursor-pointer"
                      title="Xem chi tiết trắc địa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* WARNING BANNER / INSPECTION BOX NẾU CÓ MỤC VI PHẠM */}
      {hasViolationItem && (
        <div className="p-4 rounded-xl bg-rose-50/80 border-l-4 border-rose-600 border border-rose-200 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
              <span>Cảnh báo vi phạm chính sách Fast Track (Phát hiện hạng mục vượt ngưỡng)</span>
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Phát hiện khiếm khuyết vượt ngưỡng của <strong className="font-semibold">{currentPolicy.version}</strong>:{' '}
              {selectedItems
                .filter((d) => !d.isFastTrackEligible)
                .map((d) => (
                  <span key={d.id} className="font-mono font-bold text-rose-700 mr-2">
                    {d.code} ({d.areaM2}m² / {d.depthCm}cm - {d.violationReason || 'Vượt ngưỡng'})
                  </span>
                ))}
              . Ở chế độ{' '}
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Gom lô đo đạc
              </span>
              , đội Crew chỉ được phép đo kiểm tra trắc địa và ghi nhận hồ sơ hoàn công,{' '}
              <span className="text-rose-700 font-bold underline">nghiêm cấm lập lệnh Sửa ngay</span> cho các hạng mục này.
            </p>
          </div>
        </div>
      )}

      {/* 4. KHUNG BẢN ĐỒ HIỆN TRƯỜNG MAPLIBRE GL */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9A227]" />
            <span className="text-xs font-bold text-brand-dark">
              Bản Đồ Hiện Trường GIS & Lộ Trình Tuyến: {currentRouteConfig.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] shadow-2xs">
              <button
                type="button"
                onClick={() => setMapLayer('SATELLITE')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                  mapLayer === 'SATELLITE' ? 'bg-[#C9A227] text-white font-bold' : 'text-slate-600'
                }`}
              >
                Vệ tinh
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('VECTOR')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                  mapLayer === 'VECTOR' ? 'bg-[#C9A227] text-white font-bold' : 'text-slate-600'
                }`}
              >
                Vector OSM
              </button>
            </div>
          </div>
        </div>

        <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-inner border border-slate-300 bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/10 pointer-events-none z-10 shadow-md">
            <div className="flex items-center gap-1.5 text-[#C9A227] font-bold">
              <Users2 className="w-3.5 h-3.5" />
              <span>{currentRouteConfig.code}: {currentRouteConfig.stationRange}</span>
            </div>
            <div className="text-slate-300 mt-0.5">
              {selectedDefectIds.length} điểm đã chọn • Xanh lá: Đạt chuẩn • Đỏ nhấp nháy: Vi phạm ngưỡng
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOOTER / ACTION BAR OF DISPATCH PANEL */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Selection Summary */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-brand-dark text-sm">
              Đã chọn: {selectedDefectIds.length} khiếm khuyết
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Tổng chiều dài khảo sát:{' '}
              <strong className="text-brand-dark font-mono font-bold">{surveyDistanceM} m</strong>
            </span>
          </div>
          <div className="text-slate-500 flex items-center gap-1.5 flex-wrap text-[11px]">
            <Users2 className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>
              Phân bổ sơ bộ: <strong className="text-brand-dark font-semibold">{selectedItems[0]?.assignedCrew || 'Chưa chỉ định'}</strong> (Bấm nút bên phải để phát lệnh chính thức)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button
            onClick={() => setSelectedDefectIds([])}
            type="button"
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Hủy chọn
          </button>
          <button
            onClick={() => showToast('Đã lưu nháp cấu hình phân bổ nhiệm vụ vào hồ sơ dự án.')}
            type="button"
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Lưu nháp phân công
          </button>

          {/* Dynamic Buttons based on workMode */}
          {workMode === 'MEASURE_ONLY' && (
            <button
              onClick={handleDispatchBatch}
              disabled={selectedDefectIds.length === 0}
              type="button"
              className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                selectedDefectIds.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#C9A227] hover:bg-[#B38E1F] cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Giao việc gom lô đo đạc ({selectedDefectIds.length} khiếm khuyết)</span>
            </button>
          )}

          {workMode === 'INSPECT_AND_REPAIR' && (
            <div className="relative group">
              <button
                onClick={handleRepairDirect}
                disabled={hasViolationItem || selectedDefectIds.length !== 1}
                type="button"
                className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                  hasViolationItem || selectedDefectIds.length !== 1
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Phát lệnh Đo & Sửa ngay (1 khiếm khuyết)</span>
              </button>
              {(hasViolationItem || selectedDefectIds.length !== 1) && (
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                  {hasViolationItem
                    ? 'Khóa: Khiếm khuyết được chọn vượt ngưỡng chính sách Fast Track'
                    : 'Quy tắc BR-08: Chế độ Đo & Sửa ngay chỉ áp dụng cho đúng 1 lỗi đạt chuẩn'}
                </div>
              )}
            </div>
          )}

          {workMode === 'EMERGENCY' && (
            <div className="flex items-center gap-2.5">
              {selectedItems[0]?.isFastTrackEligible && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Lưu ý: Hư hỏng #{selectedItems[0]?.code} chưa vượt ngưỡng an toàn!</span>
                </div>
              )}
              <div className="relative group">
                <button
                  onClick={handleEmergencyDispatch}
                  disabled={selectedDefectIds.length !== 1}
                  type="button"
                  className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all ${
                    selectedDefectIds.length !== 1
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Phát lệnh Xử lý khẩn cấp (24/7 Priority)</span>
                </button>
                {selectedDefectIds.length !== 1 && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-medium whitespace-nowrap shadow-lg z-30 pointer-events-none">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400 mr-1" />
                    Chỉ chọn đúng 1 vị trí nguy hiểm để điều động xe khẩn cấp
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
