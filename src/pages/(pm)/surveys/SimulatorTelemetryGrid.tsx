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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1D20] text-white rounded-xl p-4 font-mono text-xs border border-slate-800 shadow-2xs">
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cao Độ (Altitude)</div>
        <div className="text-base font-bold text-amber-400 mt-0.5">{altitude.toFixed(1)} m</div>
        <div className="text-[10px] text-slate-500 font-sans">AGL chuẩn RTK</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tốc Độ Bay</div>
        <div className="text-base font-bold text-[#2F9E44] mt-0.5">{speed.toFixed(1)} m/s</div>
        <div className="text-[10px] text-slate-500 font-sans">Cruise Speed</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ảnh Thu Nạp</div>
        <div className="text-base font-bold text-[#C9A227] mt-0.5">{photosCount} / 1,920</div>
        <div className="text-[10px] text-slate-500 font-sans">GSD: 1.15 cm/pixel</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pin Thiết Bị</div>
        <div className="text-base font-bold text-cyan-400 mt-0.5">{battery}%</div>
        <div className="text-[10px] text-slate-500 font-sans">TB30 Intelligent Bat</div>
      </div>
    </div>
  )
}
