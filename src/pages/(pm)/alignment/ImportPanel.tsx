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
          <span>Táº£i tá»‡p tin (GeoJSON / KML / GPX)</span>
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
          <span>DÃ¡n chuá»—i tá»a Ä‘á»™ (Manual Polyline)</span>
        </button>
      </div>

      {/* TAB 1: FILE UPLOAD & PRESET */}
      {importTab === 'FILE' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-600">
            Chá»n máº«u tim tuyáº¿n chuáº©n tráº¯c Ä‘á»‹a WGS84 hoáº·c táº£i lÃªn tá»‡p GeoJSON / KML / GPX tá»« mÃ¡y tÃ­nh:
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onLoadPreset('QL1A Äoáº¡n Thá»«a ThiÃªn Huáº¿ - ÄÃ  Náºµng (Chuáº©n 5km/Ä‘oáº¡n)', 5)}
              className="p-3 rounded-xl border border-slate-200 hover:border-brand-gold hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Tuyáº¿n QL1A Má»Ÿ rá»™ng (25.0 km â€¢ 5 PhÃ¢n Ä‘oáº¡n)</span>
                <span className="text-[11px] text-slate-500">ÄÃ£ kiá»ƒm chuáº©n tiáº¿p giÃ¡p &amp; bÃ¡n kÃ­nh cong TCVN</span>
              </div>
              <span className="text-[11px] font-bold text-[#8F7212] bg-brand-gold/15 px-2.5 py-1 rounded-lg">
                Náº¡p máº«u
              </span>
            </button>

            <button
              type="button"
              onClick={() => onLoadPreset('Cao tá»‘c Báº¯c - Nam (Äoáº¡n háº§m Háº£i VÃ¢n - TÃºy Loan)', 2.5)}
              className="p-3 rounded-xl border border-slate-200 hover:border-brand-gold hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Cao tá»‘c Äoáº¡n Háº£i VÃ¢n - TÃºy Loan (2.5 km/Ä‘oáº¡n)</span>
                <span className="text-[11px] text-slate-500">Máº«u chia nhá» máº­t Ä‘á»™ dÃ y phá»¥c vá»¥ bay quÃ©t Flycam Ä‘á»™ phÃ¢n giáº£i cao</span>
              </div>
              <span className="text-[11px] font-bold text-[#8F7212] bg-brand-gold/15 px-2.5 py-1 rounded-lg">
                Náº¡p máº«u
              </span>
            </button>
          </div>

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
            <span className="text-xs font-bold text-slate-800">KÃ©o tháº£ hoáº·c Báº¥m Ä‘á»ƒ táº£i tá»‡p tráº¯c Ä‘á»‹a lÃªn</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Há»— trá»£ GeoJSON (LineString / MultiLineString), KML, GPX
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL COORDINATES TEXT */}
      {importTab === 'MANUAL' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Nháº­p danh sÃ¡ch tá»a Ä‘á»™ Ä‘á»‰nh WGS84 [Kinh Ä‘á»™, VÄ© Ä‘á»™]:
            </label>
            <button
              type="button"
              onClick={() => onSetManualCoordsText(activeProject.defaultManualText)}
              className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>KhÃ´i phá»¥c máº«u máº·c Ä‘á»‹nh</span>
            </button>
          </div>

          <textarea
            rows={7}
            value={manualCoordsText}
            onChange={(e) => onSetManualCoordsText(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-gold bg-slate-50 text-slate-800"
            placeholder="108.0825, 16.2731&#10;108.1054, 16.2589&#10;..."
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onProcessManualCoordinates(manualCoordsText)}
              className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PhÃ¢n tÃ­ch &amp; Táº¡o tim tuyáº¿n</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
