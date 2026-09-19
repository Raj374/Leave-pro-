import React from 'react';
import type { LeaveStatus } from '../types';

interface Props {
  status: LeaveStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  if (status === 'Approved') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Approved
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Rejected
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
      Pending
    </span>
  );
};
