import React from 'react'
import { Plus, Edit2, ShieldCheck } from 'lucide-react'
import { DefectCatalogItem } from '../../../types/domain'

export interface DefectCatalogTabProps {
  defectCatalog: DefectCatalogItem[]
  onToggleActive: (code: string, newActive: boolean) => void
  onOpenCreate: () => void
  onOpenEdit: (item: DefectCatalogItem) => void
  isSupervisor: boolean
}

export const DefectCatalogTab: React.FC<DefectCatalogTabProps> = ({
  defectCatalog,
  onToggleActive,
  onOpenCreate,
  onOpenEdit,
  isSupervisor
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
      {/* Action Bar trên cùng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Danh Mục Khiếm Khuyết Chuẩn TCVN (Safety Defect Catalog)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
              IMMUTABLE CODES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị danh mục loại hư hỏng kỹ thuật áp dụng trong khảo sát và phân tích AI (QT03, QT04, FR-36)
          </p>
        </div>

        {/* Nút thêm mới loại lỗi */}
        {isSupervisor && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-amber-400 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
            title="Thêm mới loại khiếm khuyết kỹ thuật chuẩn TCVN theo QT04"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Thêm Mới Khiếm Khuyết</span>
          </button>
        )}
      </div>

      {/* Danh sách các loại khiếm khuyết */}
      <div className="space-y-3">
        {defectCatalog.map((item) => (
          <div
            key={item.code}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-3 ${
              item.is_active
                ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                : 'bg-slate-100/50 border-slate-200/60 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
                  item.code === 'POTHOLE'
                    ? 'bg-rose-600'
                    : item.code === 'ALLIGATOR_CRACK'
                    ? 'bg-amber-500'
                    : item.code === 'RUTTING'
                    ? 'bg-purple-600'
                    : 'bg-slate-600'
                }`}
              ></div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {item.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-bold">
                    {item.standard_ref}
                  </span>
                  {item.is_active ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700">
                      Đang áp dụng
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 border border-slate-300 rounded text-slate-600">
                      Tạm ngưng
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Các hành động CRUD: Nút Sửa & Công tắc Bật/Tắt */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              {/* Nút Sửa (Update) */}
              {isSupervisor && (
                <button
                  type="button"
                  onClick={() => onOpenEdit(item)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                  title="Chỉnh sửa thông tin quy chuẩn của mã này"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sửa</span>
                </button>
              )}

              {/* Công tắc Bật/Tắt (Soft-Disable thay Delete) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {item.is_active ? 'Áp dụng' : 'Ngưng'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isSupervisor}
                    checked={item.is_active}
                    onChange={(e) => onToggleActive(item.code, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Khối giải thích nghiệp vụ chuẩn */}
      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-700 space-y-1.5 mt-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Quy Chuẩn Quản Trị Danh Mục Khiếm Khuyết (QT03, QT04 &amp; FR-36):</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 leading-relaxed">
          <li>
            <strong>Thêm mới &amp; Cập nhật:</strong> Giám sát viên có quyền bổ sung loại khiếm khuyết mới hoặc cập nhật tiêu chuẩn viện dẫn khi dự án mở rộng sang các tuyến đường mới.
          </li>
          <li>
            <strong>Nguyên tắc bất biến Soft-Disable:</strong> Hệ thống không cho phép xóa vĩnh viễn (Hard-Delete) bất kỳ mã lỗi nào nhằm bảo vệ toàn vẹn lịch sử hồ sơ hoàn công đã ký nghiệm thu.
          </li>
        </ul>
      </div>
    </div>
  )
}
