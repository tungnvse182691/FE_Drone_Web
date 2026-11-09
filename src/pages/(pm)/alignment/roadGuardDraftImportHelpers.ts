import type { GeometryDraftInput, GeometryDraftView, GeometryPoint } from '../../../api/services/alignmentService'

export type RoadGuardCoordinatesDraft = GeometryDraftInput & {
  sourceKind: 'COORDINATES'
  coordinates: GeometryPoint[]
  changeReason: string
}

export class RoadGuardDraftValidationError extends Error {}

export type CoordinateDraftSource = Omit<RoadGuardCoordinatesDraft, 'changeReason'> & { changeReason?: string | null }

export function restoreCoordinateDraft(draft: GeometryDraftView): CoordinateDraftSource {
  const source = { sourceKind: draft.sourceKind, sourceCrs: draft.sourceCrs, coordinates: draft.editedCoordinates ?? draft.originalCoordinates,
    stationOriginMeters: draft.stationOriginMeters, widthProfile: draft.widthProfile, surveyWidthMeters: draft.surveyWidthMeters,
    roadCode: draft.roadCode, roadName: draft.roadName }
  validateCoordinateDraft(source, false)
  return source as CoordinateDraftSource
}

// File checks only; project CRS compatibility and server geometry validation are separate.
export function parseRoadGuardDraftJson(text: string): RoadGuardCoordinatesDraft {
  let draft: any
  try { draft = JSON.parse(text) } catch { throw new RoadGuardDraftValidationError('Tệp RoadGuard Draft sai cú pháp JSON.') }
  validateCoordinateDraft(draft, true)
  return draft
}

export function validateCoordinateDraft(draft: any, requireReason: boolean): void {
  const fail = (field: string, message: string): never => { throw new RoadGuardDraftValidationError(`${field}: ${message}`) }
  const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) fail('Draft', 'phải là đối tượng JSON, không phải GeoJSON.')
  for (const field of ['roadCode', 'roadName']) {
    if (typeof draft[field] !== 'string' || !draft[field].trim()) fail(field, 'cần tên tuyến có nguồn trong JSON hoặc GET draft.')
  }
  if (draft.sourceKind !== 'COORDINATES') fail('sourceKind', 'phải là COORDINATES.')
  if (draft.sourceCrs !== 32648 && draft.sourceCrs !== 32649) fail('sourceCrs', 'chỉ hỗ trợ 32648 hoặc 32649.')
  for (const field of ['sourceFileId', 'trackIndex', 'trackSegmentIndex']) {
    if (draft[field] != null) fail(field, 'phải để trống với nguồn COORDINATES.')
  }
  if (!Array.isArray(draft.coordinates) || draft.coordinates.length < 2 || draft.coordinates.length > 100000) fail('coordinates', 'cần 2–100000 điểm.')
  let length = 0
  for (let i = 0; i < draft.coordinates.length; i++) {
    const point = draft.coordinates[i]
    for (const axis of ['x', 'y']) {
      if (!point || Array.isArray(point) || !finite(point[axis])) fail(`coordinates[${i}].${axis}`, 'phải là số hữu hạn.')
    }
    if (i > 0) {
      const previous = draft.coordinates[i - 1]
      const dx = point.x - previous.x, dy = point.y - previous.y
      if (dx === 0 && dy === 0) fail(`coordinates[${i}]`, 'không được trùng điểm liền trước.')
      length += Math.sqrt(dx * dx + dy * dy)
    }
  }
  if (!Number.isFinite(length) || length <= 0) fail('coordinates', 'chiều dài tuyến phải hữu hạn và lớn hơn 0.')
  if (!finite(draft.stationOriginMeters) || !Number.isFinite(draft.stationOriginMeters + length)) fail('stationOriginMeters', 'lý trình gốc và cuối tuyến phải hữu hạn.')
  if (requireReason && (typeof draft.changeReason !== 'string' || !draft.changeReason.trim())) fail('changeReason', 'lý do không được để trống.')
  if (!finite(draft.surveyWidthMeters) || draft.surveyWidthMeters <= 0) fail('surveyWidthMeters', 'phải là số hữu hạn lớn hơn 0.')
  if (!Array.isArray(draft.widthProfile) || !draft.widthProfile.length) fail('widthProfile', 'cần ít nhất một khoảng bề rộng.')
  let end = 0
  for (let i = 0; i < draft.widthProfile.length; i++) {
    const width = draft.widthProfile[i], field = `widthProfile[${i}]`
    if (!width || typeof width !== 'object' || Array.isArray(width)) fail(field, 'phải là đối tượng khoảng bề rộng.')
    if (!finite(width.fromOffsetMeters) || width.fromOffsetMeters !== end) fail(`${field}.fromOffsetMeters`, 'phải nối chính xác với khoảng trước, bắt đầu từ 0; không hở hoặc chồng lấn.')
    if (!finite(width.toOffsetMeters) || width.toOffsetMeters <= end || width.toOffsetMeters > length) fail(`${field}.toOffsetMeters`, 'phải lớn hơn đầu khoảng và không vượt chiều dài tuyến.')
    if (!finite(width.widthMeters) || width.widthMeters <= 0 || width.widthMeters > draft.surveyWidthMeters) fail(`${field}.widthMeters`, 'phải lớn hơn 0 và không vượt surveyWidthMeters.')
    end = width.toOffsetMeters
  }
  if (Math.abs(end - length) > 1e-7) fail('widthProfile', 'điểm kết thúc phải phủ chiều dài tuyến (sai số tối đa 1e-7 m).')
}
