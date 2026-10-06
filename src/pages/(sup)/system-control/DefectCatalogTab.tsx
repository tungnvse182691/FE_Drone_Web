import React from 'react'
import { Info } from 'lucide-react'
import { DefectCatalogItem } from '../../../types/domain'

interface DefectCatalogTabProps {
  defectCatalog: DefectCatalogItem[]
  isSupervisor: boolean
}

export const DefectCatalogTab: React.FC<DefectCatalogTabProps> = ({
  defectCatalog,
  isSupervisor
}) => {
  return (
    <div className="bg-white border border-brand-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div>
          <h2 className="text-sm font-bold text-[#151C27]">
            Danh mục khiếm khuyết chuẩn TCVN (Safety Defect Catalog)
          </h2>
          <p className="text-xs text-[#555F6F]">
            Không cho phép xóa cứng để đảm bảo toàn vẹn dữ liệu lịch sử theo quy tắc Soft-Disable (FR-36)
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-xs font-semibold">
          IMMUTABLE CODES
        </span>
      </div>

      <div className="space-y-2.5">
        {defectCatalog.map((item) => (
          <div
            key={item.code}
            className="flex items-center justify-between p-3.5 rounded-xl bg-brand-surfaceAlt border border-brand-border hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  item.code === 'POTHOLE'
                    ? 'bg-[#BA1A1A]'
                    : item.code === 'ALLIGATOR_CRACK'
                    ? 'bg-brand-gold'
                    : item.code === 'RUTTING'
                    ? 'bg-[#695587]'
                    : 'bg-[#7A7768]'
                }`}
              ></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#151C27]">{item.code}</span>
                  <span className="text-xs font-semibold text-[#151C27]">{item.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-brand-border rounded text-[#555F6F] font-medium">
                    {item.standard_ref}
                  </span>
                </div>
                <p className="text-[11px] text-[#555F6F] mt-0.5">{item.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-brand-gold">Áp dụng</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isSupervisor}
                  defaultChecked={item.is_active}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-brand-surfaceAlt border border-brand-border text-[11px] text-[#555F6F] flex items-center gap-2">
        <Info className="w-4 h-4 text-brand-gold shrink-0" />
        <span>Hệ thống áp dụng cơ chế Soft-Disable; mã lỗi cũ vẫn được giữ nguyên vẹn trong hồ sơ hoàn công.</span>
      </div>
    </div>
  )
}
