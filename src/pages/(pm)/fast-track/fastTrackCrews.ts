import { CrewTeam } from './types'

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
