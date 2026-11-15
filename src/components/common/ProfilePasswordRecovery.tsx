import { useSyncExternalStore } from 'react'
import { profilePasswordChange } from '../../api/services/profilePasswordChange'
import { useAuthStore } from '../../store/authStore'

export function useProfilePasswordState() {
  useAuthStore(state=>state.authEpoch)
  useSyncExternalStore(profilePasswordChange.subscribe,profilePasswordChange.snapshot)
  try {const state=profilePasswordChange.state();return {...state,locked:state.busy||!!state.pending,error:''}}
  catch {return {busy:false,pending:null,canReplay:false,locked:true,error:'Không đọc được thông tin lần đổi mật khẩu đang chờ; chưa gửi yêu cầu mới.'}}
}
export function ProfilePasswordRecovery({onResult}: {onResult:(success:boolean,message:string)=>void}) {
  const state=useProfilePasswordState()
  if(state.error)return <p role="alert" className="text-xs text-rose-700">{state.error}</p>
  if(!state.pending)return null
  const act=async(replay=false)=>{
    try{const r=await (replay?profilePasswordChange.replay():profilePasswordChange.review());onResult(r.success,r.message)}
    catch(e:any){onResult(false,e?.response?.data?.code ? `Không hoàn tất đối chiếu: ${e.response.data.code}` : e.message || 'Không đọc lại được phiên đăng nhập.')}
  }
  return <div className="space-y-2 text-xs text-amber-800" role="status">
    <p>{state.pending.received?'Đã nhận phản hồi đổi mật khẩu; cần xác minh lại phiên. Không gửi đổi mật khẩu lần nữa.':'Chưa rõ kết quả lần đổi mật khẩu trước. Đọc lại trước khi quyết định thử lại; không tạo yêu cầu mới.'}</p>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={state.busy} onClick={()=>{void act()}} className="underline disabled:opacity-60">Đọc lại phiên</button>
      {!state.pending.received&&state.canReplay&&<button type="button" disabled={state.busy} onClick={()=>{void act(true)}} className="underline disabled:opacity-60">Thử lại cùng yêu cầu</button>}
    </div>
    {!state.pending.received&&state.pending.reviewed&&!state.canReplay&&<p>Nội dung mật khẩu không được lưu qua F5. Giữ lần gửi đang chờ để đối chiếu; chưa thể gửi lại an toàn.</p>}
  </div>
}
