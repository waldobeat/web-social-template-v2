/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing user-generated HTML content
 */
import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify
 * Strict sanitization to prevent XSS attacks
 */
const PURIFY_CONFIG = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string from user input
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (html: string): string => {
    if (!html || typeof html !== 'string') {
        return '';
    }

    // First decode any HTML entities that might be used to bypass sanitization
    const decoded = html
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/&/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/'/g, "'");

    // Then sanitize the content - cast to string to fix TypeScript issue
    return DOMPurify.sanitize(decoded, PURIFY_CONFIG) as string;
};

/**
 * Sanitize text content (non-HTML)
 * Converts to plain text and escapes HTML entities
 * @param text - Raw text that might contain HTML
 * @returns Plain text safe for display
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Create a temporary DOM element to escape HTML
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Sanitize URL to ensure it's safe
 * @param url - Raw URL string
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') {
        return '';
    }

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }

        // Block dangerous protocols
        const dangerous = ['javascript:', 'data:', 'vbscript:'];
        if (dangerous.some(d => url.toLowerCase().startsWith(d))) {
            return '';
        }

        return url;
    } catch {
        return '';
    }
};

/**
 * Sanitize user mention (@username)
 * @param mention - Raw mention string
 * @returns Sanitized mention
 */
export const sanitizeMention = (mention: string): string => {
    if (!mention || typeof mention !== 'string') {
        return '';
    }

    // Only allow alphanumeric, underscores, and @/u/ prefixes
    return mention.replace(/[^a-zA-Z0-9_@/]/g, '').slice(0, 50);
};

/**
 * Check if content contains potentially dangerous patterns
 * @param content - Content to check
 * @returns True if suspicious patterns found
 */
export const containsSuspiciousContent = (content: string): boolean => {
    if (!content || typeof content !== 'string') {
        return false;
    }

    const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:\s*text\/html/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
};

export default {
    sanitizeHtml,
    sanitizeText,
    sanitizeUrl,
    sanitizeMention,
    containsSuspiciousContent,
};