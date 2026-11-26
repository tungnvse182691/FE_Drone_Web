const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),cp=require('child_process')
const base='src/pages/(pm)/alignment/',plain=value=>JSON.parse(JSON.stringify(value)),cache=new Map()
let html='',selections=[]
class Marker{setLngLat(){return this}addTo(){return this}remove(){}}
class Popup extends Marker{setHTML(value){html=value;return this}}
class Bounds{constructor(){this.points=[]}extend(p){this.points.push(p);return this}isEmpty(){return !this.points.length}getSouthWest(){return{lng:Math.min(...this.points.map(p=>p[0])),lat:Math.min(...this.points.map(p=>p[1]))}}getNorthEast(){return{lng:Math.max(...this.points.map(p=>p[0])),lat:Math.max(...this.points.map(p=>p[1]))}}}
function compile(source,file){const module={exports:{}},code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name==='react'){const React=require('react');return{__esModule:true,default:React,...React}}if(name==='lucide-react')return new Proxy({},{get:()=>()=>null});if(name==='maplibre-gl')return{Marker,Popup,LngLatBounds:Bounds};if(name==='../../../api/services/projectService')return{projectService:{}};if(name.startsWith('.'))return load(path.join(path.dirname(file),name+(fs.existsSync(path.join(path.dirname(file),name+'.ts'))?'.ts':'.tsx')));throw Error('Unexpected '+name)},console,document:{createElement:()=>({style:{}})}});return module.exports}
function load(file){file=path.normalize(file);if(!cache.has(file))cache.set(file,compile(fs.readFileSync(file,'utf8'),file));return cache.get(file)}
class MapMock{constructor(){this.sources={};this.layers={};this.order=[];this.handlers={};this.camera=[];this.canvas={style:{}}}getSource(id){return this.sources[id]}addSource(id,def){this.sources[id]={...def,setData:data=>this.sources[id].data=data}}getLayer(id){return this.layers[id]}addLayer(layer){this.layers[layer.id]=plain(layer);this.order.push(layer.id)}moveLayer(id){this.order=this.order.filter(v=>v!==id);this.order.push(id)}setLayoutProperty(id,key,value){this.layers[id].layout??={};this.layers[id].layout[key]=value}on(event,layer,fn){this.handlers[event+':'+layer]=fn;return this}getCanvas(){return this.canvas}getZoom(){return 20}flyTo(options){this.camera.push(options)}fitBounds(_bounds,options){this.camera.push(options)}queryRenderedFeatures(){return[]}}
const helper=load(base+'alignmentPavementHelpers.ts'),old=compile(cp.execFileSync('git',['show','HEAD:'+base+'alignmentPavementHelpers.ts'],{encoding:'utf8'}),base+'alignmentPavementHelpers.ts'),{setupAlignmentSourcesAndLayers:setup}=load(base+'alignmentMapLayers.ts'),{setSlabGridVisibility:visible}=load(base+'alignmentSlabLayers.ts'),{getMapLibreStyle:style}=load('src/utils/maplibre.ts')
const segment=(startKm,endKm,width=9,lanes=3,id='s')=>({id,code:id,startKm,endKm,lengthKm:endKm-startKm,roadWidthM:width,laneCount:lanes,surfaceMaterial:'A',status:'VALID',statusText:'BẢN CHỈNH',color:'#C9A227'})
const coords=[[105,10],[105.001,10]],cfg={stripWidthMeters:3,slabLenM:5,thicknessCm:31,contractionSpacingM:7,expansionSpacingM:11,expansionGapMm:20}
let count=0;function test(name,run){run();console.log('PASS '+name);count++}
function inside(point,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
test('one compact sequential interior label per actual polygon, residual and transition fragments included; strip cells and labels share one plan',()=>{
 for(const segments of [[segment(0,.023)],[segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')]])for(const config of [cfg,{...cfg,slabLenM:4,thicknessCm:33}]){
  const kms=[0,.023],before=old.buildMainlinePavementGeoJSON(segments,coords,kms,config),geo=helper.buildMainlinePavementGeoJSON(segments,coords,kms,config),rows=helper.planMainlinePavement(segments,config).slabs
  assert.deepEqual(plain(geo.jointsGeoJSON),plain(before.jointsGeoJSON))
  assert.equal(rows.length,geo.slabsGeoJSON.features.length);assert.equal(rows.length,geo.slabLabelsGeoJSON.features.length);assert.equal(new Set(rows.map(s=>s.id)).size,rows.length)
  geo.slabLabelsGeoJSON.features.forEach((label,index)=>{const slab=geo.slabsGeoJSON.features[index];assert.equal(label.properties.sequence,index+1);assert.equal(label.properties.id,rows[index].id);assert.equal(label.properties.code,slab.properties.code);assert.ok(inside(label.geometry.coordinates,slab.geometry.coordinates[0]));for(const key of ['station','lengthM','widthM','thicknessCm'])assert.equal(label.properties[key],slab.properties[key])})
  assert.deepEqual(plain(geo),plain(helper.buildMainlinePavementGeoJSON([...segments].reverse(),coords,kms,config)))
 }
})
test('existing layers validate on satellite/street styles, distinguish true edges, render above grid and keep edges when grid hidden',()=>{
 for(const mode of ['SATELLITE','STREETS']){const map=new MapMock(),baseStyle=style(mode);for(const layer of baseStyle.layers)map.addLayer(layer);setup(map,[segment(0,.023)],coords,[0,.023],null,[],cfg)
  const errors=require('@maplibre/maplibre-gl-style-spec').validateStyleMin({...baseStyle,sources:{...baseStyle.sources,...Object.fromEntries(Object.entries(map.sources).map(([id,{setData,...definition}])=>[id,definition]))},layers:map.order.map(id=>map.layers[id])});assert.deepEqual(errors.map(e=>e.message),[])
  assert.equal(map.layers['segments-surface-outline'].source,'edges-source');assert.ok(JSON.stringify(map.layers['edges-dimension-line-layer'].paint['line-color']).includes('LEFT'));assert.ok(JSON.stringify(map.layers['edges-dimension-line-layer'].paint['line-color']).includes('RIGHT'));assert.notEqual(map.layers['segments-dash-layer'].paint['line-color'],map.layers['edges-dimension-line-layer'].paint['line-color'])
  assert.ok(map.order.indexOf('edges-dimension-line-layer')>map.order.indexOf('slabs-outline-layer'));assert.ok(map.order.indexOf('joints-expansion-layer')>map.order.indexOf('edges-dimension-line-layer'))
  assert.ok(map.order.indexOf('segments-dash-layer')>map.order.indexOf('slabs-outline-layer'));assert.ok(map.order.indexOf('slabs-label-layer')>map.order.indexOf('segments-dash-layer'))
  const labels=map.layers['slabs-label-layer'];assert.ok(labels.minzoom>=18);assert.equal(labels.source,'slabs-labels-source');assert.equal(labels.layout['text-allow-overlap'],false);assert.equal(labels.layout['text-ignore-placement'],false)
  assert.equal(map.layers['joints-contraction-layer'].paint['line-color'],'#EF4444');assert.equal(map.layers['joints-expansion-layer'].paint['line-color'],'#F59E0B');assert.ok(map.layers['joints-contraction-layer'].paint['line-dasharray']);assert.equal(map.layers['joints-contraction-label-layer'].source,'joints-labels-source')
  visible(map,false);assert.equal(map.layers['slabs-fill-layer'].layout.visibility,'none');assert.notEqual(map.layers['edges-dimension-line-layer'].layout.visibility,'none');assert.notEqual(map.layers['edges-label-layer'].layout.visibility,'none')
  assert.equal(map.layers['joints-contraction-label-layer'].layout.visibility,'none');assert.equal(map.layers['joints-expansion-label-layer'].layout.visibility,'none')
  assert.equal(map.getSource('slabs-source').data.features.length,map.getSource('slabs-labels-source').data.features.length)
  const missing=new MapMock();for(const layer of baseStyle.layers)missing.addLayer(layer);setup(missing,[segment(0,.023,9,NaN)],coords,[0,.023],null,[],{});assert.equal(missing.getSource('slabs-source').data.features.length,0);assert.equal(missing.getSource('edges-source').data.features.filter(f=>f.geometry.type==='LineString').length,2)
 }
})
test('interior fill and number clicks open the existing popup with actual code/station/dimensions',()=>{
 const map=new MapMock(),popup={current:null};load(base+'alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,popup,id=>selections.push(id))
 const geo=helper.buildMainlinePavementGeoJSON([segment(0,.023)],coords,[0,.023],cfg),polygon=geo.slabsGeoJSON.features.at(-1),label=geo.slabLabelsGeoJSON.features.at(-1)
 for(const [layer,feature]of [['slabs-fill-layer',polygon],['slabs-label-layer',label]]){map.handlers['click:'+layer]({features:[feature],lngLat:{lng:105,lat:10},originalEvent:{}});assert.ok(html.includes(feature.properties.code));assert.ok(html.includes(feature.properties.station));assert.ok(html.includes(`${feature.properties.lengthM}m × ${feature.properties.widthM}m × ${feature.properties.thicknessCm}cm`));assert.equal(selections.at(-1),feature.properties.segmentId)}
 assert.ok(html.includes('Preview'));assert.ok(!html.includes('Đạt chuẩn'))
})
test('T/KC/KG codes and counts bind source geometry, scope and readiness rather than estimates/label features',()=>{
 const{summarizePavementPreview:summary}=load(base+'alignmentPavementDisplay.ts'),segments=[segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')],geo=helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],cfg)
 const mixed={...geo,slabsGeoJSON:{...geo.slabsGeoJSON,features:[...geo.slabsGeoJSON.features,...geo.slabLabelsGeoJSON.features]},jointsGeoJSON:{...geo.jointsGeoJSON,features:[...geo.jointsGeoJSON.features,...geo.jointLabelsGeoJSON.features]}}
 const all=summary(mixed);assert.equal(all.slabCount,geo.slabsGeoJSON.features.length);assert.equal(all.contractionCount,3);assert.equal(all.expansionCount,2);assert.ok(all.dimensions.includes('Nhiều kích thước'))
 for(const id of ['a','b']){const scoped=summary(mixed,id);assert.equal(scoped.slabCount,geo.slabsGeoJSON.features.filter(f=>f.properties.segmentId===id).length);assert.equal(scoped.contractionCount,geo.jointsGeoJSON.features.filter(f=>f.properties.segmentId===id&&!f.properties.isExpansion).length)}
 geo.slabsGeoJSON.features.forEach((f,i)=>assert.equal(f.properties.code,'T'+(i+1)));for(const expansion of [false,true])geo.jointsGeoJSON.features.filter(f=>f.properties.isExpansion===expansion).forEach((f,i)=>assert.equal(f.properties.code,(expansion?'KG':'KC')+(i+1)))
 assert.deepEqual(plain(geo.jointsGeoJSON.features.map(f=>f.geometry)),plain(old.buildMainlinePavementGeoJSON(segments,coords,[0,.023],cfg).jointsGeoJSON.features.map(f=>f.geometry)))
 const zero=helper.buildMainlinePavementGeoJSON([segment(0,.003)],coords,[0,.003],{...cfg,contractionSpacingM:7,expansionSpacingM:11});assert.equal(summary(zero).contractionCount,0);assert.equal(summary(zero).expansionCount,0)
 const overlap=helper.buildMainlinePavementGeoJSON([segment(0,.023)],coords,[0,.023],{...cfg,contractionSpacingM:5,expansionSpacingM:10});assert.deepEqual(plain(overlap.jointsGeoJSON.features.filter(f=>!f.properties.isExpansion).map(f=>f.properties.code)),['KC1','KC2'])
 const missing=summary(helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],{}));assert.equal(missing.slabCount,null);assert.ok(missing.slabMissing.some(message=>message.includes('chiều dài tấm L')));assert.ok(missing.contractionMissing.some(message=>message.includes('cự ly khe co')));assert.equal(missing.expansionCount,null)
 const missingThickness=summary(helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],{...cfg,thicknessCm:NaN}));assert.ok(missingThickness.slabCount>0);assert.equal(missingThickness.contractionCount,3);assert.equal(missingThickness.expansionCount,2)
})
test('HUD and legend show three distinct actual-count categories, variable sizes and preview state; joint popup matches either type',()=>{
 const React=require('react'),{renderToStaticMarkup:render}=require('react-dom/server'),C=load(base+'AlignmentMap.tsx').AlignmentMap
 const segments=[segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')],preview=helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],cfg),props={mapContainerRef:{current:null},mapRef:{current:null},mapLayer:'VECTOR',showSlabsAndJoints:true,cursorPos:{lat:10,lng:105,elevation:'',station:''},segments,selectedSegmentId:'ALL',importedLengthKm:.023,slabLengthM:5,slabThicknessCm:31,contractionSpacingM:7,expansionSpacingM:11,expansionGapMm:20,pavementPreview:preview}
 let hud=render(React.createElement(C,props));assert.ok(hud.includes(`${preview.slabsGeoJSON.features.length} tấm thực`));assert.ok(hud.includes('3 khe co thực'));assert.ok(hud.includes('2 khe giãn thực'));assert.ok(hud.includes('Nhiều kích thước'));assert.ok(hud.includes('KC1, KC2'));assert.ok(hud.includes('KG1, KG2'));assert.ok(!hud.includes('~'));assert.ok(hud.includes('Preview'))
 hud=render(React.createElement(C,{...props,selectedSegmentId:'a'}));assert.ok(hud.includes('6 tấm thực'));assert.ok(hud.includes('0 khe co thực'))
 const absent=helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],{});hud=render(React.createElement(C,{...props,pavementPreview:absent}));assert.ok(hud.includes('Chưa nhập:'));assert.ok(hud.includes('chiều dài tấm L'));assert.ok(!hud.includes('0 tấm thực'))
 const map=new MapMock();load(base+'alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,{current:null},()=>{})
 for(const expansion of [false,true])for(const labels of [false,true]){const f=(labels?preview.jointLabelsGeoJSON:preview.jointsGeoJSON).features.find(f=>f.properties.isExpansion===expansion),layer=expansion?'joints-expansion':'joints-contraction';map.handlers['click:'+layer+(labels?'-label-layer':'-layer')]({features:[f],lngLat:{lng:105,lat:10},originalEvent:{}});assert.ok(html.includes(f.properties.code));assert.ok(html.includes(f.properties.station));assert.ok(html.includes(f.properties.spacingMeters+'m'));assert.ok(html.includes('Preview'));assert.ok(!html.includes('Đạt chuẩn'));assert.ok(!html.includes('undefined'));if(expansion)assert.ok(html.includes(f.properties.gapMm+'mm'));else assert.ok(!html.includes('Độ hở:'))}
})
test('pavement click retains close zoom and cannot be overwritten by underlying route handlers for the same DOM event',()=>{
 const map=new MapMock();load(base+'alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,{current:null},()=>{})
 const geo=helper.buildMainlinePavementGeoJSON([segment(0,.023)],coords,[0,.023],cfg),route={type:'Feature',properties:segment(0,.023),geometry:{type:'LineString',coordinates:coords}}
 for(const [layer,feature]of [['slabs-fill-layer',geo.slabsGeoJSON.features[0]],['joints-contraction-layer',geo.jointsGeoJSON.features.find(f=>!f.properties.isExpansion)],['joints-expansion-label-layer',geo.jointLabelsGeoJSON.features.find(f=>f.properties.isExpansion)]]){
  const originalEvent={},event={features:[feature],lngLat:{lng:105,lat:10},originalEvent};map.handlers['click:'+layer](event);const popup=html,cameras=map.camera.length
  assert.equal(map.camera.at(-1).zoom,20);assert.ok(popup.includes(feature.properties.code));assert.ok(popup.includes('Preview'))
  map.handlers['click:segments-surface-layer']({...event,features:[route]});map.handlers['click:segments-dash-layer']({...event,features:[route]});assert.equal(html,popup);assert.equal(map.camera.length,cameras)
 }
 map.getZoom=()=>15.2;const joint=geo.jointsGeoJSON.features.find(f=>!f.properties.isExpansion);map.handlers['click:joints-contraction-layer']({features:[joint],lngLat:{lng:105,lat:10},originalEvent:{}});assert.equal(map.camera.at(-1).zoom,18.5)
})
test('decimal editor text is retained, empty/invalid fields clear only their own sources and joint inputs stay independent of L',()=>{
 const React=require('react'),{renderToStaticMarkup:render}=require('react-dom/server'),C=load(base+'SidebarSlabsTab.tsx').SidebarSlabsTab
 const segments=[segment(0,.007,7,NaN,'a'),segment(.007,.023,9,3,'b')],toasts=[],state={stripWidthMeters:'3',slabLengthM:'5',slabThicknessCm:'5.125',contractionSpacingM:'7',expansionSpacingM:'11',expansionGapMm:'20.125'}
 const geo=()=>helper.buildMainlinePavementGeoJSON(segments,coords,[0,.023],{slabLenM:state.slabLengthM,thicknessCm:state.slabThicknessCm,...state})
 const view=(selection='ALL')=>C({...state,segments,selectedSegmentId:selection,slabs:helper.planMainlinePavement(segments,{slabLenM:state.slabLengthM,thicknessCm:state.slabThicknessCm,...state}).slabs,syncJointWithSlab:true,showToast:m=>toasts.push(m),...Object.fromEntries(Object.keys(state).map(key=>['onSet'+key[0].toUpperCase()+key.slice(1),value=>state[key]=value]))})
 const walk=node=>!node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(walk)]
 const input=label=>walk(view()).find(node=>node.type==='input'&&node.props['aria-label']===label)
 const change=(label,value)=>{input(label).props.onChange({target:{value}});assert.equal(input(label).props.value,value)}
 assert.equal(geo().slabsGeoJSON.features.length,18);assert.equal(geo().slabLabelsGeoJSON.features.length,18)
 let summary=load(base+'alignmentPavementDisplay.ts').summarizePavementPreview;assert.equal(summary(geo(),'a').slabCount,6);assert.equal(summary(geo(),'a').slabMissing.length,0);assert.equal(summary(geo(),'b').slabCount,12)
 const markup=render(view('a'));assert.ok(!markup.includes('số làn'));assert.ok(!markup.includes('Vui lòng thiết lập tim tuyến'));assert.ok(!markup.includes('30m</button>'));assert.ok(markup.includes('Mẫu L:'))
 change('Độ hở khe giãn (mm)','20.12567');let band=geo().jointsGeoJSON.features.find(f=>f.properties.isExpansion);assert.equal(band.properties.gapMm,20.12567)
 const map=new MapMock();load(base+'alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,{current:null},()=>{});map.handlers['click:joints-expansion-layer']({features:[band],lngLat:{lng:105,lat:10},originalEvent:{}});assert.ok(html.includes('20.12567mm'))
 assert.ok(Math.abs((band.geometry.coordinates[0][3][0]-band.geometry.coordinates[0][0][0])/.001*23-.02012567)<1e-7)
 for(const [label,key,type]of [['Độ hở khe giãn (mm)','expansionGapMm','expansion'],['Khoảng cách Khe co (m)','contractionSpacingM','contraction'],['Khoảng cách Khe giãn (m)','expansionSpacingM','expansion'],['Chiều dài tấm L (m)','slabLengthM','slab'],['Bề rộng tấm (m)','stripWidthMeters','slab']]){
  const old=state[key];change(label,'');let g=geo(),summ=summary(g);assert.ok(summ[type+'Missing'].some(m=>m.includes('Chưa nhập')));assert.equal(type==='slab'?g.slabsGeoJSON.features.length:g.jointsGeoJSON.features.filter(f=>f.properties.isExpansion===(type==='expansion')).length,0)
  for(const text of ['-','1.','0','-2','bad','1e999']){change(label,text);g=geo();assert.ok(summary(g)[type+'Missing'].some(m=>m.includes('Không hợp lệ')))}
  change(label,old);assert.equal(summary(geo())[type+'Missing'].some(m=>!m.includes('số làn')),false)
 }
 assert.ok(render(view('b')).includes('Danh Sách Tấm BTXM (12)'));assert.ok(render(view('a')).includes('Danh Sách Tấm BTXM (6)'))
 for(const value of ['', '5.25', '-5', '0', 'abc', 'Infinity']) {
  change('Chiều dày tấm H (cm)',value);const markup=render(view()),g=geo()
  if(value===''){assert.ok(markup.includes('Chưa nhập chiều dày tấm'));assert.ok(g.slabsGeoJSON.features.length>0)}
  else if(value==='5.25'){assert.ok(!markup.includes('Chiều dày tấm không hợp lệ'));assert.ok(g.slabsGeoJSON.features.every(f=>f.properties.thicknessCm===5.25))}
  else {assert.ok(markup.includes('Chiều dày tấm không hợp lệ'));assert.ok(!markup.includes('Chưa nhập chiều dày tấm'))}
 }
 change('Chiều dày tấm H (cm)','5.125')
 const kc=state.contractionSpacingM;change('Chiều dài tấm L (m)','6.125');assert.equal(state.contractionSpacingM,kc)
 change('Khoảng cách Khe co (m)','3');assert.deepEqual(plain(geo().jointsGeoJSON.features.filter(f=>!f.properties.isExpansion).map(f=>f.properties.offsetMeters)),[3,6,9,12,15,18,21])
 change('Khoảng cách Khe giãn (m)','8');assert.deepEqual(plain(geo().jointsGeoJSON.features.filter(f=>f.properties.isExpansion).map(f=>f.properties.offsetMeters)),[8,16])
 segments[0].laneCount=1;assert.equal(summary(geo()).slabMissing.length,0);assert.equal(geo().slabsGeoJSON.features.length,geo().slabLabelsGeoJSON.features.length);assert.equal(toasts.length,0)
})

console.log(`${count} map display scenarios PASS (style validation/mock events; not browser visual acceptance).`)
