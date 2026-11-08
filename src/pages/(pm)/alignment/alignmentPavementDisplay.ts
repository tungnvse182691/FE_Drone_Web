import type { buildSlabsAndJointsGeoJSON } from './data'

export type PavementPreview = ReturnType<typeof buildSlabsAndJointsGeoJSON>

// Count source features, never rendered tiles (duplicates) or label points.
export function summarizePavementPreview(preview?: PavementPreview, segmentId?: string | null, branch = false) {
  const fallback = branch ? ['chưa có preview pavement tuyến nhánh'] : segmentId === null ? ['chưa chọn được phân đoạn'] : !preview ? ['chưa có dữ liệu geometry preview'] : []
  const issues = (preview?.issues || []).filter(issue => !issue.segmentId || segmentId === undefined || issue.segmentId === segmentId)
  const scoped = (feature: GeoJSON.Feature) => !feature.properties?.branchId && (segmentId === undefined || feature.properties?.segmentId === segmentId)
  const slabs = preview?.slabsGeoJSON.features.filter(feature => feature.geometry.type === 'Polygon' && scoped(feature)) || []
  const joints = preview?.jointsGeoJSON.features.filter(feature => ['LineString', 'Polygon'].includes(feature.geometry.type) && scoped(feature)) || []
  const messages = (kind: 'slab' | 'contraction' | 'expansion') => [...fallback, ...issues.filter(issue => issue.kind === 'shared' || issue.kind === kind).map(issue => issue.message)]
  const slabMissing = messages('slab'), contractionMissing = messages('contraction'), expansionMissing = messages('expansion')
  const range = (field: string, unit: string) => {
    const values = slabs.map(feature => feature.properties?.[field]).filter(value => typeof value === 'number' && Number.isFinite(value))
    if (values.length !== slabs.length || !values.length) return 'Chưa có dữ liệu'
    const min = values.reduce((a, b) => Math.min(a, b), Infinity), max = values.reduce((a, b) => Math.max(a, b), -Infinity)
    const format = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 6 })
    return format(min) === format(max) ? `${format(min)}${unit}` : `${format(min)}–${format(max)}${unit}`
  }
  const thickness = slabs.every(feature => Number.isFinite(feature.properties?.thicknessCm) && feature.properties!.thicknessCm > 0) ? range('thicknessCm', 'cm') : 'Chưa có chiều dày'
  const dimensions = new Set(slabs.map(feature => JSON.stringify([feature.properties?.lengthM, feature.properties?.widthM, feature.properties?.thicknessCm].map(value => typeof value === 'number' ? value.toFixed(6) : value))))
  return {
    slabCount: slabMissing.length ? null : slabs.length,
    contractionCount: contractionMissing.length ? null : joints.filter(feature => feature.properties?.isExpansion === false).length,
    expansionCount: expansionMissing.length ? null : joints.filter(feature => feature.properties?.isExpansion === true).length,
    slabMissing, contractionMissing, expansionMissing,
    dimensions: slabMissing.length ? 'Chưa đủ dữ liệu' : !slabs.length ? 'Không có tấm trong phạm vi' : dimensions.size === 1
      ? `${range('lengthM', 'm')} × ${range('widthM', 'm')} · Dày: ${thickness}`
      : `Nhiều kích thước: dài ${range('lengthM', 'm')}, rộng ${range('widthM', 'm')}, dày: ${thickness} (gồm phần dư/chuyển tiếp)`
  }
}
