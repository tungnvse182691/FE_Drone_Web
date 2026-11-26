import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { routingMapService, routingError, type RoutingMapSnapshot, type RoutingMapFeature, type RoutingRouteInfo } from '../../../api/services/routingMapService'
import { alignmentService, utm48NToWgs84 } from '../../../api/services/alignmentService'
import { useAuthStore } from '../../../store/authStore'

type DisplayRoute = Omit<RoutingMapFeature, 'properties'> & { properties: RoutingRouteInfo }

const PALETTE = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#65a30d', '#b45309', '#4f46e5', '#0d9488']

// Bản đồ tuyến của mọi dự án công ty (GET /company/road-map, chỉ Giám sát). Chỉ điều hướng tới GPS của ảnh/evidence đang chọn.
export function RoutingMapView({ gps, company, selectionKey, focus }: { gps: { lat: number; lng: number } | null; company: boolean; selectionKey: string; focus: { serial: number; route?: RoutingRouteInfo } | null }) {
  const epoch = useAuthStore(s => s.authEpoch)
  const box = useRef<HTMLDivElement>(null), mapRef = useRef<maplibregl.Map | null>(null)
  const labels = useRef<maplibregl.Marker[]>([]), pin = useRef<maplibregl.Marker | null>(null), fitted = useRef(false)
  const [historical, setHistorical] = useState(false), [reload, setReload] = useState(0)
  const [snap, setSnap] = useState<{ scope: string; data?: RoutingMapSnapshot; error?: string } | null>(null)
  const [progress, setProgress] = useState(''), [ready, setReady] = useState(false), [mapError, setMapError] = useState('')
  const [routeState, setRouteState] = useState<{ key: string; feature?: DisplayRoute; error?: string } | null>(null)
  const [highlight, setHighlight] = useState<{ key: string; id: string } | null>(null)
  const handled = useRef(''), focusGeneration = useRef(0)
  const scope = `${epoch}:${historical}:${reload}`
  const data = snap?.scope === scope ? snap.data : undefined
  const extra = routeState?.key === selectionKey ? routeState.feature : undefined
  const routeError = routeState?.key === selectionKey ? routeState.error : undefined
  const routes = useMemo(() => extra && !data?.features.some(f => f.properties.routeVersionId === extra.properties.routeVersionId) ? [...(data?.features || []), extra] : data?.features || [], [data, extra])
  const colorOf = useMemo(() => {
    const ids = [...new Set((data?.features || []).map(f => f.properties.projectId))].sort()
    return (projectId: string) => PALETTE[Math.max(0, ids.indexOf(projectId)) % PALETTE.length]
  }, [data])

  useEffect(() => {
    const controller = new AbortController()
    if (!company) return () => controller.abort()
    setProgress('Đang đọc trang 1…')
    routingMapService.readMap({ includeHistorical: historical, signal: controller.signal, onProgress: (p, f) => setProgress(`Đã đọc ${p} trang, ${f} tuyến…`) })
      .then(d => { if (!controller.signal.aborted) { setSnap({ scope, data: d }) } })
      .catch(e => { if (!controller.signal.aborted) { setSnap({ scope, error: routingError(e) }) } })
    return () => controller.abort()
  }, [scope, company])

  useEffect(() => {
    if (!box.current) return
    try {
      const map = new maplibregl.Map({ container: box.current, style: getMapLibreStyle('STREETS'), center: [106, 16], zoom: 5, attributionControl: { compact: true } })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.on('load', () => {
        map.addSource('routes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({ id: 'routes-casing', type: 'line', source: 'routes', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.9 } })
        map.addLayer({ id: 'routes-line', type: 'line', source: 'routes', filter: ['==', ['get', 'isCurrent'], true], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 4 } })
        map.addLayer({ id: 'routes-hist', type: 'line', source: 'routes', filter: ['==', ['get', 'isCurrent'], false], layout: { 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-dasharray': [2, 2] } })
        map.addLayer({ id: 'routes-hi', type: 'line', source: 'routes', filter: ['==', ['get', 'routeVersionId'], ''], paint: { 'line-color': '#facc15', 'line-width': 9, 'line-opacity': 0.8 } }, 'routes-line')
        setReady(true)
      })
      map.on('error', e => { if (!(e as any)?.sourceId) setMapError(String((e as any)?.error?.message || 'Lỗi bản đồ')) })
      mapRef.current = map
    } catch (e) { setMapError(`Không khởi tạo được bản đồ (WebGL): ${(e as Error).message}`) }
    return () => { labels.current.forEach(m => m.remove()); pin.current?.remove(); mapRef.current?.remove(); mapRef.current = null; setReady(false) }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    labels.current.forEach(m => m.remove()); labels.current = []
    const features = routes.map(f => ({ type: 'Feature' as const, geometry: f.geometry, properties: { routeVersionId: f.properties.routeVersionId, isCurrent: f.properties.isCurrent, color: colorOf(f.properties.projectId) } }))
    ;(map.getSource('routes') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features })
    for (const f of routes) {
      const c = f.geometry.coordinates, mid = c[Math.floor(c.length / 2)]
      if (!mid || !f.properties.roadSectionName?.trim()) continue
      const el = document.createElement('button')
      el.type = 'button'
      el.addEventListener('click', event => { event.stopPropagation(); fitRoute(f) })
      el.textContent = f.properties.roadSectionName
      el.setAttribute('data-testid', 'route-label')
      el.setAttribute('data-route-version-id', f.properties.routeVersionId)
      el.style.cssText = `pointer-events:auto;cursor:pointer;font:600 11px sans-serif;padding:1px 6px;border-radius:9999px;background:#fff;border:1.5px solid ${colorOf(f.properties.projectId)};color:#0f172a;white-space:nowrap`
      labels.current.push(new maplibregl.Marker({ element: el }).setLngLat([mid[0], mid[1]]).addTo(map))
    }
    if (!gps && !fitted.current && features.length) {
      const b = new maplibregl.LngLatBounds()
      for (const f of features) for (const p of f.geometry.coordinates) b.extend([p[0], p[1]])
      map.fitBounds(b, { padding: 40, maxZoom: 14, duration: 0 }); fitted.current = true
    }
  }, [routes, ready, selectionKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    pin.current?.remove(); pin.current = null
    if (!gps) return
    const el = document.createElement('div'); el.setAttribute('data-testid', 'gps-pin'); el.title = 'GPS ảnh/bằng chứng đang chọn'
    el.style.cssText = 'width:16px;height:16px;border-radius:9999px;background:#dc2626;border:3px solid #fff;box-shadow:0 0 0 2px #dc2626'
    pin.current = new maplibregl.Marker({ element: el }).setLngLat([gps.lng, gps.lat]).addTo(map)
    map.flyTo({ center: [gps.lng, gps.lat], zoom: 15, duration: 600 }); fitted.current = true
  }, [gps?.lat, gps?.lng, ready, selectionKey])

  function fitRoute(feature: DisplayRoute) {
    const map = mapRef.current
    if (!map) return
    focusGeneration.current++
    const bounds = new maplibregl.LngLatBounds()
    for (const p of feature.geometry.coordinates) bounds.extend([p[0], p[1]])
    fitted.current = true
    setHighlight({ key: selectionKey, id: feature.properties.routeVersionId })
    map.fitBounds(bounds, { padding: 40, maxZoom: 17, duration: 400 })
  }
  useEffect(() => {
    const map = mapRef.current
    if (map && ready && map.getLayer('routes-hi')) map.setFilter('routes-hi', ['==', ['get', 'routeVersionId'], highlight?.key === selectionKey ? highlight.id : ''])
  }, [highlight, selectionKey, ready])
  useEffect(() => {
    if (!focus || !ready || !mapRef.current) return
    const token = `${selectionKey}:${focus.serial}`
    if (handled.current === token) return
    handled.current = token; fitted.current = true
    const generation = ++focusGeneration.current
    const route = focus.route
    if (!route) {
      setHighlight(null)
      if (gps) {
        mapRef.current.flyTo({ center: [gps.lng, gps.lat], zoom: 16, duration: 400 })
        const el = pin.current?.getElement()
        if (el) { el.style.width = '22px'; el.style.height = '22px'; el.style.boxShadow = '0 0 0 6px rgba(220,38,38,.25)' }
      }
      return
    }
    const found = routes.find(f => f.properties.routeVersionId === route.routeVersionId)
    if (found) { fitRoute(found); return }
    let active = true
    setRouteState({ key: selectionKey })
    alignmentService.readConfirmedGeometry(route.projectId, route.roadSectionId, route.routeVersionId).then(g => {
      if (!active || generation !== focusGeneration.current) return
      if (g.projectId !== route.projectId || g.roadSectionId !== route.roadSectionId || g.routeVersionId !== route.routeVersionId) throw new Error('Geometry không khớp phiên bản tuyến đã chọn.')
      const coordinates = g.wgs84Centerline?.type === 'LineString' ? g.wgs84Centerline.coordinates
        : g.engineeringSrid === 32648 && g.metricCenterline?.type === 'LineString' ? g.metricCenterline.coordinates?.map(([x,y]) => utm48NToWgs84(x,y)) : undefined
      if (!coordinates || coordinates.length < 2 || !coordinates.every(p => p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90)) throw new Error('Tuyến này chưa có hình học hiển thị được.')
      const feature: DisplayRoute = { id: route.routeVersionId, type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: route }
      setRouteState({ key: selectionKey, feature }); fitRoute(feature)
    }).catch(e => { if (active && generation === focusGeneration.current) setRouteState({ key: selectionKey, error: routingError(e) }) })
    return () => { active = false }
  }, [focus, ready, selectionKey])

  const projects = useMemo(() => {
    const m = new Map<string, { name: string; status: string; routes: string[] }>()
    for (const f of routes) {
      const e = m.get(f.properties.projectId) || { name: f.properties.projectName, status: f.properties.projectStatus, routes: [] }
      e.routes.push(`${f.properties.roadSectionCode}${f.properties.isCurrent ? '' : ` v${f.properties.versionNo}`}`); m.set(f.properties.projectId, e)
    }
    return [...m.entries()]
  }, [data])
  const loading = company && (!snap || snap.scope !== scope)
  return <div className="space-y-2" data-testid="routing-map">
    {company && <div className="flex flex-wrap items-center justify-between gap-2">
      <label className="flex gap-1.5 text-[11px] text-slate-600"><input type="checkbox" checked={historical} onChange={e => setHistorical(e.target.checked)} />Gồm mọi phiên bản tuyến đã lưu (lịch sử)</label>
      <button type="button" disabled={loading} onClick={() => setReload(n => n + 1)} className="rg-btn text-xs">Tải lại bản đồ</button>
    </div>}
    <div className="relative">
      <div ref={box} className="w-full h-72 rounded-lg border border-slate-200 bg-slate-100" />

    </div>
    {routeError && <p role="alert" className="text-xs text-rose-700">{routeError}</p>}
    {mapError && <p role="alert" className="text-xs text-rose-700">{mapError}</p>}
    {loading && <p role="status" className="text-xs text-slate-500">{progress}</p>}
    {snap?.scope === scope && snap.error && <p role="alert" className="text-xs text-rose-700">{snap.error} <button type="button" className="underline" onClick={() => setReload(n => n + 1)}>Thử lại</button></p>}
    {data && <div className="text-[11px] text-slate-600 space-y-1">
      <p data-testid="map-summary">{data.features.length} tuyến hiển thị · {projects.length} dự án · đọc đủ {data.pages} trang{data.unavailable.length ? ` · ${data.unavailable.length} tuyến không có hình học hiển thị được (không phải ngoài phạm vi)` : ''}</p>
      {data.features.length === 0 && <p>Chưa có tuyến nào trong phạm vi đọc được (đã đọc hết các trang).</p>}

      {data.unavailable.length > 0 && <details><summary className="cursor-pointer">Tuyến không dựng được hình học ({data.unavailable.length})</summary><ul className="list-disc pl-4">{data.unavailable.map(u => <li key={u.routeVersionId} className="break-all">{u.routeVersionId}: {u.missingReasons.join(', ') || 'Chưa có lý do'} (bbox: {u.bboxRelation})</li>)}</ul></details>}
      <p className="text-slate-500">Hình học chỉ để hiển thị, không chứng minh trách nhiệm. Đường nét đứt là phiên bản lịch sử.</p>
    </div>}
  </div>
}
