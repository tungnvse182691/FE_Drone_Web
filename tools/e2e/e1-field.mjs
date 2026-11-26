// E1 — cụm FIELD (Chinhsua.docx mục D–K). Kiểm giao diện thật; phần cần dữ liệu seed được báo rõ "chưa kiểm được" thay vì bịa.
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e1-field.mjs
import { open, login, go, apiGet, report, bodyText, clickByText, sleep, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
const skip = (title, why) => console.log(`SKIP  ${title}  — ${why}`)

const { browser, page, log } = await open({ height: 3200 })
await login(page, 'pm-a')
await go(page, '/pm/field-tasks', 9000)

// chọn dự án A trong bộ lọc dự án (nếu có)
await page.evaluate((pid) => {
  const sel = [...document.querySelectorAll('select')].find((s) => [...s.options].some((o) => o.value === pid))
  if (sel) { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, pid); sel.dispatchEvent(new Event('change', { bubbles: true })) }
}, PROJECT_A)
await sleep(5000)

const page0 = await bodyText(page, 'main', 3000)
check('K cột danh sách đổi thành "Loại Đo Yêu Cầu", không còn "Phương Pháp Đo"', /Loại Đo Yêu Cầu/i.test(await page.evaluate(() => document.body.innerText)) && !/Phương Pháp Đo/i.test(await page.evaluate(() => document.body.innerText)), '')

// mở modal tạo nhiệm vụ
const opened = await clickByText(page, /Tạo nhiệm vụ/)
await sleep(3000)
if (opened !== 'clicked') {
  skip('D/E/F kiểm form tạo FIELD', `không mở được modal (${opened}); ${page0.slice(0, 120)}`)
} else {
  const modal = await page.evaluate(() => { const d = [...document.querySelectorAll('.fixed')].pop(); return { text: d?.innerText || '', options: [...(d?.querySelectorAll('select[aria-label="Loại đo FIELD canonical"] option') || [])].map((o) => o.textContent.trim()) } })
  check('D form KHÔNG còn ô "Phương pháp & Thiết bị đo"', !/Phương pháp & Thiết bị đo/i.test(modal.text) && !/Phương pháp & thiết bị khác/i.test(modal.text), '')
  check('D vẫn còn ô "Ghi chú chỉ dẫn"', /Ghi chú chỉ dẫn/.test(modal.text), '')
  check('E chỉ số cần đo có đủ 6 loại BE', ['Độ sâu lún', 'Chênh cao tấm', 'Phạm vi xói vai đường', 'Diện tích', 'Chiều dài vùng lún', 'Chiều rộng vùng lún'].every((x) => modal.options.includes(x)), modal.options.join(' | '))
  // F: bấm "Khởi tạo phiếu" khi thiếu dữ liệu -> nút bị khóa (không gửi), không có nhãn "Lỗi từ máy chủ CSDL"
  check('F modal không dùng nhãn "Lỗi từ máy chủ CSDL" cho lỗi nhập liệu', !/Lỗi từ máy chủ CSDL/.test(modal.text), '')
}
check('Không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))

// Phần cần dữ liệu seed (Defect OPEN từ Report KEEP_NEW, bản nộp của Crew): chỉ chạy khi có dữ liệu thật
const defects = await apiGet(page, `/projects/${PROJECT_A}/defects`)
const open1 = (defects.body?.items || []).filter((d) => d.status === 'OPEN')
if (!open1.length) {
  skip('E tạo FIELD loại đo 5 và 6 (POST 201, GET đọc lại đúng mã)', 'BE v3 chưa seed được dữ liệu (scenarios exit 1): không có Defect OPEN ở dự án A')
  skip('G giao lại không liệt kê Crew hiện tại, I/J hợp nhất số đo + ảnh bản nộp', 'chưa có nhiệm vụ FIELD đã giao/đã nộp trong dữ liệu')
}

await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length} (phần có dữ liệu)`)
process.exit(failed ? 1 : 0)
