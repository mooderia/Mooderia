import { User, Message } from '../types';

// --- SERVERLESS STORAGE MANAGER ---
export const isCloudEnabled = false;

// CRITICAL: This key handles the data persistence. 
const STORAGE_KEY = 'mooderia_users_v2_stable';
const MAIL_KEY = 'mooderia_mails_v2_stable';
const SESSION_KEY = 'mooderia_active_session'; // NEW: Track active login

const getLocalUsers = (): Record<string, User> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Local database error", e);
    return {};
  }
};

const saveLocalUsers = (users: Record<string, User>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save to local storage (quota might be full)", e);
  }
};

// --- SESSION MANAGEMENT ---

export const getCurrentSessionUser = (): User | null => {
    const activeUsername = localStorage.getItem(SESSION_KEY);
    if (!activeUsername) return null;
    const users = getLocalUsers();
    return users[activeUsername] || null;
};

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const saveSession = (username: string) => {
    localStorage.setItem(SESSION_KEY, username);
};

// Generate a random 6-digit code
const generateCitizenCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- AUTHENTICATION ---

export const loginUser = async (citizenCodeAttempt: string, passwordAttempt: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  await new Promise(r => setTimeout(r, 500)); // Simulate network
  const users = getLocalUsers();
  
  // Find user by code
  const user = Object.values(users).find(u => u.citizenCode === citizenCodeAttempt);

  if (!user) return { success: false, error: "Metropolis ID not found." };

  // @ts-ignore
  if (user.password !== passwordAttempt) return { success: false, error: "Incorrect Access Phrase." };

  // Save Session
  saveSession(user.username);

  return { success: true, user };
};

export const registerUser = async (user: User, password: string): Promise<{ success: boolean; error?: string; citizenCode?: string }> => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network
  const users = getLocalUsers();
  
  if (users[user.username]) return { success: false, error: "Username taken." };

  // Generate unique 6-digit code
  let code = generateCitizenCode();
  // Ensure uniqueness
  while (Object.values(users).some(u => u.citizenCode === code)) {
    code = generateCitizenCode();
  }

  // @ts-ignore
  const newUser = { ...user, citizenCode: code, password, id: crypto.randomUUID() };
  
  users[user.username] = newUser;
  saveLocalUsers(users);

  return { success: true, citizenCode: code };
};

export const syncProfile = async (user: User) => {
  const users = getLocalUsers();
  const existing = users[user.username] || {};
  // Preserve the password which is not in the User type passed around
  // @ts-ignore
  const password = existing.password || user.password; 
  // @ts-ignore
  users[user.username] = { ...user, password };
  saveLocalUsers(users);
};

// --- PASSPORT SYSTEM ---

export const generateTransferCode = (user: User): string => {
    const users = getLocalUsers();
    const fullUserData = users[user.username];
    if(!fullUserData) return '';
    const json = JSON.stringify(fullUserData);
    return btoa(unescape(encodeURIComponent(json)));
};

export const importTransferCode = (code: string): { success: boolean; user?: User; error?: string } => {
    try {
        const json = decodeURIComponent(escape(atob(code)));
        const importedUser = JSON.parse(json) as User;
        if (!importedUser.username) throw new Error("Invalid ID");

        const users = getLocalUsers();
        users[importedUser.username] = importedUser;
        saveLocalUsers(users);

        // Save Session
        saveSession(importedUser.username);

        return { success: true, user: importedUser };
    } catch (e) {
        return { success: false, error: "Invalid Transfer Code." };
    }
};

// --- FRIEND SYSTEM ---

export const sendFriendRequest = async (fromUsername: string, toCitizenCode: string): Promise<{ success: boolean; error?: string }> => {
    const users = getLocalUsers();
    
    const targetUser = Object.values(users).find(u => u.citizenCode === toCitizenCode);
    
    if (!targetUser) return { success: false, error: "Citizen Code not found." };
    if (targetUser.username === fromUsername) return { success: false, error: "Cannot add yourself." };
    if (targetUser.friends?.includes(fromUsername)) return { success: false, error: "Already citizens." };
    if (targetUser.friendRequests?.includes(fromUsername)) return { success: false, error: "Request already sent." };

    targetUser.friendRequests = [...(targetUser.friendRequests || []), fromUsername];
    users[targetUser.username] = targetUser;
    saveLocalUsers(users);
    
    return { success: true };
};

export const respondToFriendRequest = async (username: string, fromUsername: string, accept: boolean): Promise<{ success: boolean }> => {
    const users = getLocalUsers();
    const user = users[username];
    const sender = users[fromUsername];

    if (!user || !sender) return { success: false };

    user.friendRequests = user.friendRequests.filter(r => r !== fromUsername);

    if (accept) {
        user.friends = [...(user.friends || []), fromUsername];
        sender.friends = [...(sender.friends || []), username];
        users[fromUsername] = sender;
        
        // Notify the sender that they were accepted
        await sendMessageCloud('System', fromUsername, `@${username} accepted your citizen link request! You are now friends.`);
    } else {
        // Notify the sender that they were declined
        await sendMessageCloud('System', fromUsername, `@${username} declined your citizen link request.`);
    }

    users[username] = user;
    saveLocalUsers(users);
    return { success: true };
};

// --- MESSAGING ---

export const fetchUserMessages = async (username: string): Promise<Message[]> => {
  const allMails = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
  return allMails.filter((m: any) => m.recipient === username);
};

export const markMessagesAsRead = async (username: string) => {
  const allMails = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
  const updatedMails = allMails.map((m: any) => 
    m.recipient === username ? { ...m, read: true } : m
  );
  localStorage.setItem(MAIL_KEY, JSON.stringify(updatedMails));
};

export const sendMessageCloud = async (sender: string, recipient: string, text: string) => {
  const allMails = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
  const newMail = {
    id: Math.random().toString(36).substr(2, 9),
    sender,
    recipient,
    text,
    timestamp: Date.now(),
    read: false
  };
  localStorage.setItem(MAIL_KEY, JSON.stringify([...allMails, newMail]));
  return true;
};