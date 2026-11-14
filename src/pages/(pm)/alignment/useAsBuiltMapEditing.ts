import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { displayPoint, type FootprintPoint } from './asBuiltMapGeometry'
import type { useAsBuiltWorkflow } from './useAsBuiltWorkflow'

// Temporary comparison/editor overlay only. It never changes the PLANNED/slabs source.
export function mountAsBuiltMapEditor(map: maplibregl.Map, points: FootprintPoint[], drawing: boolean, srid: number,
  onPoint: (lng:number,lat:number)=>void, onVertex:(index:number,lng:number,lat:number)=>void, activeVertex=0) {
  const sourceId='asbuilt-edit-source', lineId='asbuilt-edit-outline', markers:maplibregl.Marker[]=[]
  const coords=points.map(p=>displayPoint(p,srid)), canvas=map.getCanvas(), previousCursor=canvas.style.cursor
  const zoomEnabled=map.doubleClickZoom?.isEnabled()
  const data:GeoJSON.FeatureCollection={type:'FeatureCollection',features:coords.length>=2?[{type:'Feature',properties:{purpose:'unconfirmed_editor'},geometry:{type:'LineString',coordinates:coords}}]:[]}
  map.addSource(sourceId,{type:'geojson',data})
  map.addLayer({id:lineId,type:'line',source:sourceId,paint:{'line-color':'#C9A227','line-width':3,'line-dasharray':[2,1]}})
  const count=drawing?coords.length:Math.max(0,coords.length-1)
  for(let i=0;i<count;i++){
    const el=document.createElement('button');el.type='button';el.textContent=String(i+1);el.setAttribute('aria-label',`Đỉnh đường bao ${i+1}`)
    el.className='w-7 h-7 rounded-full border-2 border-white bg-brand-gold text-white text-xs font-bold shadow cursor-move'
    el.style.zIndex=i===activeVertex?'10':'1'
    el.addEventListener('click',e=>e.stopPropagation())
    const marker=new maplibregl.Marker({element:el,draggable:!drawing}).setLngLat(coords[i]).addTo(map)
    marker.on('dragend',()=>{const p=marker.getLngLat();onVertex(i,p.lng,p.lat)})
    markers.push(marker)
  }
  const click=(e:MouseEvent)=>{if(!drawing)return;e.stopImmediatePropagation();const rect=canvas.getBoundingClientRect(),p=map.unproject([e.clientX-rect.left,e.clientY-rect.top]);onPoint(p.lng,p.lat)}
  if(drawing){canvas.style.cursor='crosshair';canvas.addEventListener('click',click,true);map.doubleClickZoom?.disable()}
  return()=>{
    canvas.removeEventListener('click',click,true);canvas.style.cursor=previousCursor;markers.forEach(m=>m.remove());if(drawing&&zoomEnabled)map.doubleClickZoom?.enable()
    try{if(map.getLayer(lineId))map.removeLayer(lineId);if(map.getSource(sourceId))map.removeSource(sourceId)}catch{/* Map teardown may precede overlay cleanup. */}
  }
}
export function useAsBuiltMapEditing(mapRef:React.RefObject<maplibregl.Map|null>,editor:ReturnType<typeof useAsBuiltWorkflow>){
  const latest=useRef(editor);latest.current=editor
  const lastFocus=useRef('')
  useEffect(()=>{
    const map=mapRef.current
    if(!map||!editor.canEdit||!editor.mapSupported||!editor.drawing&&!editor.vertexEditing)return
    let dispose:(()=>void)|undefined,active=true
    const mount=()=>{if(!active)return;dispose?.();try{dispose=mountAsBuiltMapEditor(map,editor.candidatePoints,editor.drawing,editor.mapCrs!,
      (lng,lat)=>latest.current.addMapPoint(lng,lat),(index,lng,lat)=>latest.current.moveVertex(index,lng,lat),editor.activeVertex)
      const target=`${editor.scope}:${editor.mapEditSession}`
      if(editor.vertexEditing&&editor.candidatePoints.length&&lastFocus.current!==target){lastFocus.current=target;const bounds=new maplibregl.LngLatBounds();editor.candidatePoints.forEach(p=>bounds.extend(displayPoint(p,editor.mapCrs!)));map.fitBounds(bounds,{padding:90,maxZoom:21,duration:300})}
    }catch(e){latest.current.mapError((e as Error).message)}}
    if(map.isStyleLoaded()||map.getLayer('slabs-fill-layer'))mount();else map.on('load',mount)
    map.on('style.load',mount)
    return()=>{active=false;map.off('load',mount);map.off('style.load',mount);dispose?.()}
  },[mapRef,editor.canEdit,editor.mapSupported,editor.candidatePoints,editor.drawing,editor.vertexEditing,editor.mapEditSession,editor.activeVertex,editor.mapCrs,editor.scope])
}
