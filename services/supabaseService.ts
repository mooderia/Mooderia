import { createClient } from '@supabase/supabase-js';
import { User, Message } from '../types';

const SUPABASE_URL = 'https://hlzvwlaxocjakqkjughb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsenZ3bGF4b2NqYWtxa2p1Z2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTEwMDEsImV4cCI6MjA4NTcyNzAwMX0.SU4XUQIV_Xo3eVOfMi2afPCIy5u6LvKUspADtS8c8EQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to map Supabase profile to our User type
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  citizenCode: profile.citizen_code,
  displayName: profile.display_name,
  username: profile.username,
  email: profile.email || `${profile.username}@mooderia.com`,
  country: profile.country || 'un',
  profilePic: profile.profile_pic,
  profileColor: profile.profile_color,
  title: profile.title || 'Citizen',
  bio: profile.bio,
  moodHistory: profile.mood_history || [],
  diaryEntries: profile.diary_entries || [],
  schedule: profile.schedule || [],
  routines: profile.routines || [],
  moodStreak: profile.mood_streak || 0,
  lastMoodDate: profile.last_mood_date,
  moodCoins: profile.mood_coins || 0,
  petName: profile.pet_name || 'Guardian',
  petEmoji: profile.pet_emoji || '🐱',
  petLevel: profile.pet_level || 1,
  petExp: profile.pet_exp || 0,
  petHasBeenChosen: profile.pet_has_been_chosen || false,
  petBackground: profile.pet_background || 'default',
  unlockedBackgrounds: profile.unlocked_backgrounds || ['default'],
  friends: profile.friends || [],
  friendRequests: profile.friend_requests || [],
  following: profile.following || [],
  followers: profile.followers || [],
  likesReceived: profile.likes_received || 0,
});

// Helper to map User type back to Supabase profile
const mapUserToProfile = (user: User) => ({
  display_name: user.displayName,
  username: user.username,
  citizen_code: user.citizenCode,
  country: user.country,
  profile_pic: user.profilePic,
  profile_color: user.profileColor,
  title: user.title,
  bio: user.bio,
  mood_history: user.moodHistory,
  diary_entries: user.diaryEntries,
  schedule: user.schedule,
  routines: user.routines,
  mood_streak: user.moodStreak,
  last_mood_date: user.lastMoodDate,
  mood_coins: user.moodCoins,
  pet_name: user.petName,
  pet_emoji: user.petEmoji,
  pet_level: user.petLevel,
  pet_exp: user.petExp,
  pet_has_been_chosen: user.petHasBeenChosen,
  pet_background: user.petBackground,
  unlocked_backgrounds: user.unlockedBackgrounds,
  friends: user.friends,
  friend_requests: user.friendRequests,
  following: user.following,
  followers: user.followers,
  likes_received: user.likesReceived,
});

// --- SESSION MANAGEMENT ---

export const getCurrentSessionUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) return null;
  return mapProfileToUser(profile);
};

export const clearSession = async () => {
  await supabase.auth.signOut();
};

// --- AUTHENTICATION ---

export const loginUser = async (citizenCodeAttempt: string, passwordAttempt: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // 1. Find the username associated with this citizen code
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('username, id')
    .eq('citizen_code', citizenCodeAttempt)
    .single();

  if (fetchError || !profile) return { success: false, error: "Metropolis ID not found." };

  // 2. Log in using the mapped email
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: `${profile.username}@mooderia.com`,
    password: passwordAttempt,
  });

  if (authError) return { success: false, error: "Incorrect Access Phrase or system error." };

  // 3. Fetch full profile
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  return { success: true, user: mapProfileToUser(fullProfile) };
};

export const registerUser = async (user: User, password: string): Promise<{ success: boolean; error?: string; citizenCode?: string }> => {
  // 1. Generate Citizen Code (Unique 6-digit)
  const citizenCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Sign up in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `${user.username}@mooderia.com`,
    password: password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) return { success: false, error: "Username already taken in the Grid." };
    return { success: false, error: authError.message };
  }
  if (!authData.user) return { success: false, error: "Authorization sequence failed." };

  // 3. Create profile in DB
  const profileData = {
    id: authData.user.id,
    ...mapUserToProfile({ ...user, citizenCode }),
  };

  const { error: dbError } = await supabase
    .from('profiles')
    .insert([profileData]);

  if (dbError) return { success: false, error: dbError.message };

  return { success: true, citizenCode };
};

export const syncProfile = async (user: User) => {
  if (!user.id) return;
  await supabase
    .from('profiles')
    .update(mapUserToProfile(user))
    .eq('id', user.id);
};

// --- PASSPORT SYSTEM ---

export const generateTransferCode = (user: User): string => {
  const json = JSON.stringify(user);
  return btoa(unescape(encodeURIComponent(json)));
};

export const importTransferCode = async (code: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const json = decodeURIComponent(escape(atob(code)));
    const importedUser = JSON.parse(json) as User;
    return { success: false, error: "Please use your ID and Phrase to log in on this device." };
  } catch (e) {
    return { success: false, error: "Invalid Transfer Code." };
  }
};

// --- FRIEND SYSTEM ---

export const sendFriendRequest = async (fromUsername: string, toCitizenCode: string): Promise<{ success: boolean; error?: string }> => {
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('username, friend_requests')
    .eq('citizen_code', toCitizenCode)
    .single();

  if (error || !targetProfile) return { success: false, error: "Citizen not found." };
  
  const currentRequests = targetProfile.friend_requests || [];
  if (currentRequests.includes(fromUsername)) return { success: false, error: "Request already pending." };

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ friend_requests: [...currentRequests, fromUsername] })
    .eq('username', targetProfile.username);

  if (updateError) return { success: false, error: "Failed to transmit." };
  return { success: true };
};

export const respondToFriendRequest = async (username: string, fromUsername: string, accept: boolean): Promise<{ success: boolean }> => {
  const { data: myProfile } = await supabase.from('profiles').select('*').eq('username', username).single();
  const { data: otherProfile } = await supabase.from('profiles').select('*').eq('username', fromUsername).single();

  if (!myProfile || !otherProfile) return { success: false };

  const newMyRequests = (myProfile.friend_requests || []).filter((r: string) => r !== fromUsername);
  const myUpdates: any = { friend_requests: newMyRequests };
  const otherUpdates: any = {};

  if (accept) {
    myUpdates.friends = Array.from(new Set([...(myProfile.friends || []), fromUsername]));
    otherUpdates.friends = Array.from(new Set([...(otherProfile.friends || []), username]));
    
    await supabase.from('profiles').update(otherUpdates).eq('username', fromUsername);
    await sendMessageCloud('System', fromUsername, `@${username} accepted your citizen link request!`);
  }

  await supabase.from('profiles').update(myUpdates).eq('username', username);
  return { success: true };
};

// --- MESSAGING ---

export const fetchUserMessages = async (username: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient', username)
    .order('timestamp', { ascending: false });

  if (error) return [];
  return data.map(m => ({
    id: m.id,
    sender: m.sender,
    recipient: m.recipient,
    text: m.text,
    timestamp: new Date(m.timestamp).getTime(),
    read: m.read
  }));
};

export const markMessagesAsRead = async (username: string) => {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('recipient', username);
};

export const sendMessageCloud = async (sender: string, recipient: string, text: string) => {
  const { error } = await supabase
    .from('messages')
    .insert([{
      sender,
      recipient,
      text,
      timestamp: new Date().toISOString(),
      read: false
    }]);

  return !error;
};