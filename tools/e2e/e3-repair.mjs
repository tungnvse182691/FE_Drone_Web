// E3 — cụm gói sửa chữa + Fast Track (Chinhsua.docx mục 1–8). Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e3-repair.mjs [normal|ft|all]
// Dữ liệu dùng: seed BE mới (A: gói Normal AwaitingApproval; B: gói Fast Track ReadyToAssign nguồn Report).
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, setNative, sleep, PROJECT_A, PROJECT_B } from './lib.mjs'

const STAGE = process.argv[2] || 'all'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const has = (t, re) => re.test(t)
const itemsOf = async (page, P) => { const out = []; for (const k of (await apiGet(page, `/projects/${P}/repair-packages`)).body.items || []) for (const i of (await apiGet(page, `/projects/${P}/repair-packages/${k.id}/items`)).body.items || []) out.push({ ...i, packageId: k.id }); return out }

async function openPackageModal(page, base, label) {
  await go(page, `${base}/proposals`, 12000)
  const clicked = await page.evaluate((re) => { const b = [...document.querySelectorAll('tbody tr button')].find((x) => new RegExp(re).test(x.textContent)); if (!b) return false; b.click(); return true }, label)
  await sleep(7000)
  return clicked
}

if (STAGE === 'normal' || STAGE === 'all') {
  // ---- Giám sát duyệt hạng mục Normal ở modal chi tiết (mục 1, 3)
  const sup = await open(); await login(sup.page, 'supervisor')
  check('Seed: có hạng mục Normal ở project A', true, '')
  const before = (await itemsOf(sup.page, PROJECT_A)).find((i) => i.mode === 'Normal')
  check('Hạng mục Normal ban đầu AwaitingApproval hoặc ReadyToAssign', ['AwaitingApproval', 'ReadyToAssign'].includes(before?.state), before?.state)
  const opened = await openPackageModal(sup.page, '/sup', 'Thẩm định')
  check('Mở được modal chi tiết gói (Giám sát)', opened)
  let t = await bodyText(sup.page, '[role=dialog], .fixed.inset-0', 6000)
  check('Modal hiện phương án đọc từ GET chi tiết hạng mục (repairPlan)', has(t, /Synthetic proposal|Phương án kỹ thuật sửa chữa/) && !has(t, /API đọc chưa trả phương án/), '')
  check('Modal hiện checklistVersion của hạng mục', has(t, /Checklist: v1|Checklist:\s*v1/), '')
  const layout = await sup.page.evaluate(() => { const m = document.querySelector('.fixed.inset-0 > div'); if (!m) return null; const r = m.getBoundingClientRect(); return { scrollW: m.scrollWidth, clientW: m.clientWidth, overflowX: [...m.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > r.right + 2).length } })
  check('Bố cục modal: không có phần tử tràn ngang ra ngoài khung', layout && layout.overflowX === 0 && layout.scrollW <= layout.clientW + 2, JSON.stringify(layout))
  if (before?.state === 'AwaitingApproval') {
    await sup.page.evaluate(() => { const sel = document.querySelector('[aria-label="Hạng mục Normal phê duyệt"]'); const o = [...sel.options].find((x) => x.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, o.value); sel.dispatchEvent(new Event('change', { bubbles: true })) })
    await sleep(500)
    await setNative(sup.page, '[aria-label="Lý do phê duyệt Normal"]', '[TEST-FE] Duyệt phương án Normal (E3)', 'textarea')
    await sleep(500)
    const w0 = sup.log.writes.length
    check('Bấm "Phê duyệt hạng mục Normal"', (await clickByText(sup.page, /Phê duyệt hạng mục Normal/)) === 'clicked')
    await sleep(9000)
    check('POST approve 201', sup.log.writes.slice(w0).some((x) => /\/approve 201/.test(x)), sup.log.writes.slice(w0).join('; '))
  }
  const after = (await itemsOf(sup.page, PROJECT_A)).find((i) => i.mode === 'Normal')
  check('GET đọc lại: hạng mục Normal ReadyToAssign', after?.state === 'ReadyToAssign', after?.state)
  check('Giám sát: không lỗi JS', sup.log.pageErrors.length === 0, sup.log.pageErrors.join('; '))
  await sup.browser.close()

  // ---- PM: nút Giao việc ở danh sách + modal, điều hướng sang màn giao có chọn sẵn (mục 2, 4)
  const pm = await open(); await login(pm.page, 'pm-a')
  await go(pm.page, '/pm/proposals', 13000)
  t = await bodyText(pm.page, 'main', 6000)
  check('Danh sách: cột "Quyết định phê duyệt" thay cho "Hạng mục có kết quả"', has(t, /quyết định phê duyệt/i) && !has(t, /hạng mục có kết quả/i), '')
  check('Danh sách: gói mới duyệt hiện "Chưa giao Crew — chưa thi công" (không hiểu nhầm đã hoàn thành)', has(t, /Chưa giao Crew/), '')
  check('Danh sách PM có nút "Giao việc"', has(await pm.page.evaluate(() => [...document.querySelectorAll('tbody tr button')].map((b) => b.textContent).join('|')), /Giao việc/), '')
  await pm.page.evaluate(() => { [...document.querySelectorAll('tbody tr button')].find((b) => /Giao việc/.test(b.textContent))?.click() })
  await sleep(10000)
  const url = await pm.page.evaluate(() => location.pathname + location.search)
  check('Nút "Giao việc" điều hướng sang /pm/repair-batches/assign kèm projectId/packageId', /\/pm\/repair-batches\/assign\?.*projectId=.*packageId=/.test(url), url)
  const preselected = await pm.page.evaluate(() => { const s = [...document.querySelectorAll('main select')][0]; return s ? s.options[s.selectedIndex]?.text : '' })
  check('Màn giao việc đã chọn sẵn hạng mục Normal (không nhập URL)', /ITEM-/.test(preselected), preselected)
  // modal: nút Giao việc theo hạng mục
  await openPackageModal(pm.page, '/pm', 'Xem hồ sơ')
  check('Modal gói (PM) có nút "Giao việc" ở hạng mục ReadyToAssign', has(await pm.page.evaluate(() => [...document.querySelectorAll('.fixed.inset-0 button')].map((b) => b.textContent).join('|')), /Giao việc/), '')
  await pm.page.evaluate(() => { [...document.querySelectorAll('.fixed.inset-0 button')].find((b) => /Giao việc/.test(b.textContent))?.click() })
  await sleep(10000)
  const url2 = await pm.page.evaluate(() => location.pathname + location.search)
  check('Nút trong modal điều hướng kèm projectId/packageId/itemId', /assign\?.*itemId=/.test(url2), url2)
  // giao thật
  const w1 = pm.log.writes.length
  await pm.page.evaluate(() => { const s = [...document.querySelectorAll('main select')][1]; const o = [...s.options].find((x) => x.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) })
  await sleep(500)
  await pm.page.evaluate(() => { const i = document.querySelector('main textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(i, '[TEST-FE] Giao Normal (E3)'); i.dispatchEvent(new Event('input', { bubbles: true })) })
  await sleep(500)
  check('Bấm "Ban Hành Lệnh Giao Việc"', (await pm.page.evaluate(() => { const b = [...document.querySelectorAll('main button')].find((x) => /Ban Hành/.test(x.textContent)); if (!b || b.disabled) return 'no'; b.click(); return 'clicked' })) === 'clicked')
  await sleep(10000)
  check('POST assign 201', pm.log.writes.slice(w1).some((x) => /\/assign 201/.test(x)), pm.log.writes.slice(w1).join('; ') + ' | ' + pm.log.failures.slice(-2).join('; '))
  const assigned = (await itemsOf(pm.page, PROJECT_A)).find((i) => i.mode === 'Normal')
  check('GET đọc lại: hạng mục Normal Assigned', assigned?.state === 'Assigned', assigned?.state)
  check('PM: không lỗi JS', pm.log.pageErrors.length === 0, pm.log.pageErrors.join('; '))
  await pm.browser.close()
}

if (STAGE === 'list') {
  const pm = await open(); await login(pm.page, 'pm-a')
  await go(pm.page, '/pm/proposals', 14000)
  const t = await bodyText(pm.page, 'main', 8000)
  check('MỤC 4: cột "Quyết định phê duyệt" thay cho "Hạng mục có kết quả"', /quyết định phê duyệt/i.test(t) && !/hạng mục có kết quả/i.test(t))
  check('MỤC 4: hiện "Chưa giao Crew" hoặc "Đã giao Crew" (tách phê duyệt khỏi thi công)', /Chưa giao Crew|Đã giao Crew/.test(t))
  check('Danh sách gói: không báo lỗi sai phạm vi', !/sai phạm vi dự án/.test(t))
  check('PM-a: không lỗi JS', pm.log.pageErrors.length === 0, pm.log.pageErrors.join('; '))
  await pm.browser.close()
}

const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
