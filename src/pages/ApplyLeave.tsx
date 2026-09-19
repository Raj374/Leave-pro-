import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { calculateDaysBetween, calculateLeaveBalances } from '../utils/leaveUtils';
import { validateLeaveApplication } from '../utils/validation';
import type { ValidationErrors } from '../utils/validation';

export const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { leaveTypes, leaveRequests, applyLeave } = useLeave();
  const navigate = useNavigate();

  const [leaveTypeCode, setLeaveTypeCode] = useState<string>('CL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const balances = user ? calculateLeaveBalances(user.id, leaveRequests, leaveTypes) : [];
  const selectedBalance = balances.find((b) => b.code === leaveTypeCode);
  const calculatedDays = calculateDaysBetween(startDate, endDate, isHalfDay);

  useEffect(() => {
    if (isHalfDay && startDate) {
      setEndDate(startDate);
    }
  }, [isHalfDay, startDate]);

  const handleReset = () => {
    setLeaveTypeCode('CL');
    setStartDate('');
    setEndDate('');
    setIsHalfDay(false);
    setReason('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateLeaveApplication({
      leave_type_code: leaveTypeCode,
      start_date: startDate,
      end_date: endDate,
      reason,
      is_half_day: isHalfDay,
      remainingBalance: selectedBalance?.remaining
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (calculatedDays <= 0) {
      setErrors({ end_date: 'Invalid date range selected.' });
      return;
    }

    if (selectedBalance && calculatedDays > selectedBalance.remaining) {
      setErrors({
        leave_type_code: `Insufficient balance! You have only ${selectedBalance.remaining} days remaining for ${selectedBalance.name}.`
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const success = await applyLeave({
      leave_type_code: leaveTypeCode,
      start_date: startDate,
      end_date: endDate,
      total_days: calculatedDays,
      is_half_day: isHalfDay,
      reason: reason.trim()
    });

    setIsSubmitting(false);

    if (success) {
      navigate('/leave-history');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Apply for Leave</h1>
        <p className="text-sm text-gray-500">Fill in the details below to submit a leave application.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={leaveTypeCode}
                onChange={(e) => {
                  setLeaveTypeCode(e.target.value);
                  if (errors.leave_type_code) setErrors({ ...errors, leave_type_code: '' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {balances.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code}) - {b.remaining} days remaining
                  </option>
                ))}
              </select>
              {errors.leave_type_code && (
                <p className="text-xs text-red-500 mt-1">{errors.leave_type_code}</p>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="halfDay"
                checked={isHalfDay}
                onChange={(e) => {
                  setIsHalfDay(e.target.checked);
                  if (e.target.checked && startDate) {
                    setEndDate(startDate);
                  }
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="halfDay" className="text-sm text-gray-700 font-medium cursor-pointer">
                Half Day Leave (0.5 day)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (isHalfDay || !endDate) setEndDate(e.target.value);
                    if (errors.start_date) setErrors({ ...errors, start_date: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.start_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  disabled={isHalfDay}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.end_date) setErrors({ ...errors, end_date: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
              </div>
            </div>

            {calculatedDays > 0 && (
              <div className="p-3 bg-blue-50 text-blue-800 text-sm font-semibold rounded-lg flex items-center justify-between">
                <span>Calculated Duration:</span>
                <span>{calculatedDays} {calculatedDays === 1 || calculatedDays === 0.5 ? 'Day' : 'Days'}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors({ ...errors, reason: '' });
                }}
                placeholder="State your reason for leave..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Apply Leave'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Leave Balance Summary</h3>
            {selectedBalance && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Selected Type:</span>
                  <span className="font-semibold">{selectedBalance.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Annual Limit:</span>
                  <span className="font-semibold">{selectedBalance.total} days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Used (Approved):</span>
                  <span className="font-semibold text-green-600">{selectedBalance.used} days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Available:</span>
                  <span className="font-bold text-blue-600">{selectedBalance.remaining} days</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-xs text-blue-900 space-y-2">
            <h4 className="font-bold text-sm">Leave Policy Guide</h4>
            <p>&bull; <strong>CL (Casual Leave):</strong> 7 days / year</p>
            <p>&bull; <strong>SL (Sick Leave):</strong> 5 days / year</p>
            <p>&bull; <strong>EL (Earned Leave):</strong> 10 days / year</p>
            <p>&bull; <strong>PL (Privilege Leave):</strong> 5 days / year</p>
            <p className="pt-2 text-gray-600 italic">
              Note: Balance is only deducted once manager approves the request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
