// E7 (BE develop_ABC): surveyType/parentTaskId đọc từ BE, 409 survey_active_plan_conflict, PM đóng kế hoạch (POST /survey-plans/{id}/complete).
import { open, login, go, apiGet, apiSend, report, bodyText, clickByText, sleep, PROJECT_A } from './lib.mjs'
const results = []
const check = (t, ok, d) => { results.push(ok); report(t, ok, d) }
const { browser, page, log } = await open({ height: 3000 }); await login(page, 'pm-a')

const plans = (await apiGet(page, `/projects/${PROJECT_A}/survey-plans?limit=100`)).body?.items || []
const tasks = (await apiGet(page, `/projects/${PROJECT_A}/survey-tasks?limit=100`)).body?.items || []
console.log('   plans:', plans.map((p) => `${p.id.slice(0, 8)}:${p.status}:${p.surveyType}`).join(' '))
console.log('   tasks:', tasks.map((t) => `${t.id.slice(0, 8)}:${t.status}:${t.surveyType}:parent=${t.parentTaskId?.slice(0, 8) || '-'}`).join(' '))
check('BE trả surveyType cho kế hoạch', plans.length > 0 && plans.every((p) => 'surveyType' in p), '')
check('BE trả surveyType cho nhiệm vụ', tasks.length > 0 && tasks.every((t) => 'surveyType' in t), '')

// Setup (API được phép): đánh giá PASS cho bản nộp đầu của nhiệm vụ thuộc kế hoạch BASELINE, nếu chưa có đánh giá hiện hành
{
  const base = plans.find((p) => p.surveyType === 'BASELINE' && p.status === 'IN_PROGRESS')
  const t0 = tasks.find((t) => t.planId === base?.id)
  const ds0 = t0 && (await apiGet(page, `/survey-tasks/${t0.id}/datasets`)).body.items?.[0]
  if (ds0) {
    const cov = (await apiGet(page, `/datasets/${ds0.id}/coverage`)).body
    if (!cov.assessmentId) {
      const det = await page.evaluate(async (id) => { const r = await fetch(`/api/v1/datasets/${id}`, { credentials: 'include' }); return { etag: r.headers.get('etag'), body: await r.json() } }, ds0.id)
      const items = det.body.scope.flatMap((x) => x.segmentIds.map((segmentId) => ({ routeVersionId: x.routeVersionId, segmentSetId: x.segmentSetId, segmentId, targetBand: x.targetBand, positionStatus: 'PASS', qualityStatus: 'PASS', coverageStatus: 'PASS', reason: '[TEST-FE] Đánh giá thử để kiểm đóng kế hoạch', evidence: [{ fileId: det.body.sourceFiles[0].fileId, fromMilliseconds: 0, toMilliseconds: 1000 }] })))
      const r = await apiSend(page, 'POST', `/datasets/${ds0.id}/assessments`, { methodVersion: 'pm-evidence-review.v1', items }, { 'If-Match': det.etag })
      console.log('   setup đánh giá:', r.status, JSON.stringify(r.body).slice(0, 900))
    }
  }
}
await go(page, `/pm/surveys?projectId=${PROJECT_A}`, 14000)
const txt = await bodyText(page, 'main', 6000)
check('Danh sách hiện loại khảo sát từ BE (không còn "BE chưa trả")', /Khảo sát (cơ sở|định kỳ|đột xuất)/.test(txt) && !/BE chưa trả loại/.test(txt), txt.match(/Loại khảo sát: [^\n]{0,60}/g)?.slice(0, 4).join(' | '))

const open1 = plans.find((p) => p.status === 'IN_PROGRESS' && p.surveyType === 'BASELINE') || plans.find((p) => p.status === 'IN_PROGRESS')
if (open1) {
  await go(page, `/pm/surveys?surveyRecordId=${open1.id}&surveyRecordKind=PLAN`, 12000)
  const d = await bodyText(page, '[role=dialog]', 4000)
  check('Modal kế hoạch hiện loại khảo sát', /Khảo sát (cơ sở|định kỳ|đột xuất)/.test(d), '')
  check('Modal kế hoạch IN_PROGRESS có thẻ "Xác nhận hoàn tất kế hoạch"', /Xác nhận hoàn tất kế hoạch khảo sát/.test(d), '')
  // Thử đóng khi chưa chọn nguồn: nút bị khóa
  const disabled = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => /Xác nhận hoàn tất kế hoạch/.test(b.textContent))?.disabled)
  check('Nút đóng kế hoạch bị khóa khi chưa chọn nguồn/lý do', disabled === true, String(disabled))
  // Chọn bản nộp đầu tiên của từng nhiệm vụ có bản nộp, nhập lý do, gửi, đọc thông báo BE
  const picked = await page.evaluate(() => {
    const out = []
    for (const s of document.querySelectorAll('[role=dialog] select[aria-label^="Bản nộp của"]')) {
      const o = [...s.options].find((x) => x.value); if (!o) continue
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); out.push(s.getAttribute('aria-label'))
    } return out
  })
  console.log('   chọn nguồn:', picked.join(', ') || '(không có bản nộp)')
  if (picked.length) {
    await sleep(2500)
    await page.evaluate(() => { const t = document.querySelector('[aria-label="Lý do đóng kế hoạch"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE] PM xác nhận đủ phạm vi'); t.dispatchEvent(new Event('input', { bubbles: true })) })
    await sleep(500)
    console.log('   trạng thái:', await page.evaluate(() => { const d=document.querySelector('[role=dialog]'); const b=[...d.querySelectorAll('button')].find((x)=>/Xác nhận hoàn tất kế hoạch/.test(x.textContent)); return (b?.disabled?'DISABLED ':'enabled ')+[...d.querySelectorAll('select[aria-label^="Bản nộp của"]')].map((x)=>x.parentElement.innerText.replace(/s+/g,' ').slice(-120)).join('|') }))
    const w0 = log.writes.length
    await clickByText(page, /Xác nhận hoàn tất kế hoạch$/); await sleep(6000)
    const posts = log.writes.slice(w0).join('; ')
    const alert = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] [role=alert], [role=dialog] [role=status]')].map((e) => e.innerText.replace(/\s+/g, ' ')).join(' | '))
    console.log('   POST:', posts, '| thông báo:', alert.slice(0, 300))
    check('Gửi POST /survey-plans/{id}/complete', /survey-plans\/\{id\}\/complete (200|409|412|422)/.test(posts), posts)
    check('Kết quả được hiển thị cho PM (thành công hoặc lý do BE chặn bằng tiếng Việt)', /BE đã xác nhận|BE chặn đóng kế hoạch|Đóng kế hoạch:/.test(alert) || /survey-plans/{id}/complete 200/.test(posts) && !!(await page.$('[data-testid=plan-completion]')), alert.slice(0, 200))
  }
} else console.log('   (không có kế hoạch IN_PROGRESS)')
check('PM: không lỗi JS', !log.pageErrors?.length, (log.pageErrors || []).slice(0, 2).join('|'))
console.log(`\nĐạt ${results.filter(Boolean).length}/${results.length}`)
await browser.close()
