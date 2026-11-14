export const displayStatus = (value?: string | null) => ({ READY:'Sẵn sàng', INCOMPLETE:'Chưa đầy đủ', UNAVAILABLE:'Chưa khả dụng', PLANNED:'Thiết kế', AS_BUILT:'Hoàn công', SAMPLE:'Xem thử', DRAFT:'Bản nháp', PUBLISHED:'Đã công bố', SUPERSEDED:'Đã thay thế' }[value || ''] || value || 'Chưa có trạng thái')
export const layerLabel = (key: string) => ({route:'Tim tuyến',segments:'Phân đoạn',slabs:'Tấm bê tông',plannedSlabs:'Tấm thiết kế',asBuiltSlabs:'Tấm hoàn công',strips:'Dải tấm',roadSurface:'Mặt đường',surveyArea:'Vùng khảo sát',wgs84:'Tọa độ địa lý',wgs84Sample:'Tọa độ địa lý xem thử',defects:'Khiếm khuyết',defectsWgs84:'Khiếm khuyết theo tọa độ địa lý'}[key] || 'Lớp bản đồ khác')
export const reasonLabel = (code: string) => ({OFFICIAL_CRS_ACCEPTANCE_PENDING:'Chưa nghiệm thu hệ tọa độ chính thức.',AS_BUILT_NOT_CAPTURED:'Chưa ghi nhận tấm hoàn công.',WGS84_TRANSFORM_NOT_CONFIGURED:'Chưa cấu hình chuyển đổi tọa độ địa lý.'}[code] || 'Xem nguyên nhân trong chi tiết kỹ thuật.')
export function readableTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Chưa có thời gian' : date.toLocaleString('vi-VN') }
export function segmentSetLabel(set: {status:string;version:string}, index?: number) { return `Bộ phân đoạn${index == null ? '' : ` ${index + 1}`} · ${displayStatus(set.status)}` }

export function pavementSizeLabel(value: import('../../../api/services/pavementService').PavementLayoutView) {
  if (value.kind === 'PLANNED' && value.layout) return `Dài ${value.layout.slabLengthMeters.toLocaleString('vi-VN')} m × rộng ${value.layout.stripWidthMeters.toLocaleString('vi-VN')} m${value.layout.slabThicknessCentimeters != null ? ` × dày ${value.layout.slabThicknessCentimeters.toLocaleString('vi-VN')} cm` : ''}`
  const slabs=value.geometry.slabs
  if(!slabs.length)return 'Chưa có tấm'
  const sizes=new Set(slabs.map(s=>s.lengthMeters != null && s.widthMeters != null ? `${s.lengthMeters.toLocaleString('vi-VN')} × ${s.widthMeters.toLocaleString('vi-VN')} m` : 'Chưa đủ số đo'))
  return sizes.size===1?[...sizes][0]:`${slabs.length} tấm · Nhiều kích thước thực tế`
}
