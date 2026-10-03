import * as maplibregl from 'maplibre-gl'

/**
 * Cấu hình MapLibre GL chuẩn hóa theo chuẩn https://maplibre.org/
 * Hỗ trợ đa nguồn bản đồ: Vệ tinh độ phân giải cao Google Satellite, OpenStreetMap và Vector tiles
 */

// Tọa độ mặc định dự án (QL1A miền Trung - Đà Nẵng / Huế)
export const DEFAULT_MAP_CENTER: [number, number] = [108.2022, 16.0544]
export const DEFAULT_MAP_ZOOM = 14

export const SATELLITE_LAYER_ID = 'satellite-layer'
export const OSM_LAYER_ID = 'osm-layer'

/**
 * Sinh cấu hình StyleSpecification chuẩn cho MapLibre GL
 * Đảm bảo hiển thị ổn định, không bị vỡ ảnh hay lỗi CORS/watermark khi zoom sát mặt đường
 */
export function getMapLibreStyle(
  type: 'SATELLITE' | 'STREETS' | 'VECTOR' | 'HYBRID' = 'SATELLITE'
): maplibregl.StyleSpecification {
  const isSatellite = type === 'SATELLITE' || type === 'HYBRID'

  return {
    version: 8,
    name: `RoadGuard-${type}`,
    sources: {
      'google-satellite': {
        type: 'raster',
        tiles: [
          'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
        ],
        tileSize: 256,
        maxzoom: 20, // Tự động overscale khi zoom > 20
        attribution: '&copy; Google Satellite Imagery | MapLibre'
      },
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; OpenStreetMap contributors | MapLibre'
      }
    },
    layers: [
      {
        id: SATELLITE_LAYER_ID,
        type: 'raster',
        source: 'google-satellite',
        layout: {
          visibility: isSatellite ? 'visible' : 'none'
        },
        minzoom: 0,
        maxzoom: 24
      },
      {
        id: OSM_LAYER_ID,
        type: 'raster',
        source: 'osm-tiles',
        layout: {
          visibility: !isSatellite ? 'visible' : 'none'
        },
        minzoom: 0,
        maxzoom: 24
      }
    ]
  }
}

/**
 * Helper chuyển đổi hiển thị giữa Vệ tinh và Bản đồ đường sá
 */
export function setMapLayerVisibility(
  map: maplibregl.Map,
  layerType: 'SATELLITE' | 'VECTOR' | 'STREETS'
) {
  if (!map.isStyleLoaded()) return
  const isSat = layerType === 'SATELLITE'
  
  if (map.getLayer(SATELLITE_LAYER_ID)) {
    map.setLayoutProperty(SATELLITE_LAYER_ID, 'visibility', isSat ? 'visible' : 'none')
  }
  if (map.getLayer(OSM_LAYER_ID)) {
    map.setLayoutProperty(OSM_LAYER_ID, 'visibility', !isSat ? 'visible' : 'none')
  }
}

/**
 * Helper thêm bộ điều khiển định vị & zoom chuẩn MapLibre
 */
export function addStandardControls(
  map: maplibregl.Map,
  options?: { showCompass?: boolean; position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }
) {
  const position = options?.position || 'top-right'
  map.addControl(
    new maplibregl.NavigationControl({
      showCompass: options?.showCompass ?? true,
      visualizePitch: true
    }),
    position
  )
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }),
    'bottom-left'
  )
}
