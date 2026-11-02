import React from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount, LegalHoldProject } from '../../../types/domain'
import { SuspendUserModal } from './SuspendUserModal'
import { CreateDeletionRequestModal } from './CreateDeletionRequestModal'
import { UserDetailModal } from './UserDetailModal'
import { EditUserModal } from './EditUserModal'
import { AddPersonnelModal } from './AddPersonnelModal'

interface SystemControlModalsProps {
  // 1. Suspend Modal
  showSuspendModal: boolean
  setShowSuspendModal: (show: boolean) => void
  userToSuspend: SystemUserAccount | null
  suspendReason?: string
  setSuspendReason?: (val: string) => void
  handleConfirmSuspend: () => void

  // 2. Deletion Request Modal
  showCreateDeletionRequestModal: boolean
  setShowCreateDeletionRequestModal: (show: boolean) => void
  newDelProject: string
  setNewDelProject: (val: string) => void
  newDelDataType: string
  setNewDelDataType: (val: string) => void
  newDelSize: number
  setNewDelSize: (val: number) => void
  newDelJustification: string
  setNewDelJustification: (val: string) => void
  handleCreateDeletionSubmit: (e: React.FormEvent) => void
  legalHoldProjects?: LegalHoldProject[]

  // 3. User Detail Modal
  selectedUserDetail: SystemUserAccount | null
  setSelectedUserDetail: (u: SystemUserAccount | null) => void
  isSupervisor: boolean
  handleOpenEdit: (u: SystemUserAccount) => void

  // 4. Edit User Modal
  userToEdit: SystemUserAccount | null
  setUserToEdit: (u: SystemUserAccount | null) => void
  editFullName: string
  setEditFullName: (val: string) => void
  editEmail: string
  setEditEmail: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void
  editRole: RoleCode
  setEditRole: (val: RoleCode) => void
  editProjectScope: string
  setEditProjectScope: (val: string) => void
  editSelectedProjectIds?: string[]
  toggleEditProject?: (id: string) => void
  selectAllEditProjects?: () => void
  clearAllEditProjects?: () => void
  editStatus: 'ACTIVE' | 'SUSPENDED'
  setEditStatus: (val: 'ACTIVE' | 'SUSPENDED') => void
  handleSaveEdit: (e: React.FormEvent) => void

  // 5. Add Personnel Modal
  showAddPersonnelModal: boolean
  setShowAddPersonnelModal: (show: boolean) => void
  addPersonnelTab: 'NEW' | 'ASSIGN'
  setAddPersonnelTab: (tab: 'NEW' | 'ASSIGN') => void
  newPersonnelName: string
  setNewPersonnelName: (val: string) => void
  newPersonnelEmail: string
  setNewPersonnelEmail: (val: string) => void
  newPersonnelPhone: string
  setNewPersonnelPhone: (val: string) => void
  newPersonnelRole: RoleCode
  setNewPersonnelRole: (val: RoleCode) => void
  newPersonnelProjectIds?: string[]
  toggleNewPersonnelProject?: (id: string) => void
  selectAllNewPersonnelProjects?: () => void
  clearAllNewPersonnelProjects?: () => void
  assignExistingUserId: string
  setAssignExistingUserId: (val: string) => void
  assignExistingProjectIds?: string[]
  toggleAssignExistingProject?: (id: string) => void
  selectAllAssignExistingProjects?: () => void
  clearAllAssignExistingProjects?: () => void
  assignEffectiveFrom?: string
  setAssignEffectiveFrom?: (val: string) => void
  assignReason?: string
  setAssignReason?: (val: string) => void
  usersList: SystemUserAccount[]
  projectsList?: Array<{ id: string; name: string; code?: string; pm_user_id?: string; pm_name?: string }>
  handleAddPersonnelSubmit: (e: React.FormEvent) => void
}

export const SystemControlModals: React.FC<SystemControlModalsProps> = ({
  showSuspendModal,
  setShowSuspendModal,
  userToSuspend,
  suspendReason,
  setSuspendReason,
  handleConfirmSuspend,

  showCreateDeletionRequestModal,
  setShowCreateDeletionRequestModal,
  newDelProject,
  setNewDelProject,
  newDelDataType,
  setNewDelDataType,
  newDelSize,
  setNewDelSize,
  newDelJustification,
  setNewDelJustification,
  handleCreateDeletionSubmit,
  legalHoldProjects,

  selectedUserDetail,
  setSelectedUserDetail,
  isSupervisor,
  handleOpenEdit,

  userToEdit,
  setUserToEdit,
  editFullName,
  setEditFullName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editRole,
  setEditRole,
  editProjectScope,
  setEditProjectScope,
  editSelectedProjectIds = [],
  toggleEditProject = () => {},
  selectAllEditProjects = () => {},
  clearAllEditProjects = () => {},
  editStatus,
  setEditStatus,
  handleSaveEdit,

  showAddPersonnelModal,
  setShowAddPersonnelModal,
  addPersonnelTab,
  setAddPersonnelTab,
  newPersonnelName,
  setNewPersonnelName,
  newPersonnelEmail,
  setNewPersonnelEmail,
  newPersonnelPhone,
  setNewPersonnelPhone,
  newPersonnelRole,
  setNewPersonnelRole,
  newPersonnelProjectIds = [],
  toggleNewPersonnelProject = () => {},
  selectAllNewPersonnelProjects = () => {},
  clearAllNewPersonnelProjects = () => {},
  assignExistingUserId,
  setAssignExistingUserId,
  assignExistingProjectIds = [],
  toggleAssignExistingProject = () => {},
  selectAllAssignExistingProjects = () => {},
  clearAllAssignExistingProjects = () => {},
  assignEffectiveFrom,
  setAssignEffectiveFrom,
  assignReason,
  setAssignReason,
  usersList,
  projectsList = [],
  handleAddPersonnelSubmit
}) => {
  return (
    <>
      <SuspendUserModal
        showSuspendModal={showSuspendModal}
        setShowSuspendModal={setShowSuspendModal}
        userToSuspend={userToSuspend}
        suspendReason={suspendReason}
        setSuspendReason={setSuspendReason}
        handleConfirmSuspend={handleConfirmSuspend}
      />

      <CreateDeletionRequestModal
        showCreateDeletionRequestModal={showCreateDeletionRequestModal}
        setShowCreateDeletionRequestModal={setShowCreateDeletionRequestModal}
        newDelProject={newDelProject}
        setNewDelProject={setNewDelProject}
        newDelDataType={newDelDataType}
        setNewDelDataType={setNewDelDataType}
        newDelSize={newDelSize}
        setNewDelSize={setNewDelSize}
        newDelJustification={newDelJustification}
        setNewDelJustification={setNewDelJustification}
        handleCreateDeletionSubmit={handleCreateDeletionSubmit}
        legalHoldProjects={legalHoldProjects}
      />

      <UserDetailModal
        selectedUserDetail={selectedUserDetail}
        setSelectedUserDetail={setSelectedUserDetail}
        isSupervisor={isSupervisor}
        handleOpenEdit={handleOpenEdit}
      />

      <EditUserModal
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        editFullName={editFullName}
        setEditFullName={setEditFullName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editRole={editRole}
        setEditRole={setEditRole}
        editProjectScope={editProjectScope}
        setEditProjectScope={setEditProjectScope}
        editSelectedProjectIds={editSelectedProjectIds}
        toggleEditProject={toggleEditProject}
        selectAllEditProjects={selectAllEditProjects}
        clearAllEditProjects={clearAllEditProjects}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        projectsList={projectsList}
        handleSaveEdit={handleSaveEdit}
      />

      <AddPersonnelModal
        showAddPersonnelModal={showAddPersonnelModal}
        setShowAddPersonnelModal={setShowAddPersonnelModal}
        addPersonnelTab={addPersonnelTab}
        setAddPersonnelTab={setAddPersonnelTab}
        newPersonnelName={newPersonnelName}
        setNewPersonnelName={setNewPersonnelName}
        newPersonnelEmail={newPersonnelEmail}
        setNewPersonnelEmail={setNewPersonnelEmail}
        newPersonnelPhone={newPersonnelPhone}
        setNewPersonnelPhone={setNewPersonnelPhone}
        newPersonnelRole={newPersonnelRole}
        setNewPersonnelRole={setNewPersonnelRole}
        newPersonnelProjectIds={newPersonnelProjectIds}
        toggleNewPersonnelProject={toggleNewPersonnelProject}
        selectAllNewPersonnelProjects={selectAllNewPersonnelProjects}
        clearAllNewPersonnelProjects={clearAllNewPersonnelProjects}
        assignExistingUserId={assignExistingUserId}
        setAssignExistingUserId={setAssignExistingUserId}
        assignExistingProjectIds={assignExistingProjectIds}
        toggleAssignExistingProject={toggleAssignExistingProject}
        selectAllAssignExistingProjects={selectAllAssignExistingProjects}
        clearAllAssignExistingProjects={clearAllAssignExistingProjects}
        assignEffectiveFrom={assignEffectiveFrom}
        setAssignEffectiveFrom={setAssignEffectiveFrom}
        assignReason={assignReason}
        setAssignReason={setAssignReason}
        usersList={usersList}
        projectsList={projectsList}
        handleAddPersonnelSubmit={handleAddPersonnelSubmit}
      />
    </>
  )
}
