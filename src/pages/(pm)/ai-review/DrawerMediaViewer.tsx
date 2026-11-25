import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'
import { CaseReportImage, evidenceGps, useCaseReportMedia } from './useCaseReportMedia'

export interface DrawerMediaViewerProps {
  sourceLabel?: string
  selectedCase: TriageCase
  onOpenPhotoZoomModal: () => void
}

export const DrawerMediaViewer: React.FC<DrawerMediaViewerProps> = ({
  selectedCase,
  sourceLabel = selectedCase.source_label,
  onOpenPhotoZoomModal,
}) => {
  const media = useCaseReportMedia()
  const gps = evidenceGps(media?.caseId === selectedCase.id ? media.selected?.evidence : null)
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          <span className="px-3 py-1 rounded-md bg-white text-brand-dark shadow-2xs font-bold">Ảnh chụp hiện trường</span>
        </div>
      </div>

      {/* Photo Viewport with Telemetry HUD */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group h-80 lg:h-[380px]">
        <CaseReportImage caseId={selectedCase.id} alt={selectedCase.defect_title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
        {/* Top-left GPS ảnh/bằng chứng đang xem */}
        <div data-testid="evidence-gps-overlay" className="absolute top-2.5 left-2.5 max-w-[calc(100%-1.25rem)] bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] flex items-center gap-2 shadow-md border border-white/10">
          <div className="flex items-center gap-1 font-bold text-brand-gold">
            <Icon name="location_on" size={12} className="text-brand-gold" />
            <span>GPS ảnh/bằng chứng: {gps.located ? `${gps.text} (${gps.source})` : gps.text}</span>
          </div>
          {selectedCase.source === 'DRONE_AI' && selectedCase.gps.altitude_m > 0 && (
            <>
              <span className="opacity-40">•</span>
              <span className="opacity-90">Alt: {selectedCase.gps.altitude_m}m</span>
            </>
          )}
          {selectedCase.source === 'DRONE_AI' && selectedCase.gps.resolution_cm_px > 0 && (
            <>
              <span className="opacity-40">•</span>
              <span className="opacity-90">Res: {selectedCase.gps.resolution_cm_px}cm/px</span>
            </>
          )}
          {selectedCase.source === 'PATROL' && (
            <>
              <span className="opacity-40">•</span>
              <span className="opacity-90 text-amber-300">Ghi nhận từ thiết bị tuần tra</span>
            </>
          )}
        </div>

        {/* Bottom-right quick view buttons */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={onOpenPhotoZoomModal}
            type="button"
            className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white p-1.5 rounded-full transition-colors flex items-center shadow-md border border-white/10 cursor-pointer"
            title="Xem ảnh gốc độ phân giải cao"
          >
            <Icon name="zoom_in" size={16} />
          </button>
        </div>

        {/* Bottom-left Information Tag */}
        {selectedCase.source === 'DRONE_AI' && selectedCase.ai_confidence > 0 ? (
          <div className="absolute bottom-2.5 left-2.5 bg-red-600/95 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>
              Độ tin cậy AI: {selectedCase.ai_confidence}% • {selectedCase.defect_title}
            </span>
          </div>
        ) : (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/20">
            <Icon name="engineering" size={13} className="text-amber-400" />
            <span>{sourceLabel}</span>
          </div>
        )}
      </div>
    </>
  )
}
