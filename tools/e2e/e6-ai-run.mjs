// E6: theo dõi AI ngay sau khi tạo (Chinhsua.docx, cập nhật 5h37, mục 2).
// pm-a, nhiệm vụ khảo sát SUBMITTED ở SBX-A. Mỗi lần chạy tạo dữ liệu thật ở BE: chỉ tạo 1 lần chạy hợp lệ + 1 lần chạy fixture sai.
import { open, login, go, apiGet, report, bodyText, clickByText, setNative, sleep, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
const GUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const MODEL = '72f84201-d033-4000-8000-000000000001'

const { browser, page, log } = await open({ height: 4600 })
await login(page, 'pm-a')
const resultReads = []
page.on('request', (r) => { const m = r.url().match(/\/ai-mock-runs\/([0-9a-f-]{36})\/result/i); if (m) resultReads.push(m[1].toLowerCase()) })

async function openDatasetPanel() {
  await go(page, '/pm/surveys', 10000)
  const n = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent)).length)
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent))[i].click(), i)
    await sleep(8000)
    if (await page.evaluate(() => !!document.querySelector('[aria-label="Bản nộp bộ dữ liệu"]'))) return true
    await clickByText(page, /Đóng lại/); await sleep(1000)
  }
  return false
}
const trackerRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="ai-run-row"]')].map((r) => ({ id: r.getAttribute('data-run-id'), status: r.getAttribute('data-status'), text: r.innerText.replace(/\s+/g, ' ') })))
async function fillAndRun(fixture) {
  await clickByText(page, /Đọc phiên bản hình học/); await sleep(6000)
  await setNative(page, '[aria-label="Mã phiên bản mô hình"]', MODEL)
  await setNative(page, '[aria-label="Phiên bản tiền xử lý"]', 'fixture-preprocess.v1')
  await setNative(page, '[aria-label="Phiên bản cấu hình"]', 'fixture-config.v1')
  await setNative(page, '[aria-label="Phiên bản fixture"]', fixture)
  await sleep(600)
  const w0 = log.writes.length, f0 = log.failures.length
  const click = await clickByText(page, /Chạy AI mock/)
  await sleep(4000)
  return { click, writes: log.writes.slice(w0), failures: log.failures.slice(f0) }
}

// ---------- 1. Tạo lần chạy hợp lệ ----------
const opened = await openDatasetPanel()
check('Mở được panel bộ dữ liệu của nhiệm vụ SUBMITTED', opened, '')
const before = await trackerRows()
const r1 = await fillAndRun('synthetic-road-v1')
check('POST /ai-mock-runs 202', r1.writes.some((x) => /POST \/projects\/\{id\}\/ai-mock-runs 202/.test(x)), r1.writes.join('; ') + ' ' + r1.failures.join('; '))
const msg = await page.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((e) => e.innerText).join(' | '))
const runId = (msg.match(GUID) || [])[0]
check('Thông báo hiển thị runId của lần chạy vừa tạo (không phải mã job)', !!runId && /runId/.test(msg), msg.slice(0, 200))
const rows1 = await trackerRows()
const mine = rows1.find((r) => r.id === runId)
check('Lần chạy vừa tạo hiện ngay trong khung theo dõi', !!mine && rows1.length === before.length + 1, `${before.length} → ${rows1.length} lần chạy`)
const jobId = (mine?.text.match(/processingJobId\):\s*([0-9a-f-]{36})/i) || [])[1]
check('Hiển thị riêng nhãn runId và processingJobId, hai mã khác nhau', !!jobId && /Mã lần chạy AI \(runId\)/.test(mine?.text || '') && jobId.toLowerCase() !== String(runId).toLowerCase(), `runId=${runId} jobId=${jobId}`)

// ---------- 2. F5 giữa chừng ----------
await page.reload({ waitUntil: 'networkidle2' }); await sleep(3000)
const reopened = await openDatasetPanel()
const rows2 = await trackerRows()
check('Sau F5 mở lại panel vẫn thấy lần chạy vừa tạo (đọc từ BE)', reopened && rows2.some((r) => r.id === runId), `${rows2.length} lần chạy`)

// ---------- 3. Tự đọc lại đến SUCCEEDED ----------
let status = rows2.find((r) => r.id === runId)?.status
const seen = new Set([status])
for (let i = 0; i < 40 && status !== 'SUCCEEDED' && status !== 'FAILED'; i++) { await sleep(3000); status = (await trackerRows()).find((r) => r.id === runId)?.status; seen.add(status) }
const rowsEnd = await trackerRows()
status = rowsEnd.find((r) => r.id === runId)?.status
check('Trạng thái tự cập nhật đến SUCCEEDED (không bấm đọc lại)', status === 'SUCCEEDED', `đã thấy: ${[...seen].join(' → ')}`)
const bePoll = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${runId}`)).body
check('GET độc lập: lần chạy SUCCEEDED, processingJobId khớp giao diện', bePoll?.status === 'SUCCEEDED' && bePoll?.processingJobId?.toLowerCase() === jobId?.toLowerCase(), `status=${bePoll?.status}`)

// ---------- 4. Xem job (không nhập GUID) ----------
await page.evaluate((id) => { const row = document.querySelector(`[data-run-id="${id}"]`); [...row.querySelectorAll('button')].find((b) => /Xem job xử lý/.test(b.textContent)).click() }, runId)
await sleep(4000)
const jobInfo = await bodyText(page, 'body', 20000)
check('"Xem job xử lý" điền job đang chọn và đọc được job không cần nhập mã', new RegExp(jobId || 'x').test(await page.evaluate(() => document.querySelector('[data-testid="selected-job-id"]')?.innerText || '')) && /Trạng thái/.test(jobInfo), '')

// ---------- 5. Mở kết quả ----------
await page.evaluate((id) => { const row = document.querySelector(`[data-run-id="${id}"]`); [...row.querySelectorAll('button')].find((b) => /Mở kết quả thẩm định/.test(b.textContent)).click() }, runId)
await sleep(12000)
const url = new URL(page.url())
check('"Mở kết quả" điều hướng đúng ngữ cảnh (task, run, dataset)', /^\/pm\/surveys\/[0-9a-f-]{36}$/i.test(url.pathname) && url.searchParams.get('run') === runId && GUID.test(url.searchParams.get('dataset') || ''), url.pathname + url.search)
const banner = await page.evaluate(() => document.querySelector('[data-testid="ai-run-scope-banner"]')?.innerText.replace(/\s+/g, ' ') || '')
check('Màn thẩm định có banner đúng lần chạy', banner.includes(runId.slice(0, 8)), banner.slice(0, 160))
const beRun = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${runId}/result`)).body
const listed = await page.evaluate(() => { const m = document.body.innerText.match(/Tất cả \((\d+)\)/); return m ? Number(m[1]) : -1 })
check('Danh sách phát hiện chỉ gồm các phát hiện của đúng lần chạy (khớp kết quả BE của run)', listed === (beRun?.detections || []).length && listed > 0, `giao diện ${listed}, BE ${(beRun?.detections || []).length}`)
const selected = await page.evaluate(() => { const el = [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0 && /• \d+%$/.test(e.textContent.trim())).pop(); if (!el) return 'no-item'; let n = el; while (n && getComputedStyle(n).cursor !== 'pointer') n = n.parentElement; (n || el).click(); return 'ok' })
await sleep(3000)
const verifyHref = await page.evaluate(() => [...document.querySelectorAll('a')].map((x) => x.getAttribute('href') || '').find((h) => /\/defects\/[^/]+\/verify/.test(h)) || '')
check('Chọn một phát hiện thì có lối vào màn Thẩm định chi tiết', selected === 'ok' && !!verifyHref, `chọn=${selected} href=${verifyHref}`)
if (verifyHref) {
  await page.evaluate((h) => { history.pushState({}, '', h); dispatchEvent(new PopStateEvent('popstate')) }, verifyHref); await sleep(9000)
  const vtxt = await bodyText(page, 'main', 6000)
  const vbtn = await page.evaluate(() => [...new Set([...document.querySelectorAll('main button')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /Gom vào|Ghi nhận|Báo sai|Xác nhận|Từ chối|Giữ/.test(t) && t.length < 60))])
  check('Màn Thẩm định chi tiết còn các thao tác (KEEP_NEW / LINK_EXISTING / REJECT)', vbtn.length >= 2, `thao tác: ${vbtn.join(' | ')}`)
}

// ---------- 6. Lần chạy thất bại (fixture không tồn tại) ----------
const opened2 = await openDatasetPanel()
const rBefore = await trackerRows()
const r2 = await fillAndRun('no-such-fixture-v9')
const errUi = await page.evaluate(() => [...document.querySelectorAll('[role=alert],[role=status]')].map((e) => e.innerText.replace(/\s+/g, ' ')).join(' | '))
const posted = r2.writes.find((x) => /ai-mock-runs/.test(x))
if (!opened2) check('Mở lại panel để thử lần chạy sai', false, '')
else if (/POST .*ai-mock-runs 4\d\d/.test(posted || '')) check('Fixture sai bị BE từ chối ngay, lỗi hiện đúng nguồn', /HTTP 4\d\d|fixture|không/i.test(errUi), `${posted} | UI: ${errUi.slice(0, 200)}`)
else if (/202/.test(posted || '')) {
  let st = ''
  for (let i = 0; i < 40; i++) { await sleep(3000); const rs = await trackerRows(); const newer = rs.find((r) => !rBefore.some((b) => b.id === r.id)); st = newer?.status || ''; if (/SUCCEEDED|FAILED/.test(st)) break }
  const failedRow = (await trackerRows()).find((r) => !rBefore.some((b) => b.id === r.id))
  check('Lần chạy fixture sai kết thúc FAILED và hiển thị lỗi BE trả', st === 'FAILED' && /Lần chạy thất bại/.test(failedRow?.text || ''), `status=${st} | ${(failedRow?.text || '').slice(0, 200)}`)
} else check('Lần chạy fixture sai: kết quả rõ ràng', false, `writes=${r2.writes.join('; ')} failures=${r2.failures.join('; ')} UI=${errUi.slice(0, 200)}`)

check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
