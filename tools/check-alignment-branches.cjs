const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react')
const base='src/pages/(pm)/alignment/',plain=value=>JSON.parse(JSON.stringify(value))
function load(file,mocks={}){const module={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name in mocks)return mocks[name];if(name==='../../../api/services/projectService')return{projectService:{}};if(name.startsWith('.'))return load(path.join(path.dirname(file),name+'.ts'),mocks);throw Error('Unexpected '+name)},Error,crypto:require('crypto').webcrypto,console});return module.exports}
const helpers=load(base+'alignmentBranchHelpers.ts'),data=load(base+'data.ts'),main=[[105,10],[105.01,10]],stations=[17.123456789,18.234567891]
const source={id:'branch-a',name:'Nhánh A',coords:[[105.002,10.0001],[105.004,10.002],[105.006,10.001]],roadWidthM:7,laneCount:2,surfaceMaterial:'Vật liệu A'}
let count=0;function test(name,run){run();console.log('PASS '+name);count++}
test('source shape is preserved and junction is an unrounded reference on the current mainline, never a forced join',()=>{
 const branch=helpers.prepareBranchPreview(source,main,stations);assert.deepEqual(plain(branch.coords),source.coords);assert.equal(branch.coords.length,source.coords.length);assert.ok(branch.junctionDistanceMeters>10);assert.ok(Math.abs(branch.branchStationKm-(stations[0]+.2*(stations[1]-stations[0])))<1e-10);assert.equal(branch.segments[0].roadWidthM,7);assert.equal(branch.segments[0].laneCount,2);assert.equal(branch.segments[0].surfaceMaterial,source.surfaceMaterial);assert.equal(branch.segments.length,1);assert.ok(Number.isNaN(branch.splitDistance))
 const line=data.buildBranchesGeoJSON([branch],main,stations);assert.deepEqual(plain(line.features[0].geometry.coordinates),source.coords);assert.equal(data.buildSlabsAndJointsGeoJSON([],main,stations,{},[branch]).slabsGeoJSON.features.length,0)
})
test('invalid rows, duplicate points, wrong ranges, absent technical fields or missing mainline cannot create a branch',()=>{
 for(const text of ['1,2\nbad,3','1,2,3\n4,5','1,2\n1,2','500000,1000000\n500001,1000001','1,2junk\n3,4'])assert.throws(()=>helpers.parseBranchCoordinates(text))
 for(const patch of [{roadWidthM:NaN},{roadWidthM:0},{laneCount:NaN},{laneCount:2.5},{surfaceMaterial:''},{name:''},{coords:[[105,10]]}])assert.throws(()=>helpers.prepareBranchPreview({...source,...patch},main,stations))
 assert.throws(()=>helpers.prepareBranchPreview(source,[],[]),/tuyến chính/);assert.throws(()=>helpers.prepareBranchPreview(source,main,[NaN,18]),/tuyến chính/)
 assert.equal(data.buildBranchesGeoJSON([{...source,coords:null}],main,stations).features.length,0)
})
test('branch modal has no technical defaults, rejects sample loading and submits only typed coordinates/settings without altering JSX',()=>{
 let slot=0,view;const values=[],effects=[],created=[],props={isOpen:true,onClose(){},onAddBranch:b=>created.push(b),stationOriginKm:999,currentCoords:main,currentKmPoints:stations}
 const react={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=next]},useEffect(fn,deps){if(!effects.length){effects.push(deps);fn()}}}
 const C=load(base+'AlignmentAddBranchModal.tsx',{react:{__esModule:true,default:React,...react},'lucide-react':new Proxy({},{get:()=>()=>null})}).AlignmentAddBranchModal
 const walk=node=>!node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(walk)]
 const render=()=>{slot=0;view=C(props);return walk(view)};render();let nodes=render(),inputs=nodes.filter(n=>n.type==='input'),textarea=nodes.find(n=>n.type==='textarea')
 assert.equal(inputs[1].props.value,'');assert.equal(inputs[2].props.value,'');assert.equal(inputs[3].props.value,'')
 const sample=nodes.find(n=>n.type==='button'&&walk(n).some(child=>child.type==='span'&&child.props.children==='Nạp mẫu GPS'));sample.props.onClick();assert.equal(render().find(n=>n.type==='textarea').props.value,'')
 inputs=render().filter(n=>n.type==='input');inputs[0].props.onChange({target:{value:source.name}});inputs[1].props.onChange({target:{value:'7'}});inputs[2].props.onChange({target:{value:'2'}});inputs[3].props.onChange({target:{value:source.surfaceMaterial}});textarea.props.onChange({target:{value:source.coords.map(p=>p.join(', ')).join('\n')}})
 render().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.equal(created.length,1);assert.deepEqual(plain(created[0].coords),source.coords)
 const cp=require('child_process'),file=base+'AlignmentAddBranchModal.tsx',tail=s=>s.slice(s.indexOf('  return (')).replaceAll('\r\n','\n');assert.equal(tail(fs.readFileSync(file,'utf8')),tail(cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'})))
 const page='src/pages/(pm)/AlignmentSegments.tsx',head=cp.execFileSync('git',['show','HEAD:'+page],{encoding:'utf8'}).replaceAll('\r\n','\n');assert.equal(fs.readFileSync(page,'utf8').replaceAll('\r\n','\n'),head.replace("onOpenAddBranchModal={() => showToast('Chưa có nguồn hình học và ngữ cảnh tuyến nhánh được xác minh; chưa thêm tuyến.')}","onOpenAddBranchModal={() => setIsAddBranchModalOpen(true)}"))
})
console.log(`${count} branch helper/modal scenarios PASS (mock React handlers/render data; zero API).`)
