// H4 — logic thuần của H5 (hiệu lực grant, trạng thái thiết bị, fingerprint, đối chiếu readback) chạy trong trình duyệt qua module Vite thật.
// Đây là kiểm LOGIC (không thay e2e grant — chưa có gói/grant thật do Mobile). Chạy: RG_BASE=http://localhost:5180 node tools/e2e/h4-offline-logic.mjs (không cần tài khoản)
import crypto from 'node:crypto'
import { open, report, BASE } from './lib.mjs'
const { page, browser } = await open()
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' })
const key = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).publicKey.export({ type: 'spki', format: 'der' })
const expectFp = crypto.createHash('sha256').update(key).digest('hex')
const r = await page.evaluate(async (b64) => {
  const m = await import('/src/api/services/offlineCoordinationService.ts')
  const now = Date.parse('2026-11-26T12:00:00Z'), f = '2026-11-27T12:00:00Z', p = '2026-11-25T12:00:00Z'
  const out = {
    active: m.grantEffect({ revokedAt: null, expiresAt: f }, now), expired: m.grantEffect({ revokedAt: null, expiresAt: p }, now),
    revoked: m.grantEffect({ revokedAt: '2026-11-26T01:00:00Z', expiresAt: f }, now),
    missingRevokedAtKey: m.grantEffect({ expiresAt: f }, now), missingExpires: m.grantEffect({ revokedAt: null }, now), badExpires: m.grantEffect({ revokedAt: null, expiresAt: 'x' }, now),
    devNot: m.deviceState({ revokedAt: null }), devRev: m.deviceState({ revokedAt: '2026-11-26T01:00:00Z' }), devMissing: m.deviceState({}),
    fp: await m.recipientKeyFingerprint(b64),
    okReadback: m.grantReadbackMismatch({ id: 'g', projectId: 'p', packageId: 'k', recipientDeviceRegistrationId: 'd', scopeJson: JSON.stringify({ items: [{ originId: 'o1' }, { originId: 'o2' }] }) }, { id: 'g', projectId: 'p', packageId: 'k', recipientDeviceRegistrationId: 'd', originIds: ['o2', 'o1'] }),
    badReadback: m.grantReadbackMismatch({ id: 'g', projectId: 'p', packageId: 'OTHER', recipientDeviceRegistrationId: 'd', scopeJson: JSON.stringify({ items: [{ originId: 'o1' }] }) }, { id: 'g', projectId: 'p', packageId: 'k', recipientDeviceRegistrationId: 'd', originIds: ['o1', 'o2'] }),
  }
  return out
}, key.toString('base64'))
const ok = (t, c, d) => report(t, c, d)
ok('Grant còn hạn', r.active === 'ACTIVE'); ok('Grant hết hạn', r.expired === 'EXPIRED'); ok('Grant đã thu hồi', r.revoked === 'REVOKED')
ok('Thiếu key revokedAt KHÔNG kết luận còn hiệu lực', r.missingRevokedAtKey === 'MISSING'); ok('Thiếu expiresAt => thiếu thông tin', r.missingExpires === 'MISSING' && r.badExpires === 'MISSING')
ok('Device: không áp hạn grant; chỉ thu hồi/chưa/thiếu', r.devNot === 'NOT_REVOKED' && r.devRev === 'REVOKED' && r.devMissing === 'MISSING')
ok('Fingerprint SHA-256 khóa khớp cách tính của BE', r.fp === expectFp, r.fp.slice(0, 16))
ok('Readback khớp grant/dự án/gói/thiết bị/phạm vi', r.okReadback === ''); ok('Readback sai gói bị phát hiện', /gói/.test(r.badReadback) && /phạm vi/.test(r.badReadback), r.badReadback)
await browser.close()
