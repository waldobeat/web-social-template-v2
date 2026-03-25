import { analyzeContent, getStrikeWarningMessage, MODERATION_CONFIG } from './moderationConfig';

export type ModerationStatus = 'approved' | 'rejected' | 'warning';

export interface ModerationResponse {
  status: ModerationStatus;
  reason?: string;
  strikes?: number;
  isBanned?: boolean;
}

/**
 * ModBot - Moderation Bot for SoloChicasWeb
 * Analyzes content and manages user strikes
 */
export class ModeratorBot {
  private currentStrikes: number = 0;
  private sendAutoDM: (message: string) => Promise<void>;
  private updateUserStrikes: (strikes: number, isBanned: boolean) => Promise<void>;

  constructor(
    currentStrikes: number = 0,
    sendAutoDM: (message: string) => Promise<void>,
    updateUserStrikes: (strikes: number, isBanned: boolean) => Promise<void>
  ) {
    this.currentStrikes = currentStrikes;
    this.sendAutoDM = sendAutoDM;
    this.updateUserStrikes = updateUserStrikes;
  }

  /**
   * Analyze content and apply moderation rules
   */
  async moderateContent(content: string): Promise<ModerationResponse> {
    const result = analyzeContent(content);

    if (result.isApproved) {
      return { status: 'approved' };
    }

    // Increment strikes
    this.currentStrikes++;
    const newStrikes = this.currentStrikes;
    const shouldBan = newStrikes >= MODERATION_CONFIG.maxStrikes && MODERATION_CONFIG.autoBanEnabled;

    // Send auto-DM if enabled
    if (MODERATION_CONFIG.autoDMEnabled) {
      const warningMessage = getStrikeWarningMessage(newStrikes);
      await this.sendAutoDM(warningMessage);
    }

    // Update user strikes in database
    await this.updateUserStrikes(newStrikes, shouldBan);

    if (shouldBan) {
      return {
        status: 'rejected',
        reason: MODERATION_CONFIG.banMessage,
        strikes: newStrikes,
        isBanned: true
      };
    }

    return {
      status: 'warning',
      reason: result.reason,
      strikes: newStrikes
    };
  }

  /**
   * Get current strike count
   */
  getStrikes(): number {
    return this.currentStrikes;
  }

  /**
   * Check if user is banned
   */
  isUserBanned(): boolean {
    return this.currentStrikes >= MODERATION_CONFIG.maxStrikes;
  }
}

/**
 * Create a moderator bot instance for a user
 */
export const createModeratorBot = async (
  currentStrikes: number,
  sendAutoDM: (message: string) => Promise<void>,
  updateUserStrikes: (strikes: number, isBanned: boolean) => Promise<void>
): Promise<ModeratorBot> => {
  return new ModeratorBot(currentStrikes, sendAutoDM, updateUserStrikes);
};

// Legacy function for backward compatibility
export const analyzePostContent = async (content: string): Promise<{ isApproved: boolean; reason?: string }> => {
  const result = analyzeContent(content);
  return {
    isApproved: result.isApproved,
    reason: result.reason
  };
};
