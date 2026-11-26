import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { readPersonnelDetail, type PersonnelDetailRead } from '../../../api/services/personnelDetailRead'
import {
  X,
  Briefcase,
  MapPin,
  Phone,
  ShieldCheck,
  Edit3,
} from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

export interface UserDetailModalProps {
  history?: SystemUserAccount['project_memberships']
  historyLoading?: boolean
  historyLoaded?: boolean
  historyError?: string
  onLoadHistory?: () => void

  selectedUserDetail: SystemUserAccount | null
  setSelectedUserDetail: (u: SystemUserAccount | null) => void
  isSupervisor: boolean
  handleOpenEdit: (u: SystemUserAccount) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  selectedUserDetail,
  history = [], historyError = '', historyLoading = false, historyLoaded = false, onLoadHistory,
  setSelectedUserDetail,
  isSupervisor,
  handleOpenEdit,
}) => {
  const {authEpoch,user}=useAuthStore()
  const scope=`${authEpoch}:${user?.id}:${selectedUserDetail?.id}`
  const [read,setRead]=useState<{scope:string;value?:PersonnelDetailRead;error?:string}|null>(null)
  const [reload,setReload]=useState(0)
  useEffect(()=>{
    let active=true;setRead(null)
    if(!selectedUserDetail)return
    if(!isSupervisor){setRead({scope,error:'Chỉ Giám sát được đọc hồ sơ tài khoản.'});return}
    readPersonnelDetail(selectedUserDetail.id).then(value=>{if(active)setRead({scope,value})}).catch(()=>{if(active)setRead({scope,error:'Không tải được chi tiết tài khoản. Vui lòng thử lại.'})})
    return()=>{active=false}
  },[scope,isSupervisor,reload])
  if (!selectedUserDetail) return null
  const current=read?.scope===scope?read:null,detail=current?.value,loading=!current
  const account=detail?.account||selectedUserDetail
  const assignmentsAllowed=[RoleCode.PROJECT_MANAGER,RoleCode.DRONE_OPERATOR,RoleCode.REPAIR_CREW].includes(account.role)
  const editable=!!detail&&!current?.error&&isSupervisor&&account.status==='ACTIVE'&&assignmentsAllowed


  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-border max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-[#C9A227] to-[#A88214] text-white p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm shadow-md text-white border-2 border-white/20 ${
                account.status === 'SUSPENDED'
                  ? 'bg-slate-600'
                  : account.role === RoleCode.SUPERVISOR
                  ? 'bg-brand-gold'
                  : account.role === RoleCode.PROJECT_MANAGER
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            >
              {account.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight font-headline">
                  {account.full_name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    account.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : account.status === 'SUSPENDED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {loading ? 'Đang tải' : account.status==='ACTIVE'?'Đang hoạt động':account.status==='SUSPENDED'?'Đã đình chỉ':account.status==='INVITED'?'Chờ kích hoạt':'Chưa có thông tin trạng thái'}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-mono mt-0.5">
                {loading ? 'Đang đọc hồ sơ…' : detail ? account.role===RoleCode.DRONE_OPERATOR?'Phi công thiết bị bay':account.role_label : 'Chưa xác minh vai trò tài khoản'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedUserDetail(null)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {loading&&<p role="status" className="text-slate-500">Đang tải hồ sơ nhân sự…</p>}
          {current?.error&&<p role="alert" className="text-rose-700">{current.error}<button type="button" onClick={()=>setReload(n=>n+1)} className="ml-2 underline">Thử lại</button></p>}
          {detail&&<>
          {assignmentsAllowed&&<div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2"><Briefcase className="w-4 h-4 text-brand-gold" /><span>Dự án được phân công</span></h4>
            {detail.assignmentError&&<p role="alert" className="text-rose-700">{detail.assignmentError}<button type="button" onClick={()=>setReload(n=>n+1)} className="ml-2 underline">Thử tải lại</button></p>}
            {detail.primaryError&&<p role="alert" className="text-amber-800">{detail.primaryError}</p>}
            {detail.assignments.map(m=><div key={m.projectId} className="space-y-1"><p className="font-semibold text-slate-900 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />{m.projectName}{m.isPrimary&&account.role===RoleCode.PROJECT_MANAGER&&<span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">PM chính</span>}</p><p className="text-[11px] text-slate-500">Phân công hiệu lực từ {m.validFrom} · {m.validTo===null?'Chưa có ngày kết thúc':`Đến ${m.validTo}`}</p></div>)}
            {!detail.assignmentError&&!detail.assignments.length&&<p className="text-slate-500">Chưa có phân công hiệu lực</p>}
            {isSupervisor&&onLoadHistory&&<button type="button" className="underline text-slate-600" disabled={historyLoading} onClick={onLoadHistory}>Xem lịch sử phân công</button>}
            {historyLoading&&<p role="status">Đang đọc lịch sử phân công…</p>}
            {historyError&&<p role="alert" className="text-rose-700">{historyError}</p>}
            {historyLoaded&&!history.length&&!historyError&&<p className="text-slate-500">Chưa có lịch sử phân công trong phạm vi đã đọc.</p>}
            {history.map(m=><p key={m.membershipId} className="text-[11px] text-slate-600">Lịch sử: {m.projectName} · {m.role==='PM'?'Chỉ huy trưởng':m.role==='OPERATOR'?'Phi công thiết bị bay':m.role==='CREW'?'Đội trưởng thi công':m.role||'Chưa có vai trò'} · {m.status==='ACTIVE'?'Hoạt động':m.status==='ENDED'?'Đã kết thúc':m.status||'Chưa có trạng thái'} · {m.validFrom||'Chưa có ngày bắt đầu'} → {m.validTo===null?'Chưa có ngày kết thúc':m.validTo||'Chưa có ngày kết thúc'}</p>)}
          </div>}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2"><Phone className="w-4 h-4 text-brand-gold" /><span>Thông tin liên hệ</span></h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500 text-[11px] block">Số điện thoại di động:</span><span className="font-bold text-slate-800 font-mono">{account.phone||'Chưa có thông tin'}</span></div>
              <div><span className="text-slate-500 text-[11px] block">Email:</span><span className="font-mono text-slate-800 break-words">{account.email||'Chưa có thông tin'}</span></div>
            </div>
          </div>
          </>}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Phân quyền thao tác do máy chủ kiểm tra
          </span>
          <div className="flex items-center gap-2">
            {editable && (
              <button
                type="button"
                onClick={() => {
                  const u = account
                  setSelectedUserDetail(null)
                  handleOpenEdit(u)
                }}
                className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa nhân sự này</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
