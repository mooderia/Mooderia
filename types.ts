
export type Mood = 'Wonderful' | 'Excited' | 'Happy' | 'Normal' | 'Tired' | 'Angry' | 'Flaming' | null;

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  threshold: number;
}

export interface User {
  displayName: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  followers: string[];
  following: string[];
  friends: string[];
  blockedUsers: string[];
  posts: Post[];
  reposts: Post[];
  moodHistory: { date: string, mood: Mood, score: number }[];
  moodStreak: number;
  lastMoodDate?: string;
  profilePic?: string;
  bannerPic?: string;
  profileColor?: string;
  title?: string;
  likesReceived: number;
  // Mood Pet Stats
  petName: string;
  moodCoins: number;
  petEmoji: string;
  petHunger: number; // 0-100
  petThirst: number; // 0-100
  petRest: number;   // 0-100
  petLevel: number;
  petExp: number;
  petHasBeenChosen: boolean;
  petLastUpdate: number; // timestamp
  petSleepUntil: number | null; // timestamp
  gameCooldowns: Record<string, number>; // gameId -> timestamp of when it can be played again
  // Security / Moderation
  warnings: number;
  isBanned: boolean;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // List of usernames who used this emoji
}

export interface Group {
  id: string;
  name: string;
  photo?: string; // Emoji or dataURL
  members: string[]; // List of usernames
  nicknames: Record<string, string>; // username -> nickname mapping
  owner: string;
  createdAt: number;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string; // For DMs, this is the username. For Groups, this is the groupId.
  text: string;
  timestamp: number;
  read: boolean;
  reactions?: MessageReaction[];
  isGroup?: boolean;
  isSystem?: boolean; // For "X left the group" messages
  recipients?: string[]; // (Deprecated for new logic but kept for compat)
  groupName?: string;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
}

export interface Notification {
  id: string;
  type: 'heart' | 'comment' | 'repost' | 'tier' | 'achievement' | 'follow' | 'comment_heart' | 'reply' | 'reaction' | 'warning';
  fromUser: string;
  recipient: string; 
  postId?: string;
  timestamp: number;
  read: boolean;
  postContentSnippet: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  likes: string[]; // Updated from 'hearts: number' to track who liked it
  comments: Comment[];
  timestamp: number;
  isRepost?: boolean;
  originalAuthor?: string;
  visibility: 'global' | 'circle';
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  hearts: number;
  timestamp: number;
  replies: Comment[];
}

export type Section = 'Home' | 'Mood' | 'Zodiac' | 'CityHall' | 'Profile' | 'Settings' | 'Notifications';

export interface ZodiacInfo {
  name: string;
  dates: string;
  description: string;
  history: string;
  symbol: string;
}
