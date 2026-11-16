"""Continue the three existing TEST projects; never fabricate flight/dataset evidence."""
import run,json
from run import ROOT,Actor
main=json.loads((ROOT/'progress.json').read_text(encoding='utf-8'))
run.LEDGER=ROOT/'survey-progress.json'
run.state=json.loads(run.LEDGER.read_text(encoding='utf-8')) if run.LEDGER.exists() else {'marker':'TEST-E2E-SURVEY-20261116','commands':{},'cases':[]}
state=run.state;save=run.save;pm=run.pm;sup=run.sup;operator=Actor('operator-a')
for index,geometry in enumerate(main['cases'],1):
 tag=state['marker']+'-'+str(index);p=geometry['projectId'];base='/projects/'+p
 if len(state['cases'])<index:state['cases'].append({'tag':tag,'projectId':p})
 case=state['cases'][index-1];save()
 try:
  case['beforePlans']=pm.get(base+'/survey-plans?limit=100');case['beforeTasks']=pm.get(base+'/survey-tasks?limit=100');save()
  segments=geometry['publishedSegments']['data'];scope=[{'routeVersionId':segments['routeVersionId'],'segmentSetId':segments['id'],'segmentIds':[s['id'] for s in segments['segments']],'targetBand':'SURFACE'}]
  members=pm.get(base+'/members');case['membersRead']=members;save()
  items=members['data'].get('items',[]) if isinstance(members['data'],dict) else members['data']
  if not any(m.get('userId')==operator.id for m in items):pm.command(tag+'-operator-member',base+'/members',{'userId':operator.id})
  plan=pm.command(tag+'-plan',base+'/survey-plans',{'scope':scope,'plannedAt':'2026-11-17T02:00:00Z','surveyType':'AD_HOC'})['data'];case['planId']=plan['id'];case['planRead']=pm.get('/survey-plans/'+plan['id']);save()
  task=pm.command(tag+'-task',base+'/survey-tasks',{'scope':scope,'surveyType':'AD_HOC','operatorId':operator.id,'dueAt':'2026-11-20T02:00:00Z','planId':plan['id']})['data'];tid=task['id'];case['taskId']=tid;save()
  path='/survey-tasks/'+tid;fresh=operator.get(path);case['beforeAccept']=fresh;save()
  if fresh['data']['status']=='NEW_ASSIGNED':operator.command(tag+'-accept',path+'/accept',{},fresh['etag'])
  case['operatorTaskRead']=operator.get(path);case['pmTaskRead']=pm.get(path);case['supTaskRead']=sup.get(path);case['workPackage']=operator.get(path+'/work-package');case['eligibleDrones']=operator.get(path+'/eligible-drones');case['operatorList']=operator.get('/me/survey-tasks?limit=100');case.pop('blocker',None);save()
  print(tag+' task '+tid+' Operator '+case['operatorTaskRead']['data']['status']+'; PM/Sup read200; no flight evidence submitted',flush=True)
 except Exception as e:case['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:500],flush=True)
