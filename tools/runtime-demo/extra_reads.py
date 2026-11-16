import run,json
from run import ROOT,Actor
operator=Actor('operator-a');sup=run.sup;pm=run.pm
out={'operatorId':operator.id,'role':'OPERATOR','reads':{}}
for path in ['/me','/projects','/me/inspection-tasks']:
 out['reads'][path]=operator.req('GET',path)
for project in ['4485d5c6-b617-4240-9d4b-07da5e13b43e']:
 out['pmNotifications']=pm.req('GET','/notifications?limit=100');out['supNotifications']=sup.req('GET','/notifications?limit=100')
(ROOT/'operator-notifications-read.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8');print({k:v['status'] for k,v in out['reads'].items()});print('Notifications',out['pmNotifications']['status'],out['supNotifications']['status'])
