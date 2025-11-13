export enum SessionStatus {
  PENDING = 'pending',       // student đặt, chờ tutor/coordinator confirm
  APPROVED = 'approved',     // đã được chấp nhận
  REJECTED = 'rejected',     // bị từ chối
  CANCELLED = 'cancelled',   // student tự hủy
  DONE = 'done',             // đã diễn ra
}