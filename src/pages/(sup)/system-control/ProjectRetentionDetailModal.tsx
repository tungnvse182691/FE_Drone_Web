import React, { useEffect, useState } from 'react'
import { LegalHoldProject } from '../../../types/domain'
import { retentionService } from '../../../api/services/retentionService'
import { RetentionBasisForm } from './RetentionBasisForm'

export interface ProjectRetentionDetailModalProps {
  project: LegalHoldProject | null
  isOpen: boolean
  onClose: () => void
  onOpenCreateDeletionForProject?: (projectId: string) => void
}

export const ProjectRetentionDetailModal: React.FC<ProjectRetentionDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenCreateDeletionForProject
}) => {
  const [evalItems, setEvalItems] = useState<Array<{ fileId: string; eligibility: string; reasonCodes: string[] }>>([])
  const [evalMeta, setEvalMeta] = useState<{ status: string; evaluatedAt: string; policyVersion: string } | null>(null)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [fileInfo, setFileInfo] = useState<Record<string, string>>({})
  const [reloadTick, setReloadTick] = useState(0)
  const [evalBusy, setEvalBusy] = useState(false)

  const beErr = (err: unknown): string => {
    const e = err as { response?: { status?: number; data?: { detail?: string; title?: string; code?: string } }; message?: string }
    const d = e?.response?.data?.detail || e?.response?.data?.title || e?.response?.data?.code || e?.message || 'Lỗi không xác định'
    return e?.response?.status ? `HTTP ${e.response.status}: ${d}` : d
  }

  useEffect(() => {
    if (!isOpen || !project) return
    let active = true
    setEvalItems([]); setEvalMeta(null); setEvalError(null); setFileInfo({}); setEvalLoading(true)
    ;(async () => {
      try {
        const list = await retentionService.getRetentionEvaluations(project.project_id)
        const latest = [...list].sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]
        if (!latest) return
        const detail = await retentionService.getRetentionEvaluationDetail(project.project_id, latest.id)
        if (!active) return
        setEvalMeta({ status: detail.status, evaluatedAt: detail.evaluatedAt, policyVersion: detail.policyVersion })
        setEvalItems(detail.items || [])
      } catch (err) {
        if (active) setEvalError(beErr(err))
      } finally {
        if (active) setEvalLoading(false)
      }
    })()
    return () => { active = false }
  }, [isOpen, project?.project_id, reloadTick])

  // POST /projects/{p}/retention/evaluations (202) → poll GET evaluations/{id} đến khi BE hoàn tất → đọc lại kết quả.
  const runEvaluation = async () => {
    if (!project || evalBusy) return
    setEvalBusy(true); setEvalError(null)
    try {
      const created = await retentionService.createRetentionEvaluation(project.project_id, {})
      if (!created?.id) throw new Error('BE không trả mã đánh giá để đối chiếu.')
      let status = created.status
      for (let i = 0; i < 30 && status !== 'COMPLETE' && status !== 'FAILED'; i++) {
        await new Promise((r) => setTimeout(r, 2000))
        status = (await retentionService.getRetentionEvaluationDetail(project.project_id, created.id)).status
      }
      if (status === 'FAILED') throw new Error('BE báo đánh giá lưu trữ thất bại.')
      if (status !== 'COMPLETE') throw new Error('Đánh giá chưa hoàn tất sau 60 giây; mở lại để xem kết quả.')
      setReloadTick((t) => t + 1)
    } catch (err) {
      setEvalError(beErr(err))
    } finally {
      setEvalBusy(false)
    }
  }

  const showFile = async (fileId: string) => {
    if (!project) return
    try {
      const f = await retentionService.getRetentionFile(project.project_id, fileId)
      setFileInfo((prev) => ({
        ...prev,
        [fileId]: `Phân loại: ${f.classification} • Kiểm kê ${f.inventoryComplete ? 'đầy đủ' : 'chưa đầy đủ'} • Nghĩa vụ bảo hành: ${(f.applicableObligations || []).length} • Lệnh phong tỏa đang hiệu lực: ${f.activeHoldCount}`,
      }))
    } catch (err) {
      setFileInfo((prev) => ({ ...prev, [fileId]: 'Không đọc được: ' + beErr(err) }))
    }
  }

  if (!isOpen || !project) return null

  const isEligible = project.is_warranty_expired && project.years_since_warranty_end >= 5 && !project.is_legal_hold

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-brand-gold">
              folder_managed
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Chi Tiết Hồ Sơ &amp; Tình Trạng Lưu Trữ
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {project.project_code} • {project.project_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Trạng thái pháp lý nổi bật */}
        <div className="px-5 pt-4 pb-1">
          {project.is_legal_hold ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <span className="material-symbols-outlined text-[18px] text-rose-600">
                  gavel
                </span>
                <span>ĐANG CÓ LỆNH PHONG TỎA PHÁP LÝ</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Hồ sơ công trình đang chịu sự thanh tra, kiểm tra đột xuất. Toàn bộ chức năng đề xuất xóa hoặc tiêu hủy dữ liệu đối với dự án này bị khóa cứng trên toàn hệ thống.
              </p>
              {project.hold_reason && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] space-y-0.5 text-slate-700">
                  <div><strong>Nội dung thanh tra:</strong> {project.hold_reason}</div>
                  <div><strong>Cơ quan yêu cầu:</strong> {project.hold_authority}</div>
                  <div><strong>Số văn bản:</strong> <span className="font-mono font-semibold">{project.hold_reference}</span> (từ {project.hold_since})</div>
                </div>
              )}
            </div>
          ) : isEligible ? (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                check_circle
              </span>
              <div>
                <span className="font-bold block">ĐỦ ĐIỀU KIỆN ĐỀ XUẤT HỦY DỮ LIỆU</span>
                <span className="text-[11px] text-emerald-700">
                  Công trình đã kết thúc bảo hành trên 5 năm và không có tranh chấp pháp lý.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                schedule
              </span>
              <div>
                <span className="font-bold block">ĐANG TRONG THỜI HẠN LƯU TRỮ PHÁP LÝ</span>
                <span className="text-[11px] text-slate-600">
                  {project.is_warranty_expired
                    ? `Đã hết hạn bảo hành ${project.years_since_warranty_end.toFixed(1)} năm (yêu cầu tối thiểu 5 năm).`
                    : 'Công trình đang trong thời hạn bảo hành. Không được phép đề xuất hủy dữ liệu.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Kết quả đánh giá lưu trữ từ BE */}
        <div className="px-5 pt-3 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-slate-800">Kết quả đánh giá lưu trữ từ hệ thống</h4>
            <button type="button" disabled={evalBusy || evalLoading} onClick={() => { void runEvaluation() }} className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer">{evalBusy ? 'Đang đánh giá…' : 'Chạy đánh giá mới'}</button>
          </div>
          {evalLoading && <p className="text-slate-500">Đang tải...</p>}
          {evalError && (
            <p className="p-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">Không tải được đánh giá lưu trữ: {evalError}</p>
          )}
          {!evalLoading && !evalError && !evalMeta && <p className="text-slate-500">Chưa có đánh giá lưu trữ nào trong CSDL.</p>}
          {evalMeta && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500">
                Trạng thái: <strong>{evalMeta.status}</strong> • Chính sách {evalMeta.policyVersion} • Đánh giá lúc {new Date(evalMeta.evaluatedAt).toLocaleString('vi-VN')}
              </p>
              {evalItems.map((it) => (
                <div key={it.fileId} className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-700">Tệp {it.fileId.slice(0, 8).toUpperCase()}</span>
                    <button type="button" onClick={() => showFile(it.fileId)} className="text-[11px] text-blue-700 hover:underline cursor-pointer">Xem chi tiết tệp</button>
                  </div>
                  <div className="text-[11px] text-slate-700 mt-0.5">Điều kiện: <strong>{it.eligibility}</strong></div>
                  {it.reasonCodes?.length > 0 && <div className="text-[11px] text-slate-500 mt-0.5">Lý do: {it.reasonCodes.join(', ')}</div>}
                  {fileInfo[it.fileId] && <div className="text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200">{fileInfo[it.fileId]}</div>}
                  {fileInfo[it.fileId] && !fileInfo[it.fileId].startsWith('Không đọc được') && <RetentionBasisForm projectId={project.project_id} fileId={it.fileId} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bảng chi tiết thông số */}
        <div className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">Mã dự án:</span>
              <span className="font-mono font-semibold text-slate-800">{project.project_code}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Thời hạn bảo hành:</span>
              <span className="font-semibold text-slate-800">{project.warranty_end_date}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Tình trạng bảo hành:</span>
              <span className="font-semibold text-slate-800">
                {project.is_warranty_expired ? 'Đã hết bảo hành' : 'Đang bảo hành'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Thời gian sau bảo hành:</span>
              <span className="font-semibold text-brand-goldDark">
                {project.years_since_warranty_end > 0 ? `${project.years_since_warranty_end.toFixed(1)} năm` : '0 năm'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-brand-gold">info</span>
              <span>Quy định thời hạn lưu trữ hồ sơ công trình:</span>
            </div>
            <p className="leading-relaxed">
              Theo quy định quản lý chất lượng công trình giao thông và quy tắc <strong>BR-45</strong>, toàn bộ ảnh khảo sát Drone, video hành trình tuần đường, hồ sơ đo đạc và biên bản nghiệm thu phải được lưu trữ tối thiểu <strong>hết hạn bảo hành + 5 năm</strong>.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>

          {isEligible && onOpenCreateDeletionForProject && (
            <button
              type="button"
              onClick={() => {
                onOpenCreateDeletionForProject(project.project_id)
                onClose()
              }}
              className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>Lập đề xuất hủy hồ sơ này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
