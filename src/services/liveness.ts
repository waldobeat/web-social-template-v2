// Liveness Detection Service for Sheddit
// Provides anti-bot verification through gesture challenges

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

// Possible liveness challenges (gestures/commands)
export type LivenessChallenge =
    | 'toca_tu_nariz'    // Touch your nose
    | 'sonrie'           // Smile
    | 'parpadea'         // Blink
    | 'gira_cabeza'      // Turn head
    | 'levanta_mano_izquierda'  // Raise left hand
    | 'levanta_mano_derecha'    // Raise right hand
    | 'abre_boca'        // Open mouth
    | 'mira_a_la_izquierda'     // Look left
    | 'mira_a_la_derecha';      // Look right

// Challenge status
export type ChallengeStatus = 'pending' | 'completed' | 'failed' | 'expired';

// Interface for liveness challenge document
export interface LivenessChallengeData {
    id?: string;
    userId: string;
    challenge: LivenessChallenge;
    status: ChallengeStatus;
    imageUrl?: string;        // Base64 or storage URL
    verifiedAt?: Date;
    createdAt: Date;
    expiresAt: Date;
    ipAddress?: string;
    deviceInfo?: string;
}

// Interface for verification result
export interface LivenessResult {
    success: boolean;
    challengeId?: string;
    message: string;
    retryAllowed: boolean;
}

// Challenge instructions (human-readable)
export const CHALLENGE_INSTRUCTIONS: Record<LivenessChallenge, string> = {
    'toca_tu_nariz': '👃 Toca tu nariz con el dedo',
    'sonrie': '😊 Sonríe a la cámara',
    'parpadea': '👀 Parpadea lentamente',
    'gira_cabeza': '↔️ Gira la cabeza a ambos lados',
    'levanta_mano_izquierda': '✋ Levanta la mano izquierda',
    'levanta_mano_derecha': '✋ Levanta la mano derecha',
    'abre_boca': '👄 Abre la boca ligeramente',
    'mira_a_la_izquierda': '👀 Mira hacia la izquierda',
    'mira_a_la_derecha': '👀 Mira hacia la derecha',
};

// Challenge expiration time (5 minutes)
const CHALLENGE_EXPIRY_MINUTES = 5;

// Generate a random challenge
export const generateRandomChallenge = (): LivenessChallenge => {
    const challenges: LivenessChallenge[] = [
        'toca_tu_nariz',
        'sonrie',
        'parpadea',
        'gira_cabeza',
        'levanta_mano_izquierda',
        'levanta_mano_derecha',
        'abre_boca',
        'mira_a_la_izquierda',
        'mira_a_la_derecha',
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
};

// Create a new liveness challenge for a user
export const createLivenessChallenge = async (): Promise<LivenessChallengeData> => {
    if (!auth.currentUser) {
        throw new Error('User must be authenticated to create liveness challenge');
    }

    const challenge = generateRandomChallenge();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CHALLENGE_EXPIRY_MINUTES * 60 * 1000);

    const challengeData: LivenessChallengeData = {
        userId: auth.currentUser.uid,
        challenge,
        status: 'pending',
        createdAt: now,
        expiresAt,
    };

    const docRef = await addDoc(collection(db, 'liveness_challenges'), {
        ...challengeData,
        createdAt: serverTimestamp(),
        expiresAt: serverTimestamp(),
    });

    return { ...challengeData, id: docRef.id };
};

// Verify a liveness challenge response
// In production, this would use Vertex AI or similar for gesture validation
export const verifyLivenessChallenge = async (
    challengeId: string,
    imageBase64: string
): Promise<LivenessResult> => {
    if (!auth.currentUser) {
        return {
            success: false,
            message: 'Debes estar autenticado para verificar',
            retryAllowed: true,
        };
    }

    try {
        // Get the challenge document
        const challengeDoc = await getDoc(doc(db, 'liveness_challenges', challengeId));

        if (!challengeDoc.exists()) {
            return {
                success: false,
                message: 'Desafío no encontrado',
                retryAllowed: false,
            };
        }

        const challengeData = challengeDoc.data() as LivenessChallengeData;

        // Check if challenge belongs to current user
        if (challengeData.userId !== auth.currentUser.uid) {
            return {
                success: false,
                message: 'Desafío no válido',
                retryAllowed: false,
            };
        }

        // Check if challenge is expired
        if (challengeData.status === 'expired' || new Date() > challengeData.expiresAt) {
            return {
                success: false,
                message: 'El desafío ha expirado. Por favor intenta de nuevo.',
                retryAllowed: true,
            };
        }

        // Check if challenge is already completed
        if (challengeData.status === 'completed') {
            return {
                success: false,
                message: 'Este desafío ya fue completado',
                retryAllowed: false,
            };
        }

        // ================================================
        // AI VERIFICATION (Placeholder - requires Vertex AI)
        // ================================================
        // In production, you would:
        // 1. Send the image to Vertex AI Vision API
        // 2. Analyze the gesture against the challenge
        // 3. Return verification result

        // For now, we'll simulate a successful verification
        // In real implementation:
        // const isValidGesture = await validateGestureWithAI(imageBase64, challengeData.challenge);
        const isValidGesture = true; // SIMULATION - Replace with actual AI validation

        if (isValidGesture) {
            // Update challenge status
            await updateDoc(challengeDoc.ref, {
                status: 'completed',
                verifiedAt: serverTimestamp(),
                imageUrl: imageBase64.substring(0, 100) + '...', // Store truncated for privacy
            });

            return {
                success: true,
                challengeId,
                message: '✅ Verificación completada exitosamente',
                retryAllowed: false,
            };
        } else {
            // Mark as failed
            await updateDoc(challengeDoc.ref, {
                status: 'failed',
            });

            return {
                success: false,
                message: '❌ No pudimos verificar el gesto. Intenta de nuevo.',
                retryAllowed: true,
            };
        }
    } catch (error) {
        console.error('Liveness verification error:', error);
        return {
            success: false,
            message: 'Error al verificar. Intenta de nuevo.',
            retryAllowed: true,
        };
    }
};

// Get user's recent liveness challenges
export const getUserLivenessHistory = async (): Promise<LivenessChallengeData[]> => {
    if (!auth.currentUser) return [];

    const q = query(
        collection(db, 'liveness_challenges'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as LivenessChallengeData));
};

// Check if user has completed liveness verification
export const checkUserLivenessStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;

    const q = query(
        collection(db, 'liveness_challenges'),
        where('userId', '==', auth.currentUser.uid),
        where('status', '==', 'completed'),
        orderBy('verifiedAt', 'desc'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

// Placeholder function for AI gesture validation
// In production, integrate with Vertex AI or similar service
async function validateGestureWithAI(imageBase64: string, challenge: LivenessChallenge): Promise<boolean> {
    // This would be implemented with Google Cloud Vision API or Vertex AI
    // For now, return true to allow development
    console.log('🤖 AI Gesture Validation:', { challenge, imageLength: imageBase64.length });
    return true;
}

export default {
    createLivenessChallenge,
    verifyLivenessChallenge,
    getUserLivenessHistory,
    checkUserLivenessStatus,
    CHALLENGE_INSTRUCTIONS,
    generateRandomChallenge,
};
