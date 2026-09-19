import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { LeaveCard } from '../components/LeaveCard';
import { LeaveTypeBadge } from '../components/LeaveTypeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { calculateDashboardStats, calculateLeaveBalances, formatDateRange } from '../utils/leaveUtils';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, leaveTypes } = useLeave();
  const navigate = useNavigate();

  if (!user) return null;

  const stats = calculateDashboardStats(user.id, leaveRequests, leaveTypes);
  const balances = calculateLeaveBalances(user.id, leaveRequests, leaveTypes);

  const myRequests = leaveRequests
    .filter((r) => r.employee_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const recentRequests = myRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-xl text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-blue-100 text-sm mt-1">
            {user.designation} - {user.department_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/apply-leave')}
            className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg text-sm hover:bg-blue-50 transition"
          >
            Apply Leave
          </button>
          <button
            onClick={() => navigate('/leave-history')}
            className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition"
          >
            My History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LeaveCard
          title="Total Leaves"
          value={`${stats.totalLeaves} Days`}
          subtitle="Annual quota"
          icon={Calendar}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <LeaveCard
          title="Used Leaves"
          value={`${stats.usedLeaves} Days`}
          subtitle="Approved leaves"
          icon={CheckCircle}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <LeaveCard
          title="Remaining Leaves"
          value={`${stats.remainingLeaves} Days`}
          subtitle="Available balance"
          icon={Calendar}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <LeaveCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Under review"
          icon={Clock}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Leave Balance by Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((balance) => (
            <LeaveBalanceCard key={balance.code} balance={balance} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Recent Leave Requests</h3>
          <Link to="/leave-history" className="text-xs font-semibold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No leave requests found. Click "Apply Leave" to submit a request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <LeaveTypeBadge code={req.leave_type_code} name={req.leave_type_name} />
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                      {formatDateRange(req.start_date, req.end_date, req.is_half_day)}
                    </td>
                    <td className="p-3 text-gray-600">{req.total_days}</td>
                    <td className="p-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{req.created_at}</td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/leave-details/${req.id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
