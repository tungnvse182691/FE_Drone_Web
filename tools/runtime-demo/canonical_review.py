import run,json,uuid
from run import ROOT,Actor
run.LEDGER=ROOT/'field-progress.json';run.state=json.loads(run.LEDGER.read_text(encoding='utf-8'));state=run.state;save=run.save;crew=Actor('crew-a');pm=run.pm
for case in state['cases']:
 tag=case['tag'];root='/projects/'+case['projectId']+'/field-inspection-tasks/'+case['taskId']
 try:
  previous=state['commands'][tag+'-submit-correct-start-reference']['body'];origin=case.setdefault('followupOrigin',str(uuid.uuid4()));capture=case.setdefault('followupCapture',str(uuid.uuid4()));save();body={**previous,'originId':origin,'parentSubmissionId':case['submission']['id'],'evidence':[{**previous['evidence'][0],'captureOriginId':capture}]};fresh=crew.get(root);sub=crew.command(tag+'-followup-unknown-location',root+'/submissions',body,fresh['etag'])['data'];case['followupSubmission']=sub;save();fresh=pm.get(root)
  name=tag+'-canonical-confirm';c=state['commands'].get(name)
  if not c:c={'actor':'pm-a','path':root+'/reviews','body':{'submissionId':sub['id'],'decision':'CONFIRM','reason':tag+' valid contract negative test; location remains UNKNOWN'},'etag':fresh['etag'],'key':str(uuid.uuid4())};state['commands'][name]=c;save()
  if not c.get('response'):c['response']=pm.req('POST',c['path'],c['body'],{'If-Match':c['etag'],'Idempotency-Key':c['key']});save()
  case['canonicalConfirm']=c['response'];assert c['response']['status']==409 and c['response']['data']['code']=='field_result_insufficient',c['response']
  fresh=pm.get(root);pm.command(tag+'-followup-supplement',root+'/reviews',{'submissionId':sub['id'],'decision':'SUPPLEMENT','reason':tag+' TEST cannot supply actual location; retain UNKNOWN'},fresh['etag']);case['finalRead']=pm.get(root);case['historyAfterReview']=pm.get(root+'/history');case['defectReadAfterField']=pm.get('/projects/'+case['projectId']+'/defects/'+case['defectId']);save();print(tag+' canonical CONFIRM blocked409, SUPPLEMENT201',flush=True)
 except Exception as e:case['followupBlocker']=str(e);save();print(str(e)[:400],flush=True)
