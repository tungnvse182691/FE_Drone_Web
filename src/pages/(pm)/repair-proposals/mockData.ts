import { UnassignedDefectItem } from './types'
export { AVAILABLE_ROUTES } from './data'

export const DEFECTS_BY_SEGMENT: Record<string, UnassignedDefectItem[]> = {
  'seg-02': [
    {
      id: 'def-102',
      code: 'DEF-102',
      title: 'Ổ gà sâu 5cm làn phải',
      stationing: 'Km 1029+200',
      lane_detail: 'Vị trí: Làn phải sát lề • Mức độ: Khẩn cấp',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.45,
      depth_cm: 5.2
    },
    {
      id: 'def-105',
      code: 'DEF-105',
      title: 'Nứt dọc 2.1m tim đường',
      stationing: 'Km 1029+800',
      lane_detail: 'Vị trí: Giữa hai làn xe • Cần xẻ rãnh rót nhựa mastic',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.85,
      depth_cm: 3.1
    },
    {
      id: 'def-108',
      code: 'DEF-108',
      title: 'Lún vệt bánh xe 18mm',
      stationing: 'Km 1030+150',
      lane_detail: 'Chiều dài: 45 mét vệt lún • Nguy cơ đọng nước mưa',
      severity_label: 'Nghiêm trọng (L3)',
      selected: true,
      area_m2: 1.25,
      depth_cm: 4.5
    },
    {
      id: 'def-114',
      code: 'DEF-114',
      title: 'Nứt chân chim mai rùa',
      stationing: 'Km 1031+400',
      lane_detail: 'Mức độ nhẹ, chưa lan tỏa mặt đường lớn',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.35,
      depth_cm: 1.8
    }
  ],
  'seg-01': [
    {
      id: 'def-101',
      code: 'DEF-101',
      title: 'Ổ gà lún sụt gần trạm thu phí',
      stationing: 'Km 1025+300',
      lane_detail: 'Làn xe tải nặng • Có nguy cơ bật mảng bê tông',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.60,
      depth_cm: 6.0
    },
    {
      id: 'def-103',
      code: 'DEF-103',
      title: 'Nứt ngang mặt đường 3.5m',
      stationing: 'Km 1026+750',
      lane_detail: 'Nứt thấu lớp bê tông nhựa C19',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.70,
      depth_cm: 2.5
    },
    {
      id: 'def-104',
      code: 'DEF-104',
      title: 'Bong tróc lớp tạo nhám mặt đường',
      stationing: 'Km 1027+400',
      lane_detail: 'Mặt đường trơn trượt khi mưa lớn',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 1.10,
      depth_cm: 1.5
    }
  ],
  'seg-03': [
    {
      id: 'def-115',
      code: 'DEF-115',
      title: 'Hằn lún bánh xe vệt ngoài',
      stationing: 'Km 1034+200',
      lane_detail: 'Đoạn cua dốc nhẹ • Lún sâu 22mm',
      severity_label: 'Nghiêm trọng (L3)',
      selected: true,
      area_m2: 1.50,
      depth_cm: 4.8
    },
    {
      id: 'def-117',
      code: 'DEF-117',
      title: 'Nứt rạn mai rùa diện tích lớn',
      stationing: 'Km 1036+500',
      lane_detail: 'Hư hỏng cấu trúc lớp mặt bê tông nhựa',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 4.20,
      depth_cm: 5.0
    },
    {
      id: 'def-119',
      code: 'DEF-119',
      title: 'Trám mastic cũ bị bong bật',
      stationing: 'Km 1038+100',
      lane_detail: 'Cần cào bóc làm sạch và rót lại',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.50,
      depth_cm: 2.0
    }
  ],
  'seg-04': [
    {
      id: 'def-121',
      code: 'DEF-121',
      title: 'Nứt trượt taluy âm mép đường đèo',
      stationing: 'Km 1042+100',
      lane_detail: 'Phân đoạn cua đèo • Nguy cơ mất an toàn cao',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 2.10,
      depth_cm: 7.5
    },
    {
      id: 'def-123',
      code: 'DEF-123',
      title: 'Sụt lún mép rãnh thoát nước bê tông',
      stationing: 'Km 1044+300',
      lane_detail: 'Rãnh bê tông hở mép đọng bùn rác',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 1.80,
      depth_cm: 3.5
    }
  ],
  'seg-101': [
    {
      id: 'def-201',
      code: 'DEF-201',
      title: 'Ổ gà sâu mép cầu vượt',
      stationing: 'Km 1005+200',
      lane_detail: 'Làn xe cơ giới 01 • Cần vá dặm khẩn cấp',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 0.55,
      depth_cm: 5.5
    },
    {
      id: 'def-204',
      code: 'DEF-204',
      title: 'Nứt dọc kéo dài 15m',
      stationing: 'Km 1009+800',
      lane_detail: 'Giữa tim đường và làn 1',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 1.05,
      depth_cm: 2.8
    }
  ],
  'seg-102': [
    {
      id: 'def-210',
      code: 'DEF-210',
      title: 'Lún vệt bánh xe Km 1018',
      stationing: 'Km 1018+400',
      lane_detail: 'Làn xe tải nặng • Hằn lún 16mm',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.90,
      depth_cm: 3.2
    },
    {
      id: 'def-212',
      code: 'DEF-212',
      title: 'Nứt chân chim diện rộng',
      stationing: 'Km 1022+100',
      lane_detail: 'Làn khẩn cấp sát lề',
      severity_label: 'Nhẹ (L1)',
      selected: false,
      area_m2: 0.80,
      depth_cm: 1.5
    }
  ],
  'seg-exp1': [
    {
      id: 'def-301',
      code: 'DEF-301',
      title: 'Lún gối mố cầu vượt nút giao',
      stationing: 'Km 05+200',
      lane_detail: 'Đoạn chuyển tiếp mố cầu cao tốc',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 1.40,
      depth_cm: 4.2
    },
    {
      id: 'def-305',
      code: 'DEF-305',
      title: 'Nứt vỡ gờ chắn bánh bê tông',
      stationing: 'Km 11+400',
      lane_detail: 'Dải phân cách giữa cao tốc',
      severity_label: 'Trung bình (L2)',
      selected: true,
      area_m2: 0.60,
      depth_cm: 3.0
    }
  ],
  'seg-exp2': [
    {
      id: 'def-310',
      code: 'DEF-310',
      title: 'Lún cục bộ trước làn thu phí',
      stationing: 'Km 22+800',
      lane_detail: 'Khu vực giảm tốc trạm ETC',
      severity_label: 'Khẩn cấp (L3)',
      selected: true,
      area_m2: 1.80,
      depth_cm: 5.0
    }
  ]
}
