// G3 — Nghiệm thu repair (danh sách + chi tiết). Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g3-acceptance.mjs <stage>
// stage: read | supplement | accept | final | ft
//  read       : chỉ đọc (PM + Giám sát): ảnh, nhãn, khóa nút, không còn khẳng định mẫu, trạng thái hủy
//  supplement : PM gửi review SUPPLEMENT qua form (payload + F5)       [ghi dữ liệu]
//  accept     : PM chấp nhận hồ sơ (review ACCEPT) qua hộp thoại        [ghi dữ liệu]
//  final      : Giám sát xác nhận cuối                                   [ghi dữ liệu]
//  ft         : Fast Track (nếu có hạng mục FastTrack ở trạng thái nộp) [ghi dữ liệu]
// Trạng thái Crew (nộp/bổ sung) tạo bằng API qua g3-seed.mjs (API-created, giả lập app Mobile).
import { open, login, go, apiGet, report, bodyText, clickByText, setNative, sleep, PROJECT_A, PROJECT_B } from './lib.mjs'

const STAGE = process.argv[2] || 'read'
const ITEM_PREFIX = process.env.G3_ITEM || ''
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const FORBID = [/Tọa độ EXIF hợp lệ/, /ĐẠT \(Ảnh gốc hợp lệ\)/, /Ảnh gốc hợp lệ/, /12 Tháng/, /Xí nghiệp Quản lý Đường bộ 2/, /EV-AFTER/, /DOC-K98/, /DOC-3M/, /API-110/, /30\/08\/2027/, /20\/08\/2027/, /K ≥ 0\.98/, /Đạt K/]

// Thu payload của các request ghi (POST) để đối chiếu nội dung gửi lên BE
function capture(page) {
  const posts = []
  page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/api/v1/')) posts.push({ url: r.url().split('/api/v1')[1], body: r.postData() || '' }) })
  return posts
}
const listBase = (role) => (role === 'supervisor' ? '/sup' : '/pm')
async function itemsOf(page, P) { const out = []; for (const k of (await apiGet(page, `/projects/${P}/repair-packages`)).body.items || []) for (const i of (await apiGet(page, `/projects/${P}/repair-packages/${k.id}/items`)).body.items || []) out.push({ ...i, packageId: k.id }); return out }
async function pickItem(page, P, states) { const all = await itemsOf(page, P); return all.find((i) => (!ITEM_PREFIX || i.id.startsWith(ITEM_PREFIX)) && states.includes(i.state)) }
const imgsLoaded = (page, altRe) => page.evaluate((src) => [...document.querySelectorAll('img')].filter((i) => new RegExp(src).test(i.alt)).map((i) => i.complete && i.naturalWidth > 0), altRe.source)
const waitImgs = async (page, altRe, n, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await imgsLoaded(page, altRe); if (r.length >= n && r.every(Boolean)) return r; await sleep(700) } return imgsLoaded(page, altRe) }

async function openDetail(page, role, pkgId) { await go(page, `${listBase(role)}/acceptance/${pkgId}`, 9000) }

if (STAGE === 'read') {
  for (const role of ['pm-a', 'supervisor']) {
    const { browser, page, log } = await open({ width: 1500, height: 2400 })
    await login(page, role)
    const sup = role === 'supervisor'
    const base = sup ? '/sup' : '/pm'
    const it = await pickItem(page, PROJECT_A, ['Submitted', 'Reviewed', 'CorrectionRequired', 'Confirmed'])
    check(`[${role}] có hạng mục trong giai đoạn nghiệm thu (BE)`, !!it, it ? `${it.id.slice(0, 8)} ${it.state}` : 'không có')
    if (!it) { await browser.close(); continue }
    // ---- DANH SÁCH
    await go(page, `${base}/acceptance`, 12000)
    await sleep(4000)
    const txt = await bodyText(page, 'main, body', 4000)
    check(`[${role}] danh sách: thẻ có mã gói PKG-`, new RegExp(`PKG-${it.packageId.slice(0, 8).toUpperCase()}`).test(txt))
    check(`[${role}] danh sách: có mã hạng mục + bước đang chờ`, new RegExp(`ITEM-${it.id.slice(0, 8).toUpperCase()}`).test(txt) && /(Chờ PM đánh giá|Cần bổ sung hồ sơ|Chờ Giám sát xác nhận|Đã nghiệm thu)/.test(txt), txt.slice(0, 200))
    check(`[${role}] danh sách: có tên dự án`, /Synthetic Project/i.test(txt))
    const cardOk = await page.evaluate((code) => {
      const card = [...document.querySelectorAll('div.cursor-pointer')].find((c) => c.innerText.includes(code))
      if (!card) return { found: false }
      const cr = card.getBoundingClientRect()
      const spans = [...card.querySelectorAll('span')].filter((s) => s.className.includes('rounded-full'))
      const cut = spans.filter((s) => { const r = s.getBoundingClientRect(); return r.right > cr.right + 0.5 || r.left < cr.left - 0.5 })
      return { found: true, cut: cut.length, spans: spans.length }
    }, `PKG-${it.packageId.slice(0, 8).toUpperCase()}`)
    check(`[${role}] danh sách: badge không bị cắt khỏi thẻ (1500px)`, cardOk.found && cardOk.cut === 0, JSON.stringify(cardOk))
    await page.setViewport({ width: 900, height: 2400 }); await sleep(1200)
    const cardNarrow = await page.evaluate((code) => { const card = [...document.querySelectorAll('div.cursor-pointer')].find((c) => c.innerText.includes(code)); if (!card) return { found: false }; const cr = card.getBoundingClientRect(); return { found: true, cut: [...card.querySelectorAll('span')].filter((s) => s.className.includes('rounded-full')).filter((s) => { const r = s.getBoundingClientRect(); return r.right > cr.right + 0.5 }).length } }, `PKG-${it.packageId.slice(0, 8).toUpperCase()}`)
    check(`[${role}] danh sách: badge không bị cắt khi thu hẹp (900px)`, cardNarrow.found && cardNarrow.cut === 0, JSON.stringify(cardNarrow))
    await page.setViewport({ width: 1500, height: 2400 })
    const thumbs = await waitImgs(page, /^(Trước|Sau) thi công$/, 2)
    check(`[${role}] danh sách: ảnh Trước/Sau tải được (cookie)`, thumbs.length >= 2 && thumbs.every(Boolean), JSON.stringify(thumbs))
    const brokenImg = await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length)
    check(`[${role}] danh sách: không còn <img> hỏng`, brokenImg === 0, `${brokenImg}`)
    for (const f of FORBID) check(`[${role}] danh sách: không có "${f.source}"`, !f.test(txt))
    // ---- CHI TIẾT
    await openDetail(page, role, it.packageId)
    await sleep(3000)
    const imgs = await waitImgs(page, /(Hiện trạng hư hỏng|Mặt đường sau khi sửa)/, 2)
    check(`[${role}] chi tiết: ảnh BEFORE/AFTER hiển thị`, imgs.length >= 2 && imgs.every(Boolean), JSON.stringify(imgs))
    const dt = await bodyText(page, 'body', 9000)
    for (const f of FORBID) check(`[${role}] chi tiết: không có "${f.source}"`, !f.test(dt))
    check(`[${role}] chi tiết: nhãn ảnh sau nêu mốc Crew kết thúc thi công`, /Crew kết thúc thi công:/.test(dt))
    check(`[${role}] chi tiết: phân biệt thời điểm nộp và kết thúc thi công`, /Thời điểm nộp bản nộp/i.test(dt) && /Kết thúc thi công/i.test(dt))
    check(`[${role}] chi tiết: tên Crew (không phải "Crew 72F84201")`, !/Crew 72F84201/i.test(dt) && /Crew thực hiện:/.test(dt), (dt.match(/Crew thực hiện: [^|]*/) || [''])[0])
    check(`[${role}] chi tiết: Lần thi công/Bản nộp là hai bộ đếm`, /Lần thi công #\d+/.test(dt) && /Bản nộp #\d+/.test(dt))
    check(`[${role}] chi tiết: thiếu dữ liệu ghi "Chưa có dữ liệu"`, /Chưa có dữ liệu/.test(dt))
    check(`[${role}] chi tiết: không "Lần #2" kiểu cũ`, !/Lần #\d/.test(dt))
    const lockText = await page.evaluate(() => document.querySelector('[data-testid="action-lock-reason"]')?.innerText || '')
    const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => ({ t: b.textContent.trim(), d: b.disabled })).filter((b) => /Chấp|Yêu cầu|Khai/.test(b.t)))
    console.log('   nút:', JSON.stringify(btns), '| lý do khóa:', lockText)
    if (sup) {
      const accept = btns.find((b) => /Chấp thuận nghiệm thu/.test(b.t))
      const expectLocked = it.state !== 'Reviewed'
      check('[supervisor] "Chấp thuận nghiệm thu" khóa khi chưa có PM ACCEPT, có lý do giải thích', !!accept && (accept.d === expectLocked) && (!expectLocked || /PM chưa chấp nhận|bổ sung|trạng thái/i.test(lockText)), `state=${it.state} d=${accept?.d}`)
    } else {
      check('[pm] không còn nút "Khai Báo Hoàn Thành Thi Công (API-110)"', !btns.some((b) => /API-110|Khai Báo/.test(b.t)))
      check('[pm] có nút "Chấp nhận hồ sơ và trình Giám sát" (hoặc đã chấp nhận)', btns.some((b) => /Chấp nhận hồ sơ và trình Giám sát/.test(b.t)) || /PM đã chấp nhận — chờ Giám sát/.test(dt) || /Fast Track/.test(dt))
      if (it.state === 'Submitted') {
        const accept = btns.find((b) => /Chấp nhận hồ sơ và trình Giám sát/.test(b.t))
        const supplementPending = /Cần bổ sung hồ sơ/.test(dt)
        check('[pm] nút Chấp nhận/Yêu cầu bổ sung khóa khi đang chờ bổ sung, đúng với đầu hồ sơ', accept ? accept.d === supplementPending : false, `supplement=${supplementPending} d=${accept?.d}`)
      }
    }
    check(`[${role}] không lỗi JS`, log.pageErrors.length === 0, log.pageErrors.join('; '))
    console.log('   failures:', log.failures.slice(0, 4).join(' | '))
    await browser.close()
  }
}

if (STAGE === 'supplement') {
  const { browser, page, log } = await open({ width: 1500, height: 2600 })
  const posts = capture(page)
  await login(page, 'pm-a')
  const it = await pickItem(page, PROJECT_A, ['Submitted'])
  check('PM: có hạng mục Submitted', !!it, it?.id)
  const hist = await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${it.packageId}/items/${it.id}/history`)
  const taskId = hist.body.item.currentBinding.taskId
  const t0 = (await apiGet(page, `/projects/${PROJECT_A}/field-inspection-tasks/${taskId}`)).body
  check('BE: task đang Submitted (chưa yêu cầu bổ sung)', String(t0.status).toLowerCase() === 'submitted', t0.status)
  await openDetail(page, 'pm-a', it.packageId)
  check('Mở form bằng nút "Yêu cầu bổ sung hồ sơ"', (await clickByText(page, /Yêu cầu bổ sung hồ sơ/)) === 'clicked')
  await sleep(1500)
  const form = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); return { checked: [...d.querySelectorAll('input[type=checkbox]')].filter((c) => c.checked).length, text: d.querySelector('textarea')?.value || '', title: d.querySelector('h3')?.innerText, hasSupervisorLabel: /Giám sát/.test(d.innerText.replace(/Giám sát xác nhận/g, '')), body: d.innerText.slice(0, 600) } })
  check('Form mới: không tích sẵn lỗi kỹ thuật', form.checked === 0, `checked=${form.checked}`)
  check('Form mới: ô ghi chú trống', form.text === '', form.text.slice(0, 40))
  check('Form: nhãn đúng vai trò PM / review SUPPLEMENT', /PM review SUPPLEMENT/.test(form.title || '') && /Ghi chú yêu cầu bổ sung của PM/.test(form.body) && !/Chỉ đạo của Giám sát/.test(form.body), form.title)
  const submitDisabled = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => /Gửi yêu cầu bổ sung/.test(b.textContent))?.disabled)
  check('Form trống: nút gửi bị khóa', submitDisabled === true)
  const REASON = `[TEST-FE G3] ${new Date().toISOString().slice(11, 19)} yeu cau bo sung anh sau sua ro hon`
  await setNative(page, '[role=dialog] textarea', REASON, 'textarea')
  await sleep(500)
  const w0 = posts.length
  check('Gửi form', (await clickByText(page, /Gửi yêu cầu bổ sung/, '[role=dialog]')) === 'clicked')
  await sleep(9000)
  const rev = posts.slice(w0).find((p) => /attempts\/reviews/.test(p.url))
  const body = rev ? JSON.parse(rev.body) : {}
  const t1 = (await apiGet(page, `/projects/${PROJECT_A}/field-inspection-tasks/${taskId}`)).body
  check('Payload: decision SUPPLEMENT + reason PM nhập + bản nộp hiện hành', body.decision === 'SUPPLEMENT' && body.reason === REASON && body.fieldSubmissionId === t0.latestSubmissionId, JSON.stringify(body).slice(0, 220))
  check('Gửi đúng một lần', posts.slice(w0).filter((p) => /attempts\/reviews/.test(p.url)).length === 1)
  check('BE đã lưu: task SupplementRequired', /supplementrequired/i.test(String(t1.status).replace(/_/g, '')), t1.status)
  await page.waitForFunction(() => /review SUPPLEMENT/.test(document.body.innerText), { timeout: 12000 }).catch(() => {})
  const afterTxt = await bodyText(page, 'body', 9000)
  check('UI sau gửi: bước "Cần bổ sung hồ sơ" (không "YÊU CẦU SỬA LẠI")', /Cần bổ sung hồ sơ/.test(afterTxt) && !/YÊU CẦU SỬA LẠI/.test(afterTxt))
  check('Toast phản ánh trạng thái BE (SUPPLEMENT)', /review SUPPLEMENT/.test(afterTxt))
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(9000)
  const f5 = await bodyText(page, 'body', 9000)
  check('F5: vẫn "Cần bổ sung hồ sơ", Bản nộp giữ nguyên số', /Cần bổ sung hồ sơ/.test(f5) && /Bản nộp #\d/.test(f5))
  const accDisabled = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Chấp nhận hồ sơ và trình Giám sát/.test(b.textContent))?.disabled)
  check('F5: nút Chấp nhận khóa (đang chờ Crew bổ sung)', accDisabled === true)
  check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  console.log('   failures:', log.failures.slice(0, 4).join(' | '))
  await browser.close()
}

if (STAGE === 'accept') {
  const { browser, page, log } = await open({ width: 1500, height: 2600 })
  const posts = capture(page)
  await login(page, 'pm-a')
  const it = await pickItem(page, PROJECT_A, ['Submitted'])
  check('PM: có hạng mục Submitted để chấp nhận', !!it, it?.id)
  const hist = await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${it.packageId}/items/${it.id}/history`)
  const taskId = hist.body.item.currentBinding.taskId
  const t0 = (await apiGet(page, `/projects/${PROJECT_A}/field-inspection-tasks/${taskId}`)).body
  check('BE: task Submitted (không còn chờ bổ sung)', String(t0.status).toLowerCase() === 'submitted', t0.status)
  await openDetail(page, 'pm-a', it.packageId)
  check('Mở hộp thoại bằng "Chấp nhận hồ sơ và trình Giám sát"', (await clickByText(page, /Chấp nhận hồ sơ và trình Giám sát/)) === 'clicked')
  await sleep(1500)
  const m = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); return { text: d.innerText, checked: d.querySelector('input[type=checkbox]').checked, notes: d.querySelector('textarea').value, lis: d.querySelectorAll('li').length } })
  check('Hộp thoại không còn bằng chứng/lời khai mẫu', !/EV-AFTER|DOC-K98|DOC-3M|thảm BTN|Hoàng Hải 01/.test(m.text))
  check('Cam kết không tích sẵn, ghi chú trống', m.checked === false && m.notes === '')
  check('Danh sách bằng chứng lấy từ bản nộp hiện hành (BEFORE/AFTER thật)', /AFTER/.test(m.text) && m.lis >= 1, `li=${m.lis}`)
  check(`Hiển thị bản nộp #${'{rev}'} hiện hành`, /Bản nộp hiện hành: #\d/.test(m.text))
  const dis0 = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => /Chấp nhận và trình Giám sát/.test(b.textContent))?.disabled)
  check('Chưa tích xác nhận: nút khóa', dis0 === true)
  await page.evaluate(() => document.querySelector('[role=dialog] input[type=checkbox]').click())
  const NOTE = `[TEST-FE G3] PM chap nhan ${new Date().toISOString().slice(11, 19)}`
  await setNative(page, '[role=dialog] textarea', NOTE, 'textarea')
  await sleep(500)
  const w0 = posts.length
  check('Gửi xác nhận', (await clickByText(page, /Chấp nhận và trình Giám sát/, '[role=dialog]')) === 'clicked')
  await sleep(9000)
  const rev = posts.slice(w0).find((p) => /attempts\/reviews/.test(p.url))
  const body = rev ? JSON.parse(rev.body) : {}
  check('Payload: ACCEPT + reason = ghi chú PM + bản nộp hiện hành', body.decision === 'ACCEPT' && body.reason === NOTE && body.fieldSubmissionId === t0.latestSubmissionId, JSON.stringify(body).slice(0, 220))
  const item1 = (await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${it.packageId}/items/${it.id}`)).body
  check('BE đã lưu: item Reviewed', item1.state === 'Reviewed', item1.state)
  await page.waitForFunction(() => /review ACCEPT/.test(document.body.innerText), { timeout: 12000 }).catch(() => {})
  const txt = await bodyText(page, 'body', 9000)
  check('Toast nêu review ACCEPT + trạng thái BE', /review ACCEPT/.test(txt) && /PM đã chấp nhận/.test(txt))
  check('Nút đổi thành "PM đã chấp nhận — chờ Giám sát xác nhận"', /PM đã chấp nhận — chờ Giám sát xác nhận/.test(txt))
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(9000)
  const f5 = await bodyText(page, 'body', 9000)
  check('F5: vẫn "Chờ Giám sát xác nhận" (review ACCEPT, Reviewed)', /Chờ Giám sát xác nhận/.test(f5) && /BE: PM đã chấp nhận/.test(f5))
  check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  console.log('   failures:', log.failures.slice(0, 4).join(' | '))
  await browser.close()
}

if (STAGE === 'final') {
  const { browser, page, log } = await open({ width: 1500, height: 2600 })
  const posts = capture(page)
  await login(page, 'supervisor')
  const it = await pickItem(page, PROJECT_A, ['Reviewed'])
  check('Giám sát: có hạng mục Reviewed', !!it, it?.id)
  await openDetail(page, 'supervisor', it.packageId)
  const btn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Chấp thuận nghiệm thu/.test(x.textContent)); return b ? { d: b.disabled } : null })
  check('"Chấp thuận nghiệm thu" bật khi PM đã ACCEPT', btn && btn.d === false, JSON.stringify(btn))
  check('Mở hộp thoại xác nhận cuối', (await clickByText(page, /Chấp thuận nghiệm thu/)) === 'clicked')
  await sleep(1500)
  const noReason = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); d.querySelector('input[type=checkbox]').click(); return [...d.querySelectorAll('button')].find((b) => /Xác nhận nghiệm thu/.test(b.textContent))?.disabled })
  check('Chưa nhập lý do: nút xác nhận khóa', noReason === true)
  const REASON = `[TEST-FE G3] Giam sat xac nhan ${new Date().toISOString().slice(11, 19)}`
  await setNative(page, '[role=dialog] textarea', REASON, 'textarea')
  await sleep(500)
  const w0 = posts.length
  check('Gửi xác nhận', (await clickByText(page, /Xác nhận nghiệm thu/, '[role=dialog]')) === 'clicked')
  await sleep(9000)
  const fin = posts.slice(w0).filter((p) => /final-confirmation/.test(p.url))
  check('final-confirmation gửi một lần với reason nhập', fin.length === 1 && JSON.parse(fin[0].body).reason === REASON, fin.map((p) => p.body).join(' | '))
  check('Không gửi review trùng ở bước Giám sát', !posts.slice(w0).some((p) => /attempts\/reviews/.test(p.url)))
  const item1 = (await apiGet(page, `/projects/${PROJECT_A}/repair-packages/${it.packageId}/items/${it.id}`)).body
  check('BE đã lưu: item Confirmed', item1.state === 'Confirmed', item1.state)
  const txt = await bodyText(page, 'body', 9000)
  check('Toast: Đã nghiệm thu (đọc lại từ BE)', /Đã nghiệm thu/.test(txt))
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(9000)
  const f5 = await bodyText(page, 'body', 9000)
  check('F5: Đã nghiệm thu đạt, nút chấp thuận biến mất', /Đã nghiệm thu đạt/.test(f5))
  check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

if (STAGE === 'ft') {
  const P = process.env.G3_PROJECT || PROJECT_B, PM = P === PROJECT_B ? 'pm-b' : 'pm-a'
  const { browser, page, log } = await open({ width: 1500, height: 2600 })
  const posts = capture(page)
  await login(page, PM)
  const all = await itemsOf(page, P)
  const it = all.find((i) => i.mode === 'FastTrack' && ['Submitted', 'Reviewed'].includes(i.state))
  check('Có hạng mục Fast Track đã nộp', !!it, all.map((i) => `${i.mode}:${i.state}`).join(','))
  if (it) {
    await openDetail(page, PM, it.packageId)
    const wasReviewed = it.state === 'Reviewed'
    check('Mở hộp thoại Fast Track', (await clickByText(page, /Chấp thuận & Đóng Fast Track/)) === 'clicked')
    await sleep(1500)
    const dlg = await page.evaluate(() => document.querySelector('[role=dialog]').innerText)
    check('Hộp thoại nêu hai bước tuần tự / hoặc đã có ACCEPT', /hai bước/.test(dlg) || /KHÔNG gửi review trùng/.test(dlg))
    await page.evaluate(() => document.querySelector('[role=dialog] input[type=checkbox]').click())
    await setNative(page, '[role=dialog] textarea', `[TEST-FE G3] FT ${new Date().toISOString().slice(11, 19)}`, 'textarea')
    const w0 = posts.length
    await clickByText(page, /Chấp nhận và đóng Fast Track/, '[role=dialog]')
    await sleep(14000)
    const seq = posts.slice(w0).map((p) => p.url.replace(/^.*(attempts\/reviews|final-confirmation).*$/, '$1')).filter((u) => /attempts\/reviews|final-confirmation/.test(u))
    check(wasReviewed ? 'Đã Reviewed: chỉ final-confirmation, không review trùng' : 'Thứ tự: review ACCEPT rồi final-confirmation', wasReviewed ? seq.join() === 'final-confirmation' : seq.join() === 'attempts/reviews,final-confirmation', seq.join())
    const item1 = (await itemsOf(page, P)).find((i) => i.id === it.id)
    check('BE: Fast Track Confirmed', item1?.state === 'Confirmed', item1?.state)
  }
  check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  console.log('   failures:', log.failures.slice(0, 4).join(' | '))
  await browser.close()
}

console.log(`\nKẾT QUẢ ${STAGE}: ${results.filter(Boolean).length}/${results.length} PASS`)
