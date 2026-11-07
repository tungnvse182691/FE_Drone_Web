import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { GeoJsonValidationError, inspectGeoJsonCenterline } from './alignmentImportHelpers'

export interface UseAlignmentImportStateParams {
  onDraftInput?: () => void
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
  onDraftInput,
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
  const [readMessage, setReadMessage] = useState('')
  const [hasUnverifiedFile, setHasUnverifiedFile] = useState(false)
  const [importTab, setImportTab] = useState<'FILE' | 'MANUAL'>('FILE')
  const [manualCoordsText, setManualCoordsText] = useState<string>(defaultManualText)

  const scope = useRef(inputScope), mounted = useRef(true), readAttempt = useRef(0)
  scope.current = inputScope
  useEffect(() => { mounted.current = true; setReadMessage(''); setHasUnverifiedFile(false); return () => { mounted.current = false; readAttempt.current++ } }, [inputScope])
  const processGeoJSONFile = (file: File) => {
    const attempt = ++readAttempt.current, selectedScope = inputScope
    const current = () => mounted.current && attempt === readAttempt.current && scope.current === selectedScope
    setReadMessage('Đang đọc tệp...')
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!current()) return
      try {
        const text = e.target?.result
        if (typeof text !== 'string') { const message = 'Không đọc được nội dung văn bản của tệp GeoJSON.'; setReadMessage(message); showToast(message); return }
        const inspection = inspectGeoJsonCenterline(text)
        setManualCoordsText(inspection.coords.map(point => point.join(', ')).join('\n'))
        setHasUnverifiedFile(true); onDraftInput?.()
        const message = `Đã đọc tệp, chưa lưu (${inspection.coords.length} điểm). Hệ tọa độ, trục và đơn vị của tệp chưa được xác minh.`
        setReadMessage(message); showToast(message)
      } catch (error) {
        const message = error instanceof GeoJsonValidationError && error.message ? error.message : 'Không thể kiểm tra nội dung tệp GeoJSON. Vui lòng kiểm tra lại tệp.'
        setReadMessage(message); showToast(message)
      }
    }
    reader.onerror = () => { if (current()) { const message = 'Không đọc được tệp GeoJSON. Vui lòng chọn lại tệp và thử lại.'; setReadMessage(message); showToast(message) } }
    reader.onabort = () => { if (current()) { const message = 'Đã hủy đọc tệp GeoJSON. Nội dung chưa được kiểm tra.'; setReadMessage(message); showToast(message) } }
    try { reader.readAsText(file) }
    catch { const message = 'Không đọc được tệp GeoJSON. Vui lòng chọn lại tệp và thử lại.'; setReadMessage(message); showToast(message) }
  }

  const processManualCoordinates = (text: string) => {
    setManualCoordsText(text); onDraftInput?.()
    showToast('Bản nhập được giữ trong form. Chưa xác định CRS/axis/unit và thông số có nguồn; chưa lưu server, chưa tạo phân đoạn hoặc xác nhận tuyến.')
  }

  const handleLoadPreset = (_name: string, _dist: number) => {
    showToast('Không nạp tuyến mẫu. Cần dữ liệu và hệ quy chiếu có nguồn của dự án.')
  }

  return {
    readMessage, hasUnverifiedFile,
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
