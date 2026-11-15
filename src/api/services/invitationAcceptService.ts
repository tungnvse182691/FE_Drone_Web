import { apiClient } from '../client'

interface AcceptInput {invitationToken:string;displayName:string;password:string}
let held:{body:AcceptInput;key:string;received:boolean}|null=null,busy=false
export const invitationAcceptService={
  state:()=>({pending:!!held,busy}),
  async accept(body:AcceptInput){
    if(busy)throw new Error('Đang chấp nhận lời mời. Vui lòng chờ.')
    if(!body.invitationToken||!body.displayName.trim()||!body.password)throw new Error('Cần đường dẫn lời mời, họ tên và mật khẩu do người nhận nhập.')
    const input={...body,displayName:body.displayName.trim()}
    if(held&&JSON.stringify(held.body)!==JSON.stringify(input))throw new Error('Lần chấp nhận trước chưa rõ kết quả. Giữ nguyên nội dung và đường dẫn, chưa gửi yêu cầu mới.')
    if(!held)held={body:input,key:crypto.randomUUID(),received:false}
    if(held.received)throw new Error('Đã nhận phản hồi chấp nhận; hãy đăng nhập và đối chiếu tài khoản, không gửi lại.')
    busy=true
    try{
      const response=await apiClient.post('/invitations/accept',held.body,{headers:{'Idempotency-Key':held.key}})
      held.received=true
      if(response.status!==200||!response.data?.user?.id||!response.data.user.role)throw new Error('Đã nhận phản hồi nhưng chưa xác minh được tài khoản. Hãy đăng nhập để đối chiếu, không bấm lại.')
      // Acceptance returns a token DTO; browser authentication still uses API014/017 cookies.
      const user={id:String(response.data.user.id),role:String(response.data.user.role)}
      held=null
      return user
    }catch(e:any){
      if(!held?.received&&e?.response?.status>=400&&e.response.status<500&&e?.response?.data?.code!=='duplicate_request')held=null
      throw e
    }finally{busy=false}
  }
}
