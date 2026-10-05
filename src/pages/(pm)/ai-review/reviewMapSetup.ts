import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle as getUnifiedMapLibreStyle } from '../../../utils/maplibre'
import { TriageCase } from './types'

// Helper: Tạo GeoJSON vòng tròn bán kính R mét cho cụm gộp trùng không gian
export const createGeoCircle = (center: [number, number], radiusMeters: number, points = 36) => {
  const coords: [number, number][] = []
  const km = radiusMeters / 1000
  const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180))
  const distanceY = km / 110.574
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)])
  }
  coords.push(coords[0])
  return coords
}

export const initReviewGisModalMap = (
  container: HTMLDivElement,
  selectedCase: TriageCase,
  isSatellite: boolean
): { map: maplibregl.Map; cleanup: () => void } => {
  const center: [number, number] = [selectedCase.gps.lng, selectedCase.gps.lat]
  const map = new maplibregl.Map({
    container,
    style: getUnifiedMapLibreStyle(isSatellite ? 'SATELLITE' : 'STREETS'),
    center,
    zoom: 19,
    minZoom: 12,
    maxZoom: 22,
    pitch: 35,
    bearing: -15
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

  map.on('load', () => {
    // 1. Thêm vòng đệm bán kính 2.5m (Spatial Cluster Buffer)
    const circleCoords = createGeoCircle(center, 2.5)
    map.addSource('cluster-buffer-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [circleCoords] },
        properties: {}
      }
    })

    map.addLayer({
      id: 'cluster-buffer-fill',
      type: 'fill',
      source: 'cluster-buffer-source',
      paint: {
        'fill-color': '#C9A227',
        'fill-opacity': 0.25
      }
    })

    map.addLayer({
      id: 'cluster-buffer-outline',
      type: 'line',
      source: 'cluster-buffer-source',
      paint: {
        'line-color': '#C9A227',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    })

    // 2. Thêm Marker điểm lỗi gốc
    const el = document.createElement('div')
    el.className = 'cursor-pointer'
    el.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="background:#C9A227; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.3); margin-bottom:2px; white-space:nowrap; border:1px solid #fff;">
          ${selectedCase.code} (Hồ sơ gốc)
        </div>
        <div style="width:20px; height:20px; background:#DC2626; border:3px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #DC2626;"></div>
      </div>
    `
    new maplibregl.Marker({ element: el })
      .setLngLat(center)
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family:sans-serif; font-size:12px; padding:4px;">
            <strong style="color:#C9A227;">${selectedCase.code}</strong><br/>
            <strong>${selectedCase.defect_title}</strong><br/>
            <span style="color:#64748B;">Lý trình: ${selectedCase.stationing} (${selectedCase.lane})</span><br/>
            <span style="color:#DC2626; font-weight:bold;">Mức độ: ${selectedCase.severity}</span>
          </div>
        `)
      )
      .addTo(map)

    // 3. Thêm Markers cho các phản ánh lân cận nếu có
    selectedCase.cluster_duplicates?.forEach((dup, idx) => {
      const dLng = center[0] + (idx === 0 ? 0.000016 : -0.000018)
      const dLat = center[1] + (idx === 0 ? 0.000012 : -0.000010)
      const dupEl = document.createElement('div')
      dupEl.className = 'cursor-pointer'
      dupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#D97706; color:#fff; font-size:9px; font-weight:bold; padding:1px 5px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.3); margin-bottom:2px; white-space:nowrap; border:1px solid #fff;">
            ${dup.code} (${dup.distance_m}m)
          </div>
          <div style="width:14px; height:14px; background:#F59E0B; border:2px solid #FFFFFF; border-radius:50%;"></div>
        </div>
      `
      new maplibregl.Marker({ element: dupEl })
        .setLngLat([dLng, dLat])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(`
            <div style="font-family:sans-serif; font-size:11px; padding:4px;">
              <strong style="color:#D97706;">${dup.code} (Trùng vị trí)</strong><br/>
              <span>Nguồn: ${dup.source}</span><br/>
              <span>Người gửi: ${dup.reporter}</span><br/>
              <span style="color:#059669; font-weight:bold;">Khoảng cách tới tâm: ${dup.distance_m}m</span>
            </div>
          `)
        )
        .addTo(map)
    })
  })

  return {
    map,
    cleanup: () => map.remove()
  }
}

export const initReviewDrawerMap = (
  container: HTMLDivElement,
  selectedCase: TriageCase
): { map: maplibregl.Map; cleanup: () => void } => {
  const center: [number, number] = [selectedCase.gps.lng, selectedCase.gps.lat]
  const map = new maplibregl.Map({
    container,
    style: getUnifiedMapLibreStyle('SATELLITE'),
    center,
    zoom: 18.5,
    minZoom: 10,
    maxZoom: 22,
    pitch: 30
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

  map.on('load', () => {
    const el = document.createElement('div')
    el.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="width:16px; height:16px; background:#DC2626; border:2px solid #FFFFFF; border-radius:50%; box-shadow:0 0 8px #DC2626;"></div>
      </div>
    `
    new maplibregl.Marker({ element: el }).setLngLat(center).addTo(map)
  })

  return {
    map,
    cleanup: () => map.remove()
  }
}
