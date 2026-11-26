const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
function load(file,mocks={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,{module,exports:module.exports,require:n=>{if(n==='react')return{__esModule:true,default:React,...React};if(n==='react-router-dom')return{useNavigate:()=>()=>{}};if(n.endsWith('/Icon'))return{Icon:()=>null};if(n.endsWith('/projectDistanceDisplay'))return{displayKm:n=>`${n} km`};if(n in mocks)return mocks[n];throw Error(n)},URLSearchParams});return module.exports}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const Header=load('src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx').ProjectOverviewHeader
function walk(node,fn){if(!node||typeof node!=='object')return;fn(node);React.Children.forEach(node.props?.children,n=>walk(n,fn))}
test('every setup button uses personnel gold+hover while navigation and role visibility stay intact',()=>{
 for(const ready of [true,false])for(const sup of [false,true]){let path='';const tree=Header({project:{id:'p',length_km:0,repair_packages:0,pm_name:'PM'},basePath:sup?'/sup':'/pm',isSupervisor:sup,submissionReady:ready,onNavigate:p=>path=p});const buttons=[];walk(tree,n=>{if(n.type==='button'&&renderToStaticMarkup(n).includes('Thiết lập tim tuyến'))buttons.push(n)});assert.equal(buttons.length,sup?0:1);for(const b of buttons){assert.ok(b.props.className.includes('bg-[#C9A227]'));assert.ok(b.props.className.includes('hover:bg-[#B38E1E]'));b.props.onClick();assert.equal(path,'/pm/projects/p/alignment')}}
})
const AlignmentHeader=load('src/pages/(pm)/alignment/AlignmentHeader.tsx').AlignmentHeader
const base={basePath:'/pm',alignmentStatus:'DRAFT',activeProject:{},assignedProjects:[],importedLengthKm:.353,currentCoords:[[1,1],[2,2]],isSupervisor:false}
test('draft badge requires a read DRAFT dossier, not initial UI state/legacy geometry/local input',()=>{
 const html=p=>renderToStaticMarkup(React.createElement(AlignmentHeader,{...base,...p}))
 for(const status of [undefined,null,'CONFIRMED','SUBMITTED','REJECTED'])assert.ok(!html({serverDraftStatus:status}).includes('Bản nháp'))
 assert.ok(html({serverDraftStatus:'DRAFT'}).includes('Bản nháp'))
})
const page=fs.readFileSync('src/pages/(pm)/AlignmentSegments.tsx','utf8'),ast=ts.createSourceFile('caller.tsx',page,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
let option,header;function visit(n){if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(ast)==='select'&&n.openingElement.attributes.properties.some(a=>a.name?.getText(ast)==='aria-label'&&a.initializer?.text==='Tuyến hiện hành từ máy chủ'))option=n.children.find(c=>ts.isJsxElement(c)&&c.openingElement.tagName.getText(ast)==='option');if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='AlignmentHeader')header=n;ts.forEachChild(n,visit)}visit(ast)
function evaluate(expr,scope){return vm.runInNewContext(ts.transpileModule('result = ('+expr+')',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,{...scope,result:null})}
test('real selector caller distinguishes explicit other and proven historical route without technical reference wording',()=>{
 const expr=option.children.find(ts.isJsxExpression).expression.getText(ast)
 assert.equal(evaluate(expr,{geometryRead:{roadReference:'r',geometry:null}}),'Đang xem phiên bản tuyến khác')
 assert.equal(evaluate(expr,{geometryRead:{roadReference:'r',geometry:{isCurrent:false}}}),'Đang xem phiên bản tuyến lịch sử')
 assert.equal(evaluate(expr,{geometryRead:{roadReference:'',geometry:null}}),'Chọn tuyến hiện hành để xem')
})
test('real header caller separates no submission, missing source station and API read error; never supplies station zero',()=>{
 const expr=header.attributes.properties.find(a=>a.name?.getText(ast)==='statusMessage').initializer.expression.getText(ast)
 const scope={geometryRead:{context:{engineeringUtmSrid:32648},currentRoutes:[{}],roadReference:'r',submissionReady:true,geometry:{stationOriginMeters:null}},submissionWorkflow:{},submitted:false,isSupervisor:false,fileDraft:null,segmentWorkflow:{},draftWorkflow:{},localDraftDirty:false,draftContentSaved:false}
 let text=evaluate(expr,scope);assert.ok(text.includes('Chưa có hồ sơ trình'));assert.ok(text.includes('Thiếu lý trình gốc từ server để dựng phân đoạn'));assert.ok(!text.includes('Lỗi đọc'))
 scope.geometryRead.geometry=null;scope.geometryRead.geometryError='Lỗi đọc API geometry HTTP 503';text=evaluate(expr,scope);assert.ok(text.includes('HTTP 503'));assert.ok(!text.includes('Thiếu lý trình gốc'))
 scope.geometryRead.geometry={stationOriginMeters:0};scope.geometryRead.geometryError='';assert.ok(!evaluate(expr,scope).includes('Thiếu lý trình gốc'))
})
console.log(`${count} route UI label/caller scenarios PASS (isolated).`)
