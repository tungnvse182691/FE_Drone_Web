import * as maplibregl from 'maplibre-gl'

// Biến lưu trữ marker ghim vị trí toàn cục trong tương tác bản đồ
let activePinMarker: maplibregl.Marker | null = null
let lastHandledClickTimestamp = 0

export function setupAlignmentMapInteractions(
  map: maplibregl.Map,
  popupRef: React.RefObject<maplibregl.Popup | null>,
  onSelectSegmentId: (id: string, branchId?: string) => void,
  isPickingRef?: React.RefObject<boolean>,
  onSelectSegmentRef?: React.RefObject<((id: string, branchId?: string, feature?: any) => void) | null>
) {
  const triggerSelectSegment = (id: string, branchId?: string, feature?: any) => {
    if (onSelectSegmentRef?.current) {
      onSelectSegmentRef.current(id, branchId, feature)
    } else {
      onSelectSegmentId(id, branchId)
    }
  }

  // Hàm cắm ghim (Pin Marker) và phóng to (Zoom/FlyTo) tới đoạn đường được click
  const pinAndFocusFeature = (
    lngLat: maplibregl.LngLat,
    feature: any,
    labelCode: string,
    targetMaxZoom?: number
  ) => {
    // 1. Cắm ghim Pin Marker nổi bật phong cách Hoàng Hải (Vàng đồng #C9A227 & Đỏ viền trắng)
    if (activePinMarker) {
      activePinMarker.remove()
    }

    const pinEl = document.createElement('div')
    pinEl.className = 'alignment-focus-pin group cursor-pointer'
    pinEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="background: rgba(15, 23, 42, 0.92); color: #FEF08A; font-family: monospace; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(201, 162, 39, 0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap; margin-bottom: 2px;">
          📍 ${labelCode}
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #C9A227; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); border: 2.5px solid #FFFFFF;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s-6-5.33-6-10a6 6 0 0 1 12 0c0 4.67-6 10-6 10z"/>
            <circle cx="12" cy="11" r="2.5"/>
          </svg>
        </div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #EF4444; margin-top: 1px; box-shadow: 0 0 8px #EF4444;"></div>
      </div>
    `

    activePinMarker = new maplibregl.Marker({
      element: pinEl,
      anchor: 'bottom'
    })
      .setLngLat(lngLat)
      .addTo(map)

    // 2. Tính Bounding Box và Zoom mượt mà tới đoạn đường được ấn
    try {
      const geom = feature?.geometry
      const bounds = new maplibregl.LngLatBounds()

      const extractCoords = (coordsArray: any) => {
        if (!coordsArray || !Array.isArray(coordsArray)) return
        if (typeof coordsArray[0] === 'number' && typeof coordsArray[1] === 'number') {
          bounds.extend([coordsArray[0], coordsArray[1]])
        } else {
          coordsArray.forEach(extractCoords)
        }
      }

      if (geom) {
        extractCoords(geom.coordinates)
      }

      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const isSinglePointOrTiny =
        bounds.isEmpty() ||
        (Math.abs(sw.lng - ne.lng) < 0.0003 && Math.abs(sw.lat - ne.lat) < 0.0003)

      if (!bounds.isEmpty() && !isSinglePointOrTiny) {
        map.fitBounds(bounds, {
          padding: { top: 70, bottom: 70, left: 80, right: 80 },
          maxZoom: targetMaxZoom || 15.2,
          duration: 700
        })
      } else {
        map.flyTo({
          center: lngLat,
          zoom: targetMaxZoom || (isSinglePointOrTiny ? 16.5 : 14.8),
          duration: 650
        })
      }
    } catch {
      map.flyTo({
        center: lngLat,
        zoom: targetMaxZoom || 14.8,
        duration: 650
      })
    }
  }

  // Feature click handler cho phân đoạn (Cả tuyến chính lẫn tuyến nhánh)
  const handleFeatureClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (isPickingRef?.current) return
    if (!e.features || e.features.length === 0) return

    lastHandledClickTimestamp = Date.now()

    const f = e.features[0]
    const p = f.properties || {}
    const segId = p.segmentId || p.id
    const branchId = p.branchId
    const segCode = p.code || p.name || 'Phân đoạn'
    const segStart = p.startKm ?? 0.0
    const segEnd = p.endKm ?? 0.0
    const segLen = p.lengthKm ?? (Number(segEnd) - Number(segStart))
    const segWidth = p.roadWidthM || 8.0
    const halfWidth = (Number(segWidth) / 2).toFixed(1)
    const isBranch = Boolean(p.isBranch || p.branchId || p.branchCode)
    const branchTitle = p.branchCode ? `[${p.branchCode}] ` : ''

    if (segId) {
      triggerSelectSegment(segId, branchId, f)

      // Cắm ghim và phóng to tới đoạn đường vừa click với maxZoom 15.2 hợp lý
      pinAndFocusFeature(e.lngLat, f, `${branchTitle}${segCode}`, 15.2)

      const formatStationKm = (km: number) => {
        const k = Math.floor(km)
        const m = Math.round((km - k) * 1000)
        return `Km ${k}+${String(m).padStart(3, '0')}`
      }

      const formatDistText = (km: number) => {
        const num = Number(km)
        if (num < 1.0) {
          return `${Math.round(num * 1000)}m`
        }
        return `${num.toFixed(2)} km`
      }

      // Mở Popup thông số kỹ thuật chi tiết phong cách RoadGuard Dark sang trọng
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 18, closeButton: true, className: 'roadguard-maplibre-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="bg-slate-900 text-slate-100 p-3 text-xs font-sans min-w-[270px]">
            <div class="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm"></span>
                <span class="font-bold text-white text-sm tracking-tight">${branchTitle}${segCode}</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                isBranch ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }">${isBranch ? 'Tuyến Nhánh' : 'Trục Chính'}</span>
            </div>

            <div class="text-amber-400 font-mono font-semibold text-xs mb-2.5 flex items-center gap-1.5">
              <span>📍</span>
              <span>${formatStationKm(Number(segStart))} → ${formatStationKm(Number(segEnd))}</span>
              <span class="text-slate-400 text-[11px] font-normal">(${formatDistText(Number(segLen))})</span>
            </div>

            <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Bề rộng mặt đường (W):</span>
                <span class="font-mono font-bold text-amber-400 text-xs">${Number(segWidth).toFixed(1)}m</span>
              </div>

              <div class="flex items-center justify-between font-mono text-[11px] pt-1.5 border-t border-slate-800/80">
                <span class="text-sky-400 font-bold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
                  Mép Trái: -${halfWidth}m
                </span>
                <span class="text-slate-600">|</span>
                <span class="text-amber-400 font-bold flex items-center gap-1">
                  Mép Phải: +${halfWidth}m
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                </span>
              </div>
            </div>

            <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-300">
              <span>🧱</span>
              <span><strong>Tấm BTXM:</strong> 5.0m × ${halfWidth}m • Khe co 5m • Khe giãn 50m</span>
            </div>
          </div>
        `)
        .addTo(map)
    }
  }

  // Click vào tấm bê tông để kích hoạt chọn phân đoạn & xem popup kỹ thuật
  map.on('click', 'slabs-outline-layer', (e) => {
    if (isPickingRef?.current) return
    if (!e.features || e.features.length === 0) return

    lastHandledClickTimestamp = Date.now()

    const f = e.features[0]
    const p = f.properties || {}
    if (!p) return

    const targetSegId = p.segmentId || p.id
    const targetBranchId = p.branchId
    const displayLabel = p.branchCode
      ? `[${p.branchCode}] ${p.segmentCode || p.code}`
      : (p.segmentCode || p.code)

    // 1. Kích hoạt chọn phân đoạn và chuyển đúng tuyến (Trục chính hoặc Nhánh)
    triggerSelectSegment(targetSegId, targetBranchId, f)

    // 2. Cắm ghim và zoom tới vị trí tấm vừa ấn với zoom 16.5
    pinAndFocusFeature(e.lngLat, f, displayLabel, 16.5)

    // 3. Mở popup chi tiết tấm phong cách RoadGuard Dark
    if (popupRef.current) popupRef.current.remove()
    popupRef.current = new maplibregl.Popup({ offset: 14, closeButton: true, className: 'roadguard-maplibre-popup' })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="bg-slate-900 text-slate-100 p-3 text-xs font-sans min-w-[240px]">
          <div class="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
            <span class="font-bold text-white text-sm flex items-center gap-1.5">
              <span>🧱</span>
              <span>${p.code}</span>
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              p.status === 'GOOD' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }">${p.status === 'GOOD' ? 'Đạt chuẩn' : 'Cần theo dõi'}</span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <div>📍 <strong>Lý trình:</strong> <span class="font-mono text-amber-400">${p.station}</span> (${p.lane})</div>
            <div>📐 <strong>Kích thước tấm:</strong> <span class="font-mono font-bold text-white">${p.lengthM}m × ${p.widthM}m × 26cm</span></div>
            <div>🛣️ <strong>Cự ly mép đường:</strong> <span class="font-mono text-sky-400 font-semibold">${p.edgeOffset}</span></div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">⚡ <strong>Khe co kề bên:</strong> Cự ly 5.0m (Dowel bar φ25)</div>
          </div>
        </div>
      `)
      .addTo(map)
  })

  // Click vào khe giãn nở để kích hoạt chọn phân đoạn & xem popup kỹ thuật
  map.on('click', 'joints-expansion-layer', (e) => {
    if (isPickingRef?.current) return
    if (!e.features || e.features.length === 0) return

    lastHandledClickTimestamp = Date.now()

    const f = e.features[0]
    const p = f.properties || {}
    if (!p) return

    const targetSegId = p.segmentId || p.id
    const targetBranchId = p.branchId
    triggerSelectSegment(targetSegId, targetBranchId, f)
    pinAndFocusFeature(e.lngLat, f, p.label || p.name || p.id, 16.5)

    if (popupRef.current) popupRef.current.remove()
    popupRef.current = new maplibregl.Popup({ offset: 14, closeButton: true, className: 'roadguard-maplibre-popup' })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="bg-slate-900 text-slate-100 p-3 text-xs font-sans min-w-[240px]">
          <div class="font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-700/80 pb-2 mb-2 text-sm">
            <span>⚡</span>
            <span>${p.name}</span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <div>📍 <strong>Vị trí:</strong> <span class="font-mono font-bold text-white">${p.station}</span></div>
            <div>📏 <strong>Độ mở khe giãn nở:</strong> <span class="font-mono font-bold text-amber-400">20 mm (±2mm)</span></div>
            <div>🛡️ <strong>Cấu tạo kỹ thuật:</strong> <span class="text-slate-300">${p.description}</span></div>
            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">🛣️ <strong>Bề rộng mặt đường tại khe:</strong> <span class="font-mono font-semibold text-sky-400">${p.roadWidthM}m</span></div>
          </div>
        </div>
      `)
      .addTo(map)
  })

  // Đăng ký sự kiện click cho Trục chính & Tuyến nhánh
  map.on('click', 'segments-surface-layer', handleFeatureClick)
  map.on('click', 'segments-dash-layer', handleFeatureClick)
  map.on('click', 'branches-surface-layer', handleFeatureClick)
  map.on('click', 'branches-line-layer', handleFeatureClick)

  // Cursor pointers
  map.on('mouseenter', 'segments-surface-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'segments-surface-layer', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'branches-surface-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'branches-surface-layer', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'slabs-outline-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'slabs-outline-layer', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'joints-expansion-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'joints-expansion-layer', () => { map.getCanvas().style.cursor = '' })

  // Click toàn cục trên bản đồ (vùng lân cận con trỏ chuột) để bắt trúng khi click vào bất kỳ vị trí nào trên tuyến
  map.on('click', (e) => {
    if (isPickingRef?.current) return
    // Nếu sự kiện click đã được xử lý bởi layer handler thì bỏ qua
    if (Date.now() - lastHandledClickTimestamp < 150) return

    const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
      [e.point.x - 8, e.point.y - 8],
      [e.point.x + 8, e.point.y + 8]
    ]

    const targetLayers = [
      'branches-surface-layer',
      'branches-line-layer',
      'segments-surface-layer',
      'segments-dash-layer',
      'slabs-outline-layer',
      'joints-expansion-layer'
    ].filter((lid) => map.getLayer(lid))

    const features = map.queryRenderedFeatures(bbox, { layers: targetLayers })
    if (!features || features.length === 0) return

    const f = features[0]
    const p = f.properties || {}
    const segId = p.segmentId || p.id
    const branchId = p.branchId
    const displayLabel = p.branchCode
      ? `[${p.branchCode}] ${p.segmentCode || p.code || p.name || ''}`
      : (p.segmentCode || p.code || p.name || 'Phân đoạn')

    if (segId || branchId) {
      triggerSelectSegment(segId, branchId, f)
      pinAndFocusFeature(e.lngLat, f, displayLabel, 15.2)
    }
  })
}
