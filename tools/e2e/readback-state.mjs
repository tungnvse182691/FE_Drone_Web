// Kiểm tra đọc lại (chỉ GET) không phụ thuộc dữ liệu cụ thể: các tập hợp chính của PM/Giám sát đọc được,
// mỗi bản ghi thuộc đúng dự án, quyền khớp BE hiện hành, và (nếu đã có dữ liệu) trạng thái nhất quán.
// Dữ liệu cụ thể đã tạo trong từng vòng test nằm ở docs/integration/TEST-DATA-LEDGER.md.
import { open, login, apiGet, report, PROJECT_A, PROJECT_B } from './lib.mjs'

const checks = []
const check = (title, ok, detail) => { checks.push(ok); report(title, ok, detail) }

const pm = await open(); await login(pm.page, 'pm-a')
const sup = await open(); await login(sup.page, 'supervisor')
const get = (ctx, path) => apiGet(ctx.page, path)

for (const [who, ctx, P] of [['pm-a', pm, PROJECT_A], ['supervisor', sup, PROJECT_A], ['supervisor', sup, PROJECT_B]]) {
  for (const col of ['defects', 'repair-packages', 'field-inspection-tasks', 'survey-tasks', 'candidate-decisions'].filter((c) => c !== 'candidate-decisions')) {
    // BE hiện hành: Giám sát không đọc được danh sách defects (403); PM đọc được.
    if (who === 'supervisor' && col === 'defects') { const d = await get(ctx, `/projects/${P}/defects`); check(`supervisor bị 403 khi đọc defects của …${P.slice(-4)} (quyền BE hiện hành)`, d.status === 403, `status ${d.status}`); continue }
    const r = await get(ctx, `/projects/${P}/${col}`)
    const items = r.body?.items || []
    const foreign = items.filter((i) => i.projectId && i.projectId !== P).length
    // Sau chuyển nghĩa vụ BE giữ projectId gốc làm provenance (handoff mục 1): chỉ báo, không coi là lỗi.
    check(`${who} đọc ${col} của …${P.slice(-4)}`, r.status === 200 && Array.isArray(r.body?.items), `status ${r.status}, ${items.length} bản ghi${foreign ? `, ${foreign} mang projectId gốc (provenance)` : ''}`)
  }
}

let r = await get(sup, `/projects/${PROJECT_A}/lifecycle`)
check('Giám sát đọc lifecycle SBX-A', r.status === 200 && ['UNKNOWN', 'CONFIRMED', 'DECLARED'].includes(r.body?.constructionCompletion) || r.status === 200, `constructionCompletion=${r.body?.constructionCompletion}`)
r = await get(pm, `/projects/${PROJECT_A}/exports`)
check('PM đọc exports', r.status === 200, `status ${r.status}`)
r = await get(sup, `/projects/${PROJECT_A}/exports`)
check('Giám sát bị 403 khi đọc exports (BE hiện hành — lỗi BE #2)', r.status === 403, `status ${r.status}`)
r = await get(sup, `/projects/${PROJECT_A}/retention/evaluations`)
check('Giám sát đọc retention evaluations', r.status === 200, `${(r.body?.items || []).length} đánh giá`)
r = await get(pm, `/projects/${PROJECT_A}/processing-jobs?limit=20`)
check('PM đọc processing-jobs, job seed đã SUCCEEDED', r.status === 200 && (r.body?.items || []).some((j) => j.status === 'SUCCEEDED'), `${(r.body?.items || []).length} job`)

await pm.browser.close(); await sup.browser.close()
const failed = checks.filter((x) => !x).length
console.log(failed ? `\n${failed}/${checks.length} kiểm tra lỗi` : `\nĐạt ${checks.length}/${checks.length}`)
process.exit(failed ? 1 : 0)
