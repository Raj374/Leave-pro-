export interface ValidationErrors {
  [key: string]: string;
}

export function validateLeaveApplication(data: {
  leave_type_code: string;
  start_date: string;
  end_date: string;
  reason: string;
  is_half_day: boolean;
  remainingBalance?: number;
}): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  if (!data.leave_type_code) {
    errors.leave_type_code = 'Please select a leave type.';
  }

  if (!data.start_date) {
    errors.start_date = 'Start date is required.';
  }

  if (!data.end_date) {
    errors.end_date = 'End date is required.';
  }

  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (end < start) {
      errors.end_date = 'End date cannot be earlier than start date.';
    }
  }

  if (!data.reason || data.reason.trim().length === 0) {
    errors.reason = 'Please provide a reason for leave.';
  } else if (data.reason.trim().length < 5) {
    errors.reason = 'Reason must be at least 5 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateLogin(email: string, password?: string): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password !== undefined && (!password || password.trim().length === 0)) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
