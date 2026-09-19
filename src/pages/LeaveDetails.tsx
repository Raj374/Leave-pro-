import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LeaveTypeBadge } from '../components/LeaveTypeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import type { LeaveStatus, LeaveTypeCode } from '../types';
import { formatDate, formatDateRange } from '../utils/leaveUtils';

export const LeaveDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { leaveRequests, approveLeave, rejectLeave } = useLeave();

  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  const request = leaveRequests.find((r) => r.id === Number(id));

  if (!request) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Leave Record Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAction = async (remarks?: string) => {
    if (modalAction === 'approve') {
      await approveLeave(request.id, remarks);
    } else if (modalAction === 'reject') {
      await rejectLeave(request.id, remarks);
    }
    setModalAction(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <StatusBadge status={request.status as LeaveStatus} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{request.employee_name}</h2>
            <p className="text-sm text-gray-500">{request.employee_email} &bull; {request.department_name}</p>
          </div>
          <LeaveTypeBadge
            code={request.leave_type_code as LeaveTypeCode}
            name={request.leave_type_name}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Dates</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">
              {formatDateRange(request.start_date, request.end_date, request.is_half_day)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Days</span>
            <p className="text-sm font-bold text-blue-600 mt-0.5">
              {request.total_days} {request.total_days === 1 || request.total_days === 0.5 ? 'Day' : 'Days'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Applied Date</span>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(request.created_at)}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Reason for Leave</h4>
          <div className="p-3.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
            {request.reason}
          </div>
        </div>

        {(request.status !== 'Pending' || request.approver_name || request.manager_remarks) && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-gray-800 text-sm">Manager Decision</h4>
            {request.approver_name && (
              <p>Reviewed by: <strong>{request.approver_name}</strong></p>
            )}
            {request.manager_remarks && (
              <p>Remarks: <em>"{request.manager_remarks}"</em></p>
            )}
          </div>
        )}

        {role === 'manager' && request.status === 'Pending' && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setModalAction('reject')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
            >
              Reject Leave
            </button>
            <button
              onClick={() => setModalAction('approve')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
            >
              Approve Leave
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalAction === 'approve'}
        onClose={() => setModalAction(null)}
        onConfirm={handleAction}
        title="Approve Leave"
        message={`Approve ${request.total_days} days leave for ${request.employee_name}?`}
        confirmText="Approve"
        type="success"
      />

      <ConfirmationModal
        isOpen={modalAction === 'reject'}
        onClose={() => setModalAction(null)}
        onConfirm={handleAction}
        title="Reject Leave"
        message={`Reason for rejecting ${request.employee_name}'s request:`}
        confirmText="Reject"
        type="danger"
        requireRemarks={true}
      />
    </div>
  );
};
