import { AIDetectionItem } from './types'

export const INITIAL_DETECTIONS: AIDetectionItem[] = [
    {
      id: 'DET-01',
      code: '#DET-01',
      stationing: 'Km 1024+350',
      lane: 'Làn phải',
      type: 'Ổ gà cấp 3',
      severityLevel: 'L3 (Nghiêm trọng)',
      confidence: 94,
      description: 'Ổ gà sâu, bong bật lớp bê tông nhựa C19, lộ cốt liệu đá 1x2',
      metrics: {
        area: '0.27 m²',
        depth: '6.8 cm'
      },
      status: 'PENDING',
      kmValue: 1024.35,
      bbox: {
        top: '34%',
        left: '28%',
        width: '42%',
        height: '38%',
        label: '[AI #DET-01] Ổ gà cấp độ 3 (Pothole L3) • 94%',
        dims: 'Dài 60cm × Rộng 45cm • Sâu 6.8cm',
        borderColor: '#EF4444'
      }
    },
    {
      id: 'DET-02',
      code: '#DET-02',
      stationing: 'Km 1025+110',
      lane: 'Làn giữa',
      type: 'Nứt dọc',
      severityLevel: 'L2 (Trung bình)',
      confidence: 88,
      description: 'Vết nứt dọc dạng chân chim liên tục theo vệt bánh xe',
      metrics: {
        length: '1.8 m',
        crackWidth: '4.2 mm'
      },
      status: 'PENDING',
      kmValue: 1025.11,
      bbox: {
        top: '16%',
        left: '72%',
        width: '18%',
        height: '55%',
        label: '[AI #DET-02] Nứt dọc • 88%',
        dims: 'L: 1.8m • Khe: 4.2mm',
        borderColor: '#F97316',
        isDashed: true
      }
    },
    {
      id: 'DET-03',
      code: '#DET-03',
      stationing: 'Km 1025+890',
      lane: 'Lề đường',
      type: 'Vỡ mép thảm',
      severityLevel: 'L2 (Trung bình)',
      confidence: 91,
      description: 'Vỡ mép thảm bê tông nhựa cạnh rãnh thu nước dọc tuyến',
      metrics: {
        length: '1.2 m',
        area: '0.18 m²',
        reviewer: 'KS. Đỗ Quốc Hoàng'
      },
      status: 'APPROVED',
      defectCode: 'DEF-2026-0120',
      kmValue: 1025.89,
      bbox: {
        top: '65%',
        left: '10%',
        width: '25%',
        height: '25%',
        label: '[AI #DET-03] ĐÃ DUYỆT → DEF-2026-0120',
        dims: 'L: 1.2m • Rộng 15cm',
        borderColor: '#10B981'
      }
    },
    {
      id: 'DET-04',
      code: '#DET-04',
      stationing: 'Km 1026+420',
      lane: 'Vệt bánh xe',
      type: 'Bóng nước / Phản xạ',
      severityLevel: 'Bỏ qua',
      confidence: 62,
      description: 'Vũng nước phản xạ ánh nắng gây hiểu nhầm ổ gà',
      metrics: {
        dismissReason: 'Phản chiếu bóng cây và đọng nước mặt đường sau mưa'
      },
      status: 'REJECTED',
      kmValue: 1026.42,
      bbox: {
        top: '40%',
        left: '50%',
        width: '20%',
        height: '20%',
        label: '[AI #DET-04] BỎ QUA - FALSE POSITIVE',
        dims: 'Độ tin cậy ban đầu: 62%',
        borderColor: '#94A3B8'
      }
    },
    {
      id: 'DET-05',
      code: '#DET-05',
      stationing: 'Km 1027+100',
      lane: 'Làn trái',
      type: 'Nứt chéo khe co giãn',
      severityLevel: 'L2 (Cần xử lý)',
      confidence: 79,
      description: 'Nứt chéo bề mặt khu vực tiếp giáp khe co giãn cầu vượt',
      metrics: {
        length: '0.95 m',
        crackWidth: '3.5 mm'
      },
      status: 'PENDING',
      kmValue: 1027.1,
      bbox: {
        top: '20%',
        left: '30%',
        width: '30%',
        height: '35%',
        label: '[AI #DET-05] Nứt chéo • 79%',
        dims: 'L: 0.95m • Khe: 3.5mm',
        borderColor: '#0284C7'
      }
    },
    {
      id: 'DET-06',
      code: '#DET-06',
      stationing: 'Km 1027+850',
      lane: 'Làn giữa',
      type: 'Bong tróc vi mô',
      severityLevel: 'L1 (Nhẹ)',
      confidence: 75,
      description: 'Bề mặt nhựa asphalt mất lớp nhựa mịn, trồi cát hạt',
      metrics: {
        area: '0.45 m²',
        depth: '1.2 cm'
      },
      status: 'PENDING',
      kmValue: 1027.85,
      bbox: {
        top: '55%',
        left: '60%',
        width: '22%',
        height: '25%',
        label: '[AI #DET-06] Bong tróc • 75%',
        dims: 'Diện tích: 0.45 m²',
        borderColor: '#0284C7'
      }
    },
    {
      id: 'DET-07',
      code: '#DET-07',
      stationing: 'Km 1028+600',
      lane: 'Làn xe tải',
      type: 'Hằn lún vệt bánh xe',
      severityLevel: 'L3 (Nghiêm trọng)',
      confidence: 86,
      description: 'Hằn lún sống trâu liên tục dọc vệt bánh xe tải nặng',
      metrics: {
        length: '4.5 m',
        depth: '3.2 cm'
      },
      status: 'PENDING',
      kmValue: 1028.6,
      bbox: {
        top: '25%',
        left: '15%',
        width: '24%',
        height: '60%',
        label: '[AI #DET-07] Lún vệt bánh xe • 86%',
        dims: 'Dài 4.5m • Lún sâu 3.2cm',
        borderColor: '#EF4444'
      }
    },
    {
      id: 'DET-08',
      code: '#DET-08',
      stationing: 'Km 1029+400',
      lane: 'Toàn mặt đường',
      type: 'Nứt ngang mặt đường',
      severityLevel: 'L2 (Trung bình)',
      confidence: 82,
      description: 'Vết nứt ngang vuông góc với tim đường xuyên suốt 2 làn xe',
      metrics: {
        length: '7.0 m',
        crackWidth: '2.8 mm'
      },
      status: 'PENDING',
      kmValue: 1029.4,
      bbox: {
        top: '48%',
        left: '5%',
        width: '90%',
        height: '14%',
        label: '[AI #DET-08] Nứt ngang • 82%',
        dims: 'L: 7.0m • Khe: 2.8mm',
        borderColor: '#F97316'
      }
    }
]
