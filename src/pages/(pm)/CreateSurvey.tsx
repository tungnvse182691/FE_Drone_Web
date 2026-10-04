import React, { useState, useRef, useEffect, useMemo } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
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
  Info,
  Sliders,
  HelpCircle,
  Eye,
  Camera,
  Compass
} from 'lucide-react'
import { surveyService } from '../../api/services'

// Cấu hình tọa độ hình học của các tuyến đường do PM phụ trách
interface ProjectRouteConfig {
  id: string
  code: string
  name: string
  startKm: number
  endKm: number
  defaultCoords: [number, number][]
  defaultKmPoints: number[]
}

const SURVEY_PROJECTS: ProjectRouteConfig[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    startKm: 1020.0,
    endKm: 1045.0,
    defaultCoords: [
      [108.0825, 16.2731], // P0 - Km 1020+000
      [108.1054, 16.2589], // P1 - Km 1022+500
      [108.1287, 16.2415], // P2 - Km 1025+000
      [108.1492, 16.2238], // P3 - Km 1027+500
      [108.1695, 16.2085], // P4 - Km 1030+000
      [108.1884, 16.1843], // P5 - Km 1035+000
      [108.2152, 16.1521], // P6 - Km 1040+000
      [108.2418, 16.1215]  // P7 - Km 1045+000
    ],
    defaultKmPoints: [1020, 1022.5, 1025, 1027.5, 1030, 1035, 1040, 1045]
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan (Km 0 - Km 66)',
    startKm: 0.0,
    endKm: 66.0,
    defaultCoords: [
      [107.6521, 16.2912],
      [107.7214, 16.2105],
      [107.8102, 16.1423],
      [107.9056, 16.0821],
      [108.0124, 16.0354],
      [108.1189, 15.9876]
    ],
    defaultKmPoints: [0, 15, 30, 45, 55, 66]
  }
]

// Danh sách phi công khả dụng trong dự án
const AVAILABLE_PILOTS = [
  {
    id: 'pilot-01',
    name: 'Lê Hoàng Long',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 01',
    phone: '0988.123.456',
    license: 'Cục Tác Chiến #TC-UAV-2024-089',
    device: 'DJI Matrice 350 RTK + Zenmuse P1'
  },
  {
    id: 'pilot-02',
    name: 'Trần Quang Khải',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 02',
    phone: '0972.555.888',
    license: 'Cục Tác Chiến #TC-UAV-2025-112',
    device: 'DJI Mavic 3 Enterprise RTK'
  },
  {
    id: 'pilot-03',
    name: 'Nguyễn Thành Đạt',
    roleLabel: 'Drone Pilot — Chuyên gia bay địa hình & SfM',
    phone: '0915.777.999',
    license: 'Cục Tác Chiến #TC-UAV-2025-240',
    device: 'DJI Matrice 300 RTK + Zenmuse H20T'
  },
  {
    id: 'pilot-04',
    name: 'Phạm Minh Tuấn',
    roleLabel: 'Drone Pilot — Đội bay dự phòng khẩn cấp',
    phone: '0903.444.222',
    license: 'Cục Tác Chiến #TC-UAV-2026-031',
    device: 'DJI Phantom 4 RTK'
  }
]

// Hàm nội suy tọa độ GPS theo lý trình Km
function interpolateCoordAtKm(
  km: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number] {
  if (km <= kmPoints[0]) return coords[0]
  if (km >= kmPoints[kmPoints.length - 1]) return coords[coords.length - 1]

  for (let i = 0; i < kmPoints.length - 1; i++) {
    if (km >= kmPoints[i] && km <= kmPoints[i + 1]) {
      const span = kmPoints[i + 1] - kmPoints[i]
      if (span === 0) return coords[i]
      const t = (km - kmPoints[i]) / span
      const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
      const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
      return [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
    }
  }
  return coords[coords.length - 1]
}

// Trích xuất đoạn polyline giữa 2 mốc lý trình
function getSubLineCoordinates(
  startKm: number,
  endKm: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number][] {
  if (!coords || coords.length < 2) return coords || []
  const [minKm, maxKm] = startKm <= endKm ? [startKm, endKm] : [endKm, startKm]
  const result: [number, number][] = []

  result.push(interpolateCoordAtKm(minKm, coords, kmPoints))
  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > minKm && kmPoints[i] < maxKm) {
      result.push(coords[i])
    }
  }
  result.push(interpolateCoordAtKm(maxKm, coords, kmPoints))

  if (result.length < 2) return coords.slice(0, 2)
  return result
}

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()

  // State dự án và lý trình
  const [projectId, setProjectId] = useState<string>(SURVEY_PROJECTS[0].id)
  const currentProject = useMemo(() => {
    return SURVEY_PROJECTS.find((p) => p.id === projectId) || SURVEY_PROJECTS[0]
  }, [projectId])

  const [startKm, setStartKm] = useState<string>('1020.0')
  const [endKm, setEndKm] = useState<string>('1025.0')
  const [date, setDate] = useState<string>('2026-10-15')

  // Phi công chỉ định (Dropdown)
  const [pilotId, setPilotId] = useState<string>(AVAILABLE_PILOTS[0].id)

  // Độ cao bay thiết kế (Hỗ trợ Preset + Tự nhập Custom)
  const [altitudeMode, setAltitudeMode] = useState<'preset' | 'custom'>('preset')
  const [presetAltitude, setPresetAltitude] = useState<string>('65')
  const [customAltitude, setCustomAltitude] = useState<string>('65')

  // Độ phủ chồng ảnh
  const [overlap, setOverlap] = useState<string>('80')
  const [showOverlapHelp, setShowOverlapHelp] = useState<boolean>(false)

  // Ghi chú
  const [notes, setNotes] = useState<string>('Khảo sát định kỳ quý IV sau mùa bão lũ. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.')

  // MapLibre refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Chuyển đổi dự án
  const handleProjectChange = (newPrjId: string) => {
    setProjectId(newPrjId)
    const targetPrj = SURVEY_PROJECTS.find((p) => p.id === newPrjId) || SURVEY_PROJECTS[0]
    setStartKm(targetPrj.startKm.toFixed(1))
    setEndKm(Math.min(targetPrj.startKm + 5.0, targetPrj.endKm).toFixed(1))
  }

  // Độ cao thực tế đang chọn
  const actualAltitude = altitudeMode === 'custom' ? parseFloat(customAltitude) || 65 : parseFloat(presetAltitude) || 65
  const gsdCmPx = (actualAltitude * 0.0215).toFixed(1)

  // Tính toán thông số bay
  const sKm = parseFloat(startKm) || currentProject.startKm
  const eKm = parseFloat(endKm) || Math.min(currentProject.startKm + 5.0, currentProject.endKm)
  const flightDistanceKm = Math.max(0.2, Math.abs(eKm - sKm))
  const estimatedDurationMinutes = Math.round(flightDistanceKm * 3.8 + 4)
  const estimatedBatteries = Math.ceil(flightDistanceKm / 2.8)

  // Tọa độ toàn tuyến và đoạn đang chọn bay
  const fullRouteCoords = currentProject.defaultCoords
  const surveySegmentCoords = useMemo(() => {
    return getSubLineCoordinates(sKm, eKm, currentProject.defaultCoords, currentProject.defaultKmPoints)
  }, [sKm, eKm, currentProject])

  // Khởi tạo và cập nhật bản đồ MapLibre
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
      // 1. Thêm nguồn dữ liệu toàn bộ tuyến đường (Full Route)
      map.addSource('full-route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: fullRouteCoords },
          properties: {}
        }
      })

      // Layer 1A: Nét mờ phát sáng nhẹ cho toàn tuyến
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

      // Layer 1B: Nét đứt thể hiện toàn bộ tim tuyến của dự án
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

      // 2. Thêm nguồn dữ liệu đoạn lý trình được PM chọn để bay khảo sát (Survey Selection)
      map.addSource('survey-segment-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: surveySegmentCoords },
          properties: {}
        }
      })

      // Layer 2A: Hành lang bay phủ màu nổi bật (Corridor Margin Glow)
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

      // Layer 2B: Lõi tim đường khảo sát bôi màu vàng đồng thương hiệu Hoàng Hải (#C9A227)
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

      // 3. Markers: Điểm Cất Cánh (Start) và Điểm Hạ Cánh (End)
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const startPoint = surveySegmentCoords[0]
      const endPoint = surveySegmentCoords[surveySegmentCoords.length - 1]

      // Marker Cất cánh
      const startEl = document.createElement('div')
      startEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" class="group">
          <div style="background:#10B981; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            🛫 Cất cánh: Km ${sKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#10B981; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #10B981;"></div>
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
          <div style="background:#EF4444; color:#FFFFFF; font-size:10px; font-weight:bold; padding:2px 7px; border-radius:6px; border:1px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px; white-space:nowrap; font-family:monospace;">
            🛬 Hạ cánh: Km ${eKm.toFixed(1)}
          </div>
          <div style="width:14px; height:14px; background:#EF4444; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 10px #EF4444;"></div>
        </div>
      `
      const endMarker = new maplibregl.Marker({ element: endEl })
        .setLngLat(endPoint)
        .addTo(map)
      markersRef.current.push(endMarker)

      // Tự động căn góc nhìn bao quát toàn bộ đoạn đường bay
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
  }, [sKm, eKm, currentProject, surveySegmentCoords])

  // Submit Lệnh Bay
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPilot = AVAILABLE_PILOTS.find((p) => p.id === pilotId)

    const newSurvey = surveyService.createSurvey({
      project_id: currentProject.id,
      project_name: currentProject.name,
      start_km: `Km ${sKm.toFixed(1)}`,
      end_km: `Km ${eKm.toFixed(1)}`,
      pilot_name: selectedPilot?.name || 'Lê Hoàng Long',
      drone_model: selectedPilot?.device || 'DJI Matrice 350 RTK',
      notes
    })

    alert(
      `Đã ban hành thành công Lệnh Bay Khảo Sát [${newSurvey.code}]!\n` +
      `• Dự án: [${currentProject.code}] ${currentProject.name}\n` +
      `• Đoạn lý trình: Km ${sKm.toFixed(1)} → Km ${eKm.toFixed(1)} (Cự ly: ${flightDistanceKm.toFixed(1)} km)\n` +
      `• Độ cao bay thiết kế: ${actualAltitude}m (GSD: ~${gsdCmPx} cm/px)\n` +
      `• Độ phủ ảnh: ${overlap}% dọc / ${parseInt(overlap) - 10}% ngang\n` +
      `• Phi công được chỉ định: ${selectedPilot?.name} (${selectedPilot?.device})\n` +
      `Hồ sơ đã được lưu trữ và đồng bộ tới danh sách nhiệm vụ bay!`
    )
    navigate(`/pm/surveys?highlightCode=${encodeURIComponent(newSurvey.code)}`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BREADCRUMB */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pm/surveys')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors"
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
        {/* FORM CỘT TRÁI (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {/* 1. DỰ ÁN KHẢO SÁT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dự Án / Tuyến Đường Khảo Sát
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
                  >
                    {SURVEY_PROJECTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. LÝ TRÌNH BẮT ĐẦU & KẾT THÚC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Lý Trình Bắt Đầu (Km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={currentProject.startKm}
                      max={currentProject.endKm}
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-800 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Giới hạn tuyến: Km {currentProject.startKm}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Lý Trình Kết Thúc (Km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={currentProject.startKm}
                      max={currentProject.endKm}
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-800 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Đến tối đa: Km {currentProject.endKm}
                    </span>
                  </div>
                </div>

                {/* 3. ĐỘ CAO BAY THIẾT KẾ (PRESET + TỰ CHỌN CUSTOM) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Độ Cao Bay Thiết Kế (m)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAltitudeMode('preset')}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          altitudeMode === 'preset' ? 'bg-[#C9A227] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tiêu chuẩn
                      </button>
                      <button
                        type="button"
                        onClick={() => setAltitudeMode('custom')}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          altitudeMode === 'custom' ? 'bg-[#C9A227] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tùy chỉnh (Tự nhập)
                      </button>
                    </div>
                  </div>

                  {altitudeMode === 'preset' ? (
                    <select
                      value={presetAltitude}
                      onChange={(e) => setPresetAltitude(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
                    >
                      <option value="50">50m (GSD: 1.1 cm/px — Siêu nét, phát hiện nứt tóc vi mô)</option>
                      <option value="65">65m (GSD: 1.4 cm/px — Tiêu chuẩn trắc địa TCVN)</option>
                      <option value="80">80m (GSD: 1.8 cm/px — Tốc độ cao, tối ưu pin)</option>
                      <option value="100">100m (GSD: 2.2 cm/px — Khảo sát tổng quan nền đường)</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="30"
                          max="120"
                          step="1"
                          value={customAltitude}
                          onChange={(e) => setCustomAltitude(e.target.value)}
                          placeholder="Nhập độ cao (30 - 120m)..."
                          className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold pr-10"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mét</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-xs font-mono text-[#8F7212] whitespace-nowrap">
                        Độ phân giải GSD: <strong>~{gsdCmPx} cm/px</strong>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Trần bay quy định Cục Hàng Không / Cục Tác Chiến: Tối đa 120m AGL. Độ cao càng thấp thì ảnh càng nét nhưng thời gian bay tăng.
                  </p>
                </div>

                {/* 4. ĐỘ PHỦ CHỒNG ẢNH & GIẢI THÍCH KỸ THUẬT */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Độ Phủ Chồng Ảnh Trắc Địa (Image Overlap)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOverlapHelp(!showOverlapHelp)}
                      className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showOverlapHelp ? 'Thu gọn' : 'Độ phủ chồng ảnh là gì?'}</span>
                    </button>
                  </div>

                  <select
                    value={overlap}
                    onChange={(e) => setOverlap(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
                  >
                    <option value="80">80% Dọc / 70% Ngang (Khuyên dùng cho AI phát hiện vết nứt)</option>
                    <option value="85">85% Dọc / 75% Ngang (Dựng mô hình 3D đám mây điểm tấm Slab)</option>
                    <option value="75">75% Dọc / 65% Ngang (Bay nhanh tiết kiệm pin cho đường thẳng)</option>
                  </select>

                  {/* Hộp giải thích kỹ thuật độ phủ ảnh */}
                  {showOverlapHelp && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1.5 animate-in fade-in duration-200">
                      <div className="font-bold text-[#8F7212] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#C9A227]" />
                        <span>Nguyên lý trắc địa ảnh UAV & Bóc tách hư hỏng AI:</span>
                      </div>
                      <p>
                        • <strong>Độ phủ dọc (Forward Lap):</strong> Tỷ lệ phần trăm bức ảnh chụp sau đè lên bức ảnh chụp trước theo chiều tiến của drone (ví dụ 80%).
                      </p>
                      <p>
                        • <strong>Độ phủ ngang (Side Lap):</strong> Tỷ lệ phần trăm diện tích đè lên nhau giữa hai đường bay song song (ví dụ 70%).
                      </p>
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-amber-100">
                        ⚡ <strong>Tại sao AI bắt buộc cần 80%/70%?</strong> Thuật toán SfM (Structure from Motion) cần mỗi điểm trên mặt đường xuất hiện ở ít nhất 4–5 góc nhìn khác nhau để ghép thành một tấm ảnh trực giao (Orthomosaic) không méo góc, giúp AI nhận dạng vết nứt chân chim 1mm mà không bị mù điểm ảnh.
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. NGÀY BAY DỰ KIẾN & CHỈ ĐỊNH PHI CÔNG (DROPDOWN LIST) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Ngày Bay Dự Kiến"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chỉ Định Phi Công (Drone Operator)
                    </label>
                    <select
                      value={pilotId}
                      onChange={(e) => setPilotId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
                    >
                      {AVAILABLE_PILOTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.roleLabel})
                        </option>
                      ))}
                    </select>
                    {/* Badge thiết bị của phi công */}
                    {(() => {
                      const curPilot = AVAILABLE_PILOTS.find((p) => p.id === pilotId)
                      return curPilot ? (
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Thiết bị: <strong className="text-slate-700">{curPilot.device}</strong> • {curPilot.license}
                        </span>
                      ) : null
                    })()}
                  </div>
                </div>

                {/* 6. GHI CHÚ KỸ THUẬT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ghi Chú Kỹ Thuật & Yêu Cầu An Toàn
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện cao thế..."
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => navigate('/pm/surveys')}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" icon={<PlaneTakeoff className="w-4 h-4" />}>
                  Ban Hành Lệnh Bay Khảo Sát
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* BẢN ĐỒ CỘT PHẢI (5 cols): LIVE MAPLIBRE GIS VỚI ĐƯỜNG TUYẾN & ĐOẠN BÔI MÀU */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <PlaneTakeoff className="w-4 h-4 text-[#C9A227]" />
                  <span>Hành Lang Bay Trắc Địa (MapLibre GIS)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#C9A227]" />
                  <span>Vệ Tinh MapLibre</span>
                </span>
              </div>

              {/* Map Canvas */}
              <div className="w-full h-80 rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Overlay Badge: Lý trình đang chọn bay */}
                <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono pointer-events-none z-10 border border-white/10 shadow-lg flex flex-col gap-0.5">
                  <div className="text-[#C9A227] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
                    Đoạn bay khảo sát:
                  </div>
                  <div className="text-white font-bold text-xs">
                    Km {sKm.toFixed(1)} ➔ Km {eKm.toFixed(1)} ({flightDistanceKm.toFixed(1)} km)
                  </div>
                </div>

                {/* Chú giải lớp bản đồ (Map Legend) */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-1.5 rounded-md text-[9px] pointer-events-none z-10 border border-white/10 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-slate-400 border border-white/40"></span>
                    <span>Toàn tuyến dự án</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-1.5 bg-[#C9A227] rounded-xs shadow-xs"></span>
                    <span className="text-[#C9A227] font-bold">Đoạn chọn bay</span>
                  </div>
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

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Lưu ý vùng bay:</strong> Tuyến bay đã được đăng ký giấy phép số 284/GP-TC. Giới hạn độ cao tối đa 120m AGL, duy trì đường truyền RTK liên tục để gán tọa độ centimet cho từng ảnh.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
