import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LngLatBounds, Map as MapLibre, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle, setMapLayerVisibility } from '../../../utils/maplibre'
import type { ReportingFilters, ReportingGeometry } from '../../../api/services/projectReportingService'
import { RiskDeteriorationSection } from './RiskDeteriorationSection'
import { numberLabel } from './reportMenuLabels'

export function ReportingGeometryMap({ projectName, geometry, filters, loading, error, renderLayout }: {
  projectName: string; geometry?: ReportingGeometry; filters: ReportingFilters; loading: boolean; error?: string
  renderLayout: (map: ReactNode, segmentTable: ReactNode) => ReactNode
}) {
  const node = useRef<HTMLDivElement>(null)
  const instance = useRef<MapLibre | null>(null)
  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState('')
  const [selected, setSelected] = useState('')
  const [layer, setLayer] = useState<'satellite' | 'vector'>('satellite')
  const { routes, segments } = useMemo(() => ({
    routes: (geometry?.routes || []).filter(r => (!filters.routeVersionId || r.id === filters.routeVersionId) && r.coordinates.length > 1),
    segments: (geometry?.segments || []).filter(s =>
      (!filters.routeVersionId || s.routeVersionId === filters.routeVersionId) &&
      (!filters.segmentSetId || s.segmentSetId === filters.segmentSetId) &&
      (!filters.segmentIds?.length || filters.segmentIds.includes(s.id))).map(s => ({
        id: s.id, coordinates: s.coordinates, section_name: s.name, length: s.length,
        chainage_display: `${numberLabel(s.from)}–${numberLabel(s.to)} m`,
        start_km_num: s.from / 1000, end_km_num: s.to / 1000,
      })),
  }), [geometry, filters.routeVersionId, filters.segmentSetId, filters.segmentIds])
  const hasGeometry = !!(routes.length || segments.some(s => s.coordinates.length > 1))

  function fit(coordinates: [number, number][]) {
    if (coordinates.length < 2) return
    const bounds = new LngLatBounds()
    coordinates.forEach(point => bounds.extend(point))
    instance.current?.fitBounds(bounds, { padding: 42, maxZoom: 16, duration: 350 })
  }
  const allCoordinates = () => [...routes.flatMap(r => r.coordinates), ...segments.flatMap(s => s.coordinates)]

  useEffect(() => {
    if (!node.current || !hasGeometry) return
    try {
      const map = new MapLibre({ container: node.current, style: getMapLibreStyle('SATELLITE'), center: [0, 0], zoom: 1 })
      instance.current = map
      map.once('load', () => {
        map.addSource('report-geometry', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'report-lines', type: 'line', source: 'report-geometry',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-width': 5, 'line-color': ['case', ['has', 'segmentId'], '#2563EB', '#94A3B8'] },
        })
        map.addLayer({
          id: 'report-selection', type: 'line', source: 'report-geometry',
          filter: ['==', ['get', 'segmentId'], ''],
          paint: { 'line-width': 8, 'line-color': '#C9A227' },
        })
        map.on('click', 'report-lines', event => {
          const id = event.features?.[0]?.properties?.segmentId
          if (typeof id === 'string') setSelected(id)
        })
        setReady(true)
        setMapError('')
      })
      return () => { instance.current = null; setReady(false); map.remove() }
    } catch {
      setMapError('Trình duyệt không khởi tạo được bình đồ tuyến.')
    }
  }, [hasGeometry])

  useEffect(() => {
    if (!ready) return
    const source = instance.current?.getSource<GeoJSONSource>('report-geometry')
    source?.setData({ type: 'FeatureCollection', features: [
      ...routes.map(row => ({ type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: row.coordinates }, properties: {} })),
      ...segments.filter(row => row.coordinates.length > 1).map(row => ({
        type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: row.coordinates }, properties: { segmentId: row.id },
      })),
    ] })
    fit(allCoordinates())
  }, [ready, routes, segments])

  useEffect(() => {
    if (ready && instance.current) setMapLayerVisibility(instance.current, layer === 'satellite' ? 'SATELLITE' : 'VECTOR')
  }, [ready, layer])
  useEffect(() => {
    if (ready) instance.current?.setFilter('report-selection', ['==', ['get', 'segmentId'], selected])
  }, [ready, selected])

  return <RiskDeteriorationSection projectName={projectName} loading={loading} error={error || mapError}
    wrapLayerControls renderLayout={renderLayout}
    warnings={geometry?.warnings} hasMapGeometry={hasGeometry && !mapError} segments={segments}
    activeSegmentId={selected} mapContainerRef={node} mapLayer={layer} setMapLayer={setLayer}
    onFocusSegment={row => { setSelected(row.id); fit(row.coordinates) }}
    onFitBounds={() => fit(allCoordinates())} onZoomIn={() => instance.current?.zoomIn()} onZoomOut={() => instance.current?.zoomOut()} />
}
