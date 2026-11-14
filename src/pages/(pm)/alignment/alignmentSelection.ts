import { LngLatBounds } from 'maplibre-gl'
import { previewCenterlineCoordinates } from './alignmentImportHelpers'
import type { RoadGeometryVersionView } from '../../../api/services/alignmentService'

export function confirmedRouteCoordinates(route: RoadGeometryVersionView | null) {
  return route?.wgs84Centerline?.coordinates || (route?.engineeringSrid === 32648 && route.metricCenterline?.coordinates ? previewCenterlineCoordinates(route.metricCenterline.coordinates,route.engineeringSrid) : [])
}
export function fitServerCoordinates(map: { fitBounds: (bounds: LngLatBounds, options: object) => void } | null, coords?: [number,number][]) {
  if (!map || !coords || coords.length < 2 || coords.some(p=>p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0])>180 || Math.abs(p[1])>90)) return false
  const bounds = new LngLatBounds()
  coords.forEach(p=>bounds.extend(p))
  map.fitBounds(bounds,{padding:60,speed:1.1})
  return true
}
