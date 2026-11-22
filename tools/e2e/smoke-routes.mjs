// Duyệt toàn bộ route Web của PM và Giám sát: không lỗi JS, không 5xx, liệt kê 4xx để xem có đúng quyền BE không.
import { open, login, go, report, bodyText, sleep } from './lib.mjs'

const PM = ['dashboard', 'projects', 'projects/72f84201-c001-4000-8000-000000000001', 'projects/72f84201-c001-4000-8000-000000000001/alignment', 'surveys', 'surveys/create', 'ai-inbox', 'repair-batches/assign', 'field-tasks', 'offline', 'fast-track', 'proposals', 'acceptance', 'research-validation', 'audit-trail', 'reports', 'retention', 'personnel', 'profile', 'notifications']
const SUP = ['dashboard', 'projects', 'projects/72f84201-c001-4000-8000-000000000001', 'surveys', 'cases', 'fast-track', 'field-tasks', 'offline', 'proposals', 'acceptance', 'research-validation', 'audit-trail', 'reports', 'system-control', 'legal-hold', 'personnel', 'profile', 'notifications']

let bad = 0
for (const [key, base, routes] of [['pm-a', '/pm', PM], ['supervisor', '/sup', SUP]]) {
  const { browser, page, log } = await open()
  await login(page, key)
  for (const r of routes) {
    const f0 = log.failures.length, e0 = log.pageErrors.length
    await go(page, `${base}/${r}`, 5000)
    const errs = log.pageErrors.slice(e0)
    const fails = log.failures.slice(f0)
    const text = await bodyText(page, 'main', 300)
    const blank = text.length < 20
    const s5xx = fails.filter((x) => / 5\d\d /.test(x))
    const pass = !errs.length && !s5xx.length && !blank
    if (!pass) bad++
    report(`${key} ${base}/${r}`, pass, [errs[0], s5xx[0], blank ? 'màn hình trống' : '', fails.length && pass ? `4xx: ${fails.map((x) => x.split(' ').slice(0, 3).join(' ')).join('; ')}` : ''].filter(Boolean).join(' | '))
  }
  await browser.close()
}
console.log(bad ? `\n${bad} route lỗi` : '\nTất cả route đạt (không lỗi JS/5xx/màn trống)')
process.exit(bad ? 1 : 0)
