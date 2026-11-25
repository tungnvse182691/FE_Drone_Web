// G4 — thăm dò trạng thái dữ liệu thật (chỉ GET). Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-probe.mjs
import { open, login, apiGet, PROJECT_A, PROJECT_B } from './lib.mjs'
const brief = (r) => `${r.status} ${JSON.stringify(r.body).slice(0, 700)}`
const pmA = await open(); await login(pmA.page, 'pm-a')
for (const p of [PROJECT_A]) {
  const defects = await apiGet(pmA.page, `/projects/${p}/defects?pageSize=100`)
  console.log('A defects', defects.status, (defects.body?.items || []).map((d) => `${d.id.slice(0, 8)}:${d.defectTypeCode}:${d.status}`).join(' '))
  const pk = await apiGet(pmA.page, `/projects/${p}/repair-packages?limit=100`)
  console.log('A packages', pk.status, (pk.body?.items || []).map((x) => x.id.slice(0, 8)).join(' '))
  for (const k of pk.body?.items || []) {
    const it = await apiGet(pmA.page, `/projects/${p}/repair-packages/${k.id}/items?limit=100`)
    console.log('  items of', k.id.slice(0, 8), (it.body?.items || []).map((i) => `${i.id.slice(0, 8)}:${i.mode}:${i.state}:${i.result}:def ${String(i.defectId).slice(0, 8)}`).join(' | '))
  }
  const ft = await apiGet(pmA.page, `/projects/${p}/field-inspection-tasks?limit=100`)
  console.log('A field tasks', ft.status, JSON.stringify((ft.body?.items || []).map((t) => ({ id: t.id.slice(0, 8), st: t.status, mode: t.mode, d: t.defectIds || t.defectId }))).slice(0, 600))
  const lc = await apiGet(pmA.page, `/projects/${p}/lifecycle`)
  console.log('A lifecycle', lc.status, JSON.stringify({ resp: (lc.body?.responsibilities || []).length, transferable: (lc.body?.transferableObligations || []).length }))
}
await pmA.browser.close()
const sup = await open(); await login(sup.page, 'supervisor')
for (const p of [PROJECT_A, PROJECT_B]) {
  console.log('SUP handover-documents', p.slice(-1), brief(await apiGet(sup.page, `/projects/${p}/handover-documents`)))
  console.log('SUP offline packages', brief(await apiGet(sup.page, `/projects/${p}/offline/packages?limit=20`)))
  console.log('SUP offline devices', brief(await apiGet(sup.page, `/projects/${p}/offline/devices?limit=20`)))
  console.log('SUP offline grants', brief(await apiGet(sup.page, `/projects/${p}/offline/grants?limit=20`)))
}
await sup.browser.close()
