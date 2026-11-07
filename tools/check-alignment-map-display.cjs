const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),cp=require('child_process')
const base='src/pages/(pm)/alignment/',plain=value=>JSON.parse(JSON.stringify(value)),cache=new Map()
let html='',selections=[]
class Marker{setLngLat(){return this}addTo(){return this}remove(){}}
class Popup extends Marker{setHTML(value){html=value;return this}}
class Bounds{constructor(){this.points=[]}extend(p){this.points.push(p);return this}isEmpty(){return !this.points.length}getSouthWest(){return{lng:Math.min(...this.points.map(p=>p[0])),lat:Math.min(...this.points.map(p=>p[1]))}}getNorthEast(){return{lng:Math.max(...this.points.map(p=>p[0])),lat:Math.max(...this.points.map(p=>p[1]))}}}
function compile(source,file){const module={exports:{}},code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name==='maplibre-gl')return{Marker,Popup,LngLatBounds:Bounds};if(name==='../../../api/services/projectService')return{projectService:{}};if(name.startsWith('.'))return load(path.join(path.dirname(file),name+'.ts'));throw Error('Unexpected '+name)},console,document:{createElement:()=>({style:{}})}});return module.exports}
function load(file){file=path.normalize(file);if(!cache.has(file))cache.set(file,compile(fs.readFileSync(file,'utf8'),file));return cache.get(file)}
class MapMock{constructor(){this.sources={};this.layers={};this.order=[];this.handlers={};this.canvas={style:{}}}getSource(id){return this.sources[id]}addSource(id,def){this.sources[id]={...def,setData:data=>this.sources[id].data=data}}getLayer(id){return this.layers[id]}addLayer(layer){this.layers[layer.id]=plain(layer);this.order.push(layer.id)}moveLayer(id){this.order=this.order.filter(v=>v!==id);this.order.push(id)}setLayoutProperty(id,key,value){this.layers[id].layout??={};this.layers[id].layout[key]=value}on(event,layer,fn){this.handlers[event+':'+layer]=fn;return this}getCanvas(){return this.canvas}getZoom(){return 20}flyTo(){}fitBounds(){}queryRenderedFeatures(){return[]}}
const helper=load(base+'alignmentPavementHelpers.ts'),old=compile(cp.execFileSync('git',['show','HEAD:'+base+'alignmentPavementHelpers.ts'],{encoding:'utf8'}),base+'alignmentPavementHelpers.ts'),{setupAlignmentSourcesAndLayers:setup}=load(base+'alignmentMapLayers.ts'),{setSlabGridVisibility:visible}=load(base+'alignmentSlabLayers.ts'),{getMapLibreStyle:style}=load('src/utils/maplibre.ts')
const segment=(startKm,endKm,width=9,lanes=3,id='s')=>({id,code:id,startKm,endKm,lengthKm:endKm-startKm,roadWidthM:width,laneCount:lanes,surfaceMaterial:'A',status:'VALID',statusText:'BẢN CHỈNH',color:'#C9A227'})
const coords=[[105,10],[105.001,10]],cfg={slabLenM:5,thicknessCm:31,contractionSpacingM:7,expansionSpacingM:11,expansionGapMm:20}
let count=0;function test(name,run){run();console.log('PASS '+name);count++}
function inside(point,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
test('one compact sequential interior label per actual polygon, residual and transition fragments included; calculation unchanged',()=>{
 for(const segments of [[segment(0,.023)],[segment(0,.007,7,1,'a'),segment(.007,.023,9,3,'b')]])for(const config of [cfg,{...cfg,slabLenM:4,thicknessCm:33}]){
  const kms=[0,.023],before=old.buildMainlinePavementGeoJSON(segments,coords,kms,config),geo=helper.buildMainlinePavementGeoJSON(segments,coords,kms,config),rows=helper.planMainlinePavement(segments,config).slabs
  assert.deepEqual(plain(rows),plain(old.planMainlinePavement(segments,config).slabs));assert.deepEqual(plain(geo.slabsGeoJSON.features.map(f=>f.geometry)),plain(before.slabsGeoJSON.features.map(f=>f.geometry)))
  assert.equal(rows.length,geo.slabsGeoJSON.features.length);assert.equal(rows.length,geo.slabLabelsGeoJSON.features.length);assert.equal(new Set(rows.map(s=>s.id)).size,rows.length)
  geo.slabLabelsGeoJSON.features.forEach((label,index)=>{const slab=geo.slabsGeoJSON.features[index];assert.equal(label.properties.sequence,index+1);assert.equal(label.properties.id,rows[index].id);assert.equal(label.properties.code,slab.properties.code);assert.ok(inside(label.geometry.coordinates,slab.geometry.coordinates[0]));for(const key of ['station','lengthM','widthM','thicknessCm'])assert.equal(label.properties[key],slab.properties[key])})
  assert.deepEqual(plain(geo),plain(helper.buildMainlinePavementGeoJSON([...segments].reverse(),coords,kms,config)))
 }
})
test('existing layers validate on satellite/street styles, distinguish true edges, render above grid and keep edges when grid hidden',()=>{
 for(const mode of ['SATELLITE','STREETS']){const map=new MapMock(),baseStyle=style(mode);for(const layer of baseStyle.layers)map.addLayer(layer);setup(map,[segment(0,.023)],coords,[0,.023],null,[],cfg)
  const errors=require('@maplibre/maplibre-gl-style-spec').validateStyleMin({...baseStyle,sources:{...baseStyle.sources,...Object.fromEntries(Object.entries(map.sources).map(([id,{setData,...definition}])=>[id,definition]))},layers:map.order.map(id=>map.layers[id])});assert.deepEqual(errors.map(e=>e.message),[])
  assert.equal(map.layers['segments-surface-outline'].source,'edges-source');assert.ok(JSON.stringify(map.layers['edges-dimension-line-layer'].paint['line-color']).includes('LEFT'));assert.ok(JSON.stringify(map.layers['edges-dimension-line-layer'].paint['line-color']).includes('RIGHT'));assert.notEqual(map.layers['segments-dash-layer'].paint['line-color'],map.layers['edges-dimension-line-layer'].paint['line-color'])
  assert.ok(map.order.indexOf('edges-dimension-line-layer')>map.order.indexOf('slabs-outline-layer'));assert.ok(map.order.indexOf('segments-surface-outline')>map.order.indexOf('joints-expansion-layer'))
  assert.ok(map.order.indexOf('segments-dash-layer')>map.order.indexOf('slabs-outline-layer'));assert.ok(map.order.indexOf('slabs-label-layer')>map.order.indexOf('segments-dash-layer'))
  const labels=map.layers['slabs-label-layer'];assert.ok(labels.minzoom>=18);assert.equal(labels.source,'slabs-labels-source');assert.equal(labels.layout['text-allow-overlap'],false);assert.equal(labels.layout['text-ignore-placement'],false)
  visible(map,false);assert.equal(map.layers['slabs-fill-layer'].layout.visibility,'none');assert.notEqual(map.layers['edges-dimension-line-layer'].layout.visibility,'none');assert.notEqual(map.layers['edges-label-layer'].layout.visibility,'none')
  assert.equal(map.getSource('slabs-source').data.features.length,map.getSource('slabs-labels-source').data.features.length)
  const missing=new MapMock();for(const layer of baseStyle.layers)missing.addLayer(layer);setup(missing,[segment(0,.023,9,NaN)],coords,[0,.023],null,[],{});assert.equal(missing.getSource('slabs-source').data.features.length,0);assert.equal(missing.getSource('edges-source').data.features.filter(f=>f.geometry.type==='LineString').length,2)
 }
})
test('interior fill and number clicks open the existing popup with actual code/station/dimensions',()=>{
 const map=new MapMock(),popup={current:null};load(base+'alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,popup,id=>selections.push(id))
 const geo=helper.buildMainlinePavementGeoJSON([segment(0,.023)],coords,[0,.023],cfg),polygon=geo.slabsGeoJSON.features.at(-1),label=geo.slabLabelsGeoJSON.features.at(-1)
 for(const [layer,feature]of [['slabs-fill-layer',polygon],['slabs-label-layer',label]]){map.handlers['click:'+layer]({features:[feature],lngLat:{lng:105,lat:10},originalEvent:{}});assert.ok(html.includes(feature.properties.code));assert.ok(html.includes(feature.properties.station));assert.ok(html.includes(`${feature.properties.lengthM}m × ${feature.properties.widthM}m × ${feature.properties.thicknessCm}cm`));assert.equal(selections.at(-1),feature.properties.segmentId)}
})
console.log(`${count} map display scenarios PASS (style validation/mock events; not browser visual acceptance).`)
