import run,json,datetime,uuid,time,hashlib,zipfile
from run import ROOT,Actor
field=json.loads((ROOT/'field-progress.json').read_text(encoding='utf-8'));run.LEDGER=ROOT/'repair-progress.json';run.state=json.loads(run.LEDGER.read_text(encoding='utf-8')) if run.LEDGER.exists() else {'commands':{},'cases':[]};state=run.state;save=run.save;pm=run.pm;sup=run.sup;crew=Actor('crew-a')
for n,f in enumerate(field['cases'],1):
 tag='TEST-E2E-REPAIR-20261116-'+str(n);p=f['projectId'];base='/projects/'+p
 if len(state['cases'])<n:state['cases'].append({'tag':tag,'projectId':p});save()
 case=state['cases'][n-1]
 for mode,start in [('FAST_TRACK',3),('NORMAL',5)]:
  prefix=tag+'-'+mode
  try:
   d=pm.get(base+'/defects/'+f['defectId']);work=pm.get(base+'/work-package')['data'];road=next(r for r in work['roadSections'] if r['currentVersionId']==d['data']['roadSectionVersionId']);source=pm.get(base+'/field-inspection-tasks/'+f['taskId'])['data'];checklist=tag+' checklist'
   pkg=pm.command(prefix+'-package',base+'/repair-packages',{'defectId':d['data']['id'],'defectVersion':d['data']['version'],'reason':prefix+' synthetic scope only','obligations':[{'kind':'FORMAL_REPAIR','mandatory':True,'scope':{'physicalRoadId':road['roadSectionId'],'routeVersionId':road['currentVersionId'],'segmentSetId':source['segmentSetId'],'layoutRevisionId':None,'slabId':None,'fromMeters':start,'toMeters':start+1,'offsetFromMeters':0,'offsetToMeters':1},'reason':prefix+' test obligation'}]},d['etag'])['data'];root=base+'/repair-packages/'+pkg['id']+'/items'
   item=pm.command(prefix+'-propose',root,{'obligationId':pkg['unresolvedMandatoryObligationIds'][0],'mode':mode,'repairPlan':prefix+' synthetic TEST repair plan; no physical execution','checklistVersion':checklist,'reason':prefix+' test proposal'},'"'+pkg['version']+'"')['data'];path=root+'/'+item['id'];case.setdefault(mode,{})['itemRead']=pm.get(path);save()
   policy=None
   if mode=='NORMAL':
    fresh=sup.get(path);sup.command(prefix+'-approve',path+'/approve',{'reason':prefix+' TEST plan review only'},fresh['etag'])
   else:
    draft=pm.command(prefix+'-policy',base+'/repair-policies/drafts',{'defectTypeCode':d['data']['defectTypeCode'],'checklistVersion':checklist,'measurements':[{'code':'Area','unit':'m²','minimum':0,'maximum':0.6}],'stopConditions':[],'reason':prefix+' TEST policy not permission'})['data'];fresh=pm.get(base+'/repair-policies/drafts/'+draft['id']);pub=pm.command(prefix+'-publish',base+'/repair-policies/drafts/'+draft['id']+'/publish',{'reason':prefix+' TEST policy publish'},fresh['etag'])['data'];policy=pub['id']
   fresh=pm.get(path);task={k:source.get(k) for k in ['sourceKind','surveyId','routeVersionId','segmentSetId','layoutRevisionId','slabId','mapPublicationId','crsProfileRevisionId']};task.update({'defectId':d['data']['id'],'defectVersion':d['data']['version'],'purpose':'POST_REPAIR','requiredMeasurementType':4,'measurementScope':'{}','instructions':prefix+' TEST conditional assignment; not executed or externally verified','assignedToUserId':crew.id,'dueAt':case.setdefault('dueAt',(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=3)).isoformat())});save()
   binding=pm.command(prefix+'-assign',path+'/assign',{'task':task,'policyRevisionId':policy,'reason':prefix+' TEST assignment'},fresh['etag'])['data'];case[mode].update({'binding':binding,'itemReadAfterAssign':pm.get(path),'crewTaskRead':crew.get(base+'/field-inspection-tasks/'+binding['taskId']),'pmTaskRead':pm.get(base+'/field-inspection-tasks/'+binding['taskId']),'eligibility':pm.req('GET',path+'/eligibility')});save();print(prefix+' assigned and GET verified',flush=True)
  except Exception as e:case.setdefault(mode,{})['blocker']=str(e);save();print(prefix+' BLOCKED '+str(e)[:400],flush=True)
 try:
  job=pm.command(tag+'-final-export',base+'/exports',{'kind':'DOSSIER','format':'PDF','includeOriginalFiles':False})['data'];path=base+'/exports/'+job['id'];detail=pm.get(path)
  for _ in range(8):
   if detail['data']['status'] in ['SUCCEEDED','FAILED']:break
   time.sleep(2);detail=pm.get(path)
  case['export']={'detail':detail,'manifest':pm.get(path+'/manifest')}
  if detail['data']['status']=='SUCCEEDED':
   content=pm.req('GET',path+'/content',binary=True);digest=hashlib.sha256(content['data']).hexdigest();assert content['status']==200 and content['etag']=='"'+digest+'"';(ROOT/(tag+'.pdf')).write_bytes(content['data']);case['export'].update({'sha256':digest,'size':len(content['data'])})
  save();print(tag+' final export '+detail['data']['status'],flush=True)
 except Exception as e:case['exportBlocker']=str(e);save();print('Export '+str(e)[:300],flush=True)
