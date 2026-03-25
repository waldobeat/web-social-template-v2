export type BadgeType =
  | 'premium' | 'verified' | 'popular' | 'new' | 'rising'
  | 'writer' | 'journalist' | 'celebrity' | 'influencer'
  | 'fashion' | 'foodie' | 'travel' | 'tech' | 'art'
  | 'music' | 'fitness' | 'beauty' | 'mom' | 'entrepreneur';

export interface UserProfile {
  id: string; username: string; avatar: string; bio: string;
  followers: string[]; following: string[];
  joinedCommunityIds: string[];
  age?: string;
  interests?: string[];
  strikes?: number;
  isBanned?: boolean;
  role?: 'admin' | 'user';
  mood?: string;
  isPremium?: boolean;
  badges?: BadgeType[];
  isVerified?: boolean;
  // Security fields (Layer 2: Liveness Detection)
  is_human?: boolean;
  liveness_verified_at?: string;
  onboarding_step?: 'email' | 'selfie' | 'complete';
  // Account status
  account_status?: 'active' | 'flagged' | 'suspended' | 'temp_blocked';
  block_reason?: string;
  block_expires?: string;
  // Security badges
  security_badges?: ('verified_human' | 'trusted_user' | 'new_user')[];
}
export interface Comment {
  id: string; authorId: string; text: string; createdAt: string;
  parentId: string; // can be postId or commentId
}
export interface Post {
  id: string; authorId: string; communityId: string; content: string;
  category: string; likesCount: number; likedBy: string[];
  commentIds: string[]; createdAt: string;
  isHighlighted: boolean;
  repostCount: number;
  repostedBy: string[];
  originalPostId?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'gif' | 'video';
  // Etiquetas
  pendingUserTags?: string[];
  pendingCommunityTags?: string[];
  approvedUserTags?: string[];
  approvedCommunityTags?: string[];
  // Security flags (Layer 4: Behavior Analysis)
  flagged_as_spam?: boolean;
  spam_score?: number;
  status?: 'published' | 'pending_review' | 'rejected';
}
export interface Community {
  id: string; name: string; description: string; memberCount: number;
  botId: string; colorTheme: string;
  ownerId: string;
  memberIds: string[];
  // Moderation types (Layer 3: Hybrid Moderation)
  moderationType?: 'bot' | 'human' | 'hybrid';
  botModeratorId?: string;       // m/AutoMod_c/NombreComunidad
  moderatorIds?: string[];       // UIDs de moderadores humanos
}
export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
}

export interface MessageRequest {
  id: string;
  fromId: string;
  toId: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'alert';
  referenceId?: string; // postId or commentId
  message?: string;
  createdAt: string;
  read: boolean;
}

/** @deprecated Use Firestore 'communities' collection */
export const INITIAL_COMMUNITIES: Record<string, Community> = {};

/** @deprecated Use Firestore 'users' collection */
export const INITIAL_USERS: Record<string, UserProfile> = {};

/** @deprecated Use Firestore 'posts' collection */
export const INITIAL_POSTS: Record<string, Post> = {};

export const INITIAL_COMMENTS: Record<string, Comment> = {};

export const INITIAL_MESSAGES: Record<string, Message[]> = {};
