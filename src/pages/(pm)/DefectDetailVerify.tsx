import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects } from '../../api/mock/data'
import { DefectStatus, Severity } from '../../types/enums'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  SplitSquareHorizontal,
  Layers,
  Ruler,
  MapPin,
  Map as MapIcon,
  Globe,
  Navigation,
  Layers3
} from 'lucide-react'

export const DefectDetailVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Tìm defect theo param hoặc mặc định lấy phần tử đầu
  const defect = mockDefects.find((d) => d.id === id) || mockDefects[0]

  // Tab chuyển đổi: 'SINGLE' (Màn 08 - Thẩm định Bounding box), 'TEMPORAL' (Màn 09 - So sánh đa kỳ) hoặc 'GIS_MAP'
  const [viewMode, setViewMode] = useState<'SINGLE' | 'TEMPORAL' | 'GIS_MAP'>('SINGLE')
  const [severity, setSeverity] = useState<Severity>(defect.severity)
  const [status, setStatus] = useState<DefectStatus>(defect.status)
  const [notes, setNotes] = useState('Đã đối chiếu với kích thước thước đo thực tế')
  const [mapType, setMapType] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (viewMode !== 'GIS_MAP' || !mapContainerRef.current) return

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
      // Tuyến đường hành lang
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

      // Marker tâm lỗi hư hỏng
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
  }, [viewMode, defect, mapType, severity])

  const handleVerify = (newStatus: DefectStatus) => {
    setStatus(newStatus)
    defect.status = newStatus
    defect.severity = severity
    alert(`Đã cập nhật trạng thái lỗi thành: ${newStatus}`)
    navigate('/pm/ai-inbox')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pm/ai-inbox')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
                Thẩm Định Chi Tiết Hư Hỏng: {defect.code}
              </h1>
              <StatusBadge status={defect.status} />
              <StatusBadge status={severity} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lý trình: Km{defect.chainage_km} • Tọa độ GPS: ({defect.gps_lat}, {defect.gps_lng})
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Verify A vs Verify B vs GIS Map */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('SINGLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'SINGLE'
                ? 'bg-white text-brand-dark shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Màn 08: Đơn Kỳ (Bounding Box)
          </button>
          <button
            onClick={() => setViewMode('TEMPORAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'TEMPORAL'
                ? 'bg-white text-brand-goldDark shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
            Màn 09: Đa Kỳ (Trước/Sau)
          </button>
          <button
            onClick={() => setViewMode('GIS_MAP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'GIS_MAP'
                ? 'bg-[#C9A227] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Bản Đồ GIS (MapLibre)
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Photo Viewer / GIS Map, Right is Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns on Desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {viewMode === 'GIS_MAP' ? (
              /* GIS Map View */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-[#C9A227]" />
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
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{defect.gps_lat || 16.0582}° N, {defect.gps_lng || 108.2045}° E</span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      Lý trình: Km {defect.chainage_km} • Độ chính xác định vị RTK: ±2.5cm
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === 'SINGLE' ? (
              /* Single View with Bounding Box Overlay */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Ảnh Chụp Drone (RGB / Hồng Ngoại Độ Phân Giải Cao)</span>
                  <span className="text-brand-goldDark font-bold">
                    Khung phát hiện AI (Confidence: {(defect.confidence_score * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                  <img
                    src={defect.image_url}
                    alt={defect.code}
                    className="w-full h-full object-cover"
                  />
                  {/* Simulated Bounding Box */}
                  <div
                    className="absolute border-2 border-brand-gold bg-brand-gold/15 rounded-sm pointer-events-none flex flex-col justify-between p-1"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`,
                    }}
                  >
                    <span className="bg-brand-gold text-white text-[10px] font-bold px-1 py-0.5 rounded w-max">
                      {defect.defect_type} ({(defect.confidence_score * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Temporal Multi-Epoch Comparison (Verify B) */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>So Sánh Đa Kỳ: Kỳ Trước vs Kỳ Hiện Tại</span>
                  <span className="text-rose-600 font-bold">Tốc độ mở rộng vết nứt: +18%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">Kỳ Khảo Sát Trước (Tháng 06/2026)</span>
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                      <img
                        src={defect.previous_epoch_image_url || defect.image_url}
                        alt="Kỳ trước"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-brand-goldDark">Kỳ Khảo Sát Này (Tháng 10/2026)</span>
                    <div className="rounded-lg overflow-hidden border-2 border-brand-gold aspect-video bg-black">
                      <img
                        src={defect.image_url}
                        alt="Kỳ này"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Verification Form */}
        <div className="space-y-4">
          <Card title="Xác Minh & Thẩm Định Hư Hỏng">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mức Độ Nghiêm Trọng (Severity)
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
                >
                  <option value={Severity.CRITICAL}>CRITICAL — Đặc biệt khẩn cấp</option>
                  <option value={Severity.HIGH}>HIGH — Nghiêm trọng</option>
                  <option value={Severity.MEDIUM}>MEDIUM — Trung bình</option>
                  <option value={Severity.LOW}>LOW — Nhẹ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Chiều dài ước lượng:</span>
                  <div className="font-bold text-sm text-brand-dark">{defect.length_m || 1.2} mét</div>
                </div>
                <div>
                  <span className="text-slate-500">Chiều rộng ước lượng:</span>
                  <div className="font-bold text-sm text-brand-dark">{defect.width_m || 0.8} mét</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ý Kiến Thẩm Định Của PM
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Ghi chú đánh giá hư hỏng..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Button
                  onClick={() => handleVerify(DefectStatus.VERIFIED)}
                  className="w-full"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Xác Nhận Hư Hỏng Thực Tế (VERIFIED)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(DefectStatus.REJECTED)}
                  className="w-full text-brand-error border-rose-200 hover:bg-rose-50"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Từ Chối / Báo Giả (REJECTED)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
