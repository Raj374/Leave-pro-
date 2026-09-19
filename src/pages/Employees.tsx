import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import type { UserRole } from '../types';

export const Employees: React.FC = () => {
  const { users, departments, addNewEmployee } = useLeave();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(departments[0]?.id || 1);
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchDept = selectedDept === 'ALL' || u.department_name === selectedDept;
      const matchSearch =
        search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.designation.toLowerCase().includes(search.toLowerCase());

      return matchDept && matchSearch;
    });
  }, [users, selectedDept, search]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !designation.trim()) {
      setError('Please fill all fields.');
      return;
    }

    const dept = departments.find((d) => d.id === Number(departmentId));

    const success = await addNewEmployee({
      name: name.trim(),
      email: email.trim(),
      role,
      department_id: Number(departmentId),
      department_name: dept?.name || 'General',
      designation: designation.trim()
    });

    if (success) {
      setName('');
      setEmail('');
      setDesignation('');
      setRole('employee');
      setError('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
          <p className="text-sm text-gray-500">View and manage company employees.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, role..."
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <div key={u.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                {u.name.charAt(0)}
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 uppercase">
                {u.role}
              </span>
            </div>

            <h3 className="font-bold text-gray-800 text-base">{u.name}</h3>
            <p className="text-xs text-blue-600 font-medium">{u.designation}</p>

            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p>Email: <span className="text-gray-700">{u.email}</span></p>
              <p>Dept: <span className="text-gray-700">{u.department_name}</span></p>
              <p>Status: <span className="text-green-600 font-semibold">Active</span></p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Employee</h3>

            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
