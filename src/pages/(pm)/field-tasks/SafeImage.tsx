import React, { useState } from 'react'
import { Camera } from 'lucide-react'
import { RoadDefectImage, RoadDefectImageProps } from '../../../components/common/RoadDefectImages'

export const SafeImage: React.FC<{
  src?: string
  alt: string
  className?: string
  fallbackLabel?: string
  fallbackIcon?: React.ComponentType<{ className?: string }>
  vectorType?: RoadDefectImageProps['type']
  chainage?: string
  value?: string
}> = ({
  src,
  alt,
  className = '',
  fallbackLabel = 'Ảnh Hiện Trường QL1A',
  fallbackIcon: FallbackIcon = Camera,
  vectorType,
  chainage,
  value,
}) => {
  if (vectorType) {
    return (
      <RoadDefectImage
        type={vectorType}
        className={className}
        caption={fallbackLabel}
        chainage={chainage}
        value={value}
      />
    )
  }

  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full bg-linear-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-3 text-center border border-slate-700/60 select-none relative overflow-hidden ${className}`}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#C9A227 1px, transparent 1px), radial-gradient(#C9A227 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />
        <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] mb-1.5 shadow-xs z-10">
          <FallbackIcon className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-bold text-white font-sansation z-10 tracking-wide uppercase">
          {fallbackLabel}
        </span>
        <span className="text-[9px] font-mono text-[#F1E5C6]/70 z-10 mt-0.5">
          HOÀNG HẢI ROADGUARD • CHỨNG CỨ SỐ
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover ${className}`}
      loading="lazy"
    />
  )
}
