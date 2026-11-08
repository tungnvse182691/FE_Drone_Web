import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import { GeoJsonValidationError, inspectGeoJsonCenterline, previewCenterlineCoordinates } from './alignmentImportHelpers'
import { parseRoadGuardDraftJson, RoadGuardDraftValidationError, type RoadGuardCoordinatesDraft } from './roadGuardDraftImportHelpers'

export interface UseAlignmentImportStateParams {
  onDraftInput?: () => void
  inputScope?: string
  contextReady?: boolean
  roadSectionCount?: number
  engineeringCrs?: number | null
  onRoadGuardDraft?: (draft: RoadGuardCoordinatesDraft | null, preview?: [number, number][]) => boolean | void
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
  contextReady = false,
  roadSectionCount,
  engineeringCrs,
  onRoadGuardDraft,
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
  const [isImportModalOpen, setImportModalOpen] = useState<boolean>(false)
  const [readMessage, setReadMessage] = useState('')
  const [hasUnverifiedFile, setHasUnverifiedFile] = useState(false)
  const [importTab, setImportTab] = useState<'FILE' | 'MANUAL'>('FILE')
  const [manualCoordsText, setManualCoordsText] = useState<string>(defaultManualText)
  const latest = useRef({ onRoadGuardDraft, onDraftInput, showToast })
  latest.current = { onRoadGuardDraft, onDraftInput, showToast }

  const scope = useRef(inputScope), mounted = useRef(true), readAttempt = useRef(0)
  if (scope.current !== inputScope) readAttempt.current++
  scope.current = inputScope
  useEffect(() => { mounted.current = true; setReadMessage(''); setHasUnverifiedFile(false); return () => { mounted.current = false; readAttempt.current++ } }, [inputScope])
  const setIsImportModalOpen = (open: boolean) => {
    readAttempt.current++ // Closing/cancelling or reopening starts a new modal session.
    setImportModalOpen(open)
  }
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
        let content: any
        try { content = JSON.parse(text) } catch { throw new RoadGuardDraftValidationError('Tệp sai cú pháp JSON.') }
        if (content && typeof content === 'object' && 'sourceKind' in content) {
          const draft = parseRoadGuardDraftJson(text)
          const preview = draft.sourceCrs === 32648 ? previewCenterlineCoordinates(draft.coordinates.map(p => [p.x, p.y]), draft.sourceCrs) : []
          const applied = latest.current.onRoadGuardDraft?.(draft, preview)
          if (!current()) return
          setManualCoordsText(draft.coordinates.map(point => `${point.x}, ${point.y}`).join('\n'))
          setHasUnverifiedFile(true); latest.current.onDraftInput?.()
          let message = `Đã nạp Draft (${draft.coordinates.length} điểm), chưa lưu/chưa xác nhận.${draft.sourceCrs === 32649 ? ' Chưa hỗ trợ preview EPSG:32649; giữ nguyên bản chỉnh hợp lệ.' : ' Đã chuẩn bị preview từ CRS của tệp.'}`
          if (!contextReady) message += ' Chưa tải được context dự án; chưa đủ điều kiện lưu.'
          else if (engineeringCrs == null) message += ' Dự án chưa thiết lập engineeringUtmSrid; chỉ preview, chưa lưu.'
          else if (draft.sourceCrs !== engineeringCrs) message += ' CRS tệp không khớp CRS dự án; chỉ preview, chưa lưu.'
          if (contextReady && roadSectionCount === 0) message += ' Dự án chưa có road section/version; chưa đủ điều kiện lưu.'
          setReadMessage(message); latest.current.showToast(message)
          if (preview.length >= 2 && latest.current.onRoadGuardDraft && applied !== false) setImportModalOpen(false)
          return
        }
        const inspection = inspectGeoJsonCenterline(text)
        if (inspection.metadata?.axisOrder != null && inspection.metadata.axisOrder !== 'EN' || inspection.metadata?.metresPerUnit != null && inspection.metadata.metresPerUnit !== 1) throw new GeoJsonValidationError('Khai báo trục/đơn vị của tệp chưa hỗ trợ preview; không tự đảo trục hoặc đổi đơn vị.')
        const preview = previewCenterlineCoordinates(inspection.coords, inspection.declaredSrid ?? 4326)
        const applied = latest.current.onRoadGuardDraft?.(null, preview)
        if (!current()) return
        setManualCoordsText(inspection.coords.map(point => point.join(', ')).join('\n'))
        setHasUnverifiedFile(true); onDraftInput?.()
        const message = `Đã đọc tệp, chưa lưu (${inspection.coords.length} điểm). Preview theo ${inspection.declaredSrid ? `EPSG:${inspection.declaredSrid}` : 'GeoJSON RFC7946 [longitude, latitude]'}; chưa được xác minh để lưu hoặc xác nhận tuyến.`
        setReadMessage(message); showToast(message)
        if (preview.length >= 2 && latest.current.onRoadGuardDraft && applied !== false) setImportModalOpen(false)
      } catch (error) {
        const message = (error instanceof GeoJsonValidationError || error instanceof RoadGuardDraftValidationError) && error.message ? error.message : 'Không thể kiểm tra nội dung tệp GeoJSON hoặc RoadGuard Draft. Vui lòng kiểm tra lại tệp.'
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
