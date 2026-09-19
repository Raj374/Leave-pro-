import React from 'react';
import { Building } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export const Departments: React.FC = () => {
  const { departments, users } = useLeave();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-sm text-gray-500">Overview of company divisions and staff counts.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700">
          Total: {departments.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const count = users.filter((u) => u.department_id === dept.id).length;

          return (
            <div key={dept.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building size={20} />
                </div>
                <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 rounded text-gray-700">
                  {dept.code}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-base">{dept.name}</h3>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Head:</span>
                  <span className="font-medium text-gray-700">{dept.head_name || 'Amit Verma'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Staff Count:</span>
                  <span className="font-bold text-blue-600">{count} Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-semibold text-green-600 capitalize">{dept.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
