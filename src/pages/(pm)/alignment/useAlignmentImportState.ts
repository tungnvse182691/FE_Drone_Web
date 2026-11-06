import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { GeoJsonValidationError, inspectGeoJsonCenterline } from './alignmentImportHelpers'

export interface UseAlignmentImportStateParams {
  inputScope?: string
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
  inputScope = '',
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

  const scope = useRef(inputScope), mounted = useRef(true), readAttempt = useRef(0)
  scope.current = inputScope
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; readAttempt.current++ } }, [inputScope])
  const processGeoJSONFile = (file: File) => {
    const attempt = ++readAttempt.current, selectedScope = inputScope
    const current = () => mounted.current && attempt === readAttempt.current && scope.current === selectedScope
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!current()) return
      try {
        const text = e.target?.result
        if (typeof text !== 'string') { showToast('Không đọc được nội dung văn bản của tệp GeoJSON.'); return }
        const inspection = inspectGeoJsonCenterline(text)
        setManualCoordsText(inspection.coords.map(point => point.join(', ')).join('\n'))
        showToast(`Đã kiểm tra ${inspection.coords.length} điểm. CRS UNKNOWN: cần xác minh hệ quy chiếu và thông số kỹ thuật trước khi lưu; chưa tạo phân đoạn hoặc bản nháp.`)
      } catch (error) {
        showToast(error instanceof GeoJsonValidationError && error.message ? error.message : 'Không thể kiểm tra nội dung tệp GeoJSON. Vui lòng kiểm tra lại tệp.')
      }
    }
    reader.onerror = () => current() && showToast('Không đọc được tệp GeoJSON. Vui lòng chọn lại tệp và thử lại.')
    reader.onabort = () => current() && showToast('Đã hủy đọc tệp GeoJSON. Nội dung chưa được kiểm tra.')
    try { reader.readAsText(file) }
    catch { showToast('Không đọc được tệp GeoJSON. Vui lòng chọn lại tệp và thử lại.') }
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
