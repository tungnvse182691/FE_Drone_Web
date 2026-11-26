// G4 mục 9, 10, 12 — chuyển nghĩa vụ (dropdown + bước đối chiếu), hồ sơ bàn giao (create/attach), Điều phối ngoại tuyến (Giám sát).
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-misc.mjs <transfer|handover|offline>
import { open, login, go, apiGet, report, bodyText, clickByText, setNative, sleep, PROJECT_A, PROJECT_B } from './lib.mjs'
const STAGE = process.argv[2] || 'offline'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const { browser, page, log } = await open({ height: 3600 })

if (STAGE === 'offline') {
  await login(page, 'supervisor')
  await go(page, '/sup/offline', 9000)
  let t = await bodyText(page, '[data-testid="offline-supervisor-actions"]', 3000)
  check('Giám sát thấy "Cấp quyền bàn giao" và "Chuẩn bị gói ngoại tuyến"', /Cấp quyền bàn giao \(Giám sát\)/.test(t) && /Chuẩn bị gói ngoại tuyến \(Giám sát\)/.test(t), t.slice(0, 120))
  const hasPkg = (await apiGet(page, `/projects/${PROJECT_A}/offline/packages?limit=20`)).body.items.length
  check('Thiếu nguồn (chưa có gói do Mobile tạo): giải thích rõ + khóa nút cấp quyền', hasPkg > 0 || (/Chưa có gói ngoại tuyến nào/.test(t) && (await page.evaluate(() => [...document.querySelectorAll('[data-testid="offline-supervisor-actions"] button')].find((b) => /^Cấp quyền bàn giao$/.test(b.textContent.trim()))?.disabled === true))), `gói=${hasPkg}`)
  check('Chuẩn bị gói: BLOCKED có giải thích (cần gói đã ký bằng khóa thiết bị di động) + nút khóa', /Chưa thể chuẩn bị từ Web/.test(t) && (await page.evaluate(() => document.querySelector('[data-testid="prepare-package-card"] button')?.disabled === true)))
  check('Không có tạo khóa/ký/sync/nhập-xuất gói trên Web', !/Tạo khóa|Ký gói|Đồng bộ ngay|Nhập gói|Xuất gói/.test(t))
}

if (STAGE === 'offline-pm') {
  await login(page, 'pm-a')
  await go(page, '/pm/offline', 9000)
  check('PM không thấy khối thao tác Giám sát', !(await page.$('[data-testid="offline-supervisor-actions"]')))
}

if (STAGE === 'handover') {
  await login(page, 'supervisor')
  for (const [name, P] of [['A', PROJECT_A], ['B', PROJECT_B]]) {
    const inv = await apiGet(page, `/projects/${P}/handover-documents`)
    const cov = await apiGet(page, `/projects/${P}/road-coverage`)
    const hasFile = (cov.body.sources || []).some((s) => s.kind === 'HANDOVER' && s.fileId)
    console.log(`SBX-${name}: inventory ${inv.status} items=${(inv.body.items || []).length}, HANDOVER có tệp=${hasFile}`)
    await go(page, `/sup/fast-track?projectId=${P}`, 12000)
    const opened = await clickByText(page, /Phê duyệt độ phủ tuyến/); await sleep(5000)
    const t = await bodyText(page, '.fixed', 4000)
    if (hasFile) { check(`SBX-${name}: đã có HANDOVER có tệp → thẻ bổ sung ẩn`, !(await page.$('[data-testid="handover-attach-card"]')), opened); continue }
    check(`SBX-${name}: mở modal độ phủ`, opened === 'clicked', opened)
    const mode = await page.evaluate(() => ['handover-mode-create', 'handover-mode-attach', 'handover-mode-blocked'].find((id) => document.querySelector(`[data-testid="${id}"]`)) || 'none')
    const expect = (inv.body.items || []).length === 0 ? 'handover-mode-create' : (inv.body.items || []).some((x) => x.canAttachFile) ? 'handover-mode-attach' : 'handover-mode-blocked'
    check(`SBX-${name}: phân biệt "chưa có nguồn đủ điều kiện" với "chưa có bản ghi" (${expect})`, mode === expect, `${mode}`)
    if (mode === 'handover-mode-create' && name === 'B' && process.env.G4_DO_ATTACH) {
      const fileInput = await page.$('[data-testid="handover-attach-file"]')
      await fileInput.uploadFile(decodeURIComponent(new URL('./fixtures/test-handover.pdf', import.meta.url).pathname).replace(/^\//, ''))
      await setNative(page, '[aria-label="Số hiệu văn bản bàn giao"]', 'TEST-FE-G4-BB'); await setNative(page, '[aria-label="Ngày bàn giao thực tế"]', '2026-10-01'); await sleep(800)
      const w = log.writes.length
      await clickByText(page, /Gắn biên bản bàn giao/)
      await page.waitForFunction(() => !document.querySelector('[data-testid="handover-attach-card"]') || /Đã gắn biên bản/.test(document.body.innerText), { timeout: 90000 }).catch(() => {})
      await sleep(2000)
      check('Tạo mới: POST handover-documents 2xx chỉ gửi documentNo+handoverDate khi tạo mới', log.writes.slice(w).some((x) => /handover-documents 20\d/.test(x)), log.writes.slice(w).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
      const inv2 = await apiGet(page, `/projects/${P}/handover-documents`)
      check('GET kiểm kê sau khi gắn: có hồ sơ và có fileId', (inv2.body.items || []).some((x) => x.fileId), JSON.stringify(inv2.body.items).slice(0, 200))
    }
  }
}

if (STAGE === 'transfer') {
  await login(page, 'supervisor')
  await go(page, '/sup/proposals', 12000)
  await page.evaluate((pid) => { const s = [...document.querySelectorAll('section select')].find((x) => [...x.options].some((o) => o.value === pid)); if (s) { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, pid); s.dispatchEvent(new Event('change', { bubbles: true })) } }, PROJECT_A)
  await sleep(9000)
  const opts = await page.evaluate(() => { const lab = [...document.querySelectorAll('label')].find((l) => /Nghĩa vụ đang quản lý/.test(l.textContent)); return [...(lab?.querySelectorAll('option') || [])].map((o) => o.textContent) })
  console.log('options:', JSON.stringify(opts))
  check('Có nghĩa vụ chuyển được trong dropdown', opts.filter((o) => o && !/Chọn từ dữ liệu|Không có bản ghi/.test(o)).length > 0)
  check('Dropdown hiện mã gói PKG-, Defect DEF-(loại) và loại nghĩa vụ', opts.some((o) => /PKG-[0-9A-F]{8} · DEF-[0-9A-F]{8} \([A-Z]+\) · \S+ ·/.test(o)), opts[1] || '')
  const pick = (labelRe, text) => page.evaluate((re, t) => { const lab = [...document.querySelectorAll('label')].find((l) => new RegExp(re).test(l.textContent)); const s = lab?.querySelector('select'); const o = [...s.options].find((x) => x.value && (!t || x.text.includes(t) || x.value === t)); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.text }, labelRe.source, text)
  console.log('chọn:', await pick(/Nghĩa vụ đang quản lý/, process.env.G4_PICK || ''))
  await pick(/Dự án nhận/, PROJECT_B)
  await sleep(500)
  await page.evaluate(() => { const ta = [...document.querySelectorAll('label')].find((l) => /^Lý do/.test(l.textContent.trim()))?.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, '[TEST-FE G4] Chuyển nghĩa vụ thử'); ta.dispatchEvent(new Event('input', { bubbles: true })) })
  await sleep(600)
  const w = log.writes.length
  check('Bấm "Xem lại chi tiết trước khi gửi" (chưa gửi)', (await clickByText(page, /Xem lại chi tiết trước khi gửi/)) === 'clicked')
  await sleep(1500)
  const review = await bodyText(page, '[data-testid="transfer-review"]', 1500)
  check('Bước đối chiếu hiện gói, hạng mục, Defect, loại nghĩa vụ, dự án nhận', /Gói:.*Hạng mục:.*Defect:.*Loại nghĩa vụ:.*Dự án nhận:/.test(review), review.slice(0, 300))
  check('Chưa có POST nào khi mới xem đối chiếu', log.writes.length === w, log.writes.slice(w).join(';'))
  if (process.env.G4_SEND) {
    check('Xác nhận phát hành', (await clickByText(page, /Xác nhận phát hành đề nghị/)) === 'clicked'); await sleep(9000)
    check('POST obligation-transfers 2xx', log.writes.slice(w).some((x) => /obligation-transfers 20\d/.test(x)), log.writes.slice(w).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
  }
}

if (STAGE === 'transfer-accept') {
  // Giám sát dự án B tiếp nhận đề nghị chuyển (kèm bước đối chiếu), rồi PM-B đọc kế hoạch: BE trả 404 → FE hiện "Không đọc được kế hoạch".
  await login(page, 'supervisor')
  await go(page, '/sup/proposals', 12000)
  await page.evaluate((pid) => { const s = [...document.querySelectorAll('section select')].find((x) => [...x.options].some((o) => o.value === pid)); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, pid); s.dispatchEvent(new Event('change', { bubbles: true })) }, PROJECT_B)
  await sleep(8000)
  await page.evaluate(() => { const lab = [...document.querySelectorAll('label')].find((l) => /^Thao tác/.test(l.textContent.trim())); const s = lab.querySelector('select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'accept'); s.dispatchEvent(new Event('change', { bubbles: true })) })
  await sleep(800)
  const o = await page.evaluate(() => { const lab = [...document.querySelectorAll('label')].find((l) => /Đề nghị gửi đến dự án này/.test(l.textContent)); const s = lab.querySelector('select'); const op = [...s.options].filter((x) => x.value); if (!op.length) return 'none'; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, op[0].value); s.dispatchEvent(new Event('change', { bubbles: true })); return op.length + ':' + op[0].text })
  console.log('offers:', o)
  await page.evaluate(() => { const ta = [...document.querySelectorAll('label')].find((l) => /^Lý do/.test(l.textContent.trim()))?.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, '[TEST-FE G4] Tiếp nhận nghĩa vụ'); ta.dispatchEvent(new Event('input', { bubbles: true })) })
  await sleep(500)
  await clickByText(page, /Xem lại chi tiết trước khi gửi/); await sleep(1200)
  const w = log.writes.length
  check('Tiếp nhận: xác nhận', (await clickByText(page, /Xác nhận tiếp nhận nghĩa vụ/)) === 'clicked'); await sleep(9000)
  check('POST obligation-transfer-acceptances 2xx', log.writes.slice(w).some((x) => /obligation-transfer-acceptances 20[01]/.test(x)), log.writes.slice(w).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
}

if (STAGE === 'planning-b') {
  await login(page, 'pm-b')
  const lc = (await apiGet(page, `/projects/${PROJECT_B}/lifecycle`)).body
  const resp = (lc.responsibilities || []).find((r) => r.packageId && r.currentRepairItemId)
  console.log('PM-B responsibility:', JSON.stringify(resp))
  const get = await apiGet(page, `/projects/${PROJECT_B}/repair-packages/${resp.packageId}/planning`)
  console.log('GET planning (PM-B, URL project B):', get.status, JSON.stringify(get.body))
  await go(page, '/pm/proposals', 12000)
  await page.evaluate((pk) => { const rows = [...document.querySelectorAll('tbody tr')].filter((r) => r.innerText.toUpperCase().includes(pk.toUpperCase())); const b = rows.flatMap((r) => [...r.querySelectorAll('button')]).find((x) => /Xem hồ sơ|Thẩm định/.test(x.textContent)); b?.click() }, resp.packageId.slice(0, 8))
  await sleep(8000)
  const t = await bodyText(page, '[data-testid="planning-panel"]', 2500)
  console.log('planning panel:', t.slice(0, 700))
  check('Hiển thị "Không đọc được kế hoạch" (không phải "Chưa nhập")', get.status === 200 || /Không đọc được kế hoạch/.test(t), t.slice(0, 160))
  check('Phân biệt dự án gốc và dự án chịu trách nhiệm hiện hành', get.status === 200 || /dự án gốc .* dự án chịu trách nhiệm hiện hành/.test(t), '')
  check('Có nút Thử lại', get.status === 200 || (await page.evaluate(() => !![...document.querySelectorAll('[data-testid="planning-read-failed"] button')].find((b) => /Thử lại/.test(b.textContent)))))
}

if (STAGE === 'planning-ui') {
  // Kiểm trạng thái UI của PlanningPanel khi GET planning trả 404 not_found (BE hiện trả đúng 404 này cho PM dự án nhận sau chuyển — xem planning-b).
  // Danh sách gói của PM-B không liệt kê gói nhận chuyển (BE không trả), nên dùng gói của B và CHẶN ĐƯỜNG riêng yêu cầu GET .../planning để dựng trạng thái lỗi. Không phải dữ liệu thật.
  await login(page, 'pm-b')
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const u = req.url()
    if (req.method() === 'GET' && /\/repair-packages\/[0-9a-f-]{36}\/planning$/.test(u) && !u.includes('/items/')) req.respond({ status: 404, contentType: 'application/json', body: JSON.stringify({ title: 'Web coordination request failed', status: 404, code: 'not_found', correlationId: 'test-interception' }) })
    else req.continue()
  })
  await go(page, `/pm/proposals?projectId=${PROJECT_B}`, 14000)
  await page.evaluate(() => { [...document.querySelectorAll('tbody tr button')].find((x) => /Xem hồ sơ/.test(x.textContent))?.click() })
  await sleep(9000)
  const t = await bodyText(page, '[data-testid="planning-panel"]', 2500)
  console.log('planning panel:', t.slice(0, 600))
  check('Hiển thị "Không đọc được kế hoạch" kèm mã lỗi', /Không đọc được kế hoạch: HTTP 404 not_found/.test(t), t.slice(0, 200))
  check('Có khối cảnh báo, không diễn giải thành "chưa nhập kế hoạch"', /đây không phải trạng thái "chưa nhập kế hoạch"/.test(t) && !(await page.$('[aria-label="Tên gói"]')), '')
  check('Có nút "Thử lại"', await page.evaluate(() => !![...document.querySelectorAll('[data-testid="planning-read-failed"] button')].find((b) => /Thử lại/.test(b.textContent))))
}

if (STAGE === 'transfer-probe') {
  // Sau chuyển A→B: ghi bằng chứng đọc của PM-B (URL dự án B) cho gói/hạng mục nhận chuyển — chỉ GET.
  await login(page, 'pm-b')
  const lc = (await apiGet(page, `/projects/${PROJECT_B}/lifecycle`)).body
  const r = (lc.responsibilities || []).find((x) => x.packageId && x.currentRepairItemId)
  const base = `/projects/${PROJECT_B}/repair-packages/${r.packageId}`
  for (const [name, path] of [['items', `${base}/items`], ['item', `${base}/items/${r.currentRepairItemId}`], ['planning(gói)', `${base}/planning`], ['planning(hạng mục)', `${base}/items/${r.currentRepairItemId}/planning`], ['source-defect', `${base}/items/${r.currentRepairItemId}/source-defect`], ['temporary-safety-obligations', `${base}/items/${r.currentRepairItemId}/temporary-safety-obligations`]]) {
    const g = await apiGet(page, path)
    console.log(`PM-B GET ${name}: ${g.status} ${g.status >= 400 ? JSON.stringify(g.body).slice(0, 260) : 'ok'}`)
  }
  const cat = await apiGet(page, '/catalog/defect-types')
  console.log('Danh mục loại lỗi (GET /catalog/defect-types):', cat.status, JSON.stringify((cat.body || []).map ? (cat.body || []).map((d) => d.code) : cat.body))
}

check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close().catch(() => {})
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
