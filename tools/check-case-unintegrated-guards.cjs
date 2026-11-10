// Isolated production-hook and real caller/SSR tests. No network or business data writes.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
const reason='Chưa tích hợp thao tác này',icon={'../../../components/ui/Icon':{Icon:()=>null}},react={__esModule:true,default:React,...React}
function load(file,mocks){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,{module:m,exports:m.exports,require:n=>{if(n in mocks)return mocks[n];throw Error('Unmocked '+n)},setTimeout(){},console});return m.exports}
function stateHarness(){let slot=0,calls=0;const values=[],rows=[{id:'case-a',code:'A',status:'PENDING',pm_notes:'unchanged',source:'UNKNOWN',severity:'UNKNOWN',urgency:'UNKNOWN',linked_report_ids:[]},{id:'case-b',code:'B',status:'PENDING',pm_notes:'unchanged',linked_report_ids:[]}],original=JSON.stringify(rows)
 const reactHook={...react,useState(v){const i=slot++;if(!(i in values))values[i]=typeof v==='function'?v():v;return[values[i],n=>values[i]=typeof n==='function'?n(values[i]):n]},useEffect(){},useMemo:fn=>fn()}
 const intake={caseId:'case-a',selected:rows[0],cases:rows,projects:[],openCase(){},setCases(update){calls++;const next=typeof update==='function'?update(rows):update;rows.splice(0,rows.length,...next)}}
 const link=load('src/pages/(pm)/ai-review/useAIReviewLinkActions.ts',{react:reactHook,'../../../api/services/triageService':{triageService:new Proxy({},{get(){throw Error('No API call allowed')}})}})
 const hook=load('src/pages/(pm)/ai-review/useAIReviewState.ts',{react:reactHook,'./useCaseIntake':{useCaseIntake:()=>intake},'./useAIReviewFilters':{useAIReviewFilters:()=>({filteredCases:rows})},'./useAIReviewDrawer':{useAIReviewDrawer:()=>({})},'./useAIReviewActions':{useAIReviewActions:()=>({})},'./useAIReviewLinkActions':link}).useAIReviewState
 let view;const render=()=>{slot=0;return view=hook()};render();view.setSelectedReportIds(rows.map(r=>r.id));render();view.setLinkMasterCaseId('case-a');render()
 return{render,get view(){return view},assertUntouched(){assert.equal(calls,0,'Handler must not write Case state');assert.equal(JSON.stringify(rows),original);assert.equal(view.selectedReportIds.length,2,'Selection must be preserved');assert.equal(view.toastMessage,null,'Handler must not emit a success toast')}}
}
let passed=0,failed=0
function test(name,fn){try{fn();passed++;console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+': '+e.message)}}
for(const handler of ['handleBulkVerify','handleBulkNeedSurvey','handleConfirmLinkReports'])test('direct production handler '+handler+' cannot fabricate business success',()=>{const h=stateHarness();h.view[handler]();h.render();h.assertUntouched()})
// Caller tests below use production buttons, not a hand-built list of props.
const btns=html=>[...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>({attrs:m[1],text:m[2].replace(/<[^>]+>/g,'')}))
const requireDisabled=(html,label)=>{const button=btns(html).find(b=>b.text.includes(label));assert.ok(button,'Existing button missing: '+label);assert.match(button.attrs,/disabled=""/);assert.ok(button.attrs.includes(reason),'Disabled button needs explanation: '+label)}
test('actual inbox → table → batch bar and header retain but disable all unsupported entries; selection reset/triage stay enabled',()=>{
 const h=stateHarness(),view=h.view;let captured
 const Bar=load('src/pages/(pm)/ai-review/BatchActionBar.tsx',{react,...icon}).BatchActionBar
 const Table=load('src/pages/(pm)/ai-review/ReviewCasesTable.tsx',{react,...icon,'./BatchActionBar':{BatchActionBar:Bar},'./CitizenTriageTable':{CitizenTriageTable:()=>null}}).ReviewCasesTable
 const Header=load('src/pages/(pm)/ai-review/ReviewHeader.tsx',{react,...icon,'react-router-dom':{useNavigate:()=>()=>{}}}).ReviewHeader
 const Inbox=load('src/pages/(pm)/AIReviewInbox.tsx',{react,'../../components/ui/Icon':{Icon:()=>null},'../../store/authStore':{useAuthStore:()=>({user:{role:'PROJECT_MANAGER'}})},'../../types/enums':{RoleCode:{SUPERVISOR:'SUPERVISOR'}},'./ai-review/useAIReviewState':{useAIReviewState:()=>view},'./ai-review/useCaseReportMedia':{CaseReportMediaProvider:p=>p.children},'./ai-review/ReviewHeader':{ReviewHeader:Header},'./ai-review/ReviewFilterBar':{ReviewFilterBar:()=>null},'./ai-review/ReviewCasesTable':{ReviewCasesTable:p=>{captured=p;return React.createElement(Table,p)}},'./ai-review/ReviewDetailModal':{ReviewDetailModal:()=>null},'./ai-review/ReviewModals':{ReviewModals:()=>null}}).AIReviewInbox
 view.isLoading=false;view.projects=[];view.intake.detailLoading=false;view.filteredCases=view.cases
 const html=renderToStaticMarkup(React.createElement(Inbox));for(const label of ['Xác nhận hàng loạt','Đánh dấu kiểm tra lại','Liên kết báo trùng'])requireDisabled(html,label)
 const links=btns(html).filter(b=>b.text.includes('Liên kết báo trùng'));assert.equal(links.length,2);links.forEach(b=>assert.match(b.attrs,/disabled=""/));assert.equal(captured.onBulkVerify,view.handleBulkVerify);assert.equal(captured.onBulkNeedSurvey,view.handleBulkNeedSurvey);assert.ok(!btns(html).find(b=>b.text.includes('Bỏ chọn')).attrs.includes('disabled'))
 const sup=renderToStaticMarkup(React.createElement(Bar,{...captured,isSupervisor:true,onClearSelectedReports(){}}));assert.ok(!btns(sup).find(b=>b.text.includes('Điều phối vào dự án')).attrs.includes('disabled'))
})
test('actual modal hub keeps link dialog but disables confirm with explanation',()=>{
 const Modal=load('src/pages/(pm)/ai-review/LinkReportsModal.tsx',{react,...icon}).LinkReportsModal
 const other=Object.fromEntries(['SpatialMergeModal','GisMapModal','PhotoZoomModal','TriageProjectModal','NoDefectModal','PublishModal','RequestSurveyModal'].map(n=>['./'+n,{[n]:()=>null}]))
 const Hub=load('src/pages/(pm)/ai-review/ReviewModals.tsx',{react,...other,'./LinkReportsModal':{LinkReportsModal:Modal}}).ReviewModals
 const h=stateHarness(),v=h.view,html=renderToStaticMarkup(React.createElement(Hub,{...v,isLinkReportsModalOpen:true,onConfirmLinkReports:v.handleConfirmLinkReports}))
 requireDisabled(html,'Xác Nhận Liên Kết');assert.ok(html.includes(reason));assert.ok(!btns(html).find(b=>b.text.includes('Hủy bỏ')).attrs.includes('disabled'))
})
console.log(`${passed} passed; ${failed} failed (isolated mocks/hooks/SSR; runtime writes NOT_RUN).`);if(failed)process.exitCode=1
