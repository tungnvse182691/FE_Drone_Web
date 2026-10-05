import React from 'react'
import { Defect } from '../../../types/domain'

interface DefectBoundingBoxViewerProps {
  defect: Defect
}

export const DefectBoundingBoxViewer: React.FC<DefectBoundingBoxViewerProps> = ({ defect }) => {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
        <span>Ảnh Chụp Drone (RGB / Hồng Ngoại Độ Phân Giải Cao)</span>
        <span className="text-brand-goldDark font-bold">
          Khung phát hiện AI (Confidence: {(defect.confidence_score * 100).toFixed(0)}%)
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
        <img
          src={defect.image_url}
          alt={defect.code}
          className="w-full h-full object-cover"
        />
        {/* Simulated Bounding Box */}
        <div
          className="absolute border-2 border-brand-gold bg-brand-gold/15 rounded-sm pointer-events-none flex flex-col justify-between p-1"
          style={{
            left: `${defect.bounding_box.x * 100}%`,
            top: `${defect.bounding_box.y * 100}%`,
            width: `${defect.bounding_box.width * 100}%`,
            height: `${defect.bounding_box.height * 100}%`,
          }}
        >
          <span className="bg-brand-gold text-white text-[10px] font-bold px-1 py-0.5 rounded w-max">
            {defect.defect_type} ({(defect.confidence_score * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
