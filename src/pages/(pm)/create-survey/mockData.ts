import { ProjectRouteConfig, AvailablePilot } from './types'
import { INITIAL_SURVEY_ROUTES, INITIAL_PILOTS } from '../../../api/services/surveyService'

export const SURVEY_PROJECTS: ProjectRouteConfig[] = INITIAL_SURVEY_ROUTES

export const AVAILABLE_PILOTS: AvailablePilot[] = INITIAL_PILOTS

export function interpolateCoordAtKm(
  km: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number] {
  if (km <= kmPoints[0]) return coords[0]
  if (km >= kmPoints[kmPoints.length - 1]) return coords[coords.length - 1]

  for (let i = 0; i < kmPoints.length - 1; i++) {
    if (km >= kmPoints[i] && km <= kmPoints[i + 1]) {
      const span = kmPoints[i + 1] - kmPoints[i]
      if (span === 0) return coords[i]
      const t = (km - kmPoints[i]) / span
      const lng = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
      const lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
      return [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
    }
  }
  return coords[coords.length - 1]
}

export function getSubLineCoordinates(
  startKm: number,
  endKm: number,
  coords: [number, number][],
  kmPoints: number[]
): [number, number][] {
  if (!coords || coords.length < 2) return coords || []
  const [minKm, maxKm] = startKm <= endKm ? [startKm, endKm] : [endKm, startKm]
  const result: [number, number][] = []

  result.push(interpolateCoordAtKm(minKm, coords, kmPoints))
  for (let i = 0; i < kmPoints.length; i++) {
    if (kmPoints[i] > minKm && kmPoints[i] < maxKm) {
      result.push(coords[i])
    }
  }
  result.push(interpolateCoordAtKm(maxKm, coords, kmPoints))

  if (result.length < 2) return coords.slice(0, 2)
  return result
}
