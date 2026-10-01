import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  Search,
  SlidersHorizontal,
  FileText,
  Plus,
  Edit3,
  Clock,
  CheckCircle2,
  Construction,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  MoreVertical,
  Send,
  Eye,
  Trash2,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Users2,
  Sparkles,
  Info,
  Check
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

// Interface cho Gói đề xuất sửa chữa kỹ thuật (Work Package / Repair Proposal)
export interface ProposalWorkPackage {
  id: string
  code: string // PKG-2026-08
  title: string
  route_id: string
  route_name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
  segments_count: number
  defect_count: number
  defect_summary: string
  technical_scope: string // Cào bóc & thảm: 180 m²
  material_scope: string // Bê tông nhựa C19: 14 m³
  duration_days: number
  date_range: string
  created_by_name: string
  created_by_initials: string
  created_by_role: string
  created_at: string
  status: 'DRAFT' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED'
  status_label: string
  approved_items: number
  total_items: number
  contractor_name: string
  description?: string
}

// Interface cho khiếm khuyết chưa gán gói trong modal
export interface UnassignedDefectItem {
  id: string
  code: string
  title: string
  stationing: string
  lane_detail: string
  severity_label: string
  selected: boolean
  area_m2: number
  depth_cm: number
}

// Cấu trúc Tuyến đường & Phân đoạn lý trình phân cấp
export interface RouteSegmentOption {
  id: string
  code: string
  name: string
  chainage_start: string
  chainage_end: string
  chainage_display: string
}

export interface RouteOption {
  id: string
  name: string
  code: string
  segments: RouteSegmentOption[]
}

export const AVAILABLE_ROUTES: RouteOption[] = [
  {
    id: 'QL1A_PK04',
    name: 'QL1A - Giai đoạn 2 (Km 1024 - Km 1045)',
    code: 'QL1A-PK04',
    segments: [
      {
        id: 'seg-02',
        code: 'SEG-02',
        name: 'Km 1028+000 đến Km 1033+500',
        chainage_start: 'Km 1028+000',
        chainage_end: 'Km 1033+500',
        chainage_display: 'Km 1028+000 - Km 1033+500'
      },
      {
        id: 'seg-01',
        code: 'SEG-01',
        name: 'Km 1024+000 đến Km 1028+000',
        chainage_start: 'Km 1024+000',
        chainage_end: 'Km 1028+000',
        chainage_display: 'Km 1024+000 - Km 1028+000'
      },
      {
        id: 'seg-03',
        code: 'SEG-03',
        name: 'Km 1033+500 đến Km 1039+000',
        chainage_start: 'Km 1033+500',
        chainage_end: 'Km 1039+000',
        chainage_display: 'Km 1033+500 - Km 1039+000'
      },
      {
        id: 'seg-04',
        code: 'SEG-04',
        name: 'Km 1039+000 đến Km 1045+500',
        chainage_start: 'Km 1039+000',
        chainage_end: 'Km 1045+500',
        chainage_display: 'Km 1039+000 - Km 1045+500'
      }
    ]
  },
  {
    id: 'QL1A_PK01',
    name: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1024)',
    code: 'QL1A-PK01',
    segments: [
      {
        id: 'seg-101',
        code: 'SEG-101',
        name: 'Km 1000+000 đến Km 1012+000',
        chainage_start: 'Km 1000+000',
        chainage_end: 'Km 1012+000',
        chainage_display: 'Km 1000+000 - Km 1012+000'
      },
      {
        id: 'seg-102',
        code: 'SEG-102',
        name: 'Km 1012+000 đến Km 1024+000',
        chainage_start: 'Km 1012+000',
        chainage_end: 'Km 1024+000',
        chainage_display: 'Km 1012+000 - Km 1024+000'
      }
    ]
  },
  {
    id: 'EXPR_NORTH_SOUTH',
    name: 'Đường nối Cao tốc Bắc - Nam',
    code: 'EXPR-NS',
    segments: [
      {
        id: 'seg-exp1',
        code: 'SEG-EXP1',
        name: 'Km 0+000 đến Km 15+500 (Nút giao)',
        chainage_start: 'Km 0+000',
        chainage_end: 'Km 15+500',
        chainage_display: 'Km 0+000 - Km 15+500'
      },
      {
        id: 'seg-exp2',
        code: 'SEG-EXP2',
        name: 'Km 15+500 đến Km 28+200 (Trạm thu phí)',
        chainage_start: 'Km 15+500',
        chainage_end: 'Km 28+200',
        chainage_display: 'Km 15+500 - Km 28+200'
      }
    ]
  }
]

// Mock dữ liệu khiếm khuyết tồn đọng riêng theo từng phân đoạn
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

export const RepairProposals: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const isPM = !isSupervisor
  const basePath = isSupervisor ? '/sup' : '/pm'

  // Danh sách các gói đề xuất sửa chữa kỹ thuật phong phú (14 gói theo Stitch)
  const [packages, setPackages] = useState<ProposalWorkPackage[]>([
    {
      id: 'pkg-08',
      code: 'PKG-2026-08',
      title: 'Khắc phục ổ gà & lún nứt đợt 3',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1024+000',
      chainage_end: 'Km 1030+000',
      chainage_display: 'Km 1024+000 - Km 1030+000',
      segments_count: 5,
      defect_count: 12,
      defect_summary: '4 ổ gà, 6 nứt dọc, 2 lún bánh',
      technical_scope: 'Cào bóc & thảm: 180 m²',
      material_scope: 'Bê tông nhựa C19: 14 m³',
      duration_days: 3,
      date_range: '18/08 - 21/08/2026',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: '18/08/2026 - 09:30',
      status: 'SUBMITTED',
      status_label: 'Chờ duyệt',
      approved_items: 8,
      total_items: 12,
      contractor_name: 'Tổ vá dặm cơ giới 01 - Đội Hoàng Hải Express'
    },
    {
      id: 'pkg-07',
      code: 'PKG-2026-07',
      title: 'Vá cào bóc thảm nhựa polime',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1033+500',
      chainage_end: 'Km 1038+000',
      chainage_display: 'Km 1033+500 - Km 1038+000',
      segments_count: 3,
      defect_count: 10,
      defect_summary: '10 điểm hư hỏng mặt lớp trên',
      technical_scope: 'Cào bóc thảm: 320 m²',
      material_scope: 'Bù vênh lu lèn: 22 tấn',
      duration_days: 2,
      date_range: '16/08 - 18/08/2026',
      created_by_name: 'Lê Văn Tùng (PM)',
      created_by_initials: 'LT',
      created_by_role: 'Kỹ sư cầu đường',
      created_at: '16/08/2026 - 15:45',
      status: 'DECIDED',
      status_label: 'Đã phê duyệt',
      approved_items: 10,
      total_items: 10,
      contractor_name: 'Xí nghiệp Cầu Đường 4'
    },
    {
      id: 'pkg-09',
      code: 'PKG-2026-09',
      title: 'Xử lý nứt rạn mai rùa phân đoạn đèo',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1042+000',
      chainage_end: 'Km 1045+500',
      chainage_display: 'Km 1042+000 - Km 1045+500',
      segments_count: 2,
      defect_count: 6,
      defect_summary: 'Nứt chân chim, rạn khối',
      technical_scope: 'Trám vết nứt: 65 m',
      material_scope: 'Nhựa polymer chèn khe',
      duration_days: 1,
      date_range: 'Dự kiến 22/08',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: 'Hôm nay - 11:15',
      status: 'DRAFT',
      status_label: 'Bản nháp',
      approved_items: 0,
      total_items: 6,
      contractor_name: 'Tổ duy tu bảo dưỡng đường bộ 03'
    },
    {
      id: 'pkg-06',
      code: 'PKG-2026-06',
      title: 'Bảo trì khe co giãn & rãnh thoát nước bê tông',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1028+000',
      chainage_end: 'Km 1028+000',
      chainage_display: 'Km 1028+000',
      segments_count: 1,
      defect_count: 4,
      defect_summary: 'Khe lún, rãnh sạt vỡ',
      technical_scope: 'Thay khe co giãn: 12 m',
      material_scope: 'Chốt thép & vữa đệm',
      duration_days: 4,
      date_range: '12/08 - 16/08/2026',
      created_by_name: 'Lê Văn Tùng (PM)',
      created_by_initials: 'LT',
      created_by_role: 'Kỹ sư cầu đường',
      created_at: '12/08/2026 - 08:00',
      status: 'DISPATCHED',
      status_label: 'Đang thi công',
      approved_items: 4,
      total_items: 4,
      contractor_name: 'Đội thi công cơ giới Cát Tường'
    },
    {
      id: 'pkg-05',
      code: 'PKG-2026-05',
      title: 'Xử lý võng nứt mặt đường đoạn trạm thu phí',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1025+400',
      chainage_end: 'Km 1026+200',
      chainage_display: 'Km 1025+400 - Km 1026+200',
      segments_count: 2,
      defect_count: 8,
      defect_summary: '3 ổ gà L2, 5 vệt nứt ngang',
      technical_scope: 'Cào bóc thảm bù: 210 m²',
      material_scope: 'Bê tông nhựa chặt C12.5: 18 m³',
      duration_days: 3,
      date_range: '05/08 - 08/08/2026',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: '05/08/2026 - 14:20',
      status: 'DECIDED',
      status_label: 'Đã phê duyệt',
      approved_items: 8,
      total_items: 8,
      contractor_name: 'Tổ vá dặm cơ giới 01 - Đội Hoàng Hải Express'
    },
    {
      id: 'pkg-04',
      code: 'PKG-2026-04',
      title: 'Tái tạo lớp ma sát & chống trơn trượt',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1039+000',
      chainage_end: 'Km 1042+000',
      chainage_display: 'Km 1039+000 - Km 1042+000',
      segments_count: 4,
      defect_count: 15,
      defect_summary: 'Bong bật cốt liệu, mòn mặt đường',
      technical_scope: 'Láng nhựa 2 lớp: 650 m²',
      material_scope: 'Nhũ tương cải tiến polyme: 3.5 tấn',
      duration_days: 5,
      date_range: '28/07 - 02/08/2026',
      created_by_name: 'Trần Văn Kiên (PM)',
      created_by_initials: 'TK',
      created_by_role: 'Kỹ sư hiện trường',
      created_at: '28/07/2026 - 10:00',
      status: 'DISPATCHED',
      status_label: 'Đang thi công',
      approved_items: 15,
      total_items: 15,
      contractor_name: 'Xí nghiệp Cầu Đường 4'
    },
    {
      id: 'pkg-03',
      code: 'PKG-2026-03',
      title: 'Gia cố lề đường & xử lý rãnh dọc thoát nước',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1031+200',
      chainage_end: 'Km 1033+000',
      chainage_display: 'Km 1031+200 - Km 1033+000',
      segments_count: 2,
      defect_count: 7,
      defect_summary: 'Sạt lở mép nhựa, lún mép rãnh',
      technical_scope: 'Bê tông lề đúc sẵn: 45 m',
      material_scope: 'Cấp phối đá dăm loại 1: 30 m³',
      duration_days: 3,
      date_range: '20/07 - 23/07/2026',
      created_by_name: 'Lê Văn Tùng (PM)',
      created_by_initials: 'LT',
      created_by_role: 'Kỹ sư cầu đường',
      created_at: '20/07/2026 - 16:30',
      status: 'SUBMITTED',
      status_label: 'Chờ duyệt',
      approved_items: 5,
      total_items: 7,
      contractor_name: 'Đội cơ động khắc phục sự cố'
    },
    {
      id: 'pkg-02',
      code: 'PKG-2026-02',
      title: 'Trám khe nứt bê tông xi măng tiếp giáp cống chui',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1027+100',
      chainage_end: 'Km 1027+300',
      chainage_display: 'Km 1027+100 - Km 1027+300',
      segments_count: 1,
      defect_count: 5,
      defect_summary: 'Khe nứt biến dạng nhiệt',
      technical_scope: 'Rót mastic bitum nóng: 35 m',
      material_scope: 'Vật liệu chèn đàn hồi cao',
      duration_days: 1,
      date_range: '15/07/2026',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: '15/07/2026 - 08:30',
      status: 'DECIDED',
      status_label: 'Đã phê duyệt',
      approved_items: 5,
      total_items: 5,
      contractor_name: 'Tổ duy tu bảo dưỡng đường bộ 03'
    },
    {
      id: 'pkg-01',
      code: 'PKG-2026-01',
      title: 'Đợt sửa chữa cấp bách nút giao cầu vượt',
      route_id: 'QL1A_PK04',
      route_name: 'QL1A - Giai đoạn 2',
      chainage_start: 'Km 1024+200',
      chainage_end: 'Km 1025+100',
      chainage_display: 'Km 1024+200 - Km 1025+100',
      segments_count: 2,
      defect_count: 9,
      defect_summary: 'Ổ gà sâu và bong tróc góc ngoặt',
      technical_scope: 'Cào bóc thảm nhựa polime: 280 m²',
      material_scope: 'Bê tông nhựa C19: 24 m³',
      duration_days: 2,
      date_range: '02/07 - 04/07/2026',
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: '02/07/2026 - 11:00',
      status: 'DECIDED',
      status_label: 'Đã phê duyệt',
      approved_items: 9,
      total_items: 9,
      contractor_name: 'Tổ vá dặm cơ giới 01'
    }
  ])

  // Trạng thái tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'>('ALL')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isPDFPreviewModalOpen, setIsPDFPreviewModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Phân trang thực tế
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  // Bộ lọc nâng cao thực tế
  const [advRoute, setAdvRoute] = useState<string>('ALL')
  const [advScale, setAdvScale] = useState<string>('ALL')
  const [advContractor, setAdvContractor] = useState<string>('ALL')
  const [tempAdvRoute, setTempAdvRoute] = useState<string>('ALL')
  const [tempAdvScale, setTempAdvScale] = useState<string>('ALL')
  const [tempAdvContractor, setTempAdvContractor] = useState<string>('ALL')

  // Xem chi tiết hồ sơ gói đề xuất (Modal / Drawer)
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<ProposalWorkPackage | null>(null)
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // MODAL TẠO GÓI ĐỀ XUẤT MỚI STATE
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formRouteId, setFormRouteId] = useState('QL1A_PK04')
  const [formSegmentId, setFormSegmentId] = useState('seg-02')
  const [formPackageName, setFormPackageName] = useState('Khắc phục hằn lún bánh xe & trám nứt Km 1028 - Km 1033')
  const [formContractor, setFormContractor] = useState('Tổ vá dặm cơ giới 01 - Đội Hoàng Hải Express')
  const [formDurationDays, setFormDurationDays] = useState(3)

  // Tuyến đường và phân đoạn hiện tại đang chọn trong form
  const currentRoute = useMemo(() => {
    return AVAILABLE_ROUTES.find((r) => r.id === formRouteId) || AVAILABLE_ROUTES[0]
  }, [formRouteId])

  const currentRouteSegments = useMemo(() => {
    return currentRoute.segments
  }, [currentRoute])

  const currentSegment = useMemo(() => {
    return (
      currentRouteSegments.find((s) => s.id === formSegmentId) ||
      currentRouteSegments[0]
    )
  }, [currentRouteSegments, formSegmentId])

  // Danh sách khiếm khuyết chưa gán gói trong Modal (khởi tạo với seg-02)
  const [unassignedDefects, setUnassignedDefects] = useState<UnassignedDefectItem[]>(
    DEFECTS_BY_SEGMENT['seg-02'] || []
  )

  // Xử lý khi chọn Tuyến đường khác -> tự động lọc phân đoạn và cập nhật khiếm khuyết
  const handleRouteChange = (newRouteId: string) => {
    setFormRouteId(newRouteId)
    const targetRoute = AVAILABLE_ROUTES.find((r) => r.id === newRouteId) || AVAILABLE_ROUTES[0]
    const defaultSeg = targetRoute.segments[0]
    setFormSegmentId(defaultSeg.id)
    setUnassignedDefects(DEFECTS_BY_SEGMENT[defaultSeg.id] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${defaultSeg.chainage_display}`)
  }

  // Xử lý khi chọn Phân đoạn khác trong cùng tuyến đường
  const handleSegmentChange = (newSegmentId: string) => {
    setFormSegmentId(newSegmentId)
    const targetSeg = currentRouteSegments.find((s) => s.id === newSegmentId) || currentRouteSegments[0]
    setUnassignedDefects(DEFECTS_BY_SEGMENT[newSegmentId] || [])
    setFormPackageName(`Bảo trì mặt đường & xử lý hư hỏng ${targetSeg.chainage_display}`)
  }

  // Tính toán khối lượng kỹ thuật tự động trong Modal
  const modalCalculations = useMemo(() => {
    const selected = unassignedDefects.filter((d) => d.selected)
    const count = selected.length
    const totalArea = selected.reduce((sum, item) => sum + item.area_m2, 0).toFixed(2)
    const totalLength = count * 15
    return {
      count,
      totalArea,
      totalLength,
      description: count > 0 ? `${totalArea} m² cào bóc / ${totalLength}m trám` : 'Chưa chọn khiếm khuyết'
    }
  }, [unassignedDefects])

  const handleToggleDefect = (id: string) => {
    setUnassignedDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    )
  }

  // Xử lý lưu bản nháp hoặc trình duyệt gói đề xuất mới
  const handleSaveDraft = (submitDirectly: boolean = false) => {
    if (modalCalculations.count === 0) {
      showToast('Vui lòng chọn ít nhất 1 khiếm khuyết để khởi tạo gói đề xuất!')
      return
    }

    const newPackage: ProposalWorkPackage = {
      id: `pkg-${Date.now()}`,
      code: `PKG-2026-${Math.floor(10 + Math.random() * 90)}`,
      title: formPackageName,
      route_id: currentRoute.id,
      route_name: currentRoute.name,
      chainage_start: currentSegment.chainage_start,
      chainage_end: currentSegment.chainage_end,
      chainage_display: currentSegment.chainage_display,
      segments_count: 1,
      defect_count: modalCalculations.count,
      defect_summary: `${modalCalculations.count} điểm hư hỏng gom mới (${currentSegment.code})`,
      technical_scope: `Cào bóc thảm: ${modalCalculations.totalArea} m²`,
      material_scope: 'Bê tông nhựa chặt C19 tiêu chuẩn',
      duration_days: formDurationDays,
      date_range: `Dự kiến ${formDurationDays} ngày`,
      created_by_name: 'Đỗ Quốc Hoàng (PM)',
      created_by_initials: 'ĐH',
      created_by_role: 'Chỉ huy trưởng dự án',
      created_at: 'Vừa tạo - Hôm nay',
      status: submitDirectly ? 'SUBMITTED' : 'DRAFT',
      status_label: submitDirectly ? 'Chờ duyệt' : 'Bản nháp',
      approved_items: 0,
      total_items: modalCalculations.count,
      contractor_name: formContractor
    }

    setPackages((prev) => [newPackage, ...prev])
    setIsCreateModalOpen(false)
    setCurrentPage(1)
    showToast(
      submitDirectly
        ? `Đã tạo và gửi trình duyệt Gói đề xuất [${newPackage.code}] sang Giám sát trưởng!`
        : `Đã lưu bản nháp Gói đề xuất [${newPackage.code}] thành công!`
    )
  }

  // Khóa & Trình duyệt gói nháp
  const handleSubmitDraftPackage = (id: string, code: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'SUBMITTED', status_label: 'Chờ duyệt' } : p
      )
    )
    showToast(`Đã khóa hồ sơ và gửi gói [${code}] lên Giám sát trưởng phê duyệt!`)
  }

  // Xóa gói nháp
  const handleDeleteDraft = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản nháp [${code}]?`)) {
      setPackages((prev) => prev.filter((p) => p.id !== id))
      showToast(`Đã xóa bản nháp [${code}].`)
    }
  }

  // Giám sát phê duyệt nhanh
  const handleQuickApprove = (id: string, code: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'DECIDED',
              status_label: 'Đã phê duyệt',
              approved_items: p.total_items
            }
          : p
      )
    )
    showToast(`[GIÁM SÁT]: Đã phê duyệt chính thức gói [${code}] và ban hành lệnh công tác!`)
  }

  // Thống kê 4 Card
  const stats = useMemo(() => {
    const draft = packages.filter((p) => p.status === 'DRAFT').length
    const submitted = packages.filter((p) => p.status === 'SUBMITTED').length
    const decided = packages.filter((p) => p.status === 'DECIDED').length
    const dispatched = packages.filter((p) => p.status === 'DISPATCHED').length
    return { draft, submitted, decided, dispatched, total: packages.length }
  }, [packages])

  // Lọc danh sách gói hiển thị
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      // Tab status filter
      if (activeFilterTab !== 'ALL' && p.status !== activeFilterTab) return false
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchCode = p.code.toLowerCase().includes(term)
        const matchTitle = p.title.toLowerCase().includes(term)
        const matchChainage = p.chainage_display.toLowerCase().includes(term)
        const matchContractor = p.contractor_name.toLowerCase().includes(term)
        if (!matchCode && !matchTitle && !matchChainage && !matchContractor) return false
      }
      // Lọc nâng cao tuyến đường
      if (advRoute !== 'ALL' && p.route_id !== advRoute) return false
      // Lọc nâng cao quy mô
      if (advScale === 'LARGE' && p.defect_count < 10) return false
      if (advScale === 'MEDIUM' && (p.defect_count < 5 || p.defect_count >= 10)) return false
      if (advScale === 'SMALL' && p.defect_count >= 5) return false
      // Lọc nâng cao tổ đội
      if (advContractor !== 'ALL' && !p.contractor_name.includes(advContractor)) return false

      return true
    })
  }, [packages, activeFilterTab, searchTerm, advRoute, advScale, advContractor])

  // Tính toán trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize))
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPackages.slice(start, start + pageSize)
  }, [filteredPackages, currentPage, pageSize])

  const handleTabChange = (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => {
    setActiveFilterTab(tab)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WORKSPACE HEADER & BREADCRUMB */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button onClick={() => navigate(`${basePath}/projects`)} className="hover:text-brand-gold cursor-pointer transition-colors">
              Dự án
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-brand-gold cursor-pointer transition-colors">QL1A - Giai đoạn 2</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-brand-gold cursor-pointer transition-colors">Sửa chữa</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#C9A227] font-semibold">Gói đề xuất kỹ thuật</span>
          </nav>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Danh mục gói đề xuất sửa chữa kỹ thuật
            </h1>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-brand-dark font-mono text-xs font-bold shadow-2xs">
              PRJ-QL1A-02 • {packages.length} Gói công việc
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tập hợp các điểm khiếm khuyết mặt đường thành gói thi công, xác định biện pháp kỹ thuật và trình nộp Giám sát trưởng phê duyệt.
          </p>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Bộ lọc nâng cao</span>
          </button>

          <button
            onClick={() => setIsPDFPreviewModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Xuất kế hoạch kỹ thuật (PDF)</span>
          </button>

          {isPM && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo gói đề xuất mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 4 STAT / TRIAGE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1: Draft */}
        <div
          onClick={() => handleTabChange(activeFilterTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
          className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
            activeFilterTab === 'DRAFT' ? 'border-[#C9A227] ring-2 ring-[#C9A227]/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Gói đang soạn thảo</span>
              <span className="text-3xl font-bold text-brand-dark">{stats.draft.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Chưa khóa trình duyệt, đang gom lỗi</span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-600">
              DRAFT
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400"></div>
        </div>

        {/* Stat 2: Submitted */}
        <div
          onClick={() => handleTabChange(activeFilterTab === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
          className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
            activeFilterTab === 'SUBMITTED' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700">Gói chờ duyệt</span>
              <span className="text-3xl font-bold text-amber-600">{stats.submitted.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Supervisor thẩm định (SLA &le; 14h)</span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
              SUBMITTED
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Stat 3: Decided */}
        <div
          onClick={() => handleTabChange(activeFilterTab === 'DECIDED' ? 'ALL' : 'DECIDED')}
          className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
            activeFilterTab === 'DECIDED' ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">Gói đã phê duyệt</span>
              <span className="text-3xl font-bold text-emerald-700">{stats.decided.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Đã ký số, chuẩn bị phát lệnh</span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
              DECIDED
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600"></div>
        </div>

        {/* Stat 4: Dispatched */}
        <div
          onClick={() => handleTabChange(activeFilterTab === 'DISPATCHED' ? 'ALL' : 'DISPATCHED')}
          className={`bg-white rounded-2xl p-5 shadow-2xs border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
            activeFilterTab === 'DISPATCHED' ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-blue-800">Gói đang thi công</span>
              <span className="text-3xl font-bold text-blue-700">{stats.dispatched.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Construction className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tổ thi công rải thảm và vá dặm</span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-100 text-blue-800">
              DISPATCHED
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
        </div>
      </div>

      {/* 4. MAIN DATA CONTAINER & WORK PACKAGES TABLE */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-brand-border space-y-4">
        {/* Search & Filter Tab Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo mã gói, tên công việc hoặc lý trình..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C9A227] transition-all font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => handleTabChange('ALL')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilterTab === 'ALL'
                  ? 'bg-[#C9A227] text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => handleTabChange('SUBMITTED')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilterTab === 'SUBMITTED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Chờ duyệt ({stats.submitted})
            </button>
            <button
              onClick={() => handleTabChange('DECIDED')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilterTab === 'DECIDED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Đã duyệt ({stats.decided})
            </button>
            <button
              onClick={() => handleTabChange('DISPATCHED')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilterTab === 'DISPATCHED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Đang thi công ({stats.dispatched})
            </button>
            <button
              onClick={() => handleTabChange('DRAFT')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilterTab === 'DRAFT'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Bản nháp ({stats.draft})
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã gói</th>
                <th className="py-3 px-4">Tên gói công việc &amp; Phạm vi lý trình</th>
                <th className="py-3 px-4">Hạng mục lỗi</th>
                <th className="py-3 px-4">Khối lượng kỹ thuật dự kiến</th>
                <th className="py-3 px-4">Thời gian thi công</th>
                <th className="py-3 px-4">Người lập / Ngày trình</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 min-w-[160px]">Tiến độ phê duyệt</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPackages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy gói đề xuất kỹ thuật nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedPackages.map((pkg) => {
                  const percent = Math.round((pkg.approved_items / (pkg.total_items || 1)) * 100)

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Mã gói */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <button
                          onClick={() => navigate(`${basePath}/proposals/${pkg.id}`)}
                          type="button"
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs cursor-pointer hover:opacity-90 transition ${
                            pkg.status === 'SUBMITTED'
                              ? 'bg-[#C9A227] text-white'
                              : pkg.status === 'DECIDED'
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : pkg.status === 'DISPATCHED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                          title="Bấm để mở chi tiết thẩm duyệt (WF-07)"
                        >
                          {pkg.code}
                        </button>
                      </td>

                      {/* Tên gói công việc & Lý trình */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => navigate(`${basePath}/proposals/${pkg.id}`)}
                            type="button"
                            className="text-left font-bold text-sm text-brand-dark group-hover:text-[#C9A227] transition-colors line-clamp-1 cursor-pointer"
                            title="Bấm để mở chi tiết thẩm duyệt (WF-07)"
                          >
                            {pkg.title}
                          </button>
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                              {pkg.chainage_display}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500 font-sans">{pkg.segments_count} phân đoạn</span>
                          </div>
                        </div>
                      </td>

                      {/* Hạng mục lỗi */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{pkg.defect_count} hạng mục</span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[180px]">{pkg.defect_summary}</span>
                        </div>
                      </td>

                      {/* Khối lượng kỹ thuật dự kiến */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900">{pkg.technical_scope}</span>
                          <span className="text-slate-500 text-[11px]">{pkg.material_scope}</span>
                        </div>
                      </td>

                      {/* Thời gian thi công */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{pkg.duration_days} ngày</span>
                          <span className="text-slate-500 text-[11px]">{pkg.date_range}</span>
                        </div>
                      </td>

                      {/* Người lập / Ngày trình */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-2xs ${
                              pkg.created_by_initials === 'ĐH'
                                ? 'bg-[#C9A227] text-white'
                                : 'bg-slate-600 text-white'
                            }`}
                          >
                            {pkg.created_by_initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{pkg.created_by_name}</span>
                            <span className="text-[10px] text-slate-400">{pkg.created_at}</span>
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        {pkg.status === 'SUBMITTED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            SUBMITTED
                          </span>
                        )}
                        {pkg.status === 'DECIDED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            DECIDED
                          </span>
                        )}
                        {pkg.status === 'DISPATCHED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            DISPATCHED
                          </span>
                        )}
                        {pkg.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            DRAFT
                          </span>
                        )}
                      </td>

                      {/* Tiến độ phê duyệt */}
                      <td className="py-4 px-4 align-top min-w-[160px]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              {pkg.status === 'DRAFT'
                                ? 'Chưa gửi trình'
                                : pkg.status === 'DISPATCHED'
                                ? 'Hiện trường thực hiện'
                                : `${pkg.approved_items}/${pkg.total_items} hạng mục duyệt`}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                pkg.status === 'DECIDED'
                                  ? 'text-emerald-700'
                                  : pkg.status === 'DISPATCHED'
                                  ? 'text-blue-700'
                                  : 'text-[#8F7212]'
                              }`}
                            >
                              {pkg.status === 'DRAFT' ? '0%' : `${percent}%`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                pkg.status === 'DECIDED'
                                  ? 'bg-emerald-600'
                                  : pkg.status === 'DISPATCHED'
                                  ? 'bg-blue-600'
                                  : 'bg-[#C9A227]'
                              }`}
                              style={{ width: `${pkg.status === 'DRAFT' ? 0 : percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="relative flex items-center justify-end gap-1.5">
                          {/* Vai trò Supervisor: Thẩm định hoặc Duyệt nhanh */}
                          {isSupervisor && pkg.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleQuickApprove(pkg.id, pkg.code)}
                              type="button"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Phê duyệt nhanh</span>
                            </button>
                          )}

                          {/* Vai trò PM: Khóa & Trình duyệt nếu là DRAFT */}
                          {isPM && pkg.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => handleSubmitDraftPackage(pkg.id, pkg.code)}
                                type="button"
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                title="Khóa hồ sơ và gửi Giám sát trưởng"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Khóa &amp; Trình duyệt</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDraft(pkg.id, pkg.code)}
                                type="button"
                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Xóa nháp"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Nút xem chi tiết / thẩm định */}
                          <button
                            onClick={() => navigate(`${basePath}/proposals/${pkg.id}`)}
                            type="button"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>{isSupervisor ? 'Thẩm định (WF-07)' : 'Xem hồ sơ'}</span>
                          </button>

                          {/* Nút Menu thêm */}
                          <button
                            onClick={() => setActiveRowMenuId(activeRowMenuId === pkg.id ? null : pkg.id)}
                            type="button"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Tùy chọn khác"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu Tùy Chọn */}
                          {activeRowMenuId === pkg.id && (
                            <div className="absolute right-0 top-8 z-30 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-left text-xs animate-in fade-in">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(pkg.code)
                                  showToast(`Đã sao chép mã gói [${pkg.code}] vào bộ nhớ tạm!`)
                                  setActiveRowMenuId(null)
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5 text-[#C9A227]" />
                                <span>Sao chép mã gói</span>
                              </button>
                              <button
                                onClick={() => {
                                  navigate(`${basePath}/proposals/${pkg.id}`)
                                  setActiveRowMenuId(null)
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Thẩm định chi tiết (WF-07)</span>
                              </button>
                              <button
                                onClick={() => {
                                  showToast(`Đang kết xuất bảng BOQ chi tiết gói ${pkg.code}...`)
                                  setActiveRowMenuId(null)
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tải bảng dự toán BOQ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <span>
            Hiển thị{' '}
            <strong className="text-slate-800">
              {filteredPackages.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredPackages.length)}
            </strong>{' '}
            trên tổng số <strong className="text-slate-800">{filteredPackages.length}</strong> gói đề xuất (tổng kho:{' '}
            {packages.length})
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                type="button"
                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors cursor-pointer text-xs ${
                  currentPage === pageNum
                    ? 'bg-[#C9A227] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODAL 1: KHỞI TẠO GÓI ĐỀ XUẤT SỬA CHỮA KỸ THUẬT MỚI (STITCH DESIGN MODAL) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227] shrink-0">
                  <Plus className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Khởi tạo gói đề xuất sửa chữa kỹ thuật mới</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gom các khiếm khuyết độc lập thành gói thi công tập trung để tối ưu hóa máy móc và nhân lực.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Tên gói */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[11px]">
                  Tên gói đề xuất công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPackageName}
                  onChange={(e) => setFormPackageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              {/* Tuyến đường & Phân đoạn lý trình (Phân cấp) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Dự án / Tuyến đường <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRouteId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    {AVAILABLE_ROUTES.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Phạm vi lý trình / Phân đoạn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSegmentId}
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    {currentRouteSegments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.code}: {seg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Đơn vị thi công & Thời gian thi công */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Đơn vị thi công dự kiến <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formContractor}
                    onChange={(e) => setFormContractor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    <option value="Tổ vá dặm cơ giới 01 - Đội Hoàng Hải Express">
                      Tổ vá dặm cơ giới 01 - Đội Hoàng Hải Express
                    </option>
                    <option value="Tổ rải thảm nóng Polime 02 - Xí nghiệp Cầu Đường 4">
                      Tổ rải thảm nóng Polime 02 - Xí nghiệp Cầu Đường 4
                    </option>
                    <option value="Đội cơ động khắc phục sự cố khẩn cấp Sơn Trà">
                      Đội cơ động khắc phục sự cố khẩn cấp Sơn Trà
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Thời gian thi công dự kiến
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(parseInt(e.target.value, 10) || 1)}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">ngày kể từ khi được duyệt</span>
                  </div>
                </div>
              </div>

              {/* Danh sách khiếm khuyết chưa gán gói (Defects Picker theo Phân đoạn) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Chọn khiếm khuyết đưa vào gói (Unassigned Open Defects)
                  </label>
                  <span className="text-[11px] text-slate-600 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Đoạn {currentSegment?.code} ({currentRoute?.code}) có {unassignedDefects.length} điểm tồn đọng
                  </span>
                </div>

                {unassignedDefects.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
                    Phân đoạn này hiện không có khiếm khuyết tồn đọng nào cần lập gói sửa chữa.
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-2.5 space-y-2 border border-slate-200">
                    {unassignedDefects.map((def) => (
                      <label
                        key={def.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          def.selected
                            ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={def.selected}
                            onChange={() => handleToggleDefect(def.id)}
                            className="w-4 h-4 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#8F7212]">{def.code}</span>
                              <span className="font-semibold text-brand-dark truncate">{def.title}</span>
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                                {def.stationing}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5">{def.lane_detail}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 shrink-0 ml-3 bg-slate-100 px-2 py-0.5 rounded">
                          {def.area_m2} m² (Sâu {def.depth_cm}cm)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Technical Scope Calculation Box */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-amber-950">Tổng kết kỹ thuật tự động</span>
                    <span className="text-[11px] text-amber-900">
                      Đã chọn: <strong>{modalCalculations.count} hạng mục khiếm khuyết</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Khối lượng thi công ước tính</span>
                  <span className="font-mono text-base font-black text-[#8F7212]">
                    {modalCalculations.description}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">Bê tông nhựa C19 &amp; Mastic</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleSaveDraft(false)}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lưu bản nháp</span>
              </button>
              <button
                onClick={() => handleSaveDraft(true)}
                type="button"
                className="px-5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Khóa &amp; Trình duyệt ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL 2: BỘ LỌC NÂNG CAO */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base text-brand-dark">Bộ Lọc Gói Đề Xuất Nâng Cao</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tuyến đường</label>
                <select
                  value={tempAdvRoute}
                  onChange={(e) => setTempAdvRoute(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="ALL">Tất cả các tuyến đường</option>
                  <option value="QL1A_PK04">QL1A - Giai đoạn 2 (Km 1024 - Km 1045)</option>
                  <option value="QL1A_PK01">QL1A - Giai đoạn 1 (Km 1000 - Km 1024)</option>
                  <option value="EXPR_NORTH_SOUTH">Đường nối Cao tốc Bắc - Nam</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Quy mô số lượng khiếm khuyết</label>
                <select
                  value={tempAdvScale}
                  onChange={(e) => setTempAdvScale(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="ALL">Tất cả quy mô</option>
                  <option value="LARGE">Gói lớn (&gt; 10 khiếm khuyết)</option>
                  <option value="MEDIUM">Gói vừa (5 - 10 khiếm khuyết)</option>
                  <option value="SMALL">Gói nhỏ (&lt; 5 khiếm khuyết)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tổ đội thi công</label>
                <select
                  value={tempAdvContractor}
                  onChange={(e) => setTempAdvContractor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="ALL">Tất cả các tổ đội</option>
                  <option value="Tổ vá dặm cơ giới 01">Tổ vá dặm cơ giới 01</option>
                  <option value="Xí nghiệp Cầu Đường 4">Xí nghiệp Cầu Đường 4</option>
                  <option value="Tổ duy tu bảo dưỡng đường bộ 03">Tổ duy tu bảo dưỡng 03</option>
                  <option value="Đội cơ động">Đội cơ động khắc phục sự cố</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setTempAdvRoute('ALL')
                  setTempAdvScale('ALL')
                  setTempAdvContractor('ALL')
                  setAdvRoute('ALL')
                  setAdvScale('ALL')
                  setAdvContractor('ALL')
                  setCurrentPage(1)
                  setIsFilterModalOpen(false)
                  showToast('Đã đặt lại tất cả bộ lọc nâng cao.')
                }}
                type="button"
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  type="button"
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setAdvRoute(tempAdvRoute)
                    setAdvScale(tempAdvScale)
                    setAdvContractor(tempAdvContractor)
                    setCurrentPage(1)
                    setIsFilterModalOpen(false)
                    showToast('Đã áp dụng các tiêu chí lọc nâng cao thành công!')
                  }}
                  type="button"
                  className="px-4 py-1.5 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL 3: XUẤT KẾ HOẠCH KỸ THUẬT PDF PREVIEW */}
      {isPDFPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base text-brand-dark">Kế Hoạch Sửa Chữa Kỹ Thuật (PDF)</h3>
              </div>
              <button
                onClick={() => setIsPDFPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-800">CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG CÁT TƯỜNG</div>
              <div className="text-slate-600">Ban Điều Hành Dự Án Bảo Trì Quốc Lộ 1A (PK-04)</div>
              <div className="font-mono text-[11px] text-slate-500">Mã văn bản: KH-2026/QL1A-PK04-O&amp;M</div>
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                Tập hợp tổng hợp <strong>{packages.length} gói đề xuất kỹ thuật</strong> với tổng số{' '}
                <strong className="text-brand-dark font-mono">
                  {packages.reduce((sum, p) => sum + p.defect_count, 0)} hạng mục khiếm khuyết
                </strong>{' '}
                được lập phương án thi công trên toàn tuyến.
              </div>
              <div className="text-[11px] text-slate-500">
                • Trạng thái hồ sơ: Đã đồng bộ với máy chủ O&amp;M Cát Tường
                <br />
                • Tiêu chuẩn nghiệm thu: TCVN 8819:2011 &amp; QCVN 41:2019/BGTVT
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPDFPreviewModalOpen(false)}
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsPDFPreviewModalOpen(false)
                  showToast('Đang tạo và tải xuống file PDF: Ke_hoach_ky_thuat_QL1A_PK04.pdf')
                }}
                type="button"
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Tải xuống file PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL 4: CHI TIẾT HỒ SƠ GÓI ĐỀ XUẤT KỸ THUẬT (WF-07 DETAIL POPUP) */}
      {selectedPackageForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header chi tiết */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0 ${
                    selectedPackageForDetail.status === 'SUBMITTED'
                      ? 'bg-[#C9A227] text-white'
                      : selectedPackageForDetail.status === 'DECIDED'
                      ? 'bg-emerald-600 text-white'
                      : selectedPackageForDetail.status === 'DISPATCHED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {selectedPackageForDetail.code.split('-').pop()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                      {selectedPackageForDetail.code}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedPackageForDetail.status === 'SUBMITTED'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedPackageForDetail.status === 'DECIDED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPackageForDetail.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {selectedPackageForDetail.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Snapshot: v1.0 (Immutable)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-dark mt-1">
                    {selectedPackageForDetail.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>Tuyến: <strong className="text-slate-700">{selectedPackageForDetail.route_name}</strong></span>
                    <span>•</span>
                    <span>Phạm vi: <strong className="text-slate-700 font-mono">{selectedPackageForDetail.chainage_display}</strong></span>
                    <span>•</span>
                    <span>Nhà thầu: <strong className="text-slate-700">{selectedPackageForDetail.contractor_name}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPackageForDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: Danh sách các RepairItems trong gói theo đúng WF-07 */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Số lượng khiếm khuyết</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {selectedPackageForDetail.defect_count} hạng mục
                  </span>
                  <span className="text-[11px] text-slate-500">{selectedPackageForDetail.defect_summary}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Khối lượng kỹ thuật dự toán</span>
                  <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
                    {selectedPackageForDetail.technical_scope}
                  </span>
                  <span className="text-[11px] text-slate-500">{selectedPackageForDetail.material_scope}</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-900 font-medium block">Thời hạn &amp; Tiến độ kế hoạch</span>
                  <span className="text-lg font-mono font-black text-[#8F7212] mt-0.5 block">
                    {selectedPackageForDetail.duration_days} ngày thi công
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Kế hoạch: {selectedPackageForDetail.date_range}
                  </span>
                </div>
              </div>

              {/* Danh sách RepairItems chi tiết */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-brand-dark">
                    Danh sách hạng mục sửa chữa chi tiết (RepairItems - {selectedPackageForDetail.defect_count})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tiến độ thẩm định: {selectedPackageForDetail.approved_items}/{selectedPackageForDetail.total_items} mục đạt
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  <div className="p-3 bg-slate-50/70 flex items-center justify-between gap-3 text-slate-600 font-semibold text-[11px]">
                    <span className="w-24">Mã hư hỏng</span>
                    <span className="w-32">Lý trình / Vị trí</span>
                    <span className="flex-1">Phương án kỹ thuật &amp; Vật tư</span>
                    <span className="w-32 text-right">Khối lượng &amp; Quy cách</span>
                    <span className="w-24 text-right">Trạng thái</span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-102</span>
                    <span className="w-32 font-mono text-slate-600">Km 1029+200 (Làn phải)</span>
                    <span className="flex-1 text-slate-700">Cào bóc 5cm, trám thảm BTN C19 lu lèn tiêu chuẩn</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">0.45 m² (Sâu 5.2cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        APPROVED
                      </span>
                    </span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-105</span>
                    <span className="w-32 font-mono text-slate-600">Km 1029+800 (Tim đường)</span>
                    <span className="flex-1 text-slate-700">Xẻ rãnh làm sạch, thổi bụi và rót nhựa mastic polymer</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">0.85 m² (Sâu 3.1cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        APPROVED
                      </span>
                    </span>
                  </div>

                  <div className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <span className="w-24 font-mono font-bold text-slate-900">DEF-108</span>
                    <span className="w-32 font-mono text-slate-600">Km 1030+150 (Vệt bánh)</span>
                    <span className="flex-1 text-slate-700">Cào bóc sâu 4.5cm, bù vênh đá dăm lu lèn lớp mặt C19</span>
                    <span className="w-32 text-right font-mono font-semibold text-slate-900">1.25 m² (Sâu 4.5cm)</span>
                    <span className="w-24 text-right">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer hành động theo vai trò */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Người lập: <strong className="text-slate-800">{selectedPackageForDetail.created_by_name}</strong> •{' '}
                {selectedPackageForDetail.created_at}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPackageForDetail(null)}
                  type="button"
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Đóng
                </button>

                {/* Nếu Supervisor và gói đang SUBMITTED */}
                {isSupervisor && selectedPackageForDetail.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => {
                        handleQuickApprove(selectedPackageForDetail.id, selectedPackageForDetail.code)
                        setSelectedPackageForDetail((prev) =>
                          prev
                            ? { ...prev, status: 'DECIDED', status_label: 'Đã phê duyệt', approved_items: prev.total_items }
                            : null
                        )
                      }}
                      type="button"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt chính thức gói</span>
                    </button>
                  </>
                )}

                {/* Nếu PM và gói đang DRAFT */}
                {isPM && selectedPackageForDetail.status === 'DRAFT' && (
                  <button
                    onClick={() => {
                      handleSubmitDraftPackage(selectedPackageForDetail.id, selectedPackageForDetail.code)
                      setSelectedPackageForDetail((prev) =>
                        prev ? { ...prev, status: 'SUBMITTED', status_label: 'Chờ duyệt' } : null
                      )
                    }}
                    type="button"
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Khóa &amp; Trình duyệt gói</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
