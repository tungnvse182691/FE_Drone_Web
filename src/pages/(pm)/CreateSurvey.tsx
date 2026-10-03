import React, { useState, useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { mockProjects } from '../../api/mock/data'
import { useNavigate } from 'react-router-dom'
import {
  PlaneTakeoff,
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  BatteryCharging,
  Layers,
  ShieldAlert,
  Info
} from 'lucide-react'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState(mockProjects[0]?.id || '')
  const [startKm, setStartKm] = useState('25.0')
  const [endKm, setEndKm] = useState('30.0')
  const [date, setDate] = useState('2026-10-15')
  const [pilot, setPilot] = useState('Lê Hoàng Long (Drone Operator)')
  const [notes, setNotes] = useState('Khảo sát định kỳ quý IV sau mùa bão lũ. Yêu cầu bay trần 65m, tốc độ chụp 4m/s.')
  const [altitude, setAltitude] = useState('65')
  const [overlap, setOverlap] = useState('80')

  // MapLibre refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Tính toán thông số bay
  const sKm = parseFloat(startKm) || 25.0
  const eKm = parseFloat(endKm) || 30.0
  const flightDistanceKm = Math.max(0.5, Math.abs(eKm - sKm))
  const estimatedDurationMinutes = Math.round(flightDistanceKm * 3.8 + 4)
  const estimatedBatteries = Math.ceil(flightDistanceKm / 2.8)

  // Khởi tạo và cập nhật MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Tọa độ tham chiếu dọc QL1A
    const baseLng = 108.1950
    const baseLat = 16.0500
    const startPoint: [number, number] = [
      baseLng + (sKm - 25.0) * 0.0035,
      baseLat + (sKm - 25.0) * 0.0032
    ]
    const endPoint: [number, number] = [
      baseLng + (eKm - 25.0) * 0.0035,
      baseLat + (eKm - 25.0) * 0.0032
    ]
    const midPoint: [number, number] = [
      (startPoint[0] + endPoint[0]) / 2,
      (startPoint[1] + endPoint[1]) / 2
    ]

    const flightLine: [number, number][] = [
      startPoint,
      [startPoint[0] + (endPoint[0] - startPoint[0]) * 0.35, startPoint[1] + (endPoint[1] - startPoint[1]) * 0.35 + 0.0004],
      [startPoint[0] + (endPoint[0] - startPoint[0]) * 0.70, startPoint[1] + (endPoint[1] - startPoint[1]) * 0.70 - 0.0003],
      endPoint
    ]

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: midPoint,
      zoom: 13.8,
      minZoom: 10,
      maxZoom: 20,
      pitch: 30
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      // Đường hành lang bay
      map.addSource('flight-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: flightLine },
          properties: {}
        }
      })

      map.addLayer({
        id: 'flight-glow',
        type: 'line',
        source: 'flight-path',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#38BDF8',
          'line-width': 8,
          'line-opacity': 0.4
        }
      })

      map.addLayer({
        id: 'flight-core',
        type: 'line',
        source: 'flight-path',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 3,
          'line-dasharray': [2, 1]
        }
      })

      // Marker Điểm xuất phát (Cất cánh)
      const startEl = document.createElement('div')
      startEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#10B981; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid #FFFFFF; box-shadow:0 2px 4px rgba(0,0,0,0.4); margin-bottom:2px;">
            Cất cánh: Km ${sKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#10B981; border:2px solid #FFFFFF; border-radius:50%; box-shadow:0 0 8px #10B981;"></div>
        </div>
      `
      const startMarker = new maplibregl.Marker({ element: startEl })
        .setLngLat(startPoint)
        .addTo(map)
      markersRef.current.push(startMarker)

      // Marker Điểm kết thúc (Hạ cánh)
      const endEl = document.createElement('div')
      endEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#EF4444; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid #FFFFFF; box-shadow:0 2px 4px rgba(0,0,0,0.4); margin-bottom:2px;">
            Hạ cánh: Km ${eKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#EF4444; border:2px solid #FFFFFF; border-radius:50%; box-shadow:0 0 8px #EF4444;"></div>
        </div>
      `
      const endMarker = new maplibregl.Marker({ element: endEl })
        .setLngLat(endPoint)
        .addTo(map)
      markersRef.current.push(endMarker)

      setTimeout(() => map.resize(), 100)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [sKm, eKm])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Đã ban hành thành công kế hoạch bay: Đoạn Km ${startKm} - Km ${endKm} (${flightDistanceKm.toFixed(1)} km) cho phi công ${pilot}!`)
    navigate('/pm/surveys')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pm/surveys')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Tạo Yêu Cầu Bay Khảo Sát Drone</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch hành lang bay trắc địa và chuyển tiếp lệnh bay tới ứng dụng di động của Drone Operator
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Cột Trái (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dự Án / Tuyến Đường Khảo Sát
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
                  >
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Lý Trình Bắt Đầu (Km)"
                    type="number"
                    step="0.1"
                    value={startKm}
                    onChange={(e) => setStartKm(e.target.value)}
                    required
                  />
                  <InputField
                    label="Lý Trình Kết Thúc (Km)"
                    type="number"
                    step="0.1"
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Độ Cao Bay Thiết Kế (m)
                    </label>
                    <select
                      value={altitude}
                      onChange={(e) => setAltitude(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
                    >
                      <option value="50">50m (GSD: 1.1 cm/px — Rất nét)</option>
                      <option value="65">65m (GSD: 1.4 cm/px — Tiêu chuẩn trắc địa)</option>
                      <option value="80">80m (GSD: 1.8 cm/px — Tốc độ cao)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Độ Phủ Chồng Ảnh Trắc Địa
                    </label>
                    <select
                      value={overlap}
                      onChange={(e) => setOverlap(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
                    >
                      <option value="80">80% Dọc / 70% Ngang (Chuẩn AI)</option>
                      <option value="85">85% Dọc / 75% Ngang (Dựng 3D Slab)</option>
                      <option value="75">75% Dọc / 65% Ngang (Bay nhanh)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Ngày Bay Dự Kiến"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <InputField
                    label="Chỉ Định Phi Công (Drone Operator)"
                    value={pilot}
                    onChange={(e) => setPilot(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ghi Chú Kỹ Thuật & Yêu Cầu An Toàn
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => navigate('/pm/surveys')}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" icon={<PlaneTakeoff className="w-4 h-4" />}>
                  Ban Hành Lệnh Bay
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Bản Đồ Cột Phải (5 cols): Live MapLibre Flight Corridor */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <PlaneTakeoff className="w-4 h-4 text-[#C9A227]" />
                  <span>Hành Lang Bay Trắc Địa (MapLibre GIS)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  Google Satellite
                </span>
              </div>

              {/* Map Canvas */}
              <div className="w-full h-72 rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono pointer-events-none z-10 border border-white/10">
                  <span>Km {sKm.toFixed(1)} ➔ Km {eKm.toFixed(1)}</span>
                </div>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C9A227]" />
                    <span>Cự ly bay</span>
                  </div>
                  <div className="font-bold text-brand-dark text-sm mt-0.5">
                    {flightDistanceKm.toFixed(1)} km
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-sky-600" />
                    <span>Thời gian bay</span>
                  </div>
                  <div className="font-bold text-brand-dark text-sm mt-0.5">
                    ~{estimatedDurationMinutes} phút
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-emerald-600" />
                    <span>Chu kỳ pin</span>
                  </div>
                  <div className="font-bold text-brand-dark text-sm mt-0.5">
                    {estimatedBatteries} pack pin
                  </div>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lưu ý vùng bay:</strong> Tuyến bay đã được đăng ký giấy phép số 284/GP-TC. Giới hạn độ cao tối đa 80m AGL, duy trì đường truyền RTK liên tục.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
