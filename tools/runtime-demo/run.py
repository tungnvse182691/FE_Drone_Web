import os,json,subprocess,ssl,urllib.request,urllib.error,http.cookiejar,uuid,pathlib,datetime,hashlib,time
assert os.environ.get('RG_RUNTIME_DEMO_WRITE')=='TEST-E2E-20261116', 'Set RG_RUNTIME_DEMO_WRITE=TEST-E2E-20261116 to authorize these local TEST mutations'
ROOT=pathlib.Path('artifacts/demo-e2e-20261116');ROOT.mkdir(parents=True,exist_ok=True);LEDGER=ROOT/'progress.json';BASE='https://localhost:28443/api/v1';CTX=ssl._create_unverified_context()
state=json.loads(LEDGER.read_text(encoding='utf-8')) if LEDGER.exists() else {'marker':'TEST-E2E-20261116','revision':'b89a52fe11ed146f197f3f94e115530b9b75afb0','commands':{},'cases':[]}
def save():LEDGER.write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf-8')
accounts=json.loads(subprocess.check_output(['docker','exec','roadguard-case409-clean-20261106-api-1','cat','/handoff/demo-accounts.json'],timeout=15))
def raw(op,method,path,body=None,headers=None,binary=False):
 q=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json',**(headers or {})},method=method)
 try:r=op.open(q,timeout=35)
 except urllib.error.HTTPError as e:r=e
 content=r.read();data=content if binary else json.loads(content) if content else None
 return {'status':r.status,'etag':r.headers.get('ETag'),'data':data}
class Actor:
 def __init__(self,key):
  a=next(v for v in accounts if v['key']==key);self.key=key;self.op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),urllib.request.HTTPSHandler(context=CTX));self.bearer=None
  if key in ['supervisor','pm-a']:
   csrf=raw(self.op,'GET','/auth/web/csrf')['data']['requestToken'];r=raw(self.op,'POST','/auth/web/login',{'email':a['email'],'password':a['password']},{'X-CSRF-TOKEN':csrf});assert r['status']==200
   self.id=raw(self.op,'GET','/auth/web/session')['data']['user']['id']
  else:
   r=raw(self.op,'POST','/auth/login',{'email':a['email'],'password':a['password']});assert r['status']==200;self.bearer=r['data']['accessToken'];self.id=r['data']['user']['id']
 def req(self,method,path,body=None,headers=None,binary=False):
  h=headers or {}
  if self.bearer:h={**h,'Authorization':'Bearer '+self.bearer}
  elif method not in ['GET','HEAD']:
   h={**h,'X-CSRF-TOKEN':raw(self.op,'GET','/auth/web/csrf')['data']['requestToken']}
  return raw(self.op,method,path,body,h,binary)
 def get(self,path):
  r=self.req('GET',path)
  if r['status']!=200:raise Exception(str({'path':path,**r}))
  return r
 def command(self,name,path,body,etag=None,method='POST'):
  old=state['commands'].get(name)
  if old and old.get('receipt'):return old['receipt']
  if old and (old['body']!=body or old['path']!=path or old['etag']!=etag):raise Exception('Pending identity changed: '+name)
  if not old:old={'actor':self.key,'path':path,'body':body,'etag':etag,'key':str(uuid.uuid4()),'method':method};state['commands'][name]=old;save()
  r=self.req(method,path,body,{'Idempotency-Key':old['key'],**({'If-Match':etag} if etag else {})});old['response']=r;save()
  if r['status'] not in [200,201,202,204]:raise Exception(str({'command':name,**r}))
  old['receipt']=r;save();return r
sup=Actor('supervisor');pm=Actor('pm-a')
if __name__=='__main__':
 fixture=json.loads(pathlib.Path('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json').read_text(encoding='utf-8-sig'))
 for i in range(1,4):
  tag=state['marker']+'-'+str(i)
  if len(state['cases'])<i:state['cases'].append({'tag':tag});save()
  case=state['cases'][i-1]
  try:
   body={'code':tag,'name':tag+' synthetic geometry demo','engineeringUtmSrid':32648,'description':'TEST synthetic geometry; not surveyed or externally verified','primaryPmId':pm.id,'handoverDate':'2026-11-01','warrantyEndDate':'2027-11-01','handoverFileIds':[]}
   created=sup.command(tag+'-project','/projects',body)['data'];p=created.get('projectId',created.get('id'));case['projectId']=p;save();base='/projects/'+p
   case['projectRead']=sup.get(base+'/work-package');save()
   f={**fixture,'roadCode':'TEST-'+str(i),'roadName':tag+' synthetic route','changeReason':tag+' TEST fixture coordinates; not field verified'}
   draft=pm.command(tag+'-draft',base+'/road-geometry-drafts',f)['data'];d=draft['id'];case['draftId']=d;save();path=base+'/road-geometry-drafts/'+d
   fresh=pm.get(path);pm.command(tag+'-submit',path+'/submit',{},fresh['etag']);fresh=sup.get(path)
   rejection=sup.command(tag+'-reject',path+'/reject',{'reason':tag+' test review round: revise same draft'},fresh['etag']);case['rejectedRead']=sup.get(base+'/road-geometry-submission');save()
   fresh=pm.get(path);f={**f,'changeReason':tag+' revised TEST fixture; still not field verified'};pm.command(tag+'-update',path,f,fresh['etag'],'PUT');fresh=pm.get(path);pm.command(tag+'-resubmit',path+'/submit',{},fresh['etag']);case['submissionRead']=sup.get(base+'/road-geometry-submission');save()
  except Exception as e:case['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:500]);continue
  print(tag+' project/draft/reject/revise/resubmit runtime complete')
