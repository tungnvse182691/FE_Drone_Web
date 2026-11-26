const km = new Intl.NumberFormat('vi-VN', {useGrouping: false, minimumFractionDigits: 5, maximumFractionDigits: 5})
const meters = new Intl.NumberFormat('vi-VN', {useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2})

// Display only. Never use these strings as geometry, offsets or command inputs.
export const displayKm = (value: number) => `${km.format(value)} km`
export const displayMeters = (value: number) => `${meters.format(value)} m`
