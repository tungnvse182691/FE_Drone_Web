import { useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { inspectGeoJsonCenterline } from './alignmentImportHelpers'

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
  currentCoords: [number, number][]
  setCurrentCoords: (coords: [number, number][]) => void
  currentKmPoints: number[]
  setCurrentKmPoints: (pts: number[]) => void
  importedLengthKm: number
  setImportedLengthKm: (len: number) => void
  onAutoSave?: (coords: [number, number][], kmPoints: number[], segments: SegmentItem[]) => void
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
  currentCoords,
  setCurrentCoords,
  currentKmPoints,
  setCurrentKmPoints,
  importedLengthKm,
  setImportedLengthKm,
  onAutoSave
}: UseAlignmentImportStateParams) {
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [importTab, setImportTab] = useState<'FILE' | 'MANUAL'>('FILE')
  const [manualCoordsText, setManualCoordsText] = useState<string>(defaultManualText)

  const processGeoJSONFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const inspection = inspectGeoJsonCenterline(text)
        showToast(`Đã kiểm tra ${inspection.coords.length} điểm. CRS UNKNOWN: cần xác minh hệ quy chiếu và thông số kỹ thuật trước khi lưu; chưa tạo phân đoạn hoặc bản nháp.`)
      } catch {
        showToast('Lỗi: Định dạng file GeoJSON không đúng cấu trúc JSON chuẩn!')
      }
    }
    reader.readAsText(file)
  }

  const processManualCoordinates = (text: string) => {
    setManualCoordsText(text)
    showToast('Bản nhập được giữ trong form. Chưa xác định CRS/axis/unit và thông số có nguồn; chưa lưu server, chưa tạo phân đoạn hoặc xác nhận tuyến.')
  }

  const handleLoadPreset = (_name: string, _dist: number) => {
    showToast('Không nạp tuyến mẫu. Cần dữ liệu và hệ quy chiếu có nguồn của dự án.')
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
