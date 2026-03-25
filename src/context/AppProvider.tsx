/**
 * Combined App Provider
 * Wraps all context providers together for easy use
 */
import { type ReactNode } from 'react';
import { AuthProvider, DataProvider, UIProvider } from './index';

interface AppProviderProps {
    children: ReactNode;
}

/**
 * Combined provider that wraps Auth, Data, and UI contexts
 * This is the main entry point for all context providers
 */
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <AuthProvider>
            <DataProvider>
                <UIProvider>
                    {children}
                </UIProvider>
            </DataProvider>
        </AuthProvider>
    );
};

export default AppProvider;