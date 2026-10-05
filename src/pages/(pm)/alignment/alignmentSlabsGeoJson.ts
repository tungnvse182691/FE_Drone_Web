import { SegmentItem } from './types'
import { getSubLineCoordinates } from './alignmentGeometryHelpers'

export interface SlabsCustomConfig {
  slabLenM?: number
  thicknessCm?: number
  contractionSpacingM?: number
  expansionSpacingM?: number
  expansionGapMm?: number
}

// Helper sinh GeoJSON Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường
export function buildSlabsAndJointsGeoJSON(
  segList: SegmentItem[],
  coords: [number, number][],
  kmPts: number[],
  customCfg?: SlabsCustomConfig
): {
  slabsGeoJSON: GeoJSON.FeatureCollection
  jointsGeoJSON: GeoJSON.FeatureCollection
  edgesGeoJSON: GeoJSON.FeatureCollection
} {
  const slabLengthM = 5.0
  const slabThicknessCm = 26
  const contractionSpacingM = 5.0
  const expansionSpacingM = 50.0
  const expansionGapMm = 20

  const activeSlabLen = Math.max(1.0, customCfg?.slabLenM ?? slabLengthM)
  const activeThick = Math.max(10, customCfg?.thicknessCm ?? slabThicknessCm)
  const activeContraction = Math.max(1.0, customCfg?.contractionSpacingM ?? contractionSpacingM)
  const activeExpansion = Math.max(5.0, customCfg?.expansionSpacingM ?? expansionSpacingM)
  const activeGap = Math.max(5, customCfg?.expansionGapMm ?? expansionGapMm)

  const slabFeatures: GeoJSON.Feature[] = []
  const jointFeatures: GeoJSON.Feature[] = []
  const edgeFeatures: GeoJSON.Feature[] = []

  let globalSlabIndex = 1

  segList.forEach((seg, segIdx) => {
    const lineCoords = getSubLineCoordinates(seg.startKm, seg.endKm, coords, kmPts)
    if (!lineCoords || lineCoords.length < 2) return

    const latMid = lineCoords[0][1]
    const metersPerDegLat = 111320
    const metersPerDegLng = Math.max(1000, 111320 * Math.cos((latMid * Math.PI) / 180))

    const cumDists: number[] = [0]
    for (let i = 0; i < lineCoords.length - 1; i++) {
      const dx = (lineCoords[i + 1][0] - lineCoords[i][0]) * metersPerDegLng
      const dy = (lineCoords[i + 1][1] - lineCoords[i][1]) * metersPerDegLat
      cumDists.push(cumDists[i] + (Math.sqrt(dx * dx + dy * dy) || 0.001))
    }
    const totalLenM = cumDists[cumDists.length - 1]
    if (totalLenM <= 0.5) return

    const interpolateCoord = (targetD: number): [number, number] => {
      if (targetD <= 0) return lineCoords[0]
      if (targetD >= totalLenM) return lineCoords[lineCoords.length - 1]
      for (let i = 0; i < cumDists.length - 1; i++) {
        if (targetD >= cumDists[i] && targetD <= cumDists[i + 1]) {
          const span = cumDists[i + 1] - cumDists[i]
          if (span <= 1e-6) return lineCoords[i]
          const t = (targetD - cumDists[i]) / span
          const lng = lineCoords[i][0] + t * (lineCoords[i + 1][0] - lineCoords[i][0])
          const lat = lineCoords[i][1] + t * (lineCoords[i + 1][1] - lineCoords[i][1])
          return [Number(lng.toFixed(7)), Number(lat.toFixed(7))]
        }
      }
      return lineCoords[lineCoords.length - 1]
    }

    const prevSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.endKm - seg.startKm) < 0.005)
    const nextSeg = segList.find((s) => s.id !== seg.id && Math.abs(s.startKm - seg.endKm) < 0.005)
    const currentW = Math.max(2.0, Math.min(60.0, seg.roadWidthM || 8.0))
    const prevW = prevSeg ? (prevSeg.roadWidthM || 8.0) : currentW
    const nextW = nextSeg ? (nextSeg.roadWidthM || 8.0) : currentW

    const maxTaperDist = Math.min(30.0, totalLenM * 0.35)
    const needTaperStart = currentW > prevW
    const needTaperEnd = currentW > nextW

    const getWidthAtDist = (s: number): number => {
      if (needTaperStart && s < maxTaperDist) {
        const t = Math.max(0, Math.min(1, s / maxTaperDist))
        return prevW + (currentW - prevW) * (t * t * (3 - 2 * t))
      }
      if (needTaperEnd && s > totalLenM - maxTaperDist) {
        const t = Math.max(0, Math.min(1, (totalLenM - s) / maxTaperDist))
        return nextW + (currentW - nextW) * (t * t * (3 - 2 * t))
      }
      return currentW
    }

    const getNormalAtDist = (s: number): [number, number] => {
      const delta = 1.0
      const p1 = interpolateCoord(Math.max(0, s - delta))
      const p2 = interpolateCoord(Math.min(totalLenM, s + delta))
      const dx = (p2[0] - p1[0]) * metersPerDegLng
      const dy = (p2[1] - p1[1]) * metersPerDegLat
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      return [-dy / len, dx / len]
    }

    const slabLenM = activeSlabLen
    const maxSteps = Math.min(400, Math.floor(totalLenM / slabLenM))
    const expRatio = Math.max(1, Math.round(activeExpansion / slabLenM))

    for (let i = 0; i < maxSteps; i++) {
      const d0 = i * slabLenM
      const d1 = Math.min(totalLenM, (i + 1) * slabLenM)

      const c0 = interpolateCoord(d0)
      const c1 = interpolateCoord(d1)

      const w0 = getWidthAtDist(d0)
      const w1 = getWidthAtDist(d1)

      const norm0 = getNormalAtDist(d0)
      const norm1 = getNormalAtDist(d1)

      const h0 = w0 / 2.0
      const h1 = w1 / 2.0

      const left0: [number, number] = [
        Number((c0[0] + (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
        Number((c0[1] + (norm0[1] * h0) / metersPerDegLat).toFixed(7))
      ]
      const left1: [number, number] = [
        Number((c1[0] + (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
        Number((c1[1] + (norm1[1] * h1) / metersPerDegLat).toFixed(7))
      ]
      const right0: [number, number] = [
        Number((c0[0] - (norm0[0] * h0) / metersPerDegLng).toFixed(7)),
        Number((c0[1] - (norm0[1] * h0) / metersPerDegLat).toFixed(7))
      ]
      const right1: [number, number] = [
        Number((c1[0] - (norm1[0] * h1) / metersPerDegLng).toFixed(7)),
        Number((c1[1] - (norm1[1] * h1) / metersPerDegLat).toFixed(7))
      ]

      const slabNum = String(globalSlabIndex).padStart(3, '0')
      const kmPos = seg.startKm + d0 / 1000
      const floorKm = Math.floor(kmPos)
      const meters = Math.round((kmPos - floorKm) * 1000)
      const kmStation = `${floorKm}+${String(meters).padStart(3, '0')}`

      // 1. Tấm bê tông Làn Trái
      slabFeatures.push({
        type: 'Feature',
        properties: {
          id: `SLAB-${slabNum}L`,
          code: `SLAB-${slabNum}L`,
          lane: 'Làn Trái',
          segmentCode: seg.code,
          station: `Km ${kmStation}`,
          lengthM: Number(slabLenM.toFixed(1)),
          widthM: Number(h0.toFixed(1)),
          thicknessCm: activeThick,
          edgeOffset: `Mép Trái: -${h0.toFixed(1)}m`,
          status: i % 11 === 0 ? 'CRACKED' : 'GOOD'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[left0, c0, c1, left1, left0]]
        }
      })

      // 2. Tấm bê tông Làn Phải
      slabFeatures.push({
        type: 'Feature',
        properties: {
          id: `SLAB-${slabNum}R`,
          code: `SLAB-${slabNum}R`,
          lane: 'Làn Phải',
          segmentCode: seg.code,
          station: `Km ${kmStation}`,
          lengthM: Number(slabLenM.toFixed(1)),
          widthM: Number(h0.toFixed(1)),
          thicknessCm: activeThick,
          edgeOffset: `Mép Phải: +${h0.toFixed(1)}m`,
          status: i % 13 === 0 ? 'CRACKED' : 'GOOD'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[c0, right0, right1, c1, c0]]
        }
      })

      globalSlabIndex++

      // 3. Khe nối cắt ngang mặt đường tại d0
      const isExpansion = i % expRatio === 0
      jointFeatures.push({
        type: 'Feature',
        properties: {
          id: isExpansion ? `EJ-${segIdx + 1}-${Math.floor(i / expRatio) + 1}` : `CJ-${segIdx + 1}-${i + 1}`,
          isExpansion,
          name: isExpansion ? `Khe giãn nở nhiệt ${activeGap}mm (Expansion Joint)` : `Khe co giãn ${activeContraction}m (Contraction Joint)`,
          label: isExpansion ? `⚡ Khe giãn ${activeGap}mm` : `Khe co ${activeContraction}m`,
          station: `Km ${kmStation}`,
          roadWidthM: Number(w0.toFixed(1)),
          description: isExpansion
            ? `Khe giãn nở nhiệt ${activeGap}mm, cự ly ${activeExpansion}m, đệm bitum cao su đàn hồi & thanh truyền lực trượt bọc ống nhựa PVC`
            : `Khe co ngót ${activeContraction}m, cắt sâu 5cm, chèn mastic & thanh truyền lực dowel bar phi 25`
        },
        geometry: {
          type: 'LineString',
          coordinates: [left0, right0]
        }
      })

      // 4. Nhãn thông số 2 mép đường & đường gióng kích thước
      if (isExpansion || i === 0 || i === 4) {
        edgeFeatures.push({
          type: 'Feature',
          properties: {
            isDimensionLine: true,
            label: `W = ${w0.toFixed(1)}m`
          },
          geometry: {
            type: 'LineString',
            coordinates: [left0, right0]
          }
        })

        edgeFeatures.push({
          type: 'Feature',
          properties: {
            side: 'LEFT',
            label: `Mép Trái: -${h0.toFixed(1)}m`,
            widthM: Number(h0.toFixed(1))
          },
          geometry: {
            type: 'Point',
            coordinates: left0
          }
        })

        edgeFeatures.push({
          type: 'Feature',
          properties: {
            side: 'RIGHT',
            label: `Mép Phải: +${h0.toFixed(1)}m`,
            widthM: Number(h0.toFixed(1))
          },
          geometry: {
            type: 'Point',
            coordinates: right0
          }
        })

        if (isExpansion || i === 0) {
          edgeFeatures.push({
            type: 'Feature',
            properties: {
              side: 'CENTER',
              label: `Bề rộng W = ${w0.toFixed(1)}m (Trái -${h0.toFixed(1)}m | Phải +${h0.toFixed(1)}m)`,
              widthM: Number(w0.toFixed(1))
            },
            geometry: {
              type: 'Point',
              coordinates: c0
            }
          })
        }
      }
    }
  })

  return {
    slabsGeoJSON: { type: 'FeatureCollection', features: slabFeatures },
    jointsGeoJSON: { type: 'FeatureCollection', features: jointFeatures },
    edgesGeoJSON: { type: 'FeatureCollection', features: edgeFeatures }
  }
}
