// Sinh bảng "service FE → API BE" (xấp xỉ theo chuỗi apiClient.<method>('<path>')). Dùng cho tài liệu knowledge-space.
const fs = require('fs'), path = require('path')
const dir = 'src/api/services'
const rows = []
for (const f of fs.readdirSync(dir).filter((x) => /\.tsx?$/.test(x)).sort()) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8')
  const set = new Set()
  const re = /apiClient\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>(]*>)?\s*\(\s*([`'"])([^`'"]+)\2/g
  let m
  while ((m = re.exec(s))) set.add(m[1].toUpperCase() + ' ' + m[3].replace(/\$\{[^}]+\}/g, '{}'))
  const re2 = /([`'"])(\/(?:projects|users|invitations|cases|notifications|retention|uploads|files|catalog|survey-tasks|reports|labels|auth)[^`'"]*)\1/g
  if (!set.size) { const loose = new Set(); while ((m = re2.exec(s))) loose.add(m[2].replace(/\$\{[^}]+\}/g, '{}')); loose.forEach((p) => set.add('(?) ' + p)) }
  if (set.size) rows.push([f, [...set]])
}
let out = '| Service FE (`src/api/services/…`) | API BE được gọi (xấp xỉ theo mã nguồn) |\n|---|---|\n'
for (const [f, apis] of rows) out += `| \`${f}\` | ${apis.map((a) => '`' + a + '`').join('<br>')} |\n`
fs.writeFileSync(process.argv[2] || 'api-by-service.md', out)
console.log(rows.length, 'service có gọi API')
