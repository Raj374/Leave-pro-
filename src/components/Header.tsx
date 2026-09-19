import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';

interface Props {
  onToggleSidebar: () => void;
}

export const Header: React.FC<Props> = ({ onToggleSidebar }) => {
  const { user, role, loginAsDemo } = useAuth();
  const { resetToInitialData } = useLeave();
  const navigate = useNavigate();

  const handleRoleToggle = async () => {
    const nextRole = role === 'manager' ? 'employee' : 'manager';
    const ok = await loginAsDemo(nextRole);
    if (ok) {
      navigate(nextRole === 'manager' ? '/manager/dashboard' : '/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          {role === 'manager' ? 'Manager Portal' : 'Employee Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRoleToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          <UserCheck size={14} />
          <span>Switch to {role === 'manager' ? 'Employee' : 'Manager'}</span>
        </button>

        <button
          onClick={resetToInitialData}
          title="Reset Demo Data"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw size={16} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-800">{user?.name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
