const uuid=/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/gi
export function businessText(value:unknown,empty='Chưa có thông tin') {
  if(typeof value!=='string'||!value.trim())return empty
  return value.replace(uuid,'').replace(/\b[a-f0-9]{64}\b/gi,'').replace(/\s*\(\s*\)/g,'').trim() || empty
}
export function businessDate(value?:string|null){const time=value?Date.parse(value):NaN;return Number.isFinite(time)?new Date(time).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'Chưa có thời điểm'}
export function businessError(value:unknown){
  const message=typeof value==='string'?value:''
  if(/403|access_forbidden/i.test(message))return 'Bạn không có quyền thực hiện thao tác này.'
  if(/404|not_found/i.test(message))return 'Không tìm thấy hồ sơ trong phạm vi được phép đọc.'
  if(/401|unauthorized/i.test(message))return 'Phiên đăng nhập chưa hợp lệ. Vui lòng đăng nhập lại.'
  if(/409|412|concurrency|candidate_stale/i.test(message))return 'Hồ sơ hoặc điều kiện xử lý đã thay đổi. Vui lòng đọc lại trước khi tiếp tục.'
  if(/HTTP|correlationId|internal_error|Network Error|timeout/i.test(message))return 'Chưa kết nối được với hệ thống. Thử đọc lại hồ sơ; yêu cầu đã gửi vẫn được giữ.'
  return businessText(message,'Chưa thể hoàn tất thao tác. Vui lòng kiểm tra lại hồ sơ.').replace(/\bETag\b|body\/key|body\/key\/version|journal|\bDTO\b/g,'thông tin yêu cầu').replace(/\bGET\b/g,'đọc lại').replace(/\bPOST\b/g,'gửi yêu cầu')
}
const states:Record<string,string>={NewAssigned:'Chờ tiếp nhận',Accepted:'Đã tiếp nhận',InProgress:'Đang thực hiện',Submitted:'Chờ thẩm định',SupplementRequired:'Cần bổ sung',Completed:'Hoàn tất nhiệm vụ',Cancelled:'Đã hủy',ReadyToAssign:'Chờ giao việc',AwaitingApproval:'Chờ Giám sát duyệt',CONFIRMED:'Đã xác nhận',PUBLISHED:'Đã xuất bản',REVOKED:'Đã thu hồi',Normal:'Sửa chữa thông thường',FastTrack:'Xử lý nhanh',CREATED:'Tạo nhiệm vụ',ACCEPTED:'Tiếp nhận',STARTED:'Bắt đầu',SUBMITTED:'Nộp kết quả',SUPPLEMENT:'Yêu cầu bổ sung',REVIEWED:'Thẩm định kết quả',Area:'Diện tích',DepressionDepth:'Độ sâu lún',SlabFaultingHeight:'Chênh cao tấm',ShoulderErosionExtent:'Xói lề',KNOWN:'Đã có số đo',UNKNOWN:'Chưa xác định',LOCATION_UNKNOWN:'Chưa có căn cứ vị trí',MEASUREMENT_VALUE_UNKNOWN:'Chưa xác định được số đo',EVIDENCE_MISSING:'Thiếu ảnh bằng chứng',READY:'Đủ hồ sơ để thẩm định',INCOMPLETE:'Hồ sơ cần bổ sung'}
export const businessState=(value?:string|null)=>value?states[value]||Object.entries(states).find(([key])=>key.replace(/_/g,'').toLowerCase()===value.replace(/_/g,'').toLowerCase())?.[1]||'Chưa có mô tả trạng thái':'Chưa có trạng thái'
