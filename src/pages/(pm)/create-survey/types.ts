export interface ProjectRouteConfig {
  id: string
  code: string
  name: string
  type: 'MAINLINE' | 'BRANCH'
  parentProjectId: string
  parentProjectCode: string
  parentProjectName: string
  branchStationKm?: number
  branchStationText?: string
  directionText?: string
  lengthKm?: number
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
