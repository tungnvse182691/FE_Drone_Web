// G1 — Hồ sơ thẩm định (Case): bỏ GIS nhúng, GPS theo evidence, validation form, KEEP_NEW/LINK_EXISTING/REJECT nguồn Report,
// công bố theo nhánh (NO_DEFECT / có Defect), nhãn "Đã ghi nhận" + "Đã mở lại", nhãn không tràn thẻ.
// Dữ liệu test dựng bằng API được phép (tiền tố [TEST-FE G1]); trạng thái không dựng được thì ghi BLOCKED, không giả.
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g1-case-review.mjs [prep|gps|decide|publish|layout|all]
import fs from 'node:fs'
import { open, login, go, apiGet, account, report, bodyText, sleep, PROJECT_A, clickByText } from './lib.mjs'

const STEP = process.argv[2] || 'all'
const API = process.env.RG_API || 'https://localhost:18443/api/v1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const STATE = new URL('./g1-state.json', import.meta.url)
const results = []
const check = (t, ok, d) => { results.push(ok); report(t, ok, d) }
const blocked = (t, d) => console.log(`BLOCKED  ${t}  — ${d}`)
const load = () => (fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {})
const save = (s) => fs.writeFileSync(STATE, JSON.stringify(s, null, 2))

const send = (page, method, path, body, ifMatch) => page.evaluate(async (m, p, b, im) => {
  const c = await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()
  const h = { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': c.requestToken, 'Idempotency-Key': crypto.randomUUID() }
  if (im) h['If-Match'] = im
  const r = await fetch('/api/v1' + p, { method: m, credentials: 'include', headers: h, body: b === undefined ? undefined : JSON.stringify(b) })
  let data = null; try { data = await r.json() } catch { /* rỗng */ }
  return { status: r.status, data, etag: r.headers.get('etag') }
}, method, path, body, ifMatch)

const reporterFetch = async (token, method, path, body, ifMatch) => {
  const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, 'Idempotency-Key': crypto.randomUUID() }
  if (ifMatch) h['If-Match'] = ifMatch
  const r = await fetch(API + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  let data = null; try { data = await r.json() } catch { /* rỗng */ }
  return { status: r.status, data, etag: r.headers.get('etag') }
}

const setSel = (page, label, text) => page.evaluate((l, t) => { const el = document.querySelector('[aria-label="' + l + '"]'); if (!el) return 'no ' + l; const o = [...el.options].find((x) => x.value && (!t || new RegExp(t).test(x.text))); if (!o) return 'empty ' + l; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, o.value); el.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' }, label, text)
const setSelValue = (page, label, value) => page.evaluate((l, v) => { const el = document.querySelector('[aria-label="' + l + '"]'); if (!el) return false; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })); return true }, label, value)
const setText = (page, label, value) => page.evaluate((l, v) => { const t = document.querySelector('[aria-label="' + l + '"]'); if (!t) return false; Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, v); t.dispatchEvent(new Event('input', { bubbles: true })); return true }, label, value)

async function reporterToken() {
  const rep = account('reporter-a')
  const lg = await reporterFetch('', 'POST', '/auth/android/login', { email: rep.email, password: rep.password })
  const token = lg.data?.accessToken || lg.data?.token
  if (!token) throw new Error('Reporter login lỗi: ' + lg.status)
  return token
}

// Tạo Report mới (ảnh tham chiếu lại tệp VERIFIED của chính reporter) + phân loại Case vào dự án A có phạm vi hình học (Giám sát).
async function newCase(token, sup, label, loc) {
  const own = (await reporterFetch(token, 'GET', '/reports?limit=50')).data?.items || []
  const ev = own.find((x) => x.evidence?.length)?.evidence[0]
  if (!ev) throw new Error('Reporter-a chưa có tệp ảnh VERIFIED để tham chiếu')
  const nr = await reporterFetch(token, 'POST', '/reports', { description: `[TEST-FE G1] ${label} ${new Date().toISOString()}`, evidence: [{ fileId: ev.fileId, fileVersion: ev.fileVersion, locationSource: loc ? 'MANUAL' : 'UNKNOWN', capturedAt: new Date().toISOString(), ...(loc ? { location: { latitude: loc[0], longitude: loc[1], accuracyMeters: 5 } } : {}) }] })
  if (nr.status !== 201) throw new Error('Tạo report lỗi: ' + JSON.stringify(nr.data).slice(0, 200))
  let all = []
  for (const q of ['/cases?pageSize=100', '/cases?projectId=' + PROJECT_A + '&pageSize=100']) all = all.concat((await apiGet(sup, q)).body?.items || [])
  const found = all.find((x) => (x.reportIds || []).includes(nr.data.id))
  if (!found) throw new Error('Không thấy Case của report mới')
  if (found.status === 'UNASSIGNED') {
    const wp = (await apiGet(sup, '/projects/' + PROJECT_A + '/work-package')).body
    let pins = null
    for (const rs of wp?.roadSections || []) {
      const sets = (await apiGet(sup, '/projects/' + PROJECT_A + '/road-sections/' + rs.roadSectionId + '/versions/' + rs.currentVersionId + '/segment-sets')).body?.items || []
      const set = sets.find((x) => x.status === 'PUBLISHED')
      if (set) { pins = { routeVersionId: rs.currentVersionId, segmentSetId: set.id }; break }
    }
    if (!pins) throw new Error('Không có bộ phân đoạn PUBLISHED')
    const gp = await sup.evaluate(async (p, q) => { const r = await fetch('/api/v1/projects/' + p + '/geometry-package?routeVersionId=' + q.routeVersionId + '&segmentSetId=' + q.segmentSetId, { credentials: 'include' }); return { status: r.status, etag: r.headers.get('etag') } }, PROJECT_A, pins)
    const t = await send(sup, 'POST', '/cases/' + found.id + '/triage', { projectId: PROJECT_A, verificationMethod: 'EXISTING_EVIDENCE', reason: `[TEST-FE G1] Phân loại ${label}`, ...pins, geometryVersion: (gp.etag || '').replace(/"/g, '') }, '"' + found.version.replace(/"/g, '') + '"')
    if (t.status >= 400) throw new Error('Triage lỗi ' + t.status + ' ' + JSON.stringify(t.data).slice(0, 200))
  }
  return { caseId: found.id, reportId: nr.data.id, code: '#CAS-' + found.id.slice(0, 8).toUpperCase(), fileId: ev.fileId, fileVersion: ev.fileVersion }
}

async function prep() {
  const token = await reporterToken()
  const { browser, page } = await open(); await login(page, 'supervisor')
  const st = load()
  // Case GPS: Report gốc có GPS A; bổ sung GPS B; bổ sung UNKNOWN.
  st.gps = await newCase(token, page, 'GPS ảnh/bằng chứng', [9.9498, 105.001])
  const rr = await reporterFetch(token, 'GET', `/reports/${st.gps.reportId}`)
  for (const [loc, src] of [[[10.0123, 105.5456], 'MANUAL'], [null, 'UNKNOWN']]) {
    const sp = await reporterFetch(token, 'POST', `/reports/${st.gps.reportId}/supplements`, { description: `[TEST-FE G1] Bổ sung ${src} ${loc ? loc.join(',') : ''}`, evidence: [{ fileId: st.gps.fileId, fileVersion: st.gps.fileVersion, locationSource: src, capturedAt: new Date().toISOString(), ...(loc ? { location: { latitude: loc[0], longitude: loc[1], accuracyMeters: 5 } } : {}) }] }, (await reporterFetch(token, 'GET', `/reports/${st.gps.reportId}`)).etag || rr.etag)
    console.log('supplement', src, sp.status, sp.status >= 400 ? JSON.stringify(sp.data).slice(0, 200) : '')
  }
  st.reject = await newCase(token, page, 'REJECT nguồn Report', [9.9499, 105.0011])
  st.link = await newCase(token, page, 'LINK_EXISTING', [9.94981, 105.00101])
  st.nodefect = await newCase(token, page, 'NO_DEFECT + công bố', [9.9497, 105.0012])
  st.keep = await newCase(token, page, 'KEEP_NEW', [9.94982, 105.00102])
  save(st)
  console.log('prep xong:', JSON.stringify(Object.fromEntries(Object.entries(st).map(([k, v]) => [k, v.code]))))
  await browser.close()
}

async function openCase(page, code) {
  await go(page, '/pm/ai-inbox', 12000)
  const r = await page.evaluate((c) => {
    const el = [...document.querySelectorAll('main *')].filter((e) => e.children.length < 4 && e.textContent.includes(c)).pop()
    let n = el; let b = null
    while (n && !b) { b = [...n.querySelectorAll('button')].find((x) => /Thẩm định|Xem chi tiết/.test(x.textContent)); n = n.parentElement }
    if (!b) return 'no-btn'
    b.click(); return 'clicked'
  }, code)
  await sleep(8000)
  return r
}

async function gps() {
  const st = load(); if (!st.gps) throw new Error('Chưa prep')
  const { browser, page, log } = await open({ height: 3000 }); await login(page, 'pm-a')
  const opened = await openCase(page, st.gps.code)
  check('GPS: mở được hồ sơ thẩm định', opened === 'clicked', opened)
  const txt = await bodyText(page, 'body', 20000)
  check('GIS: không còn tab "Vị trí bản đồ GIS"', !/Vị trí bản đồ GIS/.test(txt))
  check('GIS: không còn "Xem toàn màn hình GIS"', !/Xem toàn màn hình GIS/.test(txt))
  check('GIS: không còn nút "Bản đồ GIS" trên ảnh', !/Bản đồ GIS/.test(txt))
  const evs = await page.evaluate(() => [...document.querySelectorAll('[data-testid=evidence-gps-detail]')].map((e) => e.textContent.trim()))
  console.log('GPS các evidence (chi tiết):', JSON.stringify(evs))
  check('GPS: có ≥3 evidence (gốc + 2 bổ sung)', evs.length >= 3, String(evs.length))
  const overlay = () => page.evaluate(() => document.querySelector('[data-testid=evidence-gps-overlay]')?.textContent.trim() || '')
  const clickView = (i) => page.evaluate((idx) => { const bs = [...document.querySelectorAll('button')].filter((b) => /Xem ảnh|Đang xem ảnh/.test(b.textContent)); if (!bs[idx]) return false; bs[idx].click(); return true }, i)
  const coord = (s) => (s.match(/-?\d+\.\d+, -?\d+\.\d+/) || [''])[0]
  const seen = []
  for (let i = 0; i < evs.length; i++) {
    await clickView(i); await sleep(1500)
    const ov = await overlay()
    const det = evs[i]
    seen.push(ov)
    const same = /UNKNOWN/.test(det) ? /UNKNOWN/.test(ov) : coord(det) !== '' && coord(det) === coord(ov)
    check(`GPS: evidence #${i + 1} — overlay khớp chi tiết`, same, `${det} || ${ov}`)
    check(`GPS: evidence #${i + 1} — overlay ghi "GPS ảnh/bằng chứng"`, /GPS ảnh\/bằng chứng/.test(ov))
    check(`GPS: evidence #${i + 1} — không dùng tọa độ mặc định`, !/108\.2045|16\.0582/.test(ov))
  }
  const withGps = evs.filter((d) => !/UNKNOWN/.test(d))
  check('GPS: đổi giữa 2 ảnh có GPS khác nhau cập nhật đúng', new Set(withGps.map(coord)).size >= 2, [...new Set(withGps.map(coord))].join(' | '))
  const unk = evs.findIndex((d) => /UNKNOWN/.test(d))
  if (unk >= 0) {
    await clickView(0); await sleep(1000); await clickView(unk); await sleep(1500)
    const ov = await overlay()
    check('GPS: ảnh thiếu GPS sau ảnh có GPS không còn tọa độ cũ', /UNKNOWN/.test(ov) && !/\d+\.\d+, \d+\.\d+/.test(ov), ov)
  } else blocked('Ảnh thiếu GPS sau ảnh có GPS', 'không có evidence UNKNOWN')
  // Link "Xem vị trí evidence" cho ảnh có GPS
  const links = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /Xem vị trí evidence/.test(a.textContent)).map((a) => a.href))
  check('GPS: giữ link "Xem vị trí evidence" cho ảnh có GPS', links.length === withGps.length && links.every((h) => /openstreetmap/.test(h)), links.length + '/' + withGps.length)
  // Phóng to ảnh
  await clickView(withGps.length ? evs.findIndex((d) => !/UNKNOWN/.test(d)) : 0); await sleep(1000)
  const zoomed = await page.evaluate(() => { const b = document.querySelector('button[title="Xem ảnh gốc độ phân giải cao"]'); if (!b) return false; b.click(); return true })
  await sleep(1500)
  const zoomTxt = await page.evaluate(() => document.querySelector('[data-testid=zoom-gps-overlay]')?.textContent.trim() || '')
  const ovNow = await overlay()
  check('GPS: phóng to ảnh hiển thị cùng GPS ảnh/bằng chứng', zoomed && coord(zoomTxt) !== '' && coord(zoomTxt) === coord(ovNow), `${zoomTxt} || ${ovNow}`)
  const all = await bodyText(page, 'body', 30000)
  check('GPS: phóng to không còn tọa độ null/mặc định', !/null°|undefined|108\.2045/.test(all))
  check('GPS: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// Điền form Quyết định nguồn Report và gửi. kind: KEEP_NEW | LINK_EXISTING | REJECT
async function fillAndSubmit(page, log, kind, reason) {
  await setSel(page, 'Report nguồn ghi nhận khiếm khuyết')
  await setSelValue(page, 'Loại quyết định nguồn Report', kind)
  await sleep(1500)
  const out = []
  if (kind === 'KEEP_NEW') {
    out.push(await setSel(page, 'Loại lỗi'), await setSel(page, 'Mức độ nghiêm trọng'))
    const roads = await page.evaluate(() => [...(document.querySelector('[aria-label="Tuyến ghi nhận khiếm khuyết"]')?.options || [])].filter((x) => x.value).map((x) => x.value))
    let ok = false
    for (const road of roads) {
      await setSelValue(page, 'Tuyến ghi nhận khiếm khuyết', road); await sleep(6000)
      if ((await setSel(page, 'Bộ phân đoạn ghi nhận khiếm khuyết')) === 'ok') { ok = true; break }
    }
    out.push(ok ? 'tuyến ok' : 'KHÔNG CÓ bộ phân đoạn')
  }
  if (kind === 'LINK_EXISTING') out.push(await setSel(page, 'Khiếm khuyết đích'))
  await setText(page, 'Lý do ghi nhận khiếm khuyết', reason)
  await sleep(1200)
  const w0 = log.writes.length
  const label = { KEEP_NEW: /Xác nhận ghi nhận khiếm khuyết/, LINK_EXISTING: /Xác nhận gắn vào khiếm khuyết đã có/, REJECT: /Xác nhận từ chối nguồn Report/ }[kind]
  const sub = await clickByText(page, label)
  await sleep(9000)
  return { out, sub, posts: log.writes.slice(w0).join('; ') }
}

const card = (page, code) => page.evaluate((c) => {
  const el = [...document.querySelectorAll('main *')].filter((e) => e.children.length < 4 && e.textContent.includes(c)).pop()
  let n = el
  while (n && n.parentElement && !(n.querySelectorAll('button').length && n.innerText.length > 80)) n = n.parentElement
  return (n?.innerText || '').split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean).join(' | ').slice(0, 500)
}, code)

async function decide() {
  const st = load(); if (!st.keep) throw new Error('Chưa prep')
  const { browser, page, log } = await open({ height: 3500 }); await login(page, 'pm-a')
  // 1) Validation: gửi form KEEP_NEW trống -> lỗi cụ thể (không chỉ nút mờ)
  let o = await openCase(page, st.keep.code)
  check('VAL: mở hồ sơ KEEP_NEW', o === 'clicked', o)
  const w0 = log.writes.length
  const c0 = await clickByText(page, /Xác nhận ghi nhận khiếm khuyết/)
  await sleep(1500)
  const errs = await page.evaluate(() => ({ type: document.querySelector('[data-testid=err-type]')?.textContent, severity: document.querySelector('[data-testid=err-severity]')?.textContent, road: document.querySelector('[data-testid=err-road]')?.textContent, reason: document.querySelector('[data-testid=err-reason]')?.textContent }))
  console.log('lỗi form trống:', JSON.stringify(errs))
  check('VAL: bấm xác nhận form trống -> hiện lỗi từng trường (loại lỗi, mức độ, tuyến, lý do)', c0 === 'clicked' && !!errs.type && !!errs.severity && !!errs.road && !!errs.reason, c0)
  check('VAL: form trống không gửi lệnh ghi', log.writes.length === w0, log.writes.slice(w0).join('; '))
  await setText(page, 'Lý do ghi nhận khiếm khuyết', 'x'.repeat(1001)); await sleep(800)
  const longErr = await page.evaluate(() => document.querySelector('[data-testid=err-reason]')?.textContent || '')
  check('VAL: lý do >1000 ký tự báo lỗi cụ thể', /1\.000/.test(longErr), longErr)
  // 2) KEEP_NEW thật qua giao diện
  const kn = await fillAndSubmit(page, log, 'KEEP_NEW', '[TEST-FE G1] Ghi nhận khiếm khuyết (KEEP_NEW) từ Report')
  console.log('KEEP_NEW:', kn.out.join(','), kn.posts)
  check('KEEP_NEW: POST candidate-decisions 201', kn.sub === 'clicked' && kn.posts.includes('candidate-decisions 201'), kn.posts)
  let t = await bodyText(page, 'body', 20000)
  check('KEEP_NEW: drawer hiện kết quả đọc lại (Trạng thái Defect)', /Trạng thái Defect: \w+/.test(t))
  // 3) REJECT nguồn Report (đóng drawer bằng nút Đóng, mở hồ sơ khác)
  await clickByText(page, /^\s*Đóng\s*$/)
  o = await openCase(page, st.reject.code)
  const rj = await fillAndSubmit(page, log, 'REJECT', '[TEST-FE G1] Từ chối nguồn Report (REJECT), không phải NO_DEFECT')
  console.log('REJECT:', rj.out.join(','), rj.posts)
  check('REJECT: POST candidate-decisions 201', rj.sub === 'clicked' && rj.posts.includes('candidate-decisions 201'), rj.posts)
  t = await bodyText(page, 'body', 20000)
  check('REJECT: drawer ghi rõ REJECT nguồn Report KHÔNG phải NO_DEFECT của Case', /Quyết định REJECT nguồn Report/.test(t) && /KHÔNG phải kết luận NO_DEFECT/.test(t))
  const cr = await apiGet(page, '/cases/' + st.reject.caseId)
  check('REJECT: Case ở BE không bị kết luận NO_DEFECT (conclusion rỗng, status OPEN)', cr.body?.status === 'OPEN' && !cr.body?.conclusion?.outcome, cr.body?.status + ' ' + (cr.body?.conclusion?.outcome || '-'))
  await clickByText(page, /^\s*Đóng\s*$/)
  // 4) LINK_EXISTING
  o = await openCase(page, st.link.code)
  await setSel(page, 'Report nguồn ghi nhận khiếm khuyết'); await setSelValue(page, 'Loại quyết định nguồn Report', 'LINK_EXISTING'); await sleep(1500)
  const opts = await page.evaluate(() => [...(document.querySelector('[aria-label="Khiếm khuyết đích"]')?.options || [])].map((x) => x.text))
  console.log('ứng viên LINK_EXISTING:', JSON.stringify(opts))
  await clickByText(page, /Xác nhận gắn vào khiếm khuyết đã có/)
  await sleep(1000)
  const terr = await page.evaluate(() => document.querySelector('[data-testid=err-target]')?.textContent || '')
  check('VAL: LINK_EXISTING chưa chọn Defect đích -> lỗi cụ thể', /Chọn Defect đích/.test(terr), terr)
  if (opts.length > 1) {
    const lk = await fillAndSubmit(page, log, 'LINK_EXISTING', '[TEST-FE G1] Gắn vào khiếm khuyết hiện có (LINK_EXISTING)')
    console.log('LINK_EXISTING:', lk.out.join(','), lk.posts)
    check('LINK_EXISTING: POST candidate-decisions 201', lk.sub === 'clicked' && lk.posts.includes('candidate-decisions 201'), lk.posts)
    t = await bodyText(page, 'body', 20000)
    check('LINK_EXISTING: drawer hiện Defect hiện có + trạng thái', /gắn vào Defect hiện có/.test(t))
  } else blocked('LINK_EXISTING gửi lệnh', 'BE không trả ứng viên Defect cho Report này (GET /candidates items rỗng); đã kiểm form báo lỗi khi chưa chọn đích')
  await clickByText(page, /^\s*Đóng\s*$/)
  // 5) Danh sách: nhãn riêng cho từng loại quyết định
  await go(page, '/pm/dashboard', 4000); await go(page, '/pm/ai-inbox', 12000)
  const ck = await card(page, st.keep.code), cj = await card(page, st.reject.code)
  console.log('thẻ KEEP_NEW:', ck); console.log('thẻ REJECT:', cj)
  check('LIST: KEEP_NEW hiện "Đã ghi nhận" + "Defect: …"', /Đã ghi nhận/.test(ck) && /Defect: \w+/.test(ck))
  check('LIST: REJECT nguồn Report hiện "Đã từ chối nguồn Report" (không "Báo sai")', /Đã từ chối nguồn Report/.test(cj) && !/Báo sai/.test(cj))
  check('PM: không lỗi JS (quyết định)', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// NO_DEFECT (kết luận Case) rồi công bố nhánh NO_DEFECT; nhánh có Defect kiểm theo hành vi BE.
async function publish() {
  const st = load(); if (!st.nodefect) throw new Error('Chưa prep')
  const { browser, page, log } = await open({ height: 3500 }); await login(page, 'pm-a')
  const posts = []
  page.on('request', (r) => { if (r.method() === 'POST' && /\/cases\/[^/]+\/publications$/.test(r.url())) posts.push(r.postData()) })
  let o = await openCase(page, st.nodefect.code)
  check('NO_DEFECT: mở hồ sơ', o === 'clicked', o)
  const cur = await apiGet(page, '/cases/' + st.nodefect.caseId)
  if (cur.body?.conclusion?.outcome !== 'NO_DEFECT') {
    await clickByText(page, /Báo sai \(Không có lỗi\)/); await sleep(1500)
    const w0 = log.writes.length
    await clickByText(page, /Xác Nhận Kết Luận NO_DEFECT/); await sleep(1200)
    const errs = await page.evaluate(() => ({ reason: document.querySelector('[data-testid=nodefect-err-reason]')?.textContent, evidence: document.querySelector('[data-testid=nodefect-err-evidence]')?.textContent }))
    check('VAL: NO_DEFECT form trống -> lỗi lý do + bằng chứng, không gửi lệnh', !!errs.reason && !!errs.evidence && log.writes.length === w0, JSON.stringify(errs))
    await setText(page, 'Lý do kết luận', 'x') // (textarea không có aria-label; điền bằng selector bên dưới)
    await page.evaluate(() => { const t = document.querySelector('textarea[required]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE G1] Báo sai: không có khiếm khuyết'); t.dispatchEvent(new Event('input', { bubbles: true })) })
    await setSel(page, 'Bằng chứng kết luận Không có lỗi'); await sleep(800)
    const w1 = log.writes.length
    await clickByText(page, /Xác Nhận Kết Luận NO_DEFECT/); await sleep(9000)
    const cw = log.writes.slice(w1).join('; ')
    check('NO_DEFECT: POST conclusions 200/201', /conclusions 20[01]/.test(cw), cw)
    await clickByText(page, /^\s*Đóng\s*$/)
    o = await openCase(page, st.nodefect.code)
  }
  const after = await apiGet(page, '/cases/' + st.nodefect.caseId)
  check('NO_DEFECT: Case đã CONCLUDED/NO_DEFECT ở BE', after.body?.conclusion?.outcome === 'NO_DEFECT' && after.body?.status !== 'OPEN', after.body?.status + ' ' + after.body?.conclusion?.outcome)
  // Công bố
  console.log('mở lại hồ sơ:', o, (await bodyText(page, 'body', 1500)).slice(0, 700))
  const open1 = await clickByText(page, /Công bố tiến độ cho người dân|Cập nhật thông báo cho người dân/)
  await sleep(4000)
  check('PUBLISH: mở được form công bố', open1 === 'clicked', open1)
  const w2 = log.writes.length
  await clickByText(page, /Công Bố Cho Người Dân/); await sleep(1200)
  const perr = await page.evaluate(() => ({ recipients: document.querySelector('[data-testid=publish-err-recipients]')?.textContent, note: document.querySelector('[data-testid=publish-err-note]')?.textContent, defects: document.querySelector('[data-testid=publish-err-defects]')?.textContent }))
  check('VAL: công bố trống -> lỗi người nhận + nội dung, KHÔNG đòi Defect ở nhánh NO_DEFECT', !!perr.recipients && !!perr.note && !perr.defects && log.writes.length === w2, JSON.stringify(perr))
  const legend = await page.evaluate(() => [...document.querySelectorAll('legend')].map((l) => l.textContent).join(' | '))
  check('PUBLISH: form hiện nhánh "Case đã kết luận NO_DEFECT (không kèm Defect)"', /NO_DEFECT \(không kèm Defect\)/.test(legend), legend)
  await page.evaluate(() => { const c = [...document.querySelectorAll('fieldset input[type=checkbox]')].find((x) => /^Defect|Bằng chứng/.test(x.getAttribute('aria-label') || '') === false); c?.click() })
  await page.evaluate(() => { const t = [...document.querySelectorAll('textarea')].pop(); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE G1] Hồ sơ đã được thẩm định: không có khiếm khuyết.'); t.dispatchEvent(new Event('input', { bubbles: true })) })
  await sleep(800)
  const w3 = log.writes.length
  await clickByText(page, /Công Bố Cho Người Dân/); await sleep(10000)
  const pw = log.writes.slice(w3).join('; ')
  check('PUBLISH(NO_DEFECT): POST publications 201', /publications 201/.test(pw), pw)
  const body = posts.length ? JSON.parse(posts[posts.length - 1]) : null
  console.log('body publications:', JSON.stringify(body))
  check('PUBLISH(NO_DEFECT): body đúng Report được chọn, defectIds rỗng, không tự chọn ảnh', !!body && body.reportIds?.length === 1 && body.reportIds[0] === st.nodefect.reportId && body.defectIds?.length === 0 && body.evidenceIds?.length === 0, JSON.stringify(body))
  const re = await apiGet(page, '/cases/' + st.nodefect.caseId)
  check('PUBLISH: đọc lại Case sau công bố (GET 200)', re.status === 200, String(re.status))
  // Nhánh có Defect: Case của KEEP_NEW (OPEN, có Defect) — xem BE trả gì cho công bố có Defect.
  const kc = await apiGet(page, '/cases/' + st.keep.caseId)
  const defectIds = kc.body?.defectIds || []
  console.log('Case KEEP_NEW:', kc.body?.status, 'defectIds', JSON.stringify(defectIds))
  if (defectIds.length) {
    const pubDef = await send(page, 'POST', `/cases/${st.keep.caseId}/publications`, { reportIds: [st.keep.reportId], defectIds, evidenceIds: [], summary: '[TEST-FE G1] Công bố có Defect' }, '"' + String(kc.body.version).replace(/"/g, '') + '"')
    console.log('POST publications có Defect (API):', pubDef.status, JSON.stringify(pubDef.data).slice(0, 300))
    check('PUBLISH(có Defect): BE trả phản hồi xác định (201 hoặc lỗi nghiệp vụ có code)', pubDef.status === 201 || !!pubDef.data?.code, pubDef.status + ' ' + (pubDef.data?.code || ''))
  } else blocked('PUBLISH có Defect (BE)', 'Case KEEP_NEW chưa có defectIds ở GET /cases/{id}')
  check('PM: không lỗi JS (công bố)', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// Case mở lại do bổ sung (HUY-BUG-006) + KEEP_NEW trên Case đã mở lại + bố cục nhãn không tràn thẻ.
async function reopen() {
  const st = load()
  if (!st.reopen) {
    const token = await reporterToken()
    const sup = await open(); await login(sup.page, 'supervisor')
    st.reopen = await newCase(token, sup.page, 'Case mở lại', [9.9496, 105.0013])
    await sup.browser.close()
    const pm = await open(); await login(pm.page, 'pm-a')
    const c = await apiGet(pm.page, '/cases/' + st.reopen.caseId)
    const rp = await apiGet(pm.page, `/cases/${st.reopen.caseId}/reports`)
    const ev = rp.body?.items?.[0]?.originalEvidence?.[0]?.evidenceId
    const k = await send(pm.page, 'POST', `/cases/${st.reopen.caseId}/conclusions`, { outcome: 'NO_DEFECT', reason: '[TEST-FE G1] Báo sai trước khi bổ sung', evidenceIds: [ev], defectIds: [] }, '"' + c.body.version.replace(/"/g, '') + '"')
    console.log('conclusion', k.status)
    await pm.browser.close()
    const rr = await reporterFetch(token, 'GET', `/reports/${st.reopen.reportId}`)
    const sp = await reporterFetch(token, 'POST', `/reports/${st.reopen.reportId}/supplements`, { description: '[TEST-FE G1] Bổ sung sau kết luận', evidence: [{ fileId: st.reopen.fileId, fileVersion: st.reopen.fileVersion, locationSource: 'UNKNOWN' }] }, rr.etag)
    console.log('supplement', sp.status)
    save(st)
  }
  const { browser, page, log } = await open({ height: 3500 }); await login(page, 'pm-a')
  const c = await apiGet(page, '/cases/' + st.reopen.caseId)
  check('REOPEN: BE trả Case OPEN còn kết luận cũ NO_DEFECT', c.body?.status === 'OPEN' && c.body?.conclusion?.outcome === 'NO_DEFECT', c.body?.status + ' ' + c.body?.conclusion?.outcome)
  await openCase(page, st.reopen.code)
  let t = await bodyText(page, 'body', 20000)
  check('REOPEN: chi tiết hiện banner mở lại + lịch sử kết luận cũ', /ĐÃ MỞ LẠI DO CÓ BỔ SUNG/.test(t) && /Lịch sử kết luận/.test(t))
  check('REOPEN: form ghi nhận (Quyết định nguồn Report) hiển thị, không bị giấu bởi NO_DEFECT lịch sử', /Quyết định nguồn Report/.test(t) && /Báo sai \(Không có lỗi\)/.test(t))
  const kn = await fillAndSubmit(page, log, 'KEEP_NEW', '[TEST-FE G1] KEEP_NEW trên Case đã mở lại')
  check('REOPEN: KEEP_NEW POST 201', kn.posts.includes('candidate-decisions 201'), kn.posts)
  await clickByText(page, /^\s*Đóng\s*$/)
  await go(page, '/pm/dashboard', 4000); await go(page, '/pm/ai-inbox', 12000)
  const cd = await card(page, st.reopen.code)
  console.log('thẻ Case mở lại + KEEP_NEW:', cd)
  check('REOPEN: thẻ hiện "Đã ghi nhận" + "Defect: …" + nhãn phụ "Đã mở lại do có bổ sung"', /Đã ghi nhận/.test(cd) && /Defect: \w+/.test(cd) && /Đã mở lại do có bổ sung/.test(cd))
  // Bố cục: nhãn không tràn khỏi thẻ ở nhiều độ rộng
  for (const w of [1500, 1100, 800, 560, 420]) {
    await page.setViewport({ width: w, height: 3500 }); await sleep(1500)
    const bad = await page.evaluate(() => {
      const out = []
      for (const b of document.querySelectorAll('[data-testid=card-badges]')) {
        const card = b.closest('.rounded-\\[20px\\]'); if (!card) continue
        const cr = card.getBoundingClientRect()
        for (const ch of b.children) { const r = ch.getBoundingClientRect(); if (r.right > cr.right + 1 || r.left < cr.left - 1 || ch.scrollWidth > ch.clientWidth + 1) out.push(ch.textContent.trim().slice(0, 40)) }
      }
      return { out, pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1, n: document.querySelectorAll('[data-testid=card-badges]').length }
    })
    check(`LAYOUT ${w}px: nhãn không tràn thẻ (${bad.n} thẻ)`, bad.n > 0 && bad.out.length === 0, JSON.stringify(bad))
  }
  check('PM: không lỗi JS (mở lại)', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

const argReady = () => STEP === 'all'
if (STEP === 'prep') await prep()
if (STEP === 'gps' || argReady()) await gps()
if (STEP === 'decide' || argReady()) await decide()
if (STEP === 'publish' || argReady()) await publish()
if (STEP === 'reopen' || argReady()) await reopen()
const failed = results.filter((x) => !x).length
if (results.length) console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
