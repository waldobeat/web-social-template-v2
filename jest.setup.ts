/**
 * Jest Setup File
 * Global setup for all tests
 */
import '@testing-library/jest-dom';

// Mock Firebase for tests
jest.mock('./src/services/firebase', () => ({
    auth: {},
    db: {},
    signInWithGoogle: jest.fn(),
}));

// Mock import.meta.env
Object.defineProperty(window, 'import', {
    value: {
        meta: {
            env: {
                DEV: true,
                VITE_FIREBASE_API_KEY: 'test-key',
            },
        },
    },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Suppress console errors in tests (optional - comment out to see errors)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning:') || args[0].includes('ReactDOM.render'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});