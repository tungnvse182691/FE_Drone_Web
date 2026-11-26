// SourceHash uses these exact JSON property names, order and explicit nulls.
// Only support the route-only frame here; never discard a BE pin to force a match.
export async function verifiedRouteFrame(routeVersionId:string, locationVersion:string) {
  if (!routeVersionId) return null
  const pins={routeVersionId,segmentSetId:null,layoutRevisionId:null,slabId:null,crsProfileRevisionId:null}
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(pins)))
  const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')
  return locationVersion===`h4-frame-v1:${hex}` ? pins : null
}
export function matchesSurveyDetection(run:{id:string;processingJobId:string;surveyTaskId:string;status:string},result:{runId:string;jobId:string;detections:{detectionId:string;frameFileId:string}[]},detection:string,frames:string[]) {
  return !!(detection && run.surveyTaskId && run.processingJobId && run.status==='SUCCEEDED' && result?.runId===run.id && result.jobId===run.processingJobId && Array.isArray(result.detections) && result.detections.filter(d=>d.detectionId===detection && !!d.frameFileId && frames.includes(d.frameFileId)).length===1)
}
