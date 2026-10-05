import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { AccountsTab } from './system-control/AccountsTab'
import { AIModelsTab } from './system-control/AIModelsTab'
import { DefectCatalogTab } from './system-control/DefectCatalogTab'
import { RetentionLegalHoldTab } from './system-control/RetentionLegalHoldTab'
import { SystemControlModals } from './system-control/SystemControlModals'
import { SystemControlHeader } from './system-control/SystemControlHeader'
import { useSystemControlState } from './system-control/useSystemControlState'
import {
  Users,
  Cpu,
  BookmarkCheck,
  Archive,
  CheckCircle2
} from 'lucide-react'

export const SystemControl: React.FC = () => {
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const s = useSystemControlState(user, isSupervisor)

  return (
    <div className="flex flex-col gap-5 max-w-[1720px] mx-auto w-full pb-16 bg-[#F8F9FA]">
      {/* Thông báo thành công nổi lên */}
      {s.actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#151C27] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-[#E2E5E9]">
          <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
          <span>{s.actionSuccessNotice}</span>
        </div>
      )}

      {/* 1. Header & Cảnh báo Legal Hold */}
      <SystemControlHeader
        isSupervisor={isSupervisor}
        activeLegalHoldProject={s.activeLegalHoldProject}
        onOpenCreateDeletion={() => s.setShowCreateDeletionRequestModal(true)}
        onOpenAddPersonnel={() => {
          s.setAddPersonnelTab('NEW')
          s.setShowAddPersonnelModal(true)
        }}
        onViewLegalHoldDetail={() => s.setActiveTab('retention-legal-hold')}
      />

      {/* 2. Tabs Navigation */}
      <div className="bg-white border border-[#E2E5E9] px-4 pt-2 rounded-xl shadow-sm flex items-center gap-2 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => s.setActiveTab('accounts')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
            s.activeTab === 'accounts'
              ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
              : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
          }`}
        >
          <Users className={`w-4 h-4 ${s.activeTab === 'accounts' ? 'text-[#C9A227]' : ''}`} />
          <span>{isSupervisor ? 'Tài khoản & Phân quyền (FR-02)' : 'Nhân sự dự án (BR-02)'}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              s.activeTab === 'accounts'
                ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
            }`}
          >
            {s.usersList.length} thành viên
          </span>
        </button>

        {isSupervisor && (
          <>
            <button
              type="button"
              onClick={() => s.setActiveTab('ai-models')}
              className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
                s.activeTab === 'ai-models'
                  ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
                  : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
              }`}
            >
              <Cpu className={`w-4 h-4 ${s.activeTab === 'ai-models' ? 'text-[#C9A227]' : ''}`} />
              <span>Mô hình AI &amp; Đánh giá (FR-36)</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  s.activeTab === 'ai-models'
                    ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                    : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
                }`}
              >
                v2.4.1 Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => s.setActiveTab('defect-catalog')}
              className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
                s.activeTab === 'defect-catalog'
                  ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
                  : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
              }`}
            >
              <BookmarkCheck className={`w-4 h-4 ${s.activeTab === 'defect-catalog' ? 'text-[#C9A227]' : ''}`} />
              <span>Danh mục khiếm khuyết TCVN (FR-36)</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  s.activeTab === 'defect-catalog'
                    ? 'bg-[#FBF6E9] text-[#8C6D15] border-[#F3E6C4]'
                    : 'bg-[#F0F2F5] text-[#555F6F] border-transparent'
                }`}
              >
                {s.defectCatalog.length} quy tắc
              </span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => s.setActiveTab('retention-legal-hold')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all ${
            s.activeTab === 'retention-legal-hold'
              ? 'text-[#151C27] font-bold border-b-2 border-[#C9A227]'
              : 'border-b-2 border-transparent text-[#555F6F] hover:text-[#151C27]'
          }`}
        >
          <Archive
            className={`w-4 h-4 ${
              s.activeLegalHoldProject ? 'text-[#BA1A1A]' : s.activeTab === 'retention-legal-hold' ? 'text-[#C9A227]' : ''
            }`}
          />
          <span>{isSupervisor ? 'Lưu trữ & Phong tỏa pháp lý (Legal Hold)' : 'Lưu trữ bảo hành & Hết hạn (QT11)'}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              s.activeLegalHoldProject
                ? 'bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFCDD2]'
                : 'bg-[#F0F2F5] text-[#555F6F]'
            }`}
          >
            {s.activeLegalHoldProject ? 'ĐANG BẬT' : 'BÌNH THƯỜNG'}
          </span>
        </button>
      </div>

      {/* 3. Nội dung Tab */}
      <div className="w-full">
        {s.activeTab === 'retention-legal-hold' && (
          <RetentionLegalHoldTab
            legalHoldProjects={s.legalHoldProjects}
            deletionRequests={s.deletionRequests}
            isSupervisor={isSupervisor}
            handleToggleLegalHold={s.handleToggleLegalHold}
            handleRejectDeletion={s.handleRejectDeletion}
            handleApprovePurge={s.handleApprovePurge}
          />
        )}

        {s.activeTab === 'accounts' && (
          <AccountsTab
            isSupervisor={isSupervisor}
            currentUser={user}
            filteredUsers={s.filteredUsers}
            userSearchTerm={s.userSearchTerm}
            setUserSearchTerm={s.setUserSearchTerm}
            userRoleFilter={s.userRoleFilter}
            setUserRoleFilter={s.setUserRoleFilter}
            setAddPersonnelTab={s.setAddPersonnelTab}
            setShowAddPersonnelModal={s.setShowAddPersonnelModal}
            setSelectedUserDetail={s.setSelectedUserDetail}
            handleOpenEdit={s.handleOpenEdit}
            handleRestoreUser={s.handleRestoreUser}
            setUserToSuspend={s.setUserToSuspend}
            setShowSuspendModal={s.setShowSuspendModal}
          />
        )}

        {isSupervisor && s.activeTab === 'ai-models' && (
          <AIModelsTab />
        )}

        {isSupervisor && s.activeTab === 'defect-catalog' && (
          <DefectCatalogTab
            defectCatalog={s.defectCatalog}
            isSupervisor={isSupervisor}
          />
        )}
      </div>

      {/* 4. Modals */}
      <SystemControlModals
        showSuspendModal={s.showSuspendModal}
        setShowSuspendModal={s.setShowSuspendModal}
        userToSuspend={s.userToSuspend}
        handoffAssignee={s.handoffAssignee}
        setHandoffAssignee={s.setHandoffAssignee}
        handleConfirmSuspend={s.handleConfirmSuspend}

        showCreateDeletionRequestModal={s.showCreateDeletionRequestModal}
        setShowCreateDeletionRequestModal={s.setShowCreateDeletionRequestModal}
        newDelProject={s.newDelProject}
        setNewDelProject={s.setNewDelProject}
        newDelDataType={s.newDelDataType}
        setNewDelDataType={s.setNewDelDataType}
        newDelSize={s.newDelSize}
        setNewDelSize={s.setNewDelSize}
        newDelJustification={s.newDelJustification}
        setNewDelJustification={s.setNewDelJustification}
        handleCreateDeletionSubmit={s.handleCreateDeletionSubmit}

        selectedUserDetail={s.selectedUserDetail}
        setSelectedUserDetail={s.setSelectedUserDetail}
        isSupervisor={isSupervisor}
        handleOpenEdit={s.handleOpenEdit}

        userToEdit={s.userToEdit}
        setUserToEdit={s.setUserToEdit}
        editFullName={s.editFullName}
        setEditFullName={s.setEditFullName}
        editEmail={s.editEmail}
        setEditEmail={s.setEditEmail}
        editPhone={s.editPhone}
        setEditPhone={s.setEditPhone}
        editRole={s.editRole}
        setEditRole={s.setEditRole}
        editProjectScope={s.editProjectScope}
        setEditProjectScope={s.setEditProjectScope}
        editCertificate={s.editCertificate}
        setEditCertificate={s.setEditCertificate}
        editStatus={s.editStatus}
        setEditStatus={s.setEditStatus}
        handleSaveEdit={s.handleSaveEdit}

        showAddPersonnelModal={s.showAddPersonnelModal}
        setShowAddPersonnelModal={s.setShowAddPersonnelModal}
        addPersonnelTab={s.addPersonnelTab}
        setAddPersonnelTab={s.setAddPersonnelTab}
        newPersonnelName={s.newPersonnelName}
        setNewPersonnelName={s.setNewPersonnelName}
        newPersonnelEmail={s.newPersonnelEmail}
        setNewPersonnelEmail={s.setNewPersonnelEmail}
        newPersonnelPhone={s.newPersonnelPhone}
        setNewPersonnelPhone={s.setNewPersonnelPhone}
        newPersonnelRole={s.newPersonnelRole}
        setNewPersonnelRole={s.setNewPersonnelRole}
        newPersonnelProject={s.newPersonnelProject}
        setNewPersonnelProject={s.setNewPersonnelProject}
        newPersonnelCert={s.newPersonnelCert}
        setNewPersonnelCert={s.setNewPersonnelCert}
        assignExistingUserId={s.assignExistingUserId}
        setAssignExistingUserId={s.setAssignExistingUserId}
        assignExistingProject={s.assignExistingProject}
        setAssignExistingProject={s.setAssignExistingProject}
        usersList={s.usersList}
        handleAddPersonnelSubmit={s.handleAddPersonnelSubmit}
      />
    </div>
  )
}

export default SystemControl
