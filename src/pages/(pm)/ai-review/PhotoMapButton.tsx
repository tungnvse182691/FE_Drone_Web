import React from 'react'
import { evidenceGps, useCaseReportMedia } from './useCaseReportMedia'

/** Khung nhìn của đúng ảnh đang chọn; không dùng GPS drone hoặc tâm bbox. */
export function PhotoMapButton({ onNavigate }: { onNavigate?: () => void }) {
  const media = useCaseReportMedia(), gps = evidenceGps(media?.selected?.evidence)
  return <span className="inline-flex flex-col gap-1 text-xs">
    <button type="button" className="rg-btn text-xs" disabled={!gps.located} title={gps.located ? 'Vị trí ảnh phản ánh' : 'Ảnh này chưa có tọa độ hợp lệ.'}
      onClick={() => { if (gps.located) { media?.navigateToPhoto(); onNavigate?.() } }}>Đến vị trí trên bản đồ</button>
    <span className="text-[11px] text-slate-500">{gps.located ? 'Vị trí ảnh phản ánh' : 'Ảnh chưa có tọa độ hợp lệ.'}</span>
  </span>
}
