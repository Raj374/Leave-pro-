import React from 'react';
import { X } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLeave();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const bg =
          toast.type === 'success'
            ? 'bg-green-600'
            : toast.type === 'error'
            ? 'bg-red-600'
            : 'bg-gray-800';

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3.5 rounded-lg text-white shadow-lg ${bg}`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-white/20 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
