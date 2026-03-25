// Behavior Analysis Service for Sheddit
// Layer 4: AI-powered behavioral analysis to detect suspicious patterns

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ============================================
// TYPES
// ============================================

export type BehaviorFlagType =
    | 'high_posting_velocity'
    | 'spam_pattern'
    | 'suspicious_follow_pattern'
    | 'copy_paste_content'
    | 'coordinated_activity'
    | 'automated_behavior';

export type BehaviorStatus = 'normal' | 'suspicious' | 'flagged';

export interface BehaviorFlag {
    id?: string;
    userId: string;
    type: BehaviorFlagType;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    resolvedAt?: Date;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

export interface PostingMetrics {
    postsLastHour: number;
    postsLastDay: number;
    averagePostsPerHour: number;
    lastPostTimestamp: Date | null;
    postingVelocity: number; // posts per minute
}

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Posting speed limits
    MAX_POSTS_PER_MINUTE: 10,
    MAX_POSTS_PER_HOUR: 50,
    MAX_POSTS_PER_DAY: 200,

    // Spam detection
    SIMILARITY_THRESHOLD: 0.85,
    MIN_POSTS_FOR_SIMILARITY_CHECK: 5,

    // Follow limits
    MAX_FOLLOWS_PER_HOUR: 50,
    MAX_FOLLOWS_PER_DAY: 200,

    // Profile completion threshold for suspicious checks
    MIN_PROFILE_COMPLETION_FOR_TRUST: 0.3,
};

// ============================================
// POSTING VELOCITY ANALYSIS
// ============================================

/**
 * Analyze posting speed to detect automated spam
 */
export const analyzePostingSpeed = async (userId: string): Promise<{
    isSuspicious: boolean;
    metrics: PostingMetrics;
    flagId?: string;
}> => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get posts from last hour
        const hourQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId),
            where('createdAt', '>=', oneHourAgo)
        );
        const hourSnapshot = await getDocs(hourQuery);

        // Get posts from last day
        const dayQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId),
            where('createdAt', '>=', oneDayAgo)
        );
        const daySnapshot = await getDocs(dayQuery);

        // Get last 10 posts to calculate velocity
        const recentQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const recentDocs = await getDocs(recentQuery);

        const postsLastHour = hourSnapshot.size;
        const postsLastDay = daySnapshot.size;
        const averagePostsPerHour = postsLastDay / 24;

        let postingVelocity = 0;
        let lastPostTimestamp: Date | null = null;

        if (recentDocs.size >= 2) {
            const newestPost = recentDocs.docs[0].data();
            const oldestPost = recentDocs.docs[recentDocs.size - 1].data();

            if (newestPost.createdAt && oldestPost.createdAt) {
                const timeDiff = (newestPost.createdAt.toDate().getTime() - oldestPost.createdAt.toDate().getTime()) / 1000; // seconds
                if (timeDiff > 0) {
                    postingVelocity = (recentDocs.size / timeDiff) * 60; // posts per minute
                }
            }
            lastPostTimestamp = newestPost.createdAt?.toDate() || null;
        }

        const metrics: PostingMetrics = {
            postsLastHour,
            postsLastDay,
            averagePostsPerHour,
            lastPostTimestamp,
            postingVelocity,
        };

        // Check for suspicious activity
        let isSuspicious = false;
        let flagId: string | undefined;

        if (postingVelocity > CONFIG.MAX_POSTS_PER_MINUTE) {
            isSuspicious = true;
            const flag = await createBehaviorFlag(userId, 'high_posting_velocity', {
                reason: `Velocidad de publicación muy alta: ${postingVelocity.toFixed(2)} posts/min`,
                severity: 'high',
                metadata: { velocity: postingVelocity, threshold: CONFIG.MAX_POSTS_PER_MINUTE },
            });
            flagId = flag.id;
        } else if (postsLastHour > CONFIG.MAX_POSTS_PER_HOUR) {
            isSuspicious = true;
            const flag = await createBehaviorFlag(userId, 'high_posting_velocity', {
                reason: `Demasiados posts en la última hora: ${postsLastHour}`,
                severity: 'medium',
                metadata: { postsLastHour, threshold: CONFIG.MAX_POSTS_PER_HOUR },
            });
            flagId = flag.id;
        }

        return { isSuspicious, metrics, flagId };
    } catch (error) {
        console.error('Error analyzing posting speed:', error);
        return {
            isSuspicious: false,
            metrics: {
                postsLastHour: 0,
                postsLastDay: 0,
                averagePostsPerHour: 0,
                lastPostTimestamp: null,
                postingVelocity: 0,
            },
        };
    }
};

// ============================================
// SPAM DETECTION (CONTENT SIMILARITY)
// ============================================

/**
 * Calculate text similarity using Jaccard index (simplified)
 */
const calculateTextSimilarity = (text1: string, text2: string): number => {
    const normalize = (text: string) =>
        text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);

    const set1 = new Set(normalize(text1));
    const set2 = new Set(normalize(text2));

    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
};

/**
 * Analyze content similarity to detect copy-paste spam
 */
export const analyzeSpamPattern = async (userId: string, newContent: string): Promise<{
    isSpam: boolean;
    similarityScore: number;
    flagId?: string;
}> => {
    try {
        // Get recent posts for comparison
        const recentQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        const recentDocs = await getDocs(recentQuery);

        if (recentDocs.size < CONFIG.MIN_POSTS_FOR_SIMILARITY_CHECK) {
            return { isSpam: false, similarityScore: 0 };
        }

        // Compare new content with recent posts
        let highestSimilarity = 0;

        for (const postDoc of recentDocs.docs) {
            const postData = postDoc.data();
            if (postData.content) {
                const similarity = calculateTextSimilarity(newContent, postData.content);
                highestSimilarity = Math.max(highestSimilarity, similarity);
            }
        }

        let isSpam = false;
        let flagId: string | undefined;

        if (highestSimilarity > CONFIG.SIMILARITY_THRESHOLD) {
            isSpam = true;
            const flag = await createBehaviorFlag(userId, 'spam_pattern', {
                reason: `Contenido muy similar a posts anteriores (${(highestSimilarity * 100).toFixed(1)}% coincidencia)`,
                severity: highestSimilarity > 0.95 ? 'high' : 'medium',
                metadata: { similarity: highestSimilarity, threshold: CONFIG.SIMILARITY_THRESHOLD },
            });
            flagId = flag.id;
        }

        return { isSpam, similarityScore: highestSimilarity, flagId };
    } catch (error) {
        console.error('Error analyzing spam pattern:', error);
        return { isSpam: false, similarityScore: 0 };
    }
};

// ============================================
// FOLLOW HEURISTICS
// ============================================

/**
 * Calculate profile completion score (0-1)
 */
const calculateProfileCompletion = (userData: Record<string, unknown>): number => {
    let score = 0;
    let maxScore = 0;

    // Avatar (0.2)
    maxScore += 0.2;
    if (userData.avatar) score += 0.2;

    // Bio (0.2)
    maxScore += 0.2;
    if (userData.bio && (userData.bio as string).length > 10) score += 0.2;

    // Interests (0.2)
    maxScore += 0.2;
    if (userData.interests && (userData.interests as string[]).length > 0) score += 0.2;

    // Liveness verified (0.2)
    maxScore += 0.2;
    if (userData.is_human === true) score += 0.2;

    return maxScore > 0 ? score / maxScore : 0;
};

/**
 * Analyze follow patterns for suspicious activity
 */
export const analyzeFollowHeuristics = async (
    userId: string,
    userData: Record<string, unknown>
): Promise<{
    isSuspicious: boolean;
    flagId?: string;
}> => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get follows in last hour
        const hourQuery = query(
            collection(db, 'follows'),
            where('followerId', '==', userId),
            where('createdAt', '>=', oneHourAgo)
        );
        const hourSnapshot = await getDocs(hourQuery);

        // Get total follows
        const dayQuery = query(
            collection(db, 'follows'),
            where('followerId', '==', userId),
            where('createdAt', '>=', oneDayAgo)
        );
        const daySnapshot = await getDocs(dayQuery);

        const followsLastHour = hourSnapshot.size;
        const followsLastDay = daySnapshot.size;
        const profileScore = calculateProfileCompletion(userData);

        // Check for suspicious pattern: follows many users quickly without completed profile
        let isSuspicious = false;
        let flagId: string | undefined;

        if (followsLastHour > CONFIG.MAX_FOLLOWS_PER_HOUR && profileScore < CONFIG.MIN_PROFILE_COMPLETION_FOR_TRUST) {
            isSuspicious = true;
            const flag = await createBehaviorFlag(userId, 'suspicious_follow_pattern', {
                reason: `Sigue a ${followsLastHour} usuarios/hora sin perfil completado`,
                severity: 'medium',
                metadata: {
                    followsLastHour,
                    threshold: CONFIG.MAX_FOLLOWS_PER_HOUR,
                    profileScore,
                },
            });
            flagId = flag.id;
        } else if (followsLastDay > CONFIG.MAX_FOLLOWS_PER_DAY) {
            isSuspicious = true;
            const flag = await createBehaviorFlag(userId, 'suspicious_follow_pattern', {
                reason: `Demasiados follows en un día: ${followsLastDay}`,
                severity: 'high',
                metadata: { followsLastDay, threshold: CONFIG.MAX_FOLLOWS_PER_DAY },
            });
            flagId = flag.id;
        }

        return { isSuspicious, flagId };
    } catch (error) {
        console.error('Error analyzing follow heuristics:', error);
        return { isSuspicious: false };
    }
};

// ============================================
// BEHAVIOR FLAGS MANAGEMENT
// ============================================

/**
 * Create a behavior flag for suspicious activity
 */
export const createBehaviorFlag = async (
    userId: string,
    type: BehaviorFlagType,
    options: {
        reason: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        metadata?: Record<string, unknown>;
    }
): Promise<BehaviorFlag> => {
    const flag: BehaviorFlag = {
        userId,
        type,
        reason: options.reason,
        severity: options.severity,
        resolved: false,
        metadata: options.metadata,
        createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'behavior_flags'), {
        ...flag,
        createdAt: serverTimestamp(),
    });

    // Update user account status if severity is critical or high
    if (options.severity === 'critical' || options.severity === 'high') {
        await updateDoc(doc(db, 'users', userId), {
            account_status: 'flagged',
            block_reason: type,
        });
    }

    return { ...flag, id: docRef.id };
};

/**
 * Get user's behavior flags
 */
export const getUserBehaviorFlags = async (userId: string): Promise<BehaviorFlag[]> => {
    const q = query(
        collection(db, 'behavior_flags'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as BehaviorFlag));
};

/**
 * Resolve a behavior flag
 */
export const resolveBehaviorFlag = async (flagId: string): Promise<void> => {
    await updateDoc(doc(db, 'behavior_flags', flagId), {
        resolved: true,
        resolvedAt: serverTimestamp(),
    });
};

// ============================================
// COMBINED ANALYSIS
// ============================================

/**
 * Run all behavior analysis checks on a new post
 */
export const analyzeUserBehavior = async (
    userId: string,
    newContent: string,
    userData: Record<string, unknown>
): Promise<{
    shouldBlock: boolean;
    reasons: string[];
    flags: BehaviorFlag[];
}> => {
    const reasons: string[] = [];
    const flags: BehaviorFlag[] = [];

    // Check posting speed
    const speedResult = await analyzePostingSpeed(userId);
    if (speedResult.isSuspicious && speedResult.flagId) {
        reasons.push('Velocidad de publicación sospechosa');
    }

    // Check spam pattern
    const spamResult = await analyzeSpamPattern(userId, newContent);
    if (spamResult.isSpam) {
        reasons.push('Patrón de spam detectado');
    }

    // Check follow heuristics
    const followResult = await analyzeFollowHeuristics(userId, userData);
    if (followResult.isSuspicious) {
        reasons.push('Patrón de follows sospechoso');
    }

    const shouldBlock = reasons.length > 0;

    return { shouldBlock, reasons, flags };
};

export default {
    analyzePostingSpeed,
    analyzeSpamPattern,
    analyzeFollowHeuristics,
    analyzeUserBehavior,
    createBehaviorFlag,
    getUserBehaviorFlags,
    resolveBehaviorFlag,
    CONFIG,
};
