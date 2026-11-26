import { open, login, apiGet, PROJECT_A, PROJECT_B } from './lib.mjs'
const { browser, page } = await open(); await login(page, 'supervisor')
for (const P of [PROJECT_A, PROJECT_B]) {
  const pk = await apiGet(page, `/projects/${P}/repair-packages`)
  for (const k of pk.body.items || []) {
    const it = await apiGet(page, `/projects/${P}/repair-packages/${k.id}/items`)
    for (const i of it.body.items || []) console.log(P.slice(-1), k.id.slice(0,8), i.id.slice(0,8), i.mode, i.state, i.taskId||'', JSON.stringify(Object.keys(i)).slice(0,300))
  }
}
await browser.close()
