
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { removeToast } from '../lib/store/uiSlice';
import { X } from 'lucide-react';

export default function ToastNotification() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    // Auto-remove toasts after 5 seconds unless they have an action
    toasts.forEach((toast) => {
      if (!toast.action) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <span>{toast.message}</span>
          <div className="flex items-center gap-2">
            {toast.action && (
              <button
                className="text-sm underline hover:opacity-80"
                onClick={() => {
                  toast.action?.onClick();
                  dispatch(removeToast(toast.id));
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              className="ml-2 hover:opacity-80"
              onClick={() => dispatch(removeToast(toast.id))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
