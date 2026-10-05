import React, { useRef } from 'react'
import {
  X,
  FileUp,
  FileText,
  Upload,
  Sparkles,
  Sliders,
  Plus,
  SplitSquareVertical
} from 'lucide-react'
import { SegmentItem, AssignedProjectOption } from './types'

export const SEGMENT_COLORS = [
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#059669', // Emerald Green
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#2563EB'  // Blue
]

export interface AlignmentModalsProps {
  // Import Modal
  isImportModalOpen: boolean
  onCloseImportModal: () => void
  importTab: 'FILE' | 'MANUAL'
  onSetImportTab: (tab: 'FILE' | 'MANUAL') => void
  onLoadPreset: (name: string, dist: number) => void
  onProcessGeoJsonFile: (file: File) => void
  manualCoordsText: string
  onSetManualCoordsText: (text: string) => void
  onProcessManualCoordinates: (text: string) => void
  activeProject: AssignedProjectOption

  // Edit Segment Modal
  editingSegment: SegmentItem | null
  onCloseEditSegment: () => void
  onChangeEditingSegment: (seg: SegmentItem) => void
  onSaveEditedSegment: (e: React.FormEvent) => void

  // Add Segment Modal
  isAddSegmentModalOpen: boolean
  onCloseAddSegmentModal: () => void
  newSegForm: {
    code: string
    startKm: number
    endKm: number
    roadWidthM: number
    laneCount: number
    surfaceMaterial: string
    color: string
  }
  onChangeNewSegForm: (form: any) => void
  onCreateNewSegment: (e: React.FormEvent) => void
  segmentsCount: number

  // Split Segment Modal
  splitModalSegment: SegmentItem | null
  onCloseSplitModal: () => void
  customSplitKm: number
  onChangeCustomSplitKm: (km: number) => void
  onSplitSegmentSubmit: (e: React.FormEvent) => void
}

export const AlignmentModals: React.FC<AlignmentModalsProps> = ({
  isImportModalOpen,
  onCloseImportModal,
  importTab,
  onSetImportTab,
  onLoadPreset,
  onProcessGeoJsonFile,
  manualCoordsText,
  onSetManualCoordsText,
  onProcessManualCoordinates,
  activeProject,

  editingSegment,
  onCloseEditSegment,
  onChangeEditingSegment,
  onSaveEditedSegment,

  isAddSegmentModalOpen,
  onCloseAddSegmentModal,
  newSegForm,
  onChangeNewSegForm,
  onCreateNewSegment,
  segmentsCount,

  splitModalSegment,
  onCloseSplitModal,
  customSplitKm,
  onChangeCustomSplitKm,
  onSplitSegmentSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessGeoJsonFile(file)
    }
  }

  return (
    <>
      {/* 1. Modal nạp file GeoJSON / KML / Chuỗi tọa độ thủ công (WF-02) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Thiết Lập Tim Tuyến (WF-02 • Spec v2.2)</h3>
              </div>
              <button
                onClick={onCloseImportModal}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => onSetImportTab('FILE')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'FILE'
                    ? 'border-[#C9A227] text-[#8F7212]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Tải tệp tin (GeoJSON / KML / GPX)</span>
              </button>
              <button
                type="button"
                onClick={() => onSetImportTab('MANUAL')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'MANUAL'
                    ? 'border-[#C9A227] text-[#8F7212]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Dán chuỗi tọa độ (Manual Polyline)</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD & PRESET */}
            {importTab === 'FILE' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-600">
                  Chọn mẫu tim tuyến chuẩn trắc địa WGS84 hoặc tải lên tệp GeoJSON / KML / GPX từ máy tính:
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onLoadPreset('QL1A Đoạn Thừa Thiên Huế - Đà Nẵng (Chuẩn 5km/đoạn)', 5)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#C9A227] hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Tuyến QL1A Mở rộng (25.0 km • 5 Phân đoạn)</span>
                      <span className="text-[11px] text-slate-500">Đã kiểm chuẩn tiếp giáp & bán kính cong TCVN</span>
                    </div>
                    <span className="text-xs font-semibold text-[#8F7212] bg-amber-100 px-2 py-1 rounded-md">Mẫu chuẩn</span>
                  </button>

                  <button
                    onClick={() => onLoadPreset('Tuyến Đường Tránh TP. Huế (Cự ly 4km/đoạn)', 4)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#C9A227] hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Đoạn Phân đoạn mịn (25.0 km • 4km/đoạn • 7 Phân đoạn)</span>
                      <span className="text-[11px] text-slate-500">Phù hợp kiểm tra nứt lún mật độ cao</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Khảo sát</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json,.kml,.gpx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) onProcessGeoJsonFile(file)
                  }}
                  className="border-2 border-dashed border-[#C9A227]/70 hover:border-[#C9A227] rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 bg-amber-50/20 hover:bg-amber-50/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-[#8F7212]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Nhấp để chọn tệp hoặc kéo thả tệp GeoJSON / KML / GPX vào đây
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tự động lọc layer Centerline / Tim tuyến chính (CAD Civil 3D)
                  </span>
                  <span className="text-[10px] font-mono text-[#8F7212] bg-white px-2 py-0.5 rounded border border-amber-200 mt-1">
                    Chuẩn trắc địa WGS84 (EPSG:4326) • Chiều dài L = 25.0 km
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL COORDINATE INPUT */}
            {importTab === 'MANUAL' && (
              <div className="flex flex-col gap-3">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <strong>Nghiệp vụ v2.2 (WF-02.F02):</strong> PM nhập trực tiếp chuỗi tọa độ tim đường (kinh độ, vĩ độ). Mỗi dòng 1 cặp điểm <code>lng, lat</code> hoặc dán chuỗi mảng JSON / GeoJSON LineString.
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Dán danh sách tọa độ đỉnh:</span>
                    <button
                      type="button"
                      onClick={() => onSetManualCoordsText(activeProject.defaultManualText)}
                      className="text-[#8F7212] hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Dán mẫu {activeProject.code} ({activeProject.defaultCoords.length} đỉnh)
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={manualCoordsText}
                    onChange={(e) => onSetManualCoordsText(e.target.value)}
                    className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] bg-slate-50 text-slate-800 focus:bg-white resize-y"
                    placeholder="108.0825, 16.2731&#10;108.1054, 16.2589&#10;108.1287, 16.2415..."
                  />
                  <span className="text-[10px] text-slate-400">
                    Gợi ý: Tự động đảo thứ tự nếu dán theo format [lat, lng]; tự động lọc điểm trùng lặp liên tiếp.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Lý trình gốc (Station Origin):</span>
                    <span className="font-mono font-bold text-slate-800">{activeProject.stationOriginText}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Hệ quy chiếu phẳng (CRS):</span>
                    <span className="font-mono font-bold text-[#8F7212]">{activeProject.crs}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onProcessManualCoordinates(manualCoordsText)}
                  className="w-full py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dựng tim tuyến & phân đoạn từ chuỗi tọa độ</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onCloseImportModal}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal chỉnh sửa phân đoạn (Edit Segment Modal) */}
      {editingSegment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: editingSegment.color }}
                  className="w-4 h-4 rounded-full shadow-xs"
                />
                <h3 className="font-bold text-slate-900 text-base">
                  Chỉnh Sửa: {editingSegment.code}
                </h3>
              </div>
              <button
                onClick={onCloseEditSegment}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveEditedSegment} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Mã / Tên Phân Đoạn
                </label>
                <input
                  type="text"
                  value={editingSegment.code}
                  onChange={(e) => onChangeEditingSegment({ ...editingSegment, code: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình bắt đầu (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingSegment.startKm}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      onChangeEditingSegment({
                        ...editingSegment,
                        startKm: val,
                        lengthKm: parseFloat(Math.max(0, editingSegment.endKm - val).toFixed(3))
                      })
                    }}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình kết thúc (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingSegment.endKm}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      onChangeEditingSegment({
                        ...editingSegment,
                        endKm: val,
                        lengthKm: parseFloat(Math.max(0, val - editingSegment.startKm).toFixed(3))
                      })
                    }}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Chiều dài tính toán:</span>
                <span className="font-mono font-bold text-[#8F7212]">
                  {(editingSegment.endKm - editingSegment.startKm >= 1)
                    ? `${(editingSegment.endKm - editingSegment.startKm).toFixed(3)} km`
                    : `${Math.round((editingSegment.endKm - editingSegment.startKm) * 1000)} mét`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Số làn xe
                  </label>
                  <select
                    value={editingSegment.laneCount}
                    onChange={(e) => onChangeEditingSegment({ ...editingSegment, laneCount: parseInt(e.target.value) || 4 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value={2}>2 làn xe</option>
                    <option value={4}>4 làn xe (Tiêu chuẩn)</option>
                    <option value={6}>6 làn xe (Cao tốc)</option>
                    <option value={8}>8 làn xe</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Vật liệu mặt đường
                  </label>
                  <select
                    value={editingSegment.surfaceMaterial}
                    onChange={(e) => onChangeEditingSegment({ ...editingSegment, surfaceMaterial: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value="Mặt BTN C12.5">Mặt BTN C12.5</option>
                    <option value="Mặt BTN C19">Mặt BTN C19</option>
                    <option value="Mặt BTN Polymer">Mặt BTN Polymer</option>
                    <option value="BTXM Dày 26cm">BTXM Dày 26cm</option>
                  </select>
                </div>
              </div>

              {/* Bề rộng mặt đường */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#C9A227]" />
                    <span>Bề rộng mặt đường (RoadWidthProfile - mét)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                    ±{((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m mỗi bên tim
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="60"
                      value={editingSegment.roadWidthM || 8.0}
                      onChange={(e) =>
                        onChangeEditingSegment({
                          ...editingSegment,
                          roadWidthM: parseFloat(e.target.value) || 3.0
                        })
                      }
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                      mét
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onChangeEditingSegment({ ...editingSegment, roadWidthM: w })}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          (editingSegment.roadWidthM || 8.0) === w
                            ? 'bg-[#C9A227] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {w}m
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Đoạn này rộng {editingSegment.roadWidthM || 8.0}m (trái {((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m, phải {((editingSegment.roadWidthM || 8.0) / 2).toFixed(1)}m). Diện tích: {Math.round((editingSegment.lengthKm || 0) * 1000 * (editingSegment.roadWidthM || 8.0)).toLocaleString()} m².
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Màu sắc phân đoạn trên bản đồ
                </label>
                <div className="flex items-center gap-2">
                  {SEGMENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChangeEditingSegment({ ...editingSegment, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        editingSegment.color === c
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={onCloseEditSegment}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal thêm mới phân đoạn (Add Segment Modal) */}
      {isAddSegmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Thêm Mới Phân Đoạn Tuyến
                </h3>
              </div>
              <button
                onClick={onCloseAddSegmentModal}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onCreateNewSegment} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Mã / Tên Phân Đoạn
                </label>
                <input
                  type="text"
                  placeholder={`Phân đoạn #${String(segmentsCount + 1).padStart(2, '0')}`}
                  value={newSegForm.code}
                  onChange={(e) => onChangeNewSegForm({ ...newSegForm, code: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình bắt đầu (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newSegForm.startKm}
                    onChange={(e) => onChangeNewSegForm({ ...newSegForm, startKm: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Lý trình kết thúc (Km)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newSegForm.endKm}
                    onChange={(e) => onChangeNewSegForm({ ...newSegForm, endKm: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Số làn xe
                  </label>
                  <select
                    value={newSegForm.laneCount}
                    onChange={(e) => onChangeNewSegForm({ ...newSegForm, laneCount: parseInt(e.target.value) || 4 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value={2}>2 làn xe</option>
                    <option value={4}>4 làn xe (Tiêu chuẩn)</option>
                    <option value={6}>6 làn xe (Cao tốc)</option>
                    <option value={8}>8 làn xe</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Vật liệu mặt đường
                  </label>
                  <select
                    value={newSegForm.surfaceMaterial}
                    onChange={(e) => onChangeNewSegForm({ ...newSegForm, surfaceMaterial: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option value="Mặt BTN C12.5">Mặt BTN C12.5</option>
                    <option value="Mặt BTN C19">Mặt BTN C19</option>
                    <option value="Mặt BTN Polymer">Mặt BTN Polymer</option>
                    <option value="BTXM Dày 26cm">BTXM Dày 26cm</option>
                  </select>
                </div>
              </div>

              {/* Bề rộng mặt đường */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#C9A227]" />
                    <span>Bề rộng mặt đường (RoadWidthProfile - mét)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                    ±{((newSegForm.roadWidthM || 8.0) / 2).toFixed(1)}m mỗi bên tim
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="60"
                      value={newSegForm.roadWidthM || 8.0}
                      onChange={(e) =>
                        onChangeNewSegForm({
                          ...newSegForm,
                          roadWidthM: parseFloat(e.target.value) || 3.0
                        })
                      }
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                      mét
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onChangeNewSegForm({ ...newSegForm, roadWidthM: w })}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          (newSegForm.roadWidthM || 8.0) === w
                            ? 'bg-[#C9A227] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {w}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Màu sắc phân đoạn trên bản đồ
                </label>
                <div className="flex items-center gap-2">
                  {SEGMENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChangeNewSegForm({ ...newSegForm, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        newSegForm.color === c
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={onCloseAddSegmentModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Thêm phân đoạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal tách phân đoạn (Split Segment Modal) */}
      {splitModalSegment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Tách: {splitModalSegment.code}
                </h3>
              </div>
              <button
                onClick={onCloseSplitModal}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Phân đoạn hiện tại từ <strong className="text-slate-900 font-mono">Km {splitModalSegment.startKm.toFixed(3)}</strong> đến <strong className="text-slate-900 font-mono">Km {splitModalSegment.endKm.toFixed(3)}</strong> (dài {splitModalSegment.lengthKm.toFixed(3)} km).
            </p>

            <form onSubmit={onSplitSegmentSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nhập mốc lý trình cần tách (Km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min={splitModalSegment.startKm + 0.001}
                  max={splitModalSegment.endKm - 0.001}
                  value={customSplitKm}
                  onChange={(e) => onChangeCustomSplitKm(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  required
                />
              </div>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 flex flex-col gap-1.5 text-xs text-slate-700">
                <div className="font-bold text-[#8F7212] text-[11px] uppercase tracking-wider">
                  Kết quả sau khi tách:
                </div>
                <div className="flex justify-between">
                  <span>• {splitModalSegment.code}A:</span>
                  <span className="font-mono font-semibold">Km {splitModalSegment.startKm.toFixed(3)} - Km {customSplitKm.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• {splitModalSegment.code}B:</span>
                  <span className="font-mono font-semibold">Km {customSplitKm.toFixed(3)} - Km {splitModalSegment.endKm.toFixed(3)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCloseSplitModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
                >
                  Xác nhận tách đoạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
