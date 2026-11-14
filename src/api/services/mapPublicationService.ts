import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { pavementService, type PavementLayoutView } from './pavementService'

export interface PublicationLayer { key: string; status?: string | null; count: number; reasonCodes?: string[] | null; spatialSrid?: number | null }
export interface PublicationManifest { publicationId: string; projectId: string; routeVersionId: string; segmentSetId: string; layoutRevisionId: string; contentHash: string; sampleOnly: boolean; layers: PublicationLayer[] }
export interface PublicationPage { publicationId: string; contentHash: string; layer: string; features: Array<{id?:string|null;layer?:string|null;geometry?:{type?:string|null;coordinates?:unknown};properties?:unknown}>; nextCursor?: string | null }
type Pins = Pick<PublicationManifest, 'projectId' | 'routeVersionId' | 'segmentSetId' | 'layoutRevisionId'>
interface Command { actor: string; pins: Pins; hash: string; key: string; body: { layoutRevisionId: string; publicationMode: 'SAMPLE'; reason: string }; receipt?: PublicationManifest }
const hashValid = (hash: string) => /^[a-f0-9]{64}$/i.test(hash)
const storageKey = (project: string) => `rg_map_publication_${useAuthStore.getState().user?.id}_${project}`
function scope(project: string, write = false) {
  const state = useAuthStore.getState(), actor = state.user?.id, epoch = state.authEpoch
  if (!project || !state.isAuthenticated || !actor || (write ? state.user?.role !== RoleCode.PROJECT_MANAGER : ![RoleCode.PROJECT_MANAGER,RoleCode.SUPERVISOR].includes(state.user!.role))) throw new Error('Cần đúng dự án và quyền công bố PM / đọc PM, Giám sát.')
  return () => { const now = useAuthStore.getState(); if (!now.isAuthenticated || now.user?.id !== actor || now.authEpoch !== epoch || now.user?.role !== state.user?.role) throw new Error('Phiên đã thay đổi; bỏ phản hồi công bố cũ.') }
}
function verify(value: PublicationManifest, pins: Pins, id?: string) {
  if (!value?.publicationId || id && value.publicationId !== id || !hashValid(value.contentHash) || !Array.isArray(value.layers) || new Set(value.layers.map(l=>l.key)).size !== value.layers.length || value.layers.some(l=>!l.key) || Object.entries(pins).some(([k,v])=>value[k as keyof Pins] !== v)) throw new Error('Publication trả sai pins, hash hoặc manifest.')
  return value
}
const running = new Set<string>()
export const mapPublicationService = {
  pending(project: string): Command | null { const raw = sessionStorage.getItem(storageKey(project)); return raw ? JSON.parse(raw) : null },
  async read(pins: Pins, id: string) {
    const current = scope(pins.projectId)
    const {data} = await apiClient.get<PublicationManifest>(`/projects/${pins.projectId}/geometry-map-publications/${id}`)
    current(); verify(data, pins, id)
    const held = this.pending(pins.projectId)
    if (held?.receipt?.publicationId === id && held.receipt.contentHash !== data.contentHash) throw new Error('Readback không khớp hash receipt.')
    return data
  },
  async publish(source: PavementLayoutView, section: string, reason: string, onReceipt: (id: string) => void) {
    const current = scope(source.projectId, true), key = storageKey(source.projectId)
    if (running.has(key)) throw new Error('Đang công bố hoặc đọc lại; không gửi trùng.')
    let held = this.pending(source.projectId)
    if (held && (held.actor !== useAuthStore.getState().user!.id || held.pins.layoutRevisionId !== source.id || held.pins.routeVersionId !== source.routeVersionId || held.pins.segmentSetId !== source.segmentSetId || held.hash !== source.contentHash)) throw new Error('Có lệnh công bố khác đang giữ; mở đúng nguồn để đối chiếu.')
    if (!held) {
      if (!reason.trim() || !hashValid(source.contentHash)) throw new Error('Cần lý do và hash layout đã lưu.')
      held = { actor: useAuthStore.getState().user!.id, pins: {projectId:source.projectId,routeVersionId:source.routeVersionId,segmentSetId:source.segmentSetId,layoutRevisionId:source.id}, hash:source.contentHash, key:crypto.randomUUID(), body:{layoutRevisionId:source.id,publicationMode:'SAMPLE',reason:reason.trim()} }
      sessionStorage.setItem(key, JSON.stringify(held))
    }
    running.add(key)
    try {
      if (!held.receipt) {
        const fresh = await pavementService.read(source.projectId, source.id); current()
        if (fresh.contentHash !== held.hash || fresh.routeVersionId !== held.pins.routeVersionId || fresh.segmentSetId !== held.pins.segmentSetId) throw new Error('Layout nguồn đã đổi hash/pins; giữ lệnh, không POST.')
        await pavementService.discover(source.projectId, section, source.routeVersionId, source.segmentSetId); current()
        const response = await apiClient.post<PublicationManifest>(`/projects/${source.projectId}/geometry-map-publications`, held.body, {headers:{'Idempotency-Key':held.key,'If-Match':`"${held.hash}"`}})
        current()
        // Preserve receipt before validation/readback; never POST again after a received identity.
        held.receipt = response.data; sessionStorage.setItem(key,JSON.stringify(held))
        if (![200,201].includes(response.status)) throw new Error(`HTTP ${response.status}: giữ receipt để đối chiếu.`)
      }
      const receipt = verify(held.receipt!, held.pins)
      onReceipt(receipt.publicationId)
      const result = await this.read(held.pins, receipt.publicationId); current()
      if (result.contentHash !== receipt.contentHash || result.sampleOnly !== true) throw new Error('Readback không khớp hash/SAMPLE receipt.')
      return result
    } finally { running.delete(key) }
  },
  async page(manifest: PublicationManifest, layer: string, cursor?: string): Promise<PublicationPage> {
    const current = scope(manifest.projectId)
    verify(manifest,{projectId:manifest.projectId,routeVersionId:manifest.routeVersionId,segmentSetId:manifest.segmentSetId,layoutRevisionId:manifest.layoutRevisionId})
    if (!manifest.layers.some(l=>l.key === layer)) throw new Error('Layer không thuộc manifest.')
    const {data} = await apiClient.get<PublicationPage>(`/projects/${manifest.projectId}/geometry-map-publications/${manifest.publicationId}/layers/${encodeURIComponent(layer)}`, {params:{expectedContentHash:manifest.contentHash,routeVersionId:manifest.routeVersionId,segmentSetId:manifest.segmentSetId,limit:100,...(cursor?{cursor}:{})}})
    current()
    if (data?.publicationId !== manifest.publicationId || data.contentHash !== manifest.contentHash || data.layer !== layer || !Array.isArray(data.features) || data.features.some(f=>f.layer != null && f.layer !== layer) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor || data.nextCursor === cursor)) throw new Error('Trang layer sai hash, scope hoặc cursor.')
    return data
  }
}
