// Temporary b89a52f file transport. Credentials stay in memory and never enter a command journal.
export interface DevBearerOwner { id:string; role:string; epoch:number }
let held:{owner:DevBearerOwner; accessToken:string; expiresAt:number}|null=null
let generation=0
let pending:AbortController|null=null
const role=(value:string)=>value==='PM'?'PROJECT_MANAGER':value==='SUP'?'SUPERVISOR':value
export function devFileBearerEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_FILE_BEARER==='true' &&
    typeof location!=='undefined' && ['localhost','127.0.0.1','[::1]'].includes(location.hostname)
}
export function devFileBearerEndpoint(method:string,url:string,baseURL='') {
  if(baseURL.startsWith('//'))return false
  if(baseURL && !baseURL.startsWith('/')){try{const base=new URL(baseURL);if(!['http:','https:'].includes(base.protocol) || !['localhost','127.0.0.1','[::1]'].includes(base.hostname))return false}catch{return false}}
  const path=url.replace(/^\/api\/v1(?=\/)/,'')
  const id='[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
  return method.toUpperCase()==='POST' && (path==='/uploads' || new RegExp(`^/uploads/${id}/(part-urls|complete)$`).test(path) || new RegExp(`^/projects/${id}/warranties$`).test(path)) ||
    method.toUpperCase()==='GET' && (new RegExp(`^/uploads/${id}$`).test(path) || new RegExp(`^/files/${id}(/content)?$`).test(path))
}
export function clearDevFileBearer() {held=null;generation++;pending?.abort();pending=null}
const same=(a:DevBearerOwner,b:DevBearerOwner)=>a.id===b.id && a.role===b.role && a.epoch===b.epoch
export function devFileAuthorization(owner:DevBearerOwner) {
  if(!devFileBearerEnabled() || !held || !same(owner,held.owner) || held.expiresAt<=Date.now())throw new Error('Transport tệp dev/test cần đăng nhập lại bằng đúng tài khoản hiện tại; không tự đổi phương thức xác thực.')
  return `Bearer ${held.accessToken}`
}
export async function prepareDevFileBearer(email:string,password:string,owner:DevBearerOwner,current:()=>DevBearerOwner|null) {
  if(!devFileBearerEnabled())return
  clearDevFileBearer();const run=generation
  const abort=new AbortController();pending=abort
  const timeout=setTimeout(()=>abort.abort(),15000)
  try {
    const login=await fetch('/api/v1/auth/login',{method:'POST',credentials:'omit',cache:'no-store',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    if(!login.ok)return
    const tokens=await login.json()
    if(tokens.tokenType!=='Bearer' || typeof tokens.accessToken!=='string' || !tokens.accessToken || tokens.mustChangePassword || tokens.user?.id!==owner.id || role(tokens.user?.role)!==owner.role || !Number.isFinite(tokens.expiresIn) || !(tokens.expiresIn>0))return
    const response=await fetch('/api/v1/me',{credentials:'omit',cache:'no-store',signal:abort.signal,headers:{Authorization:`Bearer ${tokens.accessToken}`}})
    if(!response.ok)return
    const actor=await response.json(),active=current()
    if(run!==generation || !active || !same(owner,active) || actor.id!==owner.id || role(actor.role)!==owner.role)return
    held={owner:{...owner},accessToken:tokens.accessToken,expiresAt:Date.now()+tokens.expiresIn*1000-5000}
  }catch { /* Cookie login remains usable; a file request reports that dev authentication is unavailable. */ }
  finally{clearTimeout(timeout);if(pending===abort)pending=null}
}
