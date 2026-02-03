
export type Mood = 'Wonderful' | 'Excited' | 'Happy' | 'Normal' | 'Tired' | 'Angry' | 'Flaming' | null;

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  timestamp: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  period: 'AM' | 'PM';
  timestamp: number;
  alerted: boolean;
}

export interface RoutineItem {
  id: string;
  title: string;
  icon: string;
  days: number[]; // 0-6 (Sun-Sat)
  startTime: string; // HH:mm
  startPeriod: 'AM' | 'PM';
  endTime: string; // HH:mm
  endPeriod: 'AM' | 'PM';
  durationMinutes: number;
  completedDates: string[]; // YYYY-MM-DD
}

export interface User {
  id?: string;
  citizenCode: string; // 6-digit unique code
  displayName: string;
  username: string;
  email: string;
  country: string; // Added Country
  profilePic?: string;
  profileColor?: string;
  title?: string;
  bio?: string;
  moodHistory: { date: string, mood: Mood, score: number }[];
  diaryEntries: DiaryEntry[];
  schedule: ScheduleItem[];
  routines: RoutineItem[]; 
  moodStreak: number;
  lastMoodDate?: string;
  moodCoins: number;
  
  // Mood Pet Reworked
  petName: string;
  petEmoji: string;
  petLevel: number;
  petExp: number;
  petHasBeenChosen: boolean;
  petBackground: string; 
  unlockedBackgrounds: string[]; 
  
  // Social
  friends: string[]; // List of usernames or IDs
  friendRequests: string[]; // List of incoming usernames/IDs
  following: string[];
  followers: string[];
  likesReceived: number;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'mail' | 'schedule' | 'routine' | 'system' | 'heart' | 'comment_heart' | 'comment' | 'reply' | 'repost' | 'achievement' | 'follow' | 'friend_request' | 'friend_accepted';
  title: string;
  text: string;
  timestamp: number;
  read: boolean;
  fromUser?: string;
  postContentSnippet?: string;
  actionId?: string; // For handling accepts
}

export type Section = 'Home' | 'Mood' | 'CityHall' | 'Mails' | 'Profile' | 'Settings';