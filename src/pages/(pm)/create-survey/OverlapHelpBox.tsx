import React from 'react'
import { Camera } from 'lucide-react'

export const OverlapHelpBox: React.FC = () => {
  return (
    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1.5 animate-in fade-in duration-200">
      <div className="font-bold text-[#8F7212] flex items-center gap-1.5">
        <Camera className="w-4 h-4 text-brand-gold" />
        <span>NguyÃªn lÃ½ tráº¯c Ä‘á»‹a áº£nh UAV &amp; BÃ³c tÃ¡ch hÆ° há»ng AI:</span>
      </div>
      <p>
        â€¢ <strong>Äá»™ phá»§ dá»c (Forward Lap):</strong> Tá»· lá»‡ pháº§n trÄƒm bá»©c áº£nh chá»¥p sau Ä‘Ã¨ lÃªn bá»©c áº£nh chá»¥p trÆ°á»›c theo chiá»u tiáº¿n cá»§a drone (vÃ­ dá»¥ 80%).
      </p>
      <p>
        â€¢ <strong>Äá»™ phá»§ ngang (Side Lap):</strong> Tá»· lá»‡ pháº§n trÄƒm diá»‡n tÃ­ch Ä‘Ã¨ lÃªn nhau giá»¯a hai Ä‘Æ°á»ng bay song song (vÃ­ dá»¥ 70%).
      </p>
      <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-amber-100">
        âš¡ <strong>Táº¡i sao AI báº¯t buá»™c cáº§n 80%/70%?</strong> Thuáº­t toÃ¡n SfM cáº§n má»—i Ä‘iá»ƒm trÃªn máº·t Ä‘Æ°á»ng xuáº¥t hiá»‡n á»Ÿ Ã­t nháº¥t 4â€“5 gÃ³c nhÃ¬n khÃ¡c nhau Ä‘á»ƒ ghÃ©p thÃ nh má»™t táº¥m áº£nh trá»±c giao khÃ´ng mÃ©o gÃ³c, giÃºp AI nháº­n dáº¡ng váº¿t ná»©t chÃ¢n chim 1mm mÃ  khÃ´ng bá»‹ mÃ¹ Ä‘iá»ƒm áº£nh.
      </p>
    </div>
  )
}
