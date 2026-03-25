import { type Post } from '../data/mockData';

export const sortNew = (posts: Post[]): Post[] => {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const sortTop = (posts: Post[]): Post[] => {
  return [...posts].sort((a, b) => b.likesCount - a.likesCount);
};

export const sortHot = (posts: Post[]): Post[] => {
  const now = Date.now();
  return [...posts].sort((a, b) => {
    const hoursA = Math.max((now - new Date(a.createdAt).getTime()) / 3600000, 0);
    const hoursB = Math.max((now - new Date(b.createdAt).getTime()) / 3600000, 0);
    
    // Reddit Hot formula approximation function
    const scoreA = a.likesCount / Math.pow(hoursA + 2, 1.5);
    const scoreB = b.likesCount / Math.pow(hoursB + 2, 1.5);
    
    return scoreB - scoreA;
  });
};
