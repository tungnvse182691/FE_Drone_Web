import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { HubProject } from '../../types/domain'

export type { HubProject }

export const INITIAL_HUB_PROJECTS: HubProject[] = [
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Đoạn Km 1020 đến Km 1045',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 1020.0,
    end_km: 1045.0,
    stationing_text: 'Km 1020+000 → Km 1045+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Chính',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 65,
    days_remaining: 180,
    length_km: 156.0,
    open_defects: 12,
    repair_packages: 3,
    image_url: 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '15.5 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    region: 'Miền Bắc',
    location_detail: 'Nghệ An',
    start_km: 430.0,
    end_km: 479.3,
    stationing_text: 'Km 430+000 → Km 479+300',
    status: 'NEAR_EXPIRY',
    status_label: 'Sắp hết hạn',
    status_color: '#BA1A1A',
    pm_name: 'Trần Minh Tâm',
    pm_email: 'tam.tm@hoanghai-infra.vn',
    pm_role_badge: 'PM Tuyến',
    warranty_passed_percent: 92,
    days_remaining: 25,
    length_km: 49.3,
    open_defects: 5,
    repair_packages: 1,
    image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '12.8 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-dt741-04',
    code: 'PRJ-DT741-04',
    name: 'Đường tỉnh ĐT-741 (Bình Dương)',
    region: 'Miền Nam',
    location_detail: 'Bình Dương',
    start_km: 0.0,
    end_km: 32.8,
    stationing_text: 'Km 0+000 → Km 32+800',
    status: 'PENDING_ALIGNMENT',
    status_label: 'Chờ duyệt tuyến',
    status_color: '#D97706',
    pm_name: 'Chưa phân công PM',
    pm_email: 'Cần gán PM trước khi kích hoạt tim tuyến',
    pm_role_badge: 'Chưa gán',
    warranty_passed_percent: 0,
    days_remaining: 730,
    length_km: 32.8,
    open_defects: 0,
    repair_packages: 0,
    image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    is_assigned: false,
    is_restricted_for_pm: false,
    kml_status: 'Đang thẩm định',
    retention_amount: '6.2 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-ptdg-03',
    code: 'PRJ-PTDG-03',
    name: 'Cao tốc Phan Thiết - Dầu Giây (GĐ 1)',
    region: 'Miền Nam',
    location_detail: 'Bình Thuận - Đồng Nai',
    start_km: 0.0,
    end_km: 99.0,
    stationing_text: 'Km 0+000 → Km 99+000',
    status: 'RESTRICTED',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Lê Văn Cường',
    pm_email: 'cuong.lv@hoanghai-infra.vn',
    pm_role_badge: 'PM Phụ trách',
    warranty_passed_percent: 38,
    days_remaining: 450,
    length_km: 99.0,
    open_defects: 8,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: true,
    kml_status: 'Đã phê duyệt',
    retention_amount: '18.4 tỷ ₫ (5% HĐ)'
  },
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    region: 'Miền Trung',
    location_detail: 'Huế - Đà Nẵng',
    start_km: 0.0,
    end_km: 66.0,
    stationing_text: 'Km 0+000 → Km 66+000',
    status: 'ACTIVE',
    status_label: 'Đang bảo hành',
    status_color: '#1B5E20',
    pm_name: 'Đỗ Quốc Hoàng',
    pm_email: 'pmhoang@gmail.com',
    pm_role_badge: 'PM Phụ trách',
    pm_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    warranty_passed_percent: 42,
    days_remaining: 310,
    length_km: 66.0,
    open_defects: 7,
    repair_packages: 2,
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    is_assigned: true,
    is_restricted_for_pm: false,
    kml_status: 'Đã phê duyệt',
    retention_amount: '11.0 tỷ ₫ (5% HĐ)'
  }
]

export const projectService = {
  getProjects(): HubProject[] {
    return getFromStorage<HubProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_HUB_PROJECTS)
  },

  getProjectById(id: string): HubProject | undefined {
    const projects = this.getProjects()
    return projects.find((p) => p.id === id || p.code === id)
  },

  createProject(newProject: HubProject): HubProject {
    const projects = this.getProjects()
    const updated = [newProject, ...projects]
    saveToStorage(STORAGE_KEYS.PROJECTS, updated)
    return newProject
  },

  updateProjectStatus(id: string, status: HubProject['status']): HubProject | null {
    const projects = this.getProjects()
    let updatedProj: HubProject | null = null
    const updated = projects.map((p) => {
      if (p.id === id || p.code === id) {
        updatedProj = { ...p, status }
        return updatedProj
      }
      return p
    })
    if (updatedProj) {
      saveToStorage(STORAGE_KEYS.PROJECTS, updated)
    }
    return updatedProj
  },

  resetProjects(): void {
    saveToStorage(STORAGE_KEYS.PROJECTS, INITIAL_HUB_PROJECTS)
  }
}
