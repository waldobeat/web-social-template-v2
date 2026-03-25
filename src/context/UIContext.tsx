/**
 * UI Context - Separate UI state management from AppContext
 * Handles modals, toasts, and other UI state
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
    // UI State
    isCreatePostOpen: boolean;
    setCreatePostOpen: (open: boolean) => void;
    isEditProfileOpen: boolean;
    setEditProfileOpen: (open: boolean) => void;
    isPremiumPassOpen: boolean;
    setPremiumPassOpen: (open: boolean) => void;
    isLivenessOpen: boolean;
    setLivenessOpen: (open: boolean) => void;

    // Toast/notification system
    toasts: Toast[];
    addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    removeToast: (id: string) => void;

    // Loading states
    isGlobalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Sidebar state
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    // Modal states
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [isEditProfileOpen, setEditProfileOpen] = useState(false);
    const [isPremiumPassOpen, setPremiumPassOpen] = useState(false);
    const [isLivenessOpen, setLivenessOpen] = useState(false);

    // Toast system
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = { id, message, type };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Loading state
    const [isGlobalLoading, setGlobalLoading] = useState(false);

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    const value: UIContextType = {
        isCreatePostOpen,
        setCreatePostOpen,
        isEditProfileOpen,
        setEditProfileOpen,
        isPremiumPassOpen,
        setPremiumPassOpen,
        isLivenessOpen,
        setLivenessOpen,
        toasts,
        addToast,
        removeToast,
        isGlobalLoading,
        setGlobalLoading,
        isSidebarOpen,
        toggleSidebar,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export default UIContext;