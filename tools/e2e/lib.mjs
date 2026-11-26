// Thư viện dùng chung cho kiểm thử giao diện Web PM/Sup (puppeteer-core + Microsoft Edge).
// Tài khoản demo lấy từ container BE (không ghi mật khẩu ra file): xem run.sh.
import puppeteer from 'puppeteer-core'

export const BASE = process.env.RG_BASE || 'http://localhost:5173'
export const EDGE = process.env.RG_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
export const PROJECT_A = '72f84201-c001-4000-8000-000000000001' // Synthetic Project A (dữ liệu seed của BE)
export const PROJECT_B = '72f84201-c001-4000-8000-000000000002' // Synthetic Project B (PM: pm-b)

export function account(key) {
  const accounts = JSON.parse(process.env.RG_ACCOUNTS || '[]')
  const a = accounts.find((x) => x.key === key)
  if (!a) throw new Error(`Không có tài khoản "${key}". Chạy qua run.sh để nạp RG_ACCOUNTS từ container.`)
  return a
}

// Mở trình duyệt + trang mới, ghi lại mọi lời gọi API ghi (non-GET) và mọi phản hồi >= 400.
export async function open({ width = 1500, height = 2800 } = {}) {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--ignore-certificate-errors'], protocolTimeout: 90000 })
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  const log = { writes: [], failures: [], pageErrors: [], dialogs: [] }
  page.on('dialog', async (d) => { log.dialogs.push(d.message().slice(0, 200)); await d.dismiss() })
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message).slice(0, 200)))
  page.on('response', async (r) => {
    const u = r.url()
    if (!u.includes('/api/v1/')) return
    const path = u.split('/api/v1')[1].replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, '{id}').slice(0, 90)
    const method = r.request().method()
    if (method !== 'GET' && !path.startsWith('/auth/')) log.writes.push(`${method} ${path} ${r.status()}`)
    if (r.status() >= 400 && !path.startsWith('/auth/web/renew') && !path.startsWith('/auth/web/session')) {
      let body = ''
      try { body = (await r.text()).slice(0, 160) } catch { /* ignore */ }
      log.failures.push(`${method} ${path} ${r.status()} ${body}`)
    }
  })
  return { browser, page, log }
}

export async function login(page, key) {
  const a = account(key)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('input[type=email]', { timeout: 30000 }) // Vite có thể đang tải lại khi file nguồn đổi
  await page.type('input[type=email]', a.email)
  await page.type('input[type=password]', a.password)
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => !location.pathname.includes('/login'), { timeout: 25000 })
  await sleep(2500)
}

// Điều hướng SPA (không tải lại trang) — giữ phiên cookie và state.
export async function go(page, path, wait = 6000) {
  if (new URL(page.url()).pathname === path) { await sleep(wait); return }
  await page.evaluate((p) => { history.pushState({}, '', p); dispatchEvent(new PopStateEvent('popstate')) }, path)
  await sleep(wait)
}

// GET qua phiên trình duyệt (cookie) để đọc lại trạng thái đã lưu ở BE.
export function apiGet(page, path) {
  return page.evaluate(async (p) => {
    const r = await fetch(`/api/v1${p}`, { credentials: 'include' })
    let body = null
    try { body = await r.json() } catch { /* không phải JSON */ }
    return { status: r.status, body }
  }, path)
}

export const bodyText = (page, sel = 'body', max = 800) =>
  page.evaluate((s, m) => (document.querySelector(s)?.innerText || '').split('\n').map((x) => x.trim()).filter((x) => x.length > 1).join(' | ').slice(0, m), sel, max)

export function setNative(page, selector, value, kind = 'input') {
  return page.evaluate((s, v, k) => {
    const el = document.querySelector(s)
    if (!el) return false
    const proto = k === 'textarea' ? HTMLTextAreaElement : k === 'select' ? HTMLSelectElement : HTMLInputElement
    Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, v)
    el.dispatchEvent(new Event(k === 'select' ? 'change' : 'input', { bubbles: true }))
    return true
  }, selector, value, kind)
}

export function clickByText(page, re, scope = 'body') {
  return page.evaluate((src, sc) => {
    const root = document.querySelector(sc) || document.body
    const b = [...root.querySelectorAll('button')].find((x) => new RegExp(src).test(x.textContent))
    if (!b) return 'no-btn'
    if (b.disabled) return 'DISABLED'
    b.click()
    return 'clicked'
  }, re.source, scope)
}

export const report = (title, ok, detail = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${title}${detail ? '  — ' + detail : ''}`)

// Gọi API ghi bằng phiên trình duyệt (cookie + CSRF + Idempotency-Key). Dùng để TẠO DỮ LIỆU TEST qua API được phép, không ghi DB.
export function apiSend(page, method, path, body, headers = {}) {
  return page.evaluate(async (m, p, b, h) => {
    const csrf = await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()
    const r = await fetch(`/api/v1${p}`, { method: m, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf.requestToken || csrf.token, 'Idempotency-Key': crypto.randomUUID(), ...h }, body: b === undefined ? undefined : JSON.stringify(b) })
    let json = null
    try { json = await r.json() } catch { /* không phải JSON */ }
    return { status: r.status, body: json, etag: r.headers.get('etag') }
  }, method, path, body, headers)
}
