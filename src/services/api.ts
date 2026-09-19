import { INITIAL_DEPARTMENTS, INITIAL_LEAVE_REQUESTS, INITIAL_LEAVE_TYPES, INITIAL_USERS } from '../data/mockData';
import type { Department, LeaveRequest, LeaveType, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'leavepro_users',
  DEPARTMENTS: 'leavepro_departments',
  LEAVE_TYPES: 'leavepro_leave_types',
  LEAVE_REQUESTS: 'leavepro_leave_requests',
  AUTH_USER: 'leavepro_auth_user'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const api = {
  getUsers: async (): Promise<User[]> => {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById: async (id: number): Promise<User | undefined> => {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return users.find((u) => u.id === id);
  },

  getDepartments: async (): Promise<Department[]> => {
    return getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  getLeaveTypes: async (): Promise<LeaveType[]> => {
    return getStored<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES, INITIAL_LEAVE_TYPES);
  },

  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    return getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
  },

  getLeaveRequestById: async (id: number): Promise<LeaveRequest | undefined> => {
    const requests = getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
    return requests.find((r) => r.id === id);
  },

  createLeaveRequest: async (
    data: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'approved_by' | 'approver_name'>
  ): Promise<LeaveRequest> => {
    const requests = getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
    const today = new Date().toISOString().split('T')[0];

    const newRequest: LeaveRequest = {
      ...data,
      id: Date.now(),
      status: 'Pending',
      approved_by: null,
      approver_name: null,
      manager_remarks: '',
      created_at: today,
      updated_at: today
    };

    const updated = [newRequest, ...requests];
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, updated);
    return newRequest;
  },

  updateLeaveRequestStatus: async (
    id: number,
    status: 'Approved' | 'Rejected',
    approverId: number,
    approverName: string,
    remarks?: string
  ): Promise<LeaveRequest> => {
    const requests = getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
    const today = new Date().toISOString().split('T')[0];

    let updatedItem: LeaveRequest | undefined;

    const updated = requests.map((req) => {
      if (req.id === id) {
        updatedItem = {
          ...req,
          status,
          approved_by: approverId,
          approver_name: approverName,
          manager_remarks: remarks || '',
          updated_at: today
        };
        return updatedItem;
      }
      return req;
    });

    if (!updatedItem) {
      throw new Error('Leave request not found');
    }

    setStored(STORAGE_KEYS.LEAVE_REQUESTS, updated);
    return updatedItem;
  },

  createEmployee: async (data: Omit<User, 'id' | 'created_at' | 'status'>): Promise<User> => {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const newUser: User = {
      ...data,
      id: Date.now(),
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    const updated = [...users, newUser];
    setStored(STORAGE_KEYS.USERS, updated);
    return newUser;
  },

  getStoredAuthUser: (): User | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setStoredAuthUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  resetData: (): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(INITIAL_LEAVE_TYPES));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(INITIAL_LEAVE_REQUESTS));
  }
};
