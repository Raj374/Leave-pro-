import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { LeaveTypeBadge } from '../components/LeaveTypeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import type { LeaveStatus, LeaveTypeCode } from '../types';
import { formatDate, formatDateRange } from '../utils/leaveUtils';

export const LeaveHistory: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests } = useLeave();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const myRequests = useMemo(() => {
    if (!user) return [];
    return leaveRequests
      .filter((r) => r.employee_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [leaveRequests, user]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((req) => {
      const matchType = selectedType === 'ALL' || req.leave_type_code === selectedType;
      const matchStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
      const matchSearch =
        search === '' ||
        req.reason.toLowerCase().includes(search.toLowerCase()) ||
        req.leave_type_name.toLowerCase().includes(search.toLowerCase());

      return matchType && matchStatus && matchSearch;
    });
  }, [myRequests, selectedType, selectedStatus, search]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginated = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Leave History</h1>
          <p className="text-sm text-gray-500">View and track all your leave applications.</p>
        </div>
        <button
          onClick={() => navigate('/apply-leave')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow"
        >
          <Plus size={16} />
          <span>Apply Leave</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by reason or keyword..."
          className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
          <div className="p-8 text-center text-gray-500 text-sm">
            No matching leave records found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                    <th className="p-3.5">Leave Type</th>
                    <th className="p-3.5">Date Range</th>
                    <th className="p-3.5">Days</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-3.5">
                        <LeaveTypeBadge
                          code={req.leave_type_code as LeaveTypeCode}
                          name={req.leave_type_name}
                        />
                      </td>
                      <td className="p-3.5 font-medium text-gray-800">
                        {formatDateRange(req.start_date, req.end_date, req.is_half_day)}
                      </td>
                      <td className="p-3.5 text-gray-600 font-semibold">{req.total_days}</td>
                      <td className="p-3.5 max-w-xs truncate text-gray-600">{req.reason}</td>
                      <td className="p-3.5 text-gray-500 text-xs">{formatDate(req.created_at)}</td>
                      <td className="p-3.5">
                        <StatusBadge status={req.status as LeaveStatus} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/leave-details/${req.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Page {currentPage} of {totalPages}</span>
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
    </div>
  );
};
