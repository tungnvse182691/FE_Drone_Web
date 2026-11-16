from run import *
fixture=json.loads(pathlib.Path('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json').read_text(encoding='utf-8-sig'))
for case in state['cases']:
 tag=case['tag'];p=case['projectId'];base='/projects/'+p;path=base+'/road-geometry-drafts/'+case['draftId']
 try:
  if state['commands'].get(tag+'-resubmit',{}).get('response',{}).get('status')==409:
   f={**fixture,'roadCode':'TEST-'+tag[-1],'roadName':tag+' synthetic route','changeReason':tag+' actual TEST width revision after review, not field verified','surveyWidthMeters':13}
   f['widthProfile']=[{**r,'widthMeters':7.1} for r in f['widthProfile']]
   fresh=pm.get(path);pm.command(tag+'-content-revision-2',path,f,fresh['etag'],'PUT');fresh=pm.get(path);pm.command(tag+'-submit-content-2',path+'/submit',{},fresh['etag']);case['submissionRead']=sup.get(base+'/road-geometry-submission');save()
  fresh=sup.get(path);confirmed=sup.command(tag+'-confirm',path+'/confirm',{'expectedCurrentVersionId':None,'effectiveFrom':'2026-11-16T00:00:00Z','reason':tag+' confirming synthetic TEST geometry for demo; not survey evidence'},fresh['etag'])['data'];case['confirmed']=confirmed;save()
  work=pm.get(base+'/work-package')['data'];road=next(r for r in work['roadSections'] if r.get('currentVersionId'));rid=road['currentVersionId'];root=base+'/road-sections/'+road['roadSectionId']+'/versions/'+rid+'/segment-sets'
  seg=pm.command(tag+'-segments',root,{'targetLengthMeters':200,'remainderMode':'KEEP'})['data'];fresh=pm.get(root+'/'+seg['id']);pm.command(tag+'-publish',root+'/'+seg['id']+'/publish',{'expectedPublishedSetId':None,'reason':tag+' synthetic TEST segmentation'},fresh['etag']);case['publishedSegments']=pm.get(root+'/'+seg['id']);case['supGeometryRead']=sup.get(base+'/work-package');case.pop('blocker',None);save();print(tag+' geometry+published sets complete',flush=True)
 except Exception as e:case['blocker']=str(e);save();print(tag+' BLOCKED '+str(e)[:400],flush=True)
 for format in ['PDF','ZIP']:
  try:
   job=pm.command(tag+'-export-'+format,base+'/exports',{'kind':'DOSSIER','format':format,'includeOriginalFiles':format=='ZIP'})['data'];eid=job['id'];case.setdefault('exports',{})[format]={'id':eid};save()
   detail=pm.get(base+'/exports/'+eid)
   for attempt in range(6):
    if detail['data']['status'] in ['SUCCEEDED','FAILED']:break
    time.sleep(2);detail=pm.get(base+'/exports/'+eid)
   case['exports'][format]['detail']=detail
   if detail['data']['status']=='SUCCEEDED':
    manifest=pm.get(base+'/exports/'+eid+'/manifest');content=pm.req('GET',base+'/exports/'+eid+'/content',binary=True);digest=hashlib.sha256(content['data']).hexdigest();assert content['status']==200 and content['etag']=='"'+digest+'"';assert content['data'].startswith(b'%PDF') if format=='PDF' else content['data'].startswith(b'PK');(ROOT/(tag+'.'+format.lower())).write_bytes(content['data']);case['exports'][format].update({'manifest':manifest,'sha256':digest,'size':len(content['data']),'contentStatus':content['status']})
   save();print(tag+' '+format+' '+detail['data']['status'],flush=True)
  except Exception as e:case['exports'][format]['blocker']=str(e);save();print('EXPORT BLOCKED '+str(e)[:300],flush=True)
