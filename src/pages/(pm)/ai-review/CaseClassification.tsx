import React, { useEffect, useState } from 'react'
import { triageService } from '../../../api/services/triageService'
import { useDefectTypeNames, defectTypeLabel } from '../../../api/services/defectTypeNames'
import { useAuthStore } from '../../../store/authStore'
import { reportError } from './useCaseReportMedia'
import { severityLabel } from '../../../utils/severity'

export function CaseClassification({ caseId, version }: { caseId: string; version?: string }) {
  const epoch = useAuthStore(s => s.authEpoch), { names, error: catalogError } = useDefectTypeNames()
  const scope = `${epoch}:${caseId}:${version}`
  const [state, setState] = useState<{ scope: string; value?: Awaited<ReturnType<typeof triageService.readCaseClassifications>>; error?: string }>()
  useEffect(() => {
    const controller = new AbortController()
    triageService.readCaseClassifications(caseId, controller.signal).then(value => { if (!controller.signal.aborted) setState({ scope, value }) })
      .catch(e => { if (!controller.signal.aborted) setState({ scope, error: reportError(e) }) })
    return () => controller.abort()
  }, [scope])
  const current = state?.scope === scope ? state : undefined
  return <section className="col-span-2 space-y-2" data-testid="case-classification">
    <h4 className="font-semibold">Phân loại kỹ thuật đã lưu</h4>
    {!current && <p role="status">Đang đọc Defect liên kết…</p>}
    {current?.error && <p role="alert" className="text-rose-700">{current.error}</p>}
    {catalogError && <p role="alert" className="text-rose-700">Không đọc được tên loại: {catalogError}</p>}
    {current?.value?.rows.map(d => <div key={d.id} className="border rounded-lg p-2 space-y-1">
      <p className="font-mono">DEF-{d.id.slice(0, 8).toUpperCase()}{d.reportId ? ` · Report ${d.reportId.slice(0, 8)}` : ' · Liên kết cấp Case'}</p>
      <p>Loại khiếm khuyết: {d.type ? defectTypeLabel(d.type, names) : 'Máy chủ chưa cung cấp loại.'}</p>
      <p>Mức độ nghiêm trọng: {d.severity && d.severity !== 'UNKNOWN' ? (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(d.severity) ? severityLabel(d.severity as Parameters<typeof severityLabel>[0]) : `Mã mức độ chưa nhận diện: ${d.severity}`) : 'Defect chưa có mức độ được phân loại.'}</p>
      {d.status && <p>Trạng thái Defect: {d.status}</p>}
    </div>)}
    {current?.value && !current.value.rows.length && <p className="text-slate-600">Chưa đọc được kết quả phân loại</p>}
  </section>
}
