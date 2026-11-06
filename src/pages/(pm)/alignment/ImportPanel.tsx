import React, { useRef } from 'react'
import { FileUp, FileText, Upload, Sparkles } from 'lucide-react'
import { AssignedProjectOption } from './types'

export interface ImportPanelProps {
  importTab: 'FILE' | 'MANUAL'
  onSetImportTab: (tab: 'FILE' | 'MANUAL') => void
  onLoadPreset: (name: string, dist: number) => void
  onProcessGeoJsonFile: (file: File) => void
  manualCoordsText: string
  onSetManualCoordsText: (text: string) => void
  onProcessManualCoordinates: (text: string) => void
  activeProject: AssignedProjectOption
}

export const ImportPanel: React.FC<ImportPanelProps> = ({
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onProcessGeoJsonFile(file)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => onSetImportTab('FILE')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            importTab === 'FILE'
              ? 'border-brand-gold text-[#8F7212]'
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
              ? 'border-brand-gold text-[#8F7212]'
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
          <p className="text-xs text-slate-600 leading-relaxed mb-1">
            Tải lên tệp trắc địa tim tuyến thực tế (GeoJSON, KML, GPX) từ máy tính:
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 border-2 border-dashed border-slate-300 hover:border-brand-gold hover:bg-amber-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,.json,.kml,.gpx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-brand-gold mb-2 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Kéo thả hoặc Bấm để tải tệp trắc địa lên</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Kiểm tra một tim tuyến GeoJSON LineString; chưa lưu bản nháp.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL COORDINATES TEXT */}
      {importTab === 'MANUAL' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Nhập tọa độ nguồn [X, Y] theo hồ sơ CRS đã chọn:
            </label>
            <button
              type="button"
              onClick={() => onSetManualCoordsText(activeProject.defaultManualText)}
              className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>Khôi phục mẫu mặc định</span>
            </button>
          </div>

          <textarea
            rows={7}
            value={manualCoordsText}
            onChange={(e) => onSetManualCoordsText(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-gold bg-slate-50 text-slate-800"
            placeholder="Mỗi dòng: X, Y theo hệ tọa độ nguồn"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onProcessManualCoordinates(manualCoordsText)}
              className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giữ bản nhập tọa độ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
