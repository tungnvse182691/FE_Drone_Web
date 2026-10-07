import * as maplibregl from 'maplibre-gl'

// Biến lưu trữ marker ghim vị trí toàn cục trong tương tác bản đồ
let activePinMarker: maplibregl.Marker | null = null

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
    labelCode: string
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

    // 2. Tính Bounding Box và Zoom mượt mà (fitBounds / flyTo) tới chính xác đoạn đường được ấn
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

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 90, bottom: 90, left: 100, right: 100 },
          maxZoom: 18.2,
          duration: 900
        })
      } else {
        map.flyTo({
          center: lngLat,
          zoom: 17.5,
          duration: 800
        })
      }
    } catch {
      map.flyTo({
        center: lngLat,
        zoom: 17.5,
        duration: 800
      })
    }
  }

  // Feature click handler cho phân đoạn (Cả tuyến chính lẫn tuyến nhánh)
  const handleFeatureClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (isPickingRef?.current) return
    if (!e.features || e.features.length === 0) return

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

      // Cắm ghim và phóng to tới đoạn đường vừa click
      pinAndFocusFeature(e.lngLat, f, `${branchTitle}${segCode}`)

      // Mở Popup thông số kỹ thuật chi tiết
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 18, closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2.5 text-xs font-sans min-w-[250px]">
            <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span class="font-bold text-slate-900">${branchTitle}${segCode}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isBranch ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
              }">${isBranch ? 'Tuyến Nhánh' : 'Trục Chính'}</span>
            </div>
            <div class="text-[#8F7212] font-mono font-semibold mt-1.5">
              Km ${Number(segStart).toFixed(3)} - Km ${Number(segEnd).toFixed(3)} (Dài: ${Number(segLen).toFixed(2)} km)
            </div>
            <div class="mt-2 space-y-1 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div class="font-bold text-slate-900 flex items-center gap-1">
                <span>🛣️ Thông số 2 mép đường:</span>
              </div>
              <div class="flex items-center justify-between font-mono text-[11px] pt-0.5">
                <span class="text-sky-600 font-bold">Mép Trái: -${halfWidth}m</span>
                <span class="text-slate-400">|</span>
                <span class="text-amber-600 font-bold">Mép Phải: +${halfWidth}m</span>
              </div>
              <div class="text-slate-700 pt-1 border-t border-slate-200 font-mono">
                Tổng bề rộng (W): <strong class="text-amber-600 font-bold">${Number(segWidth).toFixed(1)}m</strong>
              </div>
            </div>
            <div class="mt-2 text-[11px] text-slate-500">
              🧱 <strong>Lưới tấm BTXM:</strong> 5.0m × ${halfWidth}m • Khe co 5m • Khe giãn 50m
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

    // 2. Cắm ghim và zoom tới vị trí tấm vừa ấn
    pinAndFocusFeature(e.lngLat, f, displayLabel)

    // 3. Mở popup chi tiết tấm
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

  // Click vào khe giãn nở để kích hoạt chọn phân đoạn & xem popup kỹ thuật
  map.on('click', 'joints-expansion-layer', (e) => {
    if (isPickingRef?.current) return
    if (!e.features || e.features.length === 0) return
    const f = e.features[0]
    const p = f.properties || {}
    if (!p) return

    const targetSegId = p.segmentId || p.id
    const targetBranchId = p.branchId
    triggerSelectSegment(targetSegId, targetBranchId, f)
    pinAndFocusFeature(e.lngLat, f, p.label || p.name || p.id)

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

  // Click toàn cục trên bản đồ (vùng lân cận con trỏ chuột) để bắt trúng 100% khi click vào bất kỳ vị trí nào trên tuyến
  map.on('click', (e) => {
    if (isPickingRef?.current) return

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
      pinAndFocusFeature(e.lngLat, f, displayLabel)
    }
  })
}
