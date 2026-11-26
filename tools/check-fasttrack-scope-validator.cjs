const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),cp=require('child_process'),crypto=require('crypto')
const revision='b89a52fe11ed146f197f3f94e115530b9b75afb0'
const repo=process.env.ROADGUARD_BE_SOURCE || path.resolve(__dirname,'../../..','nối api đồ án/RoadGuard-web-5180ab9')
const file='RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionTask.cs'
const source=cp.execFileSync('git',['-C',repo,'show',`${revision}:${file}`],{encoding:'utf8'})
const start=source.indexOf('    private static string ValidateScope(string value)'),end=source.indexOf('    private static string Normalize(',start)
assert.ok(start>=0 && end>start,'Pinned runtime ValidateScope not found')
const method=source.slice(start,end).trimEnd()
const dir=path.resolve(__dirname,'../artifacts/fasttrack-scope-validator-b89a52f');fs.mkdirSync(dir,{recursive:true})
fs.writeFileSync(path.join(dir,'Validator.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net9.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup></Project>')
// Compile the exact backend method, changing accessibility only; no BE source or database edits.
fs.writeFileSync(path.join(dir,'Program.cs'),`using System.Text.Json;\nclass Program {\n${method.replace('private static','public static')}\nstatic void Main() { var inputs=JsonSerializer.Deserialize<string?[]>(Console.In.ReadToEnd())!; var results=inputs.Select(value=>{try{return ValidateScope(value!) is not null;}catch(ArgumentException){return false;}}).ToArray();Console.Write(JsonSerializer.Serialize(results));}\n}`)
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/api/services/fastTrackMeasurementScope.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,JSON,Array,Error})
const {fastTrackMeasurementScope,assertFastTrackMeasurementScope}=m.exports
const description='  Phạm vi TEST-FASTTRACK: từ 3–4 m.\nKhông phải bằng chứng thực địa.  ',notes='Giữ nguyên chỉ dẫn: đo lại trước khi thi công.'
const generated=fastTrackMeasurementScope(description,notes)
assert.equal(generated.measurementScope,'{}');assert.equal(generated.instructions,notes+'\n'+description)
assert.throws(()=>fastTrackMeasurementScope('a'.repeat(1000),'b'),/1000/)
const nested=n=>'{'+'"x":'.repeat(0)+'"x":'+ '['.repeat(n-1)+'0'+']'.repeat(n-1)+'}'
const cases=[generated.measurementScope,' {} ','{"range":{"from":3,"to":4}}',description,'[]','null','true','"plain"','42','',null,'{"x":1,}','/*comment*/{}',nested(64),nested(65),'{"x":'+nested(64)+',"x":0}',JSON.stringify({text:'brackets [ ] { } and escaped \\" quote'})]
const build=cp.spawnSync('dotnet',['build',path.join(dir,'Validator.csproj'),'--nologo','--verbosity','quiet','-p:RestoreIgnoreFailedSources=true'],{encoding:'utf8',timeout:60000,windowsHide:true})
assert.equal(build.status,0,build.stdout+'\n'+build.stderr)
const run=cp.spawnSync('dotnet',[path.join(dir,'bin/Debug/net9.0/Validator.dll')],{input:JSON.stringify(cases),encoding:'utf8',timeout:10000,windowsHide:true})
assert.equal(run.status,0,run.stderr)
const expected=JSON.parse(run.stdout)
for(let i=0;i<cases.length;i++){let actual=true;try{assertFastTrackMeasurementScope(cases[i])}catch{actual=false}assert.equal(actual,expected[i],`Mismatch at case ${i}`)}
assert.equal(expected[0],true);assert.equal(expected[3],false);assert.equal(expected[13],true);assert.equal(expected[14],false)
console.log(`PASS ${cases.length} cases against compiled runtime ValidateScope at ${revision}; method SHA256 ${crypto.createHash('sha256').update(method).digest('hex')}`)
console.log('PASS new payload uses object scope and preserves all entered instructions; no runtime HTTP requests')
