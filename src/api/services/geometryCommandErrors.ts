// Only these locally authored messages may bypass ProblemDetails mapping.
export class GeometryCommandUiError extends Error {}

function problemMessage(error: any, sessionActive: boolean): string {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (code === 'csrf_failed') return 'CSRF chưa hợp lệ. Hãy kiểm tra phiên và thử lại đúng yêu cầu.'
  if (code === 'auth_session_revoked' || status === 401 && !sessionActive) return 'Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.'
  if (code === 'auth_password_change_required') return 'Tài khoản cần đổi mật khẩu trước khi tiếp tục.'
  if (code === 'access_forbidden') return 'Bạn không có quyền thực hiện thao tác trên hồ sơ này.'
  if (status === 401) return 'Yêu cầu chưa được xác thực bằng phiên Web hiện tại.'
  if (status === 428) return 'Thiếu điều kiện gửi yêu cầu. Hãy đọc lại hồ sơ trước khi thử lại.'
  const messages: Record<string, string> = {
    validation_error: 'Thông tin yêu cầu chưa hợp lệ. Hãy kiểm tra lại bản nhập.',
    geometry_validation_failed: 'Thông số hình học chưa hợp lệ. Hãy kiểm tra tọa độ và bề rộng.',
    geometry_metadata_incomplete: 'Hồ sơ tuyến còn thiếu thông tin kỹ thuật.',
    unsupported_crs: 'Hệ tọa độ chưa được hỗ trợ cho dữ liệu này.',
    crs_profile_invalid: 'Hồ sơ CRS chưa hợp lệ.',
    crs_profile_scope_mismatch: 'Hồ sơ CRS không thuộc phạm vi dự án.',
    crs_profile_srid_mismatch: 'Hệ tọa độ không khớp hồ sơ CRS.',
    native_alignment_invalid: 'Hình học native chưa hợp lệ.',
    route_system_scope_mismatch: 'Hệ tuyến không thuộc phạm vi dự án.',
    route_topology_invalid: 'Liên kết tuyến chưa hợp lệ.',
    route_topology_cycle: 'Liên kết tuyến có vòng lặp.',
    branch_parent_or_junction_invalid: 'Tuyến cha hoặc điểm nối nhánh chưa hợp lệ.',
    branch_junction_mismatch: 'Điểm nối nhánh không khớp tuyến cha.',
    duplicate_request: 'Khóa yêu cầu đã dùng cho nội dung khác. Cần đối chiếu yêu cầu cũ.',
    project_closed: 'Dự án đã đóng; không thể thay đổi hồ sơ tuyến.',
    road_geometry_invalid_state: 'Trạng thái bản nháp không cho phép thao tác này.',
    road_section_code_conflict: 'Mã tuyến đã tồn tại. Hãy đối chiếu hồ sơ tuyến.',
    concurrency_conflict: 'Phiên bản đã thay đổi. Bản nhập được giữ để đối chiếu.',
    road_section_concurrency_conflict: 'Phiên bản tuyến đã thay đổi. Bản nhập được giữ để đối chiếu.',
    segment_publication_conflict: 'Dữ liệu liên quan đang xung đột. Cần đối chiếu trước khi tiếp tục.',
  }
  if (typeof code === 'string' && Object.prototype.hasOwnProperty.call(messages, code)) return messages[code]
  if (status === 400 || status === 422) return 'Thông tin yêu cầu chưa hợp lệ. Hãy kiểm tra lại bản nhập.'
  if (status === 403) return 'Máy chủ từ chối yêu cầu. Hãy kiểm tra điều kiện truy cập hồ sơ.'
  if (status === 404) return 'Không tìm thấy hồ sơ hoặc hồ sơ không còn trong phạm vi truy cập.'
  if (status === 409) return 'Yêu cầu xung đột với dữ liệu hiện tại. Hãy đối chiếu hồ sơ.'
  if (status === 412) return 'Phiên bản đã thay đổi. Bản nhập được giữ để đối chiếu.'
  if (status === 415) return 'Định dạng yêu cầu chưa được máy chủ chấp nhận.'
  if (status === 429) return 'Gửi yêu cầu quá nhanh. Vui lòng thử lại sau.'
  if (error?.request || ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error?.code)) return 'Không kết nối được máy chủ. Vui lòng thử lại.'
  return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại hoặc đối chiếu hồ sơ.'
}

export function geometryCommandErrorMessage(error: any, sessionActive: boolean, pending: { receipt?: unknown } | null): string {
  if (error?.receipt || pending?.receipt) return `Máy chủ đã tiếp nhận lệnh; chưa đọc lại được kết quả. ${problemMessage(error?.cause || error, sessionActive)}`
  if (pending && (!error?.response || error.response.status >= 500)) return 'Chưa rõ kết quả trên máy chủ. Hãy đối chiếu hoặc gửi lại đúng yêu cầu đã giữ.'
  if (error instanceof GeometryCommandUiError) return error.message
  return problemMessage(error, sessionActive)
}
