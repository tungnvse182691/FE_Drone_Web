import React from 'react'
import { Icon } from '../../../components/ui/Icon'

/** Workflow cards are informative until their corresponding command is integrated. */
export const DispatchModeSelector: React.FC = () => <section className="space-y-3">
  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phân loại luồng xử lý hiện trường</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[
    {title:'Gom lô đo đạc',icon:'straighten',description:'Bổ sung số đo và bằng chứng hiện trường trước khi lập phương án.'},
    {title:'Xử lý nhanh',icon:'engineering',description:'Đối chiếu điều kiện và chính sách trước khi giao nhiệm vụ.'},
    {title:'Lập gói sửa chữa',icon:'inventory_2',description:'Theo dõi phương án và hồ sơ theo quy trình sửa chữa.'},
  ].map(card => <div key={card.title} className="relative rounded-[20px] overflow-hidden border border-slate-200 bg-white shadow-2xs"><div className="h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" /><div className="p-4 sm:p-5 space-y-3"><h4 className="font-bold text-sm text-[#1A1D20] flex items-center gap-2"><Icon name={card.icon} size={20} className="text-[#C9A227]" />{card.title}</h4><p className="text-xs text-slate-500 leading-relaxed">{card.description}</p><div className="pt-3 border-t border-slate-100 text-xs text-slate-500">Chưa cập nhật</div><button type="button" disabled className="text-xs border rounded-lg px-3 py-2 text-slate-400">Chưa thể chọn từ màn hình này</button></div></div>)}</div>
</section>
