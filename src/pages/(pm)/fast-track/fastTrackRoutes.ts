import { RouteConfig } from './types'

export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  QL1A_PK04: {
    id: 'QL1A_PK04',
    name: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    code: 'QL1A • PK-04',
    stationRange: 'Km 1025+000 - Km 1045+000',
    center: [108.2030, 16.0580],
    zoom: 13.5,
    coords: [
      [108.1950, 16.0500],
      [108.1970, 16.0520],
      [108.1990, 16.0535],
      [108.2025, 16.0560],
      [108.2060, 16.0590],
      [108.2095, 16.0620],
      [108.2130, 16.0650]
    ]
  },
  QL1A_PK01: {
    id: 'QL1A_PK01',
    name: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    code: 'QL1A • PK-01',
    stationRange: 'Km 1000+000 - Km 1025+000',
    center: [108.2750, 15.9350],
    zoom: 12.8,
    coords: [
      [108.2600, 15.8900],
      [108.2680, 15.9150],
      [108.2750, 15.9350],
      [108.2830, 15.9600],
      [108.2900, 15.9800]
    ]
  },
  EXPRESSWAY_LINK: {
    id: 'EXPRESSWAY_LINK',
    name: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    code: 'Đường nối Cao tốc',
    stationRange: 'Km 0+000 - Km 12+000',
    center: [108.1400, 16.1500],
    zoom: 12.8,
    coords: [
      [108.1200, 16.1200],
      [108.1310, 16.1350],
      [108.1400, 16.1500],
      [108.1520, 16.1680],
      [108.1600, 16.1800]
    ]
  },
  PHANTHIET_DAUGIAY: {
    id: 'PHANTHIET_DAUGIAY',
    name: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    code: 'CT Phan Thiết - Dầu Giây',
    stationRange: 'Km 45+000 - Km 65+000',
    center: [107.5750, 11.0000],
    zoom: 12.2,
    coords: [
      [107.5000, 10.9500],
      [107.5350, 10.9750],
      [107.5750, 11.0000],
      [107.6150, 11.0250],
      [107.6500, 11.0500]
    ]
  }
}
