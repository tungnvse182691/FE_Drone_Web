// E5: tạo kế hoạch trùng (409 giải thích rõ), form không bị kẹt (Hủy bỏ/F5), tạo kế hoạch hợp lệ, phân biệt kế hoạch/nhiệm vụ/bổ sung.
// pm-a trên Project A (seed mới: có kế hoạch IN_PROGRESS BASELINE cho tuyến MOCK-A). Dữ liệu tạo thêm có tiền tố [TEST-FE] nếu có chỗ nhập chữ.
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, sleep, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
const MODE = process.argv[2] || 'all'

const setSelect = (page, label, value) => page.evaluate((l, v) => {
  const s = document.querySelector(`[aria-label="${l}"]`); if (!s) return 'no-select'
  const o = [...s.options].find((x) => x.value === v || x.text.includes(v)); if (!o) return 'no-option ' + [...s.options].map((x) => x.value).join('|')
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.value
}, label, value)
const setInput = (page, label, value) => page.evaluate((l, v) => {
  const i = document.querySelector(`[aria-label="${l}"]`); if (!i) return false
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, v); i.dispatchEvent(new Event('input', { bubbles: true })); return true
}, label, value)
const journalKeys = (page) => page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('rg_web_survey_create_')))
const formLocked = (page) => page.evaluate(() => document.querySelector('main fieldset')?.disabled === true)
const localDate = (days) => { const d = new Date(Date.now() + days * 86400000); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

async function fillForm(page, type, days = 3) {
  await setSelect(page, 'Dải khảo sát server', 'SURFACE'); await sleep(800)
  const a = await setSelect(page, 'Lý trình bắt đầu theo segment', '0'); await sleep(300)
  const b = await setSelect(page, 'Lý trình kết thúc theo segment', '0.2'); await sleep(300)
  const t = await setSelect(page, 'Loại khảo sát', type); await sleep(300)
  await setInput(page, 'Ngày bay dự kiến', localDate(days)); await sleep(300)
  const op = await page.evaluate(() => { const s = document.querySelector('[aria-label="Operator hiệu lực"]'); const o = [...s.options].find((x) => x.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.text })
  await sleep(500)
  return { a, b, t, op }
}

const { browser, page, log } = await open({ height: 3600 }); await login(page, 'pm-a')

// ---------- (a) trùng kế hoạch → 409 giải thích rõ ----------
if (MODE === 'all' || MODE === 'a') {
  await go(page, `/pm/surveys/create?projectId=${PROJECT_A}`, 14000)
  const filled = await fillForm(page, 'BASELINE')
  check('Điền được form (tuyến, dải, lý trình, loại, lịch, Operator)', !String(filled.a).startsWith('no-') && !String(filled.b).startsWith('no-') && !String(filled.t).startsWith('no-'), JSON.stringify(filled))
  const w0 = log.writes.length
  await clickByText(page, /Tạo kế hoạch và giao nhiệm vụ/); await sleep(9000)
  const posts = log.writes.slice(w0).join('; ')
  const alertText = await page.evaluate(() => [...document.querySelectorAll('main [role=alert]')].map((e) => e.innerText.replace(/\s+/g, ' ')).join(' | '))
  console.log('   POST:', posts, '| alert:', alertText.slice(0, 400))
  if (/POST \/projects\/\{id\}\/survey-plans 409/.test(posts)) {
    check('POST kế hoạch bị BE từ chối 409', true, posts)
    check('Thông báo nêu rõ kế hoạch đang hoạt động trùng tuyến/dải (không chỉ duplicate_request)', /đang hoạt động.*cùng tuyến và loại/.test(alertText), alertText.slice(0, 200))
    const btn = await page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => /Mở kế hoạch KH-/.test(b.textContent))?.textContent.trim() || '')
    check('Có nút mở kế hoạch hiện có', !!btn, btn)
    check('Journal được giải phóng sau 409 (sessionStorage trống)', (await journalKeys(page)).length === 0, JSON.stringify(await journalKeys(page)))
    check('Form không còn bị khóa', !(await formLocked(page)), '')
    // mở kế hoạch hiện có
    await clickByText(page, /Mở kế hoạch KH-/); await sleep(10000)
    check('Nút mở kế hoạch dẫn tới chi tiết kế hoạch', /Chi tiết kế hoạch khảo sát/.test(await bodyText(page, '[role=dialog]', 600)), page.url())
  } else {
    check('POST kế hoạch bị BE từ chối 409 (điều kiện kiểm)', false, 'BE không trả 409 cho yêu cầu trùng: ' + posts)
  }
}

// ---------- (b) F5 / Hủy bỏ với journal dở dang ----------
if (MODE === 'all' || MODE === 'b') {
  await go(page, `/pm/surveys/create?projectId=${PROJECT_A}`, 12000)
  // Dựng journal dở dang không có biên nhận (như bản cũ để lại sau lỗi): phase PLAN, không planId.
  const uid = await page.evaluate(() => { const raw = localStorage.getItem('auth-storage') || ''; return raw })
  const made = await page.evaluate(async (P) => {
    const sess = await (await fetch('/api/v1/auth/web/session', { credentials: 'include' })).json()
    const actor = sess.user?.id || sess.userId || sess.id
    const scope = (await (await fetch(`/api/v1/projects/${P}/survey-plans`, { credentials: 'include' })).json()).items[0].scopeSummary[0]
    const planTask = (await (await fetch(`/api/v1/projects/${P}/survey-tasks`, { credentials: 'include' })).json()).items[0]
    const det = await (await fetch(`/api/v1/survey-tasks/${planTask.id}`, { credentials: 'include' })).json()
    const key = `rg_web_survey_create_${actor}_${P}`
    const c = { actor, projectId: P, input: { scope: det.scope, plannedAt: new Date(Date.now() + 5 * 86400000).toISOString(), surveyType: 'PERIODIC', operatorId: planTask.operatorId }, planKey: crypto.randomUUID(), taskKey: crypto.randomUUID(), phase: 'PLAN' }
    sessionStorage.setItem(key, JSON.stringify(c)); return { key, actor, scope: !!scope }
  }, PROJECT_A)
  check('Dựng journal dở dang (PLAN, chưa có biên nhận)', !!made.actor, JSON.stringify(made))
  // F5
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(12000)
  const afterReload = await journalKeys(page)
  check('F5: journal chưa có biên nhận được đối chiếu và giải phóng', afterReload.length === 0, JSON.stringify(afterReload))
  check('F5: form không bị khóa', !(await formLocked(page)), '')

  // Hủy bỏ với journal dở dang khác
  await page.evaluate(async (P) => {
    const sess = await (await fetch('/api/v1/auth/web/session', { credentials: 'include' })).json(); const actor = sess.user?.id || sess.userId || sess.id
    const planTask = (await (await fetch(`/api/v1/projects/${P}/survey-tasks`, { credentials: 'include' })).json()).items[0]
    const det = await (await fetch(`/api/v1/survey-tasks/${planTask.id}`, { credentials: 'include' })).json()
    sessionStorage.setItem(`rg_web_survey_create_${actor}_${P}`, JSON.stringify({ actor, projectId: P, input: { scope: det.scope, plannedAt: new Date(Date.now() + 6 * 86400000).toISOString(), surveyType: 'AD_HOC', operatorId: planTask.operatorId }, planKey: crypto.randomUUID(), taskKey: crypto.randomUUID(), phase: 'PLAN', lastError: { status: 409, code: 'duplicate_request' } }))
  }, PROJECT_A)
  await clickByText(page, /Hủy bỏ/); await sleep(5000)
  check('Hủy bỏ: giải phóng journal và rời trang', (await journalKeys(page)).length === 0 && /\/pm\/surveys(\?|$)/.test(page.url()) && !/create/.test(page.url()), page.url())
}

// ---------- (c) tạo kế hoạch hợp lệ (loại khác) ----------
if (MODE === 'all' || MODE === 'c') {
  await go(page, `/pm/surveys/create?projectId=${PROJECT_A}`, 14000)
  for (const type of ['PERIODIC', 'AD_HOC']) {
    await fillForm(page, type, type === 'PERIODIC' ? 4 : 5)
    const w0 = log.writes.length
    await clickByText(page, /Tạo kế hoạch và giao nhiệm vụ/); await sleep(11000)
    const posts = log.writes.slice(w0).join('; ')
    console.log('   ', type, 'POST:', posts)
    if (/survey-plans 201/.test(posts)) {
      check(`Tạo kế hoạch ${type}: POST plan 201 và task 201`, /survey-plans 201/.test(posts) && /survey-tasks 201/.test(posts), posts)
      const plans = (await apiGet(page, `/projects/${PROJECT_A}/survey-plans`)).body?.items || []
      check('GET survey-plans đọc lại thấy kế hoạch mới', plans.length >= 2, `${plans.length} kế hoạch`)
      break
    }
    if (type === 'AD_HOC') check('Tạo được ít nhất một kế hoạch hợp lệ (PERIODIC hoặc AD_HOC)', false, posts + ' | ' + await bodyText(page, 'main', 300))
    else { await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => /Hủy bỏ/.test(b.textContent))?.click() }); await sleep(3000); await go(page, `/pm/surveys/create?projectId=${PROJECT_A}`, 12000) }
  }
}

// ---------- (d) phân biệt kế hoạch / nhiệm vụ / bổ sung ----------
if (MODE === 'all' || MODE === 'd') {
  // nhiệm vụ bổ sung (API, dữ liệu test): lấy nhiệm vụ SUBMITTED của A
  const tasks = (await apiGet(page, `/projects/${PROJECT_A}/survey-tasks`)).body.items
  let parent = tasks.find((t) => t.status === 'SUBMITTED' && !t.supplementTaskId)
  if (parent) {
    const det = await page.evaluate(async (id) => { const r = await fetch(`/api/v1/survey-tasks/${id}`, { credentials: 'include' }); return { etag: r.headers.get('etag'), body: await r.json() } }, parent.id)
    const res = await apiSend(page, 'POST', `/survey-tasks/${parent.id}/supplements`, { operatorId: parent.operatorId, reason: '[TEST-FE] E5 tạo nhiệm vụ bổ sung để kiểm quan hệ gốc–con', scope: [{ ...det.body.scope[0], segmentIds: [det.body.scope[0].segmentIds[0]] }] }, { 'If-Match': det.etag })
    check('Setup: tạo nhiệm vụ bổ sung (API)', res.status === 201, `status ${res.status} ${JSON.stringify(res.body).slice(0, 160)}`)
  } else console.log('   (không có nhiệm vụ SUBMITTED chưa bổ sung; dùng bổ sung đã có nếu có)')
  await go(page, '/pm/surveys', 12000)
  const text = await bodyText(page, 'main', 6000)
  check('Danh sách có nhãn KẾ HOẠCH và NHIỆM VỤ', /KẾ HOẠCH/.test(text) && /NHIỆM VỤ/.test(text), '')
  check('Danh sách hiển thị mã rút gọn KH-/NV-', /KH-[0-9A-F]{8}/.test(text) && /NV-[0-9A-F]{8}/.test(text), (text.match(/(KH|NV)-[0-9A-F]{8}/g) || []).slice(0, 4).join(','))
  check('Danh sách hiển thị lịch bay (kế hoạch) và hạn hoàn thành (nhiệm vụ)', /Lịch bay dự kiến/.test(text) && /Hạn hoàn thành/.test(text), '')
  check('Danh sách hiển thị Operator', /Operator: /.test(text), '')
  check('Danh sách có nhãn Bổ sung và nút mở nhiệm vụ gốc/bổ sung', /Bổ sung/.test(text) && /Nhiệm vụ (gốc|bổ sung) NV-/.test(text), '')
  // modal: mở nhiệm vụ bổ sung con qua nút "Nhiệm vụ gốc"
  const opened = await page.evaluate(() => { const b = [...document.querySelectorAll('main button')].find((x) => /Nhiệm vụ gốc NV-/.test(x.textContent)); if (!b) return false; b.click(); return true })
  await sleep(9000)
  const modal = await bodyText(page, '[role=dialog]', 4000)
  check('Nút "Nhiệm vụ gốc" mở chi tiết nhiệm vụ gốc', opened && /Chi tiết nhiệm vụ khảo sát/.test(modal), modal.slice(0, 160))
  check('Modal hiển thị mã, hạn hoàn thành, loại khảo sát, Operator và liên quan', /NV-[0-9A-F]{8}/.test(modal) && /Hạn hoàn thành/.test(modal) && /Loại khảo sát/.test(modal) && /Bản ghi liên quan/.test(modal), '')
}

check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
