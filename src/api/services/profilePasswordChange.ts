import { changePasswordApi, getSessionApi, type ChangePasswordRequest } from '../auth'
import { useAuthStore } from '../../store/authStore'

interface PendingPassword { actor: string; key: string; received: boolean; reviewed: boolean }
interface PasswordIntent extends PendingPassword { epoch: number; body: ChangePasswordRequest }
let intent: PasswordIntent | null = null, busy = false, revision = 0
const listeners = new Set<() => void>()
const changed = () => { revision++; listeners.forEach(fn => fn()) }
const storageKey = (actor: string) => `rg_profile_password_${actor}`
const currentActor = () => useAuthStore.getState().user?.id
useAuthStore.subscribe((state,previous)=>{if(state.authEpoch!==previous.authEpoch){intent=null;changed()}})
function pending(): PendingPassword | null {
  const actor = currentActor()
  if (!actor) return null
  const raw = sessionStorage.getItem(storageKey(actor))
  if (!raw) return null
  const value = JSON.parse(raw) as PendingPassword
  if (value.actor !== actor || !value.key || typeof value.received !== 'boolean') throw new Error('Thông tin lần đổi mật khẩu sai phạm vi; chưa gửi lại.')
  return value
}
function save(c: PendingPassword) {
  // Never persist passwords, CSRF tokens or cookie values.
  sessionStorage.setItem(storageKey(c.actor), JSON.stringify({actor:c.actor,key:c.key,received:c.received,reviewed:c.reviewed}))
  changed()
}
function clear(actor: string) { sessionStorage.removeItem(storageKey(actor)); intent = null; changed() }
function fence() {
  const {user,authEpoch,isAuthenticated}=useAuthStore.getState()
  if (!user || !isAuthenticated) throw new Error('Cần phiên Web hợp lệ để đổi mật khẩu.')
  return {actor:user.id, epoch:authEpoch, role:user.role, assert(){
    const now=useAuthStore.getState()
    if (!now.isAuthenticated || now.user?.id!==user.id || now.user.role!==user.role || now.authEpoch!==authEpoch) throw new Error('Phiên đã thay đổi; bỏ kết quả đổi mật khẩu của phiên cũ.')
  }}
}
async function readback(c: PendingPassword, f: ReturnType<typeof fence>) {
  try {
    const session=await getSessionApi(); f.assert()
    if (!c.received) return {success:false,message:'Đã đọc lại phiên; chưa thể xác định mật khẩu đã đổi. Chưa tạo yêu cầu mới. Chỉ thử lại cùng yêu cầu nếu bạn quyết định đối chiếu tiếp.'}
    const sameRole=session.user.role===f.role || session.user.role==='PM' && f.role==='PROJECT_MANAGER'
    if (session.user.id!==f.actor || !sameRole || session.mustChangePassword) throw new Error('Chưa xác minh được đúng tài khoản và trạng thái phiên sau đổi mật khẩu.')
    useAuthStore.getState().setSession(session); clear(f.actor)
    return {success:true,message:'Đã đổi mật khẩu và xác minh lại phiên đăng nhập.'}
  } catch(error:any) {
    f.assert()
    if (c.received && error?.response?.status===401) {
      clear(f.actor)
      const message='Mật khẩu đã đổi. Vui lòng đăng nhập lại bằng mật khẩu mới.'
      useAuthStore.getState().expireSession(message)
      return {success:false,message,requiresLogin:true}
    }
    throw error
  }
}
export const profilePasswordChange = {
  subscribe(fn:()=>void) { listeners.add(fn); return ()=>{listeners.delete(fn)} },
  snapshot:()=>revision,
  state() { const p=pending(); return {pending:p,busy,canReplay:!!p?.reviewed && !!intent && intent.actor===currentActor() && intent.epoch===useAuthStore.getState().authEpoch} },
  async run(currentPassword:string,newPassword:string) {
    if (busy || pending()) throw new Error('Có lần đổi mật khẩu đang chờ đối chiếu; hãy đọc lại kết quả, không gửi yêu cầu mới.')
    const f=fence()
    if (!currentPassword || !newPassword) throw new Error('Nhập mật khẩu hiện tại và mật khẩu mới.')
    intent={actor:f.actor,epoch:f.epoch,key:crypto.randomUUID(),received:false,reviewed:false,body:{currentPassword,newPassword}}
    return this.send(intent,f)
  },
  async send(c: PasswordIntent, f: ReturnType<typeof fence>) {
    if (busy) throw new Error('Đang xử lý đổi mật khẩu.')
    busy=true;changed();let dispatched=false
    try {
      const csrf=await useAuthStore.getState().ensureCsrfToken();f.assert()
      if (!csrf) throw new Error('Chưa lấy được CSRF; chưa gửi đổi mật khẩu.')
      save(c);dispatched=true
      const status=await changePasswordApi(c.body,csrf,f.assert,c.key);f.assert()
      if (status!==204) throw new Error('Phản hồi đổi mật khẩu không đúng contract 204; cần đối chiếu, chưa gửi lại.')
      c.received=true; c.reviewed=false;save(c)
      return await readback(c,f)
    } catch(error:any) {
      f.assert()
      if (!dispatched || !c.received && error?.response?.status>=400 && error.response.status<500) {
        clear(f.actor)
        if(error?.response?.data?.code==='csrf_failed')useAuthStore.setState({csrfToken:null})
      }
      if (error?.response?.data?.code==='auth_invalid_credentials') throw new Error('Mật khẩu hiện tại không chính xác.')
      throw error
    } finally {busy=false;changed()}
  },
  async review() {
    if(busy)throw new Error('Đang xử lý đổi mật khẩu.')
    const f=fence(),c=pending();if(!c)throw new Error('Không có lần đổi mật khẩu đang chờ.')
    busy=true;changed()
    try {const result=await readback(c,f);if(!c.received){c.reviewed=true;save(c);if(intent?.key===c.key)intent.reviewed=true}return result}
    finally {busy=false;changed()}
  },
  async replay() {
    const f=fence(),c=pending()
    if(!c)throw new Error('Không có lần đổi mật khẩu đang chờ.')
    if(c.received)return this.review()
    if(!c.reviewed||!intent||intent.key!==c.key||intent.actor!==f.actor||intent.epoch!==f.epoch)throw new Error('Không còn nội dung trong bộ nhớ để thử lại an toàn. Hãy giữ thông tin lần gửi và đối chiếu bằng tài khoản test; không tạo yêu cầu mới.')
    return this.send(intent,f)
  }
}
