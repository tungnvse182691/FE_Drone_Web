import * as maplibregl from 'maplibre-gl'
import { SegmentItem } from './types'
import {
  buildSegmentsSurfaceGeoJSON,
  buildSegmentsGeoJSON,
  buildPlanningCorridorGeoJSON,
  buildSlabsAndJointsGeoJSON,
  buildBranchesSurfaceGeoJSON,
  buildBranchesGeoJSON
} from './data'
import { setupSlabsAndJointsLayers } from './alignmentSlabLayers'

export function setupAlignmentSourcesAndLayers(
  map: maplibregl.Map,
  segments: SegmentItem[],
  currentCoords: [number, number][],
  currentKmPoints: number[],
  selectedSegmentId: string | null,
  branches: any[] = []
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

  // 2b. Thêm GeoJSON Sources cho Lưới tấm bê tông (Slabs), Khe co giãn, Khe giãn nở & Nhãn 2 mép đường (Cả chính lẫn nhánh)
  const { slabsGeoJSON, jointsGeoJSON, edgesGeoJSON } = buildSlabsAndJointsGeoJSON(
    segments,
    currentCoords,
    currentKmPoints,
    undefined,
    branches
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
        'fill-color': ['coalesce', ['get', 'color'], '#0284C7'],
        'fill-opacity': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          0.85,
          0.50
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
          '#C9A227'
        ],
        'line-width': [
          'case',
          ['boolean', ['get', 'isSelected'], false],
          2.8,
          1.5
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
      filter: ['==', ['get', 'isLine'], true],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0F172A',
        'line-width': 5.0,
        'line-opacity': 0.85
      }
    })
  }

  if (!map.getLayer('segments-dash-layer')) {
    map.addLayer({
      id: 'segments-dash-layer',
      type: 'line',
      source: 'segments-source',
      filter: ['==', ['get', 'isLine'], true],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2.4,
        'line-dasharray': [3, 2]
      }
    })
  }

  // 6. Nhãn phân đoạn: Đặt ở mép ngoài lề đường (không bị che khuất bởi tấm BTXM)
  if (!map.getLayer('segments-label-layer')) {
    map.addLayer({
      id: 'segments-label-layer',
      type: 'symbol',
      source: 'segments-source',
      filter: ['==', ['get', 'isLabelPoint'], true],
      layout: {
        'text-field': ['get', 'code'],
        'text-size': 11.5,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#FEF08A',
        'text-halo-color': '#0F172A',
        'text-halo-width': 3.0
      }
    })
  }

  // 7. Lớp tấm bê tông, khe co, khe giãn, mép đường
  setupSlabsAndJointsLayers(map)

  // 8a. Bề mặt dải mặt đường Polygon của Tuyến nhánh (Đồng nhất kích cỡ với tuyến chính)
  if (!map.getSource('branches-surface-source')) {
    map.addSource('branches-surface-source', {
      type: 'geojson',
      data: buildBranchesSurfaceGeoJSON(branches, currentCoords, currentKmPoints, selectedSegmentId)
    })
  }

  if (!map.getLayer('branches-surface-layer')) {
    map.addLayer({
      id: 'branches-surface-layer',
      type: 'fill',
      source: 'branches-surface-source',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.65
      }
    })
  }

  if (!map.getLayer('branches-surface-outline')) {
    map.addLayer({
      id: 'branches-surface-outline',
      type: 'line',
      source: 'branches-surface-source',
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 1.8,
        'line-opacity': 0.9
      }
    })
  }

  // 8b. Tim tuyến nhánh (LineString & Glow)
  if (!map.getSource('branches-source')) {
    map.addSource('branches-source', {
      type: 'geojson',
      data: buildBranchesGeoJSON(branches, currentCoords, currentKmPoints)
    })
  }

  if (!map.getLayer('branches-glow-layer')) {
    map.addLayer({
      id: 'branches-glow-layer',
      type: 'line',
      source: 'branches-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#451A03',
        'line-width': 4.5,
        'line-opacity': 0.8
      }
    })
  }

  if (!map.getLayer('branches-line-layer')) {
    map.addLayer({
      id: 'branches-line-layer',
      type: 'line',
      source: 'branches-source',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2.0,
        'line-dasharray': [3, 2]
      }
    })
  }

  if (!map.getLayer('branches-label-layer')) {
    map.addLayer({
      id: 'branches-label-layer',
      type: 'symbol',
      source: 'branches-source',
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['concat', ['get', 'code'], ' - ', ['get', 'name']],
        'text-size': 11,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#FDE68A',
        'text-halo-color': '#78350F',
        'text-halo-width': 2.0
      }
    })
  }

  // 9. Lớp hiển thị chế độ Chấm điểm trên bản đồ (Map Coordinate Picker)
  if (!map.getSource('pick-coords-source')) {
    map.addSource('pick-coords-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })
  }

  if (!map.getLayer('pick-coords-line')) {
    map.addLayer({
      id: 'pick-coords-line',
      type: 'line',
      source: 'pick-coords-source',
      filter: ['==', ['get', 'kind'], 'line'],
      paint: {
        'line-color': '#EF4444',
        'line-width': 3.5,
        'line-dasharray': [2, 1]
      }
    })
  }

  if (!map.getLayer('pick-coords-points')) {
    map.addLayer({
      id: 'pick-coords-points',
      type: 'circle',
      source: 'pick-coords-source',
      filter: ['==', ['get', 'kind'], 'point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#EF4444',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF'
      }
    })
  }

  if (!map.getLayer('pick-coords-labels')) {
    map.addLayer({
      id: 'pick-coords-labels',
      type: 'symbol',
      source: 'pick-coords-source',
      filter: ['==', ['get', 'kind'], 'point'],
      layout: {
        'text-field': ['to-string', ['get', 'order']],
        'text-size': 10,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#991B1B',
        'text-halo-width': 2
      }
    })
  }
}

