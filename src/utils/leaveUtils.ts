import type { DashboardStats, LeaveBalanceSummary, LeaveRequest, LeaveType, LeaveTypeCode } from '../types';

export function calculateDaysBetween(startDate: string, endDate: string, isHalfDay: boolean = false): number {
  if (!startDate || !endDate) return 0;
  if (isHalfDay) return 0.5;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateRange(startDate: string, endDate: string, isHalfDay: boolean = false): string {
  if (isHalfDay || startDate === endDate) {
    return `${formatDate(startDate)}${isHalfDay ? ' (Half Day)' : ''}`;
  }
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function calculateLeaveBalances(
  employeeId: number,
  requests: LeaveRequest[],
  leaveTypes: LeaveType[]
): LeaveBalanceSummary[] {
  const employeeRequests = requests.filter((r) => r.employee_id === employeeId);

  return leaveTypes.map((type) => {
    const typeRequests = employeeRequests.filter(
      (r) => r.leave_type_code === type.code || r.leave_type_id === type.id
    );

    const used = typeRequests
      .filter((r) => r.status === 'Approved')
      .reduce((acc, curr) => acc + curr.total_days, 0);

    const pending = typeRequests
      .filter((r) => r.status === 'Pending')
      .reduce((acc, curr) => acc + curr.total_days, 0);

    const remaining = Math.max(0, type.annual_limit - used);

    return {
      code: type.code as LeaveTypeCode,
      name: type.name,
      total: type.annual_limit,
      used,
      remaining,
      pending,
      color: type.color
    };
  });
}

export function calculateDashboardStats(
  employeeId: number,
  requests: LeaveRequest[],
  leaveTypes: LeaveType[]
): DashboardStats {
  const balances = calculateLeaveBalances(employeeId, requests, leaveTypes);
  const employeeRequests = requests.filter((r) => r.employee_id === employeeId);

  const totalLeaves = balances.reduce((acc, curr) => acc + curr.total, 0);
  const usedLeaves = balances.reduce((acc, curr) => acc + curr.used, 0);
  const remainingLeaves = totalLeaves - usedLeaves;

  const pendingRequests = employeeRequests.filter((r) => r.status === 'Pending').length;
  const approvedRequests = employeeRequests.filter((r) => r.status === 'Approved').length;
  const rejectedRequests = employeeRequests.filter((r) => r.status === 'Rejected').length;

  return {
    totalLeaves,
    usedLeaves,
    remainingLeaves,
    pendingRequests,
    approvedRequests,
    rejectedRequests
  };
}
