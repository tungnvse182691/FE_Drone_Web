import React, { useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Card } from '../../../components/ui/Card'
import {
  PlaneTakeoff,
  Compass,
  MapPin,
  Clock,
  BatteryCharging,
  ShieldAlert
} from 'lucide-react'

interface FlightCorridorMapProps {
  fullRouteCoords: [number, number][]
  surveySegmentCoords: [number, number][]
  sKm: number
  eKm: number
  flightDistanceKm: number
  estimatedDurationMinutes: number
  estimatedBatteries: number
}

export const FlightCorridorMap: React.FC<FlightCorridorMapProps> = ({
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

      // Layer 1A: NÃ©t má» phÃ¡t sÃ¡ng nháº¹ cho toÃ n tuyáº¿n
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

      // Layer 1B: NÃ©t Ä‘á»©t thá»ƒ hiá»‡n toÃ n bá»™ tim tuyáº¿n cá»§a dá»± Ã¡n
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

      // Layer 2A: HÃ nh lang bay phá»§ mÃ u ná»•i báº­t
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

      // Layer 2B: LÃµi tim Ä‘Æ°á»ng kháº£o sÃ¡t
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

      // Marker Cáº¥t cÃ¡nh
      const startEl = document.createElement('div')
      startEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" class="group">
          <div style="background:#10B981; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            ðŸ›« Cáº¥t cÃ¡nh: Km ${sKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#10B981; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #10B981;"></div>
        </div>
      `
      const startMarker = new maplibregl.Marker({ element: startEl })
        .setLngLat(startPoint)
        .addTo(map)
      markersRef.current.push(startMarker)

      // Marker Háº¡ cÃ¡nh
      const endEl = document.createElement('div')
      endEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" class="group">
          <div style="background:#EF4444; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            ðŸ›¬ Háº¡ cÃ¡nh: Km ${eKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#EF4444; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #EF4444;"></div>
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
  }, [sKm, eKm, fullRouteCoords, surveySegmentCoords])

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <PlaneTakeoff className="w-4 h-4 text-brand-gold" />
            <span>HÃ nh Lang Bay Tráº¯c Äá»‹a (MapLibre GIS)</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Compass className="w-3 h-3 text-brand-gold" />
            <span>Vá»‡ Tinh MapLibre</span>
          </span>
        </div>

        {/* Map Canvas */}
        <div className="w-full h-80 rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Overlay Badge */}
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono pointer-events-none z-10 border border-white/10 shadow-lg flex flex-col gap-0.5">
            <div className="text-brand-gold font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
              Äoáº¡n bay kháº£o sÃ¡t:
            </div>
            <div className="text-white font-bold text-xs">
              Km {sKm.toFixed(1)} âž” Km {eKm.toFixed(1)} ({flightDistanceKm.toFixed(1)} km)
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-1.5 rounded-md text-[9px] pointer-events-none z-10 border border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 bg-slate-400 border border-white/40"></span>
              <span>ToÃ n tuyáº¿n dá»± Ã¡n</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-1.5 bg-brand-gold rounded-xs shadow-xs"></span>
              <span className="text-brand-gold font-bold">Äoáº¡n chá»n bay</span>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-brand-gold" />
              <span>Cá»± ly bay</span>
            </div>
            <div className="font-bold text-brand-dark text-sm mt-0.5">
              {flightDistanceKm.toFixed(1)} km
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" />
              <span>Thá»i gian bay</span>
            </div>
            <div className="font-bold text-brand-dark text-sm mt-0.5">
              ~{estimatedDurationMinutes} phÃºt
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-600" />
              <span>Chu ká»³ pin</span>
            </div>
            <div className="font-bold text-brand-dark text-sm mt-0.5">
              {estimatedBatteries} pack pin
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>LÆ°u Ã½ vÃ¹ng bay:</strong> Tuyáº¿n bay Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ giáº¥y phÃ©p sá»‘ 284/GP-TC. Giá»›i háº¡n Ä‘á»™ cao tá»‘i Ä‘a 120m AGL, duy trÃ¬ Ä‘Æ°á»ng truyá»n RTK liÃªn tá»¥c Ä‘á»ƒ gÃ¡n tá»a Ä‘á»™ centimet cho tá»«ng áº£nh.
          </p>
        </div>
      </div>
    </Card>
  )
}
