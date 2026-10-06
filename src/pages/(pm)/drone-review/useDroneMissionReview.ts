import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { AIDetectionItem } from './types'
import { INITIAL_DETECTIONS } from './mockData'

const CORRIDOR_COORDS: [number, number][] = [
  [108.194, 16.049], [108.197, 16.052], [108.2, 16.0545],
  [108.203, 16.057], [108.206, 16.06], [108.209, 16.063], [108.212, 16.0665]
]

const MARKER_COORDS: [number, number][] = [
  [108.196, 16.051], [108.1985, 16.0532], [108.201, 16.0551], [108.2032, 16.0571],
  [108.2052, 16.0592], [108.2072, 16.0612], [108.2091, 16.0631], [108.2112, 16.0655]
]

export function useDroneMissionReview() {
  const [isAiOverlayVisible, setIsAiOverlayVisible] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrame, setCurrentFrame] = useState<number>(1420)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const totalFrames = 1920

  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false)
  const [kmFilter, setKmFilter] = useState<'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030'>('ALL')
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>('DET-01')

  const [coveragePercentage, setCoveragePercentage] = useState<number>(87)
  const [hasBlindspot, setHasBlindspot] = useState<boolean>(true)

  const [isReFlightModalOpen, setIsReFlightModalOpen] = useState<boolean>(false)
  const [pilotNote, setPilotNote] = useState<string>(
    'Bay quét bù dải phân cách giữa tại lý trình Km 1027+100 bằng góc nghiêng 45° Oblique.'
  )

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  const [detections, setDetections] = useState<AIDetectionItem[]>(INITIAL_DETECTIONS)

  const totalCount = detections.length
  const approvedCount = detections.filter((d) => d.status === 'APPROVED').length
  const rejectedCount = detections.filter((d) => d.status === 'REJECTED').length
  const pendingCount = detections.filter((d) => d.status === 'PENDING').length
  const reviewedCount = approvedCount + rejectedCount
  const reviewProgressPercent = Math.round((reviewedCount / totalCount) * 100)

  const [viewerMode, setViewerMode] = useState<'ORTHO' | 'GIS_MAP'>('ORTHO')
  const corridorMapContainerRef = useRef<HTMLDivElement>(null)
  const corridorMapInstanceRef = useRef<maplibregl.Map | null>(null)

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

  const isBaselineLocked = coveragePercentage >= 95 && pendingCount === 0

  const handleSelectDetection = (item: AIDetectionItem) => {
    setSelectedDetectionId(item.id)
    showToast(`Đã định vị khung hình ${item.code} tại lý trình ${item.stationing}`)
  }

  useEffect(() => {
    if (viewerMode !== 'GIS_MAP' || !corridorMapContainerRef.current) return

    if (corridorMapInstanceRef.current) {
      corridorMapInstanceRef.current.remove()
      corridorMapInstanceRef.current = null
    }

    const map = new maplibregl.Map({
      container: corridorMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: [108.2025, 16.056],
      zoom: 14.5,
      minZoom: 10,
      maxZoom: 20,
      pitch: 35,
      bearing: -20
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      map.addSource('corridor-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: CORRIDOR_COORDS },
          properties: {}
        }
      })

      map.addLayer({
        id: 'corridor-glow',
        type: 'line',
        source: 'corridor-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#000', 'line-width': 10, 'line-opacity': 0.6 }
      })

      map.addLayer({
        id: 'corridor-line',
        type: 'line',
        source: 'corridor-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#C9A227', 'line-width': 5 }
      })

      detections.forEach((det, idx) => {
        const pt = MARKER_COORDS[idx] || [108.2025, 16.056]
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

  const handleSubmitReFlight = () => {
    setCoveragePercentage(98)
    setHasBlindspot(false)
    setIsReFlightModalOpen(false)
    showToast('Đã tiếp nhận nhiệm vụ bay bổ sung QL1A-MS-04B! Tỷ lệ độ phủ ảnh đã cập nhật đạt 98% (PASS).')
  }

  const handleLockBaseline = () => {
    if (!isBaselineLocked) {
      alert('Chưa đủ điều kiện khóa Baseline: Cần độ phủ ≥ 95% và giải quyết hết các mục chờ rà soát!')
      return
    }
    showToast('Đoạn đường Km 1024 - Km 1030 đã chính thức KHÓA BASELINE THÀNH CÔNG! Bản đồ hoàn công số đã được kích hoạt.')
  }

  const selectedItem = detections.find((d) => d.id === selectedDetectionId) || detections[0]

  return {
    isAiOverlayVisible,
    setIsAiOverlayVisible,
    isPlaying,
    setIsPlaying,
    currentFrame,
    setCurrentFrame,
    playbackSpeed,
    setPlaybackSpeed,
    totalFrames,
    isCanvasFullscreen,
    setIsCanvasFullscreen,
    kmFilter,
    setKmFilter,
    selectedDetectionId,
    coveragePercentage,
    hasBlindspot,
    isReFlightModalOpen,
    setIsReFlightModalOpen,
    pilotNote,
    setPilotNote,
    toastMessage,
    setToastMessage,
    showToast,
    detections,
    totalCount,
    approvedCount,
    rejectedCount,
    pendingCount,
    reviewedCount,
    reviewProgressPercent,
    viewerMode,
    setViewerMode,
    corridorMapContainerRef,
    isBaselineLocked,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    handleSubmitReFlight,
    handleLockBaseline,
    selectedItem
  }
}
