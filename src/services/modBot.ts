// ModBot Service for Sheddit
// Layer 3: Hybrid Moderation System with Community Bot Moderators

import {
    collection,
    addDoc,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ============================================
// TYPES
// ============================================

export type ModerationType = 'bot' | 'human' | 'hybrid';

export interface CommunityModerator {
    id: string;
    username: string;
    isBot: boolean;
    botType?: 'community_moderator' | 'auto_moderator';
    communityRef?: string;
    avatar: string;
}

export interface ModerationAction {
    id?: string;
    postId: string;
    communityId: string;
    moderatorId: string;
    action: 'approved' | 'rejected' | 'flagged' | 'deleted';
    reason?: string;
    timestamp: Date;
}

// ============================================
// MODBOT USERNAME PATTERN
// ============================================

const MODBOT_PREFIX = 'm';
const MODBOT_TYPE = 'AutoMod';
const BOT_AVATAR = '🤖';

// Generate bot username: m/AutoMod_c/CommunityName
export const generateBotUsername = (communityName: string): string => {
    const sanitizedName = communityName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
    return `${MODBOT_PREFIX}/${MODBOT_TYPE}_c/${sanitizedName}`;
};

// ============================================
// CREATE COMMUNITY MODERATOR BOT
// ============================================

/**
 * Create a bot moderator for a community
 * This is called when a community with 'bot' or 'hybrid' moderation is created
 */
export const createCommunityModerator = async (
    communityId: string,
    communityName: string
): Promise<CommunityModerator> => {
    const botUsername = generateBotUsername(communityName);

    // Create bot user in Firestore
    const botData: Omit<CommunityModerator, 'id'> = {
        username: botUsername,
        isBot: true,
        botType: 'community_moderator',
        communityRef: communityId,
        avatar: BOT_AVATAR,
    };

    const docRef = await addDoc(collection(db, 'users'), {
        ...botData,
        createdAt: serverTimestamp(),
        isVerified: true, // Bots are pre-verified
        account_status: 'active',
    });

    // Update community with bot reference
    await updateDoc(doc(db, 'communities', communityId), {
        botModeratorId: botUsername,
    });

    return { id: docRef.id, ...botData };
};

// ============================================
// MODERATION ACTIONS
// ============================================

/**
 * Log a moderation action
 */
export const logModerationAction = async (
    postId: string,
    communityId: string,
    moderatorId: string,
    action: ModerationAction['action'],
    reason?: string
): Promise<void> => {
    await addDoc(collection(db, 'moderation_actions'), {
        postId,
        communityId,
        moderatorId,
        action,
        reason,
        timestamp: serverTimestamp(),
    });
};

// ============================================
// AUTO-MODERATION (BOT)
// ============================================

/**
 * Bot moderation rules based on community settings
 */
export interface ModerationRule {
    id: string;
    communityId: string;
    ruleType: 'keyword' | 'spam' | 'links' | 'images' | 'length';
    action: 'approved' | 'rejected' | 'flagged';  // Must match ModerationAction.action
    value?: string;
    threshold?: number;
    enabled: boolean;
}

/**
 * Get community moderation settings
 */
export const getCommunityModerationSettings = async (
    communityId: string
): Promise<{
    moderationType: ModerationType;
    botModeratorId?: string;
    moderatorIds: string[];
    rules: ModerationRule[];
}> => {
    const communityDoc = await getDoc(doc(db, 'communities', communityId));

    if (!communityDoc.exists()) {
        throw new Error('Community not found');
    }

    const communityData = communityDoc.data();

    // Get custom rules
    const rulesQuery = query(
        collection(db, 'moderation_rules'),
        where('communityId', '==', communityId),
        where('enabled', '==', true)
    );
    const rulesSnapshot = await getDocs(rulesQuery);

    const rules = rulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as ModerationRule));

    return {
        moderationType: communityData.moderationType || 'bot',
        botModeratorId: communityData.botModeratorId,
        moderatorIds: communityData.moderatorIds || [],
        rules,
    };
};

/**
 * Apply bot moderation to a post
 * Returns moderation decision and any flags
 */
export const applyBotModeration = async (
    postId: string,
    communityId: string,
    content: string,
    mediaUrl?: string
): Promise<{
    shouldApprove: boolean;
    shouldFlag: boolean;
    reason?: string;
    action?: ModerationAction['action'];
}> => {
    const settings = await getCommunityModerationSettings(communityId);

    // If no bot moderation, skip
    if (settings.moderationType !== 'bot' && settings.moderationType !== 'hybrid') {
        return { shouldApprove: true, shouldFlag: false };
    }

    const botModeratorId = settings.botModeratorId || 'system';

    // Apply each rule
    for (const rule of settings.rules) {
        switch (rule.ruleType) {
            case 'keyword':
                if (rule.value && content.toLowerCase().includes(rule.value.toLowerCase())) {
                    await logModerationAction(postId, communityId, botModeratorId, rule.action, `Keyword: ${rule.value}`);
                    return {
                        shouldApprove: rule.action === 'approved',
                        shouldFlag: rule.action === 'flagged',
                        reason: `Contenido no permitido: ${rule.value}`,
                        action: rule.action,
                    };
                }
                break;

            case 'links':
                const hasLinks = /https?:\/\/[^\s]+/g.test(content);
                if (hasLinks && rule.threshold) {
                    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
                    if (linkCount > rule.threshold) {
                        await logModerationAction(postId, communityId, botModeratorId, rule.action, 'Demasiados enlaces');
                        return {
                            shouldApprove: rule.action === 'approved',
                            shouldFlag: rule.action === 'flagged',
                            reason: 'Demasiados enlaces en el post',
                            action: rule.action,
                        };
                    }
                }
                break;

            case 'length':
                if (rule.threshold) {
                    if (content.length < rule.threshold) {
                        await logModerationAction(postId, communityId, botModeratorId, rule.action, 'Post muy corto');
                        return {
                            shouldApprove: rule.action === 'approved',
                            shouldFlag: rule.action === 'flagged',
                            reason: 'El post es demasiado corto',
                            action: rule.action,
                        };
                    }
                }
                break;

            case 'images':
                if (rule.value === 'required' && !mediaUrl) {
                    await logModerationAction(postId, communityId, botModeratorId, 'flagged', 'Requiere imagen');
                    return {
                        shouldApprove: false,
                        shouldFlag: true,
                        reason: 'Esta comunidad requiere imágenes',
                        action: 'flagged',
                    };
                }
                break;
        }
    }

    // If no rules triggered, approve
    return { shouldApprove: true, shouldFlag: false };
};

// ============================================
// HUMAN MODERATION
// ============================================

/**
 * Get pending posts for human moderation
 */
export const getPendingModerationPosts = async (
    communityId: string
): Promise<string[]> => {
    const q = query(
        collection(db, 'posts'),
        where('communityId', '==', communityId),
        where('status', '==', 'pending_review'),
        orderBy('createdAt', 'asc'),
        limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
};

/**
 * Submit human moderation decision
 */
export const submitHumanModeration = async (
    postId: string,
    communityId: string,
    moderatorId: string,
    action: 'approved' | 'rejected',
    reason?: string
): Promise<void> => {
    // Log the action
    await logModerationAction(postId, communityId, moderatorId, action, reason);

    // Update post status
    await updateDoc(doc(db, 'posts', postId), {
        status: action === 'approved' ? 'published' : 'rejected',
        moderatedBy: moderatorId,
        moderatedAt: serverTimestamp(),
        moderationReason: reason,
    });
};

// ============================================
// MODERATION NOTIFICATIONS
// ============================================

/**
 * Notify post author about moderation decision
 */
export const notifyModerationDecision = async (
    postId: string,
    authorId: string,
    communityName: string,
    action: 'approved' | 'rejected' | 'flagged',
    reason?: string
): Promise<void> => {
    const notificationMessages: Record<string, string> = {
        approved: `✅ Tu post en c/${communityName} fue aprobado`,
        rejected: `❌ Tu post en c/${communityName} fue rechazado${reason ? `: ${reason}` : ''}`,
        flagged: `⚠️ Tu post en c/${communityName} fue marcado para revisión${reason ? `: ${reason}` : ''}`,
    };

    await addDoc(collection(db, 'notifications'), {
        recipientId: authorId,
        type: 'moderation',
        referenceId: postId,
        message: notificationMessages[action],
        createdAt: serverTimestamp(),
        read: false,
    });
};

export default {
    generateBotUsername,
    createCommunityModerator,
    getCommunityModerationSettings,
    applyBotModeration,
    getPendingModerationPosts,
    submitHumanModeration,
    logModerationAction,
    notifyModerationDecision,
};
