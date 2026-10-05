import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import {
  buildSegmentsSurfaceGeoJSON,
  buildSegmentsGeoJSON,
  buildPlanningCorridorGeoJSON
} from './alignmentGeoJson'
import { buildSlabsAndJointsGeoJSON, SlabsCustomConfig } from './alignmentSlabsGeoJson'
import { interpolateCoordAtKm } from './alignmentGeometryHelpers'

export interface InitMapLayersOptions {
  map: maplibregl.Map
  segments: SegmentItem[]
  currentCoords: [number, number][]
  currentKmPoints: number[]
  selectedSegmentId: string | null
  popupRef: React.RefObject<maplibregl.Popup | null>
  markersRef: React.RefObject<maplibregl.Marker[]>
  onSelectSegmentId: (id: string) => void
  showToast: (msg: string) => void
}

export function initAlignmentMapLayers({
  map,
  segments,
  currentCoords,
  currentKmPoints,
  selectedSegmentId,
  popupRef,
  markersRef,
  onSelectSegmentId,
  showToast
}: InitMapLayersOptions) {
  // 0. Thêm GeoJSON Source cho bề mặt dải mặt đường (Polygon)
  if (!map.getSource('segments-surface-source')) {
    map.addSource('segments-surface-source', {
      type: 'geojson',
      data: buildSegmentsSurfaceGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
    })
  }

  // 1. Thêm GeoJSON Source cho tim tuyến các phân đoạn (LineString)
  if (!map.getSource('segments-source')) {
    map.addSource('segments-source', {
      type: 'geojson',
      data: buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
    })
  }

  // 2. Thêm GeoJSON Source cho hành lang quy hoạch 30m
  if (!map.getSource('planning-corridor-source')) {
    map.addSource('planning-corridor-source', {
      type: 'geojson',
      data: buildPlanningCorridorGeoJSON(currentCoords)
    })
  }

  // 2b. Thêm GeoJSON Sources cho Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường
  const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
    segments,
    currentCoords,
    currentKmPoints
  )

  if (!map.getSource('slabs-source')) {
    map.addSource('slabs-source', {
      type: 'geojson',
      data: slabsGeoJSON
    })
  }

  if (!map.getSource('joints-source')) {
    map.addSource('joints-source', {
      type: 'geojson',
      data: jointsGeoJSON
    })
  }

  if (!map.getSource('edges-source')) {
    map.addSource('edges-source', {
      type: 'geojson',
      data: edgesGeoJSON
    })
  }

  // 3. Layers: Hành lang quy hoạch
  if (!map.getLayer('planning-corridor-layer')) {
    map.addLayer({
      id: 'planning-corridor-layer',
      type: 'fill',
      source: 'planning-corridor-source',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': '#F59E0B',
        'fill-opacity': 0.18,
        'fill-outline-color': '#D97706'
      }
    })
  }

  // 4a. Bề mặt mặt đường bê tông nhựa
  if (!map.getLayer('segments-surface-layer')) {
    map.addLayer({
      id: 'segments-surface-layer',
      type: 'fill',
      source: 'segments-surface-source',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          0.85,
          0.45
        ]
      }
    })
  }

  // 4b. Viền 2 mép dải mặt đường
  if (!map.getLayer('segments-surface-outline')) {
    map.addLayer({
      id: 'segments-surface-outline',
      type: 'line',
      source: 'segments-surface-source',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          '#FFFFFF',
          '#1E293B'
        ],
        'line-width': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          2.5,
          1.0
        ],
        'line-opacity': 0.95
      }
    })
  }

  // 5. Tim tuyến trung tâm LineString
  if (!map.getLayer('segments-glow-layer')) {
    map.addLayer({
      id: 'segments-glow-layer',
      type: 'line',
      source: 'segments-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0F172A',
        'line-width': 4.5,
        'line-opacity': 0.7
      }
    })
  }

  if (!map.getLayer('segments-dash-layer')) {
    map.addLayer({
      id: 'segments-dash-layer',
      type: 'line',
      source: 'segments-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2.0,
        'line-dasharray': [3, 2]
      }
    })
  }

  // 6. Nhãn phân đoạn
  if (!map.getLayer('segments-label-layer')) {
    map.addLayer({
      id: 'segments-label-layer',
      type: 'symbol',
      source: 'segments-source',
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['get', 'code'],
        'text-size': 12,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 2.5
      }
    })
  }

  // 7a-7h: Lớp tấm bê tông, khe co, khe giãn, mép đường
  if (!map.getLayer('slabs-outline-shadow')) {
    map.addLayer({
      id: 'slabs-outline-shadow',
      type: 'line',
      source: 'slabs-source',
      paint: {
        'line-color': '#000000',
        'line-width': 2.0,
        'line-opacity': 0.4
      }
    })
  }

  if (!map.getLayer('slabs-outline-layer')) {
    map.addLayer({
      id: 'slabs-outline-layer',
      type: 'line',
      source: 'slabs-source',
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 1.0,
        'line-opacity': 0.75
      }
    })
  }

  if (!map.getLayer('joints-contraction-layer')) {
    map.addLayer({
      id: 'joints-contraction-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['!=', ['get', 'isExpansion'], true],
      paint: {
        'line-color': '#94A3B8',
        'line-width': 1.2,
        'line-dasharray': [1.5, 1.5]
      }
    })
  }

  if (!map.getLayer('joints-expansion-layer')) {
    map.addLayer({
      id: 'joints-expansion-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      paint: {
        'line-color': '#F59E0B',
        'line-width': 3.5,
        'line-opacity': 0.95
      }
    })
  }

  if (!map.getLayer('edges-dimension-line-layer')) {
    map.addLayer({
      id: 'edges-dimension-line-layer',
      type: 'line',
      source: 'edges-source',
      filter: ['==', ['get', 'isDimensionLine'], true],
      paint: {
        'line-color': '#38BDF8',
        'line-width': 2.0,
        'line-dasharray': [2, 1.5]
      }
    })
  }

  if (!map.getLayer('slabs-label-layer')) {
    map.addLayer({
      id: 'slabs-label-layer',
      type: 'symbol',
      source: 'slabs-source',
      minzoom: 13.5,
      layout: {
        'text-field': ['get', 'code'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 9, 16, 11, 18, 13],
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  if (!map.getLayer('joints-expansion-label-layer')) {
    map.addLayer({
      id: 'joints-expansion-label-layer',
      type: 'symbol',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      minzoom: 12.0,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#F59E0B',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  if (!map.getLayer('edges-label-layer')) {
    map.addLayer({
      id: 'edges-label-layer',
      type: 'symbol',
      source: 'edges-source',
      filter: ['!=', ['get', 'isDimensionLine'], true],
      minzoom: 11.5,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': [
          'case',
          ['==', ['get', 'side'], 'LEFT'], '#38BDF8',
          ['==', ['get', 'side'], 'RIGHT'], '#FBBF24',
          '#34D399'
        ],
        'text-halo-color': '#0F172A',
        'text-halo-width': 3.0
      }
    })
  }

  // Feature click handler
  const handleFeatureClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0) return
    const segId = e.features[0].properties?.id
    const segCode = e.features[0].properties?.code
    const segStart = e.features[0].properties?.startKm
    const segEnd = e.features[0].properties?.endKm
    const segLen = e.features[0].properties?.lengthKm
    const segWidth = e.features[0].properties?.roadWidthM || 8.0
    const halfWidth = (Number(segWidth) / 2).toFixed(1)

    if (segId) {
      onSelectSegmentId(segId)
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2.5 text-xs font-sans min-w-[240px]">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1">${segCode}</div>
            <div class="text-[#8F7212] font-mono font-semibold mt-1">Km ${Number(segStart).toFixed(3)} - Km ${Number(segEnd).toFixed(3)} (Dài: ${Number(segLen).toFixed(1)} km)</div>
            <div class="mt-2 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
              <div class="font-bold text-slate-900">🛣️ Thông số 2 mép đường:</div>
              <div class="flex items-center justify-between font-mono">
                <span class="text-sky-600 font-bold">Mép Trái: -${halfWidth}m</span>
                <span class="text-slate-400">|</span>
                <span class="text-amber-600 font-bold">Mép Phải: +${halfWidth}m</span>
              </div>
              <div class="text-slate-600 pt-1 border-t border-slate-200/60">Tổng bề rộng (W): <strong>${Number(segWidth).toFixed(1)}m</strong></div>
            </div>
            <div class="mt-2 text-[11px] text-slate-500">
              🧱 <strong>Lưới tấm BTXM:</strong> 5.0m × ${halfWidth}m • Khe co 5m • Khe giãn 50m
            </div>
          </div>
        `)
        .addTo(map)
    }
  }

  // Click vào tấm bê tông hoặc khe giãn nở để xem popup kỹ thuật
  map.on('click', 'slabs-outline-layer', (e) => {
    if (!e.features || e.features.length === 0) return
    const p = e.features[0].properties
    if (!p) return

    if (popupRef.current) popupRef.current.remove()
    popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="p-2.5 text-xs font-sans min-w-[220px]">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="font-bold text-slate-900 text-sm">🧱 ${p.code}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
              p.status === 'GOOD' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }">${p.status === 'GOOD' ? 'Đạt chuẩn' : 'Cần theo dõi'}</span>
          </div>
          <div class="mt-2 space-y-1 text-slate-600">
            <div>📍 <strong>Lý trình:</strong> <span class="font-mono">${p.station}</span> (${p.lane})</div>
            <div>📐 <strong>Kích thước tấm:</strong> <span class="font-mono font-bold text-slate-800">${p.lengthM}m × ${p.widthM}m × 26cm</span></div>
            <div>🛣️ <strong>Cự ly mép đường:</strong> <span class="font-mono text-[#8F7212] font-semibold">${p.edgeOffset}</span></div>
            <div>⚡ <strong>Khe co kề bên:</strong> <span class="font-mono text-slate-700 font-semibold">Khoảng cách 5.0m (Dowel bar phi 25)</span></div>
          </div>
        </div>
      `)
      .addTo(map)
  })

  map.on('click', 'joints-expansion-layer', (e) => {
    if (!e.features || e.features.length === 0) return
    const p = e.features[0].properties
    if (!p) return

    if (popupRef.current) popupRef.current.remove()
    popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="p-2.5 text-xs font-sans min-w-[230px]">
          <div class="font-bold text-amber-600 flex items-center gap-1 border-b border-amber-200 pb-1">
            <span>⚡ ${p.name}</span>
          </div>
          <div class="mt-2 space-y-1 text-slate-600">
            <div>📍 <strong>Vị trí:</strong> <span class="font-mono font-bold text-slate-800">${p.station}</span></div>
            <div>📏 <strong>Độ mở khe giãn nở:</strong> <span class="font-mono font-bold text-amber-700">20 mm (±2mm)</span></div>
            <div>🛡️ <strong>Cấu tạo kỹ thuật:</strong> ${p.description}</div>
            <div>🛣️ <strong>Bề rộng mặt đường tại khe:</strong> <span class="font-mono font-semibold">${p.roadWidthM}m</span></div>
          </div>
        </div>
      `)
      .addTo(map)
  })

  map.on('click', 'segments-surface-layer', handleFeatureClick)
  map.on('click', 'segments-dash-layer', handleFeatureClick)

  // Cursor pointers
  map.on('mouseenter', 'segments-surface-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'segments-surface-layer', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'slabs-outline-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'slabs-outline-layer', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'joints-expansion-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'joints-expansion-layer', () => { map.getCanvas().style.cursor = '' })

  // Render initial markers
  renderAlignmentMarkers(map, segments, currentCoords, currentKmPoints, markersRef, onSelectSegmentId, showToast)
}

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

// Cập nhật đồng bộ tức thời (0 delay) lên tất cả các lớp MapLibre
export function syncMapDataDirect(
  map: maplibregl.Map | null,
  updatedSegs: SegmentItem[],
  selId: string | null,
  coords: [number, number][],
  kmPts: number[],
  markersRef: React.RefObject<maplibregl.Marker[]>,
  onSelectSegmentId: (id: string) => void,
  showToast: (msg: string) => void,
  customCfg?: SlabsCustomConfig
) {
  if (!map) return
  try {
    const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
    if (surfSrc) {
      surfSrc.setData(buildSegmentsSurfaceGeoJSON(updatedSegs, coords, kmPts, selId))
    }
    const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
    if (segSrc) {
      segSrc.setData(buildSegmentsGeoJSON(updatedSegs, coords, kmPts, selId))
    }
    const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
    if (planSrc) {
      planSrc.setData(buildPlanningCorridorGeoJSON(coords))
    }

    const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
      updatedSegs,
      coords,
      kmPts,
      customCfg
    )
    const slabsSrc = map.getSource('slabs-source') as maplibregl.GeoJSONSource
    if (slabsSrc) slabsSrc.setData(slabsGeoJSON)

    const jointsSrc = map.getSource('joints-source') as maplibregl.GeoJSONSource
    if (jointsSrc) jointsSrc.setData(jointsGeoJSON)

    const edgesSrc = map.getSource('edges-source') as maplibregl.GeoJSONSource
    if (edgesSrc) edgesSrc.setData(edgesGeoJSON)

    renderAlignmentMarkers(map, updatedSegs, coords, kmPts, markersRef, onSelectSegmentId, showToast)
    map.triggerRepaint()
  } catch (err) {
    console.warn('syncMapDataDirect warning:', err)
  }
}
