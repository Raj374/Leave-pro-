import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart2,
  Building,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/apply-leave', label: 'Apply Leave', icon: Calendar },
    { to: '/leave-history', label: 'My Leave History', icon: Clock },
    { to: '/leave-balance', label: 'Leave Balance', icon: BarChart2 }
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: Home },
    { to: '/manager/requests', label: 'Leave Requests', icon: FileText },
    { to: '/manager/employees', label: 'Employees', icon: Users },
    { to: '/manager/departments', label: 'Departments', icon: Building }
  ];

  const links = role === 'manager' ? managerLinks : employeeLinks;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              LP
            </div>
            <span className="text-lg font-bold text-white tracking-wide">LEAVEPRO</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user?.name}</h4>
              <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
