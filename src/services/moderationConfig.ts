/**
 * Moderation Configuration for SoloChicasWeb
 * Contains all configurable moderation rules
 */

export const MODERATION_CONFIG = {
    // Maximum strikes before ban
    maxStrikes: 3,

    // Strike duration in days (for future implementation of temporary bans)
    strikeDurationDays: 7,

    // Auto-ban after max strikes
    autoBanEnabled: true,

    // Send auto-DM warnings
    autoDMEnabled: true,

    // Minimum content length
    minContentLength: 5,

    // Maximum content length
    maxContentLength: 500,

    // Forbidden words list (Spanish)
    forbiddenWords: [
        // Insults
        'puta', 'mierda', 'polla', 'verga', 'pene', 'zorra', 'idiota',
        'estupido', 'estúpido', 'imbecil', 'bastardo', 'cabrón', 'cabron',
        'coño', 'joder', 'chocho', 'marica', 'maricón', 'follador',
        'pendejo', 'gilipolla', 'capullo', 'subnormal', 'retrasado',

        // Spam indicators
        'spam', 'gratis', 'hazclick', 'haz click', 'click aquí', 'click aqui',
        'gana dinero', 'dinero fácil', 'dinero facil',

        // Hate speech
        'odio', 'te odio', 'muere', 'te mereces',

        // Scam indicators
        'estafa', 'scam', 'bitcoin gratis', 'regalo dinero'
    ],

    // Safe domains for GIFs and images (allowed to be posted)
    safeDomains: [
        'giphy.com',
        'media.giphy.com',
        'tenor.com',
        'media.tenor.com',
        'cdn.discordapp.com',
        'i.imgur.com',
        'imgur.com'
    ],

    // Patterns to detect (regex)
    forbiddenPatterns: [
        // URLs (can be expanded or made configurable)
        /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,

        // Email addresses
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

        // Phone numbers
        /\+?[0-9]{10,15}/g,

        // Excessive caps (more than 50% uppercase)
        /^[A-Z\s]{5,}$/g,

        // Excessive punctuation (spam indicator)
        /[!?]{5,}/g,

        // Repeated characters (spam)
        /(.)\1{4,}/g
    ],

    // Warning messages in Spanish
    warningMessages: {
        forbiddenWord: 'Hemos detectado lenguaje inapropiado en tu mensaje. ⚠️',
        linkDetected: 'Los enlaces externos no están permitidos en Sheddit. 🔗',
        tooShort: 'Tu mensaje es demasiado corto. ¡Cuéntanos más! ✨',
        tooLong: 'Tu mensaje es demasiado largo. ¡Sé más concisa! 📝',
        spamDetected: 'Tu mensaje parece spam y no será publicado. 🚫'
    },

    // Ban message
    banMessage: 'Tu cuenta ha sido suspendida permanentemente por el ModBot debido a múltiples infracciones de las normas de la comunidad. 🌸'
} as const;

export type ModerationResult = {
    isApproved: boolean;
    reason?: string;
    detectedIssues?: string[];
};

/**
 * Check if a URL is from a safe domain
 */
const isSafeUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return MODERATION_CONFIG.safeDomains.some(domain =>
        lowerUrl.includes(domain) || lowerUrl.includes(`https://${domain}`)
    );
};

/**
 * Analyze content for moderation issues
 */
export const analyzeContent = (content: string): ModerationResult => {
    const issues: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check minimum length
    if (content.trim().length < MODERATION_CONFIG.minContentLength) {
        issues.push(MODERATION_CONFIG.warningMessages.tooShort);
    }

    // Check maximum length
    if (content.trim().length > MODERATION_CONFIG.maxContentLength) {
        issues.push(MODERATION_CONFIG.warningMessages.tooLong);
    }

    // Check forbidden words
    for (const word of MODERATION_CONFIG.forbiddenWords) {
        if (lowerContent.includes(word.toLowerCase())) {
            issues.push(`Palabra no permitida: ${word}`);
        }
    }

    // Check URL patterns - but allow safe domains
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const urlMatches = content.match(urlPattern);
    if (urlMatches && urlMatches.length > 0) {
        const hasUnsafeUrls = urlMatches.some(url => !isSafeUrl(url));
        if (hasUnsafeUrls) {
            issues.push(MODERATION_CONFIG.warningMessages.linkDetected);
        }
    }

    // Check other forbidden patterns
    const otherPatterns = MODERATION_CONFIG.forbiddenPatterns.filter(p =>
        !p.toString().includes('https?') && !p.toString().includes('www')
    );

    for (const pattern of otherPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            issues.push('Patrón no permitido detectado');
        }
    }

    if (issues.length > 0) {
        return {
            isApproved: false,
            reason: issues.join(' | '),
            detectedIssues: issues
        };
    }

    return { isApproved: true };
};

/**
 * Get warning message for current strike count
 */
export const getStrikeWarningMessage = (currentStrikes: number): string => {
    const remaining = MODERATION_CONFIG.maxStrikes - currentStrikes;

    if (remaining <= 0) {
        return MODERATION_CONFIG.banMessage;
    }

    return `⚠️ Advertencia: Tienes ${currentStrikes} strike(s). ` +
        `Después de ${MODERATION_CONFIG.maxStrikes} strikes, tu cuenta será suspendida. ` +
        `Te quedan ${remaining} advertencia(s). 🌸`;
};
