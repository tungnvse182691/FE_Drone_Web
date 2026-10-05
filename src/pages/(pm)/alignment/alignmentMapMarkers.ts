import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { interpolateCoordAtKm } from './alignmentGeometryHelpers'

// Render các Marker lý trình các phân đoạn
export function renderAlignmentMarkers(
  map: maplibregl.Map,
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  markersRef: React.RefObject<maplibregl.Marker[]>,
  onSelectSegmentId: (id: string) => void,
  showToast: (msg: string) => void
) {
  if (markersRef.current) {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }

  // 1. Marker các đầu phân đoạn
  segList.forEach((seg) => {
    const coord = interpolateCoordAtKm(seg.startKm, coords, kmPts)
    const floorKm = Math.floor(seg.startKm)
    const remainderMeters = Math.round((seg.startKm - floorKm) * 1000)
    const stationText = remainderMeters > 0 ? `Km ${floorKm}+${String(remainderMeters).padStart(3, '0')}` : `Km ${floorKm}`

    const el = document.createElement('div')
    el.className = 'flex flex-col items-center cursor-pointer group'
    el.innerHTML = `
      <div style="background-color: ${seg.color}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
           class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold transition-transform group-hover:scale-125">
      </div>
      <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
        ${stationText}
      </div>
    `
    el.addEventListener('click', () => {
      onSelectSegmentId(seg.id)
      showToast(`Đã chọn ${seg.code} (${stationText})`)
    })

    const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map)
    markersRef.current?.push(marker)
  })

  // Marker điểm cuối tuyến
  const endCoord = coords[coords.length - 1]
  const endKm = kmPts[kmPts.length - 1] || 1045
  const endKmFloor = Math.floor(endKm)
  const endKmRemainder = Math.round((endKm - endKmFloor) * 1000)
  const endStationText = endKmRemainder > 0 ? `Km ${endKmFloor}+${String(endKmRemainder).padStart(3, '0')}` : `Km ${endKmFloor}`

  const endEl = document.createElement('div')
  endEl.className = 'flex flex-col items-center'
  endEl.innerHTML = `
    <div style="background-color: #C9A227; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);" 
         class="w-4 h-4 rounded-full"></div>
    <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
      ${endStationText}
    </div>
  `
  const endMarker = new maplibregl.Marker({ element: endEl }).setLngLat(endCoord).addTo(map)
  markersRef.current?.push(endMarker)
}
