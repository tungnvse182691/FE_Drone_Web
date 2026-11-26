const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict')
const base='src/pages/(pm)/alignment/',cache=new Map(),plain=v=>JSON.parse(JSON.stringify(v))
function load(file){file=path.normalize(file);if(cache.has(file))return cache.get(file);const module={exports:{}};cache.set(file,module.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name==='../../../api/services/projectService')return{projectService:{}};if(name.startsWith('.'))return load(path.join(path.dirname(file),name+'.ts'));throw Error('Unexpected dependency '+name)},console});return module.exports}
const{planMainlinePavement:plan,buildMainlinePavementGeoJSON:draw}=load(base+'alignmentPavementHelpers.ts'),{calculatePavementSlabs:list}=load(base+'alignmentGeometryHelpers.ts'),data=load(base+'data.ts')
const config={stripWidthMeters:3,slabLenM:5,thicknessCm:28,contractionSpacingM:7,expansionSpacingM:11,expansionGapMm:20}
const segment=(startKm,endKm,width=9,lanes=3,id='s')=>({id,code:id,startKm,endKm,lengthKm:endKm-startKm,roadWidthM:width,laneCount:lanes,surfaceMaterial:'A',status:'VALID',statusText:'BẢN CHỈNH',color:'#C9A227'})
const coords=[[105,10],[105.001,10]]
function preview(segments,cfg=config){return draw(segments,coords,[Math.min(...segments.map(s=>s.startKm)),Math.max(...segments.map(s=>s.endKm))],cfg)}
function sameSlabs(rows,features){assert.equal(rows.length,features.length);for(let i=0;i<rows.length;i++){const a=rows[i],b=features[i].properties;for(const field of ['id','startKm','endKm','lengthM','widthM','thicknessCm'])assert.equal(a[field],b[field]);assert.equal(features[i].geometry.type,'Polygon')}}
let count=0;function test(name,run){run();console.log('PASS '+name);count++}
test('exact division and terminal residual create one real slab per PM strip with identical sidebar/map dimensions',()=>{
 for(const meters of [20,23]){const segments=[segment(0,meters/1000)],rows=list(segments,5,28,3),geo=preview(segments);assert.equal(rows.length,Math.ceil(meters/5)*3);sameSlabs(rows,geo.slabsGeoJSON.features);assert.ok(rows.every(s=>s.widthM===3));assert.ok(Math.abs(rows.at(-1).lengthM-(meters===20?5:3))<1e-10);assert.equal(rows.at(-1).endKm,meters/1000)}
})
test('width transitions fragment the global L grid without losing engineering area or inventing tapers',()=>{
 const segments=[segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')],p=plan(segments,config),geo=preview(segments);sameSlabs(p.slabs,geo.slabsGeoJSON.features)
 assert.ok(p.slabs.some(s=>s.startKm===.005&&s.endKm===.007&&Math.abs(s.lengthM-2)<1e-9&&s.widthM===3));assert.ok(p.slabs.some(s=>s.startKm===.007&&s.endKm===.01&&Math.abs(s.lengthM-3)<1e-9&&s.widthM===3))
 assert.ok(Math.abs(p.slabs.reduce((a,s)=>a+s.lengthM*s.widthM,0)-(7*7+16*9))<1e-9)
 const lines=geo.edgesGeoJSON.features.filter(f=>f.geometry.type==='LineString');assert.deepEqual(plain(lines.map(f=>[f.properties.segmentId,f.properties.side,f.properties.offsetMeters])),[['a','LEFT',3.5],['a','RIGHT',-3.5],['b','LEFT',4.5],['b','RIGHT',-4.5]])
 assert.ok(lines.filter(f=>f.properties.side==='LEFT').every(f=>f.geometry.coordinates.every(p=>p[1]>10)));assert.ok(lines.filter(f=>f.properties.side==='RIGHT').every(f=>f.geometry.coordinates.every(p=>p[1]<10)))
})
test('joint spacing changes real positions independently of L; expansion gap changes geometry width in millimetres',()=>{
 const segments=[segment(0,.023)],a=preview(segments),b=preview(segments,{...config,contractionSpacingM:3,expansionGapMm:30})
 assert.deepEqual(plain(a.jointsGeoJSON.features.filter(f=>!f.properties.isExpansion).map(f=>f.properties.offsetMeters)),[7,14,21]);assert.deepEqual(plain(a.jointsGeoJSON.features.filter(f=>f.properties.isExpansion).map(f=>f.properties.offsetMeters)),[11,22])
 assert.deepEqual(plain(b.jointsGeoJSON.features.filter(f=>!f.properties.isExpansion).map(f=>f.properties.offsetMeters)),[3,6,9,12,15,18,21]);assert.equal(a.slabsGeoJSON.features.length,b.slabsGeoJSON.features.length)
 for(const [geo,gap]of [[a,.02],[b,.03]]){const joint=geo.jointsGeoJSON.features.find(f=>f.properties.isExpansion),ring=joint.geometry.coordinates[0];assert.ok(Math.abs((ring[3][0]-ring[0][0])/(coords[1][0]-coords[0][0])*23-gap)<1e-7)}
 const changed=preview(segments,{...config,slabLenM:7,thicknessCm:33});assert.equal(changed.slabsGeoJSON.features.length,12);assert.ok(changed.slabsGeoJSON.features.every(f=>f.properties.thicknessCm===33))
 const transition=preview([segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')],{...config,expansionSpacingM:7});const band=transition.jointsGeoJSON.features.find(f=>f.properties.isExpansion).geometry.coordinates[0]
 assert.ok(Math.abs((band[0][1]-10)*111320-3.5)<1e-8);assert.ok(Math.abs((band[3][1]-10)*111320-4.5)<1e-8)
})
test('long engineering route exceeds both former caps and never derives its length from displayed longitude/latitude',()=>{
 const segments=[segment(10,12.503)],rows=list(segments,5,28,3),geo=preview(segments);assert.equal(rows.length,1503);sameSlabs(rows,geo.slabsGeoJSON.features);assert.equal(rows.at(-1).endKm,12.503);assert.ok(Math.abs(rows.at(-1).lengthM-3)<1e-8);assert.ok(geo.jointsGeoJSON.features.some(f=>f.properties.offsetMeters>2400))
})
test('descending presentation does not swap left/right or change any slab/joint/edge geometry',()=>{
 const segments=[segment(1,1.007,7,1,'a'),segment(1.007,1.023,9,3,'b')];assert.deepEqual(plain(preview(segments)),plain(preview([...segments].reverse())));assert.deepEqual(plain(list(segments,5,28,3)),plain(list([...segments].reverse(),5,28,3)))
})
test('missing/invalid technical parameters never fall back to width8 lanes2 L5 H26 or sample joint values',()=>{
 const segments=[segment(0,.023)]
 assert.equal(list(segments).length,0);assert.equal(preview(segments,{}).slabsGeoJSON.features.length,0);assert.equal(preview(segments,{}).jointsGeoJSON.features.length,0)
 for(const patch of [{slabLenM:0},{slabLenM:NaN},{stripWidthMeters:undefined}])assert.equal(preview(segments,{...config,...patch}).slabsGeoJSON.features.length,0)
 for(const lane of [NaN,0,2.5]){const geo=preview([segment(0,.023,9,lane)]);assert.equal(geo.slabsGeoJSON.features.length,15);assert.equal(geo.edgesGeoJSON.features.filter(f=>f.geometry.type==='LineString').length,2);assert.ok(!geo.missing.some(s=>s.includes('số làn')))}
 const unknown=preview([segment(0,.023,NaN,3)]);assert.equal(unknown.edgesGeoJSON.features.length,0);assert.equal(unknown.slabsGeoJSON.features.length,0)
 const unmapped=draw(segments,[],[],config);assert.equal(unmapped.slabsGeoJSON.features.length,0);assert.ok(unmapped.missing.some(s=>s.includes('tọa độ')))
 const actual=data.buildSlabsAndJointsGeoJSON(segments,coords,[0,.023],config);sameSlabs(list(segments,5,28,3),actual.slabsGeoJSON.features)
})
test('independent PM strip width covers both residual directions without lane/thickness dependencies and preflights the whole budget',()=>{
 const segments=[segment(0,.701290518512277,7,NaN)],cfg={...config,stripWidthMeters:2.5,thicknessCm:undefined},geo=preview(segments,cfg),rows=plan(segments,cfg).slabs
 assert.equal(rows.length,141*3);assert.deepEqual(plain(rows.slice(0,3).map(s=>s.widthM)),[2.5,2.5,2]);assert.ok(Math.abs(rows.at(-1).lengthM-1.290518512277)<1e-10);assert.equal(rows.at(-1).endKm,segments[0].endKm);sameSlabs(rows,geo.slabsGeoJSON.features)
 assert.ok(rows.every((s,i)=>s.id==='T'+(i+1)));assert.equal(geo.slabLabelsGeoJSON.features.length,rows.length)
 assert.deepEqual(plain(preview(segments,{...cfg,stripWidthMeters:20}).slabsGeoJSON.features.map(f=>f.properties.widthM)),Array(141).fill(7))
 const changed=preview(segments,{...cfg,stripWidthMeters:1.25}),oldJoints=geo.jointsGeoJSON;assert.deepEqual(plain(changed.jointsGeoJSON),plain(oldJoints));assert.equal(changed.slabsGeoJSON.features.length,141*6)
 const blocked=preview(segments,{...cfg,slabLenM:.001});assert.equal(blocked.slabsGeoJSON.features.length,0);assert.equal(blocked.slabLabelsGeoJSON.features.length,0);assert.ok(blocked.missing.some(s=>s.includes('ngân sách')));assert.deepEqual(plain(blocked.jointsGeoJSON),plain(oldJoints))
 const partial=plan([segment(0,.01,NaN),segment(.01,.701290518512277,7,NaN,'valid')],{...cfg,slabLenM:.001});assert.equal(partial.slabs.length,0);assert.ok(partial.missing.some(s=>s.includes('ngân sách')))
})
test('optional H distinguishes blank, positive decimals and invalid supplied values without changing joints or technical dimensions',()=>{
 const segments=[segment(0,.023)],base=preview(segments),normal=plan(segments,config).slabs
 for(const thicknessCm of ['', '  ', undefined]) {
  const geo=preview(segments,{...config,thicknessCm});assert.equal(geo.slabsGeoJSON.features.length,normal.length);assert.ok(geo.missing.includes('Chưa nhập chiều dày tấm'));assert.ok(!geo.missing.includes('Chiều dày tấm không hợp lệ'));assert.deepEqual(plain(geo.jointsGeoJSON),plain(base.jointsGeoJSON))
 }
 const decimal=preview(segments,{...config,thicknessCm:'25.12567'});assert.ok(decimal.slabsGeoJSON.features.every(f=>f.properties.thicknessCm===25.12567))
 for(const thicknessCm of ['-5','0','abc','NaN','Infinity','1e999',Infinity,-Infinity]){const geo=preview(segments,{...config,thicknessCm});assert.ok(geo.missing.includes('Chiều dày tấm không hợp lệ'));assert.ok(!geo.missing.includes('Chưa nhập chiều dày tấm'));assert.deepEqual(plain(geo.jointsGeoJSON),plain(base.jointsGeoJSON))}
})
console.log(`${count} mainline pavement preview scenarios PASS (pure helpers/render data; no API writes).`)
