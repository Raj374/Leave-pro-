import React from 'react';
import type { LeaveTypeCode } from '../types';

interface Props {
  code: LeaveTypeCode | string;
  name?: string;
}

export const LeaveTypeBadge: React.FC<Props> = ({ code, name }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'CL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getBadgeColor(code)}`}>
      <strong className="font-bold">{code}</strong>
      {name && <span>- {name}</span>}
    </span>
  );
};
