import React, { useRef, useEffect, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { fetchProjectGeo, geoErrorMessage, type ProjectGeo } from '../../../api/services/defectGeoService'
import { Icon } from '../../../components/ui/Icon'
import { Defect } from '../../../types/domain'
import { Severity } from '../../../types/enums'

interface DefectGisMapViewerProps {
  defect: Defect
  severity: Severity
  /** Định danh hình học do BE cấp cho khiếm khuyết/phát hiện (nếu có) */
  segmentSetId?: string | null
  segmentId?: string | null
}

export const DefectGisMapViewer: React.FC<DefectGisMapViewerProps> = ({ defect, severity, segmentSetId, segmentId }) => {
  const [mapType, setMapType] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)

  const [geo, setGeo] = useState<{ status: 'loading' | 'ready' | 'empty' | 'error'; data: ProjectGeo | null; error?: string }>({
    status: 'loading',
    data: null
  })

  useEffect(() => {
    let alive = true
    setGeo({ status: 'loading', data: null })
    fetchProjectGeo(defect.project_id, defect.route_version_id, segmentSetId)
      .then((data) => alive && setGeo(data ? { status: 'ready', data } : { status: 'empty', data: null }))
      .catch((err) => alive && setGeo({ status: 'error', data: null, error: geoErrorMessage(err) }))
    return () => {
      alive = false
    }
  }, [defect.project_id, defect.route_version_id, segmentSetId])

  const corridorCoords = geo.data?.corridor
  const segGeo = segmentId ? geo.data?.segments[segmentId] : undefined
  const point = segGeo?.mid
  const lng = point?.[0]
  const lat = point?.[1]

  useEffect(() => {
    if (!mapContainerRef.current || !corridorCoords) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapType === 'SATELLITE' ? 'SATELLITE' : 'STREETS'),
      center: point || corridorCoords[Math.floor(corridorCoords.length / 2)],
      zoom: 17.5,
      minZoom: 11,
      maxZoom: 22,
      pitch: 35
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      map.addSource('highway-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: corridorCoords },
          properties: {}
        }
      })

      map.addLayer({
        id: 'highway-glow',
        type: 'line',
        source: 'highway-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 10,
          'line-opacity': 0.6
        }
      })

      map.addLayer({
        id: 'highway-line',
        type: 'line',
        source: 'highway-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 5
        }
      })

      if (!point) {
        setTimeout(() => map.resize(), 100)
        return
      }
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; background:rgba(239,68,68,0.3); border:2px solid #EF4444; border-radius:50%; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position:relative; width:20px; height:20px; background:#DC2626; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px rgba(220,38,38,0.8);"></div>
        </div>
      `
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(point)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family:sans-serif; font-size:12px; padding:6px; color:#1E293B;">
              <strong style="color:#DC2626; font-size:13px;">${defect.code}</strong><br/>
              <span style="font-weight:600;">${defect.defect_type}</span><br/>
              <span>Lý trình: ${Number.isFinite(defect.chainage_km) ? 'Km ' + defect.chainage_km.toFixed(3).replace('.', '+') : 'Chưa có lý trình từ server'}</span><br/>
              <span style="color:#B45309; font-weight:600;">Mức độ: ${severity}</span><br/>
              <span style="color:#64748B;">Vị trí: tâm phân đoạn #${segGeo?.sequence}</span>
            </div>
          `)
        )
        .addTo(map)

      setTimeout(() => map.resize(), 100)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [corridorCoords, point, segGeo, mapType, severity, defect])

  const kmDisplay =
    Number.isFinite(defect.chainage_km)
      ? defect.chainage_km.toFixed(3).replace('.', '+')
      : String(defect.chainage_km || '')

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="map" size={16} className="text-[#8C6D1F]" />
          <span>Vị Trí Không Gian Trắc Địa (MapLibre WGS84 EPSG:4326)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setMapType('SATELLITE')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                mapType === 'SATELLITE' ? 'bg-white text-brand-dark shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Vệ tinh
            </button>
            <button
              type="button"
              onClick={() => setMapType('VECTOR')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                mapType === 'VECTOR' ? 'bg-white text-brand-dark shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Vector OSM
            </button>
          </div>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video">
        {geo.status === 'ready' ? (
          <>
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-white font-mono text-[11px] border border-white/10 pointer-events-none z-10 shadow-lg">
              <div className="flex items-center gap-1.5 font-bold text-[#C9A227]">
                <Icon name="location_on" size={14} />
                <span>
                  {point && lat !== undefined && lng !== undefined
                    ? `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`
                    : 'Máy chủ chưa cung cấp tọa độ khiếm khuyết'}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Lý trình: Km {kmDisplay} • Tuyến: {defect.project_name || 'Tuyến khảo sát'}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 text-xs px-6 text-center">
            <Icon name="location_off" size={28} />
            <p>
              {geo.status === 'loading'
                ? 'Đang tải hình học tuyến từ máy chủ...'
                : geo.status === 'error'
                ? `Lỗi máy chủ: ${geo.error}`
                : 'Máy chủ chưa cung cấp tọa độ'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
