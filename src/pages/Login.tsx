import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      if (email.toLowerCase().includes('manager')) {
        navigate('/manager/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleDemo = async (role: 'employee' | 'manager') => {
    const ok = await loginAsDemo(role);
    if (ok) {
      navigate(role === 'manager' ? '/manager/dashboard' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-3">
            LP
          </div>
          <h1 className="text-2xl font-bold text-gray-800">LEAVEPRO</h1>
          <p className="text-sm text-gray-500 mt-1">Employee Leave Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition"
          >
            Sign In
          </button>
        </form>

        <div className="my-6 border-t border-gray-200 text-center relative">
          <span className="bg-white px-2 text-xs text-gray-400 absolute -top-2 left-1/2 -translate-x-1/2">
            Demo Accounts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDemo('employee')}
            className="p-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
          >
            Login as Employee
          </button>
          <button
            type="button"
            onClick={() => handleDemo('manager')}
            className="p-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
          >
            Login as Manager
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
          <p><strong>Employee:</strong> employee@company.com / 123456</p>
          <p><strong>Manager:</strong> manager@company.com / 123456</p>
        </div>
      </div>
    </div>
  );
};
