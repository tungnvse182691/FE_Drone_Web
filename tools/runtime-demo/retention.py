"""Evaluate retention of the existing three TEST videos; no basis fabrication or deletion."""
import run,json,urllib.request,http.cookiejar,time
from run import ROOT,Actor,CTX,raw
main=json.loads((ROOT/'survey-progress.json').read_text(encoding='utf-8'));run.LEDGER=ROOT/'retention-progress.json'
run.state=json.loads(run.LEDGER.read_text(encoding='utf-8')) if run.LEDGER.exists() else {'marker':'TEST-E2E-RETENTION-20261116','commands':{},'cases':[]}
state=run.state;save=run.save
# RetentionController at b89a52fe11ed has no WebCookieEligible. This explicit
# transport is limited to the retention requests below, never a 401/403 fallback.
def bearer_actor(key,expected):
 a=next(a for a in run.accounts if a['key']==key);op=urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))
 r=raw(op,'POST','/auth/login',{'email':a['email'],'password':a['password']});assert r['status']==200 and r['data']['user']['id']==expected
 actor=object.__new__(Actor);actor.key=key;actor.id=expected;actor.op=op;actor.bearer=r['data']['accessToken'];return actor
sup=bearer_actor('supervisor',run.sup.id);pm=bearer_actor('pm-a',run.pm.id)
for i,source in enumerate(main['cases'],1):
 tag=state['marker']+'-'+str(i);p=source['projectId'];fid=source['videoVerifiedRead']['data']['fileId'];base='/projects/'+p+'/retention'
 if len(state['cases'])<i:state['cases'].append({'tag':tag,'projectId':p,'fileId':fid})
 c=state['cases'][i-1];save()
 try:
  c['cookieReadProbe']=run.sup.req('GET',base+'/files/'+fid);c['fileBefore']=sup.get(base+'/files/'+fid);save()
  receipt=sup.command(tag+'-evaluation',base+'/evaluations',{'fileIds':[fid]})['data'];c['receipt']=receipt;eid=receipt['id'];save()
  read=sup.get(base+'/evaluations/'+eid)
  for _ in range(5):
   if read['data']['status'] not in ['QUEUED','RUNNING','PROCESSING']:break
   time.sleep(2);read=sup.get(base+'/evaluations/'+eid)
  c['supEvaluationRead']=read;c['pmEvaluationRead']=pm.get(base+'/evaluations/'+eid);c['fileAfter']=sup.get(base+'/files/'+fid);c.pop('blocker',None);save();print(tag+' '+read['data']['status']+' items '+json.dumps(read['data'].get('items'),ensure_ascii=False)[:350],flush=True)
 except Exception as e:c['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:450],flush=True)
