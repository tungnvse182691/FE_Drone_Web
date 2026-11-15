const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),crypto=require('crypto')
const rev='b89a52fe11ed146f197f3f94e115530b9b75afb0',repo=process.env.ROADGUARD_BE_SOURCE||path.resolve(__dirname,'../../..','nối api đồ án/RoadGuard-web-5180ab9'),dir=path.resolve('artifacts/fasttrack-policy-runtime/domain-harness');fs.mkdirSync(dir,{recursive:true})
const read=f=>cp.execFileSync('git',['-C',repo,'show',rev+':'+f],{encoding:'utf8'})
const files=['RoadGuardSystem.BusinessObjects/Common/Enums.cs','RoadGuardSystem.BusinessObjects/Inspections/GroundTruthMeasurement.cs','RoadGuardSystem.BusinessObjects/Repairs/RepairGuards.cs','RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs','RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs','RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs']
const manifest={revision:rev,files:{}}
for(const f of files){const source=read(f);fs.writeFileSync(path.join(dir,path.basename(f)),source);manifest.files[f]=crypto.createHash('sha256').update(source).digest('hex')}
const intake=read('RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Intake.cs'),eligibility=read('RoadGuardSystem.Repositories/Implementations/Repairs/RepairFtEligibility.cs'),configuration=read('RoadGuardSystem.Repositories/Configurations/GroundTruthMeasurementConfiguration.cs')
for(const [name,source] of [['FieldInspectionWorkflowRepository.Intake.cs',intake],['RepairFtEligibility.cs',eligibility],['GroundTruthMeasurementConfiguration.cs',configuration]]){const target=path.resolve('artifacts/fasttrack-policy-runtime/source',name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,source);manifest.files[name]=crypto.createHash('sha256').update(source).digest('hex')}
const method=intake.slice(intake.indexOf('    private static GroundTruthMeasurement[] ValidateMeasurements(FieldInspectionTask task, FieldSubmissionInputFact'),intake.indexOf('    private async Task<List<string>> ReadinessAsync'))
assert.ok(method.includes('decimal.Round(v, 6) != v'));assert.ok(configuration.includes('decimal(19,6)'));assert.ok(configuration.includes("[ValueState]='UNKNOWN' AND [Value] IS NULL"));assert.ok(configuration.includes("[Unit]=N'm²'"))
const projection=eligibility.slice(eligibility.indexOf('                var facts = new List<RepairMeasurementFact>();'),eligibility.indexOf('\n            }\n        }\n        if (authorization',eligibility.indexOf('var facts = new List<RepairMeasurementFact>()')))
assert.ok(projection.includes('fact.ValueState == "KNOWN" ? fact.Value : null'));assert.ok(projection.includes('policy.Evaluate(facts,'));assert.ok(projection.includes('STOP_CONDITION_OBSERVATION_UNKNOWN'))
const readinessStart=intake.indexOf('        var missing = new HashSet<string>(StringComparer.Ordinal);')
const readiness=intake.slice(readinessStart,intake.indexOf('        var proof = input.LocationProof;',readinessStart));assert.ok(readiness.includes('MEASUREMENT_VALUE_UNKNOWN'))
manifest.validatorSha256=crypto.createHash('sha256').update(method).digest('hex');manifest.eligibilityCoreSha256=crypto.createHash('sha256').update(projection).digest('hex');fs.writeFileSync(path.join(dir,'provenance.json'),JSON.stringify(manifest,null,2))
const nts=path.join(process.env.USERPROFILE,'.nuget/packages/nettopologysuite/2.5.0/lib/netstandard2.0/NetTopologySuite.dll');assert.ok(fs.existsSync(nts),'Need the cached NTS dependency used by BE')
fs.writeFileSync(path.join(dir,'Domain.csproj'),`<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net9.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup><ItemGroup><Reference Include="NetTopologySuite"><HintPath>${nts}</HintPath></Reference></ItemGroup></Project>`)
fs.writeFileSync(path.join(dir,'Program.cs'),`
using System.Text.Json;
using NetTopologySuite.Geometries;
using RoadGuardSystem.aBusinessObjects.Commons;
using RoadGuardSystem.BusinessObjects.Inspections;
using RoadGuardSystem.BusinessObjects.Repairs;
using RoadGuardSystem.BusinessObjects.PersistenceFacts.Inspections;
using RoadGuardSystem.DTOs.Repairs;
// Data-only task pins adapter. Validator method body and persistence input records are pinned BE source.
record TaskPins(Guid RoadSectionVersionId, Guid DefectId, Guid? SurveyId, FieldInspectionPurpose Purpose, byte RequiredMeasurementType);
record FormPayload(string Name, RepairPolicyDefinitionInput Body);
static class RoadCoverageResolver { internal static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web); }
class Program {
 static int count;
 static readonly Guid Project=Guid.NewGuid(),Actor=Guid.NewGuid(),Route=Guid.NewGuid(),Defect=Guid.NewGuid(),Session=Guid.NewGuid();
 static readonly DateTimeOffset Now=DateTimeOffset.Parse("2026-11-16T00:00:00Z");
 static void Check(bool value,string message="Assertion failed") { if(!value)throw new Exception(message); }
 static void Reject(Action action) { try{action();}catch(ArgumentException){return;}throw new Exception("Expected rejection"); }
 static void Test(string name,Action action){action();count++;Console.WriteLine("PASS "+name);}
 ${method.replace('private static','public static').replace('FieldInspectionTask task','TaskPins task')}
 static string[] Reasons(RepairPolicyRevision policy,GroundTruthMeasurement[] values,string payloadJson="{}") {
   var missing=new List<string>();var assessment=new {PayloadJson=payloadJson};
   ${projection}
   return missing.ToArray();
 }
 static string[] MeasurementReadiness(TaskPins task,FieldSubmissionInputFact input) {
   ${readiness}
   return missing.ToArray();
 }
 static FieldSubmissionInputFact Input(FieldMeasurementInputFact[]? rows)=>new(Guid.NewGuid(),Guid.NewGuid(),null,rows,[],null,"MEASUREMENT",null,null);
 static FieldMeasurementInputFact Row(string type,decimal? value,string state,string dimension,string unit,string? reason=null,string sample="sample")=>new(sample,type,value,state,reason,dimension,unit,null,null,"Unit-test location unavailable","instrument","method");
 static TaskPins Pins(string type="Area")=>new(Route,Defect,null,FieldInspectionPurpose.PreMeasurement,(byte)Enum.Parse<MeasurementType>(type));
 static GroundTruthMeasurement Capture(string type,decimal? value,string state="KNOWN",string dimension="AREA",string unit="m²",string? reason=null)=>ValidateMeasurements(Pins(type),Input([Row(type,value,state,dimension,unit,reason)]),Session,Actor,Now).Single();
 static RepairPolicyRevision Policy(RepairMeasurementRule[] rules,string[]? stops=null)=>RepairPolicyRevision.Publish(Guid.NewGuid(),Project,1,Actor,UserRoleCode.ProjectManager,Now,"CRACK","test-checklist",rules,stops??[]);
 static void Main(){
  Console.InputEncoding=new System.Text.UTF8Encoding(false);Console.OutputEncoding=new System.Text.UTF8Encoding(false);
  Test("Area=4 requires AREA/m²; m2 and LENGTH are rejected before materialization",()=>{Check((byte)MeasurementType.Area==4);Reject(()=>Capture("Area",1m,unit:"m2"));Reject(()=>Capture("Area",1m,dimension:"LENGTH"));var r=Capture("Area",1m,unit:"M²");Check(r.Unit=="m²"&&r.Value==1m);});
  Test("length types accept exact mm/cm/m, preserve values, reject AREA or unknown units",()=>{foreach(var type in new[]{"DepressionDepth","SlabFaultingHeight","ShoulderErosionExtent"})foreach(var u in new[]{"mm","cm","m"}){var r=Capture(type,1.25m,dimension:"LENGTH",unit:u);Check(r.Unit==u&&r.Value==1.25m);}Reject(()=>Capture("DepressionDepth",1m,unit:"mm"));Reject(()=>Capture("DepressionDepth",1m,dimension:"LENGTH",unit:"km"));});
  Test("KNOWN zero remains zero; UNKNOWN remains null with reason, contradictory state/value rejected",()=>{var z=Capture("Area",0m);Check(z.ValueState=="KNOWN"&&z.Value==0m);var u=Capture("Area",null,"UNKNOWN",reason:"Not measured");Check(u.ValueState=="UNKNOWN"&&u.Value is null);Reject(()=>Capture("Area",null));Reject(()=>Capture("Area",0m,"UNKNOWN",reason:"unknown"));Reject(()=>Capture("Area",null,"UNKNOWN"));Reject(()=>Capture("Area",-1m));});
  Test("actual intake rejects excess precision/range/duplicate samples instead of rounding",()=>{Check(Capture("Area",0.123456m).Value==0.123456m);Reject(()=>Capture("Area",0.1234567m));Reject(()=>Capture("Area",10000000000000m));Reject(()=>ValidateMeasurements(Pins(),Input([Row("Area",1m,"KNOWN","AREA","m²"),Row("Area",2m,"KNOWN","AREA","m²")]),Session,Actor,Now));});
  Test("readiness distinguishes missing and UNKNOWN from KNOWN zero",()=>{Check(MeasurementReadiness(Pins(),Input([])).Contains("MEASUREMENT_MISSING"));Check(MeasurementReadiness(Pins(),Input([Row("Area",null,"UNKNOWN","AREA","m²","unknown")])).Contains("MEASUREMENT_VALUE_UNKNOWN"));Check(MeasurementReadiness(Pins(),Input([Row("Area",0m,"KNOWN","AREA","m²")])).Length==0);});
  Test("policy Evaluate inclusive lower/upper bounds, no implicit unit conversion",()=>{var p=Policy([new("Area","m²",1m,2m)]);Check(Reasons(p,[Capture("Area",1m)]).Length==0);Check(Reasons(p,[Capture("Area",2m)]).Length==0);Check(Reasons(p,[Capture("Area",0.999999m)]).Contains("POLICY_THRESHOLDNOTMET"));Check(Reasons(p,[Capture("Area",2.000001m)]).Contains("POLICY_THRESHOLDNOTMET"));var d=Policy([new("DepressionDepth","cm",0m,5m)]);Check(Reasons(d,[Capture("DepressionDepth",5m,dimension:"LENGTH",unit:"mm")]).Contains("POLICY_WRONGUNIT"));});
  Test("legacy policy m2 can publish generically but cannot Evaluate stored Area/m²",()=>{var p=Policy([new("Area","m2",0m,1m)]);Check(Reasons(p,[Capture("Area",.5m)]).Contains("POLICY_WRONGUNIT"));});
  Test("actual eligibility core fails missing, duplicate or UNKNOWN measurement sources, accepts KNOWN zero",()=>{var p=Policy([new("Area","m²",0m,1m)]);Check(Reasons(p,[]).Contains("POLICY_MEASUREMENT_SOURCE_NOT_UNIQUE"));Check(Reasons(p,[Capture("Area",null,"UNKNOWN",reason:"unknown")]).Contains("POLICY_UNKNOWNMEASUREMENT"));Check(Reasons(p,[Capture("Area",0m)]).Length==0);Check(Reasons(p,[Capture("Area",0m),Capture("Area",0m)]).Contains("POLICY_MEASUREMENT_SOURCE_NOT_UNIQUE"));});
  Test("stop observation UNKNOWN is not false; explicit true blocks and false permits policy evaluation",()=>{var p=Policy([new("Area","m²",0m,1m)],["TEST_STOP"]);var r=new[]{Capture("Area",.5m)};Check(Reasons(p,r).Contains("STOP_CONDITION_OBSERVATION_UNKNOWN"));Check(Reasons(p,r,"{\\"stopConditions\\":{\\"TEST_STOP\\":null}}").Contains("STOP_CONDITION_OBSERVATION_UNKNOWN"));Check(Reasons(p,r,"{\\"stopConditions\\":{\\"TEST_STOP\\":true}}").Contains("POLICY_STOPCONDITION"));Check(Reasons(p,r,"{\\"stopConditions\\":{\\"TEST_STOP\\":false}}").Length==0);});
  Test("policy domain rejects invalid bounds/precision/duplicate rules and empty rules are NotConfigured",()=>{Reject(()=>Policy([new("Area","m²",2m,1m)]));Reject(()=>Policy([new("Area","m²",0m,.1234567m)]));Reject(()=>Policy([new("Area","m²",0m,1m),new("Area","m²",0m,1m)]));Check(Policy([]).Evaluate([],[]).Reason==RepairEligibilityReason.NotConfigured);});
  Test("measurement-eligible is not execution permission without time, coverage and location",()=>{var task=Guid.NewGuid();var assignment=Guid.NewGuid();var crew=Guid.NewGuid();var policy=Guid.NewGuid();var a=RepairExecutionAuthorization.Issue(Guid.NewGuid(),Project,Defect,task,assignment,crew,Actor,Now,"test",RepairTaskMode.ConditionalFastTrack,"frame",policy);var facts=new RepairExecutionFacts(Project,Defect,task,assignment,crew,"frame",policy,true,true,RepairFactState.Confirmed,true,true,true,false,false);Check(a.Evaluate(Now,facts).Reason==RepairEligibilityReason.UnprovenTime);a.RecordFirstStart(Guid.NewGuid(),"test-origin-hash",Now,Now,RepairTimeProvenance.VerifiedOnline);Check(a.Evaluate(Now,facts).Eligible);Check(a.Evaluate(Now,facts with {Coverage=RepairFactState.Unknown}).Reason==RepairEligibilityReason.CoverageUnknown);Check(a.Evaluate(Now,facts with {LocationVerified=false}).Reason==RepairEligibilityReason.LocationUnverified);Check(a.Evaluate(Now,facts with {MeasurementsEligible=false}).Reason==RepairEligibilityReason.ThresholdNotMet);});
  var forms=JsonSerializer.Deserialize<FormPayload[]>(Console.In.ReadToEnd(),RoadCoverageResolver.Json)!;
  foreach(var f in forms)Test("real form payload -> real BE domain/intake/eligibility: "+f.Name,()=>{var p=Policy(f.Body.Measurements,f.Body.StopConditions);var rows=p.Measurements.Select(r=>Capture(r.Code,r.Maximum,dimension:r.Code=="Area"?"AREA":"LENGTH",unit:r.Unit)).ToArray();var payload=JsonSerializer.Serialize(new {stopConditions=p.StopConditions.ToDictionary(code=>code,code=>(bool?)false)});Check(Reasons(p,rows,payload).Length==0);for(int i=0;i<rows.Length;i++)Check(rows[i].Value==p.Measurements[i].Maximum&&rows[i].Unit==p.Measurements[i].Unit);});
  Console.WriteLine(count+" actual BE validator/domain groups PASS; SQL/runtime mutation NOT_RUN");
 }
}
`)
// Actual form events produce the DTOs consumed by the real BE classes above.
console.log(cp.execFileSync('node',['tools/check-fasttrack-forms.cjs','--capture-policy'],{encoding:'utf8',timeout:60000}))
const build=cp.spawnSync('dotnet',['build',path.join(dir,'Domain.csproj'),'--nologo','--verbosity','quiet','-p:RestoreIgnoreFailedSources=true'],{encoding:'utf8',timeout:60000,windowsHide:true});assert.equal(build.status,0,build.stdout+'\n'+build.stderr)
const run=cp.spawnSync('dotnet',[path.join(dir,'bin/Debug/net9.0/Domain.dll')],{input:fs.readFileSync('artifacts/fasttrack-policy-runtime/form-payloads.json','utf8'),encoding:'utf8',timeout:10000,windowsHide:true});console.log(run.stdout);assert.equal(run.status,0,run.stderr)
console.log('Pinned source: '+rev+'; provenance hashes: '+path.join(dir,'provenance.json'))
