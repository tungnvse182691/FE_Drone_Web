import React, { useState, useEffect } from 'react'
import { buildCoverageInput, coverageDate, coverageFormErrors } from './coverageForm'
import { HandoverAttachCard } from './HandoverAttachCard'
import { CoverageDocumentUpload } from './CoverageDocumentUpload'
import { Icon } from '../../../components/ui/Icon'
import { fastTrackPending } from '../../../api/services/fastTrackJournal'
import type { RoadCoverageFact, RoadCoverageInputDto } from './types'

export interface RoadCoverageConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  roadCoverage: RoadCoverageFact
  onConfirm: (
    input: RoadCoverageInputDto,
    projectInfo: { projectId: string; projectName: string; fromKm: number; toKm: number }
  ) => void
  errorMessage?: string | null
  isSubmitting?: boolean
}

export const RoadCoverageConfirmModal: React.FC<RoadCoverageConfirmModalProps> = ({
  isOpen,
  onClose,
  roadCoverage,
  onConfirm,
  errorMessage,
  isSubmitting = false
}) => {
  const [sourceKind, setSourceKind] = useState<'WARRANTY' | 'MAINTENANCE_BASIS'>(
    roadCoverage.sourceKind || 'MAINTENANCE_BASIS'
  )
  const [documentNo, setDocumentNo] = useState(
    roadCoverage.documentNo || ''
  )
  const [applicableFrom, setApplicableFrom] = useState(
    roadCoverage.applicableFromUtc && roadCoverage.applicableFromUtc !== '—'
      ? coverageDate(roadCoverage.applicableFromUtc)
      : ''
  )
  const [applicableTo, setApplicableTo] = useState(
    roadCoverage.applicableToUtc && roadCoverage.applicableToUtc !== '—'
      ? coverageDate(roadCoverage.applicableToUtc,true)
      : ''
  )
  const [reason, setReason] = useState(
    roadCoverage.reason ||
      ''
  )

  useEffect(() => {
    if (isOpen) {
      if (roadCoverage.sourceKind) {
        setSourceKind(roadCoverage.sourceKind)
      }
      if (roadCoverage.documentNo) {
        setDocumentNo(roadCoverage.documentNo)
      }
      if (roadCoverage.applicableFromUtc && roadCoverage.applicableFromUtc !== '—') {
        setApplicableFrom(coverageDate(roadCoverage.applicableFromUtc))
      }
      if (roadCoverage.applicableToUtc && roadCoverage.applicableToUtc !== '—') {
        setApplicableTo(coverageDate(roadCoverage.applicableToUtc,true))
      }
    }
  }, [isOpen])

  const [supersedesId,setSupersedesId]=useState('')
  const [scopeId,setScopeId]=useState(roadCoverage.scopeObligationId || '')
  const [handoverId,setHandoverId]=useState(''),[sourceId,setSourceId]=useState('')
  const [provenance,setProvenance]=useState<'TEST_ONLY'|'REAL_SOURCE'>('TEST_ONLY')
  useEffect(()=>{
    if(!isOpen)return
    const held=fastTrackPending(roadCoverage.projectId,'coverage')
    const body=held?.body as RoadCoverageInputDto | undefined
    if(body){setSupersedesId(body.supersedesId || '');setScopeId(body.scopeObligationId);setHandoverId(body.handoverDocumentId);setSourceKind(body.sourceKind);setSourceId(body.sourceId || '');setProvenance(body.provenance);setApplicableFrom(coverageDate(body.applicableFromUtc));setApplicableTo(coverageDate(body.applicableToUtc,true));const parsed=body.reason.match(/^(.*) \(Căn cứ văn bản: (.*)\)$/s);setReason(parsed?.[1] || body.reason);setDocumentNo(parsed?.[2] || '')}
  },[isOpen,roadCoverage.projectId])
  const scope=roadCoverage.scopes?.find(s=>s.obligationId===scopeId)
  const handover=roadCoverage.sources?.find(s=>s.kind==='HANDOVER' && s.id===handoverId)
  const source=roadCoverage.sources?.find(s=>s.kind===sourceKind && s.id===sourceId)
    const currentConfirmations=roadCoverage.history?.filter(h=>h.scopeObligationId===scopeId && h.provenance===provenance && !roadCoverage.history?.some(next=>next.supersedesId===h.id)) || []
  const pending=fastTrackPending(roadCoverage.projectId,'coverage')
  const fieldErrors=coverageFormErrors(roadCoverage,{scopeId,handoverId,sourceId,sourceKind,provenance,from:applicableFrom,through:applicableTo,reason,documentNo,supersedesId})
  const validation=Object.values(fieldErrors)[0] || ''
  const errorAt=(field:keyof typeof fieldErrors)=>!pending && fieldErrors[field] ? <p role="alert" className="text-red-700 text-[11px] mt-1">{fieldErrors[field]}</p>:null
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if(pending){onConfirm(pending.body as RoadCoverageInputDto,{projectId:roadCoverage.projectId,projectName:roadCoverage.projectName,fromKm:roadCoverage.fromKm,toKm:roadCoverage.toKm});return}
    if(validation || !scope)return
    onConfirm(buildCoverageInput(roadCoverage,{scopeId,handoverId,sourceId,sourceKind,provenance,from:applicableFrom,through:applicableTo,reason,documentNo,supersedesId}), {projectId:roadCoverage.projectId,projectName:roadCoverage.projectName,fromKm:scope.from/1000,toKm:scope.to/1000})
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="verified" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Phê Duyệt Độ Phủ Tuyến Bảo Hành</h3>
              <span className="text-[10px] text-slate-500">Kỹ sư Giám sát / Chủ đầu tư thẩm duyệt hồ sơ bàn giao tuyến</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Thông tin dự án và lý trình */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phạm vi nghĩa vụ cần xác nhận:</span>
              <span className="font-bold text-slate-900">
                Lý trình Km {scope ? scope.from/1000 : '—'} - Km {scope ? scope.to/1000 : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Phạm vi nguồn:</span>
              <span className="font-mono text-slate-700 font-semibold truncate max-w-[200px]">
                {scope ? `${scope.from}–${scope.to} m, lệch ${scope.offsetFrom}–${scope.offsetTo} m` : 'Chọn phạm vi từ hồ sơ'}
              </span>
            </div>
          </div>

          {/* Căn cứ pháp lý */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Căn cứ pháp lý áp dụng</label>
              <span className="text-[10px] text-slate-500">
                {roadCoverage.hasWarrantySource ? 'Hồ sơ có hợp đồng bảo hành' : 'Áp dụng bảo dưỡng thường xuyên'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex flex-col gap-1 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  sourceKind === 'MAINTENANCE_BASIS'
                    ? 'border-[#C9A227] bg-amber-50/50 text-[#C9A227] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sourceKind"
                    disabled={!!pending}
                    checked={sourceKind === 'MAINTENANCE_BASIS'}
                    onChange={() => setSourceKind('MAINTENANCE_BASIS')}
                    className="sr-only"
                  />
                  <Icon name="handyman" size={16} />
                  <span className="text-xs">Bảo dưỡng thường xuyên</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal pl-6">
                  Biên bản bàn giao &amp; quy chuẩn bảo trì tuyến
                </span>
              </label>

              <label
                className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all ${
                  !roadCoverage.hasWarrantySource
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-80'
                    : sourceKind === 'WARRANTY'
                    ? 'border-[#C9A227] bg-amber-50/50 text-[#C9A227] font-bold cursor-pointer'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sourceKind"
                    disabled={!!pending || !roadCoverage.hasWarrantySource}
                    checked={sourceKind === 'WARRANTY'}
                    onChange={() => {
                      if (roadCoverage.hasWarrantySource) setSourceKind('WARRANTY')
                    }}
                    className="sr-only"
                  />
                  <Icon name="verified_user" size={16} />
                  <span className="text-xs">Hợp đồng bảo hành</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal pl-6">
                  {roadCoverage.hasWarrantySource ? 'Theo điều khoản bảo hành công trình' : 'Chưa có hợp đồng bảo hành trong CSDL'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-slate-500">Hồ sơ bàn giao cần tệp đã xác minh thuộc đúng dự án. Dự án tạo từ bản mới đã có biên bản; dự án cũ thiếu biên bản được Giám sát bổ sung ngay bên dưới.</p>
            <HandoverAttachCard projectId={roadCoverage.projectId}/>
            <CoverageDocumentUpload projectId={roadCoverage.projectId}/>
            <button type="button" disabled={isSubmitting} onClick={()=>window.dispatchEvent(new Event('fasttrack-refresh'))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">Đọc lại nguồn hồ sơ</button>
            <label className="block">Phạm vi nghĩa vụ<select disabled={!!pending} value={scopeId} onChange={e=>{setScopeId(e.target.value);setSupersedesId('')}} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">Chọn phạm vi</option>{roadCoverage.scopes?.map((s,i)=><option key={s.obligationId} value={s.obligationId}>Phạm vi {i+1}: {s.from}–{s.to} m, lệch {s.offsetFrom}–{s.offsetTo} m</option>)}</select>{errorAt('scopeId')}</label>
            <label className="block">Hồ sơ bàn giao đã chấp nhận<select disabled={!!pending || !roadCoverage.sources?.some(s=>s.kind==='HANDOVER')} value={handoverId} onChange={e=>setHandoverId(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">Chọn hồ sơ bàn giao</option>{roadCoverage.sources?.filter(s=>s.kind==='HANDOVER').map((s,i)=><option key={s.id} value={s.id}>Hồ sơ bàn giao {i+1} · {s.provenance==='TEST_ONLY'?'Thử nghiệm':'Chưa xác minh bên ngoài'}</option>)}</select>{errorAt('handoverId')}</label>
            <label className="block">Nguồn bảo hành / bảo trì<select disabled={!!pending || !roadCoverage.sources?.some(s=>s.kind===sourceKind)} value={sourceId} onChange={e=>setSourceId(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">Chọn căn cứ</option>{roadCoverage.sources?.filter(s=>s.kind===sourceKind).map((s,i)=><option key={s.id} value={s.id}>Căn cứ {i+1} · {s.provenance==='TEST_ONLY'?'Thử nghiệm':'Chưa xác minh bên ngoài'}</option>)}</select>{errorAt('sourceId')}</label>
            <label className="block">Nguồn gốc<select disabled={!!pending} value={provenance} onChange={e=>setProvenance(e.target.value as 'REAL_SOURCE'|'TEST_ONLY')} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="TEST_ONLY">Thử nghiệm — không cấp quyền thi công</option><option value="REAL_SOURCE" disabled={[handover,source].some(s=>!s || !['SOURCE_NOT_EXTERNALLY_VERIFIED','REAL_SOURCE'].includes(s.provenance || ''))}>Căn cứ thực tế — Giám sát phải đối chiếu</option></select>{errorAt('provenance')}</label>
            {provenance==='REAL_SOURCE' && <p className="text-amber-800">Chỉ xác nhận khi Giám sát đã đối chiếu hồ sơ thực tế. Tệp đã tải lên không tự chứng minh việc xác minh ngoài thực tế.</p>}
            <label className="block">Thay thế xác nhận đã lưu (nếu có)<select aria-label="Xác nhận độ phủ cần thay thế" disabled={!!pending || !currentConfirmations.length} value={supersedesId} onChange={e=>setSupersedesId(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 mt-1"><option value="">Không thay thế xác nhận cũ</option>{currentConfirmations.map(h=><option key={h.id} value={h.id}>Xác nhận {coverageDate(h.confirmedAtUtc)} · {h.provenance==='TEST_ONLY'?'Thử nghiệm':'Hồ sơ đã lưu'}</option>)}</select>{errorAt('supersedesId')}</label>
          </div>
          {/* Số văn bản bàn giao */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ghi chú số hiệu văn bản (không bắt buộc)</label>
            <input
              type="text"
              disabled={!!pending}
              value={documentNo}
              onChange={(e) => setDocumentNo(e.target.value)}
              placeholder="Số hiệu nếu hồ sơ nguồn có cung cấp"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono font-medium text-slate-800"
            />
          </div>

          {/* Thời hạn hiệu lực */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Hiệu lực từ ngày (giờ Việt Nam) *</label>
              <input
                type="date"
                required
                aria-label="Ngày bắt đầu độ phủ" disabled={!!pending}
                aria-invalid={!!fieldErrors.from}
                value={applicableFrom}
                onChange={(e) => setApplicableFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
              {(applicableFrom || applicableTo) && errorAt('from')}
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Đến hết ngày (giờ Việt Nam) *</label>
              <input
                type="date"
                required
                aria-label="Ngày kết thúc độ phủ" disabled={!!pending}
                aria-invalid={!!fieldErrors.through}
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
              {(applicableFrom || applicableTo) && errorAt('through')}
            </div>
          </div>

          {/* Lý do / Ý kiến phê duyệt */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ý kiến thẩm duyệt của Giám sát *</label>
            <textarea
              rows={2}
              maxLength={2000} disabled={!!pending} aria-label="Ý kiến xác nhận độ phủ"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            />
            {!!(reason || documentNo) && errorAt('reason')}
          </div>

          {/* Cảnh báo lỗi nếu phê duyệt không thành công */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <Icon name="error" size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Lỗi khi phê duyệt độ phủ tuyến:</div>
                <div className="text-[11px] leading-relaxed break-words">{errorMessage}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!pending && !!validation)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Icon name="sync" size={14} className="animate-spin" />}
              <span>{isSubmitting ? 'Đang đối chiếu...' : pending ? 'Đối chiếu xác nhận đã gửi' : 'Xác nhận phê duyệt độ phủ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
