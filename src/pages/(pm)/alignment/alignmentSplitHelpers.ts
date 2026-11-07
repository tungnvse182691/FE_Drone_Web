import { SegmentItem } from './types'
import { SEGMENT_COLORS } from './data'

export function computeAutoSplitSegments(
  totalKm: number,
  startBaseKm: number,
  dist: number,
  roadWidthM: number,
  splitSortOrder: 'asc' | 'desc',
  currentSegments: SegmentItem[] = []
): SegmentItem[] {
  if (![totalKm, startBaseKm, dist].every(Number.isFinite) || totalKm <= 0 || dist <= 0) return []
  const newSegments: SegmentItem[] = []
  const profile = [...currentSegments].sort((a, b) => a.startKm - b.startKm)
  const start = profile[0]?.startKm ?? startBaseKm
  const end = profile[profile.length - 1]?.endKm ?? startBaseKm + totalKm
  if (![start, end].every(Number.isFinite) || end <= start || Math.abs(start - startBaseKm) > 1e-10 || Math.abs(end - startBaseKm - totalKm) > 1e-10 ||
      profile.some((segment, index) => !Number.isFinite(segment.startKm) || !Number.isFinite(segment.endKm) || segment.endKm <= segment.startKm || index > 0 && segment.startKm !== profile[index - 1].endKm)) return []
  const count = Math.ceil((end - start) / dist)
  if (count > 100000) return []
  const cuts = new Set([start, end, ...profile.flatMap(segment => [segment.startKm, segment.endKm])])
  const stepMeters = dist * 1000
  for (let i = 1; i < count; i++) {
    const cut = start + i * stepMeters / 1000
    if (cut > start && cut < end) cuts.add(cut)
  }
  const boundaries = [...cuts].sort((a, b) => a - b)
  for (let i = 1; i < boundaries.length; i++) {
    const currentKm = boundaries[i - 1], nextKm = boundaries[i], idx = i
    const source = profile.find(segment => currentKm >= segment.startKm && nextKm <= segment.endKm)
    newSegments.push({
      id: `seg-${idx}`,
      code: `Phân đoạn #${String(idx).padStart(2, '0')}`,
      startKm: currentKm,
      endKm: nextKm,
      lengthKm: nextKm - currentKm,
      roadWidthM: source ? source.roadWidthM : roadWidthM,
      status: 'VALID',
      statusText: 'BẢN CHỈNH CHƯA LƯU',
      laneCount: source?.laneCount ?? Number.NaN,
      surfaceMaterial: source?.surfaceMaterial ?? '',
      color: SEGMENT_COLORS[(idx - 1) % SEGMENT_COLORS.length]
    })
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
    roadWidthM: splitModalSegment.roadWidthM,
    color: splitModalSegment.color
  }

  const segB: SegmentItem = {
    ...splitModalSegment,
    id: `seg-${Date.now()}-B`,
    code: `${splitModalSegment.code}B`,
    startKm: splitKm,
    endKm: splitModalSegment.endKm,
    lengthKm: parseFloat((splitModalSegment.endKm - splitKm).toFixed(3)),
    roadWidthM: splitModalSegment.roadWidthM,
    color: SEGMENT_COLORS[(segIndex + 1) % SEGMENT_COLORS.length]
  }

  return { segA, segB }
}
