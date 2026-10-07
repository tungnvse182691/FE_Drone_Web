import React, { useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Map, ArrowRight } from 'lucide-react'

interface ProjectMapPreviewCardProps {
  projectId: string
  basePath: string
  onNavigate: (path: string) => void
}

export const ProjectMapPreviewCard: React.FC<ProjectMapPreviewCardProps> = ({
  projectId,
  basePath,
  onNavigate
}) => {
  const previewMapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapInstanceRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!previewMapContainerRef.current) return

    if (previewMapInstanceRef.current) {
      previewMapInstanceRef.current.remove()
      previewMapInstanceRef.current = null
    }

    const corridorCoords: [number, number][] = [
      [108.0825, 16.1420],
      [108.1210, 16.1750],
      [108.1651, 16.2052],
      [108.2040, 16.2380],
      [108.2418, 16.2690]
    ]

    const map = new maplibregl.Map({
      container: previewMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: [108.1651, 16.2052],
      zoom: 10.8,
      minZoom: 8,
      maxZoom: 18,
      pitch: 28
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      map.addSource('corridor-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: corridorCoords },
          properties: {}
        }
      })

      map.addLayer({
        id: 'corridor-glow',
        type: 'line',
        source: 'corridor-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 4,
          'line-opacity': 0.95
        }
      })

      const segmentMarkers = [
        { code: 'SEG-01', coords: [108.0825, 16.1420] as [number, number] },
        { code: 'SEG-02', coords: [108.1210, 16.1750] as [number, number] },
        { code: 'SEG-03', coords: [108.1651, 16.2052] as [number, number] },
        { code: 'SEG-04', coords: [108.2040, 16.2380] as [number, number] },
        { code: 'SEG-05', coords: [108.2418, 16.2690] as [number, number] }
      ]

      segmentMarkers.forEach((seg) => {
        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <div style="background:#1E293B; color:#C9A227; font-size:9px; font-weight:bold; font-family:monospace; padding:2px 5px; border-radius:4px; border:1px solid #C9A227; box-shadow:0 2px 5px rgba(0,0,0,0.6); white-space:nowrap; transform:translateY(-4px);">
            ${seg.code}
          </div>
        `
        el.onclick = () => {
          onNavigate(`${basePath}/projects/${projectId}/alignment`)
        }
        new maplibregl.Marker({ element: el })
          .setLngLat(seg.coords)
          .addTo(map)
      })

      setTimeout(() => map.resize(), 100)
    })

    previewMapInstanceRef.current = map

    return () => {
      if (previewMapInstanceRef.current) {
        previewMapInstanceRef.current.remove()
        previewMapInstanceRef.current = null
      }
    }
  }, [projectId, basePath, onNavigate])

  return (
    <div className="bg-white border border-brand-border rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
          <Map className="w-4 h-4 text-brand-gold" />
          <span>Hành lang lý trình tuyến</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">WGS84 EPSG:4326</span>
      </div>

      {/* GIS Map Box (Real MapLibre Map) */}
      <div className="w-full h-48 rounded-xl relative overflow-hidden shadow-xs border border-slate-200">
        <div ref={previewMapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-mono flex items-center justify-between gap-2 pointer-events-none z-10 border border-white/10">
          <span>Km 1024+000 ➔ Km 1045+500</span>
          <span className="text-[#ebe695] font-bold">5 Phân đoạn</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
        <span>Tọa độ trung tâm: 16.205°N, 108.165°E</span>
        <button
          onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
          className="text-[#8F7212] font-semibold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Mở bản đồ lớp tim tuyến (WF-02)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
