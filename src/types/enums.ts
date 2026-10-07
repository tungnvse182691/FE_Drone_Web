export enum RoleCode {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUPERVISOR     = 'SUPERVISOR',
  DRONE_OPERATOR = 'DRONE_OPERATOR',
  REPAIR_CREW    = 'REPAIR_CREW',
}

export enum DefectStatus {
  OPEN     = 'OPEN',     // AI mới phát hiện, chưa duyệt
  VERIFIED = 'VERIFIED', // PM đã thẩm định đúng
  REJECTED = 'REJECTED', // PM từ chối (báo giả)
  RESOLVED = 'RESOLVED', // Đã sửa chữa & nghiệm thu hoàn thành
}

export enum DefectType {
  POTHOLE          = 'POTHOLE',          // Ổ gà
  LONGITUDINAL_CRACK = 'LONGITUDINAL_CRACK', // Nứt dọc
  TRANSVERSE_CRACK   = 'TRANSVERSE_CRACK',   // Nứt ngang
  ALLIGATOR_CRACK    = 'ALLIGATOR_CRACK',    // Nứt da cá sấu / rạn lưới
  RUTTING            = 'RUTTING',            // Lún vệt bánh xe
  RAVELING           = 'RAVELING',           // Bong bật cốt liệu
}

export enum Severity {
  LOW      = 'LOW',
  MEDIUM   = 'MEDIUM',
  HIGH     = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RepairBatchStatus {
  DRAFT                  = 'DRAFT',                  // Đang lập phương án kỹ thuật
  PENDING_APPROVAL       = 'PENDING_APPROVAL',       // Chờ Supervisor duyệt
  REVISION_REQUIRED      = 'REVISION_REQUIRED',      // Trả về yêu cầu sửa đổi
  APPROVED               = 'APPROVED',               // Đã duyệt (khóa hồ sơ)
  ASSIGNED               = 'ASSIGNED',               // Đã giao việc cho Crew
  IN_PROGRESS            = 'IN_PROGRESS',            // Đang thi công
  PENDING_INSPECTION     = 'PENDING_INSPECTION',     // Chờ nghiệm thu
  REVISION_REQUIRED_WORK = 'REVISION_REQUIRED_WORK', // Thi công chưa đạt
  COMPLETED              = 'COMPLETED',              // Đã nghiệm thu & đóng đợt
}

export enum SurveyStatus {
  PLANNED     = 'PLANNED',     // Lên kế hoạch
  IN_FLIGHT   = 'IN_FLIGHT',   // Đang bay
  UPLOADED    = 'UPLOADED',    // Đã nạp ảnh thẻ SD
  PROCESSING  = 'PROCESSING',  // AI đang xử lý
  COMPLETED   = 'COMPLETED',   // Đã hoàn thành
}

export enum InspectionResult {
  PASSED   = 'PASSED',
  REJECTED = 'REJECTED',
}
