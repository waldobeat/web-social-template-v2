/**
 * Tests for Sanitization Utilities
 */
import {
    sanitizeHtml,
    sanitizeText,
    sanitizeUrl,
    sanitizeMention,
    containsSuspiciousContent,
} from '../../src/utils/sanitize';

describe('sanitizeHtml', () => {
    it('should return empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
        expect(sanitizeHtml(null as any)).toBe('');
        expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should remove script tags', () => {
        const input = '<script>alert("xss")</script>Hello World';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('Hello World');
    });

    it('should allow safe HTML tags', () => {
        const input = '<b>Bold</b> and <i>italic</i>';
        const result = sanitizeHtml(input);
        expect(result).toContain('<b>');
        expect(result).toContain('<i>');
    });

    it('should remove dangerous attributes like onclick', () => {
        const input = '<button onclick="alert(1)">Click me</button>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('onclick');
    });

    it('should handle HTML entities', () => {
        const input = '<script>alert(1)</script>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<script>');
    });
});

describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
        const input = '<script>alert(1)</script>';
        const result = sanitizeText(input);
        expect(result).toContain('<');
        expect(result).not.toContain('<script>');
    });

    it('should return empty string for empty input', () => {
        expect(sanitizeText('')).toBe('');
        expect(sanitizeText(null as any)).toBe('');
    });
});

describe('sanitizeUrl', () => {
    it('should allow valid http URLs', () => {
        const input = 'https://example.com';
        const result = sanitizeUrl(input);
        expect(result).toBe(input);
    });

    it('should allow valid https URLs', () => {
        const input = 'https://google.com/path';
        const result = sanitizeUrl(input);
        expect(result).toBe(input);
    });

    it('should block javascript: protocol', () => {
        const input = 'javascript:alert(1)';
        const result = sanitizeUrl(input);
        expect(result).toBe('');
    });

    it('should block data: protocol', () => {
        const input = 'data:text/html,<script>alert(1)</script>';
        const result = sanitizeUrl(input);
        expect(result).toBe('');
    });

    it('should return empty string for invalid URLs', () => {
        expect(sanitizeUrl('')).toBe('');
        expect(sanitizeUrl('not-a-url')).toBe('');
    });
});

describe('sanitizeMention', () => {
    it('should allow valid usernames', () => {
        expect(sanitizeMention('john_doe')).toBe('john_doe');
        expect(sanitizeMention('u/jane')).toBe('u/jane');
    });

    it('should remove special characters', () => {
        expect(sanitizeMention('user<script>')).toBe('userscript');
        expect(sanitizeMention('user@#$%')).toBe('user');
    });

    it('should limit length to 50 characters', () => {
        const longMention = 'a'.repeat(60);
        const result = sanitizeMention(longMention);
        expect(result.length).toBe(50);
    });
});

describe('containsSuspiciousContent', () => {
    it('should detect script tags', () => {
        const input = '<script>alert(1)</script>';
        expect(containsSuspiciousContent(input)).toBe(true);
    });

    it('should detect javascript: protocol', () => {
        const input = '<a href="javascript:alert(1)">click</a>';
        expect(containsSuspiciousContent(input)).toBe(true);
    });

    it('should detect onClick attributes', () => {
        const input = '<div onclick="alert(1)">click</div>';
        expect(containsSuspiciousContent(input)).toBe(true);
    });

    it('should return false for safe content', () => {
        const input = '<b>Hello</b> and <i>world</i>';
        expect(containsSuspiciousContent(input)).toBe(false);
    });
});