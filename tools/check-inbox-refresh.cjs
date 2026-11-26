// Validate the actual Inbox refresh transform and React Refresh remount policy; no browser writes.
const fs=require('node:fs'),assert=require('node:assert/strict'),babel=require('@babel/core'),refresh=require('react-refresh/babel'),runtime=require('react-refresh/runtime')
const source=fs.readFileSync('src/pages/(pm)/AIReviewInbox.tsx','utf8')
const transform=s=>babel.transformSync(s,{filename:'AIReviewInbox.tsx',configFile:false,babelrc:false,parserOpts:{plugins:['typescript','jsx']},plugins:[[refresh,{skipEnvCheck:true}]]}).code
const code=transform(source)
assert.match(code,/_s\(AIReviewInbox,\s*"[^"]+",\s*true,/,'Inbox must force reset even when .ts nested-hook signatures are invisible')
const without=transform(source.replace('// @refresh reset','// reset disabled for negative control'))
assert.doesNotMatch(without,/_s\(AIReviewInbox,\s*"[^"]+",\s*true,/)
function Before(){}function After(){}
runtime.register(Before,'inbox-refresh-regression');runtime.setSignature(Before,'same visible page signature',true)
const family=runtime.getFamilyByType(Before)
runtime.register(After,'inbox-refresh-regression');runtime.setSignature(After,'same visible page signature',true)
const result=runtime.performReactRefresh()
assert.ok(result.staleFamilies.has(family),'Changed nested hooks require remount, not reuse of useSyncExternalStore slots')
assert.ok(!result.updatedFamilies.has(family))
console.log('PASS actual Inbox Babel refresh signature forces remount; negative control does not')
console.log('PASS React Refresh treats unchanged page signature with reset as stale, preventing old hook-slot reuse')
