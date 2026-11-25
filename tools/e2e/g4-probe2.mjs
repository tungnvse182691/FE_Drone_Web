// G4 — thăm dò màn đề xuất của PM-B sau khi nhận chuyển nghĩa vụ (chỉ đọc). Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g4-probe2.mjs
import { open, login, go, bodyText, sleep, PROJECT_B } from './lib.mjs'
const { browser, page, log } = await open({ height: 3200 })
await login(page, 'pm-b')
await go(page, `/pm/proposals?projectId=${PROJECT_B}`, 14000)
console.log('rows:', await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 160) + ' || buttons: ' + [...r.querySelectorAll('button')].map((b) => b.textContent.trim()).join(','))))
console.log('main:', (await bodyText(page, 'main', 900)))
console.log('failures:', log.failures.slice(-6).join(' | '))
await browser.close()
