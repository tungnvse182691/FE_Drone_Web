// H4 — logic hạn/bảo hành (hàm thuần dùng chung FIELD/AssignCrew/CreateSurvey) chạy trong trình duyệt qua module Vite thật.
// Thay e2e AssignCrew (SBX-B chưa có hạng mục Normal ReadyToAssign). Chạy: RG_BASE=http://localhost:5180 node tools/e2e/h4-deadline-logic.mjs
import { open, report, BASE } from './lib.mjs'
const { page, browser } = await open()
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' })
const r = await page.evaluate(async () => {
  const m = await import('/src/utils/warrantyDeadline.ts')
  const ready = { status: 'ready', startDate: '2026-10-01', endDate: '2027-03-31' }
  return {
    dateIn: m.warrantyDueError(ready, '2027-03-31', 'Hạn chót hoàn thành'), dateOut: m.warrantyDueError(ready, '2034-05-29', 'Hạn chót hoàn thành'),
    dtIn: m.warrantyDueError(ready, '2027-03-31T23:59', 'x'), dtOut: m.warrantyDueError(ready, '2039-12-26T16:31', 'x'),
    unknown: m.warrantyDueError({ status: 'unknown' }, '2039-12-26T16:31', 'x'), loading: m.warrantyDueError({ status: 'loading' }, '2039-12-26T16:31', 'x'), empty: m.warrantyDueError(ready, '', 'x'),
    maxDate: m.warrantyMaxDate(ready), maxDt: m.warrantyMaxDateTime(ready), maxUnknown: m.warrantyMaxDate({ status: 'unknown' }), hintUnknown: m.warrantyHint({ status: 'unknown', note: 'Chưa có hồ sơ bảo hành' }),
  }
})
const ok = (t, c, d) => report(t, c, d)
ok('Date trong hạn bảo hành hợp lệ', r.dateIn === ''); ok('Date 2034 vượt bảo hành bị báo', /vượt thời hạn bảo hành.*31\/03\/2027/.test(r.dateOut), r.dateOut)
ok('Datetime-local trong hạn hợp lệ / vượt hạn bị báo', r.dtIn === '' && /vượt/.test(r.dtOut))
ok('Chưa đọc được bảo hành: không kết luận vượt (BE kiểm cuối) nhưng có ghi chú', r.unknown === '' && r.loading === '' && /chưa thể kiểm hạn/.test(r.hintUnknown), r.hintUnknown)
ok('min/max: date max=ngày cuối; thiếu dữ liệu không đặt max', r.maxDate === '2027-03-31' && r.maxDt === '2027-03-31T23:59' && r.maxUnknown === undefined && r.empty === '')
await browser.close()
