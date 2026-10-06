import { useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './alignmentData'
import {
  checkAndEnrichSegmentsContinuity,
  generateMockSlabs
} from './alignmentGeometryHelpers'
import {
  parseGeoJsonText,
  parseManualCoordinatesText,
  parseExtractedCoordinates
} from './alignmentImportHelpers'

export interface UseAlignmentImportStateParams {
  stationOriginKm: number
  splitDistance: number
  roadWidthM: number
  defaultManualText: string
  showToast: (msg: string) => void
  setSegments: (segs: SegmentItem[]) => void
  setSlabs: (slabs: any[]) => void
  setSelectedSegmentId: (id: string | null) => void
  syncMap: (segs: SegmentItem[], selId: string | null, coords?: [number, number][], kmPts?: number[]) => void
  mapRef: React.RefObject<maplibregl.Map | null>
  handleFitBounds: (coords?: [number, number][]) => void
  setSplitDistance: (d: number) => void
  initialCoords: [number, number][]
  initialKmPoints: number[]
  initialLengthKm: number
}

export function useAlignmentImportState({
  stationOriginKm,
  splitDistance,
  roadWidthM,
  defaultManualText,
  showToast,
  setSegments,
  setSlabs,
  setSelectedSegmentId,
  syncMap,
  mapRef,
  handleFitBounds,
  setSplitDistance,
  initialCoords,
  initialKmPoints,
  initialLengthKm
}: UseAlignmentImportStateParams) {
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [importTab, setImportTab] = useState<'FILE' | 'MANUAL'>('FILE')
  const [manualCoordsText, setManualCoordsText] = useState<string>(defaultManualText)

  const [currentCoords, setCurrentCoords] = useState<[number, number][]>(initialCoords)
  const [currentKmPoints, setCurrentKmPoints] = useState<number[]>(initialKmPoints)
  const [importedLengthKm, setImportedLengthKm] = useState<number>(initialLengthKm)

  const processGeoJSONFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rawCoords = parseGeoJsonText(text)
        const res = parseExtractedCoordinates(rawCoords, stationOriginKm, splitDistance, roadWidthM)

        if (!res) {
          showToast('Tệp tải lên không chứa hình học LineString hoặc tim tuyến hợp lệ!')
          return
        }

        setCurrentCoords(res.coords)
        setCurrentKmPoints(res.kmPoints)
        setImportedLengthKm(res.totalLengthKm)

        const validated = checkAndEnrichSegmentsContinuity(res.segments)
        setSegments(validated)
        setSlabs(generateMockSlabs(validated.length))
        setSelectedSegmentId(validated[0]?.id || null)
        setIsImportModalOpen(false)

        if (mapRef.current) {
          const map = mapRef.current
          const bounds = new maplibregl.LngLatBounds()
          res.coords.forEach((c) => bounds.extend(c))
          map.fitBounds(bounds, { padding: 80, speed: 1.2 })
          syncMap(validated, validated[0]?.id || null, res.coords, res.kmPoints)
        }

        const lenText = res.totalLengthKm >= 1 ? `${res.totalLengthKm.toFixed(2)} km` : `${(res.totalLengthKm * 1000).toFixed(0)} m`
        showToast(`Đã nạp tim tuyến [${file.name}]: ${res.coords.length} đỉnh, chiều dài ${lenText}, chia ${validated.length} phân đoạn!`)
      } catch {
        showToast('Lỗi: Định dạng file GeoJSON không đúng cấu trúc JSON chuẩn!')
      }
    }
    reader.readAsText(file)
  }

  const processManualCoordinates = (text: string) => {
    try {
      if (!text || !text.trim()) {
        showToast('Vui lòng nhập hoặc dán chuỗi tọa độ đỉnh!')
        return
      }

      const rawCoords = parseManualCoordinatesText(text)
      const res = parseExtractedCoordinates(rawCoords, stationOriginKm, splitDistance, roadWidthM)

      if (!res) {
        showToast('Chuỗi tọa độ cần ít nhất 2 điểm đỉnh [kinh độ, vĩ độ] hợp lệ!')
        return
      }

      setCurrentCoords(res.coords)
      setCurrentKmPoints(res.kmPoints)
      setImportedLengthKm(res.totalLengthKm)

      const validated = checkAndEnrichSegmentsContinuity(res.segments)
      setSegments(validated)
      setSlabs(generateMockSlabs(validated.length))
      setSelectedSegmentId(validated[0]?.id || null)
      setIsImportModalOpen(false)

      if (mapRef.current) {
        const map = mapRef.current
        const bounds = new maplibregl.LngLatBounds()
        res.coords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 80, speed: 1.2 })
        syncMap(validated, validated[0]?.id || null, res.coords, res.kmPoints)
      }

      const lenText = res.totalLengthKm >= 1 ? `${res.totalLengthKm.toFixed(2)} km` : `${(res.totalLengthKm * 1000).toFixed(0)} m`
      showToast(`Đã dựng tim tuyến từ chuỗi tọa độ thủ công: ${res.coords.length} đỉnh, L = ${lenText}, chia ${validated.length} phân đoạn!`)
    } catch {
      showToast('Lỗi khi phân tích chuỗi tọa độ!')
    }
  }

  const handleLoadPreset = (name: string, dist: number) => {
    setSplitDistance(dist)
    setIsImportModalOpen(false)

    const count = Math.ceil(25.0 / dist)
    const newSegs: SegmentItem[] = []
    let cur = 1020.0
    for (let i = 1; i <= count; i++) {
      const next = Math.min(cur + dist, 1045.0)
      newSegs.push({
        id: `seg-${i}`,
        code: `Phân đoạn #${String(i).padStart(2, '0')}`,
        startKm: cur,
        endKm: next,
        lengthKm: parseFloat((next - cur).toFixed(2)),
        roadWidthM: roadWidthM || 8.0,
        status: 'VALID',
        statusText: 'HỢP LỆ (Valid)',
        laneCount: 4,
        surfaceMaterial: 'Mặt BTN C12.5',
        color: SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
      })
      cur = next
    }
    const validated = checkAndEnrichSegmentsContinuity(newSegs)
    setSegments(validated)
    setSlabs(generateMockSlabs(validated.length))
    setSelectedSegmentId(validated[0]?.id || null)
    setImportedLengthKm(25.0)
    showToast(`Đã nạp thành công bộ dữ liệu "${name}"! Bản đồ đã tải lại hoàn toàn.`)
    handleFitBounds()
  }

  return {
    isImportModalOpen,
    setIsImportModalOpen,
    importTab,
    setImportTab,
    manualCoordsText,
    setManualCoordsText,
    currentCoords,
    setCurrentCoords,
    currentKmPoints,
    setCurrentKmPoints,
    importedLengthKm,
    setImportedLengthKm,
    processGeoJSONFile,
    processManualCoordinates,
    handleLoadPreset
  }
}
