import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { CheckCircle2, X } from 'lucide-react'

import { AIDetectionItem } from './drone-review/types'
import { INITIAL_DETECTIONS } from './drone-review/mockData'
import { MissionHeader } from './drone-review/MissionHeader'
import { MissionViewer } from './drone-review/MissionViewer'
import { MissionTriageList } from './drone-review/MissionTriageList'
import { MissionModals } from './drone-review/MissionModals'

export const DroneMissionAIReview: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Trạng thái bật/tắt lớp AI Bounding Box trên Canvas
  const [isAiOverlayVisible, setIsAiOverlayVisible] = useState<boolean>(true)

  // Trạng thái phát lại video/timeline bay (Play/Pause)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrame, setCurrentFrame] = useState<number>(1420)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const totalFrames = 1920

  // Trạng thái toàn màn hình canvas
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false)

  // Bộ lọc phân đoạn phát hiện AI
  const [kmFilter, setKmFilter] = useState<'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030'>('ALL')

  // Mục phát hiện AI đang được chọn
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>('DET-01')

  // Trạng thái tỷ lệ phủ hình ảnh (Ban đầu 87% cảnh báo, sau khi bay bù -> 98% đạt)
  const [coveragePercentage, setCoveragePercentage] = useState<number>(87)
  const [hasBlindspot, setHasBlindspot] = useState<boolean>(true)

  // Modal yêu cầu bay bổ sung
  const [isReFlightModalOpen, setIsReFlightModalOpen] = useState<boolean>(false)
  const [pilotNote, setPilotNote] = useState<string>('Bay quét bù dải phân cách giữa tại lý trình Km 1027+100 bằng góc nghiêng 45° Oblique.')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Danh sách phát hiện AI từ chuyến bay quét
  const [detections, setDetections] = useState<AIDetectionItem[]>(INITIAL_DETECTIONS)

  // Thống kê tiến độ rà soát (Triage Audit Metrics)
  const totalCount = detections.length
  const approvedCount = detections.filter((d) => d.status === 'APPROVED').length
  const rejectedCount = detections.filter((d) => d.status === 'REJECTED').length
  const pendingCount = detections.filter((d) => d.status === 'PENDING').length
  const reviewedCount = approvedCount + rejectedCount
  const reviewProgressPercent = Math.round((reviewedCount / totalCount) * 100)

  // Chế độ hiển thị: Không ảnh trắc địa ('ORTHO') hoặc Bản đồ bay GIS ('GIS_MAP')
  const [viewerMode, setViewerMode] = useState<'ORTHO' | 'GIS_MAP'>('ORTHO')
  const corridorMapContainerRef = useRef<HTMLDivElement>(null)
  const corridorMapInstanceRef = useRef<maplibregl.Map | null>(null)

  // Trình phát mô phỏng tiến trình frame khi bấm Play
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames) {
            setIsPlaying(false)
            return totalFrames
          }
          return prev + Math.floor(4 * playbackSpeed)
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  // Điều kiện để được khóa Baseline: Độ phủ >= 95% và giải quyết 100% mục phát hiện
  const isBaselineLocked = coveragePercentage >= 95 && pendingCount === 0

  // Chọn mục phát hiện để focus
  const handleSelectDetection = (item: AIDetectionItem) => {
    setSelectedDetectionId(item.id)
    showToast(`Đã định vị khung hình ${item.code} tại lý trình ${item.stationing}`)
  }

  // Effect: Khởi tạo MapLibre hiển thị toàn tuyến hành lang bay 6km và 8 điểm khiếm khuyết
  useEffect(() => {
    if (viewerMode !== 'GIS_MAP' || !corridorMapContainerRef.current) return

    if (corridorMapInstanceRef.current) {
      corridorMapInstanceRef.current.remove()
      corridorMapInstanceRef.current = null
    }

    const corridorCoords: [number, number][] = [
      [108.1940, 16.0490],
      [108.1970, 16.0520],
      [108.2000, 16.0545],
      [108.2030, 16.0570],
      [108.2060, 16.0600],
      [108.2090, 16.0630],
      [108.2120, 16.0665]
    ]

    const map = new maplibregl.Map({
      container: corridorMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: [108.2025, 16.0560],
      zoom: 14.5,
      minZoom: 10,
      maxZoom: 20,
      pitch: 35,
      bearing: -20
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      // 1. Thêm tuyến bay Drone Corridor
      map.addSource('corridor-route', {
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
        source: 'corridor-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#000',
          'line-width': 10,
          'line-opacity': 0.6
        }
      })

      map.addLayer({
        id: 'corridor-line',
        type: 'line',
        source: 'corridor-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C9A227',
          'line-width': 5
        }
      })

      // 2. Thêm Markers cho 8 điểm khiếm khuyết
      const markerCoords: [number, number][] = [
        [108.1960, 16.0510],
        [108.1985, 16.0532],
        [108.2010, 16.0551],
        [108.2032, 16.0571],
        [108.2052, 16.0592],
        [108.2072, 16.0612],
        [108.2091, 16.0631],
        [108.2112, 16.0655]
      ]

      detections.forEach((det, idx) => {
        const pt = markerCoords[idx] || [108.2025, 16.0560]
        const isCurrent = det.id === selectedDetectionId
        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="background:${isCurrent ? '#C9A227' : '#1E293B'}; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.4); margin-bottom:2px; white-space:nowrap; border:1px solid #fff;">
              ${det.code || det.id} (${det.stationing})
            </div>
            <div style="width:${isCurrent ? '20px' : '14px'}; height:${isCurrent ? '20px' : '14px'}; background:${det.severityLevel.includes('Khẩn cấp') ? '#DC2626' : det.severityLevel.includes('Nghiêm trọng') ? '#D97706' : '#2563EB'}; border:2px solid #fff; border-radius:50%; box-shadow:${isCurrent ? '0 0 10px #C9A227' : 'none'};"></div>
          </div>
        `
        el.onclick = () => {
          handleSelectDetection(det)
          map.flyTo({ center: pt, zoom: 17, speed: 1.2 })
        }

        new maplibregl.Marker({ element: el })
          .setLngLat(pt)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family:sans-serif; font-size:12px; padding:4px;">
                <strong style="color:#C9A227;">${det.code || det.id} - ${det.type}</strong><br/>
                <span style="color:#64748B;">${det.stationing} (${det.lane})</span><br/>
                <span style="font-weight:bold;">Độ tin cậy AI: ${det.confidence}%</span>
              </div>
            `)
          )
          .addTo(map)
      })
    })

    corridorMapInstanceRef.current = map

    return () => {
      if (corridorMapInstanceRef.current) {
        corridorMapInstanceRef.current.remove()
        corridorMapInstanceRef.current = null
      }
    }
  }, [viewerMode, selectedDetectionId, detections])

  // Duyệt phát hiện AI -> Tạo Defect OPEN
  const handleApproveDetection = (detId: string) => {
    const defectCodeGenerated = `DEF-2026-0${Math.floor(100 + Math.random() * 900)}`
    setDetections((prev) =>
      prev.map((d) =>
        d.id === detId
          ? {
              ...d,
              status: 'APPROVED',
              defectCode: defectCodeGenerated,
              metrics: { ...d.metrics, reviewer: 'KS. Đỗ Quốc Hoàng' }
            }
          : d
      )
    )
    showToast(`Đã phê duyệt ${detId}! Hệ thống đã tự động khởi tạo Hồ sơ khiếm khuyết mã ${defectCodeGenerated}.`)
  }

  // Báo sai (False Positive)
  const handleRejectDetection = (detId: string) => {
    setDetections((prev) =>
      prev.map((d) =>
        d.id === detId
          ? {
              ...d,
              status: 'REJECTED',
              metrics: { ...d.metrics, dismissReason: 'Xác minh thực tế: Nhiễu bóng đổ và phản xạ ánh sáng.' }
            }
          : d
      )
    )
    showToast(`Đã đánh dấu ${detId} là Báo sai (False Positive). Dữ liệu này được gửi ngược về huấn luyện Road-YOLOv9.`)
  }

  // Gửi lệnh bay quét bổ sung
  const handleSubmitReFlight = () => {
    setCoveragePercentage(98)
    setHasBlindspot(false)
    setIsReFlightModalOpen(false)
    showToast('Đã tiếp nhận nhiệm vụ bay bổ sung QL1A-MS-04B! Tỷ lệ độ phủ ảnh đã cập nhật đạt 98% (PASS).')
  }

  // Khóa Baseline tim tuyến
  const handleLockBaseline = () => {
    if (!isBaselineLocked) {
      alert('Chưa đủ điều kiện khóa Baseline: Cần độ phủ ≥ 95% và giải quyết hết các mục chờ rà soát!')
      return
    }
    showToast('Đoạn đường Km 1024 - Km 1030 đã chính thức KHÓA BASELINE THÀNH CÔNG! Bản đồ hoàn công số đã được kích hoạt.')
  }

  const selectedItem = detections.find((d) => d.id === selectedDetectionId) || detections[0]

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Yêu Cầu Bay Bổ Sung */}
      <MissionModals
        isReFlightModalOpen={isReFlightModalOpen}
        setIsReFlightModalOpen={setIsReFlightModalOpen}
        pilotNote={pilotNote}
        setPilotNote={setPilotNote}
        onSubmitReFlight={handleSubmitReFlight}
      />

      {/* Breadcrumb, Topbar, Data Quality Assessment, AI Job Progress */}
      <MissionHeader
        basePath={basePath}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
        coveragePercentage={coveragePercentage}
        hasBlindspot={hasBlindspot}
        isBaselineLocked={isBaselineLocked}
        pendingCount={pendingCount}
        onOpenReFlightModal={() => setIsReFlightModalOpen(true)}
        onLockBaseline={handleLockBaseline}
      />

      {/* Interactive AI Review Workspace (60/40 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (60%): Viewer & Controls */}
        <MissionViewer
          isCanvasFullscreen={isCanvasFullscreen}
          setIsCanvasFullscreen={setIsCanvasFullscreen}
          viewerMode={viewerMode}
          setViewerMode={setViewerMode}
          isAiOverlayVisible={isAiOverlayVisible}
          setIsAiOverlayVisible={setIsAiOverlayVisible}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}
          totalFrames={totalFrames}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          selectedDetectionId={selectedDetectionId}
          onSelectDetection={handleSelectDetection}
          detections={detections}
          selectedItem={selectedItem}
          corridorMapContainerRef={corridorMapContainerRef}
          showToast={showToast}
        />

        {/* Right Column (40%): Triage List */}
        <MissionTriageList
          detections={detections}
          selectedDetectionId={selectedDetectionId}
          onSelectDetection={handleSelectDetection}
          onApproveDetection={handleApproveDetection}
          onRejectDetection={handleRejectDetection}
          kmFilter={kmFilter}
          setKmFilter={setKmFilter}
          totalCount={totalCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          pendingCount={pendingCount}
          reviewedCount={reviewedCount}
          reviewProgressPercent={reviewProgressPercent}
          showToast={showToast}
        />
      </div>
    </div>
  )
}
