export interface ProjectRouteConfig {
  id: string
  code: string
  name: string
  startKm: number
  endKm: number
  defaultCoords: [number, number][]
  defaultKmPoints: number[]
}

export interface AvailablePilot {
  id: string
  name: string
  roleLabel: string
  phone: string
  license: string
  device: string
}
