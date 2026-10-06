import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import {
  buildSegmentsSurfaceGeoJSON,
  buildSegmentsGeoJSON,
  buildPlanningCorridorGeoJSON,
  buildSlabsAndJointsGeoJSON
} from './data'
import { setupSlabsAndJointsLayers } from './alignmentSlabLayers'

export function setupAlignmentSourcesAndLayers(
  map: maplibregl.Map,
  segments: SegmentItem[],
  currentCoords: [number, number][],
  currentKmPoints: number[],
  selectedSegmentId: string | null
) {
  // 0. Thêm GeoJSON Source cho bề mặt dải mặt đường (Polygon)
  if (!map.getSource('segments-surface-source')) {
    map.addSource('segments-surface-source', {
      type: 'geojson',
      data: buildSegmentsSurfaceGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
    })
  }

  // 1. Thêm GeoJSON Source cho tim tuyến các phân đoạn (LineString)
  if (!map.getSource('segments-source')) {
    map.addSource('segments-source', {
      type: 'geojson',
      data: buildSegmentsGeoJSON(segments, currentCoords, currentKmPoints, selectedSegmentId)
    })
  }

  // 2. Thêm GeoJSON Source cho hành lang quy hoạch 30m
  if (!map.getSource('planning-corridor-source')) {
    map.addSource('planning-corridor-source', {
      type: 'geojson',
      data: buildPlanningCorridorGeoJSON(currentCoords)
    })
  }

  // 2b. Thêm GeoJSON Sources cho Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường
  const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
    segments,
    currentCoords,
    currentKmPoints
  )

  if (!map.getSource('slabs-source')) {
    map.addSource('slabs-source', {
      type: 'geojson',
      data: slabsGeoJSON
    })
  }

  if (!map.getSource('joints-source')) {
    map.addSource('joints-source', {
      type: 'geojson',
      data: jointsGeoJSON
    })
  }

  if (!map.getSource('edges-source')) {
    map.addSource('edges-source', {
      type: 'geojson',
      data: edgesGeoJSON
    })
  }

  // 3. Layers: Hành lang quy hoạch
  if (!map.getLayer('planning-corridor-layer')) {
    map.addLayer({
      id: 'planning-corridor-layer',
      type: 'fill',
      source: 'planning-corridor-source',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': '#F59E0B',
        'fill-opacity': 0.18,
        'fill-outline-color': '#D97706'
      }
    })
  }

  // 4a. Bề mặt mặt đường bê tông nhựa
  if (!map.getLayer('segments-surface-layer')) {
    map.addLayer({
      id: 'segments-surface-layer',
      type: 'fill',
      source: 'segments-surface-source',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          0.85,
          0.45
        ]
      }
    })
  }

  // 4b. Viền 2 mép dải mặt đường
  if (!map.getLayer('segments-surface-outline')) {
    map.addLayer({
      id: 'segments-surface-outline',
      type: 'line',
      source: 'segments-surface-source',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          '#FFFFFF',
          '#1E293B'
        ],
        'line-width': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          2.5,
          1.0
        ],
        'line-opacity': 0.95
      }
    })
  }

  // 5. Tim tuyến trung tâm LineString
  if (!map.getLayer('segments-glow-layer')) {
    map.addLayer({
      id: 'segments-glow-layer',
      type: 'line',
      source: 'segments-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0F172A',
        'line-width': 4.5,
        'line-opacity': 0.7
      }
    })
  }

  if (!map.getLayer('segments-dash-layer')) {
    map.addLayer({
      id: 'segments-dash-layer',
      type: 'line',
      source: 'segments-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2.0,
        'line-dasharray': [3, 2]
      }
    })
  }

  // 6. Nhãn phân đoạn
  if (!map.getLayer('segments-label-layer')) {
    map.addLayer({
      id: 'segments-label-layer',
      type: 'symbol',
      source: 'segments-source',
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['get', 'code'],
        'text-size': 12,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 2.5
      }
    })
  }

  // 7. Lớp tấm bê tông, khe co, khe giãn, mép đường
  setupSlabsAndJointsLayers(map)
}
