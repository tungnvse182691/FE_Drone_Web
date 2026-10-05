import * as maplibregl from 'maplibre-gl'

export function setupAlignmentMapInteractions(
  map: maplibregl.Map,
  popupRef: React.RefObject<maplibregl.Popup | null>,
  onSelectSegmentId: (id: string) => void
) {
  // Feature click handler cho phân đoạn
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
}
