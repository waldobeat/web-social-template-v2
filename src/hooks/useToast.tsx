import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const toast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => {
    if (toasts.length === 0) return null;

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return '💡';
        }
    };

    const getStyles = (type: ToastType) => {
        const baseStyles = 'padding: 12px 20px; border-radius: 12px; margin: 8px; display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease; font-family: system-ui, sans-serif; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        switch (type) {
            case 'success': return baseStyles + 'background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white;';
            case 'error': return baseStyles + 'background: linear-gradient(135deg, #f44336 0%, #e53935 100%); color: white;';
            case 'warning': return baseStyles + 'background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%); color: white;';
            case 'info': return baseStyles + 'background: linear-gradient(135deg, #2196F3 0%, #1e88e5 100%); color: white;';
        }
    };

    return (
        <>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={getStyles(toast.type) as any}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span>{getIcon(toast.type)}</span>
                        <span style={{ flex: 1 }}>{toast.message}</span>
                        <button
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};
