import * as maplibregl from 'maplibre-gl'

/**
 * Cấu hình MapLibre GL chuẩn hóa theo chuẩn https://maplibre.org/
 * Hỗ trợ đa nguồn bản đồ: Vệ tinh quang học độ phân giải cao Google Satellite và Vector đường sá Google Maps / OSM
 */

// Tọa độ mặc định dự án (QL1A miền Trung - Đà Nẵng / Huế)
export const DEFAULT_MAP_CENTER: [number, number] = [108.2022, 16.0544]
export const DEFAULT_MAP_ZOOM = 14

export const SATELLITE_LAYER_ID = 'satellite-layer'
export const OSM_LAYER_ID = 'osm-layer'

// Base layers exist once the style is parsed; raster tiles may still be loading or failing.
export function hasMapBaseStyle(map: maplibregl.Map | null): map is maplibregl.Map {
  return !!map && !!(map.getLayer(SATELLITE_LAYER_ID) || map.getLayer(OSM_LAYER_ID))
}

/**
 * Sinh cấu hình StyleSpecification chuẩn cho MapLibre GL
 * Đảm bảo hiển thị ổn định, không bị vỡ ảnh hay lỗi CORS khi zoom sát mặt đường
 */
export function getMapLibreStyle(
  type: 'SATELLITE' | 'STREETS' | 'VECTOR' | 'HYBRID' = 'SATELLITE'
): maplibregl.StyleSpecification {
  const isSatellite = type === 'SATELLITE' || type === 'HYBRID'
  const isHybrid = type === 'HYBRID'
  // lyrs=y: Vệ tinh có địa danh/nhãn; lyrs=s: Ảnh vệ tinh quang học sắc nét
  const satLyrs = isHybrid ? 'y' : 's'

  return {
    version: 8,
    name: `RoadGuard-${type}`,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'google-satellite': {
        type: 'raster',
        tiles: [
          `https://mt0.google.com/vt/lyrs=${satLyrs}&x={x}&y={y}&z={z}`,
          `https://mt1.google.com/vt/lyrs=${satLyrs}&x={x}&y={y}&z={z}`,
          `https://mt2.google.com/vt/lyrs=${satLyrs}&x={x}&y={y}&z={z}`,
          `https://mt3.google.com/vt/lyrs=${satLyrs}&x={x}&y={y}&z={z}`
        ],
        tileSize: 256,
        // Đặt maxzoom là 18 vì ảnh vệ tinh Google ở các cung đường liên tỉnh/nông thôn
        // chỉ có tile chuẩn đến zoom 18. Nếu đặt > 18, Google sẽ trả về tile 'Map data not yet available'.
        // Khi đặt maxzoom: 18, MapLibre sẽ tự động overscale (phóng to sắc nét) từ tầng 18 lên 22-24
        // giúp bản đồ KHÔNG BAO GIỜ bị mất hoặc hiện nền xám lỗi!
        maxzoom: 18,
        attribution: '&copy; Google Satellite Imagery | MapLibre'
      },

      'streets-tiles': {
        type: 'raster',
        tiles: [
          'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          'https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          'https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; Google Roads | MapLibre'
      }
    },
    layers: [
      {
        id: OSM_LAYER_ID,
        type: 'raster',
        source: 'streets-tiles',
        layout: {
          visibility: !isSatellite ? 'visible' : 'none'
        },
        minzoom: 0,
        maxzoom: 24,
        paint: {
          'raster-resampling': 'linear',
          'raster-opacity': 1
        }
      },
      {
        id: SATELLITE_LAYER_ID,
        type: 'raster',
        source: 'google-satellite',
        layout: {
          visibility: isSatellite ? 'visible' : 'none'
        },
        minzoom: 0,
        maxzoom: 24,
        paint: {
          'raster-resampling': 'linear',
          'raster-opacity': 1,
          'raster-fade-duration': 0
        }
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
