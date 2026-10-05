import { RouteOption } from './types'

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
