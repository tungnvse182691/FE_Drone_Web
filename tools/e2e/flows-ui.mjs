// Kiểm thử giao diện thật theo luồng (W01–W10, không mobile).
// Thao tác ghi chỉ gồm những thứ an toàn lặp lại: xuất hồ sơ DOSSIER (PM), chạy đánh giá lưu trữ (Giám sát).
import { open, login, go, apiGet, report, bodyText, clickByText, sleep, BASE, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
const has = (text, re) => re.test(text)

// ---------- Giám sát ----------
{
  const { browser, page, log } = await open(); await login(page, 'supervisor')

  await go(page, `/sup/projects/${PROJECT_A}`, 14000)
  let t = await bodyText(page, 'main', 4000)
  check('W02 Giám sát: thẻ "Hoàn thành thi công" hiển thị', has(t, /Hoàn thành thi công/), '')
  check('W02 Giám sát: trạng thái vòng đời lấy từ BE (Đã xác nhận / Chưa có xác nhận)', has(t, /Đã xác nhận|Chưa có xác nhận/), '')

  await go(page, '/sup/proposals', 12000)
  t = await bodyText(page, 'main', 4000)
  check('W07 Giám sát: panel "Chuyển giao nghĩa vụ sửa chữa" hiển thị', has(t, /Chuyển giao nghĩa vụ sửa chữa/), '')

  const firstPkg = (await apiGet(page, `/projects/${PROJECT_A}/repair-packages`)).body?.items?.[0]?.id
  check('Có ít nhất một gói sửa chữa ở SBX-A để mở chi tiết', !!firstPkg, 'nếu FAIL: tạo gói bằng giao diện (xem docs/knowledge-space/03)')
  await go(page, `/sup/proposals/${firstPkg}`, 10000)
  t = await bodyText(page, 'main', 3000)
  check('W07 Giám sát KHÔNG thấy nút "Xuất hồ sơ gói" (BE: 403)', !has(t, /Xuất hồ sơ gói/), '')

  await go(page, '/sup/personnel', 9000)
  check('W01 Giám sát: có nút "Gửi lời mời nhân sự mới"', has(await bodyText(page, 'main', 4000), /Gửi lời mời nhân sự mới/), '')

  await go(page, '/sup/legal-hold', 12000)
  const open1 = await page.evaluate(() => { const els = [...document.querySelectorAll('main *')].filter((e) => /SBX-A/.test(e.textContent) && !/SBX-B/.test(e.textContent)); const el = els[els.length - 1]; let n = el; while (n && !(getComputedStyle(n).cursor === 'pointer')) n = n.parentElement; (n || el).click(); return true })
  await sleep(8000)
  t = await bodyText(page, '[role=dialog]', 3000)
  check('W10 modal lưu trữ có nút "Chạy đánh giá mới"', open1 && has(t, /Chạy đánh giá mới/), '')
  const w0 = log.writes.length
  await clickByText(page, /Chạy đánh giá mới/)
  await sleep(26000)
  check('W10 chạy đánh giá: POST retention/evaluations 202', log.writes.slice(w0).some((x) => /POST \/projects\/\{id\}\/retention\/evaluations 202/.test(x)), log.writes.slice(w0).join('; '))
  t = await bodyText(page, '[role=dialog]', 3000)
  check('W10 kết quả đánh giá hiển thị COMPLETE (BLOCKED_HOLD nếu dự án đang có phong tỏa)', has(t, /COMPLETE/), '')
  check('Giám sát: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// ---------- PM ----------
{
  const { browser, page, log } = await open(); await login(page, 'pm-a')

  await go(page, `/pm/projects/${PROJECT_A}`, 14000)
  let t = await bodyText(page, 'main', 4000)
  check('W02 PM: thẻ "Hoàn thành thi công" có nút Khai báo', has(t, /Khai báo hoàn thành thi công/), '')

  await go(page, '/pm/repair-batches/assign', 9000)
  t = await bodyText(page, 'main', 3000)
  check('W07 PM: màn giao việc hiển thị và có nút "Ban Hành Lệnh Giao Việc"', has(t, /Ban Hành Lệnh Giao Việc/), '')
  const sel = await page.evaluate(() => [...document.querySelectorAll('main select')][0]?.options.length || 0)
  check('W07 PM: danh sách hạng mục chờ giao đọc từ BE (select hợp lệ)', sel >= 1, `${sel} lựa chọn`)

  const pmPkg = (await apiGet(page, `/projects/${PROJECT_A}/repair-packages`)).body?.items?.[0]?.id
  await go(page, `/pm/proposals/${pmPkg}`, 12000)
  const w0 = log.writes.length
  check('W07 PM thấy nút "Xuất hồ sơ gói (PDF)"', has(await bodyText(page, 'main', 3000), /Xuất hồ sơ gói/), '')
  await clickByText(page, /Xuất hồ sơ gói/)
  await sleep(18000)
  const ws = log.writes.slice(w0).join('; ')
  check('W07 xuất hồ sơ: POST exports 202', /POST \/projects\/\{id\}\/exports 202/.test(ws), ws)
  const ex = await apiGet(page, `/projects/${PROJECT_A}/exports`)
  const newest = (ex.body?.items || []).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]
  check('W07 export mới nhất SUCCEEDED (đọc lại bằng GET)', newest?.status === 'SUCCEEDED', `status=${newest?.status}`)

  await go(page, '/pm/surveys', 10000)
  const nbtn = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent)).length)
  let found = false
  for (let i = 0; i < nbtn && !found; i++) {
    await page.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent))[i].click(), i)
    await sleep(8000)
    found = await page.evaluate(() => !!document.querySelector('[aria-label="Bản nộp bộ dữ liệu"]'))
    if (!found) { await clickByText(page, /Đóng lại/); await sleep(1000) }
  }
  check('W05 PM: nhiệm vụ SUBMITTED mở được panel bộ dữ liệu + "Chạy AI mock"', found && has(await bodyText(page, 'body', 20000), /Chạy AI mock/), '')

  await go(page, '/pm/fast-track', 12000)
  t = await bodyText(page, 'main', 3000)
  check('W08 PM: màn Fast Track render, không lỗi', t.length > 50, '')
  check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// ---------- Ẩn danh: link mời sai ----------
{
  const { browser, page, log } = await open()
  await page.goto(`${BASE}/auth/setup-password?token=invalid-token-for-test`, { waitUntil: 'networkidle2' })
  await sleep(5000)
  const t = await bodyText(page, 'body', 3000)
  check('W01 link mời sai: gọi POST /invitations/preview (không bị chặn ở client)', log.failures.some((x) => /POST \/invitations\/preview 404/.test(x)), log.failures.join('; ').slice(0, 200))
  check('W01 link mời sai: hiện màn "Token đã vô hiệu hóa"', has(t, /Token đã vô hiệu hóa|không còn hiệu lực/), '')
  await browser.close()
}

const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
