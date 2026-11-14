import { displayStatus, layerLabel, reasonLabel, pavementSizeLabel, readableTime } from './alignmentLabels'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { mapPublicationService, type PublicationManifest, type PublicationPage } from '../../../api/services/mapPublicationService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import type { usePavementWorkflow } from './usePavementWorkflow'

function pinsKey(params: URLSearchParams) { return ['layoutId','roadSectionId','routeVersionId','segmentSetId'].map(k=>params.get(k)||'').join(':') }

export function MapPublicationPanel({ workflow, readOnly }: { workflow: ReturnType<typeof usePavementWorkflow>; readOnly: boolean }) {
  const [params,setParams] = useSearchParams(), {id: projectId = ''} = useParams<{id?: string}>(), actor = useAuthStore()
  const id = params.get('publicationId') || '', source = workflow.snapshot
  const scope = `${actor.authEpoch}:${actor.user?.id}:${projectId}:${params.get('layoutId')}:${params.get('routeVersionId')}:${params.get('segmentSetId')}:${id}`
  const reference = `${projectId}:${pinsKey(params)}`
  const previousReference = useRef({ reference, id })
  const live = useRef(scope); live.current = scope
  const running = useRef(false)
  const [reason,setReason] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('')
  const [manifest,setManifest] = useState<PublicationManifest|null>(null), [layer,setLayer] = useState(''), [page,setPage] = useState<PublicationPage|null>(null)
  const seen = useRef(new Set<string>())
  const [reload,setReload] = useState(0)
  const pins = {projectId,routeVersionId:params.get('routeVersionId') || '',segmentSetId:params.get('segmentSetId') || '',layoutRevisionId:params.get('layoutId') || ''}
  const report = (e: any) => setError(e?.response ? `HTTP ${e.response.status}: ${e.response.data?.code || e.response.data?.title || 'unknown'}${e.response.data?.correlationId ? ` — ${e.response.data.correlationId}` : ''}. Giữ yêu cầu/kết quả; không tự gửi lại.` : e.message)
  useEffect(() => {
    let active = true
    const previous = previousReference.current
    previousReference.current = { reference, id }
    if (previous.reference !== reference && id && previous.id === id) {
      setParams(current=>{const next=new URLSearchParams(current);next.delete('publicationId');return next},{replace:true})
      return
    }
    setBusy(false);setManifest(null); setPage(null);setLayer('');setError('');seen.current.clear()
    if (!id) {
      try { const held = mapPublicationService.pending(projectId); if (held && held.pins.layoutRevisionId === pins.layoutRevisionId) {setReason(held.body.reason);if(held.receipt?.publicationId)setParams(current=>{const next=new URLSearchParams(current);next.set('publicationId',held.receipt!.publicationId);return next},{replace:true})} } catch(e) {report(e)}
      return
    }
    setBusy(true)
    mapPublicationService.read(pins,id).then(value=>{if(active){setManifest(value);setLayer(value.layers[0]?.key || '')}}).catch(e=>{if(active)report(e)}).finally(()=>{if(active)setBusy(false)})
    return()=>{active=false}
  },[scope,reload])
  const publish = async () => {
    if (running.current || readOnly || actor.user?.role !== RoleCode.PROJECT_MANAGER || !source || blocked) return
    const selected = scope
    running.current=true;setBusy(true);setError('')
    try {
      await mapPublicationService.publish(source,params.get('roadSectionId') || '',reason,publicationId=>{
        if(live.current !== selected)return
        setParams(current=>{const next=new URLSearchParams(current);next.set('publicationId',publicationId);return next})
      })
    } catch(e) {if(live.current===selected)report(e)} finally {running.current=false;if(live.current===selected)setBusy(false)}
  }
  const readPage = async (next=false) => {
    if (!manifest || !layer || running.current) return
    const selected=scope, selectedLayer=layer, cursor=next?page?.nextCursor || undefined:undefined
    if(next&&!cursor)return
    running.current=true;setBusy(true);setError('');if(!next)setPage(null)
    try {
      if(!next)seen.current.clear()
      const value=await mapPublicationService.page(manifest,selectedLayer,cursor)
      if(live.current!==selected)return
      if(value.nextCursor&&seen.current.has(value.nextCursor))throw new Error('Mốc phân trang lớp bản đồ bị lặp; dừng phân trang.')
      if(cursor)seen.current.add(cursor)
      setPage(value)
    }catch(e){if(live.current===selected)report(e)}finally{running.current=false;if(live.current===selected)setBusy(false)}
  }
  const revise = async () => {
    if (busy || readOnly) return
    const selected=scope;setBusy(true);setError('')
    try {await mapPublicationService.revise(projectId);if(live.current===selected)setReload(n=>n+1)}catch(e){if(live.current===selected)report(e)}finally{if(live.current===selected)setBusy(false)}
  }
  const blocked = workflow.loading || workflow.busy || !!workflow.error || !!workflow.pending || !!workflow.asBuilt.active || !!workflow.asBuilt.pending || !source || source.id !== pins.layoutRevisionId || source.projectId !== projectId || source.routeVersionId !== pins.routeVersionId || source.segmentSetId !== pins.segmentSetId
  const metadata = manifest?.layers.find(l=>l.key===layer)
  return <section className="rounded-lg border p-3 space-y-2 text-xs" aria-label="Công bố bản đồ xem thử">
    <h4 className="font-semibold">Bản đồ xem thử</h4>
    {source && !blocked && (!manifest || manifest.layoutRevisionId === source.id) && <p>Cấu hình nguồn: {displayStatus(source.kind)} · {pavementSizeLabel(source)}{workflow.layouts.find(row=>row.layoutId===source.id)?.createdAt ? ` · ${readableTime(workflow.layouts.find(row=>row.layoutId===source.id)!.createdAt)}` : ''}</p>}
    {!readOnly && actor.user?.role === RoleCode.PROJECT_MANAGER && !id && <>
      <label className="block">Lý do công bố<input aria-label="Lý do công bố bản đồ" value={reason} onChange={e=>setReason(e.target.value)} disabled={busy} className="block border rounded p-2 w-full" /></label>
      <button type="button" disabled={busy||blocked||!reason.trim()} onClick={()=>void publish()} className="border rounded p-2 disabled:opacity-50">Công bố bản đồ xem thử</button>
      {blocked&&<p>Chọn cấu hình đã lưu, đúng tuyến và bộ phân đoạn; kết thúc bản nhập đang dở trước khi công bố.</p>}
    </>}
    {!readOnly && !id && <button type="button" disabled={busy} onClick={()=>void revise()} className="border rounded p-2">Đối chiếu / sửa ý định bị từ chối</button>}
    {id&&<p>Đã có bản công bố</p>}
    <button type="button" disabled={busy} onClick={()=>setReload(n=>n+1)} className="border rounded p-2">Đọc lại kết quả công bố</button>
    {manifest&&<>
      <p>{manifest.sampleOnly ? 'Bản đồ xem thử' : 'Bản đồ chính thức'}</p>
      <select aria-label="Lớp bản đồ" value={layer} disabled={busy} onChange={e=>{setLayer(e.target.value);setPage(null);setError('');seen.current.clear()}} className="border rounded p-2 w-full"><option value="">Chọn lớp bản đồ</option>{manifest.layers.map(l=><option key={l.key} value={l.key}>{layerLabel(l.key)} · {displayStatus(l.status)} · {l.count}</option>)}</select>
      {metadata&&<p role="status">{displayStatus(metadata.status)} · {(metadata.reasonCodes||[]).map(reasonLabel).join(' ')}</p>}
      <button type="button" disabled={busy||!layer} onClick={()=>void readPage()} className="border rounded p-2">Đọc lớp bản đồ</button>
      {page&&<><p role="status">{page.features.length ? `${page.features.length} đối tượng trong trang từ máy chủ` : 'Không có dữ liệu trong trang lớp bản đồ.'}</p>{page.nextCursor&&<button type="button" disabled={busy} onClick={()=>void readPage(true)} className="border rounded p-2">Trang tiếp</button>}</>}
    </>}
    {busy&&<p role="status">Đang gửi/đọc kết quả…</p>}
    {error&&<><p role="alert">Không thể hoàn tất yêu cầu. Kết quả được giữ để đối chiếu; xem chi tiết kỹ thuật.</p><details><summary>Chi tiết kỹ thuật</summary><p>{error}</p></details></>}
  </section>
}
