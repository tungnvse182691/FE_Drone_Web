// Run after npm run build. Check the deployable worker URL, not node_modules access.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const assets = path.resolve('dist/assets')
const appFiles = fs.readdirSync(assets).filter(name => name.endsWith('.js') && !name.startsWith('maplibre-gl-worker-'))
const references = new Set(appFiles.flatMap(name => [...fs.readFileSync(path.join(assets, name), 'utf8').matchAll(/["']([^"']*maplibre-gl-worker-[^"']+\.js)["']/g)].map(match => match[1])))
assert(references.size > 0, 'Built app must reference an emitted MapLibre worker asset')
for (const url of references) {
  const file = path.join(assets, path.posix.basename(url))
  assert(fs.existsSync(file), `Worker asset missing: ${url}`)
  const code = fs.readFileSync(file, 'utf8')
  assert(code.trim().length > 0 && !/^\s*<!doctype html/i.test(code), 'Worker must be JavaScript, not SPA fallback HTML')
  assert(!/from["']\.\/maplibre-gl-shared\.mjs["']/.test(code), 'Worker must not retain an unshipped relative MapLibre shared import')
}
console.log(`PASS built MapLibre worker assets: ${references.size}`)
