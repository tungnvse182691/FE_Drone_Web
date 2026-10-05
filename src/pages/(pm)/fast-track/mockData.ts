import {
  RouteConfig,
  PolicyThresholdConfig,
  PolicyHistoryItem,
  AuditLogItem,
  CrewTeam,
  DefectItem
} from './types'

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

export const INITIAL_POLICY: PolicyThresholdConfig = {
  version: 'Policy v2.1',
  status: 'ACTIVE',
  maxAreaM2: 0.5,
  maxDepthCm: 5.0,
  maxPerimeterM: 3.0,
  allowedSeverities: ['LOW', 'MEDIUM'],
  slaHours: 24,
  activatedBy: 'Kỹ sư Nguyễn Văn Hoàng (PM)',
  activatedAt: '08:30 • 15/08/2026',
  appliedRoute: 'QL1A (Km 1000 - Km 1080) • PK-04',
  description: 'Quy chuẩn kích hoạt tự động: 3/3 Tiêu chí bắt buộc phải thỏa mãn để tự động mở luồng Fast Track.'
}

export const INITIAL_POLICY_HISTORY: PolicyHistoryItem[] = [
  {
    id: 'pol-21',
    version: 'Policy v2.1',
    displayName: 'Policy v2.1 (Hiện hành)',
    status: 'ACTIVE',
    activatedBy: 'PM Hoàng',
    activatedAt: '08:30 15/08/2026',
    route: 'Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)',
    maxArea: 0.5,
    maxDepth: 5.0,
    slaHours: 24,
    maxPerimeter: 3.0
  },
  {
    id: 'pol-20',
    version: 'Policy v2.0',
    displayName: 'Policy v2.0 (Lưu trữ)',
    status: 'ARCHIVED',
    activatedBy: 'PGĐ Trần Nam',
    activatedAt: '10:15 01/06/2026',
    route: 'Ngưỡng diện tích 0.4 m² • Độ sâu ≤ 4.5 cm',
    maxArea: 0.4,
    maxDepth: 4.5,
    slaHours: 24,
    maxPerimeter: 2.8
  },
  {
    id: 'pol-19',
    version: 'Policy v1.9',
    displayName: 'Policy v1.9 (Lưu trữ)',
    status: 'ARCHIVED',
    activatedBy: 'PM Hoàng',
    activatedAt: '14:00 12/01/2026',
    route: 'Ngưỡng diện tích 0.3 m² • Thử nghiệm thí điểm',
    maxArea: 0.3,
    maxDepth: 4.0,
    slaHours: 36,
    maxPerimeter: 2.5
  }
]

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    title: 'Cập nhật Policy v2.1 (ACTIVE)',
    time: '15/08/2026 08:30:12',
    user: 'Nguyễn Văn Hoàng (PM)',
    hash: 'sha256:7f8a9b...c41e',
    note: 'Nâng ngưỡng diện tích từ 0.4 m² lên 0.5 m² để phù hợp điều kiện thời tiết mùa mưa.'
  },
  {
    title: 'Kích hoạt Policy v2.0',
    time: '01/06/2026 10:15:45',
    user: 'Trần Nam (PGĐ Dự án)',
    hash: 'sha256:2b4c6e...a991',
    note: 'Áp dụng thí điểm tuyến mở rộng Km 1025 - Km 1045.'
  }
]

export const CREW_TEAMS: CrewTeam[] = [
  {
    id: 'crew-01',
    name: 'Tổ tuần tra số 01',
    leader: 'Kỹ sư Kiên',
    memberCount: 4,
    equipment: '1 Xe bán tải, máy ảnh RTK, thước cơ khí',
    isAvailable: true
  },
  {
    id: 'crew-02',
    name: 'Tổ đo đạc số 02',
    leader: 'Kỹ sư Minh',
    memberCount: 5,
    equipment: '1 Xe chuyên dụng, máy thủy bình laser, xe đo độ nhám',
    isAvailable: true
  },
  {
    id: 'crew-03',
    name: 'Tổ cơ động bảo dưỡng 03',
    leader: 'Kỹ sư Tuấn',
    memberCount: 6,
    equipment: 'Máy cào bóc mini, xe lu rung 2 tấn, vật liệu vá nguội',
    isAvailable: false
  }
]

export const INITIAL_DEFECTS: DefectItem[] = [
  // TUYẾN 1: QL1A_PK04 - QL1A Giai đoạn 2 (Km 1025 - Km 1045)
  {
    id: 'DEF-01',
    code: '#DEF-2026-0101',
    routeId: 'QL1A_PK04',
    routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    stationing: 'Km 1032+450',
    kmValue: 1032.45,
    lane: 'Làn phải (R1)',
    type: 'Ổ gà nông (Pothole L1)',
    areaM2: 0.35,
    depthCm: 3.2,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ tuần tra số 01',
    gps: { lat: 16.0520, lng: 108.1970 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 94
  },
  {
    id: 'DEF-02',
    code: '#DEF-2026-0102',
    routeId: 'QL1A_PK04',
    routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    stationing: 'Km 1032+520',
    kmValue: 1032.52,
    lane: 'Làn giữa (M1)',
    type: 'Nứt rạn lưới mai (Alligator Cracking)',
    areaM2: 0.45,
    depthCm: 2.0,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ tuần tra số 01',
    gps: { lat: 16.0535, lng: 108.1990 },
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 91
  },
  {
    id: 'DEF-03',
    code: '#DEF-2026-0105',
    routeId: 'QL1A_PK04',
    routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    stationing: 'Km 1033+110',
    kmValue: 1033.11,
    lane: 'Lề đường phải',
    type: 'Vỡ mép thảm nhựa (Edge Break)',
    areaM2: 0.85,
    depthCm: 6.5,
    isFastTrackEligible: false,
    violationReason: 'Diện tích 0.85 m² (> 0.5 m²) & Độ sâu 6.5 cm (> 5.0 cm)',
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 16.0560, lng: 108.2025 },
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 96
  },
  {
    id: 'DEF-04',
    code: '#DEF-2026-0108',
    routeId: 'QL1A_PK04',
    routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    stationing: 'Km 1034+200',
    kmValue: 1034.20,
    lane: 'Làn trái (L1)',
    type: 'Hằn lún vệt bánh (Wheel Rutting)',
    areaM2: 0.25,
    depthCm: 4.0,
    isFastTrackEligible: true,
    assignedCrew: 'Chưa chỉ định',
    gps: { lat: 16.0590, lng: 108.2060 },
    image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 89
  },
  {
    id: 'DEF-05',
    code: '#DEF-2026-0112',
    routeId: 'QL1A_PK04',
    routeName: 'QL1A - Giai đoạn 2 (Km 1025 - Km 1045)',
    stationing: 'Km 1034+890',
    kmValue: 1034.89,
    lane: 'Làn phải (R1)',
    type: 'Ổ gà lún mép (Pothole L2)',
    areaM2: 0.40,
    depthCm: 4.8,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 16.0620, lng: 108.2095 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 92
  },

  // TUYẾN 2: QL1A_PK01 - QL1A Giai đoạn 1 (Km 1000 - Km 1025)
  {
    id: 'DEF-06',
    code: '#DEF-2026-0045',
    routeId: 'QL1A_PK01',
    routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    stationing: 'Km 1004+200',
    kmValue: 1004.20,
    lane: 'Làn phải (R1)',
    type: 'Ổ gà nông (Pothole L1)',
    areaM2: 0.30,
    depthCm: 3.0,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ tuần tra số 01',
    gps: { lat: 15.8950, lng: 108.2620 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 95
  },
  {
    id: 'DEF-07',
    code: '#DEF-2026-0052',
    routeId: 'QL1A_PK01',
    routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    stationing: 'Km 1008+150',
    kmValue: 1008.15,
    lane: 'Làn giữa (M1)',
    type: 'Nứt rạn chân chim',
    areaM2: 0.38,
    depthCm: 2.2,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 15.9200, lng: 108.2700 },
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 91
  },
  {
    id: 'DEF-08',
    code: '#DEF-2026-0068',
    routeId: 'QL1A_PK01',
    routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    stationing: 'Km 1015+700',
    kmValue: 1015.70,
    lane: 'Lề đường phải',
    type: 'Lún sụt mép bê tông nhựa',
    areaM2: 0.90,
    depthCm: 6.8,
    isFastTrackEligible: false,
    violationReason: 'Diện tích 0.90 m² (> 0.5 m²) & Độ sâu 6.8 cm (> 5.0 cm)',
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 15.9450, lng: 108.2780 },
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 97
  },
  {
    id: 'DEF-09',
    code: '#DEF-2026-0074',
    routeId: 'QL1A_PK01',
    routeName: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    stationing: 'Km 1021+300',
    kmValue: 1021.30,
    lane: 'Làn trái (L1)',
    type: 'Bong tróc mặt đường (Raveling)',
    areaM2: 0.28,
    depthCm: 3.5,
    isFastTrackEligible: true,
    assignedCrew: 'Chưa chỉ định',
    gps: { lat: 15.9750, lng: 108.2880 },
    image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 88
  },

  // TUYẾN 3: EXPRESSWAY_LINK - Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)
  {
    id: 'DEF-10',
    code: '#DEF-2026-0201',
    routeId: 'EXPRESSWAY_LINK',
    routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    stationing: 'Km 0+450',
    kmValue: 0.45,
    lane: 'Làn 1',
    type: 'Nứt ngang mặt đường (Transverse Crack)',
    areaM2: 0.32,
    depthCm: 2.8,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ tuần tra số 01',
    gps: { lat: 16.1250, lng: 108.1250 },
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 93
  },
  {
    id: 'DEF-11',
    code: '#DEF-2026-0208',
    routeId: 'EXPRESSWAY_LINK',
    routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    stationing: 'Km 2+100',
    kmValue: 2.10,
    lane: 'Làn 2',
    type: 'Vỡ mép thảm nhựa (Edge Break)',
    areaM2: 0.42,
    depthCm: 4.0,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ cơ động bảo dưỡng 03',
    gps: { lat: 16.1400, lng: 108.1380 },
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 90
  },
  {
    id: 'DEF-12',
    code: '#DEF-2026-0215',
    routeId: 'EXPRESSWAY_LINK',
    routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    stationing: 'Km 5+600',
    kmValue: 5.60,
    lane: 'Làn khẩn cấp',
    type: 'Ổ gà sâu (Pothole L2)',
    areaM2: 0.75,
    depthCm: 5.8,
    isFastTrackEligible: false,
    violationReason: 'Diện tích 0.75 m² (> 0.5 m²) & Độ sâu 5.8 cm (> 5.0 cm)',
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 16.1550, lng: 108.1480 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 96
  },
  {
    id: 'DEF-13',
    code: '#DEF-2026-0220',
    routeId: 'EXPRESSWAY_LINK',
    routeName: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    stationing: 'Km 8+900',
    kmValue: 8.90,
    lane: 'Làn 1',
    type: 'Lún vệt bánh xe (Rutting)',
    areaM2: 0.20,
    depthCm: 3.1,
    isFastTrackEligible: true,
    assignedCrew: 'Chưa chỉ định',
    gps: { lat: 16.1750, lng: 108.1580 },
    image: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 89
  },

  // TUYẾN 4: PHANTHIET_DAUGIAY - Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)
  {
    id: 'DEF-14',
    code: '#DEF-2026-0301',
    routeId: 'PHANTHIET_DAUGIAY',
    routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    stationing: 'Km 47+200',
    kmValue: 47.20,
    lane: 'Làn 1',
    type: 'Nứt rạn lưới mai (Alligator)',
    areaM2: 0.38,
    depthCm: 3.0,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ tuần tra số 01',
    gps: { lat: 10.9600, lng: 107.5100 },
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 94
  },
  {
    id: 'DEF-15',
    code: '#DEF-2026-0305',
    routeId: 'PHANTHIET_DAUGIAY',
    routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    stationing: 'Km 51+800',
    kmValue: 51.80,
    lane: 'Làn 2',
    type: 'Ổ gà bong tróc',
    areaM2: 0.45,
    depthCm: 4.2,
    isFastTrackEligible: true,
    assignedCrew: 'Tổ đo đạc số 02',
    gps: { lat: 11.0000, lng: 107.5750 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 92
  },
  {
    id: 'DEF-16',
    code: '#DEF-2026-0310',
    routeId: 'PHANTHIET_DAUGIAY',
    routeName: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    stationing: 'Km 58+400',
    kmValue: 58.40,
    lane: 'Làn khẩn cấp',
    type: 'Lún nứt tiếp giáp cống chui',
    areaM2: 0.88,
    depthCm: 7.2,
    isFastTrackEligible: false,
    violationReason: 'Diện tích 0.88 m² (> 0.5 m²) & Độ sâu 7.2 cm (> 5.0 cm)',
    assignedCrew: 'Chưa chỉ định',
    gps: { lat: 11.0350, lng: 107.6300 },
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    aiConfidence: 96
  }
]
