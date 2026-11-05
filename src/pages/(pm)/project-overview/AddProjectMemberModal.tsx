import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { personnelService, projectMemberErrorMessage } from '../../../api/services/personnelService'

export interface AddProjectMemberModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  onMemberAdded: () => Promise<void> | void
  showToast: (msg: string) => void
}

interface EligibleMemberItem {
  userId: string
  displayName: string
  role: string
}

export const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  onMemberAdded,
  showToast
}) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const sequence = useRef(0)
  const submitting = useRef(false)
  const [heldUser, setHeldUser] = useState('')
  const [selectedRole, setSelectedRole] = useState<'OPERATOR' | 'CREW'>('OPERATOR')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [eligibleMembers, setEligibleMembers] = useState<EligibleMemberItem[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadEligible = useCallback(async () => {
    if (!isOpen || !projectId || !useAuthStore.getState().isAuthenticated || useAuthStore.getState().status === 'logging-out') return
    const request = ++sequence.current
    const actor = useAuthStore.getState().user?.id
    const current = () => request === sequence.current && epoch === useAuthStore.getState().authEpoch
    setLoading(true)
    setErrorMsg(null)
    setHeldUser(''); setSelectedUserId(null)
    try {
      const saved = sessionStorage.getItem(`rg_member_add_${actor}_${projectId}`)
      const pending = saved ? JSON.parse(saved) : null
      setHeldUser(pending?.userId || '')
      setSelectedUserId(pending?.userId || null)
      const data = await personnelService.fetchEligibleProjectMembers(projectId, {
        role: selectedRole,
        search: searchKeyword.trim() || undefined
      })
      if (current()) setEligibleMembers(data.items || [])
    } catch (err: any) {
      if (!current()) return
      const errText = projectMemberErrorMessage(err)
      setErrorMsg(errText)
      setEligibleMembers([])
    } finally {
      if (current()) setLoading(false)
    }
  }, [isOpen, projectId, selectedRole, searchKeyword, epoch])

  useEffect(() => {
    loadEligible()
    return () => { ++sequence.current }
  }, [loadEligible])

  if (!isOpen) return null

  const handleAddMember = async () => {
    if (!selectedUserId || submitting.current) return
    submitting.current = true
    const started = useAuthStore.getState().authEpoch
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await personnelService.addProjectMember(projectId, selectedUserId)
      if (started !== useAuthStore.getState().authEpoch) return
      await onMemberAdded()
      if (started !== useAuthStore.getState().authEpoch) return
      showToast('Đã thêm nhân sự vào dự án.')
      onClose()
    } catch (err: any) {
      if (started === useAuthStore.getState().authEpoch) setErrorMsg(projectMemberErrorMessage(err))
    } finally {
      submitting.current = false
      if (started === useAuthStore.getState().authEpoch) setIsSubmitting(false)
    }
  }

  return (
    <div role="dialog" aria-label="Thêm nhân sự vào dự án" className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
              <Icon name="person_add" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Thêm Nhân Sự Vào Dự Án
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dự án: <span className="text-[#8C6D15] font-semibold">{projectName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Role selector tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Chọn vai trò cần phân công:</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('OPERATOR')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'OPERATOR'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Phi công Drone (OPERATOR)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('CREW')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'CREW'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Đội thi công (CREW)</span>
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên hoặc ID nhân sự..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]"
            />
          </div>

          {heldUser && <p role="status">Có yêu cầu thêm nhân sự đang chờ xác nhận. Vui lòng tiếp tục yêu cầu hiện tại trước khi chọn người khác.</p>}
          {/* Error notice */}
          {errorMsg && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <Icon name="error" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
              <button type="button" onClick={loadEligible} disabled={loading || isSubmitting}>Tải lại danh sách</button>
            </div>
          )}

          {/* Eligible List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Nhân sự có thể thêm vào dự án:</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {eligibleMembers.length} khả dụng
              </span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                <Icon name="progress_activity" className="w-6 h-6 animate-spin text-[#C9A227]" />
                <span>Đang tải danh sách nhân sự...</span>
              </div>
            ) : errorMsg ? null : eligibleMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
                Không tìm thấy nhân sự phù hợp nào chưa tham gia dự án.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {eligibleMembers.map((member) => {
                  const isSelected = selectedUserId === member.userId
                  return (
                    <div
                      key={member.userId}
                      aria-disabled={!!heldUser || isSubmitting} onClick={() => { if (!heldUser && !isSubmitting) setSelectedUserId(member.userId) }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C9A227] bg-[#C9A227]/10 ring-1 ring-[#C9A227]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-[#C9A227] text-[#1A1D20]'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {member.displayName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {member.role === 'OPERATOR' ? 'Phi công Drone' : member.role === 'CREW' ? 'Đội thi công' : 'Chưa có vai trò'}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'border-[#C9A227] bg-[#C9A227] text-[#1A1D20]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Icon name="check" className="w-3.5 h-3.5 " />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Icon name="verified_user" className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Thực hiện bởi Chỉ huy trưởng dự án (PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleAddMember}
              disabled={!selectedUserId || isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                selectedUserId && !isSubmitting
                  ? 'bg-[#C9A227] hover:bg-[#B38E1E] text-[#1A1D20]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Icon name="progress_activity" className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" className="w-3.5 h-3.5" />
                  <span>Thêm Vào Dự Án</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

