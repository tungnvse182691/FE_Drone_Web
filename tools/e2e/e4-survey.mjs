// E4: hoàn tất nhiệm vụ khảo sát (POST /survey-tasks/{id}/complete) và giao lại Operator (loại Operator hiện tại).
// Chạy trên Project B bằng pm-b. Dữ liệu setup (đánh giá bằng chứng PASS) tạo bằng API, đánh dấu [TEST-FE].
import { open, login, go, apiGet, report, bodyText, clickByText, sleep, PROJECT_B } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
async function send(page, method, path, body, headers = {}) {
  return page.evaluate(async (m, p, b, h) => {
    const csrf = (await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()).requestToken
    const r = await fetch(`/api/v1${p}`, { method: m, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Idempotency-Key': crypto.randomUUID(), ...h }, body: b == null ? undefined : JSON.stringify(b) })
    let json = null; try { json = await r.json() } catch { /* không có thân */ }
    return { status: r.status, body: json, etag: r.headers.get('etag') }
  }, method, path, body, headers)
}

const { browser, page, log } = await open({ height: 4200 }); await login(page, 'pm-b')
const tasks = (await apiGet(page, `/projects/${PROJECT_B}/survey-tasks`)).body.items
const task = tasks.find((t) => t.status === 'SUBMITTED')
check('Có nhiệm vụ khảo sát SUBMITTED ở SBX-B', !!task, tasks.map((t) => t.status).join(','))
const ds = (await apiGet(page, `/survey-tasks/${task.id}/datasets`)).body.items[0]
const detail = await page.evaluate(async (id) => { const r = await fetch(`/api/v1/datasets/${id}`, { credentials: 'include' }); return { etag: r.headers.get('etag'), body: await r.json() } }, ds.id)

// Dữ liệu setup: đánh giá bằng chứng PASS cho mọi phân đoạn
const items = detail.body.scope.flatMap((s) => s.segmentIds.map((segmentId) => ({ routeVersionId: s.routeVersionId, segmentSetId: s.segmentSetId, segmentId, targetBand: s.targetBand, positionStatus: 'PASS', qualityStatus: 'PASS', coverageStatus: 'PASS', reason: '[TEST-FE] Đánh giá thử để kiểm hoàn tất nhiệm vụ', evidence: [{ fileId: detail.body.sourceFiles[0].fileId, fromMilliseconds: 0, toMilliseconds: 1000 }] })))
const asm = await send(page, 'POST', `/datasets/${ds.id}/assessments`, { methodVersion: 'pm-evidence-review.v1', items }, { 'If-Match': detail.etag })
check('Setup: tạo đánh giá PASS cho bản nộp (API)', asm.status === 201, `status ${asm.status} ${JSON.stringify(asm.body).slice(0, 900)}`)

// UI: thẻ hoàn tất
await go(page, '/pm/surveys', 10000)
const n = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent)).length)
let opened = false
for (let i = 0; i < n && !opened; i++) {
  await page.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent))[i].click(), i); await sleep(8000)
  opened = await page.evaluate(() => !!document.querySelector('[aria-label="Bản nộp xác nhận hoàn tất"]'))
  if (!opened) { await clickByText(page, /Đóng lại/); await sleep(1000) }
}
check('Nhiệm vụ SUBMITTED hiện thẻ "Xác nhận hoàn tất nhiệm vụ khảo sát"', opened, '')
const btn0 = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Xác nhận hoàn tất nhiệm vụ/.test(x.textContent)); return b ? (b.disabled ? 'DISABLED' : 'enabled') : 'no-btn' })
check('Chưa chọn bản nộp thì nút xác nhận bị khóa', btn0 === 'DISABLED', btn0)
await page.evaluate(() => { const s = document.querySelector('[aria-label="Bản nộp xác nhận hoàn tất"]'); const o = [...s.options].find((x) => x.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) })
await sleep(5000)
const card = await page.evaluate(() => document.querySelector('[data-testid="survey-complete-assessment"]')?.innerText.replace(/\s+/g, ' ') || '')
check('Hiện đánh giá hiện hành của bản nộp (phương pháp pm-evidence-review.v1)', /pm-evidence-review\.v1/.test(card), card.slice(0, 160))
await page.evaluate(() => { const t = document.querySelector('[aria-label="Lý do xác nhận hoàn tất nhiệm vụ"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE] PM xác nhận hồ sơ đáp ứng đủ phạm vi'); t.dispatchEvent(new Event('input', { bubbles: true })) })
const w0 = log.writes.length
await clickByText(page, /Xác nhận hoàn tất nhiệm vụ/); await sleep(9000)
check('POST /survey-tasks/{id}/complete 200', log.writes.slice(w0).some((x) => /POST \/survey-tasks\/\{id\}\/complete 200/.test(x)), log.writes.slice(w0).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
const after = (await apiGet(page, `/survey-tasks/${task.id}`)).body
check('GET nhiệm vụ: status = COMPLETED', after?.status === 'COMPLETED', `status=${after?.status}`)
check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close()

const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
