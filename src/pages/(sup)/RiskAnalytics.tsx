import React from 'react'
import { Card } from '../../components/ui/Card'
import { BarChart3, AlertTriangle, TrendingDown, Layers } from 'lucide-react'

export const RiskAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Màn 18: Báo Cáo Phân Tích Rủi Ro & Suy Thoái Mặt Đường
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Đánh giá nguyên nhân nứt lún lặp lại, theo dõi biến động chỉ số PCI và cảnh báo vị trí mất an toàn giao thông
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Phân Bố Loại Hư Hỏng Mặt Đường">
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>Nứt rạn lưới (Alligator crack):</span>
                <span className="font-bold text-rose-600">42%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Ổ gà cục bộ (Pothole):</span>
                <span className="font-bold text-amber-600">28%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Vệt hằn lún bánh xe (Rutting):</span>
                <span className="font-bold text-blue-600">18%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Đoạn Tuyến Nguy Cơ Cao (Điểm Đen)" className="md:col-span-2">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-dark">Km26+300 - Km27+100 (QL1A)</span>
                <p className="text-slate-500 mt-0.5">Tần suất xuất hiện ổ gà lặp lại 3 lần trong mùa mưa 2026</p>
              </div>
              <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold">RỦI RO CAO</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-dark">Km112+500 - Km115+000 (Cao tốc Bắc Nam)</span>
                <p className="text-slate-500 mt-0.5">Lún vệt bánh xe làn xe tải nặng, độ sâu trung bình 28mm</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">CẢNH BÁO</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
