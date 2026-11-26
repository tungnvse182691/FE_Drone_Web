import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
export interface DefectTypeOption {code:string;name:string}
export const defectTypeCatalog = {
  async read(signal?:AbortSignal):Promise<DefectTypeOption[]> {
    if(useAuthStore.getState().user?.role!==RoleCode.PROJECT_MANAGER)throw new Error('Chỉ PM được đọc danh mục loại lỗi.')
    const {data}=await apiClient.get('/catalog/defect-types',{signal,withCredentials:true})
    if(!Array.isArray(data)||data.some((d:DefectTypeOption)=>!d.code||!d.name)||new Set(data.map(d=>d.code)).size!==data.length)throw new Error('Danh mục loại lỗi sai contract.')
    return data
  }
}
