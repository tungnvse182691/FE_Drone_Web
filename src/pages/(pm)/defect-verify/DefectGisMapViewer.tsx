import React, { useRef, useEffect, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Icon } from '../../../components/ui/Icon'
import { Defect } from '../../../types/domain'
import { Severity } from '../../../types/enums'

interface DefectGisMapViewerProps {
  defect: Defect
  severity: Severity
}

export const DefectGisMapViewer: React.FC<DefectGisMapViewerProps> = ({ defect, severity }) => {
  const [mapType, setMapType] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const lng = defect.gps_lng || 108.2045
    const lat = defect.gps_lat || 16.0582

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapType === 'SATELLITE' ? 'SATELLITE' : 'STREETS'),
      center: [lng, lat],
      zoom: 18,
      minZoom: 12,
      maxZoom: 22,
      pitch: 35
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      const segmentLine: [number, number][] = [
        [lng - 0.003, lat - 0.002],
        [lng - 0.001, lat - 0.0007],
        [lng, lat],
        [lng + 0.0015, lat + 0.001],
        [lng + 0.003, lat + 0.002]
      ]

      map.addSource('highway-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: segmentLine },
          properties: {}
        }
      })

      map.addLayer({
        id: 'highway-line',
        type: 'line',
        source: 'highway-route',
        paint: {
          'line-color': '#F59E0B',
          'line-width': 4,
          'line-dasharray': [2, 1]
        }
      })

      const el = document.createElement('div')
      el.innerHTML = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:34px; height:34px; background:rgba(239,68,68,0.3); border:2px solid #EF4444; border-radius:50%; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position:relative; width:18px; height:18px; background:#DC2626; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px rgba(220,38,38,0.8);"></div>
        </div>
      `
      new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family:sans-serif; font-size:12px; padding:6px; color:#1E293B;">
              <strong style="color:#DC2626; font-size:13px;">${defect.code}</strong><br/>
              <span style="font-weight:600;">${defect.defect_type}</span><br/>
              <span>Lý trình: Km${defect.chainage_km}</span><br/>
              <span style="color:#B45309; font-weight:600;">Mức độ: ${severity}</span>
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
  }, [defect, mapType, severity])

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
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-mono text-[11px] border border-white/10 pointer-events-none z-10 shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-[#C9A227]">
            <Icon name="location_on" size={14} />
            <span>{defect.gps_lat || 16.0582}° N, {defect.gps_lng || 108.2045}° E</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5">
            Lý trình: Km {defect.chainage_km} • Độ chính xác định vị RTK: ±2.5cm
          </div>
        </div>
      </div>
    </div>
  )
}
