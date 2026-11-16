"""Submit visibly synthetic test video, with no telemetry or claim of surveyed coverage."""
import run,json,hashlib,uuid,time,urllib.request
from run import ROOT,Actor,CTX
run.LEDGER=ROOT/'survey-progress.json';run.state=json.loads(run.LEDGER.read_text(encoding='utf-8'));state=run.state;save=run.save;op=Actor('operator-a');pm=run.pm;sup=run.sup
video=(ROOT/'TEST-SYNTHETIC-NOT-FLIGHT.mp4').read_bytes();sha=hashlib.sha256(video).hexdigest()
assert b'ftyp' in video[:12], 'Use a real encoded synthetic MP4, not bytes with a fake extension'
for c in state['cases']:
 tag=c['tag'];p=c['projectId'];tid=c['taskId'];path='/survey-tasks/'+tid
 try:
  fresh=op.get(path);c['beforeDataset']=fresh;save()
  upload=op.command(tag+'-test-video-upload','/uploads',{'purpose':'SURVEY_VIDEO','projectId':p,'targetId':tid,'fileName':tag+'-SYNTHETIC-NOT-FLIGHT.mp4','mediaType':'video/mp4','sizeBytes':len(video),'checksumSha256':sha})['data'];root='/uploads/'+upload['id'];u=op.get(root)
  if u['data']['status'] not in ['VERIFYING','VERIFIED']:
   key=c.setdefault('partUrlKey',str(uuid.uuid4()));save();urls=op.req('POST',root+'/part-urls',{'partNumbers':[1]},{'Idempotency-Key':key});assert urls['status']==200,urls
   response=urllib.request.urlopen(urllib.request.Request(urls['data']['parts'][0]['url'],data=video,method='PUT'),context=CTX,timeout=30);etag=response.headers['ETag'];c['videoPutStatus']=response.status;save();u=op.get(root);op.command(tag+'-test-video-complete',root+'/complete',{'parts':[{'partNumber':1,'eTag':etag}],'checksumSha256':sha},u['etag'])
  u=op.get(root)
  for _ in range(8):
   if u['data']['status'] in ['VERIFIED','FAILED']:break
   time.sleep(2);u=op.get(root)
  c['videoVerifiedRead']=u;save();assert u['data']['status']=='VERIFIED',u
  drones=op.get(path+'/eligible-drones')['data']['items'];assert drones,'No registered active device; do not invent deviceId'
  body={'videoFileIds':[upload['fileId']],'telemetryFileIds':[],'recordedAt':'2026-11-16T03:15:00Z','deviceId':drones[0]['id'],'scope':c['operatorTaskRead']['data']['scope']}
  old=state['commands'].get(tag+'-dataset');version=old['etag'] if old else op.get(path)['etag']
  result=op.command(tag+'-dataset',path+'/datasets',body,version)['data'];c['datasetReceipt']=result;save();did=result.get('datasetId',result.get('id'));assert did,result
  c['datasetRead']=op.get('/datasets/'+did);c['coverageRead']=op.get('/datasets/'+did+'/coverage');c['pmTaskAfterDataset']=pm.get(path);c['supTaskAfterDataset']=sup.get(path);c.pop('datasetBlocker',None);save();print(tag+' dataset '+did+'; coverage '+json.dumps(c['coverageRead']['data'],ensure_ascii=False)[:300],flush=True)
 except Exception as e:c['datasetBlocker']=str(e);save();print(tag+' DATASET BLOCKED '+str(e)[:450],flush=True)
