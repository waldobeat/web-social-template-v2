/**
 * Tests for Helper Utilities
 */
import {
    truncateText,
    formatRelativeTime,
    formatNumber,
    isValidEmail,
    isValidUsername,
    capitalize,
    getRandomGreeting,
    shuffleArray,
} from '../../src/utils/helpers';

describe('truncateText', () => {
    it('should return original text if shorter than maxLength', () => {
        expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate text and add ellipsis', () => {
        expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('should handle exact length', () => {
        expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('should handle empty string', () => {
        expect(truncateText('', 10)).toBe('');
    });
});

describe('formatRelativeTime', () => {
    it('should return "ahora" for very recent times', () => {
        const now = new Date().toISOString();
        expect(formatRelativeTime(now)).toBe('ahora');
    });

    it('should return minutes for times within an hour', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        expect(formatRelativeTime(fiveMinutesAgo)).toBe('hace 5 min');
    });

    it('should return hours for times within a day', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(twoHoursAgo)).toBe('hace 2h');
    });

    it('should return days for times within a week', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(threeDaysAgo)).toBe('hace 3d');
    });
});

describe('formatNumber', () => {
    it('should format numbers less than 1000', () => {
        expect(formatNumber(100)).toBe('100');
        expect(formatNumber(999)).toBe('999');
    });

    it('should format thousands with K', () => {
        expect(formatNumber(1000)).toBe('1.0K');
        expect(formatNumber(1500)).toBe('1.5K');
        expect(formatNumber(10000)).toBe('10.0K');
    });

    it('should format millions with M', () => {
        expect(formatNumber(1000000)).toBe('1.0M');
        expect(formatNumber(2500000)).toBe('2.5M');
    });
});

describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@domain')).toBe(false);
    });
});

describe('isValidUsername', () => {
    it('should return true for valid usernames', () => {
        expect(isValidUsername('john')).toBe(true);
        expect(isValidUsername('john_doe')).toBe(true);
        expect(isValidUsername('user123')).toBe(true);
    });

    it('should return false for invalid usernames', () => {
        expect(isValidUsername('ab')).toBe(false); // too short
        expect(isValidUsername('ab')).toBe(false);
        expect(isValidUsername('ab')).toBe(false);
        expect(isValidUsername('user-name')).toBe(false); // hyphen not allowed
    });
});

describe('capitalize', () => {
    it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('world')).toBe('World');
    });

    it('should handle single character', () => {
        expect(capitalize('a')).toBe('A');
    });

    it('should handle empty string', () => {
        expect(capitalize('')).toBe('');
    });
});

describe('getRandomGreeting', () => {
    it('should return a greeting string', () => {
        const greeting = getRandomGreeting();
        expect(typeof greeting).toBe('string');
        expect(greeting.length).toBeGreaterThan(0);
    });
});

describe('shuffleArray', () => {
    it('should return an array with same length', () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled = shuffleArray(arr);
        expect(shuffled.length).toBe(arr.length);
    });

    it('should contain all original elements', () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled = shuffleArray(arr);
        expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should not modify original array', () => {
        const arr = [1, 2, 3, 4, 5];
        const original = [...arr];
        shuffleArray(arr);
        expect(arr).toEqual(original);
    });
});