import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface TriageProjectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  mockProjects: { id: string; code: string; name: string; start_km: number; end_km: number }[]
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  onConfirmTriageProject: (
    verificationMethod: 'FIELD' | 'DRONE' | 'EXISTING_EVIDENCE',
    reason: string
  ) => void
}

export const TriageProjectModal: React.FC<TriageProjectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  mockProjects,
  selectedProjectId,
  setSelectedProjectId,
  onConfirmTriageProject,
}) => {
  const [verificationMethod, setVerificationMethod] = useState<'FIELD' | 'DRONE' | 'EXISTING_EVIDENCE'>('FIELD')
  const [reason, setReason] = useState<string>('')

  if (!isOpen || !targetTriageCase) return null

  const selectedProj = mockProjects.find((p) => p.id === selectedProjectId) || mockProjects[0]

  const handleConfirm = () => {
    onConfirmTriageProject(verificationMethod, reason)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Icon name="domain" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Điều Phối Phản Ánh Vào Dự Án</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                  API-024
                </span>
              </div>
              <p className="text-xs text-slate-500">Phân công tuyến đường bảo hành & định hướng xác minh cho Chỉ huy trưởng</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-3.5 text-xs">
          {/* Hồ sơ phản ánh tiếp nhận gốc */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Hồ sơ phản ánh tiếp nhận:</span>
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {targetTriageCase.code}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">{targetTriageCase.defect_title}</span>
              <span className="font-mono text-slate-600">
                {targetTriageCase.stationing} ({targetTriageCase.lane || 'Làn cơ giới'})
              </span>
            </div>
            {targetTriageCase.description && (
              <p className="text-slate-600 text-[11px] italic bg-white p-2 rounded border border-slate-200 line-clamp-2">
                "{targetTriageCase.description}"
              </p>
            )}
            <span className="text-[10px] text-slate-500 block pt-0.5">
              Người gửi: {targetTriageCase.reporter_name || targetTriageCase.source_label} • {targetTriageCase.reporter_phone || 'Kênh ứng dụng di động'}
            </span>
          </div>

          {/* 1. Chọn Dự án bảo hành phụ trách (projectId - Spec 17_10) */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              1. Dự án / Tuyến đường bảo hành phụ trách: <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227] font-semibold cursor-pointer"
            >
              {mockProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} (Km {p.start_km} &rarr; Km {p.end_km})
                </option>
              ))}
            </select>
            {selectedProj && (
              <span className="text-[10px] text-slate-500 mt-1 pl-1">
                Phạm vi bảo hành: Km {selectedProj.start_km} đến Km {selectedProj.end_km}
              </span>
            )}
          </div>

          {/* 2. Định hướng phương thức xác minh (verificationMethod - Spec 17_10 CaseTriageDto) */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1.5">
              2. Định hướng phương thức xác minh (verificationMethod):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVerificationMethod('FIELD')}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                  verificationMethod === 'FIELD'
                    ? 'bg-amber-50 border-[#C9A227] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <Icon name="straighten" size={13} className={verificationMethod === 'FIELD' ? 'text-amber-800' : 'text-slate-400'} />
                  <span>Đo đạc hiện trường</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block mt-0.5 leading-tight">
                  Cử tổ đo đạc kiểm tra thước đo
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationMethod('DRONE')}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                  verificationMethod === 'DRONE'
                    ? 'bg-amber-50 border-[#C9A227] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <Icon name="flight_takeoff" size={13} className={verificationMethod === 'DRONE' ? 'text-amber-800' : 'text-slate-400'} />
                  <span>Khảo sát Drone</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block mt-0.5 leading-tight">
                  Tạo yêu cầu bay quét bổ sung
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationMethod('EXISTING_EVIDENCE')}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                  verificationMethod === 'EXISTING_EVIDENCE'
                    ? 'bg-amber-50 border-[#C9A227] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <Icon name="image" size={13} className={verificationMethod === 'EXISTING_EVIDENCE' ? 'text-amber-800' : 'text-slate-400'} />
                  <span>Ảnh hiện có</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block mt-0.5 leading-tight">
                  Thẩm định trên ảnh người dân gửi
                </span>
              </button>
            </div>
          </div>

          {/* 3. Chỉ đạo của Giám sát (reason - Spec 17_10) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                3. Chỉ đạo / Căn cứ điều phối của Giám sát (reason):
              </label>
              <span className="text-[10px] text-slate-400">Tối đa 1000 ký tự</span>
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập ghi chú chỉ đạo gửi Chỉ huy trưởng (PM) phụ trách dự án..."
              className="w-full bg-slate-50 text-slate-800 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227] focus:bg-white transition-colors"
            />
          </div>

          {/* Hộp thông báo quyền hạn */}
          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
            <Icon name="check_circle" size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              Sau khi xác nhận điều phối, hồ sơ sẽ chuyển sang trạng thái <strong>Chờ PM thẩm định</strong> và xuất hiện trong hộp thư tiếp nhận của Chỉ huy trưởng dự án.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">
            Người thực hiện: Giám sát / Chủ đầu tư
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-1.5 text-xs font-bold bg-[#C9A227] hover:bg-[#b08d20] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icon name="domain" size={15} />
              <span>Xác nhận điều phối (API-024)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

