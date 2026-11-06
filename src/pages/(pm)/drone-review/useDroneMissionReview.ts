import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { getProjectCorridorCoords, getDefectGpsCoordinates } from '../../../utils/projectGeodesy'
import { AIDetectionItem } from './types'
import { surveyService } from '../../../api/services'
import { getFromStorage } from '../../../api/services/storageHelper'

import type { SurveyMissionItem } from '../../../api/services'

export function useDroneMissionReview(
  surveyId: string = 'srv-01',
  currentSurvey?: SurveyMissionItem | null
) {
  const [isAiOverlayVisible, setIsAiOverlayVisible] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrame, setCurrentFrame] = useState<number>(1)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const totalFrames = 100

  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>('DET-01')

  const [coveragePercentage, setCoveragePercentage] = useState<number>(100)
  const [hasBlindspot, setHasBlindspot] = useState<boolean>(false)

  const [isReFlightModalOpen, setIsReFlightModalOpen] = useState<boolean>(false)
  const [pilotNote, setPilotNote] = useState<string>(
    'Bay quét bù dải phân cách giữa tại lý trình Km 1027+100 bằng góc nghiêng 45° Oblique.'
  )

  const isPersistentLocked =
    currentSurvey?.status === 'BASELINE_LOCKED' ||
    getFromStorage<boolean>(`roadguard_baseline_locked_${surveyId}`, false) ||
    (currentSurvey?.id ? getFromStorage<boolean>(`roadguard_baseline_locked_${currentSurvey.id}`, false) : false) ||
    (currentSurvey?.code ? getFromStorage<boolean>(`roadguard_baseline_locked_${currentSurvey.code}`, false) : false)

  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState<boolean>(false)
  const [isLockedSuccess, setIsLockedSuccess] = useState<boolean>(isPersistentLocked)
  const [lockedBaselineRange, setLockedBaselineRange] = useState<string | null>(
    isPersistentLocked && currentSurvey ? (currentSurvey.start_km + ' → ' + currentSurvey.end_km) : null
  )

  useEffect(() => {
    if (isPersistentLocked) {
      setIsLockedSuccess(true)
      if (currentSurvey) {
        setLockedBaselineRange(currentSurvey.start_km + ' → ' + currentSurvey.end_km)
      }
    }
  }, [currentSurvey, isPersistentLocked])

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  const [detections, setDetections] = useState<AIDetectionItem[]>([])
  const [isLoadingDetections, setIsLoadingDetections] = useState<boolean>(true)

  // Tải danh sách detections từ Mock API Service (surveyService)
  useEffect(() => {
    let isMounted = true
    const fetchDetections = async () => {
      try {
        setIsLoadingDetections(true)
        const data = await surveyService.getSurveyDetections(surveyId)
        if (isMounted) {
          setDetections(data)
          if (data.length > 0) {
            setSelectedDetectionId((prev) => {
              const matched = data.find((d) => d.id === prev || d.code === prev)
              return matched ? matched.id : data[0].id
            })
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách phát hiện AI:', err)
      } finally {
        if (isMounted) {
          setIsLoadingDetections(false)
        }
      }
    }
    fetchDetections()
    return () => {
      isMounted = false
    }
  }, [surveyId])

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

const isBaselineLocked = isLockedSuccess
const canLockBaseline = pendingCount === 0

const handleSelectDetection = (item: AIDetectionItem) => {
  setSelectedDetectionId(item.id)
    const frameMap: Record<string, number> = {}
    if (frameMap[item.id]) {
      setCurrentFrame(frameMap[item.id])
    }
    showToast(`Đã trích xuất khung hình ${item.code} tại lý trình ${item.stationing}`)
  }

  useEffect(() => {
    if (viewerMode !== 'GIS_MAP' || !corridorMapContainerRef.current) return

    if (corridorMapInstanceRef.current) {
      corridorMapInstanceRef.current.remove()
      corridorMapInstanceRef.current = null
    }

    const effProjectId = currentSurvey?.project_id || detections[0]?.projectId
    const corridorCoords = getProjectCorridorCoords(effProjectId)
    const map = new maplibregl.Map({
      container: corridorMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: corridorCoords[Math.floor(corridorCoords.length / 2)] || [108.274, 16.093],
      zoom: 16,
      minZoom: 10,
      maxZoom: 22,
      pitch: 35,
      bearing: -20
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
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
        paint: { 'line-color': '#000', 'line-width': 10, 'line-opacity': 0.6 }
      })

      map.addLayer({
        id: 'corridor-line',
        type: 'line',
        source: 'corridor-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#C9A227', 'line-width': 5 }
      })

      detections.forEach((det) => {
        const { lng, lat } = getDefectGpsCoordinates(
          effProjectId,
          det.kmValue
        )
        const pt: [number, number] = [lng, lat]
        const isCurrent = det.id === selectedDetectionId
        const size = isCurrent ? 24 : 18
        const dotColor = det.severityLevel?.includes('Khẩn cấp')
          ? '#DC2626'
          : det.severityLevel?.includes('Nghiêm trọng')
          ? '#D97706'
          : '#2563EB'

        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <div style="position:relative; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; bottom:calc(100% + 5px); left:50%; transform:translateX(-50%); background:${isCurrent ? '#C9A227' : '#1E293B'}; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.4); white-space:nowrap; border:1px solid #fff; pointer-events:none; z-index:10;">
              ${det.code || det.id} (${det.stationing})
            </div>
            ${isCurrent ? `<div style="position:absolute; width:${size + 14}px; height:${size + 14}px; border-radius:50%; background:rgba(201,162,39,0.3); border:1.5px solid #C9A227; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="position:relative; width:${size}px; height:${size}px; background:${dotColor}; border:2.5px solid #FFFFFF; border-radius:50%; box-shadow:0 0 8px rgba(0,0,0,0.6); z-index:2;"></div>
          </div>
        `
        el.onclick = () => {
          handleSelectDetection(det)
          map.flyTo({ center: pt, zoom: 17.5, speed: 1.2 })
        }

        new maplibregl.Marker({ element: el, anchor: 'center' })
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

  const handleApproveDetection = async (
    detId: string,
    reason?: string,
    customTypeCode?: 'POTHOLE' | 'CRACK',
    customSeverityLevel?: string
  ) => {
    try {
      const targetDet = detections.find((d) => d.id === detId)
      const effectiveTypeCode = customTypeCode || (targetDet?.rawTypeCode as 'POTHOLE' | 'CRACK') || 'CRACK'
      const effectiveSeverity = customSeverityLevel || targetDet?.severityLevel || 'Nghiêm trọng'
      const updated = await surveyService.updateSurveyDetection(surveyId, detId, {
        status: 'APPROVED',
        projectId: targetDet?.projectId || currentSurvey?.project_id,
        rawTypeCode: effectiveTypeCode,
        severityLevel: effectiveSeverity,
        metrics: {
          reviewer: 'Chỉ huy trưởng (PM)',
          dismissReason: reason
        }
      })
      if (updated) {
        setDetections((prev) => prev.map((d) => (d.id === detId ? updated : d)))
        showToast(
          `Đã lưu phân loại (${updated.type} • Mức độ: ${updated.severityLevel}) → Mã khiếm khuyết ${updated.defectCode || ''} trong CSDL!`
        )
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.response?.data?.code ||
        err?.message ||
        'Lỗi khi lưu quyết định thẩm định AI'
      showToast(`Lỗi máy chủ: ${msg}`)
    }
  }

  const handleRejectDetection = async (detId: string, reason?: string) => {
    try {
      const targetDet = detections.find((d) => d.id === detId)
      const updated = await surveyService.updateSurveyDetection(surveyId, detId, {
        status: 'REJECTED',
        projectId: targetDet?.projectId || currentSurvey?.project_id,
        metrics: {
          dismissReason: reason || 'Xác minh thực tế: Nhiễu bóng đổ và phản xạ ánh sáng.'
        }
      })
      if (updated) {
        setDetections((prev) => prev.map((d) => (d.id === detId ? updated : d)))
        showToast(`Đã ghi nhận từ chối (Báo sai AI) vào CSDL cho phát hiện #${detId.slice(0, 8)}.`)
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.response?.data?.code ||
        err?.message ||
        'Lỗi khi bác bỏ phát hiện AI'
      showToast(`Lỗi máy chủ: ${msg}`)
    }
  }

  const handleResetDetection = async (detId: string) => {
    try {
      const targetDet = detections.find((d) => d.id === detId)
      const updated = await surveyService.updateSurveyDetection(surveyId, detId, {
        status: 'PENDING',
        projectId: targetDet?.projectId || currentSurvey?.project_id
      })
      if (updated) {
        setDetections((prev) => prev.map((d) => (d.id === detId ? updated : d)))
        showToast(`Đã mở lại trạng thái chờ rà soát cho phát hiện #${detId.slice(0, 8)}.`)
      }
    } catch (err: any) {
      showToast(`Không thể mở lại rà soát: ${err?.message || 'Lỗi kết nối CSDL'}`)
    }
  }

  const handleSubmitReFlight = async (payload: {
    pilot: string
    surveyType?: 'AD_HOC' | 'PERIODIC'
    dueDate: string
    note: string
    range: string
  }) => {
    try {
      const res = await surveyService.requestReFlight(surveyId, {
        note: payload.note,
        targetKm: payload.range,
        operatorName: payload.pilot,
        surveyType: payload.surveyType,
        dueDate: payload.dueDate,
        projectId: currentSurvey?.project_id
      })
      if (res.success) {
        setIsReFlightModalOpen(false)
        showToast(`Đã phát lệnh bay bổ sung thành công! Hạn hoàn thành: ${payload.dueDate}. Nhiệm vụ đã giao cho [${payload.pilot}].`)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'Phát lệnh bay bù thất bại'
      showToast(`Lỗi khi phát lệnh bay bù: ${msg}`)
    }
  }

  const handleLockBaseline = async () => {
    if (pendingCount > 0) {
      showToast(`Chưa thể khóa Baseline: Cần hoàn tất thẩm định ${pendingCount} mục còn lại trong danh sách!`)
      return
    }

    try {
      const success = await surveyService.lockBaseline(surveyId, currentSurvey?.project_id)
      if (success) {
        setIsLockedSuccess(true)
        setLockedBaselineRange(`${currentSurvey?.start_km || ''} → ${currentSurvey?.end_km || ''} (Toàn tuyến)`)
        showToast(`Dự án [${currentSurvey?.project_name || 'Khảo sát'}] đã chính thức KHÓA BASELINE THÀNH CÔNG! Bản đồ hoàn công số đã được kích hoạt.`)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'Khóa Baseline thất bại'
      showToast(`Lỗi khóa Baseline từ máy chủ: ${msg}`)
    }
  }

  const handleConfirmBaseline = async (isPartial: boolean) => {
    try {
      const success = await surveyService.lockBaseline(surveyId, currentSurvey?.project_id)
      if (success) {
        setIsLockedSuccess(true)
        setIsBaselineModalOpen(false)
        if (isPartial) {
          setLockedBaselineRange(`${currentSurvey?.start_km || ''} (Phân đoạn đạt chuẩn)`)
          showToast('Đã xác nhận và KHÓA BASELINE THÀNH CÔNG phân đoạn đạt chuẩn (Quy tắc BR-40 / DA10)!')
        } else {
          setLockedBaselineRange(`${currentSurvey?.start_km || ''} → ${currentSurvey?.end_km || ''} (Toàn tuyến)`)
          showToast(`Đã KHÓA BASELINE THÀNH CÔNG toàn tuyến! Hồ sơ gốc bàn giao đã được đóng băng số.`)
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'Khóa Baseline thất bại'
      showToast(`Lỗi khóa Baseline từ máy chủ: ${msg}`)
    }
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
    statusFilter,
    setStatusFilter,
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
    canLockBaseline,
    isBaselineModalOpen,
    setIsBaselineModalOpen,
    isLockedSuccess,
    lockedBaselineRange,
    handleConfirmBaseline,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    handleResetDetection,
    handleSubmitReFlight,
    handleLockBaseline,
    selectedItem
  }
}
