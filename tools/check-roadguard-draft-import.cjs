const fs = require('fs'), vm = require('vm'), assert = require('assert/strict'), ts = require('typescript')
const moduleUnderTest = { exports: {} }
const code = ts.transpileModule(fs.readFileSync('src/pages/(pm)/alignment/roadGuardDraftImportHelpers.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText
vm.runInNewContext(code, { module: moduleUnderTest, exports: moduleUnderTest.exports, Error })
const { parseRoadGuardDraftJson: parse, RoadGuardDraftValidationError } = moduleUnderTest.exports
const sampleText = fs.readFileSync('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json', 'utf8')
const sample = JSON.parse(sampleText)
const clone = value => JSON.parse(JSON.stringify(value))
const plain = value => JSON.parse(JSON.stringify(value))
const line = {
  sourceKind: 'COORDINATES', sourceCrs: 32648, stationOriginMeters: 0,
  changeReason: ' Nhập tuyến ', coordinates: [{ x: 500000, y: 1000000 }, { x: 500003, y: 1000004 }],
  surveyWidthMeters: 12, widthProfile: [{ fromOffsetMeters: 0, toOffsetMeters: 5, widthMeters: 7 }]
}
let count = 0
function test(name, run) { run(); console.log('PASS ' + name); count++ }
function invalid(value, field) {
  assert.throws(() => parse(JSON.stringify(value)), error => error instanceof RoadGuardDraftValidationError && error.message.includes(field))
}
test('original Roadguard1 DTO sample is preserved with all 119 points and nullable references', () => {
  assert.equal(sample.coordinates.length, 119)
  assert.deepEqual(plain(parse(sampleText)), sample)
  assert.equal(parse(sampleText).coordinates[0].x, 798577.937027)
})
test('malformed JSON, non-object and GeoJSON are rejected', () => {
  assert.throws(() => parse('{'), error => error instanceof RoadGuardDraftValidationError && /JSON/.test(error.message))
  for (const value of [null, [], 42]) invalid(value, 'Draft')
  invalid({ type: 'LineString', coordinates: [[1, 2], [3, 4]] }, 'sourceKind')
})
test('source kind, both permitted CRS values, GPX references and finite coordinate fields', () => {
  for (const crs of [32648, 32649]) assert.deepEqual(plain(parse(JSON.stringify({ ...line, sourceCrs: crs }))), { ...line, sourceCrs: crs })
  invalid({ ...line, sourceKind: 'NATIVE_ALIGNMENT' }, 'sourceKind')
  for (const sourceCrs of [4326, '32648', null, 32648.5]) invalid({ ...line, sourceCrs }, 'sourceCrs')
  for (const field of ['sourceFileId', 'trackIndex', 'trackSegmentIndex']) invalid({ ...line, [field]: 0 }, field)
  for (const axis of ['x', 'y']) for (const bad of [null, '1', Infinity, -Infinity, NaN, undefined]) {
    const draft = clone(line); draft.coordinates[1][axis] = bad; invalid(draft, `coordinates[1].${axis}`)
  }
  for (const point of [null, [], {}]) invalid({ ...line, coordinates: [line.coordinates[0], point] }, 'coordinates[1].x')
  invalid({ ...line, coordinates: [line.coordinates[0], line.coordinates[0]] }, 'coordinates[1]')
})
test('coordinate count limits and finite length', () => {
  for (const coordinates of [null, [], [line.coordinates[0]], Array(100001).fill(line.coordinates[0])]) invalid({ ...line, coordinates }, 'coordinates')
  const coordinates = Array.from({ length: 100000 }, (_, x) => ({ x, y: 0 }))
  const draft = { ...line, coordinates, widthProfile: [{ fromOffsetMeters: 0, toOffsetMeters: 99999, widthMeters: 7 }] }
  assert.equal(parse(JSON.stringify(draft)).coordinates.length, 100000)
  invalid({ ...line, coordinates: [{ x: -1e308, y: 0 }, { x: 1e308, y: 0 }] }, 'coordinates')
})
test('station, reason and survey width match backend rules without trimming or defaults', () => {
  for (const stationOriginMeters of [null, '0', Infinity]) invalid({ ...line, stationOriginMeters }, 'stationOriginMeters')
  assert.equal(parse(JSON.stringify({ ...line, stationOriginMeters: -10 })).stationOriginMeters, -10)
  for (const changeReason of [null, '', '  ', 1]) invalid({ ...line, changeReason }, 'changeReason')
  for (const surveyWidthMeters of [null, 0, -1, '12', Infinity]) invalid({ ...line, surveyWidthMeters }, 'surveyWidthMeters')
  assert.deepEqual(plain(parse(JSON.stringify(line))), line)
})
test('width profile rejects gaps, overlaps, invalid widths and incorrect route coverage', () => {
  for (const widthProfile of [null, [], [null]]) invalid({ ...line, widthProfile }, 'widthProfile')
  const split = [{ fromOffsetMeters: 0, toOffsetMeters: 2, widthMeters: 7 }, { fromOffsetMeters: 2, toOffsetMeters: 5, widthMeters: 12 }]
  assert.deepEqual(plain(parse(JSON.stringify({ ...line, widthProfile: split }))).widthProfile, split)
  for (const from of [1, 3, 2 + 1e-9]) { const widths = clone(split); widths[1].fromOffsetMeters = from; invalid({ ...line, widthProfile: widths }, 'widthProfile[1].fromOffsetMeters') }
  for (const widthMeters of [null, '7', 0, -1, 13, Infinity]) invalid({ ...line, widthProfile: [{ ...line.widthProfile[0], widthMeters }] }, 'widthMeters')
  for (const toOffsetMeters of [0, -1, 6, 5 + 1e-9, null, '5']) invalid({ ...line, widthProfile: [{ ...line.widthProfile[0], toOffsetMeters }] }, 'toOffsetMeters')
  invalid({ ...line, widthProfile: [{ ...line.widthProfile[0], fromOffsetMeters: 1 }] }, 'fromOffsetMeters')
  invalid({ ...line, widthProfile: [{ ...line.widthProfile[0], toOffsetMeters: 4 }] }, 'widthProfile')
  const withinTolerance = { ...line, widthProfile: [{ ...line.widthProfile[0], toOffsetMeters: 5 - 5e-8 }] }
  assert.deepEqual(plain(parse(JSON.stringify(withinTolerance))), withinTolerance)
})
console.log(`${count} RoadGuard Draft helper scenarios PASS (file validation only; not server confirmation).`)
