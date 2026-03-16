import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Loader } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  loading: Loader,
};

const COLORS = {
  success: 'border-success/50 bg-success/10',
  error: 'border-danger/50 bg-danger/10',
  info: 'border-brand/50 bg-brand/10',
  loading: 'border-accent/50 bg-accent/10',
};

function Toast({ toast, onClose }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div
      className={`animate-slide-up flex items-start gap-3 px-4 py-3 rounded-lg border ${COLORS[toast.type]} backdrop-blur-sm`}
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${toast.type === 'loading' ? 'animate-spin' : ''}`}
      />
      <p className="text-sm text-text flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-text-muted hover:text-text shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
