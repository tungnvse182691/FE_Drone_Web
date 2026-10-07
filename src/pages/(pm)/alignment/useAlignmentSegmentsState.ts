import React, { useState } from 'react'
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
  roadWidthM,
  showToast,
  syncMap,
  mapRef,
  popupRef,
  handleFitBounds
}: UseAlignmentSegmentsStateParams) {
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments)
  const [slabs, setSlabs] = useState<SlabItem[]>(generateMockSlabs(initialSegments.length))
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>('seg-1')

  const [splitDistance, setSplitDistance] = useState<number>(5.0)
  const [splitSortOrder, setSplitSortOrder] = useState<'asc' | 'desc'>('asc')

  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null)
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState<boolean>(false)
  const [newSegForm, setNewSegForm] = useState({
    code: '',
    startKm: 1020.0,
    endKm: 1025.0,
    roadWidthM: 8.0,
    laneCount: 4,
    surfaceMaterial: 'Mặt BTN C12.5',
    color: SEGMENT_COLORS[0]
  })
  const [splitModalSegment, setSplitModalSegment] = useState<SegmentItem | null>(null)
  const [customSplitKm, setCustomSplitKm] = useState<number>(1022.5)

  const handleApplyAutoSplit = () => {
    const totalKm = importedLengthKm || (currentKmPoints[currentKmPoints.length - 1] - currentKmPoints[0]) || 25.0
    const startBaseKm = currentKmPoints[0] || 1020.0
    const dist = Math.max(0.01, Math.min(splitDistance, totalKm))

    const newSegments = computeAutoSplitSegments(totalKm, startBaseKm, dist, roadWidthM, splitSortOrder)
    const validated = checkAndEnrichSegmentsContinuity(newSegments)
    setSegments(validated)
    setSlabs(generateMockSlabs(validated.length))
    setSelectedSegmentId(validated[0]?.id || null)

    syncMap(validated, validated[0]?.id || null)

    const distText = dist >= 1 ? `${dist.toFixed(2)} km` : `${(dist * 1000).toFixed(0)} m`
    showToast(`Đã chia tuyến thành ${validated.length} phân đoạn (${distText}/đoạn). Tuyến đường hiển thị liên tục chuẩn thiết kế!`)
    handleFitBounds()
  }

  const handleSaveEditedSegment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSegment) return

    const start = parseFloat(Number(editingSegment.startKm).toFixed(3))
    const end = parseFloat(Number(editingSegment.endKm).toFixed(3))

    if (isNaN(start) || isNaN(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const updatedLength = parseFloat((end - start).toFixed(3))
    const updated: SegmentItem = {
      ...editingSegment,
      startKm: start,
      endKm: end,
      lengthKm: updatedLength,
      roadWidthM: Number(editingSegment.roadWidthM) || 8.0
    }

    const updatedList = segments.map((s) => (s.id === updated.id ? updated : s)).sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    syncMap(validated, updated.id)

    const hasGap = validated.find((s: SegmentItem) => s.id === updated.id)?.hasGap
    if (hasGap) {
      showToast(`Đã lưu ${updated.code}! Lưu ý: Phát hiện khoảng hở/chồng lấn với phân đoạn kề bên (GAP_WARNING). Bấm 'Nối tiếp giáp' để khép kín!`)
    } else {
      showToast(`Đã lưu cập nhật ${updated.code} (Km ${start.toFixed(3)} - Km ${end.toFixed(3)})`)
    }
    setEditingSegment(null)
  }

  const handleCreateNewSegment = (e: React.FormEvent) => {
    e.preventDefault()
    const start = parseFloat(Number(newSegForm.startKm).toFixed(3))
    const end = parseFloat(Number(newSegForm.endKm).toFixed(3))

    if (isNaN(start) || isNaN(end) || start >= end) {
      showToast('Lỗi: Lý trình kết thúc phải lớn hơn lý trình bắt đầu!')
      return
    }

    const newSeg: SegmentItem = {
      id: `seg-${Date.now()}`,
      code: newSegForm.code || `Phân đoạn #${String(segments.length + 1).padStart(2, '0')}`,
      startKm: start,
      endKm: end,
      lengthKm: parseFloat((end - start).toFixed(3)),
      roadWidthM: Number(newSegForm.roadWidthM) || 8.0,
      status: 'VALID',
      statusText: 'HỢP LỆ',
      laneCount: newSegForm.laneCount || 4,
      surfaceMaterial: newSegForm.surfaceMaterial || 'Mặt BTN C12.5',
      color: newSegForm.color || SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
    }

    const updatedList = [...segments, newSeg].sort((a, b) => a.startKm - b.startKm)
    const validated = checkAndEnrichSegmentsContinuity(updatedList)
    setSegments(validated)
    setSelectedSegmentId(newSeg.id)
    syncMap(validated, newSeg.id)

    setIsAddSegmentModalOpen(false)
    showToast(`Đã thêm mới ${newSeg.code} (${newSeg.lengthKm} km) vào tim tuyến!`)
  }

  const handleSplitSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!splitModalSegment) return

    const splitKm = parseFloat(Number(customSplitKm).toFixed(3))
    if (splitKm <= splitModalSegment.startKm || splitKm >= splitModalSegment.endKm) {
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
    if (mapRef.current) {
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
