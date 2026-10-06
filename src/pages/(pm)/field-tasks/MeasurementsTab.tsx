import React from 'react'
import { Zap, Clock, Ruler } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { FieldTask } from '../../../types/domain'
import { SafeImage } from '../../../components/common/SafeImage'

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
          {/* Banner thÃ´ng bÃ¡o khi Ä‘Æ°á»£c chuyá»ƒn tiáº¿p tá»« Triage */}
          {highlightCode && (
            <div className="p-4 bg-amber-50/90 border-b border-brand-gold flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-gold text-white shrink-0">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-brand-dark">
                      ÄANG THEO DÃ•I Lá»†NH ÄO Äáº C Bá»” SUNG CHO Há»’ SÆ :
                    </span>
                    <span className="font-mono font-bold text-xs text-brand-goldMuted bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                      {highlightCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Nhiá»‡m vá»¥ WF-11
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Nhiá»‡m vá»¥ nÃ y vá»«a Ä‘Æ°á»£c Ä‘iá»u phá»‘i tá»« Há»™p thÆ° tháº©m Ä‘á»‹nh Triage. Tá»• ká»¹ sÆ° / Phi cÃ´ng hiá»‡n trÆ°á»ng Ä‘Ã£ nháº­n lá»‡nh vÃ  Ä‘ang tiáº¿n hÃ nh thá»±c hiá»‡n.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-b border-brand-border bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sansation">
                Danh sÃ¡ch Sá»‘ liá»‡u Äo Ä‘áº¡c Thá»±c táº¿ NgoÃ i Hiá»‡n trÆ°á»ng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ÄÆ°á»£c truyá»n trá»±c tiáº¿p tá»« App Mobile ká»¹ sÆ° hiá»‡n trÆ°á»ng sau khi chá»¥p thÆ°á»›c váº¡ch & dÆ°á»¡ng Ä‘o khe ná»©t.
              </p>
            </div>
            <span className="font-mono text-xs bg-white px-3 py-1 rounded-full border border-slate-200 font-bold text-slate-700">
              Tá»•ng sá»‘: {fieldTasks.length} nhiá»‡m vá»¥
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold uppercase">MÃ£ Nhiá»‡m Vá»¥</th>
                  <th className="py-3 px-4 font-semibold uppercase">MÃ£ Khiáº¿m Khuyáº¿t</th>
                  <th className="py-3 px-4 font-semibold uppercase">LÃ½ TrÃ¬nh</th>
                  <th className="py-3 px-4 font-semibold uppercase">PhÆ°Æ¡ng PhÃ¡p Äo</th>
                  <th className="py-3 px-4 font-semibold uppercase">GiÃ¡ Trá»‹ Thá»±c Táº¿</th>
                  <th className="py-3 px-4 font-semibold uppercase">ÄÆ¡n Vá»‹ Thá»±c Hiá»‡n</th>
                  <th className="py-3 px-4 font-semibold uppercase">áº¢nh ThÆ°á»›c Äo</th>
                  <th className="py-3 px-4 font-semibold uppercase text-center">Tráº¡ng ThÃ¡i</th>
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
                          ? 'bg-amber-50/90 font-medium border-l-4 border-l-brand-gold'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold font-mono text-brand-goldMuted">
                        <div className="flex items-center gap-1.5">
                          {isHighlighted && <Zap className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />}
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
                            <span>Äang Ä‘i Ä‘o hiá»‡n trÆ°á»ng...</span>
                          </span>
                        ) : (
                          <span className="font-black text-rose-600 text-sm font-mono">
                            {task.measured_value} mm (VÆ°á»£t ngÆ°á»¡ng)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{task.technician_name}</td>
                      <td className="py-3.5 px-4">
                        {task.evidence_photo_url ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                            <SafeImage
                              src={task.evidence_photo_url}
                              alt="áº¢nh thÆ°á»›c Ä‘o"
                              fallbackLabel="THÆ¯á»šC ÄO"
                              fallbackIcon={Ruler}
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">ChÆ°a cÃ³ áº£nh</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {task.status === 'ASSIGNED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Chá» thá»±c Ä‘á»‹a</span>
                          </span>
                        ) : task.status === 'SUBMITTED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ÄÃ£ Ná»™p Sá»‘ Liá»‡u
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            ÄÃ£ XÃ¡c Minh
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
