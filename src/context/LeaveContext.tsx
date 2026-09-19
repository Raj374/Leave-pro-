import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Department, LeaveRequest, LeaveType, ToastMessage, User } from '../types';
import { useAuth } from './AuthContext';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  leaveTypes: LeaveType[];
  departments: Department[];
  users: User[];
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
  applyLeave: (data: {
    leave_type_code: string;
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day: boolean;
    reason: string;
  }) => Promise<boolean>;
  approveLeave: (id: number, remarks?: string) => Promise<boolean>;
  rejectLeave: (id: number, remarks?: string) => Promise<boolean>;
  addNewEmployee: (employeeData: Omit<User, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
  refreshData: () => Promise<void>;
  resetToInitialData: () => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [reqs, types, depts, usrs] = await Promise.all([
        api.getLeaveRequests(),
        api.getLeaveTypes(),
        api.getDepartments(),
        api.getUsers()
      ]);
      setLeaveRequests(reqs);
      setLeaveTypes(types);
      setDepartments(depts);
      setUsers(usrs);
    } catch {
      showToast('error', 'Failed to load system data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const applyLeave = async (data: {
    leave_type_code: string;
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day: boolean;
    reason: string;
  }): Promise<boolean> => {
    if (!user) {
      showToast('error', 'You must be logged in to apply for leave.');
      return false;
    }

    try {
      const type = leaveTypes.find((t) => t.code === data.leave_type_code);
      if (!type) {
        showToast('error', 'Selected leave type is invalid.');
        return false;
      }

      const newRequest = await api.createLeaveRequest({
        employee_id: user.id,
        employee_name: user.name,
        employee_email: user.email,
        department_name: user.department_name || 'Engineering & Technology',
        leave_type_id: type.id,
        leave_type_code: type.code,
        leave_type_name: type.name,
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: data.total_days,
        is_half_day: data.is_half_day,
        reason: data.reason
      });

      setLeaveRequests((prev) => [newRequest, ...prev]);
      showToast('success', 'Leave application submitted successfully! Status is Pending.');
      return true;
    } catch {
      showToast('error', 'Failed to submit leave application.');
      return false;
    }
  };

  const approveLeave = async (id: number, remarks?: string): Promise<boolean> => {
    if (!user) {
      showToast('error', 'Action unauthorized.');
      return false;
    }

    try {
      const updated = await api.updateLeaveRequestStatus(
        id,
        'Approved',
        user.id,
        user.name,
        remarks || 'Approved by Manager'
      );

      setLeaveRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('success', `Leave request #${id} approved successfully!`);
      return true;
    } catch {
      showToast('error', 'Failed to approve leave request.');
      return false;
    }
  };

  const rejectLeave = async (id: number, remarks?: string): Promise<boolean> => {
    if (!user) {
      showToast('error', 'Action unauthorized.');
      return false;
    }

    try {
      const updated = await api.updateLeaveRequestStatus(
        id,
        'Rejected',
        user.id,
        user.name,
        remarks || 'Rejected by Manager'
      );

      setLeaveRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('info', `Leave request #${id} has been rejected.`);
      return true;
    } catch {
      showToast('error', 'Failed to reject leave request.');
      return false;
    }
  };

  const addNewEmployee = async (
    employeeData: Omit<User, 'id' | 'created_at' | 'status'>
  ): Promise<boolean> => {
    try {
      const newEmp = await api.createEmployee(employeeData);
      setUsers((prev) => [...prev, newEmp]);
      showToast('success', `Employee ${newEmp.name} added successfully!`);
      return true;
    } catch {
      showToast('error', 'Failed to add employee.');
      return false;
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const resetToInitialData = async () => {
    api.resetData();
    await loadAllData();
    showToast('info', 'Demo data reset to initial default state.');
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        leaveTypes,
        departments,
        users,
        isLoading,
        toasts,
        showToast,
        removeToast,
        applyLeave,
        approveLeave,
        rejectLeave,
        addNewEmployee,
        refreshData,
        resetToInitialData
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = (): LeaveContextType => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
