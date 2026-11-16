import run
from run import Actor,ROOT
import json,pathlib,datetime,uuid,time,urllib.request,hashlib
main=json.loads((ROOT/'progress.json').read_text(encoding='utf-8'));run.LEDGER=ROOT/'field-progress.json';run.state=json.loads(run.LEDGER.read_text(encoding='utf-8')) if run.LEDGER.exists() else {'marker':'TEST-E2E-FIELD-20261116','commands':{},'cases':[]};state=run.state;save=run.save
pm=run.pm;sup=run.sup;reporter=Actor('reporter-a');crew=Actor('crew-a')
file=reporter.get('/reporter-evidence/files/41ee9633-dcc6-4256-8259-a4ae9855477a')['data']
for index,geometry in enumerate(main['cases'],1):
 tag='TEST-E2E-FIELD-20261116-'+str(index);p=geometry['projectId'];base='/projects/'+p
 if len(state['cases'])<index:state['cases'].append({'tag':tag,'projectId':p});save()
 case=state['cases'][index-1]
 try:
  work=pm.get(base+'/work-package')['data'];road=next(r for r in work['roadSections'] if r.get('currentVersionId'));rid=road['currentVersionId'];sets=pm.get(base+'/road-sections/'+road['roadSectionId']+'/versions/'+rid+'/segment-sets')['data']['items'];seg=next(s for s in sets if s['status']=='PUBLISHED');gp=pm.get(base+'/geometry-package?routeVersionId='+rid+'&segmentSetId='+seg['id'])
  report=reporter.command(tag+'-report','/reports',{'description':tag+' SYNTHETIC demo. Existing TEST image reused; not new physical evidence, location UNKNOWN.','evidence':[{'fileId':file['id'],'fileVersion':file['version'],'locationSource':'UNKNOWN'}]})['data'];case['reportId']=report['id'];save()
  cases=sup.get('/cases?pageSize=100')['data']['items'];incident=next(c for c in cases if report['id'] in c['reportIds']);cid=incident['id'];case['caseId']=cid;save();fresh=sup.get('/cases/'+cid)
  sup.command(tag+'-triage','/cases/'+cid+'/triage',{'projectId':p,'verificationMethod':'EXISTING_EVIDENCE','reason':tag+' test routing','routeVersionId':rid,'segmentSetId':seg['id'],'geometryVersion':gp['etag'].strip('"')},fresh['etag'])
  candidate=pm.get(base+'/candidates?sourceKind=REPORT&sourceId='+report['id'])['data'];decision=pm.command(tag+'-keep',base+'/candidate-decisions',{'sourceKind':'REPORT','sourceId':report['id'],'sourceVersion':candidate['source']['version'],'geometryVersion':candidate['geometryVersion'],'decision':'KEEP_NEW','classification':{'defectTypeCode':'CRACK','severity':'LOW','roadSectionVersionId':rid},'reason':tag+' TEST classification; not technically verified'})['data'];d=pm.get(base+'/defects/'+decision['defectId'])['data'];case['defectId']=d['id'];save()
  pm.command(tag+'-member',base+'/members',{'userId':crew.id});native=pm.get(base+'/road-sections/'+road['roadSectionId']+'/versions/'+rid+'/geometry')['data'];due=case.setdefault('dueAt',(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=3)).isoformat());save()
  task=pm.command(tag+'-task',base+'/field-inspection-tasks',{'defectId':d['id'],'defectVersion':d['version'],'routeVersionId':rid,'segmentSetId':seg['id'],'crsProfileRevisionId':native.get('crsProfileRevisionId'),'sourceKind':'REPORTER','purpose':'PRE_MEASUREMENT','requiredMeasurementType':4,'measurementScope':'{}','instructions':tag+' simulated test only. No physical field verification.','assignedToUserId':crew.id,'dueAt':due})['data'];tid=task['id'];case['taskId']=tid;save();root=base+'/field-inspection-tasks/'+tid
  fresh=crew.get(root);crew.command(tag+'-accept',root+'/accept',{'reason':tag+' test accept'},fresh['etag']);fresh=crew.get(root);origin=case.setdefault('startOrigin',str(uuid.uuid4()));startAt=case.setdefault('startAt',datetime.datetime.now(datetime.timezone.utc).isoformat());save();crew.command(tag+'-start',root+'/start',{'originId':origin,'claimedAt':startAt},fresh['etag']);fresh=crew.get(root)
  sid=case.setdefault('submissionOrigin',str(uuid.uuid4()));save();value=0 if index==1 else None;known=index==1
  body={'originId':sid,'startOriginId':origin,'measurements':[{'sampleId':'TEST-area','type':'Area','value':value,'state':'KNOWN' if known else 'UNKNOWN','unknownReason':None if known else 'TEST simulation: not physically measured','dimension':'AREA','unit':'m²','longitude':None,'latitude':None,'locationReason':'TEST location unknown, not field verified','instrument':'TEST simulator','method':'TEST API contract exercise','notes':tag+' synthetic measurement'}],'evidence':[],'locationProof':{'kind':'UNKNOWN'},'captureType':'MEASUREMENT'}
  sub=crew.command(tag+'-submit',root+'/submissions',body,fresh['etag'])['data'];case['submission']=sub;case['pmTaskRead']=pm.get(root);case['history']=pm.get(root+'/history');case['defectReadAfterField']=pm.get(base+'/defects/'+d['id']);save()
  fresh=pm.get(root);review=pm.req('POST',root+'/review',{'submissionId':sub['id'],'decision':'ACCEPT','reason':tag+' TEST acceptance attempt; do not override missing location/evidence'},{'If-Match':fresh['etag'],'Idempotency-Key':case.setdefault('reviewKey',str(uuid.uuid4()))});case['acceptReview']=review;save()
  if review['status']>=400:
   fresh=pm.get(root);pm.command(tag+'-supplement',root+'/review',{'submissionId':sub['id'],'decision':'SUPPLEMENT','reason':tag+' missing real location/evidence; test data cannot verify field'},fresh['etag']);case['supplementRead']=pm.get(root);save()
  print(tag+' FIELD readback complete; ACCEPT status '+str(review['status']),flush=True)
 except Exception as e:case['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:450],flush=True)
