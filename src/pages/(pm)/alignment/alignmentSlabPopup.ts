// Content for the existing popup; never invent engineering values for missing fields.
export function slabPopupValues(p: Record<string, unknown>) {
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : 'Chưa có dữ liệu'
  const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  const metric = (value: unknown, unit: string) => typeof value === 'number' && Number.isFinite(value) ? `${value}${unit}` : 'Chưa có dữ liệu'
  const snapshot = p.source === 'SERVER_SNAPSHOT'
  return { code: escape(text(p.code)), station: escape(text(p.station)), lane: escape(text(p.lane)), edgeOffset: escape(text(p.edgeOffset)),
    dimensions: `${metric(p.lengthM, 'm')} × ${metric(p.widthM, 'm')} × ${metric(p.thicknessCm, 'cm')}`,
    contraction: metric(p.contractionSpacingM, 'm'),
    lateralLabel: snapshot ? 'Vị trí dải ngang' : 'Cự ly mép đường',
    status: snapshot ? `Đã lưu trên máy chủ · layoutId: ${escape(text(p.layoutId))}` : 'Preview — chưa lưu/chưa xác nhận' }
}
