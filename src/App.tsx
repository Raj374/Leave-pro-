import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import { ApplyLeave } from './pages/ApplyLeave';
import { Departments } from './pages/Departments';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { Employees } from './pages/Employees';
import { LeaveBalance } from './pages/LeaveBalance';
import { LeaveDetails } from './pages/LeaveDetails';
import { LeaveHistory } from './pages/LeaveHistory';
import { LeaveRequests } from './pages/LeaveRequests';
import { Login } from './pages/Login';
import { ManagerDashboard } from './pages/ManagerDashboard';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'employee' | 'manager';
}> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeaveProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/apply-leave" element={<ApplyLeave />} />
              <Route path="/leave-history" element={<LeaveHistory />} />
              <Route path="/leave-balance" element={<LeaveBalance />} />
              <Route path="/leave-details/:id" element={<LeaveDetails />} />

              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/requests" element={<LeaveRequests />} />
              <Route path="/manager/employees" element={<Employees />} />
              <Route path="/manager/departments" element={<Departments />} />
              <Route path="/manager/leave-details/:id" element={<LeaveDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LeaveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
