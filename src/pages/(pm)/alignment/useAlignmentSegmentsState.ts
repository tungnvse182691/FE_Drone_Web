import React, { useState, useRef } from 'react'
import { SegmentItem, SlabItem } from './types'
import { SEGMENT_COLORS } from './data'
import {
  interpolateCoordAtKm,
  checkAndEnrichSegmentsContinuity,
  generateMockSlabs
} from './alignmentGeometryHelpers'
import {
  computeAutoSplitSegments,
  computeSplitSegmentPair
} from './alignmentSplitHelpers'

export interface UseAlignmentSegmentsStateParams {
  initialSegments: SegmentItem[]
  currentKmPoints: number[]
  currentCoords: [number, number][]
  importedLengthKm: number
  stationOriginKm: number
  roadWidthM: number
  showToast: (msg: string) => void
  syncMap: (updatedSegs: SegmentItem[], selId?: string | null) => void
  mapRef: React.RefObject<any>
  popupRef: React.RefObject<any>
  handleFitBounds: () => void
}

export function useAlignmentSegmentsState({
  initialSegments,
  currentKmPoints,
  currentCoords,
  importedLengthKm,
  stationOriginKm,
  roadWidthM,
  showToast,
  syncMap,
  mapRef,
  popupRef,
  handleFitBounds
}: UseAlignmentSegmentsStateParams) {
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments)
  const [slabs, setSlabs] = useState<SlabItem[]>([])
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  const [splitDistance, setSplitDistanceValue] = useState<number>(Number.NaN)
  const splitDistanceRef = useRef(splitDistance)
  const setSplitDistance = (value: number) => { splitDistanceRef.current = value; setSplitDistanceValue(value) }
  const [splitSortOrder, setSplitSortOrder] = useState<'asc' | 'desc'>('asc')

  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null)
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState<boolean>(false)
  const [newSegForm, setNewSegForm] = useState({
    code: '',
    startKm: Number.NaN,
    endKm: Number.NaN,
    roadWidthM: Number.NaN,
    laneCount: Number.NaN,
    surfaceMaterial: '',
    color: SEGMENT_COLORS[0]
  })
  const [splitModalSegment, setSplitModalSegment] = useState<SegmentItem | null>(null)
  const [customSplitKm, setCustomSplitKm] = useState<number>(Number.NaN)
  const splitInput = useRef({ segments, importedLengthKm, currentKmPoints, stationOriginKm, roadWidthM, splitSortOrder, syncMap, handleFitBounds, showToast })
  splitInput.current = { segments, importedLengthKm, currentKmPoints, stationOriginKm, roadWidthM, splitSortOrder, syncMap, handleFitBounds, showToast }

  const handleApplyAutoSplit = () => {
    const { segments, importedLengthKm, currentKmPoints, stationOriginKm, roadWidthM, splitSortOrder, syncMap, handleFitBounds, showToast } = splitInput.current
    const totalKm = importedLengthKm || (currentKmPoints.length >= 2 ? currentKmPoints[currentKmPoints.length - 1] - currentKmPoints[0] : 0.0)
    if (!Number.isFinite(totalKm) || totalKm <= 0) {
      showToast('Chưa có dữ liệu chiều dài tim tuyến để chia đoạn.')
      return
    }

    const dist = splitDistanceRef.current
    const startBaseKm = currentKmPoints.length > 0 ? currentKmPoints[0] : stationOriginKm
    if (!Number.isFinite(dist) || dist <= 0 || !Number.isFinite(startBaseKm)) {
      showToast('Cần cự ly chia đoạn và lý trình gốc có nguồn; chưa thay đổi bản nháp.')
      return
    }
    const validated = computeAutoSplitSegments(totalKm, startBaseKm, dist, roadWidthM, splitSortOrder, segments)
    if (!validated.length) { showToast('Phạm vi bản chỉnh chưa liên tục hoặc cự ly chia không hợp lệ; chưa thay đổi bản nháp.'); return }
    setSegments(validated)
    setSlabs([])
    setSelectedSegmentId(validated[0]?.id || null)

    syncMap(validated, validated[0]?.id || null)

    const distText = dist >= 1 ? `${dist.toFixed(2)} km` : `${(dist * 1000).toFixed(0)} m`
    showToast(`Đã chia tuyến thành ${validated.length} phân đoạn (${distText}/đoạn). Bản chỉnh cục bộ, chưa lưu máy chủ.`)
    handleFitBounds()
  }

  const handleClearAllSegments = () => {
    setSegments([])
    setSlabs([])
    setSelectedSegmentId(null)
    syncMap([], null)
    showToast('Đã xóa toàn bộ phân đoạn! Bạn có thể chọn cự ly và bấm "Áp dụng chia đoạn tự động" để chia lại.')
  }

  const handleSaveEditedSegment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSegment) return

    const start = parseFloat(Number(editingSegment.startKm).toFixed(3))
    const end = parseFloat(Number(editingSegment.endKm).toFixed(3))

    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updatedLength = parseFloat((end - start).toFixed(3))
    const updated: SegmentItem = {
      ...editingSegment,
      startKm: start,
      endKm: end,
      lengthKm: updatedLength,
      roadWidthM: Number(editingSegment.roadWidthM)
    }

    const updatedList = segments.map((s) => (s.id === updated.id ? updated : s)).sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    syncMap(validated, updated.id)

    const hasGap = validated.find((s: SegmentItem) => s.id === updated.id)?.hasGap
    if (hasGap) {
      showToast(`Đã chỉnh ${updated.code} trong bản cục bộ, chưa lưu máy chủ. Lưu ý: Phát hiện khoảng hở/chồng lấn với phân đoạn kề bên (GAP_WARNING). Bấm 'Nối tiếp giáp' để khép kín!`)
    } else {
      showToast(`Đã chỉnh cục bộ ${updated.code}, chưa lưu máy chủ (Km ${start.toFixed(3)} - Km ${end.toFixed(3)})`)
    }
    setEditingSegment(null)
  }

  const handleCreateNewSegment = (e: React.FormEvent) => {
    e.preventDefault()
    const start = parseFloat(Number(newSegForm.startKm).toFixed(3))
    const end = parseFloat(Number(newSegForm.endKm).toFixed(3))

    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const newSeg: SegmentItem = {
      id: `seg-${Date.now()}`,
      code: newSegForm.code || `Phân đoạn #${String(segments.length + 1).padStart(2, '0')}`,
      startKm: start,
      endKm: end,
      lengthKm: parseFloat((end - start).toFixed(3)),
      roadWidthM: Number(newSegForm.roadWidthM),
      status: 'VALID',
      statusText: 'HỢP LỆ',
      laneCount: newSegForm.laneCount,
      surfaceMaterial: newSegForm.surfaceMaterial,
      color: newSegForm.color || SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
    }

    const updatedList = [...segments, newSeg].sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    setSelectedSegmentId(newSeg.id)
    syncMap(validated, newSeg.id)

    setIsAddSegmentModalOpen(false)
    showToast(`Đã thêm mới ${newSeg.code} (${newSeg.lengthKm} km) vào bản chỉnh cục bộ, chưa lưu máy chủ!`)
  }

  const handleSplitSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!splitModalSegment) return

    const splitKm = parseFloat(Number(customSplitKm).toFixed(3))
    if (!Number.isFinite(splitKm) || splitKm <= splitModalSegment.startKm || splitKm >= splitModalSegment.endKm) {
      showToast(`Điểm tách phải nằm giữa Km ${splitModalSegment.startKm.toFixed(3)} và Km ${splitModalSegment.endKm.toFixed(3)}!`)
      return
    }

    const segIndex = segments.findIndex((s) => s.id === splitModalSegment.id)
    if (segIndex === -1) return

    const { segA, segB } = computeSplitSegmentPair(splitModalSegment, splitKm, segIndex)

    const updatedList = [
      ...segments.slice(0, segIndex),
      segA,
      segB,
      ...segments.slice(segIndex + 1)
    ]

    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    setSelectedSegmentId(segA.id)
    syncMap(validated, segA.id)

    setSplitModalSegment(null)
    showToast(`Đã tách ${splitModalSegment.code} thành 2 đoạn tại Km ${splitKm.toFixed(3)}!`)
  }

  const handleDeleteSegment = (segId: string) => {
    const updatedList = segments.filter((s) => s.id !== segId)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    const nextSelId = selectedSegmentId === segId ? (validated[0]?.id || null) : selectedSegmentId
    setSelectedSegmentId(nextSelId)
    syncMap(validated, nextSelId)

    if (validated.length === 0) {
      showToast('Đã xóa phân đoạn. Tuyến hiện chưa có phân đoạn, bạn có thể áp dụng chia đoạn tự động hoặc tạo lại!')
    } else {
      showToast('Đã xóa phân đoạn khỏi danh sách tuyến!')
    }
  }

  const handleUpdateSegmentWidth = (segId: string, widthM: number) => {
    const val = Math.max(1.0, Math.min(60.0, widthM))
    const updated = segments.map((s) => (s.id === segId ? { ...s, roadWidthM: val } : s))
    setSegments(updated)
    syncMap(updated, selectedSegmentId)
  }

  const handleSnapSegment = (segId: string) => {
    const idx = segments.findIndex((s) => s.id === segId)
    if (idx <= 0) return

    const prevSeg = segments[idx - 1]
    const curSeg = segments[idx]

    const newStart = prevSeg.endKm
    const newLen = parseFloat((curSeg.endKm - newStart).toFixed(3))

    if (newLen <= 0) {
      showToast('Lỗi: Không thể nối vì lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updated = segments.map((s) =>
      s.id === segId ? { ...s, startKm: newStart, lengthKm: newLen } : s
    )

    const validated = checkAndEnrichSegmentsContinuity(updated)
    setSegments(validated)
    syncMap(validated, curSeg.id)

    showToast(`Đã nối tiếp giáp khép kín tại Km ${newStart.toFixed(3)} giữa ${prevSeg.code} và ${curSeg.code}!`)
  }

  const handleSelectAllRoute = (coords: [number, number][]) => {
    setSelectedSegmentId('ALL')
    if (popupRef.current) popupRef.current.remove()
    if (mapRef.current) {
      if (coords.length > 0) {
        const bounds = new (window as any).maplibregl.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
        mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
      }
      syncMap(segments, 'ALL')
    }
    showToast('Đang chọn Toàn Tuyến: Hiển thị đầy đủ các phân đoạn và tổng số tấm BTXM')
  }

  const handleSelectSegment = (seg: SegmentItem) => {
    setSelectedSegmentId(seg.id)
    if (mapRef.current && currentCoords.length >= 2 && currentKmPoints.length === currentCoords.length) {
      const centerCoord = interpolateCoordAtKm((seg.startKm + seg.endKm) / 2, currentCoords, currentKmPoints)
      mapRef.current.flyTo({
        center: centerCoord,
        zoom: 13.2,
        speed: 1.2
      })
      syncMap(segments, seg.id)
    }
  }

  return {
    segments,
    setSegments,
    slabs,
    setSlabs,
    selectedSegmentId,
    setSelectedSegmentId,
    splitDistance,
    setSplitDistance,
    splitSortOrder,
    setSplitSortOrder,
    editingSegment,
    setEditingSegment,
    isAddSegmentModalOpen,
    setIsAddSegmentModalOpen,
    newSegForm,
    setNewSegForm,
    splitModalSegment,
    setSplitModalSegment,
    customSplitKm,
    setCustomSplitKm,
    handleApplyAutoSplit,
    handleClearAllSegments,
    handleSaveEditedSegment,
    handleCreateNewSegment,
    handleSplitSegmentSubmit,
    handleDeleteSegment,
    handleUpdateSegmentWidth,
    handleSnapSegment,
    handleSelectAllRoute,
    handleSelectSegment
  }
}
