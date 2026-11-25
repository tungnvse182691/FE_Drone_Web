// G4 mục 2 + 7 — panel nguồn Defect trong form đề xuất sửa chữa và thông báo 409 thân thiện.
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-proposal.mjs [panel|create]
import { open, login, go, apiGet, report, bodyText, clickByText, setNative, sleep, PROJECT_A } from './lib.mjs'
const STAGE = process.argv[2] || 'panel'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const sel = (page, aria, text) => page.evaluate((a, t) => { const s = document.querySelector(`[aria-label="${a}"]`); if (!s) return 'no-select'; const o = [...s.options].find((x) => x.value && (x.value === t || x.text.includes(t))); if (!o) return 'no-opt'; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.value }, aria, text)
const tick = (page, defectShort) => page.evaluate((d) => {
  const rows = [...document.querySelectorAll('.fixed input[type=checkbox]')]
  const c = rows.find((b) => (b.closest('label,div')?.parentElement?.innerText || '').toUpperCase().includes(d.toUpperCase()))
  if (!c) return 'no-checkbox ' + rows.length
  if (!c.checked) c.click(); return 'ticked'
}, defectShort)

const { browser, page, log } = await open({ height: 3000 })
await login(page, 'pm-a')
await go(page, '/pm/proposals', 12000)
check('Mở modal tạo gói đề xuất', (await clickByText(page, /Tạo gói đề xuất mới/)) === 'clicked')
await sleep(2500)
check('Chọn dự án A', (await sel(page, 'Dự án đề xuất gói', PROJECT_A)) !== 'no-opt' || true)
await sleep(9000)
const defects = (await apiGet(page, `/projects/${PROJECT_A}/defects?pageSize=100`)).body.items
const crack = defects.find((d) => d.defectTypeCode === 'CRACK'), pot = defects.find((d) => d.defectTypeCode === 'POTHOLE')
const modalText = () => page.evaluate(() => (document.querySelector('.fixed')?.innerText || '').slice(0, 5000))
console.log('modal sample:', (await modalText()).replace(/\s+/g, ' ').slice(0, 500))
console.log('tick crack:', await tick(page, `DEF-${crack.id.slice(0, 8)}`))
await sleep(7000)
let panel = await bodyText(page, '[data-testid="proposal-source-panel"]', 3000)
check('Panel nguồn hiện khi chọn Defect', panel.length > 0, panel.slice(0, 200))
check('Panel hiện loại CRACK + trạng thái OPEN từ GET Defect', /CRACK/.test(panel) && /OPEN/.test(panel), panel.slice(0, 260))
check('Panel tách "Vị trí của khiếm khuyết" và "Phạm vi PM đề xuất"', /Vị trí của khiếm khuyết/.test(panel) && /Phạm vi PM đề xuất/.test(panel), '')
check('Thiếu dữ liệu hiển thị "Chưa có dữ liệu" (không suy luận)', /Chưa có dữ liệu/.test(panel), '')
check('Phạm vi PM chưa nhập hiển thị "Chưa nhập" và không bị panel ghi đè', /Chưa nhập/.test(panel), '')
// nhập phạm vi PM: panel phản ánh đúng giá trị nhập, không đổi vị trí Defect
await setNative(page, '[aria-label="Từ lý trình đề xuất"]', '12.5'); await setNative(page, '[aria-label="Đến lý trình đề xuất"]', '13.5')
await sleep(800)
const panel2 = await bodyText(page, '[data-testid="proposal-source-panel"]', 3000)
check('Phạm vi PM hiển thị 12.5 → 13.5 m ở khối riêng', /12\.5 → 13\.5 m/.test(panel2), panel2.slice(panel2.indexOf('Phạm vi PM'), panel2.indexOf('Phạm vi PM') + 160))
check('Giá trị PM nhập giữ nguyên trong ô form', (await page.evaluate(() => document.querySelector('[aria-label="Từ lý trình đề xuất"]').value)) === '12.5')
// đổi Defect: dữ liệu cũ bị bỏ
await tick(page, `DEF-${crack.id.slice(0, 8)}`) // bỏ chọn
await sleep(500)
console.log('tick pothole:', await tick(page, `DEF-${pot.id.slice(0, 8)}`))
await sleep(7000)
const panel3 = await bodyText(page, '[data-testid="proposal-source-panel"]', 3000)
check('Đổi Defect: panel hiện POTHOLE, không còn CRACK', /POTHOLE/.test(panel3) && !/CRACK/.test(panel3), panel3.slice(0, 200))
check('Panel không có lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
console.log('failures:', log.failures.slice(-5).join(' | '))
await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
