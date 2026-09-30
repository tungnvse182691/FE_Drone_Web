import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { mockDefects, mockProjects } from '../../api/mock/data'
import { RepairItem } from '../../types/domain'
import { useNavigate } from 'react-router-dom'
import { Boxes, Plus, Trash2, ArrowRight, Calculator } from 'lucide-react'

export const RepairBatching: React.FC = () => {
  const navigate = useNavigate()
  const [batchName, setBatchName] = useState('Đợt Sửa Chữa Khẩn Cấp Km25 - Km28 QL1A')
  const [projectId, setProjectId] = useState(mockProjects[0]?.id || '')

  // Danh sách các hạng mục BOQ dự toán
  const [items, setItems] = useState<RepairItem[]>([
    {
      id: 'itm-1',
      task_name: 'Cào bóc và thảm bù bê tông nhựa chặt C12.5 dày 5cm',
      unit: 'm2',
      quantity: 35.0,
      unit_price: 385000,
      total_price: 13475000,
    },
    {
      id: 'itm-2',
      task_name: 'Trám khe nứt rạn lưới bằng matit nhựa nóng',
      unit: 'm',
      quantity: 80.0,
      unit_price: 45000,
      total_price: 3600000,
    },
  ])

  // Invariant 1: TỰ ĐỘNG TÍNH TỔNG TIỀN (DERIVED SUM), TUYỆT ĐỐI KHÔNG CÓ Ô GÕ TAY
  const estimatedTotalCost = items.reduce((sum, item) => sum + item.total_price, 0)

  const handleQuantityChange = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQty,
              total_price: newQty * item.unit_price,
            }
          : item
      )
    )
  }

  const handleAddItem = () => {
    const newItem: RepairItem = {
      id: `itm-${Date.now()}`,
      task_name: 'Bù phụ phụ gia gia cố lề đường',
      unit: 'm2',
      quantity: 10,
      unit_price: 120000,
      total_price: 1200000,
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const handleSaveAndSubmit = () => {
    alert('Đã lưu đợt sửa chữa thành công! Đang chuyển sang màn hình Trình duyệt.')
    navigate('/pm/repair-batches/bat-01/submit')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Gom Đợt Sửa Chữa & Lập Dự Toán Chi Phí (BOQ)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Màn 10: Tập hợp các vị trí hư hỏng đã xác nhận, áp định mức đơn giá và tính toán tổng dự toán
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Thông tin đợt & Bảng khối lượng dự toán */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Thông Tin Đợt Sửa Chữa">
            <div className="space-y-4">
              <InputField
                label="Tên Đợt Sửa Chữa"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dự Án / Hợp Đồng
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Số Hư Hỏng Gán Vào Đợt
                  </label>
                  <div className="px-3.5 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg font-semibold text-brand-dark">
                    {mockDefects.filter((d) => d.status === 'VERIFIED').length} vị trí hư hỏng đã chọn
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bảng BOQ Dự Toán Chi Phí */}
          <Card
            title="Bảng Dự Toán Chi Phí Hạng Mục (BOQ)"
            action={
              <Button size="sm" variant="outline" onClick={handleAddItem} icon={<Plus className="w-4 h-4" />}>
                Thêm Hạng Mục
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                    <th className="py-2.5 px-3 font-semibold uppercase">Hạng Mục Công Việc</th>
                    <th className="py-2.5 px-3 font-semibold uppercase w-16">ĐVT</th>
                    <th className="py-2.5 px-3 font-semibold uppercase w-24">Khối Lượng</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Đơn Giá Định Mức</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Thành Tiền (VND)</th>
                    <th className="py-2.5 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-brand-dark">{item.task_name}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{item.unit}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-brand-border rounded font-bold text-brand-dark focus:ring-1 focus:ring-brand-gold text-right"
                        />
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {item.unit_price.toLocaleString('vi-VN')} đ/{item.unit}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-goldDark text-right">
                        {item.total_price.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-brand-error cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Tổng tiền bất biến & Nút chuyển tiếp */}
        <div className="space-y-4">
          <Card title="Tổng Hợp Chi Phí Đợt Sửa">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-brand-gold/30 space-y-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tổng Dự Toán Tự Động Tính (SUM)
                </span>
                <div className="text-2xl font-black text-brand-goldDark">
                  {estimatedTotalCost.toLocaleString('vi-VN')} VNĐ
                </div>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  * Quy tắc bất biến: Tổng tiền được tính tự động từ các hạng mục BOQ, không được phép gõ tay trực tiếp.
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Số lượng hạng mục BOQ:</span>
                  <span className="font-semibold text-brand-dark">{items.length} hạng mục</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái sau lưu:</span>
                  <span className="font-semibold text-amber-700">DRAFT (Bản thảo)</span>
                </div>
              </div>

              <Button
                onClick={handleSaveAndSubmit}
                className="w-full mt-4"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Lưu & Chuyển Sang Trình Duyệt
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
