import React from 'react'
import { TriageCase } from './types'
import { CitizenTriageRow } from './CitizenTriageRow'

export interface CitizenTriageTableProps {
  cases: TriageCase[]
  filteredCases: TriageCase[]
  selectedCase: TriageCase
  selectedReportIds: string[]
  collapseMergedRows: boolean
  expandedMasterIds: string[]
  onSelectCase: (c: TriageCase) => void
  onToggleSelectReport: (id: string, e: React.MouseEvent) => void
  onSelectAllReports: () => void
  onToggleExpandMaster: (id: string, e: React.MouseEvent) => void
  onOpenTriageProject: (c: TriageCase, e?: React.MouseEvent) => void
  onOpenMergeModal: (c: TriageCase) => void
  onUnlinkReport: (childId: string, e: React.MouseEvent) => void
}

export const CitizenTriageTable: React.FC<CitizenTriageTableProps> = ({
  cases,
  filteredCases,
  selectedCase,
  selectedReportIds,
  collapseMergedRows,
  expandedMasterIds,
  onSelectCase,
  onToggleSelectReport,
  onSelectAllReports,
  onToggleExpandMaster,
  onOpenTriageProject,
  onOpenMergeModal,
  onUnlinkReport
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <th className="py-2.5 px-3 w-8">
              <input
                type="checkbox"
                checked={filteredCases.length > 0 && selectedReportIds.length === filteredCases.length}
                onChange={onSelectAllReports}
                className="w-3.5 h-3.5 rounded text-brand-gold focus:ring-brand-gold accent-brand-gold cursor-pointer"
                title="Chá»n táº¥t cáº£"
              />
            </th>
            <th className="py-2.5 px-3">MÃ£ &amp; KÃªnh Gá»­i</th>
            <th className="py-2.5 px-3">NgÆ°á»i BÃ¡o &amp; SÄT</th>
            <th className="py-2.5 px-3">Hiá»‡n TrÆ°á»ng (GPS)</th>
            <th className="py-2.5 px-3">LÃ½ TrÃ¬nh &amp; LÃ n</th>
            <th className="py-2.5 px-3">Dá»± Ãn Báº£o HÃ nh (PA03)</th>
            <th className="py-2.5 px-3">MÃ´ Táº£ / Loáº¡i HÆ° Háº¡i</th>
            <th className="py-2.5 px-3">Æ¯u TiÃªn</th>
            <th className="py-2.5 px-3">Tráº¡ng ThÃ¡i</th>
            <th className="py-2.5 px-3 text-right">Thao TÃ¡c</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredCases
            .filter((c) => !collapseMergedRows || !c.master_case_id)
            .map((item) => {
              const isSelected = item.id === selectedCase.id
              const isChecked = selectedReportIds.includes(item.id)
              const isMaster = Boolean(item.linked_report_ids && item.linked_report_ids.length > 0)
              const isExpanded = expandedMasterIds.includes(item.id)
              const childReports = isMaster
                ? cases.filter(
                    (c) =>
                      c.master_case_id === item.id ||
                      (item.linked_report_ids && item.linked_report_ids.includes(c.code))
                  )
                : []

              return (
                <CitizenTriageRow
                  key={item.id}
                  item={item}
                  selectedCaseId={selectedCase.id}
                  isChecked={isChecked}
                  isMaster={isMaster}
                  isExpanded={isExpanded}
                  childReports={childReports}
                  onSelectCase={onSelectCase}
                  onToggleSelectReport={onToggleSelectReport}
                  onToggleExpandMaster={onToggleExpandMaster}
                  onOpenTriageProject={onOpenTriageProject}
                  onOpenMergeModal={onOpenMergeModal}
                  onUnlinkReport={onUnlinkReport}
                />
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
