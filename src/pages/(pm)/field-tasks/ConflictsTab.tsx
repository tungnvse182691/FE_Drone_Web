import React from 'react'
import { SyncConflictItem } from '../../../types/domain'
import { ConflictFilterBar } from './conflicts/ConflictFilterBar'
import { ConflictQueueTable } from './conflicts/ConflictQueueTable'
import { ConflictTimelineAudit } from './conflicts/ConflictTimelineAudit'
import { ConflictServerStateCard } from './conflicts/ConflictServerStateCard'
import { ConflictIncomingStateCard } from './conflicts/ConflictIncomingStateCard'

export interface ConflictsTabProps {
  conflicts: SyncConflictItem[]
  filteredConflicts: SyncConflictItem[]
  selectedConflict: SyncConflictItem
  setSelectedConflictId: (id: string) => void
  filterType: string
  setFilterType: (type: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
  isPM: boolean
  isSupervisor: boolean
  handleOpenResolve: (
    decision:
      | 'ACCEPT_INCOMING'
      | 'KEEP_SERVER_STATE'
      | 'FORK_NEW_ATTEMPT'
      | 'SUBMIT_RESCUE_TO_SUP'
      | 'AUTHORIZE_RESCUE'
      | 'SUPERVISOR_REJECT_RESCUE'
  ) => void
}

export const ConflictsTab: React.FC<ConflictsTabProps> = ({
  conflicts,
  filteredConflicts,
  selectedConflict,
  setSelectedConflictId,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  stats,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  return (
    <div className="space-y-6">
      {/* 4. THANH CÔNG CỤ TÌM KIẾM VÀ BỘ LỌC TRẠNG THÁI */}
      <ConflictFilterBar
        conflicts={conflicts}
        filterType={filterType}
        setFilterType={setFilterType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stats={stats}
      />

      {/* 5. KHU VỰC CHÍNH: BẢNG HÀNG ĐỢI XUNG ĐỘT (GRID VIEW) */}
      <ConflictQueueTable
        filteredConflicts={filteredConflicts}
        selectedConflict={selectedConflict}
        setSelectedConflictId={setSelectedConflictId}
      />

      {/* 6. KHU VỰC ĐỐI CHIẾU TRỰC QUAN SIDE-BY-SIDE */}
      {selectedConflict && (
        <div className="space-y-4">
          {/* TIÊU ĐỀ & DÒNG THỜI GIAN DIỄN BIẾN SỰ KIỆN XUNG ĐỘT */}
          <ConflictTimelineAudit selectedConflict={selectedConflict} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CỘT TRÁI (COL 1): DỮ LIỆU CƠ SỞ / THIẾT BỊ 1 / CHÍNH SÁCH MÁY CHỦ */}
            <ConflictServerStateCard selectedConflict={selectedConflict} />

            {/* CỘT PHẢI (COL 2): CHỨNG CỨ NGOẠI TUYẾN / THIẾT BỊ 2 / GÓI CỨU HỘ ADB */}
            <ConflictIncomingStateCard
              selectedConflict={selectedConflict}
              isPM={isPM}
              isSupervisor={isSupervisor}
              handleOpenResolve={handleOpenResolve}
            />
          </div>
        </div>
      )}
    </div>
  )
}
