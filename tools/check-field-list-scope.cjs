// Actual FIELD page hooks: late list/project responses must not cross project or actor.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react')
let actor={authEpoch:1,user:{id:'pm',role:'PROJECT_MANAGER'}},slot=0,view
const values=[],effects=[],memos=[],requests=[],projects=[]
const hooks={...React,
 useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],n=>{values[i]=typeof n==='function'?n(values[i]):n}]},
 useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},
 useCallback(fn,deps){const i=slot++,old=memos[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))memos[i]={fn,deps};return memos[i].fn},
 useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}
}
function Header(){return null}function Table(){return null}
const mocks={react:{__esModule:true,default:hooks,...hooks},'react-router-dom':{useSearchParams:()=>[new URLSearchParams()],useNavigate:()=>()=>{}},
 '../../store/authStore':{useAuthStore:()=>actor},'../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},
 '../../api/services/fieldTaskService':{fieldTaskService:{getTasks:({projectId})=>new Promise(resolve=>requests.push({projectId,resolve}))}},
 '../../api/services/projectService':{projectService:{fetchProjects:()=>new Promise(resolve=>projects.push(resolve))}},
 '../../components/ui/Icon':{Icon:()=>null},'./field-tasks/FieldTasksHeader':{FieldTasksHeader:Header},'./field-tasks/MeasurementsTab':{MeasurementsTab:Table}}
const moduleBox={exports:{}}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/pages/(pm)/FieldTasks.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{module:moduleBox,exports:moduleBox.exports,require:n=>{if(n in mocks)return mocks[n];throw Error(n)},console,setTimeout(){}})
const nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)]
function render(){slot=0;view=moduleBox.exports.FieldTasks();for(const e of effects)if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.fn()}}
const flush=async()=>{await Promise.resolve();await Promise.resolve();render()},child=T=>nodes(view).find(n=>n.type===T)
;(async()=>{
 render();const oldProjects=projects[0],oldList=requests[0]
 child(Header).props.onSelectProject('A');render();const a=requests.at(-1)
 child(Header).props.onSelectProject('B');render();const b=requests.at(-1)
 b.resolve([{id:'B-task'}]);await flush();const key=child(Table).key
 a.resolve([{id:'A-task'}]);oldList.resolve([{id:'ALL-task'}]);await flush()
 assert.equal(child(Table).props.fieldTasks[0].id,'B-task')
 actor={authEpoch:2,user:{id:'other-pm',role:'PROJECT_MANAGER'}};render();await flush()
 assert.notEqual(child(Table).key,key);assert.equal(child(Table).props.fieldTasks.length,0)
 oldProjects([{id:'old-project'}]);await flush();assert.equal(child(Header).props.projects.length,0)
 requests.at(-1).resolve([{id:'new-actor-task'}]);projects.at(-1)([{id:'new-project'}]);await flush()
 assert.equal(child(Table).props.fieldTasks[0].id,'new-actor-task');assert.equal(child(Header).props.projects[0].id,'new-project')
 console.log('PASS actual FIELD page: out-of-order A/B/ALL responses and previous actor project catalog cannot overwrite current scope')
})().catch(e=>{console.error(e);process.exitCode=1})
