import { open, login, apiGet, PROJECT_A, PROJECT_B } from './lib.mjs'
for (const [who, P] of [['pm-a', PROJECT_A], ['pm-b', PROJECT_B]]) {
  const c = await open(); await login(c.page, who)
  const g = async (p) => (await apiGet(c.page, p))
  console.log('===', who, P.slice(-4))
  const d = (await g(`/projects/${P}/defects`)).body; console.log('defects', JSON.stringify((d.items || []).map(x => x.id.slice(0, 8) + ':' + x.defectTypeCode + ':' + x.status)))
  const pk = (await g(`/projects/${P}/repair-packages`)).body.items || []
  for (const k of pk) { const it = (await g(`/projects/${P}/repair-packages/${k.id}/items`)).body.items || []; console.log('pkg', k.id.slice(0, 8), 'defect', k.defectId.slice(0, 8), JSON.stringify(it.map(i => ({ id: i.id.slice(0, 8), mode: i.mode, state: i.state, obl: i.obligationId.slice(0, 8) })))) }
  const cov = (await g(`/projects/${P}/road-coverage`)).body; console.log('coverage scopes', (cov.scopes || []).length, 'sources', JSON.stringify((cov.sources || []).map(s => s.kind)), 'history', (cov.history || []).length)
  console.log('policies', JSON.stringify((await g(`/projects/${P}/repair-policies`)).body.items?.length))
  console.log('lifecycle responsibilities', JSON.stringify((await g(`/projects/${P}/lifecycle`)).body.responsibilities))
  console.log('members', JSON.stringify(((await g(`/projects/${P}/members`)).body.items || []).map(m => m.role + ':' + m.displayName)))
  await c.browser.close()
}
