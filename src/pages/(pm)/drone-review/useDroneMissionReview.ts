import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { fetchProjectGeo, geoErrorMessage, type ProjectGeo } from '../../../api/services/defectGeoService'
import { AIDetectionItem } from './types'
import { surveyService } from '../../../api/services'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

import type { SurveyMissionItem } from '../../../api/services'

export function useDroneMissionReview(
  surveyId: string = '',
  currentSurvey?: SurveyMissionItem | null,
  // Ngữ cảnh từ "Mở kết quả" (lần chạy AI + bản nộp): chỉ đọc phát hiện của đúng lần chạy đó.
  runScope?: { runId?: string; datasetId?: string; detectionId?: string; onSelect?: (detectionId: string) => void }
) {
  const scopeRunId = runScope?.runId || ''
  const scopeDatasetId = runScope?.datasetId || ''
  const [isAiOverlayVisible, setIsAiOverlayVisible] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrame, setCurrentFrame] = useState<number>(1)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const totalFrames = 100
  const detectionGuard = useSubmitGuard()
  const reFlightGuard = useSubmitGuard()
  const baselineGuard = useSubmitGuard()

  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  // detectionId yêu cầu từ URL (?det=): chỉ đọc lúc mở; khớp theo detectionId, không có thì báo rõ — không chọn bản ghi đầu.
  const wantedDetectionId = useRef((runScope?.detectionId || '').toLowerCase())
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>('')
  const [selectionError, setSelectionError] = useState<string>('')

  const isPersistentLocked =
    currentSurvey?.status === 'BASELINE_LOCKED'

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
  const [isLoadingDetections, setIsLoadingDetections] = useState<boolean>(!!surveyId)
  const [detectionsError, setDetectionsError] = useState<string>('')

  // Tải danh sách detections từ Mock API Service (surveyService)
  useEffect(() => {
    let isMounted = true
    const fetchDetections = async () => {
      if (!surveyId) { setDetections([]); setDetectionsError(''); setIsLoadingDetections(false); return }
      try {
        setIsLoadingDetections(true); setDetectionsError('')
        const data = await surveyService.getSurveyDetections(surveyId, undefined, undefined, scopeRunId ? { runId: scopeRunId, datasetId: scopeDatasetId || undefined } : undefined)
        if (isMounted) {
          setDetections(data)
          const wanted = wantedDetectionId.current
          if (wanted && !data.some((d) => d.id.toLowerCase() === wanted)) {
            setSelectionError(`Không tìm thấy phát hiện AI có ID ${wanted} trong ${scopeRunId ? 'lần chạy AI đã chọn' : 'nhiệm vụ này'}. Không hiển thị phát hiện khác thay thế.`)
            setSelectedDetectionId('')
          } else {
            setSelectionError('')
            if (data.length > 0) {
              setSelectedDetectionId((prev) => {
                const target = prev || wanted
                const matched = target ? data.find((d) => d.id.toLowerCase() === target.toLowerCase()) : undefined
                return matched ? matched.id : data[0].id
              })
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách phát hiện AI:', err)
        if (isMounted) { setDetections([]); setDetectionsError(err instanceof Error ? err.message : 'Không tải được danh sách phát hiện AI từ máy chủ.') }
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
  }, [surveyId, scopeRunId, scopeDatasetId])

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

const handleSelectDetection = (item: AIDetectionItem) => {
  setSelectedDetectionId(item.id)
    setSelectionError('')
    wantedDetectionId.current = item.id.toLowerCase()
    runScope?.onSelect?.(item.id)
    const frameMap: Record<string, number> = {}
    if (frameMap[item.id]) {
      setCurrentFrame(frameMap[item.id])
    }
    showToast(`Đã trích xuất khung hình ${item.code} tại lý trình ${item.stationing}`)
  }

  // Hình học hành lang lấy từ BE (geometry-package theo routeVersionId/segmentSetId của phát hiện)
  const effProjectId = currentSurvey?.project_id || detections[0]?.projectId
  const geoRouteVersionId = detections.find((d) => d.routeVersionId)?.routeVersionId
  const geoSegmentSetId = detections.find((d) => d.segmentSetId)?.segmentSetId
  const [geo, setGeo] = useState<{ status: 'loading' | 'ready' | 'empty' | 'error'; data: ProjectGeo | null; error?: string }>({
    status: 'loading',
    data: null
  })

  useEffect(() => {
    if (viewerMode !== 'GIS_MAP' || isLoadingDetections) return
    let alive = true
    setGeo({ status: 'loading', data: null })
    fetchProjectGeo(effProjectId, geoRouteVersionId, geoSegmentSetId)
      .then((data) => alive && setGeo(data ? { status: 'ready', data } : { status: 'empty', data: null }))
      .catch((err) => {
        if (!alive) return
        setGeo({ status: 'error', data: null, error: geoErrorMessage(err) })
        showToast(`Lỗi máy chủ khi tải hình học tuyến: ${geoErrorMessage(err)}`)
      })
    return () => {
      alive = false
    }
  }, [viewerMode, isLoadingDetections, effProjectId, geoRouteVersionId, geoSegmentSetId])

  useEffect(() => {
    const container = corridorMapContainerRef.current
    if (viewerMode !== 'GIS_MAP' || !container) return

    if (corridorMapInstanceRef.current) {
      corridorMapInstanceRef.current.remove()
      corridorMapInstanceRef.current = null
    }

    const corridorCoords = geo.data?.corridor
    if (!corridorCoords) {
      const msg = document.createElement('div')
      msg.className = 'w-full h-full flex items-center justify-center text-slate-300 text-xs px-6 text-center'
      msg.textContent =
        geo.status === 'loading'
          ? 'Đang tải hình học tuyến từ máy chủ...'
          : geo.status === 'error'
          ? `Lỗi máy chủ: ${geo.error}`
          : 'Máy chủ chưa cung cấp tọa độ'
      container.appendChild(msg)
      return () => {
        msg.remove()
      }
    }

    const located = detections.filter((d) => d.segmentId && geo.data?.segments[d.segmentId])
    const note = document.createElement('div')
    note.className =
      'absolute bottom-3 left-3 z-10 bg-black/80 text-slate-200 text-[10px] px-2.5 py-1.5 rounded-lg pointer-events-none'
    if (located.length < detections.length) {
      note.textContent = `${detections.length - located.length}/${detections.length} phát hiện: máy chủ chưa cung cấp tọa độ`
      container.appendChild(note)
    }

    const map = new maplibregl.Map({
      container,
      style: getMapLibreStyle('SATELLITE'),
      center: corridorCoords[Math.floor(corridorCoords.length / 2)],
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

      located.forEach((det) => {
        const pt = geo.data!.segments[det.segmentId as string].mid
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
      note.remove()
      if (corridorMapInstanceRef.current) {
        corridorMapInstanceRef.current.remove()
        corridorMapInstanceRef.current = null
      }
    }
  }, [viewerMode, selectedDetectionId, detections, geo])

  // Quyết định ứng viên AI = POST /projects/{p}/candidate-decisions (PM). BE không có thao tác "mở lại": muốn đổi thì ghi quyết định mới (supersedes) — ở màn chi tiết khiếm khuyết.
  const decide = async (detId: string, decision: 'KEEP_NEW' | 'REJECT', reason: string, typeCode?: 'POTHOLE' | 'CRACK', severityLevel?: string) => {
    const det = detections.find((d) => d.id === detId)
    const projectId = det?.projectId || currentSurvey?.project_id
    if (!det || !projectId) throw new Error('Không xác định được dự án của phát hiện AI.')
    if (det.stateUnknown) throw new Error('Chưa xác định được trạng thái thẩm định của phát hiện này (không đọc được từ máy chủ). Bấm Thử lại trước khi ghi quyết định để tránh tạo trùng.')
    const payload: Parameters<typeof surveyService.decideCandidate>[1] = { sourceKind: 'AI_DETECTION', sourceId: det.id, decision, reason, runId: det.runId, segmentId: det.segmentId ?? null }
    if (decision === 'KEEP_NEW') {
      const SEV: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = { 'Khẩn cấp': 'CRITICAL', 'Nghiêm trọng': 'HIGH', 'Trung bình': 'MEDIUM', 'Nhẹ': 'LOW' }
      const severity = SEV[severityLevel || '']
      if (!severity) throw new Error('Chọn mức độ nghiêm trọng hợp lệ trước khi giữ phát hiện.')
      payload.defectTypeCode = typeCode || det.rawTypeCode
      payload.severity = severity
    }
    return surveyService.decideCandidate(projectId, payload)
  }

  const handleApproveDetection = async (
    detId: string,
    reason?: string,
    customTypeCode?: 'POTHOLE' | 'CRACK',
    customSeverityLevel?: string
  ) => {
    if (!detectionGuard.acquire()) return
    try {
      const targetDet = detections.find((d) => d.id === detId)
      const d = await decide(detId, 'KEEP_NEW', (reason || 'PM xác nhận phát hiện AI là khiếm khuyết').trim(), customTypeCode, customSeverityLevel || targetDet?.severityLevel)
      setDetections((prev) => prev.map((x) => (x.id === detId ? { ...x, status: 'APPROVED', decisionKind: d.decision } : x)))
      showToast('Đã lưu quyết định KEEP_NEW trên máy chủ.')
    } catch (err: any) {
      showToast(`Lỗi máy chủ: ${err?.response?.data?.detail || err?.response?.data?.code || err?.message || 'Lỗi khi lưu quyết định thẩm định AI'}`)
    } finally { detectionGuard.release() }
  }

  const handleRejectDetection = async (detId: string, reason?: string) => {
    if (!detectionGuard.acquire()) return
    try {
      const d = await decide(detId, 'REJECT', (reason || 'PM từ chối phát hiện AI').trim())
      setDetections((prev) => prev.map((x) => (x.id === detId ? { ...x, status: 'REJECTED', decisionKind: d.decision } : x)))
      showToast('Đã lưu quyết định REJECT trên máy chủ.')
    } catch (err: any) {
      showToast(`Lỗi máy chủ: ${err?.response?.data?.detail || err?.response?.data?.code || err?.message || 'Lỗi khi bác bỏ phát hiện AI'}`)
    } finally { detectionGuard.release() }
  }

  // Thử lại đọc trạng thái của đúng một phát hiện (GET candidate → decision → defect); không gọi lại KEEP_NEW.
  const retryDetection = async (item: AIDetectionItem) => {
    try {
      const fresh = await surveyService.refreshDetection(item)
      setDetections((prev) => prev.map((x) => (x.id === item.id ? fresh : x)))
      showToast(fresh.stateUnknown ? 'Vẫn chưa đọc được trạng thái thẩm định từ máy chủ.' : 'Đã đọc lại trạng thái thẩm định từ máy chủ.')
    } catch (err) { showToast(`Lỗi máy chủ: ${err instanceof Error ? err.message : 'không đọc lại được phát hiện AI'}`) }
  }

  const selectedItem = detections.find((d) => d.id === selectedDetectionId)

  return {
    detectionsError,
    selectionError,
    retryDetection,
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
    isLockedSuccess,
    lockedBaselineRange,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    selectedItem
  }
}
