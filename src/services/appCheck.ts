import {
    initializeAppCheck as initFirebaseAppCheck,
    ReCaptchaEnterpriseProvider,
    CustomProvider
} from '@firebase/app-check';
import { app } from './firebase';

// Firebase App Check Configuration for Sheddit
// This helps prevent bot traffic and ensures only legitimate clients can access Firebase services

// NOTE: In production, replace with your actual reCAPTCHA Enterprise site key
const RECAPTCHA_ENTERPRISE_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'SITE_KEY_RECAPTCHA_ENTERPRISE';

// Initialize App Check with reCAPTCHA Enterprise for web
// This protects Firebase services (Firestore, Auth, etc.) from abusive traffic

export const initializeAppCheck = (): unknown => {
    if (typeof window === 'undefined') {
        console.warn('App Check can only be initialized in browser environment');
        return null;
    }

    try {
        // Create provider with your reCAPTCHA Enterprise site key
        const provider = new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY);

        // Initialize App Check
        const appCheckInstance = initFirebaseAppCheck(app, {
            provider: provider,
            isTokenAutoRefreshEnabled: true, // Automatically refresh tokens in the background
        });

        console.log('🛡️ Sheddit Security: Firebase App Check initialized');
        return appCheckInstance;
    } catch (error) {
        console.error('❌ Failed to initialize App Check:', error);
        // Don't break the app if App Check fails - allow development without it
        return null;
    }
};

// Security status interface for UI display
export interface SecurityStatus {
    appCheckInitialized: boolean;
    isHuman: boolean;
    livenessVerified: boolean;
    accountStatus: 'active' | 'flagged' | 'suspended' | 'temp_blocked';
    blockReason?: string;
    blockExpires?: Date;
}

// Create a debug/testing provider (for development only)
// WARNING: Never use this in production!
export const createDebugProvider = (): CustomProvider | null => {
    if (import.meta.env.DEV && import.meta.env.VITE_USE_DEBUG_APP_CHECK === 'true') {
        const provider = new CustomProvider({
            getToken: async () => {
                return {
                    token: 'debug-token-' + Date.now(),
                    expireTimeMillis: Date.now() + 3600000, // 1 hour
                };
            },
        });
        console.warn('⚠️ Using DEBUG App Check provider - NOT FOR PRODUCTION!');
        return provider;
    }
    return null;
};

// Export for use in main.tsx
export default initializeAppCheck;
