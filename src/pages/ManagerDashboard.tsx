import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LeaveCard } from '../components/LeaveCard';
import { LeaveTypeBadge } from '../components/LeaveTypeBadge';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import type { LeaveRequest, LeaveTypeCode } from '../types';
import { formatDateRange } from '../utils/leaveUtils';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, users, approveLeave, rejectLeave } = useLeave();
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  const pending = leaveRequests.filter((r) => r.status === 'Pending');
  const approved = leaveRequests.filter((r) => r.status === 'Approved');
  const rejected = leaveRequests.filter((r) => r.status === 'Rejected');

  const handleAction = async (remarks?: string) => {
    if (!selectedRequest) return;
    if (modalAction === 'approve') {
      await approveLeave(selectedRequest.id, remarks);
    } else if (modalAction === 'reject') {
      await rejectLeave(selectedRequest.id, remarks);
    }
    setModalAction(null);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manager Portal - {user?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Review team leave requests and manage staff records.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/manager/requests')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg"
          >
            Review Requests ({pending.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LeaveCard
          title="Pending Requests"
          value={pending.length}
          subtitle="Needs review"
          icon={Clock}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          onClick={() => navigate('/manager/requests')}
        />
        <LeaveCard
          title="Approved Requests"
          value={approved.length}
          subtitle="Total approved"
          icon={CheckCircle}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          onClick={() => navigate('/manager/requests')}
        />
        <LeaveCard
          title="Rejected Requests"
          value={rejected.length}
          subtitle="Declined"
          icon={XCircle}
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <LeaveCard
          title="Total Staff"
          value={users.length}
          subtitle="Employees"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => navigate('/manager/employees')}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm">Pending Leave Requests</h3>
          <Link to="/manager/requests" className="text-xs font-semibold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No pending leave requests to review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Leave Type</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-semibold text-gray-800">{req.employee_name}</td>
                    <td className="p-3.5 text-gray-600">{req.department_name}</td>
                    <td className="p-3.5">
                      <LeaveTypeBadge
                        code={req.leave_type_code as LeaveTypeCode}
                        name={req.leave_type_name}
                      />
                    </td>
                    <td className="p-3.5 text-gray-700">
                      {formatDateRange(req.start_date, req.end_date, req.is_half_day)} ({req.total_days}d)
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-gray-600">{req.reason}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setModalAction('reject');
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setModalAction('approve');
                          }}
                          className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold"
                        >
                          Approve
                        </button>
                        <Link
                          to={`/manager/leave-details/${req.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline px-1"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalAction === 'approve' && !!selectedRequest}
        onClose={() => {
          setModalAction(null);
          setSelectedRequest(null);
        }}
        onConfirm={handleAction}
        title="Approve Leave"
        message={`Approve ${selectedRequest?.total_days} days leave for ${selectedRequest?.employee_name}?`}
        confirmText="Approve"
        type="success"
      />

      <ConfirmationModal
        isOpen={modalAction === 'reject' && !!selectedRequest}
        onClose={() => {
          setModalAction(null);
          setSelectedRequest(null);
        }}
        onConfirm={handleAction}
        title="Reject Leave"
        message={`Reason for rejecting ${selectedRequest?.employee_name}'s leave:`}
        confirmText="Reject"
        type="danger"
        requireRemarks={true}
      />
    </div>
  );
};
