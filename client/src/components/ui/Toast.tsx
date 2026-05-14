import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full transition-all duration-300",
                            toast.type === 'success' && "bg-white dark:bg-dark-surface border-green-200 dark:border-green-900 border-l-4 border-l-green-500",
                            toast.type === 'error' && "bg-white dark:bg-dark-surface border-red-200 dark:border-red-900 border-l-4 border-l-red-500",
                            toast.type === 'warning' && "bg-white dark:bg-dark-surface border-yellow-200 dark:border-yellow-900 border-l-4 border-l-yellow-500",
                            toast.type === 'info' && "bg-white dark:bg-dark-surface border-blue-200 dark:border-blue-900 border-l-4 border-l-blue-500"
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">
                            {toast.message}
                        </p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
