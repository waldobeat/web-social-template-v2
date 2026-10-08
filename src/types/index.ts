// Shared TypeScript types for SHEDDIT
// All imports of these types MUST use: import type { ... } from '../types'

export interface ShedditUser {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  photoURL?: string;
  isGuest: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: number;
  
  // Private fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  content: string;
  category: string;
  visibility: 'public' | 'followers';
  timestamp: number;
  likesCount: number;
  commentsCount: number;
  likedByMe?: boolean;
  image?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
}
