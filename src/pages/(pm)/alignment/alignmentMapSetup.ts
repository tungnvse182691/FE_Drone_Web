import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import {
  buildSegmentsSurfaceGeoJSON,
  buildSegmentsGeoJSON,
  buildPlanningCorridorGeoJSON,
  buildSlabsAndJointsGeoJSON,
  buildBranchesGeoJSON,
  buildBranchesSurfaceGeoJSON,
  SlabsCustomConfig
} from './data'
import { setupAlignmentSourcesAndLayers } from './alignmentMapLayers'
import { setupAlignmentMapInteractions } from './alignmentMapInteractions'
import { renderAlignmentMarkers } from './alignmentMapMarkers'

export { renderAlignmentMarkers }

export interface InitMapLayersOptions {
  map: maplibregl.Map
  segments: SegmentItem[]
  currentCoords: [number, number][]
  currentKmPoints: number[]
  selectedSegmentId: string | null
  popupRef: React.RefObject<maplibregl.Popup | null>
  markersRef: React.RefObject<maplibregl.Marker[]>
  onSelectSegmentId: (id: string, branchId?: string) => void
  showToast: (msg: string) => void
  branches?: any[]
  isPickingRef?: React.RefObject<boolean>
  onSelectSegmentRef?: React.RefObject<((id: string, branchId?: string, feature?: any) => void) | null>
}

export function initAlignmentMapLayers({
  map,
  segments,
  currentCoords,
  currentKmPoints,
  selectedSegmentId,
  popupRef,
  markersRef,
  onSelectSegmentId,
  showToast,
  branches = [],
  isPickingRef,
  onSelectSegmentRef
}: InitMapLayersOptions) {
  // 1. Setup GeoJSON sources & visualization layers
  setupAlignmentSourcesAndLayers(map, segments, currentCoords, currentKmPoints, selectedSegmentId, branches)

  // 2. Setup map interaction handlers (clicks, hovers, popups)
  setupAlignmentMapInteractions(map, popupRef, onSelectSegmentId, isPickingRef, onSelectSegmentRef)

  // 3. Render initial markers (Cả trục chính lẫn các tuyến nhánh)
  renderAlignmentMarkers(map, segments, currentCoords, currentKmPoints, markersRef, onSelectSegmentId, showToast, branches)

  // 4. Đồng bộ nhánh ban đầu (Cả bề mặt dải đường Polygon lẫn tim tuyến)
  const branchSurfSrc = map.getSource('branches-surface-source') as maplibregl.GeoJSONSource
  if (branchSurfSrc && branches.length > 0) {
    branchSurfSrc.setData(buildBranchesSurfaceGeoJSON(branches, currentCoords, currentKmPoints, selectedSegmentId))
  }

  const branchSrc = map.getSource('branches-source') as maplibregl.GeoJSONSource
  if (branchSrc && branches.length > 0) {
    branchSrc.setData(buildBranchesGeoJSON(branches, currentCoords, currentKmPoints))
  }
}

// Cập nhật đồng bộ tức thời (0 delay) lên tất cả các lớp MapLibre
export function syncMapDataDirect(
  map: maplibregl.Map | null,
  updatedSegs: SegmentItem[],
  selId: string | null,
  coords: [number, number][],
  kmPts: number[],
  markersRef: React.RefObject<maplibregl.Marker[]>,
  onSelectSegmentId: (id: string) => void,
  showToast: (msg: string) => void,
  customCfg?: SlabsCustomConfig,
  branches: any[] = []
) {
  if (!map) return

  // Đảm bảo các nguồn và lớp luôn tồn tại trước khi cập nhật dữ liệu
  if (!map.getSource('segments-source') || !map.getSource('segments-surface-source')) {
    try {
      setupAlignmentSourcesAndLayers(map, updatedSegs, coords, kmPts, selId, branches)
    } catch (e) {
      console.warn('setupAlignmentSourcesAndLayers warning:', e)
    }
  }

  try {
    const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
    if (segSrc) {
      segSrc.setData(buildSegmentsGeoJSON(updatedSegs, coords, kmPts, selId))
    }
  } catch (err) {
    console.warn('segments-source setData warning:', err)
  }

  try {
    const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
    if (surfSrc) {
      surfSrc.setData(buildSegmentsSurfaceGeoJSON(updatedSegs, coords, kmPts, selId))
    }
  } catch (err) {
    console.warn('segments-surface-source setData warning:', err)
  }

  try {
    const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
    if (planSrc) {
      planSrc.setData(buildPlanningCorridorGeoJSON(coords))
    }
  } catch (err) {
    console.warn('planning-corridor-source setData warning:', err)
  }

  try {
    const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
      updatedSegs,
      coords,
      kmPts,
      customCfg,
      branches
    )
    const slabsSrc = map.getSource('slabs-source') as maplibregl.GeoJSONSource
    if (slabsSrc) slabsSrc.setData(slabsGeoJSON)

    const jointsSrc = map.getSource('joints-source') as maplibregl.GeoJSONSource
    if (jointsSrc) jointsSrc.setData(jointsGeoJSON)

    const edgesSrc = map.getSource('edges-source') as maplibregl.GeoJSONSource
    if (edgesSrc) edgesSrc.setData(edgesGeoJSON)
  } catch (err) {
    console.warn('slabs/joints setData warning:', err)
  }

  try {
    // Đồng bộ bề mặt dải mặt đường Polygon cho tuyến nhánh (Đồng nhất kích cỡ)
    const branchSurfSrc = map.getSource('branches-surface-source') as maplibregl.GeoJSONSource
    if (branchSurfSrc) {
      branchSurfSrc.setData(buildBranchesSurfaceGeoJSON(branches, coords, kmPts, selId))
    }

    // Đồng bộ lớp tim tuyến nhánh (vạch kẻ trung tâm)
    const branchSrc = map.getSource('branches-source') as maplibregl.GeoJSONSource
    if (branchSrc) {
      branchSrc.setData(buildBranchesGeoJSON(branches, coords, kmPts))
    }
  } catch (err) {
    console.warn('branches setData warning:', err)
  }

  try {
    renderAlignmentMarkers(map, updatedSegs, coords, kmPts, markersRef, onSelectSegmentId, showToast, branches)
    map.triggerRepaint()
  } catch (err) {
    console.warn('renderAlignmentMarkers warning:', err)
  }
}
