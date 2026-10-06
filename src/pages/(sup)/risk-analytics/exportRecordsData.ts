import { ExportRecord } from './types'
import { EXPORT_RECORDS_PART1 } from './exportRecordsPart1'
import { EXPORT_RECORDS_PART2 } from './exportRecordsPart2'

export const INITIAL_EXPORT_RECORDS: ExportRecord[] = [
  ...EXPORT_RECORDS_PART1,
  ...EXPORT_RECORDS_PART2
]
