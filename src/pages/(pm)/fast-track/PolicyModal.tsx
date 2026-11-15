import React, { useState, useEffect } from 'react'
import { defectTypeCatalog, type DefectTypeOption } from '../../../api/services/defectTypeCatalog'
import { fastTrackService, type RepairPolicyView } from '../../../api/services/fastTrackService'
import { policyRuleSupported, policyRuleText } from '../../../api/services/fastTrackPolicyRules'
import { fastTrackStorage, fastTrackPending } from '../../../api/services/fastTrackJournal'
import { exportError } from '../../../api/services/projectExportService'
import { Icon } from '../../../components/ui/Icon'
import { PolicyThresholdConfig, PolicyRuleSelection } from './types'

export interface PolicyModalProps {
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
  const [type,setType]=useState(()=>localStorage.getItem(fastTrackStorage(projectId,'policy-type')) || '')
  const [policies,setPolicies]=useState<RepairPolicyView[]>([]),[types,setTypes]=useState<DefectTypeOption[]>([]),[loading,setLoading]=useState(false)
  const [notice,setNotice]=useState('')
  useEffect(()=>{
    let active=true
    if(!isOpen)return
    setLoading(true);setError('');setPolicies([]);setTypes([])
    Promise.all([fastTrackService.getPolicies(projectId),defectTypeCatalog.read()]).then(([p,t])=>{if(active){setPolicies(p);setTypes(t)}}).catch(e=>{if(active)setError(exportError(e))}).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[isOpen,projectId])
  const available=policies.filter(p=>referenceKind==='revisions' ? p.revision!=null && p.state==='PUBLISHED' : p.state==='DRAFT')
  const readReference=async()=>{try{setError('');if(!available.some(p=>p.id===reference))throw new Error('Chọn chính sách từ hồ sơ đã đọc.');await fastTrackService.readPolicy(projectId,reference,referenceKind);window.dispatchEvent(new Event('fasttrack-refresh'));setNotice('Đã đọc chính sách từ hệ thống. Không sửa bản đã lưu.')}catch(e){setError(exportError(e))}}
  const stopCodes=[...new Set(policies.filter(p=>p.defectTypeCode===type).flatMap(p=>p.stopConditions))]
  const pending=fastTrackPending(projectId,'policy-create')
  const pipeline=JSON.parse(localStorage.getItem(fastTrackStorage(projectId,'policy-pipeline')) || 'null')
  const lockedInput=(pending?.body || pipeline?.input) as RepairPolicyView | undefined
  const unsupportedPending=!!lockedInput?.measurements.some(r=>!policyRuleSupported(r))
  const canCreate=!loading && !unsupportedPending && types.some(t=>t.code===type) && !!formVersionName.trim() && formVersionName.length<=200 && !!formPolicyNote.trim() && formPolicyNote.length<=2000 && (ruleSelection.area || ruleSelection.depth) && (!ruleSelection.area || fastTrackService.policyBound(formMaxArea)!==null) && (!ruleSelection.depth || ['mm','cm','m'].includes(ruleSelection.depthUnit) && fastTrackService.policyBound(formMaxDepth)!==null) && ruleSelection.stopConditions.every(code=>stopCodes.includes(code))
  const currentArea=currentPolicy?.rules?.find(r=>r.code==='Area'),currentDepth=currentPolicy?.rules?.find(r=>r.code==='DepressionDepth')
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
          {(error || actionError) && <p role="alert" className="text-red-800">{error || actionError}</p>}
          <div className="space-y-2"><label>Chính sách đã lưu</label><div className="flex gap-2"><select aria-label="Nhóm chính sách" value={referenceKind} onChange={e=>{setReferenceKind(e.target.value as 'drafts'|'revisions');setReference('')}} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"><option value="revisions">Đã xuất bản</option><option value="drafts">Dự thảo</option></select><select aria-label="Chính sách đã lưu" value={reference} onChange={e=>setReference(e.target.value)} disabled={loading || !available.length} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs min-w-0 flex-1"><option value="">{loading?'Đang đọc…':available.length?'Chọn chính sách':'Chưa có tham chiếu từ nguồn'}</option>{available.map(p=><option key={p.id} value={p.id}>{p.checklistVersion}{p.revision!=null ? ` · Lần ban hành ${p.revision}` : ' · Dự thảo'}</option>)}</select><button type="button" disabled={!available.some(p=>p.id===reference)} onClick={readReference} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">Đọc</button></div>{!loading && !available.length && <p className="text-slate-500">Danh mục hiện chỉ gồm tham chiếu từ hồ sơ/receipt đã đọc và được hệ thống xác nhận lại; chưa có API liệt kê toàn bộ chính sách.</p>}{notice && <p role="status">{notice}</p>}</div>
          <label className="block">Loại hư hỏng *<select aria-label="Loại hư hỏng chính sách" required value={type} onChange={e=>{setType(e.target.value);setRuleSelection(previous=>({...previous,stopConditions:[]}));localStorage.setItem(fastTrackStorage(projectId,'policy-type'),e.target.value)}} disabled={loading || !types.length || !!lockedInput} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"><option value="">{loading?'Đang đọc danh mục…':types.length?'Chọn loại hư hỏng':'Chưa có danh mục loại hư hỏng'}</option>{types.map(t=><option key={t.code} value={t.code}>{t.name}</option>)}</select></label>
          <p className="text-slate-500">Chọn ít nhất một quy tắc áp dụng. Khoảng từ 0 đến ngưỡng nhập, không âm, tối đa 6 chữ số thập phân; không phải ngưỡng TCVN mặc định. Đơn vị phải trùng số đo lưu; không tự quy đổi.</p>
          {unsupportedPending && <p role="alert" className="text-red-800">Quy tắc trong journal đang chờ không khớp đơn vị runtime. Giữ nguyên body/key; chưa gửi lại hay tự chuyển đơn vị.</p>}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tên phiên bản checklist * </label>
            <input
              type="text"
              value={formVersionName}
              onChange={(e) => setFormVersionName(e.target.value)}
              aria-label="Phiên bản checklist"
              required
              maxLength={200} disabled={!!lockedInput}
              placeholder="Tên phiên bản checklist áp dụng"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-brand-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1"><input type="checkbox" aria-label="Áp dụng quy tắc Area" checked={ruleSelection.area} disabled={!!lockedInput} onChange={e=>setRuleSelection(previous=>({...previous,area:e.target.checked}))} className="mr-1.5 accent-[#C9A227]"/>Ngưỡng diện tích tối đa (m²)</label>
              <input
                type="number"
                aria-label="Ngưỡng diện tích tối đa"
                required={ruleSelection.area} disabled={!ruleSelection.area || !!lockedInput} min="0" max="99999999999999" step="0.000001"
                value={formMaxArea}
                onChange={(e) => setFormMaxArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Đã đọc: {policyRuleText(currentArea)}</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1"><input type="checkbox" aria-label="Áp dụng quy tắc DepressionDepth" checked={ruleSelection.depth} disabled={!!lockedInput} onChange={e=>setRuleSelection(previous=>({...previous,depth:e.target.checked}))} className="mr-1.5 accent-[#C9A227]"/>Ngưỡng độ sâu tối đa</label>
              <select aria-label="Đơn vị quy tắc độ sâu" value={ruleSelection.depthUnit} disabled={!ruleSelection.depth || !!lockedInput} onChange={e=>{setRuleSelection(previous=>({...previous,depthUnit:e.target.value as 'mm'|'cm'|'m'}));setFormMaxDepth('')}} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-1">{['mm','cm','m'].map(unit=><option key={unit} value={unit}>{unit}</option>)}</select>
              <input
                type="number"
                aria-label="Ngưỡng độ sâu tối đa"
                required={ruleSelection.depth} disabled={!ruleSelection.depth || !!lockedInput} min="0" max="99999999999999" step="0.000001"
                value={formMaxDepth}
                onChange={(e) => setFormMaxDepth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:border-brand-gold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Đã đọc: {policyRuleText(currentDepth)}. Đổi đơn vị cần nhập lại ngưỡng, không tự quy đổi.</span>
            </div>
          </div>

          <div><label className="block font-bold text-slate-700 uppercase mb-1">Điều kiện dừng (nếu có mã nguồn)</label><select aria-label="Mã điều kiện dừng chính sách" multiple={stopCodes.length>0} size={Math.max(1,Math.min(stopCodes.length,3))} value={stopCodes.length ? ruleSelection.stopConditions : ''} disabled={!stopCodes.length || !!lockedInput} onChange={e=>setRuleSelection(previous=>({...previous,stopConditions:Array.from(e.target.selectedOptions,option=>option.value)}))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">{!stopCodes.length && <option value="">Chưa có mã từ nguồn</option>}{stopCodes.map(code=><option key={code} value={code}>{code}</option>)}</select><p className="text-[10px] text-slate-500 mt-1">{stopCodes.length ? 'Chỉ dùng mã từ policy cùng loại hư hỏng đã đọc. Crew phải quan sát đúng các mã đã chọn; chưa rõ quan sát không được xem là an toàn.' : 'Chưa có danh mục mã điều kiện dừng hoặc mã từ policy cùng loại hư hỏng đã đọc. Chưa hỗ trợ tự khai báo mã; không cấu hình điều kiện dừng không có nghĩa là không có nguy cơ.'}</p></div>
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
                <span>HIGH</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-80" title="Mức độ hư hỏng không thay thế đánh giá đủ điều kiện">
                <Icon name="info" size={14} className="text-slate-400 shrink-0" />
                <span>CRITICAL</span>
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
              required disabled={!!lockedInput} maxLength={2000} aria-label="Căn cứ ban hành chính sách"
              value={formPolicyNote}
              onChange={(e) => setFormPolicyNote(e.target.value)}
              placeholder="Ghi rõ cơ sở điều chỉnh..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-gold focus:outline-none"
            />
          </div>

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
            <button
              disabled={!canCreate}
              onClick={() => handleApplyPolicy('DRAFT')}
              type="button"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-xl border border-amber-200 shadow-2xs cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Lưu bản ghi dự thảo chính sách"
            >
              Lưu dự thảo
            </button>
            <button
              disabled={!canCreate}
              onClick={() => handleApplyPolicy('ACTIVATE')}
              type="button"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Xuất bản chính thức áp dụng toàn tuyến"
            >
              <Icon name="check_circle" size={14} />
              <span>Xuất bản chính sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
