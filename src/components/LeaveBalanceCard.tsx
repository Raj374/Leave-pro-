import React from 'react';
import type { LeaveBalanceSummary } from '../types';

interface Props {
  balance: LeaveBalanceSummary;
}

export const LeaveBalanceCard: React.FC<Props> = ({ balance }) => {
  const percentage = Math.min(100, Math.round((balance.used / balance.total) * 100));

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
            {balance.code}
          </span>
          <h4 className="font-semibold text-gray-800 text-sm">{balance.name}</h4>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {balance.used} / {balance.total} days
        </span>
      </div>

      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Remaining: <strong className="text-gray-800">{balance.remaining} days</strong>
        </span>
        {balance.pending > 0 && (
          <span className="text-yellow-600 font-medium">({balance.pending}d pending)</span>
        )}
      </div>
    </div>
  );
};
