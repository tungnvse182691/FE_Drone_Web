import run,json,uuid,time,hashlib,urllib.request,datetime
from run import ROOT,Actor,CTX
run.LEDGER=ROOT/'field-progress.json';run.state=json.loads(run.LEDGER.read_text(encoding='utf-8'));state=run.state;save=run.save;crew=Actor('crew-a');pm=run.pm
# The labeled synthetic image is a local artifact, never represented as a field capture.
image=(ROOT/'TEST-synthetic.png').read_bytes();sha=hashlib.sha256(image).hexdigest()
for case in state['cases']:
 tag=case['tag'];p=case['projectId'];root='/projects/'+p+'/field-inspection-tasks/'+case['taskId']
 try:
  upload=crew.command(tag+'-evidence-upload','/uploads',{'purpose':'MEASUREMENT','projectId':p,'targetId':case['taskId'],'fileName':tag+'-SYNTHETIC.png','mediaType':'image/png','sizeBytes':len(image),'checksumSha256':sha})['data'];up='/uploads/'+upload['id'];u=crew.get(up)
  if u['data']['status'] not in ['VERIFYING','VERIFIED']:
   urls=crew.req('POST',up+'/part-urls',{'partNumbers':[1]},{'Idempotency-Key':case.setdefault('partUrlKey',str(uuid.uuid4()))});assert urls['status']==200,urls;save();url=urls['data']['parts'][0]['url'];put=urllib.request.urlopen(urllib.request.Request(url,data=image,method='PUT'),context=CTX,timeout=30);etag=put.headers['ETag'];case['putStatus']=put.status;save();fresh=crew.get(up);crew.command(tag+'-evidence-complete',up+'/complete',{'parts':[{'partNumber':1,'eTag':etag}],'checksumSha256':sha},fresh['etag'])
  u=crew.get(up)
  for _ in range(8):
   if u['data']['status'] in ['VERIFIED','FAILED']:break
   time.sleep(2);u=crew.get(up)
  case['evidenceSession']=u;save();assert u['data']['status']=='VERIFIED',u
  fresh=crew.get(root);old=state['commands'][tag+'-submit']['body'];start=state['commands'][tag+'-start']['receipt']['data'];body={**old,'startOriginId':start['id'],'evidence':[{'captureOriginId':case.setdefault('captureOrigin',str(uuid.uuid4())),'fileId':upload['fileId'],'purpose':'MEASUREMENT','checksumSha256':sha,'mediaType':'image/png','capturedAt':None,'attemptChecklist':None}]};save()
  sub=crew.command(tag+'-submit-correct-start-reference',root+'/submissions',body,fresh['etag'])['data'];case['submission']=sub;case['pmTaskRead']=pm.get(root);case['history']=pm.get(root+'/history');case['defectReadAfterField']=pm.get('/projects/'+p+'/defects/'+case['defectId']);save()
  fresh=pm.get(root);reviewbody={'submissionId':sub['id'],'decision':'ACCEPT','reason':tag+' TEST review; do not bypass missing location'}
  oldreview=state['commands'].get(tag+'-review-accept')
  if oldreview: review=oldreview['response']
  else:
   state['commands'][tag+'-review-accept']={'actor':'pm-a','path':root+'/reviews','body':reviewbody,'etag':fresh['etag'],'key':str(uuid.uuid4())};save();c=state['commands'][tag+'-review-accept'];review=pm.req('POST',c['path'],c['body'],{'If-Match':c['etag'],'Idempotency-Key':c['key']});c['response']=review;save()
  case['acceptReview']=review
  if review['status']>=400:
   fresh=pm.get(root);pm.command(tag+'-review-supplement',root+'/reviews',{'submissionId':sub['id'],'decision':'SUPPLEMENT','reason':tag+' TEST location UNKNOWN; supply valid sources, not fake confirmation'},fresh['etag'])
  case['finalRead']=pm.get(root);case['historyAfterReview']=pm.get(root+'/history');case.pop('blocker',None);save();print(tag+' submit '+sub.get('readiness','')+' accept '+str(review['status'])+' final '+case['finalRead']['data']['status'],flush=True)
 except Exception as e:case['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:450],flush=True)
