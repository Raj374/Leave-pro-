export type UserRole = 'employee' | 'manager';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department_id: number;
  department_name?: string;
  designation: string;
  avatar?: string;
  status: UserStatus;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  status: UserStatus;
  head_name?: string;
  created_at: string;
}

export type LeaveTypeCode = 'CL' | 'SL' | 'EL' | 'PL';

export interface LeaveType {
  id: number;
  name: string;
  code: LeaveTypeCode;
  annual_limit: number;
  description: string;
  color: string;
  status: UserStatus;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string;
  leave_type_id: number;
  leave_type_code: LeaveTypeCode;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  reason: string;
  status: LeaveStatus;
  approved_by?: number | null;
  approver_name?: string | null;
  manager_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalanceSummary {
  code: LeaveTypeCode;
  name: string;
  total: number;
  used: number;
  remaining: number;
  pending: number;
  color: string;
}

export interface DashboardStats {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
