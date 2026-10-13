import React from 'react'
import { Cpu, CheckCircle2, History, Download } from 'lucide-react'
import { AIModelVersion } from '../../../types/domain'

export interface AIModelsTabProps {
  aiModels: AIModelVersion[]
  onExportLabels: () => void
  onToggleFastTrack: (modelId: string, val: boolean) => void
  isSupervisor: boolean
}

export const AIModelsTab: React.FC<AIModelsTabProps> = ({
  aiModels,
  onExportLabels,
  onToggleFastTrack,
  isSupervisor
}) => {
  const activeModel =
    aiModels.find((m) => m.status === 'ACTIVE') || aiModels[0]
  const deprecatedModels = aiModels.filter(
    (m) => m.status === 'DEPRECATED' && m.id !== activeModel?.id
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Action Bar trên cùng của Tab */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Giám Sát Vận Hành Mô Hình AI &amp; Bảo Tồn Hồ Sơ (FR-36, QT06)
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi phiên bản mô hình AI đang chạy, bảo tồn kết quả các đợt khảo sát cũ và xuất tập nhãn đã duyệt cho huấn luyện
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Nút Xuất tập dữ liệu huấn luyện (QT07) */}
          <button
            type="button"
            onClick={onExportLabels}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Xuất tập dữ liệu nhãn đã duyệt cho huấn luyện theo QT07"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất Nhãn Huấn Luyện (QT07)</span>
          </button>
        </div>
      </div>

      {/* Grid 2 cột: Live Model & Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái: Mô hình đang chạy chính thức (ACTIVE) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-brand-gold flex items-center justify-center shadow-2xs">
                <Cpu className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mô hình AI đang chạy (Road AI Engine)
                </h3>
                <p className="text-xs text-slate-500">
                  Phân loại &amp; đo lường vết nứt mặt đường theo thời gian thực
                </p>
              </div>
            </div>
            <span className="px-3 py-0.5 rounded-full text-slate-900 font-mono text-[11px] font-bold bg-brand-gold shadow-2xs">
              LIVE
            </span>
          </div>

          {activeModel && (
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm text-slate-900">
                    {activeModel.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded ml-2">
                    {activeModel.version}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Triển khai: {activeModel.deployed_at}
                </span>
              </div>

              {/* 3 Chỉ số kiểm định chất lượng AI */}
              <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    Độ chính xác mAP@50
                  </span>
                  <span className="text-xl font-bold text-brand-gold font-mono">
                    {activeModel.map_50}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    Độ nhạy Recall
                  </span>
                  <span className="text-xl font-bold text-purple-700 font-mono">
                    {activeModel.recall}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">
                    F1-Score
                  </span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {activeModel.f1_score}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeModel && (
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>
                Weights SHA256:{' '}
                <code className="text-slate-800 font-bold">
                  {activeModel.sha256_hash.slice(0, 10)}...{activeModel.sha256_hash.slice(-4)}
                </code>
              </span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kiểm định đạt chuẩn FR-36
              </span>
            </div>
          )}
        </div>

        {/* Cột phải: Lịch sử các phiên bản tiền nhiệm (DEPRECATED) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Lịch sử phiên bản mô hình AI (Model Versioning)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Bảo tồn kết quả cũ (FR-36)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Theo quy định <strong>FR-36</strong>: Khi cập nhật mô hình mới, các phát hiện nứt lún cũ vẫn giữ nguyên vẹn phiên bản mô hình đã dùng tại thời điểm phân tích, tuyệt đối không tính toán ngược làm sai lệch hồ sơ hoàn công.
          </p>

          <div className="space-y-3">
            {deprecatedModels.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Chưa có phiên bản tiền nhiệm nào được lưu trữ.
              </div>
            ) : (
              deprecatedModels.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                        {item.version}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      mAP@50: <strong>{item.map_50}%</strong> • Recall: <strong>{item.recall}%</strong> • Triển khai: {item.deployed_at}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Trọng số: {item.sha256_hash.slice(0, 10)}...{item.sha256_hash.slice(-4)}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-mono text-[10px] font-bold shrink-0">
                    DEPRECATED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
