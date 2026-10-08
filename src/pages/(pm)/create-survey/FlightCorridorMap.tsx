import React, { useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { ProjectRouteConfig } from './types'

interface FlightCorridorMapProps {
  currentProject?: ProjectRouteConfig
  fullRouteCoords: [number, number][]
  surveySegmentCoords: [number, number][]
  sKm: number
  eKm: number
  flightDistanceKm: number
  estimatedDurationMinutes: number
  estimatedBatteries: number
}

export const FlightCorridorMap: React.FC<FlightCorridorMapProps> = ({
  currentProject,
  fullRouteCoords,
  surveySegmentCoords,
  sKm,
  eKm,
  flightDistanceKm,
  estimatedDurationMinutes,
  estimatedBatteries
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const midCoord = surveySegmentCoords[Math.floor(surveySegmentCoords.length / 2)] || fullRouteCoords[0]

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: midCoord,
      zoom: 12.8,
      minZoom: 9,
      maxZoom: 20,
      pitch: 32
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      // Full Route Source
      map.addSource('full-route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: fullRouteCoords },
          properties: {}
        }
      })

      // Layer 1A: Nét mờ phát sáng cho toàn tuyến
      map.addLayer({
        id: 'full-route-glow',
        type: 'line',
        source: 'full-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#64748B',
          'line-width': 6,
          'line-opacity': 0.35
        }
      })

      // Layer 1B: Nét đứt tim tuyến dự án
      map.addLayer({
        id: 'full-route-core',
        type: 'line',
        source: 'full-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#CBD5E1',
          'line-width': 2.5,
          'line-dasharray': [3, 2]
        }
      })

      // Survey Segment Source
      map.addSource('survey-segment-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: surveySegmentCoords },
          properties: {}
        }
      })

      // Layer 2A: Hành lang bay phủ màu
      map.addLayer({
        id: 'survey-segment-glow',
        type: 'line',
        source: 'survey-segment-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0284C7',
          'line-width': 18,
          'line-opacity': 0.45
        }
      })

      // Layer 2B: Lõi tim đường khảo sát
      map.addLayer({
        id: 'survey-segment-core',
        type: 'line',
        source: 'survey-segment-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 4.5
        }
      })

      // Markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const startPoint = surveySegmentCoords[0]
      const endPoint = surveySegmentCoords[surveySegmentCoords.length - 1]

      // Marker Cất cánh
      const startEl = document.createElement('div')
      startEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" class="group">
          <div style="background:#2F9E44; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            Cất cánh: Km ${sKm.toFixed(currentProject?.type === 'BRANCH' ? 2 : 1)}
          </div>
          <div style="width:14px; height:14px; background:#2F9E44; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #2F9E44;"></div>
        </div>
      `
      const startMarker = new maplibregl.Marker({ element: startEl })
        .setLngLat(startPoint)
        .addTo(map)
      markersRef.current.push(startMarker)

      // Marker Hạ cánh
      const endEl = document.createElement('div')
      endEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" class="group">
          <div style="background:#E5484D; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            Hạ cánh: Km ${eKm.toFixed(currentProject?.type === 'BRANCH' ? 2 : 1)}
          </div>
          <div style="width:14px; height:14px; background:#E5484D; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #E5484D;"></div>
        </div>
      `
      const endMarker = new maplibregl.Marker({ element: endEl })
        .setLngLat(endPoint)
        .addTo(map)
      markersRef.current.push(endMarker)

      // Fit bounds
      const bounds = new maplibregl.LngLatBounds()
      surveySegmentCoords.forEach((c) => bounds.extend(c))
      map.fitBounds(bounds, { padding: 60, speed: 1.2 })

      setTimeout(() => map.resize(), 100)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [sKm, eKm, fullRouteCoords, surveySegmentCoords, currentProject])

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A1D20] flex items-center gap-1.5">
            <Icon name="flight_takeoff" size={16} className="text-[#C9A227]" />
            <span>Hành Lang Bay Trắc Dọc (MapLibre GIS)</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Icon name="satellite_alt" size={12} className="text-[#C9A227]" />
            <span>Vệ Tinh MapLibre</span>
          </span>
        </div>

        {/* Map Canvas */}
        <div className="w-full h-80 rounded-xl overflow-hidden relative shadow-inner border border-[#E2E5E9]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Overlay Badge - Chi tiết tuyến cha / tuyến con */}
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono pointer-events-none z-10 border border-white/10 shadow-lg flex flex-col gap-0.5 max-w-[280px]">
            <div className="text-[#C9A227] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
              <span>{currentProject?.type === 'BRANCH' ? 'Tuyến Phụ Khảo Sát:' : 'Tuyến Chính Khảo Sát:'}</span>
            </div>
            {currentProject?.type === 'BRANCH' && (
              <div className="text-[10px] text-amber-300 font-sans truncate">
                Dự án mẹ: {currentProject.parentProjectName}
              </div>
            )}
            <div className="text-white font-bold text-xs truncate">
              Km {sKm.toFixed(currentProject?.type === 'BRANCH' ? 2 : 1)} → Km {eKm.toFixed(currentProject?.type === 'BRANCH' ? 2 : 1)} ({flightDistanceKm.toFixed(1)} km)
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-1.5 rounded-md text-[9px] pointer-events-none z-10 border border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 bg-slate-400 border border-white/40"></span>
              <span>{currentProject?.type === 'BRANCH' ? 'Toàn tuyến nhánh' : 'Toàn tuyến dự án'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-1.5 bg-[#C9A227] rounded-xs shadow-xs"></span>
              <span className="text-[#C9A227] font-bold">Đoạn chọn bay</span>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Icon name="place" size={13} className="text-[#C9A227]" />
              <span>Cự ly bay</span>
            </div>
            <div className="font-bold text-[#1A1D20] text-sm mt-0.5">
              {flightDistanceKm.toFixed(1)} km
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Icon name="schedule" size={13} className="text-sky-600" />
              <span>Thời gian bay</span>
            </div>
            <div className="font-bold text-[#1A1D20] text-sm mt-0.5">
              ~{estimatedDurationMinutes} phút
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Icon name="battery_charging_full" size={13} className="text-[#2F9E44]" />
              <span>Chu kỳ pin</span>
            </div>
            <div className="font-bold text-[#1A1D20] text-sm mt-0.5">
              {estimatedBatteries} pack pin
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#FEF3E2] rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
          <Icon name="warning" size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p>
            <strong>Lưu ý vùng bay:</strong> Tuyến bay đã được đăng ký giấy phép số 284/GP-TC. Giới hạn độ cao tối đa 120m AGL, duy trì đường truyền RTK liên tục để gán tọa độ centimet cho từng ảnh.
          </p>
        </div>
      </div>
    </Card>
  )
}
