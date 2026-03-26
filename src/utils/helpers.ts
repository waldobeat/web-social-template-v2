/**
 * Utility helper functions for Sheddit
 */

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format relative time (e.g., "hace 5 minutos")
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
};

/**
 * Format number with K/M suffixes
 */
export const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

/**
 * Generate avatar URL from user ID
 */
export const generateAvatarUrl = (userId: string, size: number = 150): string => {
    return `https://i.pravatar.cc/${size}?u=${userId}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate username (alphanumeric, underscores, 3-20 chars)
 */
export const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Sanitize text for display (prevent XSS)
 */
export const sanitizeText = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get random greeting based on time of day
 */
export const getRandomGreeting = (): string => {
    const hour = new Date().getHours();
    const greetings = {
        morning: ['¡Buenos días! ☀️', '¡Buenos días, hermosa! 🌸', '¡Hola, qué tal tu mañana!'],
        afternoon: ['¡Buenas tardes! 🌤️', '¡Hola, qué gusto verte! ✨', '¡Buenas! ¿Cómo va todo?'],
        evening: ['¡Buenas noches! 🌙', '¡Hola, nocturna! 🌟', '¡Qué tal tu día!']
    };

    if (hour < 12) return greetings.morning[Math.floor(Math.random() * greetings.morning.length)];
    if (hour < 18) return greetings.afternoon[Math.floor(Math.random() * greetings.afternoon.length)];
    return greetings.evening[Math.floor(Math.random() * greetings.evening.length)];
};

/**
 * Array shuffle (Fisher-Yates)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
