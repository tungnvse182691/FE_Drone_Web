// E4: "Giao lại cho Operator khác" không cho chọn Operator đang giữ nhiệm vụ; không còn ai khác thì báo rõ và khóa xác nhận.
// Dùng pm-a trên Project A. Tạo thêm 1 nhiệm vụ khảo sát (API, [TEST-FE]) ở trạng thái NEW_ASSIGNED để có thao tác giao lại.
import { open, login, go, apiGet, report, clickByText, sleep, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
async function send(page, method, path, body, headers = {}) {
  return page.evaluate(async (m, p, b, h) => {
    const csrf = (await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()).requestToken
    const r = await fetch(`/api/v1${p}`, { method: m, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Idempotency-Key': crypto.randomUUID(), ...h }, body: b == null ? undefined : JSON.stringify(b) })
    let json = null; try { json = await r.json() } catch { /* không có thân */ }
    return { status: r.status, body: json }
  }, method, path, body, headers)
}

const { browser, page, log } = await open({ height: 4200 }); await login(page, 'pm-a')
const tasks = (await apiGet(page, `/projects/${PROJECT_A}/survey-tasks`)).body.items
let target = tasks.find((t) => ['NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(t.status))
if (!target) {
  const base = tasks[0]
  const scope = (await apiGet(page, `/survey-tasks/${base.id}`)).body.scope
  const created = await send(page, 'POST', `/projects/${PROJECT_A}/survey-tasks`, { scope, surveyType: 'BASELINE', operatorId: base.operatorId, dueAt: new Date(Date.now() + 7 * 86400000).toISOString(), accessPoint: null })
  check('Setup: tạo nhiệm vụ khảo sát mới (API)', created.status === 201, `status ${created.status} ${JSON.stringify(created.body).slice(0, 300)}`)
  target = created.body
}
const detail = (await apiGet(page, `/survey-tasks/${target.id}`)).body
check('Nhiệm vụ ở trạng thái cho phép giao lại', ['NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(detail.status), detail.status)

await go(page, '/pm/surveys', 10000)
const n = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent)).length)
let opened = false
for (let i = 0; i < n && !opened; i++) {
  await page.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent))[i].click(), i); await sleep(8000)
  opened = await page.evaluate(() => !!document.querySelector('[aria-label="Operator nhận nhiệm vụ"]') && /Giao lại cho Operator khác/.test(document.body.innerText))
  if (!opened) { await clickByText(page, /Đóng lại/); await sleep(1000) }
}
check('Mở được form giao lại (có chọn Operator)', opened, `${n} thẻ`)
const info = await page.evaluate(() => { const s = document.querySelector('[aria-label="Operator nhận nhiệm vụ"]'); return { options: [...s.options].map((o) => o.text), text: document.body.innerText } })
const members = (await apiGet(page, `/projects/${PROJECT_A}/members`)).body
const ops = (members?.items || members || []).filter((m) => /OPERATOR/i.test(m.role || ''))
check('Danh sách Operator không chứa Operator hiện tại', !info.options.some((o) => /operator-a/i.test(o)), `options=${JSON.stringify(info.options)}; operators của dự án=${ops.length}`)
if (ops.length <= 1) {
  check('Không còn Operator khác: hiện thông báo rõ', /Không có Operator nào khác/.test(info.text), '')
  const btn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Xác nhận giao lại/.test(x.textContent)); return b ? (b.disabled ? 'DISABLED' : 'enabled') : 'no-btn' })
  check('Nút "Xác nhận giao lại" bị khóa', btn === 'DISABLED', btn)
}
check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
