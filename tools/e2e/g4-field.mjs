// G4 mục 1 — retest FIELD MeasurementType 1–6 (BE đã sửa trigger). Tạo task qua API được phép bằng phiên PM-A (nhãn API-created trong ledger).
// UI: kiểm form "Tạo nhiệm vụ" có đủ 6 loại. Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-field.mjs [ui|api]
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, sleep, PROJECT_A } from './lib.mjs'
const STAGE = process.argv[2] || 'api'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const { browser, page, log } = await open({ height: 3200 })
await login(page, 'pm-a')

if (STAGE === 'ui') {
  await go(page, `/pm/field-tasks?projectId=${PROJECT_A}`, 9000)
  const opened = await clickByText(page, /Tạo nhiệm vụ/); await sleep(3500)
  check('Mở form tạo FIELD', opened === 'clicked', opened)
  const opts = await page.evaluate(() => [...(document.querySelector('.fixed select[aria-label="Loại đo FIELD canonical"]')?.options || [])].map((o) => o.textContent))
  check('Form liệt kê đủ 6 loại đo (khớp BE 1–6)', ['Độ sâu lún', 'Chênh cao tấm', 'Phạm vi xói vai đường', 'Diện tích', 'Chiều dài vùng lún', 'Chiều rộng vùng lún'].every((x) => opts.includes(x)), opts.join(' | '))
}

if (STAGE === 'api') {
  const defects = (await apiGet(page, `/projects/${PROJECT_A}/defects?pageSize=100`)).body.items.filter((d) => d.status === 'OPEN')
  const members = (await apiGet(page, `/projects/${PROJECT_A}/members?limit=100`)).body
  const crew = (members.items || members).find((m) => m.role === 'CREW' && m.status === 'ACTIVE')
  console.log('defects', defects.map((d) => d.id.slice(0, 8) + ':' + d.defectTypeCode).join(' '), 'crew', crew?.userId)
  const types = (process.env.G4_TYPES || '5,6,1,2,3,4').split(',').map(Number)
  // Nguồn SURVEY: Defect do AI phát hiện → source-defect.sources → kết quả run → dataset → surveyId thật.
  let surveyId = '', surveyDefect = null
  if ((process.env.G4_KINDS || '').includes('SURVEY')) {
    for (const k of (await apiGet(page, `/projects/${PROJECT_A}/repair-packages?limit=100`)).body.items) for (const it of (await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${k.id}/items?limit=100`)).body.items) {
      if (surveyId) break
      const sd = (await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${k.id}/items/${it.id}/source-defect`)).body
      const det = (sd?.sources || []).find((x) => /AI|DETECT|SURVEY/i.test(x.kind || ''))
      if (!det) continue
      for (const run of (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs?limit=100`)).body.items || []) {
        const res = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${run.id}/result`)).body
        const hit = (res.detections || []).find((d) => d.detectionId === det.id)
        if (hit) { const ds = await apiGet(page, `/datasets/${hit.datasetVersionId || run.datasetId}`); surveyId = ds.body?.surveyId || ''; surveyDefect = it.defectId; break }
      }
    }
    console.log('SURVEY surveyId=', surveyId, 'defect=', surveyDefect)
  }
  for (const kind of (process.env.G4_KINDS || 'REPORTER').split(',')) {
    for (const [i, t] of types.entries()) {
      const d = kind === 'SURVEY' ? defects.find((x) => x.id === surveyDefect) : process.env.G4_DEFECT ? defects.find((x) => x.id.startsWith(process.env.G4_DEFECT.split(',')[i % process.env.G4_DEFECT.split(',').length])) : defects[i % defects.length]
      const dd = await apiGet(page, `/projects/${PROJECT_A}/defects/${d.id}`)
      const wp = (await apiGet(page, `/projects/${PROJECT_A}/work-package`)).body
      const road = wp.roadSections.find((x) => x.currentVersionId === dd.body.roadSectionVersionId)
      const sets = (await apiGet(page, `/projects/${PROJECT_A}/road-sections/${road.roadSectionId}/versions/${road.currentVersionId}/segment-sets`)).body.items || []
      const geo = (await apiGet(page, `/projects/${PROJECT_A}/road-sections/${road.roadSectionId}/versions/${road.currentVersionId}/geometry`)).body
      const body = { defectId: d.id, defectVersion: dd.body.version, ...(kind === 'SURVEY' ? { surveyId, sourceKind: 'SURVEY' } : { sourceKind: 'REPORTER' }), routeVersionId: dd.body.roadSectionVersionId, segmentSetId: (sets.find((x) => x.status === 'PUBLISHED') || {}).id, crsProfileRevisionId: geo.crsProfileRevisionId ?? null, purpose: 'PRE_MEASUREMENT', requiredMeasurementType: t, measurementScope: '{}', instructions: `[TEST-FE G4] FIELD loại ${t} nguồn ${kind}`, assignedToUserId: crew.userId, dueAt: new Date(Date.now() + 5 * 86400000).toISOString() }
      const r = await apiSend(page, 'POST', `/projects/${PROJECT_A}/field-inspection-tasks`, body)
      const b = r.body || {}
      console.log(`type ${t} ${kind}: HTTP ${r.status} id=${b.id || '-'} code=${b.code || b.title || ''} corr=${b.correlationId || ''} ${r.status >= 400 ? JSON.stringify(b.errors || b).slice(0, 500) : ''}`)
      if (r.status < 300) {
        const g = await apiGet(page, `/projects/${PROJECT_A}/field-inspection-tasks/${b.id}`)
        check(`FIELD loại ${t} (${kind}): POST ${r.status} và GET đọc lại đúng mã`, g.status === 200 && g.body.requiredMeasurementType === t, `GET ${g.status} type=${g.body?.requiredMeasurementType}`)
      } else check(`FIELD loại ${t} (${kind}): POST thành công`, false, `HTTP ${r.status} ${b.code || ''} ${b.correlationId || ''}`)
    }
  }
}
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
