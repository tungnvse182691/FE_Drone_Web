import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { RouteConfig, DefectItem } from './types'

export const initFastTrackMap = (
  container: HTMLDivElement,
  currentRouteConfig: RouteConfig,
  mapLayer: 'SATELLITE' | 'VECTOR',
  defects: DefectItem[],
  routeFilter: string,
  selectedDefectIds: string[],
  onSelectDefect: (defect: DefectItem) => void
): { map: maplibregl.Map; cleanup: () => void } => {
  const corridorCoords = currentRouteConfig.coords

  const map = new maplibregl.Map({
    container,
    style: getMapLibreStyle(mapLayer === 'SATELLITE' ? 'SATELLITE' : 'STREETS'),
    center: currentRouteConfig.center,
    zoom: currentRouteConfig.zoom,
    pitch: 32,
    bearing: -15
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

  const markers: maplibregl.Marker[] = []

  map.on('load', () => {
    // Vẽ hành lang tuyến đường
    map.addSource('dispatch-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: corridorCoords },
        properties: {}
      }
    })

    map.addLayer({
      id: 'dispatch-glow',
      type: 'line',
      source: 'dispatch-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#C9A227',
        'line-width': 6,
        'line-opacity': 0.35
      }
    })

    map.addLayer({
      id: 'dispatch-line',
      type: 'line',
      source: 'dispatch-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2,
        'line-dasharray': [3, 2]
      }
    })

    // Ghim các Marker Defect thuộc tuyến đường hiện tại
    const routeDefects = defects.filter((d) => d.routeId === routeFilter)
    routeDefects.forEach((defect) => {
      const isSelected = selectedDefectIds.includes(defect.id)
      const isEligible = defect.isFastTrackEligible

      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:${isSelected ? (isEligible ? '#15803D' : '#DC2626') : '#1E293B'}; color:#FFFFFF; font-size:10px; font-weight:bold; font-family:monospace; padding:2px 6px; border-radius:4px; border:1px solid ${isSelected ? '#FFFFFF' : '#C9A227'}; box-shadow:0 2px 5px rgba(0,0,0,0.5); white-space:nowrap; margin-bottom:2px;">
            ${defect.code} (${defect.stationing})
          </div>
          <div style="position:relative; width:${isSelected ? '20px' : '14px'}; height:${isSelected ? '20px' : '14px'}; background:${isEligible ? '#16A34A' : '#EF4444'}; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px ${isEligible ? '#16A34A' : '#EF4444'};">
            ${!isEligible ? '<div style="position:absolute; inset:-4px; border:2px solid #EF4444; border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
          </div>
        </div>
      `

      el.onclick = () => {
        onSelectDefect(defect)
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([defect.gps.lng, defect.gps.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family:sans-serif; font-size:12px; padding:6px; color:#1E293B;">
              <strong style="color:${isEligible ? '#15803D' : '#DC2626'}; font-size:13px;">${defect.code} - ${defect.type}</strong><br/>
              <span>${defect.stationing} (${defect.lane})</span><br/>
              <span style="font-weight:600;">Kích thước: ${defect.areaM2} m² • Sâu: ${defect.depthCm} cm</span><br/>
              <span style="color:${isEligible ? '#15803D' : '#DC2626'}; font-weight:bold;">
                ${isEligible ? '✓ Đạt chuẩn Fast Track' : '⚠ Vi phạm ngưỡng (Over-limit)'}
              </span><br/>
              <span style="color:#64748B;">Phân công: ${defect.assignedCrew}</span>
            </div>
          `)
        )
        .addTo(map)

      markers.push(marker)
    })

    setTimeout(() => map.resize(), 100)
  })

  return {
    map,
    cleanup: () => {
      markers.forEach((m) => m.remove())
      map.remove()
    }
  }
}
