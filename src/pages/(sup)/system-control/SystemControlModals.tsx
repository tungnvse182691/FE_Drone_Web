import React from 'react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'
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
  handoffAssignee: string
  setHandoffAssignee: (val: string) => void
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
  editCertificate: string
  setEditCertificate: (val: string) => void
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
  newPersonnelProject: string
  setNewPersonnelProject: (val: string) => void
  newPersonnelCert: string
  setNewPersonnelCert: (val: string) => void
  assignExistingUserId: string
  setAssignExistingUserId: (val: string) => void
  assignExistingProject: string
  setAssignExistingProject: (val: string) => void
  usersList: SystemUserAccount[]
  handleAddPersonnelSubmit: (e: React.FormEvent) => void
}

export const SystemControlModals: React.FC<SystemControlModalsProps> = ({
  showSuspendModal,
  setShowSuspendModal,
  userToSuspend,
  handoffAssignee,
  setHandoffAssignee,
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
  editCertificate,
  setEditCertificate,
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
  newPersonnelProject,
  setNewPersonnelProject,
  newPersonnelCert,
  setNewPersonnelCert,
  assignExistingUserId,
  setAssignExistingUserId,
  assignExistingProject,
  setAssignExistingProject,
  usersList,
  handleAddPersonnelSubmit
}) => {
  return (
    <>
      <SuspendUserModal
        showSuspendModal={showSuspendModal}
        setShowSuspendModal={setShowSuspendModal}
        userToSuspend={userToSuspend}
        handoffAssignee={handoffAssignee}
        setHandoffAssignee={setHandoffAssignee}
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
        editCertificate={editCertificate}
        setEditCertificate={setEditCertificate}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
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
        newPersonnelProject={newPersonnelProject}
        setNewPersonnelProject={setNewPersonnelProject}
        newPersonnelCert={newPersonnelCert}
        setNewPersonnelCert={setNewPersonnelCert}
        assignExistingUserId={assignExistingUserId}
        setAssignExistingUserId={setAssignExistingUserId}
        assignExistingProject={assignExistingProject}
        setAssignExistingProject={setAssignExistingProject}
        usersList={usersList}
        handleAddPersonnelSubmit={handleAddPersonnelSubmit}
      />
    </>
  )
}
