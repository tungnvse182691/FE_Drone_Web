// G4 mục 4, 5, 6, 7 — luồng Normal: PM đề xuất (409 thân thiện) → Giám sát duyệt (toast, ẩn form) → PM giao việc (nguồn Defect, toast ngắn) → an toàn tạm thời.
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-flow.mjs <create|conflict|approve|assign|safety|exceptions|sup-limit>
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, setNative, sleep, PROJECT_A } from './lib.mjs'
const STAGE = process.argv[2] || 'create'
const DEFECT_TYPE = process.env.G4_TYPE || 'CRACK'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const sel = (page, aria, text) => page.evaluate((a, t) => { const s = document.querySelector(`[aria-label="${a}"]`); if (!s) return 'no-select'; const o = [...s.options].find((x) => x.value && (x.value === t || x.text.includes(t))); if (!o) return 'no-opt'; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.value }, aria, text)
const itemsOf = async (page) => { const out = []; for (const k of (await apiGet(page, `/projects/${PROJECT_A}/repair-packages?limit=100`)).body.items || []) for (const i of (await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${k.id}/items?limit=100`)).body.items || []) out.push({ ...i, packageId: k.id }); return out }
const openPackage = async (page, base, label, pkgShort) => {
  await go(page, `${base}/proposals`, 12000)
  const ok = await page.evaluate((re, pk) => { const rows = [...document.querySelectorAll('tbody tr')].filter((r) => !pk || r.innerText.toUpperCase().includes(pk.toUpperCase())); const b = rows.flatMap((r) => [...r.querySelectorAll('button')]).find((x) => new RegExp(re).test(x.textContent)); if (!b) return false; b.click(); return true }, label, pkgShort || '')
  await sleep(7000); return ok
}

async function createProposal(page, defect, range) {
  await go(page, '/pm/proposals', 12000)
  await clickByText(page, /Tạo gói đề xuất mới/); await sleep(2500)
  await sel(page, 'Dự án đề xuất gói', PROJECT_A); await sleep(9000)
  await page.evaluate((d) => { const c = [...document.querySelectorAll('.fixed input[type=checkbox]')].find((b) => (b.closest('label,div')?.parentElement?.innerText || '').toUpperCase().includes(d.toUpperCase())); if (c && !c.checked) c.click() }, `DEF-${defect.id.slice(0, 8)}`)
  await sleep(6000)
  await setNative(page, '[aria-label="Căn cứ đề xuất gói"]', '[TEST-FE G4] Căn cứ đề xuất Normal')
  await setNative(page, '[aria-label="Từ lý trình đề xuất"]', String(range[0])); await setNative(page, '[aria-label="Đến lý trình đề xuất"]', String(range[1]))
  await setNative(page, '[aria-label="Độ lệch từ đề xuất"]', String(range[2])); await setNative(page, '[aria-label="Độ lệch đến đề xuất"]', String(range[3]))
  await setNative(page, '[aria-label="Checklist phương án đề xuất"]', 'v1')
  await setNative(page, '[aria-label="Phương án đề xuất gói"]', '[TEST-FE G4] Phương án vá nứt theo checklist v1', 'textarea')
  await sleep(800)
  const w = page.__w = 0
  const clicked = await clickByText(page, /Đề xuất hạng mục và GET xác nhận/)
  await sleep(14000)
  return { clicked, modalText: await page.evaluate(() => (document.querySelector('.fixed')?.innerText || '').replace(/\s+/g, ' ').slice(0, 1800)) }
}

const { browser, page, log } = await open({ height: 3200 })

if (STAGE === 'create' || STAGE === 'conflict') {
  await login(page, 'pm-a')
  const defects = (await apiGet(page, `/projects/${PROJECT_A}/defects?pageSize=100`)).body.items
  const defect = defects.find((d) => d.defectTypeCode === DEFECT_TYPE)
  const range = (process.env.G4_RANGE || '40,41,0,1').split(',').map(Number)
  const before = (await itemsOf(page)).length
  const res = await createProposal(page, defect, range)
  console.log('create click:', res.clicked, res.modalText.slice(0, 600))
  const after = await itemsOf(page)
  if (STAGE === 'create') {
    check('Tạo đề xuất Normal: có hạng mục mới ở BE', after.length === before + 1, `${before} → ${after.length}`)
    check('Hạng mục mới AwaitingApproval', after.some((i) => i.defectId === defect.id && i.state === 'AwaitingApproval'), after.map((i) => i.state).join(','))
  } else {
    // đề xuất trùng phạm vi → 409 active_scope_conflict (hoặc lỗi BE khác) hiển thị thân thiện
    const t = res.modalText
    check('409 hiển thị câu thân thiện, không lộ mã thô', /Phạm vi đề xuất xung đột với hạng mục đang hoạt động\. Vui lòng kiểm tra gói hiện có\./.test(t) && !/active_scope_conflict/.test(t), t.slice(0, 400))
    console.log('failures:', log.failures.slice(-3).join(' | '))
  }
}

if (STAGE === 'sup-limit' || STAGE === 'approve') {
  await login(page, 'supervisor')
  const items = await itemsOf(page)
  const target = items.find((i) => i.mode === 'Normal' && i.state === 'AwaitingApproval')
  check('Có hạng mục Normal AwaitingApproval', !!target || STAGE === 'sup-limit', target ? target.id.slice(0, 8) : 'không có')
  await openPackage(page, '/sup', 'Thẩm định', target?.packageId.slice(0, 8))
  const t = await bodyText(page, '.fixed.inset-0', 7000)
  check('H14: hiển thị giới hạn "chưa có API yêu cầu sửa/từ chối" cho Giám sát', /chưa có API cho Giám sát yêu cầu sửa\/từ chối/.test(t) || !target, t.slice(0, 120))
  if (STAGE === 'approve' && target) {
    await sel(page, 'Hạng mục Normal phê duyệt', target.id.slice(0, 1)).catch(() => {})
    await page.evaluate(() => { const s = document.querySelector('[aria-label="Hạng mục Normal phê duyệt"]'); const o = [...s.options].find((x) => x.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) })
    await sleep(500)
    await setNative(page, '[aria-label="Lý do phê duyệt Normal"]', '[TEST-FE G4] Duyệt đề xuất Normal', 'textarea'); await sleep(500)
    const w0 = log.writes.length
    check('Bấm phê duyệt', (await clickByText(page, /Phê duyệt hạng mục Normal/)) === 'clicked')
    await sleep(3000)
    const during = await page.evaluate(() => [...document.querySelectorAll('.fixed button')].find((b) => /Phê duyệt hạng mục Normal|Đang gửi/.test(b.textContent))?.textContent)
    console.log('nút khi đang gửi:', during)
    await sleep(8000)
    const full = await page.evaluate(() => document.body.innerText)
    check('POST approve 201', log.writes.slice(w0).some((x) => /\/approve 201/.test(x)), log.writes.slice(w0).join('; '))
    check('Toast thành công sau khi ĐỌC LẠI (toast container)', /Đã phê duyệt hạng mục .*máy chủ xác nhận trạng thái ReadyToAssign/.test(full), '')
    check('Modal vẫn mở', await page.evaluate(() => !!document.querySelector('.fixed.inset-0')))
    check('Form phê duyệt không còn liệt kê hạng mục đã duyệt; hiện kết quả BE chỉ đọc', await page.evaluate(() => { const s = document.querySelector('[aria-label="Hạng mục Normal phê duyệt"]'); return s && [...s.options].filter((o) => o.value).length === 0 }) && /\(chỉ đọc\)/.test(full), '')
    const now = (await itemsOf(page)).find((i) => i.id === target.id)
    check('GET: hạng mục ReadyToAssign', now?.state === 'ReadyToAssign', now?.state)
  }
}

if (STAGE === 'assign') {
  await login(page, 'pm-a')
  const target = (await itemsOf(page)).find((i) => i.mode === 'Normal' && i.state === 'ReadyToAssign')
  check('Có hạng mục ReadyToAssign', !!target, target?.id.slice(0, 8))
  await go(page, `/pm/repair-batches/assign?${new URLSearchParams({ projectId: PROJECT_A, packageId: target.packageId, itemId: target.id })}`, 14000)
  const src = await page.evaluate(() => { const e = document.querySelector('[data-testid="assign-source"]'); return e ? (e.value ?? e.innerText) : null })
  const err = await page.evaluate(() => document.querySelector('[data-testid="assign-source-error"]')?.innerText || '')
  console.log('nguồn:', src, '| lỗi:', err)
  check('Nguồn khuyết tật đọc từ Defect: không mặc định REPORTER, không nhập tay surveyId', (!!src && !(await page.$('input[placeholder*="Mã khảo sát"]'))) || !!err, `${src || err}`)
  if (src) {
    check('Nguồn (khi xác định được) là ô chỉ đọc hoặc select do BE', await page.evaluate(() => { const e = document.querySelector('[data-testid="assign-source"]'); return e?.tagName === 'SELECT' || e?.readOnly === true }))
    await page.evaluate(() => { const s = [...document.querySelectorAll('main select')].find((x) => /đội thi công/i.test(x.options[0]?.text || '') || /đội thi công/i.test(x.options[1]?.text || '')); const o = s && [...s.options].find((x) => x.value); if (o) { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) } })
    await sleep(500)
    await page.evaluate(() => { const i = document.querySelector('main textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(i, '[TEST-FE G4] Giao Normal'); i.dispatchEvent(new Event('input', { bubbles: true })) })
    await sleep(500)
    const w1 = log.writes.length
    const r = await page.evaluate(() => { const b = [...document.querySelectorAll('main button')].find((x) => /Ban Hành/.test(x.textContent)); if (!b || b.disabled) return 'no/disabled'; b.click(); return 'clicked' })
    check('Bấm "Ban Hành Lệnh Giao Việc"', r === 'clicked', r)
    await sleep(12000)
    check('POST assign 201', log.writes.slice(w1).some((x) => /\/assign 201/.test(x)), log.writes.slice(w1).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
    const full = await page.evaluate(() => document.body.innerText)
    check('Toast ngắn "Đã giao ITEM-… cho <tên Crew>." (không GUID)', /Đã giao ITEM-[0-9A-F]{8} cho .+\./.test(full) && !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(await page.evaluate(() => document.querySelector('[data-testid="assign-result"] p')?.innerText || '')), (await bodyText(page, '[data-testid="assign-result"]', 400)))
    check('Có link "Xem nhiệm vụ" tới đúng nhiệm vụ', await page.evaluate(() => /field-tasks\?.*highlightCode=[0-9a-f-]{36}/.test(document.querySelector('[data-testid="assign-view-task"]')?.getAttribute('href') || '')))
    check('Mã nhiệm vụ đầy đủ nằm trong "Chi tiết" + nút sao chép', await page.evaluate(() => /[0-9a-f-]{36}/.test(document.querySelector('[data-testid="assign-task-id"]')?.textContent || '')))
    const now = (await itemsOf(page)).find((i) => i.id === target.id)
    check('GET: hạng mục Assigned', now?.state === 'Assigned', now?.state)
  }
}

if (STAGE === 'safety' || STAGE === 'exceptions') {
  await login(page, 'pm-a')
  const items = await itemsOf(page)
  const target = items.find((i) => i.mode === 'Normal' && !['Confirmed', 'Cancelled'].includes(i.state) && (STAGE === 'safety' ? ['Assigned', 'InProgress', 'Submitted'].includes(i.state) : true))
  check('Có hạng mục Normal để thử', !!target, target ? `${target.id.slice(0, 8)} ${target.state}` : '')
  await openPackage(page, '/pm', 'Xem hồ sơ', target.packageId.slice(0, 8))
  if (STAGE === 'exceptions') {
    let t = await bodyText(page, '[data-testid="repair-item-actions"]', 1500)
    check('Khối đổi tên "Xử lý ngoại lệ và hiệu chỉnh", không còn "Thao tác hạng mục sửa chữa"', /Xử lý ngoại lệ và hiệu chỉnh/.test(t) && !/Thao tác hạng mục sửa chữa/.test(t), t.slice(0, 80))
    check('Mặc định thu gọn (chưa có ô chọn hạng mục)', !(await page.$('[aria-label="Hạng mục thao tác"]')))
    await page.evaluate(() => document.querySelector('[data-testid="repair-item-actions-toggle"]').click()); await sleep(800)
    await sel(page, 'Hạng mục thao tác', target.id); await sleep(5000)
    await sel(page, 'Loại thao tác hạng mục', 'correct'); await sleep(300)
    await page.evaluate(() => { const s = document.querySelector('[aria-label="Loại thao tác hạng mục"]'); const o = [...s.options].find((x) => /Hiệu chỉnh/.test(x.text)); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) })
    await sleep(800)
    t = await bodyText(page, '[data-testid="repair-item-actions"]', 3000)
    check('Hiển thị trạng thái/kết quả hiện hành từ BE tách riêng', /Trạng thái hiện hành \(BE\)/.test(t) && /Kết quả hiện hành \(BE\)/.test(t), t.slice(0, 300))
    check('"Kết quả sau hiệu chỉnh" mặc định "Chọn kết quả" (không phải "Chưa sửa")', await page.evaluate(() => { const s = document.querySelector('[aria-label="Kết quả sau hiệu chỉnh"]'); return s && s.value === '' && s.options[s.selectedIndex].text === 'Chọn kết quả' }))
    check('Lý do khóa hiệu chỉnh được giải thích (vai trò PM với Normal)', /vai trò hiện tại không được phép|chưa có quyết định hiệu lực/.test(t), t.slice(t.indexOf('Hiệu chỉnh:') - 120, t.indexOf('Hiệu chỉnh:') + 100))
  } else {
    const t = await bodyText(page, '[data-testid="repair-safety-panel"]', 3000)
    check('Panel an toàn hiện', t.length > 0)
    await sel(page, 'Hạng mục giao biện pháp an toàn', target.id); await sleep(6000)
    const t2 = await bodyText(page, '[data-testid="repair-safety-panel"]', 4000)
    const opts = await page.evaluate(() => [...(document.querySelector('[aria-label="Nghĩa vụ an toàn tạm thời"]')?.options || [])].map((o) => o.text))
    console.log('panel:', t2.slice(0, 700), '| options:', JSON.stringify(opts))
    const get = await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${target.packageId}/items/${target.id}/temporary-safety-obligations`)
    console.log('GET obligations:', get.status, JSON.stringify(get.body).slice(0, 500))
    if (get.status === 200) check('Dropdown chỉ chứa nghĩa vụ từ GET collection', opts.filter((o) => o.startsWith('#')).length === (get.body.items || []).length, `${opts.length} options vs ${(get.body.items || []).length}`)
    else check('Lỗi GET được hiển thị + khóa gửi', /Không đọc được nghĩa vụ an toàn tạm thời|khóa gửi/.test(t2), t2.slice(0, 200))
    if (get.status === 200 && !(get.body.items || []).length) check('Không có nghĩa vụ hợp lệ → giải thích + khóa', /chưa có nghĩa vụ an toàn tạm thời hợp lệ/i.test(t2) && (await page.evaluate(() => [...document.querySelectorAll('[data-testid="repair-safety-panel"] button')].find((b) => /Giao biện pháp an toàn/.test(b.textContent))?.disabled === true)), '')
  }
}

if (STAGE === 'safety-add') {
  await login(page, 'pm-a')
  const target = (await itemsOf(page)).find((i) => i.mode === 'Normal' && i.state === 'Assigned')
  check('Có hạng mục Normal Assigned', !!target, target?.id.slice(0, 8))
  const url = `/projects/${PROJECT_A}/repair-packages/${target.packageId}/items/${target.id}/temporary-safety-obligations`
  const g0 = (await apiGet(page, url)).body
  const f = g0.formalScope
  console.log('formalScope', JSON.stringify(f), 'binding', !!g0.binding)
  await openPackage(page, '/pm', 'Xem hồ sơ', target.packageId.slice(0, 8))
  await sel(page, 'Hạng mục giao biện pháp an toàn', target.id); await sleep(6000)
  // đổi hạng mục xóa lựa chọn cũ: chọn rồi bỏ chọn
  const mid = +(f.fromMeters + (f.toMeters - f.fromMeters) * 0.25).toFixed(3), end = +(f.fromMeters + (f.toMeters - f.fromMeters) * 0.5).toFixed(3)
  await setNative(page, '[aria-label="An toàn từ lý trình"]', String(mid)); await setNative(page, '[aria-label="An toàn đến lý trình"]', String(end))
  await setNative(page, '[aria-label="An toàn lệch từ"]', String(f.offsetFromMeters)); await setNative(page, '[aria-label="An toàn lệch đến"]', String(+(f.offsetFromMeters + (f.offsetToMeters - f.offsetFromMeters) * 0.5).toFixed(3)))
  await setNative(page, '[aria-label="Lý do bổ sung nghĩa vụ an toàn"]', '[TEST-FE G4] Bổ sung nghĩa vụ an toàn tạm thời', 'textarea'); await sleep(600)
  // phạm vi ngoài formal bị chặn trước khi gửi
  await setNative(page, '[aria-label="An toàn đến lý trình"]', String(f.toMeters + 5)); await sleep(300)
  const w0 = log.writes.length
  await clickByText(page, /^Thêm nghĩa vụ an toàn tạm thời$/); await sleep(1200)
  let t = await bodyText(page, '[data-testid="safety-add"]', 1500)
  check('Phạm vi ngoài formal bị chặn trước khi gửi (không POST)', /nằm trong phạm vi sửa chữa chính thức/.test(t) && log.writes.length === w0, t.slice(0, 200))
  await setNative(page, '[aria-label="An toàn đến lý trình"]', String(end)); await sleep(300)
  check('Bấm thêm nghĩa vụ', (await clickByText(page, /^Thêm nghĩa vụ an toàn tạm thời$/)) === 'clicked'); await sleep(9000)
  check('POST temporary-safety-obligations 201', log.writes.slice(w0).some((x) => /temporary-safety-obligations 201/.test(x)), log.writes.slice(w0).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
  const g1 = (await apiGet(page, url)).body
  check('GET đọc lại: có 1 nghĩa vụ mới', (g1.items || []).length === (g0.items || []).length + 1, `${(g0.items || []).length} → ${(g1.items || []).length}`)
  const opts = await page.evaluate(() => [...document.querySelector('[aria-label="Nghĩa vụ an toàn tạm thời"]').options].map((o) => o.text))
  check('Dropdown đọc lại hiện nghĩa vụ mới (chỉ từ GET)', opts.filter((o) => o.startsWith('#')).length === (g1.items || []).length, opts.join(' | '))
  const crewTxt = await page.evaluate(() => document.querySelector('[aria-label="Crew phụ trách biện pháp an toàn"]')?.value)
  console.log('Crew theo binding:', crewTxt)
  check('Crew hiển thị theo binding (chỉ đọc)', !!crewTxt && !/Chưa xác định|Đang xác định/.test(crewTxt), crewTxt)
  // giao biện pháp
  await sel(page, 'Nghĩa vụ an toàn tạm thời', g1.items[0].safetyObligationId); await sleep(500)
  await setNative(page, '[aria-label="Lịch kiểm tra an toàn"]', 'Mỗi 4 giờ', 'textarea'); await setNative(page, '[aria-label="Điều kiện thay thế"]', 'Khi biển báo hỏng', 'textarea'); await setNative(page, '[aria-label="Điều kiện gỡ bỏ"]', 'Sau khi hoàn thiện mặt đường', 'textarea'); await setNative(page, '[aria-label="Lý do giao biện pháp an toàn"]', '[TEST-FE G4] Giao biện pháp an toàn', 'textarea'); await sleep(600)
  const w1 = log.writes.length
  check('Bấm "Giao biện pháp an toàn"', (await clickByText(page, /^Giao biện pháp an toàn$/)) === 'clicked'); await sleep(9000)
  check('POST safety-measures 201', log.writes.slice(w1).some((x) => /safety-measures 201/.test(x)), log.writes.slice(w1).join('; ') + ' | ' + log.failures.slice(-2).join('; '))
  const g2 = (await apiGet(page, url)).body
  check('GET đọc lại: nghĩa vụ đã dùng không còn trong collection', (g2.items || []).length === (g1.items || []).length - 1, `${(g1.items || []).length} → ${(g2.items || []).length}`)
  t = await bodyText(page, '[data-testid="repair-safety-panel"]', 3000)
  console.log('panel sau giao:', t.slice(-300))
}

check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
