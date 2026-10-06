import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './data'

export function computeAutoSplitSegments(
  totalKm: number,
  startBaseKm: number,
  dist: number,
  roadWidthM: number,
  splitSortOrder: 'asc' | 'desc'
): SegmentItem[] {
  const newSegments: SegmentItem[] = []
  let currentKm = startBaseKm
  let idx = 1

  while (currentKm < startBaseKm + totalKm - 0.001) {
    const nextKm = Math.min(currentKm + dist, startBaseKm + totalKm)
    const len = parseFloat((nextKm - currentKm).toFixed(3))

    newSegments.push({
      id: `seg-${idx}`,
      code: `Phân đoạn #${String(idx).padStart(2, '0')}`,
      startKm: parseFloat(currentKm.toFixed(3)),
      endKm: parseFloat(nextKm.toFixed(3)),
      lengthKm: len,
      roadWidthM: roadWidthM || 8.0,
      status: 'VALID',
      statusText: 'HỢP LỆ (Valid)',
      laneCount: 4,
      surfaceMaterial: idx % 2 === 0 ? 'Mặt BTN C19' : 'Mặt BTN C12.5',
      color: SEGMENT_COLORS[(idx - 1) % SEGMENT_COLORS.length]
    })

    currentKm = nextKm
    idx++
  }

  if (splitSortOrder === 'desc') {
    newSegments.reverse()
  }

  return newSegments
}

export function computeSplitSegmentPair(
  splitModalSegment: SegmentItem,
  splitKm: number,
  segIndex: number
): { segA: SegmentItem; segB: SegmentItem } {
  const segA: SegmentItem = {
    ...splitModalSegment,
    id: `seg-${Date.now()}-A`,
    code: `${splitModalSegment.code}A`,
    startKm: splitModalSegment.startKm,
    endKm: splitKm,
    lengthKm: parseFloat((splitKm - splitModalSegment.startKm).toFixed(3)),
    roadWidthM: splitModalSegment.roadWidthM || 8.0,
    color: splitModalSegment.color
  }

  const segB: SegmentItem = {
    ...splitModalSegment,
    id: `seg-${Date.now()}-B`,
    code: `${splitModalSegment.code}B`,
    startKm: splitKm,
    endKm: splitModalSegment.endKm,
    lengthKm: parseFloat((splitModalSegment.endKm - splitKm).toFixed(3)),
    roadWidthM: splitModalSegment.roadWidthM || 8.0,
    color: SEGMENT_COLORS[(segIndex + 1) % SEGMENT_COLORS.length]
  }

  return { segA, segB }
}
