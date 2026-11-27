import { fastTrackTypeName, fastTrackPolicyVersion } from './defectPresentation'
import React, { useState, useEffect } from 'react'
import type { FastTrackPolicyEditor } from './useFastTrackPolicy'
import { defectTypeCatalog, type DefectTypeOption } from '../../../api/services/defectTypeCatalog'
import { fastTrackService, type RepairPolicyView } from '../../../api/services/fastTrackService'
import { policyRuleSupported, policyRuleText } from '../../../api/services/fastTrackPolicyRules'
import { fastTrackStorage, fastTrackPending } from '../../../api/services/fastTrackJournal'
import { exportError } from '../../../api/services/projectExportService'
import { Icon } from '../../../components/ui/Icon'
import { PolicyThresholdConfig, PolicyRuleSelection } from './types'

export interface PolicyModalProps {
  policyEditor:FastTrackPolicyEditor
  ruleSelection: PolicyRuleSelection
  setRuleSelection: React.Dispatch<React.SetStateAction<PolicyRuleSelection>>
  projectId: string
  actionError: string
  isOpen: boolean
  onClose: () => void
  currentPolicy: PolicyThresholdConfig | null
  formVersionName: string
  setFormVersionName: (v: string) => void
  formMaxArea: string
  setFormMaxArea: (v: string) => void
  formMaxDepth: string
  setFormMaxDepth: (v: string) => void
  formPolicyNote: string
  setFormPolicyNote: (v: string) => void
  handleApplyPolicy: (action: 'DRAFT' | 'ACTIVATE') => void
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  policyEditor,
  ruleSelection, setRuleSelection,
  projectId, actionError,
  isOpen,
  onClose,
  currentPolicy,
  formVersionName,
  setFormVersionName,
  formMaxArea,
  setFormMaxArea,
  formMaxDepth,
  setFormMaxDepth,
  formPolicyNote,
  setFormPolicyNote,
  handleApplyPolicy
}) => {
  const [reference,setReference]=useState(''),[referenceKind,setReferenceKind]=useState<'drafts'|'revisions'>('revisions'),[error,setError]=useState('')
  const type=policyEditor.formType,setType=policyEditor.setFormType
  const [revokeOpen,setRevokeOpen]=useState(false),[revokeReason,setRevokeReason]=useState(''),[revokeAcknowledged,setRevokeAcknowledged]=useState(false)
  const [policies,setPolicies]=useState<RepairPolicyView[]>([]),[types,setTypes]=useState<DefectTypeOption[]>([]),[loading,setLoading]=useState(false)
  const [notice,setNotice]=useState('')
  useEffect(()=>{
    let active=true
    if(!isOpen)return
    setLoading(true);setError('');setPolicies([]);setTypes([])
    Promise.allSettled([fastTrackService.getPolicies(projectId,message=>{if(active)setError(message)}),defectTypeCatalog.read()]).then(([p,t])=>{if(active){if(p.status==='fulfilled')setPolicies(p.value);else setError(exportError(p.reason));if(t.status==='fulfilled')setTypes(t.value);else setError(exportError(t.reason));setLoading(false)}})
    return()=>{active=false}
  },[isOpen,projectId,policyEditor.record?.id,policyEditor.record?.version])
  const available=policies.filter(p=>referenceKind==='revisions' ? p.revision!=null && ['PUBLISHED','REVOKED'].includes(p.state) : p.state==='DRAFT')
  useEffect(()=>{const row=policyEditor.record;if(row){setReference(row.id);setReferenceKind(row.revision!=null?'revisions':'drafts')}else if(policyEditor.mode==='new')setReference('');const held=row?.revision!=null?fastTrackPending(projectId,`policy-revoke:${row.id}`):null;setRevokeOpen(!!held);setRevokeReason((held?.body as {reason?:string})?.reason || '');setRevokeAcknowledged(false)},[policyEditor.record?.id,policyEditor.record?.state,policyEditor.mode])
  const revokePending=policyEditor.record?.revision!=null?fastTrackPending(projectId,`policy-revoke:${policyEditor.record.id}`):null

  const readReference=async()=>{try{setError('');setNotice('');const row=available.find(p=>p.id===reference);if(!row)throw new Error('Chọn chính sách từ hồ sơ đã đọc.');if(await policyEditor.read(row))setNotice('Đã GET bản đã chọn. Chỉ chỉnh sửa khi đang tiếp tục dự thảo.')}catch(e){setError(exportError(e))}}
  const stopCodes=[...new Set(policies.filter(p=>p.defectTypeCode===type).flatMap(p=>p.stopConditions))]
  const pending=fastTrackPending(projectId,'policy-create')
  const pipeline=JSON.parse(localStorage.getItem(fastTrackStorage(projectId,'policy-pipeline')) || 'null')
  const lockedInput=(pending?.body || (policyEditor.mode==='new'?pipeline?.input:null)) as RepairPolicyView | undefined
  const unsupportedPending=!!(lockedInput || policyEditor.record)?.measurements.some(r=>!policyRuleSupported(r))
  const locked=!!lockedInput || unsupportedPending || policyEditor.pending || policyEditor.busy || policyEditor.mode==='view'
  const canCreate=!policyEditor.busy && (policyEditor.hasReceipt || policyEditor.mode!=='view' && !loading && !unsupportedPending && types.some(t=>t.code===type) && !!formVersionName.trim() && formVersionName.length<=200 && !!formPolicyNote.trim() && formPolicyNote.length<=2000 && (ruleSelection.area || ruleSelection.depth) && (!ruleSelection.area || fastTrackService.policyBound(formMaxArea)!==null) && (!ruleSelection.depth || ['mm','cm','m'].includes(ruleSelection.depthUnit) && fastTrackService.policyBound(formMaxDepth)!==null) && ruleSelection.stopConditions.every(code=>stopCodes.includes(code)))
  const currentArea=(policyEditor.record?.measurements || currentPolicy?.rules)?.find(r=>r.code==='Area'),currentDepth=(policyEditor.record?.measurements || currentPolicy?.rules)?.find(r=>r.code==='DepressionDepth')
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="verified_user" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Lập Dự Thảo &amp; Điều Chỉnh Chính Sách</h3>
              <span className="text-[10px] text-slate-500">Chỉ huy trưởng (PM) lập dự thảo &amp; xuất bản chính sách kỹ thuật xử lý nhanh</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p role="status" className="text-slate-600">{policyEditor.mode==='new'?'Đang tạo chính sách mới; không sửa bản đang xem.':policyEditor.mode==='draft'?`Đang tiếp tục dự thảo: ${policyEditor.record?.checklistVersion}`:`Đang xem: ${policyEditor.record?.checklistVersion} · ${policyEditor.record?.state==='REVOKED'?'Đã thu hồi':'Đã xuất bản'}`}</p>
          {(policyEditor.pendingRead || policyEditor.pendingNew) && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900"><p>Nội dung đang nhập chưa được lưu. Không tự ghi đè khi đọc bản khác hoặc tạo mới.</p><div className="flex gap-2 mt-2"><button type="button" onClick={()=>policyEditor.pendingRead ? policyEditor.read(policyEditor.pendingRead,true):policyEditor.newPolicy(true)} className="rg-btn">Bỏ nội dung chưa lưu để tiếp tục</button><button type="button" onClick={policyEditor.cancelRead} className="rg-btn">Giữ nội dung đang nhập</button></div></div>}
          {(error || actionError) && <p role="alert" className="text-red-800">{error || actionError}</p>}
          <div className="space-y-2"><label>Chính sách đã lưu</label><div className="flex gap-2"><select aria-label="Nhóm chính sách" value={referenceKind} onChange={e=>{setReferenceKind(e.target.value as 'drafts'|'revisions');setReference('')}} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"><option value="revisions">Đã xuất bản</option><option value="drafts">Dự thảo</option></select><select aria-label="Chính sách đã lưu" value={reference} onChange={e=>setReference(e.target.value)} disabled={loading || !available.length} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs min-w-0 flex-1"><option value="">{loading?'Đang đọc…':available.length?'Chọn chính sách':'Chưa có tham chiếu từ nguồn'}</option>{available.map(p=><option key={p.id} value={p.id}>{fastTrackPolicyVersion(p.checklistVersion,p.revision)}{p.revision!=null ? ` · ${p.state==='REVOKED'?'Đã thu hồi':'Đã xuất bản'}` : ' · Dự thảo'}</option>)}</select><button type="button" disabled={!available.some(p=>p.id===reference)} onClick={readReference} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">Đọc</button></div>{!loading && !available.length && <p className="text-slate-500">Danh mục hiện chỉ gồm tham chiếu từ hồ sơ/receipt đã đọc và được hệ thống xác nhận lại; chưa có API liệt kê toàn bộ chính sách.</p>}{notice && <p role="status">{notice}</p>}</div>
          <label className="block">Loại hư hỏng *<select aria-label="Loại hư hỏng chính sách" required value={type} onChange={e=>{setType(e.target.value);setRuleSelection(previous=>({...previous,stopConditions:[]}))}} disabled={loading || !types.length || locked} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"><option value="">{loading?'Đang đọc danh mục…':types.length?'Chọn loại hư hỏng':'Chưa có danh mục loại hư hỏng'}</option>{policyEditor.record && !types.some(t=>t.code===type) && <option value={type}>Chưa có thông tin tên loại · Theo bản đã đọc</option>}{types.map(t=><option key={t.code} value={t.code}>{fastTrackTypeName(t.code,{[t.code]:t.name})}</option>)}</select></label>
          <p className="text-slate-500">Chọn ít nhất một quy tắc áp dụng. Bản mới dùng cận dưới 0; tiếp tục draft giữ cận dưới và các quy tắc khác đã lưu. Ngưỡng không âm, tối đa 6 chữ số thập phân; không phải ngưỡng TCVN mặc định. Đơn vị phải trùng số đo lưu; không tự quy đổi.</p>
          {unsupportedPending && <p role="alert" className="text-red-800">{lockedInput || policyEditor.pending ? 'Quy tắc trong journal đang chờ không khớp đơn vị runtime. Giữ nguyên body/key; chưa gửi lại hay tự chuyển đơn vị.' : 'Bản đang xem có quy tắc/đơn vị không khớp runtime. Giữ nguyên dữ liệu đã lưu, không tự chuyển đơn vị.'}</p>}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tên phiên bản checklist * </label>
            <input
              type="text"
              value={formVersionName}
              onChange={(e) => setFormVersionName(e.target.value)}
              aria-label="Phiên bản checklist"
              required
              maxLength={200} disabled={locked}
              placeholder="Tên phiên bản checklist áp dụng"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1"><input type="checkbox" aria-label="Áp dụng quy tắc Area" checked={ruleSelection.area} disabled={locked} onChange={e=>setRuleSelection(previous=>({...previous,area:e.target.checked}))} className="mr-1.5 accent-[#C9A227]"/>Ngưỡng diện tích tối đa (m²)</label>
              <input
                type="number"
                aria-label="Ngưỡng diện tích tối đa"
                required={ruleSelection.area} disabled={!ruleSelection.area || locked} min={policyEditor.record?.measurements.find(r=>r.code==='Area')?.minimum || 0} max="99999999999999" step="0.000001"
                value={formMaxArea}
                onChange={(e) => setFormMaxArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Đã đọc: {policyRuleText(currentArea)}</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1"><input type="checkbox" aria-label="Áp dụng quy tắc DepressionDepth" checked={ruleSelection.depth} disabled={locked} onChange={e=>setRuleSelection(previous=>({...previous,depth:e.target.checked}))} className="mr-1.5 accent-[#C9A227]"/>Ngưỡng độ sâu tối đa</label>
              <select aria-label="Đơn vị quy tắc độ sâu" value={ruleSelection.depthUnit} disabled={!ruleSelection.depth || locked} onChange={e=>{setRuleSelection(previous=>({...previous,depthUnit:e.target.value as 'mm'|'cm'|'m'}));setFormMaxDepth('')}} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-1">{['mm','cm','m'].map(unit=><option key={unit} value={unit}>{{mm:'Milimét',cm:'Centimét',m:'Mét'}[unit]}</option>)}</select>
              <input
                type="number"
                aria-label="Ngưỡng độ sâu tối đa"
                required={ruleSelection.depth} disabled={!ruleSelection.depth || locked} min={policyEditor.record?.measurements.find(r=>r.code==='DepressionDepth')?.minimum || 0} max="99999999999999" step="0.000001"
                value={formMaxDepth}
                onChange={(e) => setFormMaxDepth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Đã đọc: {policyRuleText(currentDepth)}. Đổi đơn vị cần nhập lại ngưỡng, không tự quy đổi.</span>
            </div>
          </div>

          <div><label className="block font-bold text-slate-700 uppercase mb-1">Điều kiện dừng (nếu có mã nguồn)</label><select aria-label="Mã điều kiện dừng chính sách" multiple={stopCodes.length>0} size={Math.max(1,Math.min(stopCodes.length,3))} value={stopCodes.length ? ruleSelection.stopConditions : ''} disabled={!stopCodes.length || locked} onChange={e=>setRuleSelection(previous=>({...previous,stopConditions:Array.from(e.target.selectedOptions,option=>option.value)}))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">{!stopCodes.length && <option value="">Chưa có mã từ nguồn</option>}{stopCodes.map((code,index)=><option key={code} value={code}>Chưa có tên điều kiện dừng · mục {index+1}</option>)}</select><p className="text-[10px] text-slate-500 mt-1">{stopCodes.length ? 'Chỉ dùng mã từ policy cùng loại hư hỏng đã đọc. Crew phải quan sát đúng các mã đã chọn; chưa rõ quan sát không được xem là an toàn.' : 'Chưa có danh mục mã điều kiện dừng hoặc mã từ policy cùng loại hư hỏng đã đọc. Chưa hỗ trợ tự khai báo mã; không cấu hình điều kiện dừng không có nghĩa là không có nguy cơ.'}</p></div>
          {/* Cấu hình Mức độ nghiêm trọng áp dụng */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mức độ tham khảo — không gửi trong chính sách
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <Icon name="info" size={14} className="text-emerald-600 shrink-0" />
                <span>Thấp (Nhẹ)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                <Icon name="info" size={14} className="text-blue-600 shrink-0" />
                <span>Trung bình (Vừa)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Mức độ hư hỏng không thay thế đánh giá đủ điều kiện">
                <Icon name="info" size={14} className="text-slate-400 shrink-0" />
                <span>Cao</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Mức độ hư hỏng không thay thế đánh giá đủ điều kiện">
                <Icon name="info" size={14} className="text-slate-400 shrink-0" />
                <span>Nghiêm trọng</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Điều kiện thi công do chính sách, số đo, vị trí, độ phủ và quyền hiện hành quyết định; không suy từ mức độ hư hỏng.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Ghi chú căn cứ &amp; lý do ban hành *</label>
            <textarea
              rows={2}
              required disabled={locked} maxLength={2000} aria-label="Căn cứ ban hành chính sách"
              value={formPolicyNote}
              onChange={(e) => setFormPolicyNote(e.target.value)}
              placeholder={policyEditor.mode==='view'?'Bản đọc không cung cấp lý do riêng':'Ghi rõ cơ sở điều chỉnh...'}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-gold focus:outline-none"
            />
          </div>

          {policyEditor.mode==='view' && (policyEditor.record?.state==='PUBLISHED' || !!revokePending) && <div className="space-y-2"><button type="button" disabled={policyEditor.busy} onClick={()=>setRevokeOpen(v=>!v)} className="px-3 py-2 rounded-lg border border-red-200 text-red-800 bg-white">Thu hồi chính sách</button>{revokeOpen && <div className="space-y-2 text-xs"><label className="block">Lý do thu hồi *<textarea aria-label="Lý do thu hồi chính sách" value={revokeReason} maxLength={2000} disabled={policyEditor.busy || !!revokePending} onChange={e=>setRevokeReason(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg mt-1"/></label><label className="flex items-start gap-2"><input type="checkbox" aria-label="Xác nhận ảnh hưởng thu hồi" checked={revokeAcknowledged} disabled={policyEditor.busy} onChange={e=>setRevokeAcknowledged(e.target.checked)} className="accent-[#C9A227] mt-0.5"/><span>Tôi hiểu bản thu hồi không được chọn cho lệnh mới. Nhiệm vụ cũ giữ nguyên pin; BE có thể chặn quyền thực hiện tiếp theo. Không tự thay policy của nhiệm vụ cũ.</span></label><button type="button" disabled={policyEditor.busy || (!revokePending?.receipt && !revokeAcknowledged) || !revokeReason.trim()} onClick={()=>policyEditor.record && policyEditor.revoke(policyEditor.record,revokeReason)} className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-800 disabled:opacity-40">{revokePending?'Đối chiếu yêu cầu thu hồi':'Xác nhận thu hồi chính sách'}</button></div>}</div>}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Icon name="info" size={16} className="text-[#C9A227] shrink-0 mt-0.5" />
            <span>
              <strong>Thẩm quyền PM:</strong> Chỉ huy trưởng có quyền lập dự thảo, điều chỉnh ngưỡng kỹ thuật và xuất bản chính sách. Khi giao việc cần chọn đúng phiên bản chính sách. Crew đánh giá điều kiện thi công sau khi nhận nhiệm vụ.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-2">
            <button type="button" disabled={policyEditor.busy || policyEditor.pending} onClick={()=>policyEditor.newPolicy()} className="px-3.5 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200">Tạo chính sách mới</button>
            <button
              disabled={!canCreate}
              onClick={() => handleApplyPolicy('DRAFT')}
              type="button"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-xl border border-amber-200 shadow-2xs cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Lưu bản ghi dự thảo chính sách"
            >
              {policyEditor.pending?'Đối chiếu / Lưu dự thảo':policyEditor.mode==='draft'?'Lưu đúng dự thảo đang mở':'Lưu dự thảo'}
            </button>
            <button
              disabled={!canCreate}
              onClick={() => handleApplyPolicy('ACTIVATE')}
              type="button"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Xuất bản revision để chọn cho lệnh phù hợp; không cấp quyền thi công"
            >
              <Icon name="check_circle" size={14} />
              <span>{policyEditor.hasReceipt?'Đối chiếu receipt đã nhận':'Xuất bản chính sách'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
