import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { DefectItem as DispatchDefectItem } from './types'
import { ROUTE_CONFIGS } from './mockData'
import { initFastTrackMap } from './fastTrackMapSetup'
import { useFastTrackPolicy } from './useFastTrackPolicy'
import { useFastTrackDispatch } from './useFastTrackDispatch'

export const useFastTrackState = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Tự động điều phối từ Triage Inbox
  const [autoDispatchedSourceCase, setAutoDispatchedSourceCase] = useState<{
    code: string
    title: string
    stationing: string
    isEligible: boolean
  } | null>(null)

  const [routeFilterInternal, setRouteFilterInternal] = useState('QL1A_PK04')
  const currentRouteConfig = useMemo(() => {
    return ROUTE_CONFIGS[routeFilterInternal] || ROUTE_CONFIGS.QL1A_PK04
  }, [routeFilterInternal])

  const dispatch = useFastTrackDispatch(currentRouteConfig, showToast)

  // Đồng bộ routeFilter
  useEffect(() => {
    setRouteFilterInternal(dispatch.routeFilter)
  }, [dispatch.routeFilter])

  const policy = useFastTrackPolicy(dispatch.setDefects, showToast)

  // MapLibre
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR'>('SATELLITE')

  useEffect(() => {
    if (!mapContainerRef.current) return

    const { cleanup } = initFastTrackMap(
      mapContainerRef.current,
      currentRouteConfig,
      mapLayer,
      dispatch.defects,
      dispatch.routeFilter,
      dispatch.selectedDefectIds,
      (defect) => dispatch.setDetailDefect(defect)
    )

    return () => cleanup()
  }, [dispatch.defects, dispatch.selectedDefectIds, mapLayer, dispatch.routeFilter, currentRouteConfig])

  // Tự động nhận diện hồ sơ từ Triage Inbox
  useEffect(() => {
    const paramDefectCode = searchParams.get('defectCode')
    const incomingTargetDefect = location.state?.targetDefect

    if (paramDefectCode || incomingTargetDefect) {
      const codeToMatch = paramDefectCode || incomingTargetDefect?.code
      const existingDefect = dispatch.defects.find(
        (d) => d.code === codeToMatch || (incomingTargetDefect && d.id === incomingTargetDefect.id)
      )

      if (existingDefect) {
        dispatch.setSelectedDefectIds([existingDefect.id])
        dispatch.setRouteFilter(existingDefect.routeId)
        dispatch.setWorkMode(existingDefect.isFastTrackEligible ? 'INSPECT_AND_REPAIR' : 'MEASURE_ONLY')
        setAutoDispatchedSourceCase({
          code: existingDefect.code,
          title: existingDefect.type,
          stationing: existingDefect.stationing,
          isEligible: existingDefect.isFastTrackEligible
        })
        showToast(`⚡ Đã tự động chọn hồ sơ [${existingDefect.code}] từ Hộp thư tiếp nhận!`)
      } else if (incomingTargetDefect) {
        const area = incomingTargetDefect.area_sqm || 0.45
        const depth = incomingTargetDefect.max_depth_cm || 4.2
        const isEligible =
          area <= policy.currentPolicy.maxAreaM2 &&
          depth <= policy.currentPolicy.maxDepthCm &&
          policy.currentPolicy.allowedSeverities.includes(incomingTargetDefect.severity)

        const newDefect: DispatchDefectItem = {
          id: incomingTargetDefect.id,
          code: incomingTargetDefect.code,
          routeId: incomingTargetDefect.project_id === 'prj-ql1a-01' ? 'QL1A_PK01' : 'QL1A_PK04',
          routeName: incomingTargetDefect.project_name || 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
          stationing: incomingTargetDefect.stationing || 'Km 1024+300',
          kmValue: 1024.3,
          lane: incomingTargetDefect.lane || 'Làn xe máy',
          type: incomingTargetDefect.defect_title || 'Ổ gà sụt lún mặt đường',
          areaM2: area,
          depthCm: depth,
          isFastTrackEligible: isEligible,
          violationReason: isEligible ? undefined : 'Diện tích hoặc độ sâu vượt ngưỡng chính sách Fast Track hiện hành',
          assignedCrew: 'Chưa chỉ định',
          gps: {
            lat: incomingTargetDefect.gps?.lat || 16.0560,
            lng: incomingTargetDefect.gps?.lng || 108.2025
          },
          image:
            incomingTargetDefect.image_url ||
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
          aiConfidence: incomingTargetDefect.ai_confidence || 94
        }

        dispatch.setDefects((prev) => [newDefect, ...prev.filter((d) => d.code !== newDefect.code)])
        dispatch.setSelectedDefectIds([newDefect.id])
        dispatch.setRouteFilter(newDefect.routeId)
        dispatch.setWorkMode(isEligible ? 'INSPECT_AND_REPAIR' : 'MEASURE_ONLY')
        setAutoDispatchedSourceCase({
          code: newDefect.code,
          title: newDefect.type,
          stationing: newDefect.stationing,
          isEligible
        })
        showToast(`⚡ Đã tự động nạp & chọn hồ sơ [${newDefect.code}] từ Hộp thư tiếp nhận!`)
      }
    }
  }, [searchParams, location.state])

  return {
    autoDispatchedSourceCase,
    setAutoDispatchedSourceCase,
    ...policy,
    ...dispatch,
    toastMessage,
    setToastMessage,
    showToast,
    currentRouteConfig,
    mapContainerRef,
    mapLayer,
    setMapLayer
  }
}
