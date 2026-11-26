import {segmentSetService,publishedSetForRoute} from './segmentSetService'
import {displayMeters} from '../../utils/projectDistanceDisplay'
import type {ProjectRouteFact} from './projectServerFacts'
import type {Segment} from '../../pages/(pm)/project-overview/types'

/** Overview reads the publication of each explicit current route, never width intervals. */
export async function readProjectPublishedSegments(projectId:string,routes:ProjectRouteFact[]):Promise<Segment[]>{
  const rows:Segment[]=[]
  for(const route of routes){
    const pins={projectId,roadSectionId:route.roadSectionId,routeVersionId:route.routeVersionId}
    const published=publishedSetForRoute(await segmentSetService.list(pins),route.routeVersionId)
    if(!published)continue
    const {data}=await segmentSetService.read(pins,published.id)
    if(data.status!=='PUBLISHED')throw new Error('Bộ phân đoạn đã đổi trạng thái; hãy tải lại.')
    for(const part of data.segments)rows.push({code:part.id!,label:`${route.code || route.name} · Đoạn ${part.sequence}`,stationing:`${displayMeters(part.startStationMeters)} → ${displayMeters(part.endStationMeters)}`,length_km:part.lengthMeters/1000,status_label:'Chưa có dữ liệu tình trạng',status_type:'NORMAL',open_defects:'Chưa có dữ liệu',defects_count:Number.NaN,roadSectionId:route.roadSectionId,routeVersionId:route.routeVersionId,segmentSetId:data.id,routeKind:route.routeKind})
  }
  return rows
}
