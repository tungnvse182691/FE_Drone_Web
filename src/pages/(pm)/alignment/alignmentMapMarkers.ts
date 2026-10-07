import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { interpolateCoordAtKm, smoothRoadPolyline, calculateCoordsLengthKm } from './alignmentGeometryHelpers'
import { getBranchLineCoords } from './data'

// Render các Marker lý trình các phân đoạn (Cả trục chính lẫn các tuyến nhánh)
export function renderAlignmentMarkers(
  map: maplibregl.Map,
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  markersRef: React.RefObject<maplibregl.Marker[]>,
  onSelectSegmentId: (id: string, branchId?: string) => void,
  showToast: (msg: string) => void,
  branches: any[] = []
) {
  if (markersRef.current) {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }

  // 1. Marker các đầu phân đoạn Trục Chính
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
    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      onSelectSegmentId(seg.id)
      showToast(`Đã chọn ${seg.code} (${stationText})`)
    })

    const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map)
    markersRef.current?.push(marker)
  })

  // Marker điểm cuối tuyến chính
  if (coords && coords.length > 0) {
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

  // 2. Marker các điểm chia phân đoạn Tuyến Nhánh (Chấm chia segment cho nhánh phụ)
  branches.forEach((br) => {
    let branchCoords: [number, number][] = br.coords
    if (!branchCoords || branchCoords.length < 2) return

    branchCoords = smoothRoadPolyline(branchCoords)
    const actualBranchKm = calculateCoordsLengthKm(branchCoords) || br.lengthKm || 1.0
    const maxSegKm = Math.max(actualBranchKm, ...(br.segments || []).map((s: any) => s.endKm || 0))
    const totalBranchKm = Math.max(0.01, maxSegKm)

    const brSegs: any[] = (br.segments && br.segments.length > 0)
      ? br.segments
      : [{
          id: br.id,
          code: `${br.code} - Toàn tuyến`,
          startKm: 0.0,
          endKm: totalBranchKm,
          color: br.color || '#D97706'
        }]

    brSegs.forEach((seg: any) => {
      const segCoords = getBranchLineCoords(seg.startKm, seg.endKm, branchCoords, totalBranchKm)
      if (!segCoords || segCoords.length === 0) return
      const coord = segCoords[0]

      const floorKm = Math.floor(seg.startKm)
      const remainderMeters = Math.round((seg.startKm - floorKm) * 1000)
      const stationText = remainderMeters > 0 ? `Km ${floorKm}+${String(remainderMeters).padStart(3, '0')}` : `Km ${floorKm}`

      const el = document.createElement('div')
      el.className = 'flex flex-col items-center cursor-pointer group'
      el.innerHTML = `
        <div style="background-color: ${seg.color || '#D97706'}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" 
             class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold transition-transform group-hover:scale-125">
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold shadow-md whitespace-nowrap border border-amber-500/40">
          [${br.code}] ${stationText}
        </div>
      `
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        onSelectSegmentId(seg.id, br.id)
        showToast(`Đã chọn phân đoạn [${br.code}] ${seg.code} (${stationText})`)
      })

      const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map)
      markersRef.current?.push(marker)
    })

    // Điểm cuối tuyến nhánh
    const endCoord = branchCoords[branchCoords.length - 1]
    const endFloorKm = Math.floor(totalBranchKm)
    const endRemainderMeters = Math.round((totalBranchKm - endFloorKm) * 1000)
    const endStationText = endRemainderMeters > 0 ? `Km ${endFloorKm}+${String(endRemainderMeters).padStart(3, '0')}` : `Km ${endFloorKm}`

    const endEl = document.createElement('div')
    endEl.className = 'flex flex-col items-center'
    endEl.innerHTML = `
      <div style="background-color: #D97706; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" 
           class="w-3.5 h-3.5 rounded-full"></div>
      <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold shadow-md whitespace-nowrap border border-amber-500/40">
        [${br.code}] ${endStationText} (Cuối)
      </div>
    `
    const endMarker = new maplibregl.Marker({ element: endEl }).setLngLat(endCoord).addTo(map)
    markersRef.current?.push(endMarker)
  })
}
