// Smoke test GET endpoints chỉ cần projectId, với BE local. Chỉ dùng dev.
// BE:  RG_BASE (mặc định https://localhost:18443/api/v1)
// Tài khoản: RG_ACCOUNTS = JSON mảng [{key,email,password,...}] (lấy từ `docker exec ... cat /handoff/demo-accounts.json`, KHÔNG ghi ra file)
// Vai test: RG_ACTORS (mặc định "pm-a,supervisor")   Dự án: RG_PROJECT_INDEX (mặc định 0)
// Chạy: $env:RG_ACCOUNTS = (docker exec roadguard-fe-api-1 cat /handoff/demo-accounts.json | Out-String); node tools/smoke-be-get.cjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const fs = require('fs')
const BASE = process.env.RG_BASE || 'https://localhost:18443/api/v1'
const accounts = JSON.parse(process.env.RG_ACCOUNTS || '[]')
const actors = (process.env.RG_ACTORS || 'pm-a,supervisor').split(',')
async function login(key) {
  const acc = accounts.find(a => a.key === key)
  if (!acc) throw new Error('Không có tài khoản ' + key)
  const jar = {}
  const take = r => { for (const c of r.headers.getSetCookie?.() || []) { const [k, v] = c.split(';')[0].split('='); jar[k] = v } }
  const ck = () => Object.entries(jar).map(([k, v]) => k + '=' + v).join('; ')
  let r = await fetch(BASE + '/auth/web/csrf', { headers: { cookie: ck() } }); take(r)
  const c = await r.json()
  r = await fetch(BASE + '/auth/web/login', { method: 'POST', headers: { 'content-type': 'application/json', cookie: ck(), [c.headerName]: c.requestToken }, body: JSON.stringify({ email: acc.email, password: acc.password }) }); take(r)
  if (r.status !== 200) throw new Error(key + ' login ' + r.status)
  const role = (await r.json()).user?.role
  return { role, call: async p => { const x = await fetch(BASE + p, { headers: { cookie: ck() } }); let b = null; try { b = await x.json() } catch { } return { status: x.status, body: b } } }
}
;(async () => {
  const d = JSON.parse(fs.readFileSync('docs/contracts/openapi.json', 'utf8'))
  const gets = Object.entries(d.paths).filter(([, v]) => v.get).map(([p]) => p.replace(/^\/api\/v1/, ''))
  const out = {}
  for (const key of actors) {
    const { role, call } = await login(key)
    const proj = await call('/projects')
    const items = proj.body?.items || []
    const pid = items[Number(process.env.RG_PROJECT_INDEX || 0)]?.projectId
    out[key] = { role, projectId: pid, projects: items.length, results: [] }
    for (const g of gets) {
      const p = g.replace('{projectId}', pid)
      if (/\{[^}]+\}/.test(p)) continue
      const r = await call(p)
      out[key].results.push({ path: g, status: r.status, items: Array.isArray(r.body?.items) ? r.body.items.length : '', code: r.body?.code || '' })
    }
  }
  fs.writeFileSync((process.env.TEMP || '.') + '/smoke.json', JSON.stringify(out, null, 1))
  for (const k of Object.keys(out)) {
    const r = out[k].results
    console.log(`\n== ${k} (${out[k].role}) projects=${out[k].projects}  200:${r.filter(x => x.status === 200).length}  400:${r.filter(x => x.status === 400).length}  401/403:${r.filter(x => [401, 403].includes(x.status)).length}  other:${r.filter(x => ![200, 400, 401, 403].includes(x.status)).length}`)
    for (const x of r) console.log(String(x.status).padEnd(4), x.path.padEnd(68), x.items === '' ? '' : 'items=' + x.items, x.code)
  }
})().catch(e => { console.error('FAIL', e.message); process.exit(1) })
