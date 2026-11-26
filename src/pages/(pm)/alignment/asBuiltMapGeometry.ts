import { utm48NToWgs84, wgs84ToUtm48N } from '../../../api/services/alignmentService'
import type { AsBuiltSlabInput, PavementLayoutView, PavementSegmentRange } from '../../../api/services/pavementService'
import { validateAsBuiltSlabs } from '../../../api/services/pavementCommands'

export type FootprintPoint = { x: number; y: number }
export function displayPoint(point: FootprintPoint, srid: number): [number, number] {
  if (srid !== 32648) throw new Error(`Chưa hỗ trợ chỉnh đường bao EPSG:${srid}; không tự đoán CRS.`)
  if (![point.x, point.y].every(Number.isFinite)) throw new Error('Đỉnh engineering không hợp lệ.')
  const value = utm48NToWgs84(point.x, point.y)
  if (!value.every(Number.isFinite) || Math.abs(value[0]) > 180 || Math.abs(value[1]) > 90) throw new Error('Không chuyển được đỉnh sang tọa độ hiển thị.')
  return value
}
export function engineeringPoint(lng: number, lat: number, srid: number): FootprintPoint {
  if (srid !== 32648) throw new Error(`Chưa hỗ trợ chỉnh đường bao EPSG:${srid}; không tự đoán CRS.`)
  if (![lng, lat].every(Number.isFinite) || lng < 102 || lng > 108 || lat < 0 || lat >= 84) throw new Error('Tọa độ nằm ngoài miền adapter EPSG:32648 đã hỗ trợ (102–108°E, 0–84°N).')
  const point = wgs84ToUtm48N(lng, lat)
  if (![point.x, point.y].every(Number.isFinite)) throw new Error('Không chuyển được tọa độ về engineering CRS.')
  return point
}
export function closeFootprint(points: FootprintPoint[]): FootprintPoint[] {
  if (points.length < 3 || points.length > 8194 || points.some(p => !p || ![p.x,p.y].every(Number.isFinite))) throw new Error('Đường bao cần 3–8194 đỉnh hữu hạn trước khi khép vòng.')
  return [...points.map(p => ({ ...p })), { ...points[0] }]
}
export function moveFootprintVertex(points: FootprintPoint[], index: number, lng: number, lat: number, srid: number): FootprintPoint[] {
  if (points.length < 4 || points.some(p=>!p||![p.x,p.y].every(Number.isFinite)) || points[0].x!==points[points.length-1].x || points[0].y!==points[points.length-1].y || index < 0 || index >= points.length - 1 || !Number.isInteger(index)) throw new Error('Không tìm thấy đỉnh của vòng kín hợp lệ.')
  const next = points.map(p => ({ ...p })); next[index] = engineeringPoint(lng, lat, srid)
  if (index === 0) next[next.length - 1] = { ...next[0] }
  return next
}
export function confirmDesignSelection(source: PavementLayoutView, keys: string[], actual: AsBuiltSlabInput[], captureSource: string) {
  if (source.kind !== 'PLANNED') throw new Error('Chỉ xác nhận từ PLANNED nguồn đã đọc.')
  if (!captureSource.trim() || captureSource.length > 80) throw new Error('Nhập nguồn ghi nhận chung, tối đa 80 ký tự.')
  const unique = new Set(keys), byKey = new Map(source.geometry.slabs.map(s => [s.key,s]))
  if (!unique.size) throw new Error('Chưa chọn tấm thiết kế.')
  if (unique.size !== keys.length || source.geometry.slabs.length !== byKey.size || keys.some(k => !byKey.has(k))) throw new Error('Lựa chọn trùng hoặc không thuộc snapshot nguồn.')
  const actualKeys=new Set(actual.map(s=>s.key)),actualSequences=new Set(actual.filter(s=>s.plannedSequence!=null).map(s=>s.plannedSequence))
  const eligible = keys.map(k => byKey.get(k)!).filter(s => !actualKeys.has(s.key) && (s.plannedSequence==null || !actualSequences.has(s.plannedSequence)))
  if (actual.length + eligible.length > 10000) throw new Error('Vượt giới hạn 10000 tấm; không cắt ngầm lựa chọn.')
  if (eligible.some(s=>!Array.isArray(s.footprint)||s.footprint.length<4||s.footprint.length>8195)) throw new Error('Tấm nguồn vượt giới hạn 4–8195 điểm footprint; không sao chép một phần.')
  if (actual.reduce((n,s) => n+s.footprint.length,0) + eligible.reduce((n,s) => n+s.footprint.length,0) > 1000000) throw new Error('Vượt giới hạn tổng 1000000 đỉnh; không cắt ngầm lựa chọn.')
  const added: AsBuiltSlabInput[] = eligible.map(s => ({ key:s.key, plannedSequence:s.plannedSequence, footprint:s.footprint.map(p => ({...p})), lengthMeters:s.lengthMeters, widthMeters:s.widthMeters, source:captureSource }))
  const result = added.length ? [...actual,...added] : actual
  validateAsBuiltSlabs(result, source)
  return { slabs:result, added:added.length, skipped:keys.length-added.length }
}
export function designKeysInSegment(source: PavementLayoutView, range: PavementSegmentRange) {
  const cells = source.geometry.plan?.cells
  if (!cells?.length || !range.id || ![range.fromOffsetMeters,range.toOffsetMeters].every(Number.isFinite) || range.toOffsetMeters <= range.fromOffsetMeters) throw new Error('Thiếu quan hệ cell/phân đoạn từ server; không suy lý trình từ WGS84.')
  const bySequence = new Map(cells.map(c => [c.sequence,c]))
  if (bySequence.size !== cells.length || cells.length!==source.geometry.slabs.length || new Set(source.geometry.slabs.map(s=>s.plannedSequence)).size!==source.geometry.slabs.length || source.geometry.slabs.some(s => s.plannedSequence == null || !bySequence.has(s.plannedSequence))) throw new Error('Không đối chiếu được sequence tấm với cell server.')
  const keys:string[]=[];let crossing=0
  for (const s of source.geometry.slabs) {
    const c=bySequence.get(s.plannedSequence!)!
    if (![c.fromOffsetMeters,c.toOffsetMeters].every(Number.isFinite) || c.toOffsetMeters <= c.fromOffsetMeters) throw new Error('Cell server thiếu offset hợp lệ.')
    if (c.fromOffsetMeters >= range.fromOffsetMeters && c.toOffsetMeters <= range.toOffsetMeters) keys.push(s.key)
    else if (c.fromOffsetMeters < range.toOffsetMeters && c.toOffsetMeters > range.fromOffsetMeters) crossing++
  }
  if (keys.length > 10000) throw new Error('Nhóm phân đoạn vượt 10000 tấm; không cắt ngầm lựa chọn.')
  return { keys, crossing }
}
