import React from 'react'
import { Zap, Clock, Ruler } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { FieldTask } from '../../../types/domain'
import { SafeImage } from './SafeImage'

export interface MeasurementsTabProps {
  fieldTasks: FieldTask[]
  highlightCode: string | null
}

export const MeasurementsTab: React.FC<MeasurementsTabProps> = ({
  fieldTasks,
  highlightCode
}) => {
  return (
    <Card className="overflow-hidden border border-brand-border">
          {/* Banner thông báo khi được chuyển tiếp từ Triage */}
          {highlightCode && (
            <div className="p-4 bg-amber-50/90 border-b border-[#C9A227] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-[#C9A227] text-white shrink-0">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-brand-dark">
                      ĐANG THEO DÕI LỆNH ĐO ĐẠC BỔ SUNG CHO HỒ SƠ:
                    </span>
                    <span className="font-mono font-bold text-xs text-[#8C6D1F] bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                      {highlightCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Nhiệm vụ WF-11
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Nhiệm vụ này vừa được điều phối từ Hộp thư thẩm định Triage. Tổ kỹ sư / Phi công hiện trường đã nhận lệnh và đang tiến hành thực hiện.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-b border-brand-border bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sansation">
                Danh sách Số liệu Đo đạc Thực tế Ngoài Hiện trường
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Được truyền trực tiếp từ App Mobile kỹ sư hiện trường sau khi chụp thước vạch & dưỡng đo khe nứt.
              </p>
            </div>
            <span className="font-mono text-xs bg-white px-3 py-1 rounded-full border border-slate-200 font-bold text-slate-700">
              Tổng số: {fieldTasks.length} nhiệm vụ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold uppercase">Mã Nhiệm Vụ</th>
                  <th className="py-3 px-4 font-semibold uppercase">Mã Khiếm Khuyết</th>
                  <th className="py-3 px-4 font-semibold uppercase">Lý Trình</th>
                  <th className="py-3 px-4 font-semibold uppercase">Phương Pháp Đo</th>
                  <th className="py-3 px-4 font-semibold uppercase">Giá Trị Thực Tế</th>
                  <th className="py-3 px-4 font-semibold uppercase">Đơn Vị Thực Hiện</th>
                  <th className="py-3 px-4 font-semibold uppercase">Ảnh Thước Đo</th>
                  <th className="py-3 px-4 font-semibold uppercase text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fieldTasks.map((task) => {
                  const isHighlighted =
                    Boolean(highlightCode) &&
                    (task.defect_code.toLowerCase().includes(highlightCode!.toLowerCase()) ||
                      task.code.toLowerCase().includes(highlightCode!.toLowerCase()))

                  return (
                    <tr
                      key={task.id}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-amber-50/90 font-medium border-l-4 border-l-[#C9A227]'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold font-mono text-[#8C6D1F]">
                        <div className="flex items-center gap-1.5">
                          {isHighlighted && <Zap className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />}
                          <span>{task.code}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold font-mono text-slate-900">
                        <span className={isHighlighted ? 'bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded' : ''}>
                          {task.defect_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">Km {task.chainage_km}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{task.measurement_type}</td>
                      <td className="py-3.5 px-4">
                        {task.status === 'ASSIGNED' ? (
                          <span className="text-amber-700 italic text-[11px] font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Đang đi đo hiện trường...</span>
                          </span>
                        ) : (
                          <span className="font-black text-rose-600 text-sm font-mono">
                            {task.measured_value} mm (Vượt ngưỡng)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{task.technician_name}</td>
                      <td className="py-3.5 px-4">
                        {task.evidence_photo_url ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                            <SafeImage
                              src={task.evidence_photo_url}
                              alt="Ảnh thước đo"
                              fallbackLabel="THƯỚC ĐO"
                              fallbackIcon={Ruler}
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Chưa có ảnh</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {task.status === 'ASSIGNED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Chờ thực địa</span>
                          </span>
                        ) : task.status === 'SUBMITTED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Đã Nộp Số Liệu
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Đã Xác Minh
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
    </Card>
  )
}
