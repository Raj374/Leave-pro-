import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { calculateLeaveBalances } from '../utils/leaveUtils';

export const LeaveBalance: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, leaveTypes } = useLeave();
  const navigate = useNavigate();

  if (!user) return null;

  const balances = calculateLeaveBalances(user.id, leaveRequests, leaveTypes);
  const totalAnnual = balances.reduce((acc, b) => acc + b.total, 0);
  const totalUsed = balances.reduce((acc, b) => acc + b.used, 0);
  const totalRemaining = totalAnnual - totalUsed;
  const totalPending = balances.reduce((acc, b) => acc + b.pending, 0);

  const policyList = [
    {
      code: 'CL',
      name: 'Casual Leave',
      limit: 7,
      rules: 'For sudden or unexpected personal errands. Can be availed as half-day or full-day.'
    },
    {
      code: 'SL',
      name: 'Sick Leave',
      limit: 5,
      rules: 'For medical appointments or health recovery. Medical certificate needed if over 2 days.'
    },
    {
      code: 'EL',
      name: 'Earned Leave',
      limit: 10,
      rules: 'For vacation and planned personal time. Apply in advance.'
    },
    {
      code: 'PL',
      name: 'Privilege Leave',
      limit: 5,
      rules: 'Special leave allocation for festivals and personal milestones.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Balance & Policy</h1>
          <p className="text-sm text-gray-500">Current annual allocation, consumption and company leave policy.</p>
        </div>
        <button
          onClick={() => navigate('/apply-leave')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow"
        >
          Apply Leave
        </button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-sm">
        <strong>Information Note:</strong> Leave balance updates in real-time once a request is approved by your manager. Pending requests do not deduct balance.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Quota</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalAnnual} Days</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase">Approved Used</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">{totalUsed} Days</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase">Remaining Balance</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">{totalRemaining} Days</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase">Pending Requests</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-1">{totalPending} Days</h3>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Leave Breakdown by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <LeaveBalanceCard key={b.code} balance={b} />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 text-base mb-4">Leave Policy Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyList.map((item) => (
            <div key={item.code} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-sm text-gray-800">
                  {item.name} ({item.code})
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-gray-300 rounded">
                  {item.limit} Days / Year
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">{item.rules}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
