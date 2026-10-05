import React from 'react'

interface SimulatorTelemetryGridProps {
  altitude: number
  speed: number
  photosCount: number
  battery: number
}

export const SimulatorTelemetryGrid: React.FC<SimulatorTelemetryGridProps> = ({
  altitude,
  speed,
  photosCount,
  battery
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white rounded-xl p-4 font-mono text-xs border border-slate-800">
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cao Độ (Altitude)</div>
        <div className="text-base font-bold text-indigo-400 mt-0.5">{altitude.toFixed(1)} m</div>
        <div className="text-[9px] text-slate-500">AGL chuẩn RTK</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tốc Độ Bay</div>
        <div className="text-base font-bold text-emerald-400 mt-0.5">{speed.toFixed(1)} m/s</div>
        <div className="text-[9px] text-slate-500">Cruise Speed</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ảnh Thu Nạp</div>
        <div className="text-base font-bold text-amber-400 mt-0.5">{photosCount} / 1,920</div>
        <div className="text-[9px] text-slate-500">GSD: 1.15 cm/pixel</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pin Thiết Bị</div>
        <div className="text-base font-bold text-cyan-400 mt-0.5">{battery}%</div>
        <div className="text-[9px] text-slate-500">TB30 Intelligent Bat</div>
      </div>
    </div>
  )
}
