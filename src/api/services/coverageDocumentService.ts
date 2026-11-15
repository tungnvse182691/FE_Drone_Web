import { apiClient } from '../client'
import { devFileBearerEnabled } from '../devFileBearer'
import { fastTrackStorage } from './fastTrackJournal'
import { useAuthStore } from '../../store/authStore'

interface Session { id:string;fileId:string;status:string;partSizeBytes:number;version:string }
interface UploadJournal {
  body:{purpose:string;projectId:string;targetId:null;fileName:string;mediaType:string;sizeBytes:number;checksumSha256:string}
  key:string;receipt?:Session;parts:Array<{partNumber:number;eTag:string}>;leases:Record<number,string>
  complete?:{key:string;etag:string;body:{parts:Array<{partNumber:number;eTag:string}>;checksumSha256:string};receipt?:Session}
}
const running=new Set<string>()
export const coverageDocumentService={
  pending(project:string):UploadJournal|null {return JSON.parse(localStorage.getItem(fastTrackStorage(project,'document-upload')) || 'null')},
  async upload(project:string,file:File) {
    if(!devFileBearerEnabled())throw new Error('Tải tài liệu tạm chỉ bật trong dev/test local.')
    const actor=useAuthStore.getState(),epoch=actor.authEpoch
    if(!actor.user || !['PROJECT_MANAGER','SUPERVISOR'].includes(actor.user.role))throw new Error('Chưa có quyền tải tài liệu dự án.')
    const key=fastTrackStorage(project,'document-upload'),active=()=>{if(useAuthStore.getState().authEpoch!==epoch)throw new Error('Phiên đã đổi; giữ tiến độ của tài khoản cũ.')}
    if(running.has(key))throw new Error('Tệp đang được đối chiếu.')
    running.add(key)
    try {
      if(!file.size || !['application/pdf','image/jpeg','image/png'].includes(file.type))throw new Error('Chọn PDF, JPEG hoặc PNG có nội dung.')
      const bytes=await file.arrayBuffer(),sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');active()
      const body={purpose:'DOCUMENT',projectId:project,targetId:null,fileName:file.name,mediaType:file.type,sizeBytes:file.size,checksumSha256:sha}
      let held=this.pending(project)
      if(held && JSON.stringify(held.body)!==JSON.stringify(body))throw new Error('Chọn lại đúng tệp của phiên tải đang chờ; không đổi body/key.')
      if(!held){held={body,key:crypto.randomUUID(),parts:[],leases:{}};localStorage.setItem(key,JSON.stringify(held))}
      const save=()=>localStorage.setItem(key,JSON.stringify(held))
      if(!held.receipt){const r=await apiClient.post<Session>('/uploads',held.body,{headers:{'Idempotency-Key':held.key}});held.receipt=r.data;save();active()}
      if(!held.receipt?.id || !held.receipt.fileId)throw new Error('Receipt phiên tải thiếu định danh; giữ nguyên key/body để đối chiếu.')
      const read=async()=>{const r=await apiClient.get<Session>(`/uploads/${held!.receipt!.id}`);active();if(r.data.id!==held!.receipt!.id || r.data.fileId!==held!.receipt!.fileId || r.headers.etag!==`"${r.data.version}"`)throw new Error('GET phiên tải không khớp receipt/ETag.');return r.data}
      let session=await read()
      if(!held.complete && !['VERIFIED','VERIFYING'].includes(session.status)){
        if(!(session.partSizeBytes>0))throw new Error('Thiếu kích thước phần tải từ server.')
        for(let part=1;part<=Math.ceil(file.size/session.partSizeBytes);part++){
          if(held.parts.some(p=>p.partNumber===part))continue
          held.leases[part] ||= crypto.randomUUID();save()
          // A signed URL is an ephemeral capability, never stored in the journal or sent with Web/Bearer credentials.
          const {data}=await apiClient.post(`/uploads/${session.id}/part-urls`,{partNumbers:[part]},{headers:{'Idempotency-Key':held.leases[part]}});active()
          const lease=data.parts?.find((p:any)=>p.partNumber===part)
          if(!lease?.url || !Number.isFinite(Date.parse(lease.expiresAt)) || Date.parse(lease.expiresAt)<=Date.now())throw new Error('Liên kết tải thiếu hiệu lực hoặc đã hết hạn; giữ phiên/part/key để đối chiếu, chưa hoàn tất tệp.')
          const response=await fetch(lease.url,{method:'PUT',credentials:'omit',body:bytes.slice((part-1)*session.partSizeBytes,part*session.partSizeBytes)})
          const etag=response.headers.get('ETag');active()
          if(!response.ok || !etag)throw new Error('Chưa nhận ETag phần tải; chọn lại cùng tệp để tiếp tục đúng part.')
          held.parts.push({partNumber:part,eTag:etag});save()
        }
        session=await read();held.complete={key:crypto.randomUUID(),etag:`"${session.version}"`,body:{parts:held.parts,checksumSha256:sha}};save()
      }
      if(held.complete && !held.complete.receipt && !['VERIFYING','VERIFIED'].includes(session.status)){
        const r=await apiClient.post<Session>(`/uploads/${session.id}/complete`,held.complete.body,{headers:{'Idempotency-Key':held.complete.key,'If-Match':held.complete.etag}});held.complete.receipt=r.data;save();active()
      }
      if(held.complete?.receipt && (held.complete.receipt.id!==held.receipt.id || held.complete.receipt.fileId!==held.receipt.fileId))throw new Error('Receipt hoàn tất không khớp phiên/tệp; giữ journal, chưa báo thành công.')
      session=await read()
      if(session.status!=='VERIFIED')throw new Error(`Phiên tải đang ${session.status}; chưa công bố thành nguồn. Chọn lại cùng tệp để GET đối chiếu.`)
      const {data,headers}=await apiClient.get(`/files/${session.fileId}`);active()
      if(data.id!==session.fileId || data.status!=='VERIFIED' || data.checksumSha256!==sha || data.sizeBytes!==file.size || headers.etag!==`"${data.version}"`)throw new Error('GET tệp chưa khớp checksum/kích thước/ETag; giữ journal.')
      const coverage=await apiClient.get(`/projects/${project}/road-coverage`);active()
      if(coverage.data.projectId!==project || !coverage.data.sources?.some((s:any)=>s.kind==='MAINTENANCE_BASIS' && s.id===data.id))throw new Error('Tệp đã xác minh lưu trữ nhưng chưa đọc được trong nguồn căn cứ đúng dự án; giữ tiến độ để GET lại.')
      localStorage.removeItem(key)
      return data
    }finally{running.delete(key)}
  }
}
