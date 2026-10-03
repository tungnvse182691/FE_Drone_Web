import React from 'react'

export interface RoadDefectImageProps {
  type:
    | 'POTHOLE_BEFORE'
    | 'POTHOLE_AFTER'
    | 'CRACK_OPTICAL'
    | 'RUTTING_3M_BEAM'
    | 'RUTTING_AFTER_MILLING'
    | 'BRIDGE_SETTLEMENT'
    | 'EXPANSION_JOINT'
    | 'EXPANSION_JOINT_MASTIC'
    | 'DRONE_SURVEY_MAP'
    | 'BROKEN_DEVICE_INCIDENT'
  className?: string
  caption?: string
  chainage?: string
  value?: string
}

/**
 * Component minh họa ảnh hiện trường kỹ thuật công trình đường bộ chân thực
 * Vẽ trực tiếp bằng SVG vector độ phân giải cao, hiển thị 100% không phụ thuộc internet
 */
export const RoadDefectImage: React.FC<RoadDefectImageProps> = ({
  type,
  className = 'w-full h-full',
  caption,
  chainage = 'Km 1025+400',
  value,
}) => {
  switch (type) {
    // 1. Ổ gà sâu trước sửa (Pothole Before)
    case 'POTHOLE_BEFORE':
      return (
        <div className={`relative overflow-hidden select-none bg-[#1E252B] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <defs>
              <pattern id="asphalt-tex" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#2A3036" />
                <circle cx="3" cy="5" r="1.5" fill="#3D444C" />
                <circle cx="12" cy="14" r="1" fill="#1C2126" />
                <circle cx="17" cy="6" r="1.8" fill="#384047" />
                <circle cx="7" cy="16" r="1.2" fill="#4B535C" />
              </pattern>
              <radialGradient id="hole-depth" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0B0D0F" />
                <stop offset="70%" stopColor="#14181B" />
                <stop offset="100%" stopColor="#252B31" />
              </radialGradient>
            </defs>

            {/* Mặt đường Asphalt */}
            <rect width="400" height="240" fill="url(#asphalt-tex)" />

            {/* Vạch sơn kẻ đường mờ mép trái */}
            <line x1="30" y1="0" x2="30" y2="240" stroke="#F1E5C6" strokeWidth="6" strokeDasharray="16 12" opacity="0.4" />

            {/* Miệng ổ gà méo mó tự nhiên */}
            <path
              d="M 120,80 Q 180,50 250,75 Q 310,100 290,150 Q 270,195 200,185 Q 130,175 110,130 Z"
              fill="url(#hole-depth)"
              stroke="#0A0C0E"
              strokeWidth="4"
            />
            {/* Lớp sỏi đá lộ đáy hố */}
            <circle cx="170" cy="120" r="8" fill="#4A525A" />
            <circle cx="195" cy="135" r="6" fill="#383E44" />
            <circle cx="230" cy="115" r="11" fill="#5A636D" />
            <circle cx="215" cy="150" r="7" fill="#41484F" />

            {/* Thước đo vạch cắm thẳng đứng vào đáy hố */}
            <rect x="188" y="40" width="12" height="110" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            {/* Vạch chia mm trên thước */}
            {[50, 60, 70, 80, 90, 100, 110, 120, 130, 140].map((y) => (
              <line key={y} x1="188" y1={y} x2="194" y2={y} stroke="#0F172A" strokeWidth="1" />
            ))}
            {/* Mức chỉ độ sâu 62mm màu vàng đồng */}
            <line x1="185" y1="122" x2="203" y2="122" stroke="#EF4444" strokeWidth="2.5" />
            <polygon points="205,122 215,117 215,127" fill="#EF4444" />

            {/* Badge hiển thị chỉ số đo sâu */}
            <rect x="220" y="110" width="85" height="24" rx="4" fill="#0F172A" stroke="#C9A227" strokeWidth="1.5" />
            <text x="262" y="126" fill="#FBF6E9" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || 'SÂU: 62mm'}
            </text>

            {/* Watermark góc kỹ thuật */}
            <rect x="10" y="205" width="220" height="24" rx="4" fill="#000000" fillOpacity="0.7" />
            <text x="18" y="221" fill="#C9A227" fontSize="10" fontWeight="bold" fontFamily="monospace">
              ROADGUARD • {chainage} • TRẮC ĐỊA
            </text>
          </svg>
        </div>
      )

    // 2. Ổ gà sau khi vá phẳng Carboncor Asphalt K95 (Pothole After)
    case 'POTHOLE_AFTER':
      return (
        <div className={`relative overflow-hidden select-none bg-[#1E252B] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <defs>
              <pattern id="asphalt-old" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#3D444C" />
                <circle cx="5" cy="5" r="1.5" fill="#4B535C" />
                <circle cx="15" cy="15" r="1.2" fill="#2E3338" />
              </pattern>
              <pattern id="carboncor-new" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#14181B" />
                <circle cx="3" cy="3" r="1" fill="#252A2F" />
                <circle cx="9" cy="9" r="1.3" fill="#1B1F23" />
              </pattern>
            </defs>

            {/* Mặt đường cũ */}
            <rect width="400" height="240" fill="url(#asphalt-old)" />

            {/* Vệt bánh xe lu đầm K95 */}
            <rect x="60" y="30" width="280" height="180" rx="8" fill="url(#carboncor-new)" stroke="#0F172A" strokeWidth="2" />
            {/* Đường quét tưới nhựa dính bám nhũ tương mép cắt */}
            <rect x="58" y="28" width="284" height="184" rx="10" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />

            {/* Vết vệt gợn lu đầm phẳng */}
            <line x1="80" y1="80" x2="320" y2="80" stroke="#252A2F" strokeWidth="3" opacity="0.6" />
            <line x1="80" y1="120" x2="320" y2="120" stroke="#252A2F" strokeWidth="3" opacity="0.6" />
            <line x1="80" y1="160" x2="320" y2="160" stroke="#252A2F" strokeWidth="3" opacity="0.6" />

            {/* Dấu kiểm định nghiệm thu K95 */}
            <circle cx="200" cy="120" r="38" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" />
            <text x="200" y="116" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              ĐẦM LÈN K95
            </text>
            <text x="200" y="132" fill="#A7F3D0" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
              CARBONCOR
            </text>

            {/* Biển cọc tiêu thi công góc */}
            <polygon points="340,190 355,190 360,225 335,225" fill="#F97316" />
            <rect x="337" y="200" width="21" height="6" fill="#FFFFFF" />

            {/* Watermark kỹ thuật */}
            <rect x="10" y="205" width="260" height="24" rx="4" fill="#000000" fillOpacity="0.7" />
            <text x="18" y="221" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="monospace">
              NGHIỆM THU ĐẠT • TCVN 8864 • {chainage}
            </text>
          </svg>
        </div>
      )

    // 3. Thước đo quang học phóng đại khe nứt 4.8mm (Crack Optical)
    case 'CRACK_OPTICAL':
      return (
        <div className={`relative overflow-hidden select-none bg-[#111827] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#1F2937" />

            {/* Vòng tròn kính phóng đại quang học */}
            <circle cx="200" cy="120" r="90" fill="#374151" stroke="#9CA3AF" strokeWidth="4" />
            <circle cx="200" cy="120" r="84" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />

            {/* Vết nứt uốn lượn phóng đại */}
            <path
              d="M 190,36 Q 215,80 198,110 T 212,160 T 195,204"
              fill="none"
              stroke="#030712"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 190,36 Q 215,80 198,110 T 212,160 T 195,204"
              fill="none"
              stroke="#111827"
              strokeWidth="8"
            />

            {/* Lưới thước quang học vạch khắc mạ vàng */}
            <line x1="140" y1="120" x2="260" y2="120" stroke="#C9A227" strokeWidth="1.5" />
            {[150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250].map((x) => (
              <line key={x} x1={x} y1="112" x2={x} y2="128" stroke="#C9A227" strokeWidth={x % 20 === 0 ? 2 : 1} />
            ))}

            {/* Khoảng cách đo khe nứt 4.8mm */}
            <rect x="194" y="90" width="16" height="60" fill="#EF4444" fillOpacity="0.25" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 2" />
            <text x="200" y="80" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || '4.8 mm'}
            </text>

            {/* Nhãn kính phóng đại */}
            <rect x="10" y="205" width="260" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#C9A227" fontSize="10" fontWeight="bold" fontFamily="monospace">
              THƯỚC QUANG HỌC 10x • {chainage}
            </text>
          </svg>
        </div>
      )

    // 4. Thước dưỡng 3m đo lún vệt bánh xe (Rutting 3m Beam)
    case 'RUTTING_3M_BEAM':
      return (
        <div className={`relative overflow-hidden select-none bg-[#181E24] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#252C33" />

            {/* Mặt cắt ngang đường bị lún võng 2 bên vệt bánh xe */}
            <path
              d="M 0,160 Q 60,160 100,165 Q 160,205 200,205 Q 240,205 300,165 Q 340,160 400,160 L 400,240 L 0,240 Z"
              fill="#14191E"
              stroke="#0D1114"
              strokeWidth="2"
            />

            {/* Thanh nhôm dưỡng đo 3m đặt nằm ngang phẳng trên gờ lún */}
            <rect x="40" y="148" width="320" height="12" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
            <text x="200" y="157" fill="#1E293B" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              THANH DƯỠNG THẲNG 3M (TCVN 8864)
            </text>

            {/* Mũi tên kép đo khe hở lún vệt bánh xe */}
            <line x1="200" y1="160" x2="200" y2="205" stroke="#EF4444" strokeWidth="2.5" />
            <polygon points="196,165 204,165 200,160" fill="#EF4444" />
            <polygon points="196,200 204,200 200,205" fill="#EF4444" />

            {/* Hộp chỉ số đo vệt lún 26mm */}
            <rect x="215" y="170" width="90" height="26" rx="4" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
            <text x="260" y="187" fill="#FCA5A5" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || 'LÚN: 26mm'}
            </text>

            {/* Máy cào bóc Wirtgen minh họa phía xa */}
            <rect x="290" y="90" width="70" height="40" rx="4" fill="#C9A227" opacity="0.8" />
            <rect x="310" y="75" width="30" height="20" fill="#334155" opacity="0.8" />
            <circle cx="305" cy="130" r="10" fill="#0F172A" />
            <circle cx="345" cy="130" r="10" fill="#0F172A" />
            <text x="325" y="112" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle">
              WIRTGEN
            </text>

            {/* Watermark */}
            <rect x="10" y="205" width="280" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#C9A227" fontSize="10" fontWeight="bold" fontFamily="monospace">
              TCVN 8864 • DÀI 14m • {chainage}
            </text>
          </svg>
        </div>
      )

    // 5. Mố cầu sụt lún & Khe co giãn (Bridge Settlement)
    case 'BRIDGE_SETTLEMENT':
      return (
        <div className={`relative overflow-hidden select-none bg-[#111827] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#1F2937" />

            {/* Bản mặt cầu bê tông bên trái */}
            <rect x="20" y="70" width="160" height="70" fill="#64748B" stroke="#334155" strokeWidth="2" />
            <text x="100" y="110" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="middle">
              BẢN MẶT CẦU
            </text>

            {/* Mố cầu đường đắp bên phải bị sụt lún chênh cốt 48mm */}
            <rect x="210" y="118" width="170" height="70" fill="#475569" stroke="#1E293B" strokeWidth="2" />
            <text x="295" y="158" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="middle">
              MỐ CẦU (LÚN 48mm)
            </text>

            {/* Khe co giãn ở giữa */}
            <rect x="180" y="70" width="30" height="120" fill="#0F172A" stroke="#C9A227" strokeWidth="1" strokeDasharray="4 2" />

            {/* Vạch đo chênh cốt cao độ */}
            <line x1="180" y1="70" x2="230" y2="70" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="210" y1="118" x2="210" y2="70" stroke="#EF4444" strokeWidth="2.5" />
            <polygon points="206,75 214,75 210,70" fill="#EF4444" />
            <polygon points="206,113 214,113 210,118" fill="#EF4444" />

            <rect x="240" y="76" width="105" height="26" rx="4" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
            <text x="292" y="93" fill="#FEE2E2" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || 'LÚN CHÊNH: 48mm'}
            </text>

            {/* Watermark cứu dữ liệu Q17 */}
            <rect x="10" y="205" width="300" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#C084FC" fontSize="10" fontWeight="bold" fontFamily="monospace">
              TRÍCH XUẤT CỨU HỘ ADB • Q17/42A • {chainage}
            </text>
          </svg>
        </div>
      )

    // 6. Cào bóc tạo phẳng bằng máy Wirtgen & lu hoàn thiện (Rutting After Milling)
    case 'RUTTING_AFTER_MILLING':
      return (
        <div className={`relative overflow-hidden select-none bg-[#1A2026] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#252C33" />
            {/* Lớp cào bóc phẳng phiu */}
            <rect x="30" y="50" width="340" height="150" rx="6" fill="#1B2228" stroke="#0F172A" strokeWidth="2" />
            {/* Các đường phay cào bóc sọc song song của trống cào Wirtgen */}
            {[65, 80, 95, 110, 125, 140, 155, 170, 185].map((y) => (
              <line key={y} x1="30" y1={y} x2="370" y2={y} stroke="#333E48" strokeWidth="1.5" strokeDasharray="8 4" />
            ))}
            {/* Vạch sơn biên cào bóc vàng phản quang */}
            <rect x="28" y="48" width="344" height="154" rx="8" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="10 6" opacity="0.8" />

            {/* Dấu kiểm tra độ phẳng thước 3m đạt chuẩn < 5mm */}
            <rect x="130" y="95" width="140" height="50" rx="6" fill="#064E3B" fillOpacity="0.9" stroke="#10B981" strokeWidth="2" />
            <text x="200" y="117" fill="#6EE7B7" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              ĐỘ PHẲNG ĐẠT CHUẨN
            </text>
            <text x="200" y="134" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || 'ĐỘ VÕNG < 4mm (TCVN)'}
            </text>

            <rect x="10" y="205" width="280" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="monospace">
              CÀO BÓC TẠO PHẲNG WIRTGEN • {chainage}
            </text>
          </svg>
        </div>
      )

    // 7. Khe co giãn mố cầu trước sửa (Expansion Joint Before)
    case 'EXPANSION_JOINT':
      return (
        <div className={`relative overflow-hidden select-none bg-[#111827] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#1F2937" />
            {/* Hai bờ bê tông khe co giãn */}
            <rect x="30" y="40" width="150" height="160" fill="#4B5563" stroke="#374151" strokeWidth="2" />
            <rect x="220" y="40" width="150" height="160" fill="#4B5563" stroke="#374151" strokeWidth="2" />
            {/* Khe hở ở giữa */}
            <rect x="180" y="40" width="40" height="160" fill="#0B0F17" />
            {/* Lưỡi thép răng lược bảo vệ khe */}
            {[50, 75, 100, 125, 150, 175].map((y) => (
              <g key={y}>
                <polygon points={`180,${y} 195,${y + 10} 180,${y + 20}`} fill="#9CA3AF" />
                <polygon points={`220,${y + 5} 205,${y + 15} 220,${y + 25}`} fill="#9CA3AF" />
              </g>
            ))}

            {/* Thước kẹp đo khe hở 18mm */}
            <line x1="175" y1="110" x2="225" y2="110" stroke="#EF4444" strokeWidth="2" />
            <polygon points="175,106 175,114 170,110" fill="#EF4444" />
            <polygon points="225,106 225,114 230,110" fill="#EF4444" />

            <rect x="155" y="70" width="90" height="24" rx="4" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
            <text x="200" y="86" fill="#FCA5A5" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {value || 'KHE HỞ: 18mm'}
            </text>

            <rect x="10" y="205" width="280" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#C9A227" fontSize="10" fontWeight="bold" fontFamily="monospace">
              THƯỚC KẸP CƠ KHÍ • {chainage}
            </text>
          </svg>
        </div>
      )

    // 8. Khe co giãn sau khi rót Mastic Bitum nóng đạt chuẩn (Expansion Joint Mastic After)
    case 'EXPANSION_JOINT_MASTIC':
      return (
        <div className={`relative overflow-hidden select-none bg-[#111827] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#1F2937" />
            {/* Hai bờ bê tông mố cầu */}
            <rect x="30" y="40" width="150" height="160" fill="#4B5563" stroke="#374151" strokeWidth="2" />
            <rect x="220" y="40" width="150" height="160" fill="#4B5563" stroke="#374151" strokeWidth="2" />
            {/* Lớp matit chèn khe bitum cao su màu đen bóng điền đầy khe */}
            <rect x="178" y="40" width="44" height="160" fill="#0A0C0E" stroke="#C9A227" strokeWidth="1.5" />
            {/* Bề mặt matit miết láng phẳng */}
            <line x1="200" y1="40" x2="200" y2="200" stroke="#1F242A" strokeWidth="6" />

            {/* Dấu nghiệm thu đạt chuẩn TCVN */}
            <circle cx="200" cy="120" r="34" fill="#064E3B" fillOpacity="0.9" stroke="#10B981" strokeWidth="2" />
            <text x="200" y="116" fill="#A7F3D0" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              ĐÃ TRÁM
            </text>
            <text x="200" y="130" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              MASTIC K95
            </text>

            <rect x="10" y="205" width="280" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="monospace">
              NGHIỆM THU HOÀN THIỆN • {chainage}
            </text>
          </svg>
        </div>
      )

    // 9. Minh họa thiết bị máy tính bảng hiện trường bị vỡ màn hình (Broken Rugged Tablet Incident)
    case 'BROKEN_DEVICE_INCIDENT':
      return (
        <div className={`relative overflow-hidden select-none bg-[#11161B] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            {/* Nền bàn làm việc kỹ thuật */}
            <rect width="400" height="240" fill="#181F26" />
            <defs>
              <pattern id="grid-desk" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#232C36" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#grid-desk)" />

            {/* Khung máy tính bảng công trình Samsung Galaxy Tab Active (Rugged Bumper Case) */}
            <rect x="70" y="25" width="260" height="175" rx="14" fill="#242B33" stroke="#374151" strokeWidth="3" />
            {/* Đệm cao su bảo vệ 4 góc chống va đập màu vàng đồng công trường */}
            <rect x="66" y="21" width="20" height="20" rx="6" fill="#C9A227" />
            <rect x="314" y="21" width="20" height="20" rx="6" fill="#C9A227" />
            <rect x="66" y="184" width="20" height="20" rx="6" fill="#C9A227" />
            <rect x="314" y="184" width="20" height="20" rx="6" fill="#C9A227" />

            {/* Màn hình hiển thị tối đen do vỡ cảm ứng */}
            <rect x="85" y="38" width="230" height="148" rx="6" fill="#0C0E11" stroke="#1F242C" strokeWidth="2" />

            {/* Vết nứt kính mạng nhện chân thực do va đập ngoài công trường */}
            <g stroke="#E2E8F0" strokeWidth="1.5" strokeOpacity="0.85" strokeLinecap="round">
              <circle cx="260" cy="70" r="4" fill="#FFFFFF" />
              <path d="M 260 70 L 210 50 L 170 65 L 120 45" />
              <path d="M 260 70 L 285 95 L 305 130 L 290 170" />
              <path d="M 260 70 L 230 110 L 190 125 L 140 160 L 100 175" />
              <path d="M 260 70 L 245 42" />
              <path d="M 230 110 L 250 155 L 220 180" />
              <path d="M 190 125 L 170 100 L 140 105 L 90 90" />
              <path d="M 210 50 L 200 80 L 160 85" />
              <path d="M 285 95 L 315 85" />
            </g>

            {/* Tem niêm phong sự cố hiện trường dán chéo viền máy */}
            <g transform="rotate(-6 130 155)">
              <rect x="110" y="140" width="180" height="34" rx="4" fill="#DC2626" fillOpacity="0.95" stroke="#FEF2F2" strokeWidth="1.5" />
              <text x="200" y="153" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                BIÊN BẢN SỰ CỐ HIỆN TRƯỜNG • RƠI VỠ
              </text>
              <text x="200" y="166" fill="#FEE2E2" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                DEV-HH-TAB-712 • KS. HOÀNG VĂN BÁCH
              </text>
            </g>

            {/* Dòng trạng thái kỹ thuật */}
            <rect x="10" y="205" width="380" height="26" rx="4" fill="#000000" fillOpacity="0.85" />
            <text x="20" y="222" fill="#F87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
              VỠ KÍNH CẢM ỨNG NGOÀI HIỆN TRƯỜNG • BỘ NHỚ FLASH NGUYÊN VẸN
            </text>
          </svg>
        </div>
      )

    // Mặc định: Bản đồ khảo sát kỹ thuật Drone
    default:
      return (
        <div className={`relative overflow-hidden select-none bg-[#1A2026] ${className}`}>
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            <rect width="400" height="240" fill="#1E262E" />
            {/* Lưới tọa độ trắc địa */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2B3540" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#grid)" />

            {/* Tuyến đường QL1A */}
            <path d="M 0,140 Q 150,110 400,130" fill="none" stroke="#475569" strokeWidth="48" />
            <path d="M 0,140 Q 150,110 400,130" fill="none" stroke="#C9A227" strokeWidth="2" strokeDasharray="12 8" />

            {/* Bounding box khiếm khuyết */}
            <rect x="170" y="95" width="60" height="45" rx="4" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
            <polygon points="170,95 210,95 215,80 175,80" fill="#EF4444" />
            <text x="195" y="91" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              DEF-0042
            </text>

            <rect x="10" y="205" width="240" height="24" rx="4" fill="#000000" fillOpacity="0.8" />
            <text x="18" y="221" fill="#C9A227" fontSize="10" fontWeight="bold" fontFamily="monospace">
              DRONE ORTHOPHOTO • {chainage}
            </text>
          </svg>
        </div>
      )
  }
}
