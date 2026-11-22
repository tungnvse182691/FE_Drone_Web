// E3 — Fast Track (mục 6, 7, 8). Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e3-ft.mjs <policy|coverage|dispatch>
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, setNative, sleep, PROJECT_B } from './lib.mjs'
const STAGE = process.argv[2] || 'policy'
const results = []
const check = (title, ok, detail = '') => { results.push(ok); report(title, ok, detail) }
const has = (t, re) => re.test(t)
const DEFECT = process.env.FT_DEFECT || '', LAST = !!process.env.FT_LAST
const P = process.env.FT_PROJECT || PROJECT_B, PM = process.env.FT_PM || 'pm-b', TYPE = process.env.FT_TYPE || 'POTHOLE', SCOPE = process.env.FT_SCOPE || '', SRC = new RegExp(process.env.FT_SRC || 'Phản ánh người dân')

if (STAGE === 'policy') {
  const pm = await open({ height: 3400 }); await login(pm.page, PM)
  await go(pm.page, `/pm/fast-track?projectId=${P}`, 14000)
  const before = (await apiGet(pm.page, `/projects/${P}/repair-policies`)).body.items?.length || 0
  check('Mở bảng soạn chính sách', (await clickByText(pm.page, /Điều chỉnh chính sách/)) === 'clicked')
  await sleep(4000)
  const pick = (aria, text) => pm.page.evaluate((a, t) => { const s = document.querySelector(`[aria-label="${a}"]`); if (!s) return 'no-select'; const o = [...s.options].find((x) => x.value && (x.value === t || x.text.includes(t))); if (!o) return 'no-opt ' + [...s.options].map((x) => x.value).join(','); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.value }, aria, text)
  console.log('loại:', await pick('Loại hư hỏng chính sách', TYPE))
  await sleep(600)
  await setNative(pm.page, '[aria-label="Phiên bản checklist"]', 'v1')
  await pm.page.evaluate(() => { const c = document.querySelector('[aria-label="Áp dụng quy tắc DepressionDepth"]'); if (c && !c.checked) c.click() })
  await sleep(500)
  await setNative(pm.page, '[aria-label="Ngưỡng độ sâu tối đa"]', '50')
  await setNative(pm.page, '[aria-label="Căn cứ ban hành chính sách"]', '[TEST-FE] Chính sách Fast Track thử (E3)', 'textarea')
  await sleep(800)
  const w0 = pm.log.writes.length
  check('Bấm "Xuất bản chính sách"', (await clickByText(pm.page, /Xuất bản chính sách/)) === 'clicked')
  await sleep(14000)
  const ws = pm.log.writes.slice(w0).join('; ')
  check('POST drafts + publish thành công', /drafts 201/.test(ws) && /publish 201/.test(ws), ws + ' | ' + pm.log.failures.slice(-2).join('; '))
  const stillOpen = await pm.page.evaluate(() => !!document.querySelector('[aria-label="Phiên bản checklist"]'))
  check('MỤC 8: bảng nhập tự đóng sau khi công bố', !stillOpen)
  const after = (await apiGet(pm.page, `/projects/${P}/repair-policies`)).body.items || []
  check('GET: có revision đã xuất bản', after.length > before, `${before} → ${after.length}`)
  check('PM-b: không lỗi JS', pm.log.pageErrors.length === 0, pm.log.pageErrors.join('; '))
  await pm.browser.close()
}

if (STAGE === 'coverage') {
  const sup = await open({ height: 4200 }); await login(sup.page, 'supervisor')
  await go(sup.page, `/sup/fast-track?projectId=${P}`, 14000)
  check('Mở modal phê duyệt độ phủ', (await clickByText(sup.page, /Phê duyệt độ phủ tuyến/)) === 'clicked')
  await sleep(4000)
  const fileInput = await sup.page.$('[data-testid="handover-attach-file"]')
  if (fileInput) {
    await fileInput.uploadFile(decodeURIComponent(new URL('./fixtures/test-handover.pdf', import.meta.url).pathname).replace(/^\//, ''))
    await setNative(sup.page, '[aria-label="Số hiệu văn bản bàn giao"]', 'TEST-FE-BB-E3')
    await setNative(sup.page, '[aria-label="Ngày bàn giao thực tế"]', '2026-10-01')
    await sleep(800)
    const w = sup.log.writes.length
    check('Gắn biên bản bàn giao', (await clickByText(sup.page, /Gắn biên bản bàn giao/)) === 'clicked')
    await sup.page.waitForFunction(() => !document.querySelector('[data-testid="handover-attach-card"]') || /Đã gắn biên bản/.test(document.body.innerText), { timeout: 90000 }).catch(() => {})
    await sleep(2000)
    check('Biên bản được gắn (POST handover-documents 2xx)', sup.log.writes.slice(w).some((x) => /handover-documents 20\d/.test(x)), sup.log.writes.slice(w).join('; ') + ' | ' + sup.log.failures.slice(-2).join('; '))
  }
  const cov0 = (await apiGet(sup.page, `/projects/${P}/road-coverage`)).body
  check('Độ phủ có nguồn HANDOVER', (cov0.sources || []).some((x) => x.kind === 'HANDOVER'), JSON.stringify((cov0.sources || []).map((x) => x.kind)))
  const pickByLabel = (label, want = '') => sup.page.evaluate((l, w, last) => { const lab = [...document.querySelectorAll('.fixed label')].find((x) => x.textContent.trim().startsWith(l)); const s = lab?.querySelector('select'); if (!s) return 'no-select ' + l; const m = [...s.options].filter((x) => x.value && (!w || x.text.includes(w))); const o = last ? m[m.length - 1] : m[0]; if (!o) return 'no-option ' + l; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.text.slice(0, 50) }, label, want, LAST)
  console.log('phạm vi:', await pickByLabel('Phạm vi nghĩa vụ', SCOPE)); await sleep(800)
  console.log('bàn giao:', await pickByLabel('Hồ sơ bàn giao đã chấp nhận')); await sleep(500)
  console.log('nguồn:', await pickByLabel('Nguồn bảo hành / bảo trì')); await sleep(500)
  await setNative(sup.page, '[aria-label="Ngày bắt đầu độ phủ"]', '2026-10-01')
  await setNative(sup.page, '[aria-label="Ngày kết thúc độ phủ"]', '2027-12-31')
  await setNative(sup.page, '[aria-label="Ý kiến xác nhận độ phủ"]', '[TEST-FE] Xác nhận độ phủ thử nghiệm (E3)', 'textarea')
  await sleep(800)
  const w2 = sup.log.writes.length
  const r = await clickByText(sup.page, /Xác nhận phê duyệt độ phủ/)
  check('Bấm "Xác nhận phê duyệt độ phủ"', r === 'clicked', r)
  await sleep(12000)
  check('POST road-coverage 2xx', sup.log.writes.slice(w2).some((x) => /road-coverage 20\d/.test(x)), sup.log.writes.slice(w2).join('; ') + ' | ' + sup.log.failures.slice(-2).join('; '))
  const cov = (await apiGet(sup.page, `/projects/${P}/road-coverage`)).body
  check('GET: lịch sử độ phủ có bản xác nhận', (cov.history || []).length >= 1, `${(cov.history || []).length}`)
  check('Giám sát: không lỗi JS', sup.log.pageErrors.length === 0, sup.log.pageErrors.join('; '))
  await sup.browser.close()
}

if (STAGE === 'dispatch') {
  const pm = await open({ height: 4200 }); await login(pm.page, PM)
  await go(pm.page, `/pm/fast-track?projectId=${P}`, 16000)
  const selected = await pm.page.evaluate((want) => { const boxes = [...document.querySelectorAll('main input[type=checkbox]')]; const c = boxes.find((b) => { const t = b.closest('div.relative')?.innerText || ''; return /· FT/.test(t) && (!want || t.includes('DEF-' + want)) }) || boxes.pop(); if (!c) return false; if (!c.checked) c.click(); return true }, DEFECT)
  check('Chọn hạng mục Fast Track trong bảng điều phối', selected)
  await sleep(1500)
  const btn = await clickByText(pm.page, /Phát lệnh xử lý nhanh/)
  check('Mở modal "Phát lệnh xử lý nhanh"', btn === 'clicked', btn)
  await sleep(9000)
  const modalText = await bodyText(pm.page, '.fixed.inset-0', 4000)
  const srcOptions = await pm.page.evaluate(() => { const s = document.querySelector('[aria-label="Hồ sơ nguồn giao việc"]'); return s ? [...s.options].map((o) => o.text) : null })
  check('MỤC 6: ô "Hồ sơ nguồn" có nguồn dựng từ BE (không còn trống)', !!srcOptions && srcOptions.some((t) => SRC.test(t)), JSON.stringify(srcOptions))
  const pol = await pm.page.evaluate(() => { const s = document.querySelector('[aria-label="Chính sách giao việc"]'); return s ? [...s.options].map((o) => o.text) : null })
  check('Danh sách chính sách có revision đã xuất bản khớp checklist', !!pol && pol.length > 1, JSON.stringify(pol))
  const choose = (aria, pickIdx = 1) => pm.page.evaluate((a, i) => { const s = document.querySelector(`[aria-label="${a}"]`); if (!s) return 'no-select ' + a; const o = [...s.options].filter((x) => x.value && x.value !== '0')[0]; if (!o) return 'no-option ' + a; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.text }, aria, pickIdx)
  console.log('chính sách:', await choose('Chính sách giao việc')); await sleep(500)
  console.log('nguồn:', await choose('Hồ sơ nguồn giao việc')); await sleep(800)
  const typeOpts = await pm.page.evaluate(() => { const s = document.querySelector('[aria-label="Loại số đo giao việc"]'); return s ? { disabled: s.disabled, options: [...s.options].map((o) => o.value + ':' + o.text) } : null })
  check('Loại đo yêu cầu chọn được và có đủ mã 1–6', !!typeOpts && !typeOpts.disabled && [1, 2, 3, 4, 5, 6].every((c) => typeOpts.options.some((o) => o.startsWith(c + ':'))), JSON.stringify(typeOpts))
  console.log('loại đo:', await pm.page.evaluate((v) => { const s = document.querySelector('[aria-label="Loại số đo giao việc"]'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, v); s.dispatchEvent(new Event('change', { bubbles: true })); return s.value }, process.env.MTYPE || '1'))
  console.log('crew:', await choose('Crew giao việc'))
  const due = new Date(Date.now() + 3 * 86400000); due.setSeconds(0, 0)
  const local = new Date(due.getTime() - due.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  await setNative(pm.page, '[aria-label="Hạn hoàn thành giao việc"]', local)
  await setNative(pm.page, '[aria-label="Mô tả phạm vi giao việc"]', '[TEST-FE] Đo chiều dài vùng lún (E3)', 'textarea')
  await setNative(pm.page, '[aria-label="Chỉ đạo giao việc"]', '[TEST-FE] Giao Fast Track nguồn Report (E3)', 'textarea')
  await sleep(1500)
  const formErr = await pm.page.evaluate(() => [...document.querySelectorAll('.fixed [role=alert]')].map((e) => e.innerText).join(' | '))
  console.log('cảnh báo form:', formErr || '(không)')
  const w = pm.log.writes.length
  const go2 = await clickByText(pm.page, /Xác nhận phát lệnh/)
  check('Bấm "Xác nhận phát lệnh"', go2 === 'clicked', go2)
  await sleep(14000)
  const ws = pm.log.writes.slice(w).join('; ')
  check('POST assign 201 (không bị chặn bởi nguồn)', /\/assign 20\d/.test(ws), ws + ' | ' + pm.log.failures.slice(-3).join('; '))
  const items = []
  for (const k of (await apiGet(pm.page, `/projects/${P}/repair-packages`)).body.items || []) for (const i of (await apiGet(pm.page, `/projects/${P}/repair-packages/${k.id}/items`)).body.items || []) items.push(i)
  const ft = items.find((i) => i.mode === 'FastTrack')
  check('GET đọc lại: hạng mục Fast Track không còn ReadyToAssign', !!ft && ft.state !== 'ReadyToAssign', ft?.state)
  const tasks = (await apiGet(pm.page, `/projects/${P}/field-inspection-tasks`)).body.items || []
  const t = tasks.find((x) => x.sourceKind === (process.env.FT_KIND || 'REPORTER'))
  const detail = t ? (await apiGet(pm.page, `/projects/${P}/field-inspection-tasks/${t.id}`)).body : null
  check('GET nhiệm vụ Crew: sourceKind đúng nguồn, requiredMeasurementType đúng loại đã chọn', detail?.sourceKind === (process.env.FT_KIND || 'REPORTER') && detail?.requiredMeasurementType === Number(process.env.MTYPE || '1'), JSON.stringify({ sk: detail?.sourceKind, rmt: detail?.requiredMeasurementType, mode: detail?.mode }))
  check('PM-b: không lỗi JS', pm.log.pageErrors.length === 0, pm.log.pageErrors.join('; '))
  await pm.browser.close()
}

// Nhánh SURVEY + form tạo gói MỘT ô phương án (mục 5, 6). Dùng project A: KEEP_NEW phát hiện AI → tạo gói Fast Track qua UI → chính sách → độ phủ → giao.
const A = '72f84201-c001-4000-8000-000000000001'
if (STAGE === 'survey-setup') {
  const pm = await open({ height: 4200 }); await login(pm.page, 'pm-a')
  const runs = (await apiGet(pm.page, `/projects/${A}/ai-mock-runs`)).body.items || []
  let det, runRow
  for (const r of runs) { const res = (await apiGet(pm.page, `/projects/${A}/ai-mock-runs/${r.id}/result`)).body; det = (res.detections || [])[0]; if (det) { runRow = r; break } }
  check('Seed có phát hiện AI', !!det, det?.detectionId)
  const cand = (await apiGet(pm.page, `/projects/${A}/candidates?sourceKind=AI_DETECTION&sourceId=${det.detectionId}`))
  check('GET candidates (AI_DETECTION)', cand.status === 200, `status ${cand.status} ${JSON.stringify(cand.body).slice(0, 160)}`)
  const route = (await apiGet(pm.page, `/datasets/${runRow.datasetId}`)).body.scope[0].routeVersionId
  const dec = await apiSend(pm.page, 'POST', `/projects/${A}/candidate-decisions`, { sourceKind: 'AI_DETECTION', sourceId: det.detectionId, sourceVersion: cand.body.source?.version, geometryVersion: cand.body.geometryVersion, decision: 'KEEP_NEW', reason: '[TEST-FE] KEEP_NEW phát hiện AI để thử nguồn SURVEY (E3)', classification: { defectTypeCode: det.typeCode || 'CRACK', severity: 'LOW', roadSectionVersionId: route } })
  check('POST candidate-decisions KEEP_NEW 201', dec.status === 201, `status ${dec.status} ${JSON.stringify(dec.body).slice(0, 200)}`)
  await pm.browser.close()
}
if (STAGE === 'survey-package') {
  const pm = await open({ height: 4200 }); await login(pm.page, 'pm-a')
  await go(pm.page, `/pm/proposals?projectId=${A}`, 13000)
  check('Mở form "Tạo gói đề xuất mới"', (await clickByText(pm.page, /Tạo gói đề xuất mới/)) === 'clicked')
  await sleep(6000)
  const txt = await bodyText(pm.page, '.fixed.inset-0', 8000)
  check('MỤC 5: không còn ô "Phương án kỹ thuật xử lý" dưới khiếm khuyết', !/phương án kỹ thuật xử lý/i.test(txt))
  check('MỤC 5: chỉ còn nhãn "Phương án kỹ thuật sửa chữa" (không "tổng quát")', /phương án kỹ thuật sửa chữa/i.test(txt) && !/tổng quát/i.test(txt))
  const plans = await pm.page.evaluate(() => [...document.querySelectorAll('.fixed.inset-0 textarea, .fixed.inset-0 input[type=text]')].filter((e) => /phương án/i.test((e.getAttribute('aria-label') || '') + (e.placeholder || ''))).length)
  check('MỤC 5: đúng 1 ô nhập phương án trong form', plans === 1, `${plans} ô`)
  await pm.page.evaluate(() => { const s = document.querySelector('[aria-label="Luồng đề xuất sửa chữa"]'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'FAST_TRACK'); s.dispatchEvent(new Event('change', { bubbles: true })) })
  await sleep(800)
  const defectPicked = await pm.page.evaluate((want) => { const rows = [...document.querySelectorAll('.fixed.inset-0 input[type=checkbox]')]; const target = (want ? rows.find((c) => (c.closest('div.p-3')?.innerText || '').includes('DEF-' + want)) : rows.find((c) => /CRACK|Nứt/i.test(c.closest('div.p-3')?.innerText || ''))) || rows[rows.length - 1]; if (!target) return 'none'; target.click(); return (target.closest('div.p-3')?.innerText || '').slice(0, 60) }, DEFECT)
  console.log('khiếm khuyết chọn:', defectPicked)
  await sleep(4000)
  await setNative(pm.page, '[aria-label="Căn cứ đề xuất gói"]', '[TEST-FE] Căn cứ đề xuất gói SURVEY (E3)')
  for (const [a, v] of [['Từ lý trình đề xuất', '5'], ['Đến lý trình đề xuất', '6'], ['Độ lệch từ đề xuất', '0'], ['Độ lệch đến đề xuất', '1']]) await setNative(pm.page, `[aria-label="${a}"]`, v)
  await setNative(pm.page, '[aria-label="Checklist phương án đề xuất"]', 'v1')
  await setNative(pm.page, '[aria-label="Phương án đề xuất gói"]', '[TEST-FE] Phương án DUY NHẤT: trám nứt và hoàn trả mặt đường (E3)', 'textarea')
  await sleep(1000)
  const w = pm.log.writes.length
  const btn = await clickByText(pm.page, /Đề xuất hạng mục và GET xác nhận/)
  check('Bấm "Đề xuất hạng mục và GET xác nhận"', btn === 'clicked', btn)
  await sleep(14000)
  const ws = pm.log.writes.slice(w).join('; ')
  check('POST repair-packages + items thành công', /repair-packages 20\d/.test(ws) && /items 20\d/.test(ws), ws + ' | ' + pm.log.failures.slice(-2).join('; '))
  const pk = (await apiGet(pm.page, `/projects/${A}/repair-packages`)).body.items || []
  let found
  for (const k of pk) for (const i of (await apiGet(pm.page, `/projects/${A}/repair-packages/${k.id}/items`)).body.items || []) if (i.mode === 'FastTrack') { found = { ...i, packageId: k.id } }
  check('GET: có hạng mục FastTrack mới ReadyToAssign', found?.state === 'ReadyToAssign', found?.state)
  const detail = found ? (await apiGet(pm.page, `/projects/${A}/repair-packages/${found.packageId}/items/${found.id}`)).body : null
  check('GET chi tiết: repairPlan đúng nội dung một ô đã nhập', /Phương án DUY NHẤT/.test(detail?.repairPlan || ''), detail?.repairPlan)
  check('PM-a: không lỗi JS', pm.log.pageErrors.length === 0, pm.log.pageErrors.join('; '))
  await pm.browser.close()
}

// Mục 7 — Fast Track sau chuyển nghĩa vụ A → B (KHÔNG HOÀN TÁC; chỉ chạy trên stack test).
if (STAGE === 'transfer') {
  const B = PROJECT_B
  const pm = await open(); await login(pm.page, 'pm-a')
  const pk = async (path, body, h) => apiSend(pm.page, 'POST', path, body, h)
  // Dựng gói Fast Track mới cho một khiếm khuyết Report (CRACK) đang chưa có gói, phạm vi 7–8 m.
  const defects = (await apiGet(pm.page, `/projects/${A}/defects`)).body.items
  const wp = (await apiGet(pm.page, `/projects/${A}/work-package`)).body
  const withPackage = new Set()
  for (const k of (await apiGet(pm.page, `/projects/${A}/repair-packages`)).body.items) withPackage.add(k.defectId)
  const defect = defects.find((d) => !withPackage.has(d.id))
  check('Có khiếm khuyết chưa có gói để dựng nghĩa vụ chuyển', !!defect, defect?.id)
  const dRead = await apiGet(pm.page, `/projects/${A}/defects/${defect.id}`)
  const road = wp.roadSections.find((r) => r.currentVersionId === dRead.body.roadSectionVersionId) || wp.roadSections[0]
  const created = await pk(`/projects/${A}/repair-packages`, { defectId: defect.id, defectVersion: dRead.body.version, obligations: [{ kind: 'FORMAL_REPAIR', mandatory: true, scope: { physicalRoadId: road.roadSectionId, routeVersionId: dRead.body.roadSectionVersionId, segmentSetId: null, fromMeters: 7, toMeters: 8, offsetFromMeters: 0, offsetToMeters: 1 }, reason: '[TEST-FE] Nghĩa vụ để thử chuyển (E3)' }], reason: '[TEST-FE] Gói thử chuyển nghĩa vụ (E3)' }, { 'If-Match': `"${dRead.body.version}"` })
  check('POST repair-packages 201', created.status === 201, `${created.status} ${JSON.stringify(created.body).slice(0, 160)}`)
  const obligationId = created.body.unresolvedMandatoryObligationIds[0]
  const item = await pk(`/projects/${A}/repair-packages/${created.body.id}/items`, { obligationId, mode: 'FAST_TRACK', repairPlan: '[TEST-FE] Phương án (chuyển nghĩa vụ)', checklistVersion: 'v1', reason: '[TEST-FE] đề xuất' }, { 'If-Match': `"${created.body.version}"` })
  check('POST items FAST_TRACK 201', item.status === 201, `${item.status}`)
  await pm.browser.close()

  const sup = await open(); await login(sup.page, 'supervisor')
  const lcA = await apiGet(sup.page, `/projects/${A}/lifecycle`)
  const ob = (lcA.body.transferableObligations || []).find((o) => o.id === obligationId)
  check('Lifecycle A liệt kê nghĩa vụ chuyển được', !!ob, '')
  const lcAEtag = (await sup.page.evaluate(async (u) => (await fetch(u, { credentials: 'include' })).headers.get('etag'), `/api/v1/projects/${A}/lifecycle`))
  const issue = await apiSend(sup.page, 'POST', `/projects/${A}/lifecycle/obligation-transfers`, { reason: '[TEST-FE] Chuyển nghĩa vụ thử (E3)', evidenceFileIds: [], obligationId, receivingProjectId: B, scopeHash: ob.scopeHash }, { 'If-Match': lcAEtag })
  check('POST obligation-transfers 201', issue.status === 201, `${issue.status} ${JSON.stringify(issue.body).slice(0, 160)}`)
  const lcA2 = (await apiGet(sup.page, `/projects/${A}/lifecycle`)).body
  const act = (lcA2.actions || []).filter((a) => a.kind === 'IssueTransfer').pop()
  const lcBEtag = (await sup.page.evaluate(async (u) => (await fetch(u, { credentials: 'include' })).headers.get('etag'), `/api/v1/projects/${B}/lifecycle`))
  const acc = await apiSend(sup.page, 'POST', `/projects/${B}/lifecycle/obligation-transfer-acceptances`, { reason: '[TEST-FE] Tiếp nhận (E3)', evidenceFileIds: [], sourceActionId: act?.id, obligationId, scopeHash: ob.scopeHash }, { 'If-Match': lcBEtag })
  check('POST obligation-transfer-acceptances 201', acc.status === 201, `${acc.status} ${JSON.stringify(acc.body).slice(0, 160)}`)
  await sup.browser.close()

  const pb = await open({ height: 4200 }); await login(pb.page, 'pm-b')
  const lcB = (await apiGet(pb.page, `/projects/${B}/lifecycle`)).body
  const resp = (lcB.responsibilities || []).find((r) => r.obligationId === obligationId)
  check('Lifecycle B: responsibilities trả packageId + currentRepairItemId', !!resp?.packageId && !!resp?.currentRepairItemId, JSON.stringify(resp))
  const itemB = await apiGet(pb.page, `/projects/${B}/repair-packages/${resp?.packageId}/items/${resp?.currentRepairItemId}`)
  check('GET item dưới URL project B 200 (giữ projectId gốc A)', itemB.status === 200 && itemB.body?.projectId === A, `${itemB.status} projectId=${itemB.body?.projectId?.slice(-4)}`)
  await go(pb.page, `/pm/fast-track?projectId=${B}`, 16000)
  const txt = await bodyText(pb.page, 'main', 6000)
  check('MỤC 7: màn Fast Track của PM-B hiện hạng mục nhận chuyển (không báo "sai phạm vi")', /nhận chuyển/i.test(txt) && !/sai phạm vi dự án/.test(txt), txt.includes('sai phạm vi') ? 'có lỗi sai phạm vi' : '')
  const sel = await pb.page.evaluate(() => { const boxes = [...document.querySelectorAll('main input[type=checkbox]')]; const c = boxes.find((b) => /nhận chuyển/i.test(b.closest('div.relative')?.innerText || '')); if (!c) return false; if (!c.checked) c.click(); return true })
  check('Chọn thẻ hạng mục nhận chuyển', sel)
  await sleep(1500)
  await clickByText(pb.page, /Phát lệnh xử lý nhanh/)
  await sleep(10000)
  const modal = await bodyText(pb.page, '.fixed.inset-0', 5000)
  console.log('MODAL:', modal.slice(0, 1400))
  check('Modal nêu rõ nguồn Crew/chính sách thuộc dự án gốc', /dự án gốc|dự án nguồn/i.test(modal), '')
  check('PM-B: không lỗi JS', pb.log.pageErrors.length === 0, pb.log.pageErrors.join('; '))
  console.log('failures:', pb.log.failures.filter((f) => !/ai-candidates/.test(f)).join(' ; ').slice(0, 700))
  await pb.browser.close()
}

if (STAGE === 'transfer-view') {
  const B = PROJECT_B
  const pb = await open({ height: 4200 }); await login(pb.page, 'pm-b')
  await go(pb.page, `/pm/fast-track?projectId=${B}`, 18000)
  const txt = await bodyText(pb.page, 'main', 6000)
  check('MỤC 7: màn Fast Track của PM-B không báo "sai phạm vi dự án"', !/sai phạm vi dự án/.test(txt))
  check('MỤC 7: hiện hạng mục nhận chuyển từ lifecycle (packageId/currentRepairItemId)', /nhận chuyển/i.test(txt), '')
  const sel = await pb.page.evaluate(() => { const boxes = [...document.querySelectorAll('main input[type=checkbox]')]; const c = boxes.find((b) => /nhận chuyển/i.test(b.closest('div.relative')?.innerText || '')); if (!c) return false; if (!c.checked) c.click(); return true })
  check('Chọn thẻ hạng mục nhận chuyển', sel)
  await sleep(1500)
  await clickByText(pb.page, /Phát lệnh xử lý nhanh/)
  await sleep(12000)
  const modal = await bodyText(pb.page, '.fixed.inset-0', 6000)
  console.log('MODAL:', modal.slice(0, 1800))
  check('Modal nêu rõ Crew/chính sách/nguồn thuộc dự án gốc', /dự án gốc|dự án nguồn/i.test(modal), '')
  check('Modal hiện lý do cụ thể (không báo thiếu chung chung)', /Không đọc được khiếm khuyết gốc|HTTP 40[34]/.test(modal), '')
  check('PM-B: không lỗi JS', pb.log.pageErrors.length === 0, pb.log.pageErrors.join('; '))
  await pb.browser.close()
}

const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
