import { utm48NToWgs84, type RoadGeometryVersionView } from '../../../api/services/alignmentService'
import type { ServerSegmentSet } from '../../../api/services/segmentSetService'
export function surveyBandDisplay(route:RoadGeometryVersionView|undefined,set:ServerSegmentSet|undefined,startKm:number,endKm:number,band:string) {
  const empty:GeoJSON.FeatureCollection={type:'FeatureCollection',features:[]}
  const fail=(message:string)=>({data:empty,message})
  if(!['SURFACE','LEFT_EDGE','RIGHT_EDGE'].includes(band))return fail('Chọn dải khảo sát hợp lệ.');
  if(!route||!set||!Number.isFinite(startKm)||!Number.isFinite(endKm)||!band)return fail('Chọn dải và mốc segment để xem phạm vi.')
  if(route.engineeringSrid!==32648||route.metadataStatus!=='COMPLETE'||set.status!=='PUBLISHED'||set.routeVersionId!==route.routeVersionId||!Number.isFinite(route.stationOriginMeters)||!route.widthProfile?.length)return fail('Chưa đủ metadata metric/bề rộng để vẽ đúng dải; chỉ hiển thị tim tuyến.')
  const segments=set.segments.filter(s=>s.startStationMeters/1000>=startKm&&s.endStationMeters/1000<=endKm)
  if(!segments.length||segments[0].startStationMeters/1000!==startKm||segments.at(-1)!.endStationMeters/1000!==endKm)return fail('Phạm vi chưa khớp segment PUBLISHED; chỉ hiển thị tim tuyến.')
  const features:GeoJSON.Feature[]=[]
  for(const s of segments){
    const pts=s.metricGeometry?.coordinates
    if(!pts||pts.length<2||pts.some(p=>p.length!==2||!p.every(Number.isFinite)))return fail('Thiếu geometry metric segment; chỉ hiển thị tim tuyến.')
    const offsets=[s.fromOffsetMeters];for(let i=1;i<pts.length;i++)offsets.push(offsets[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]))
    if(Math.abs(offsets.at(-1)!-s.toOffsetMeters)>1e-8*Math.max(1,s.lengthMeters))return fail('Geometry metric chưa khớp offset server; chỉ hiển thị tim tuyến.')
    for(const w of route.widthProfile){const from=Math.max(s.fromOffsetMeters,w.fromOffsetMeters),to=Math.min(s.toOffsetMeters,w.toOffsetMeters);if(!(to>from))continue
      const at=(offset:number):[number,number]=>{let i=offsets.findIndex((v,i)=>i>0&&v>=offset);if(i<1)i=pts.length-1;const len=offsets[i]-offsets[i-1],t=len?(offset-offsets[i-1])/len:0;return[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]}
      const line=[at(from),...pts.filter((_,i)=>offsets[i]>from&&offsets[i]<to),at(to)].filter((p,i,a)=>i===0||p[0]!==a[i-1][0]||p[1]!==a[i-1][1]),left:[number,number][]=[],right:[number,number][]=[]
      for(let i=0;i<line.length;i++){const a=line[Math.max(0,i-1)],b=line[Math.min(line.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len||!(w.widthMeters>0))return fail('Thiếu hướng/chiều rộng để xác định trái phải; chỉ hiển thị tim tuyến.');const x=-dy/len*w.widthMeters/2,y=dx/len*w.widthMeters/2;left.push(utm48NToWgs84(line[i][0]+x,line[i][1]+y));right.push(utm48NToWgs84(line[i][0]-x,line[i][1]-y))}
      const geometry:GeoJSON.Geometry=band==='SURFACE'?{type:'Polygon',coordinates:[[...left,...right.reverse(),left[0]]]}:{type:'LineString',coordinates:band==='LEFT_EDGE'?left:right}
      features.push({type:'Feature',properties:{band,segmentId:s.id,source:'SERVER_GEOMETRY_DISPLAY'},geometry})
    }
    const covered=route.widthProfile.filter(w=>w.toOffsetMeters>s.fromOffsetMeters&&w.fromOffsetMeters<s.toOffsetMeters);let end=s.fromOffsetMeters;for(const w of covered){if(Math.max(w.fromOffsetMeters,s.fromOffsetMeters)!==end)return fail('Khoảng bề rộng có khoảng hở/chồng lấn; chỉ hiển thị tim tuyến.');end=Math.min(w.toOffsetMeters,s.toOffsetMeters)}if(end!==s.toOffsetMeters)return fail('Bề rộng chưa phủ phạm vi; chỉ hiển thị tim tuyến.')
  }
  return {data:{type:'FeatureCollection',features} as GeoJSON.FeatureCollection,message:`${band==='SURFACE'?'Mặt đường':band==='LEFT_EDGE'?'Mép trái':'Mép phải'} theo chiều lý trình tăng · vẽ từ geometry/bề rộng server, chỉ để hiển thị.`}
}
