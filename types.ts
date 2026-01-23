
export type Mood = 'Wonderful' | 'Excited' | 'Happy' | 'Normal' | 'Tired' | 'Angry' | 'Flaming' | null;

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
  petName: string;
  moodCoins: number;
  petEmoji: string;
  petHunger: number;
  petThirst: number;
  petRest: number;
  petLevel: number;
  petExp: number;
  petHasBeenChosen: boolean;
  petLastUpdate: number;
  petSleepUntil: number | null;
  gameCooldowns: Record<string, number>;
  warnings: number;
  isBanned: boolean;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  hearts: number;
  likedBy: string[]; // List of usernames who liked the post
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

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  threshold: number;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: number;
  isGroup?: boolean;
  isSystem?: boolean;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
}

export interface Group {
  id: string;
  name: string;
  owner: string;
  members: string[];
  nicknames: Record<string, string>;
  createdAt: number;
  photo?: string;
}

export interface Notification {
  id: string;
  fromUser: string;
  recipient: string;
  type: 'heart' | 'comment_heart' | 'comment' | 'reply' | 'repost' | 'achievement' | 'follow';
  postId: string;
  timestamp: number;
  read: boolean;
  postContentSnippet: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}
