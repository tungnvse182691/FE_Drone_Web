const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict')
const ts = require('typescript'), React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
function load(file, mocks = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (name === 'react') return { __esModule: true, default: React }
    if (name in mocks) return mocks[name]
    throw Error('Unexpected import: ' + name)
  } })
  return module.exports
}
const helper = load('src/utils/projectWarranty.ts')
const { ProjectTimelineStepper } = load('src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx', {
  '../../../utils/projectWarranty': helper, '../../../components/ui/Icon': { Icon: () => null }
})
const base = { id: 'p', status: 'ACTIVE', repair_packages: 0, open_defects: 0, handover_date: '2026-01-01', warranty_end_date: '2027-01-01', days_remaining: 12, warranty_passed_percent: 25 }
const render = patch => renderToStaticMarkup(React.createElement(ProjectTimelineStepper, { project: { ...base, ...patch }, basePath: '/pm', onNavigate() {} }))
for (const patch of [
  { warranty_data_missing: true }, { handover_date: undefined }, { warranty_end_date: undefined },
  { warranty_end_date: '2026-02-30' }, { warranty_end_date: '2025-01-01' },
  ...[NaN, null, undefined, Infinity].flatMap(value => [{ days_remaining: value }, { warranty_passed_percent: value }])
]) {
  const html = render(patch)
  assert.ok(html.includes('Chưa cập nhật'))
  for (const text of ['NaN', 'Infinity', '3 năm từ bàn giao', 'Còn 12 ngày', '25% thời gian', '>2027-01-01<']) assert.ok(!html.includes(text), text)
}
for (const [days, percent] of [[12, 25], [0, 0]]) {
  const html = render({ days_remaining: days, warranty_passed_percent: percent })
  for (const text of [`Còn ${days} ngày`, `${percent}% thời gian`, '2027-01-01', '0 gói kỹ thuật', '0 điểm tồn đọng']) assert.ok(html.includes(text), text)
  assert.ok(!html.includes('Chưa cập nhật'))
}
console.log('PASS timeline warranty render: missing/invalid, valid and real zero; existing JSX/style preserved.')
