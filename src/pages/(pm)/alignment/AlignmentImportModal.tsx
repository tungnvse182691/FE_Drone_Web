import React, { useRef } from 'react'
import { X, FileUp, FileText, Upload, Sparkles } from 'lucide-react'
import { AssignedProjectOption } from './types'

export interface AlignmentImportModalProps {
  isOpen: boolean
  onClose: () => void
  importTab: 'FILE' | 'MANUAL'
  onSetImportTab: (tab: 'FILE' | 'MANUAL') => void
  onLoadPreset: (name: string, dist: number) => void
  onProcessGeoJsonFile: (file: File) => void
  manualCoordsText: string
  onSetManualCoordsText: (text: string) => void
  onProcessManualCoordinates: (text: string) => void
  activeProject: AssignedProjectOption
}

export const AlignmentImportModal: React.FC<AlignmentImportModalProps> = ({
  isOpen,
  onClose,
  importTab,
  onSetImportTab,
  onLoadPreset,
  onProcessGeoJsonFile,
  manualCoordsText,
  onSetManualCoordsText,
  onProcessManualCoordinates,
  activeProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessGeoJsonFile(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-bold text-slate-900 text-base">Thiết Lập Tim Tuyến (WF-02 • Spec v2.2)</h3>
          </div>
          <button
            onClick={onClose}
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
