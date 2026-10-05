import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import {
  buildSegmentsSurfaceGeoJSON,
  buildSegmentsGeoJSON,
  buildPlanningCorridorGeoJSON
} from './alignmentGeoJson'
import { buildSlabsAndJointsGeoJSON, SlabsCustomConfig } from './alignmentSlabsGeoJson'
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
  onSelectSegmentId: (id: string) => void
  showToast: (msg: string) => void
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
  showToast
}: InitMapLayersOptions) {
  // 1. Setup GeoJSON sources & visualization layers
  setupAlignmentSourcesAndLayers(map, segments, currentCoords, currentKmPoints, selectedSegmentId)

  // 2. Setup map interaction handlers (clicks, hovers, popups)
  setupAlignmentMapInteractions(map, popupRef, onSelectSegmentId)

  // 3. Render initial markers
  renderAlignmentMarkers(map, segments, currentCoords, currentKmPoints, markersRef, onSelectSegmentId, showToast)
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
  customCfg?: SlabsCustomConfig
) {
  if (!map) return
  try {
    const surfSrc = map.getSource('segments-surface-source') as maplibregl.GeoJSONSource
    if (surfSrc) {
      surfSrc.setData(buildSegmentsSurfaceGeoJSON(updatedSegs, coords, kmPts, selId))
    }
    const segSrc = map.getSource('segments-source') as maplibregl.GeoJSONSource
    if (segSrc) {
      segSrc.setData(buildSegmentsGeoJSON(updatedSegs, coords, kmPts, selId))
    }
    const planSrc = map.getSource('planning-corridor-source') as maplibregl.GeoJSONSource
    if (planSrc) {
      planSrc.setData(buildPlanningCorridorGeoJSON(coords))
    }

    const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
      updatedSegs,
      coords,
      kmPts,
      customCfg
    )
    const slabsSrc = map.getSource('slabs-source') as maplibregl.GeoJSONSource
    if (slabsSrc) slabsSrc.setData(slabsGeoJSON)

    const jointsSrc = map.getSource('joints-source') as maplibregl.GeoJSONSource
    if (jointsSrc) jointsSrc.setData(jointsGeoJSON)

    const edgesSrc = map.getSource('edges-source') as maplibregl.GeoJSONSource
    if (edgesSrc) edgesSrc.setData(edgesGeoJSON)

    renderAlignmentMarkers(map, updatedSegs, coords, kmPts, markersRef, onSelectSegmentId, showToast)
    map.triggerRepaint()
  } catch (err) {
    console.warn('syncMapDataDirect warning:', err)
  }
}
