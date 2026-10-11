import React, { useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

import { alignmentService } from '../../../api/services/alignmentService'

interface ProjectMapPreviewCardProps {
  project: HubProject
  basePath: string
  onNavigate: (path: string) => void
}

export const ProjectMapPreviewCard: React.FC<ProjectMapPreviewCardProps> = ({
  project,
  basePath,
  onNavigate
}) => {
  const previewMapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapInstanceRef = useRef<maplibregl.Map | null>(null)
  const hasAlignment = project.length_km > 0

  useEffect(() => {
    if (!previewMapContainerRef.current || !hasAlignment) return

    if (previewMapInstanceRef.current) {
      previewMapInstanceRef.current.remove()
      previewMapInstanceRef.current = null
    }

    const alignData = alignmentService.getAlignmentData(project.id)
    const corridorCoords: [number, number][] =
      alignData.coords && alignData.coords.length >= 2
        ? alignData.coords
        : [
            [108.0825, 16.1420],
            [108.1210, 16.1750],
            [108.1651, 16.2052],
            [108.2040, 16.2380],
            [108.2418, 16.2690]
          ]

    const centerPoint = corridorCoords[Math.floor(corridorCoords.length / 2)] || [108.1651, 16.2052]

    const map = new maplibregl.Map({
      container: previewMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: centerPoint,
      zoom: 11,
      minZoom: 6,
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
        paint: {
          'line-color': '#C9A227',
          'line-width': 8,
          'line-opacity': 0.4,
          'line-blur': 3
        }
      })

      map.addLayer({
        id: 'corridor-core',
        type: 'line',
        source: 'corridor-line',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 3
        }
      })

      if (corridorCoords.length >= 2) {
        const bounds = new maplibregl.LngLatBounds()
        corridorCoords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 30, duration: 800 })
      }
    })

    previewMapInstanceRef.current = map

    return () => {
      map.remove()
      previewMapInstanceRef.current = null
    }
  }, [hasAlignment, project.id])

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-3 font-body">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-headline">
            <Icon name="map" size={20} className="text-brand-gold" />
            <span>Không gian địa lý &amp; Bản đồ</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Hành lang tim tuyến WGS84 EPSG:4326
          </p>
        </div>
      </div>

      {hasAlignment ? (
        <>
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
            <div ref={previewMapContainerRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded text-[10px] font-mono">
              GPS: WGS84 • UTM 48N
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-brand-gold hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>Mở bản đồ GIS chi tiết</span>
            <Icon name="arrow_forward" size={14} />
          </button>
        </>
      ) : (
        <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Icon name="alt_route" size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800">Chưa có hành lang tim tuyến</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Dự án mới cần PM nạp tọa độ GPX hoặc file CAD/KML ở Bước 2 để hiển thị bản đồ số.
          </p>
          <button
            type="button"
            onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
            className="mt-1 px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Icon name="alt_route" size={14} />
            <span>Thiết lập tim tuyến (WF-02)</span>
          </button>
        </div>
      )}
    </div>
  )
}
