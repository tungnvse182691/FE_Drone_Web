// E4: phong tỏa pháp lý có ô lý do khi gỡ, lý do kiểm kê lưu trữ, giao lại Operator, hoàn tất nhiệm vụ khảo sát (BE c0c99ca).
// Chạy trên Project B để không làm nhiễu dữ liệu Project A. Dữ liệu tạo thêm có tiền tố [TEST-FE].
import { open, login, go, apiGet, report, bodyText, clickByText, sleep, PROJECT_B } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }

async function send(page, method, path, body, headers = {}) {
  return page.evaluate(async (m, p, b, h) => {
    const csrf = (await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()).requestToken
    const r = await fetch(`/api/v1${p}`, { method: m, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Idempotency-Key': crypto.randomUUID(), ...h }, body: b == null ? undefined : JSON.stringify(b) })
    let json = null; try { json = await r.json() } catch { /* không có thân JSON */ }
    return { status: r.status, body: json, etag: r.headers.get('etag') }
  }, method, path, body, headers)
}

// ---------- Giám sát: phong tỏa + lý do kiểm kê ----------
{
  const { browser, page, log } = await open(); await login(page, 'supervisor')
  await go(page, '/sup/legal-hold', 12000)
  const pickCard = (code, selectorAfter) => page.evaluate((code) => {
    const els = [...document.querySelectorAll('main *')].filter((e) => e.textContent.includes(code) && !/SBX-A/.test(e.textContent) && e.children.length === 0)
    const el = els[els.length - 1]; let n = el
    while (n && !n.querySelector('button[title]')) n = n.parentElement
    if (!n) return 'no-card'
    const b = n.querySelector('button[title]'); b.click(); return b.title.slice(0, 40)
  }, code)

  // Kích hoạt trên SBX-B
  check('W10 mở modal bật phong tỏa trên SBX-B', /thiết lập/.test(await pickCard('SBX-B')), '')
  await sleep(2500)
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('.fixed')].pop(); const f = d.querySelectorAll('textarea,input[type=text]')
    const set = (e, v, P) => { Object.getOwnPropertyDescriptor(P.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }
    set(f[0], '[TEST-FE] Phong tỏa thử để kiểm ô lý do gỡ', HTMLTextAreaElement); set(f[1], 'Cơ quan thử nghiệm', HTMLInputElement); set(f[2], 'TEST-FE-E4/QĐ', HTMLInputElement)
  })
  await clickByText(page, /Kích hoạt Phong tỏa/); await sleep(9000)
  check('W10 bật phong tỏa SBX-B: POST /retention/holds 201', log.writes.some((x) => /POST \/retention\/holds 201/.test(x)), log.writes.join('; '))

  // Gỡ: phải có ô lý do và bắt buộc
  check('W10 mở modal gỡ phong tỏa', /gỡ bỏ/.test(await pickCard('SBX-B')), '')
  await sleep(2500)
  const hasField = await page.evaluate(() => !!document.querySelector('[aria-label="Lý do gỡ phong tỏa"]'))
  check('W10 modal gỡ có ô "Lý do gỡ phong tỏa"', hasField, '')
  const w0 = log.writes.length
  await clickByText(page, /Xác nhận Gỡ phong tỏa/); await sleep(2500)
  check('W10 gỡ khi để trống lý do: bị chặn, không gọi API', log.writes.length === w0, log.writes.slice(w0).join('; '))
  await page.evaluate(() => { const t = document.querySelector('[aria-label="Lý do gỡ phong tỏa"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE] Kết thúc kiểm tra, gỡ phong tỏa'); t.dispatchEvent(new Event('input', { bubbles: true })) })
  await clickByText(page, /Xác nhận Gỡ phong tỏa/); await sleep(9000)
  check('W10 gỡ có lý do: POST /retention/holds/{id}/release 2xx', log.writes.slice(w0).some((x) => /POST \/retention\/holds\/\{id\}\/release 20\d/.test(x)), log.writes.slice(w0).join('; '))

  // Lý do kiểm kê: chạy đánh giá và mở chi tiết tệp của SBX-B
  await pickCard('SBX-B') // mở lại modal (sau gỡ sẽ là modal bật) → đóng, mở chi tiết lưu trữ bằng bấm thẻ
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => /Hủy bỏ/.test(b.textContent))?.click() })
  await sleep(1000)
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('main *')].filter((e) => /SBX-B/.test(e.textContent) && !/SBX-A/.test(e.textContent))
    const el = els[els.length - 1]; let n = el
    while (n && getComputedStyle(n).cursor !== 'pointer') n = n.parentElement; (n || el).click()
  })
  await sleep(7000)
  await clickByText(page, /Chạy đánh giá mới/); await sleep(26000)
  await clickByText(page, /Xem chi tiết tệp/); await sleep(7000)
  const modal = await bodyText(page, '[role=dialog]', 4000)
  const ul = await page.evaluate(() => [...document.querySelectorAll('[aria-label="Lý do kiểm kê chưa đầy đủ"] li')].map((li) => li.textContent.slice(0, 160)))
  check('W10 chi tiết tệp liệt kê lý do kiểm kê (inventoryReasonCodes) hoặc báo đầy đủ', ul.length > 0 || /Kiểm kê đầy đủ/.test(modal), ul.join(' | ').slice(0, 200) || modal.slice(0, 200))
  check('Giám sát: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))

  // Đọc lại bằng GET
  const ev = (await apiGet(page, `/projects/${PROJECT_B}/retention/evaluations`)).body?.items || []
  const latest = ev.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]
  const det = latest ? (await apiGet(page, `/projects/${PROJECT_B}/retention/evaluations/${latest.id}`)).body : null
  const fileId = det?.items?.[0]?.fileId
  if (fileId) {
    const f = (await apiGet(page, `/projects/${PROJECT_B}/retention/files/${fileId}`)).body
    check('W10 GET: activeHoldCount SBX-B = 0 sau khi gỡ', f?.activeHoldCount === 0, `activeHoldCount=${f?.activeHoldCount}; inventoryReasonCodes=${JSON.stringify(f?.inventoryReasonCodes)}`)
  } else check('W10 đọc được tệp lưu trữ của SBX-B', false, 'không có tệp trong đánh giá')
  await browser.close()
}

const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
