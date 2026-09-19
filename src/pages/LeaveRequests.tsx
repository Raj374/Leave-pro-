import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LeaveTypeBadge } from '../components/LeaveTypeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useLeave } from '../context/LeaveContext';
import type { LeaveRequest, LeaveStatus, LeaveTypeCode } from '../types';
import { formatDate, formatDateRange } from '../utils/leaveUtils';

export const LeaveRequests: React.FC = () => {
  const { leaveRequests, departments, approveLeave, rejectLeave } = useLeave();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  const filtered = useMemo(() => {
    return leaveRequests
      .filter((req) => {
        const matchDept = selectedDept === 'ALL' || req.department_name === selectedDept;
        const matchType = selectedType === 'ALL' || req.leave_type_code === selectedType;
        const matchStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
        const matchSearch =
          search === '' ||
          req.employee_name.toLowerCase().includes(search.toLowerCase()) ||
          req.reason.toLowerCase().includes(search.toLowerCase()) ||
          req.department_name.toLowerCase().includes(search.toLowerCase());

        return matchDept && matchType && matchStatus && matchSearch;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [leaveRequests, selectedDept, selectedType, selectedStatus, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
        <p className="text-sm text-gray-500">Review, filter, and approve or reject employee leave applications.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search employee, department, reason..."
          className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="CL">Casual Leave (CL)</option>
            <option value="SL">Sick Leave (SL)</option>
            <option value="EL">Earned Leave (EL)</option>
            <option value="PL">Privilege Leave (PL)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No leave records match the filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Leave Type</th>
                    <th className="p-3.5">Dates</th>
                    <th className="p-3.5">Days</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((req) => (
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
                        {formatDateRange(req.start_date, req.end_date, req.is_half_day)}
                      </td>
                      <td className="p-3.5 text-gray-600 font-semibold">{req.total_days}</td>
                      <td className="p-3.5 text-gray-500 text-xs">{formatDate(req.created_at)}</td>
                      <td className="p-3.5">
                        <StatusBadge status={req.status as LeaveStatus} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setModalAction('reject');
                                }}
                                className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setModalAction('approve');
                                }}
                                className="px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded font-semibold"
                              >
                                Approve
                              </button>
                            </>
                          )}
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

            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {paginated.length} of {filtered.length} entries</span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 border rounded disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 border rounded disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
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
        message={`Reason for rejecting ${selectedRequest?.employee_name}'s request:`}
        confirmText="Reject"
        type="danger"
        requireRemarks={true}
      />
    </div>
  );
};
