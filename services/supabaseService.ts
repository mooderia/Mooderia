
import { User, Message } from '../types';
import { db } from './firebaseConfig';
import { ref, set, get, update, child, push, onValue, off } from "firebase/database";

// --- HYBRID STORAGE HELPERS ---
const LOCAL_STORAGE_KEY = 'mooderia_local_data';
const SESSION_CODE_KEY = 'mooderia_citizen_code';
const SESSION_PHRASE_KEY = 'mooderia_access_phrase';

/**
 * Normalizes user data because Firebase omits empty arrays.
 */
const normalizeUser = (user: any): User => ({
  ...user,
  moodHistory: user.moodHistory || [],
  diaryEntries: user.diaryEntries || [],
  schedule: user.schedule || [],
  routines: user.routines || [],
  friends: user.friends || [],
  friendRequests: user.friendRequests || [],
  unlockedBackgrounds: user.unlockedBackgrounds || ['default'],
  following: user.following || [],
  followers: user.followers || [],
});

const getLocalData = (): Record<string, User> => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const setLocalData = (citizenCode: string, user: User) => {
  const data = getLocalData();
  data[citizenCode] = user;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

// --- SESSION MANAGEMENT ---

export const getCurrentSessionUser = async (): Promise<User | null> => {
  const savedCode = localStorage.getItem(SESSION_CODE_KEY);
  const savedPhrase = localStorage.getItem(SESSION_PHRASE_KEY);
  
  if (!savedCode || !savedPhrase) return null;

  try {
    const snapshot = await get(child(ref(db), `users/${savedCode}`));
    if (snapshot.exists()) {
      const cloudUser = normalizeUser(snapshot.val());
      if (cloudUser.password === savedPhrase) {
        setLocalData(savedCode, cloudUser);
        return cloudUser;
      }
    }
  } catch (e) {
    console.warn("Global Grid unreachable. Using local cache.");
  }

  const localData = getLocalData();
  const localUser = localData[savedCode];
  if (localUser && localUser.password === savedPhrase) return normalizeUser(localUser);

  return null;
};

export const clearSession = async () => {
  localStorage.removeItem(SESSION_CODE_KEY);
  localStorage.removeItem(SESSION_PHRASE_KEY);
};

// --- AUTHENTICATION ---

export const loginUser = async (citizenCodeAttempt: string, passwordAttempt: string): Promise<{ success: boolean; user?: User; error?: string; isLocal?: boolean }> => {
  try {
    const snapshot = await get(child(ref(db), `users/${citizenCodeAttempt}`));
    if (snapshot.exists()) {
      const cloudUser = normalizeUser(snapshot.val());
      if (cloudUser.password === passwordAttempt) {
        localStorage.setItem(SESSION_CODE_KEY, citizenCodeAttempt);
        localStorage.setItem(SESSION_PHRASE_KEY, passwordAttempt);
        setLocalData(citizenCodeAttempt, cloudUser);
        return { success: true, user: cloudUser, isLocal: false };
      }
      return { success: false, error: "Access Phrase Mismatch." };
    }
  } catch (e: any) {
    console.warn("Cloud connection error during login:", e.message);
  }

  const localData = getLocalData();
  const localUser = localData[citizenCodeAttempt];
  if (localUser && localUser.password === passwordAttempt) {
    localStorage.setItem(SESSION_CODE_KEY, citizenCodeAttempt);
    localStorage.setItem(SESSION_PHRASE_KEY, passwordAttempt);
    return { success: true, user: normalizeUser(localUser), isLocal: true };
  }
  
  return { success: false, error: "Citizen ID not found on Grid." };
};

export const registerUser = async (user: User, password: string): Promise<{ success: boolean; error?: string; citizenCode?: string; isLocal?: boolean }> => {
  try {
    // 1. Check Username Uniqueness if provided
    if (user.username) {
        const usernameRef = child(ref(db), `usernames/${user.username.toLowerCase()}`);
        const usernameSnap = await get(usernameRef);
        if (usernameSnap.exists()) {
            return { success: false, error: "Username already claimed." };
        }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = normalizeUser({ ...user, citizenCode: code, password });

    try {
        const updates: any = {};
        updates[`users/${code}`] = newUser;
        if (user.username) {
            updates[`usernames/${user.username.toLowerCase()}`] = code;
        }

        await update(ref(db), updates);
        setLocalData(code, newUser);
        return { success: true, citizenCode: code, isLocal: false };
    } catch (cloudError: any) {
        if (cloudError.message?.includes('Permission denied')) {
            setLocalData(code, newUser);
            return { success: true, citizenCode: code, isLocal: true };
        }
        throw cloudError;
    }
  } catch (e: any) {
    return { success: false, error: e.message || "Registry Malfunction" };
  }
};

// --- PASSPORT TRANSFER ---

export const generateTransferCode = (user: User): string => {
  const secureData = { code: user.citizenCode, phrase: user.password };
  return btoa(unescape(encodeURIComponent(JSON.stringify(secureData))));
};

export const importTransferCode = async (passportString: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const json = decodeURIComponent(escape(atob(passportString)));
    const data = JSON.parse(json);
    if (!data.code || !data.phrase) throw new Error();
    return await loginUser(data.code, data.phrase);
  } catch (e) {
    return { success: false, error: "Corrupted passport data." };
  }
};

// --- REALTIME SYNC ---

export const syncProfile = async (user: User) => {
  if (!user.citizenCode) return;
  setLocalData(user.citizenCode, user);
  try {
    await update(ref(db, 'users/' + user.citizenCode), user);
  } catch (e) {}
};

export const findCitizenInCloud = async (code: string): Promise<User | null> => {
  try {
    const snapshot = await get(child(ref(db), `users/${code}`));
    return snapshot.exists() ? normalizeUser(snapshot.val()) : null;
  } catch (e) { return null; }
};

export const subscribeToUser = (citizenCode: string, callback: (user: User) => void) => {
  const userRef = ref(db, `users/${citizenCode}`);
  const listener = onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const normalized = normalizeUser(data);
        setLocalData(citizenCode, normalized);
        callback(normalized);
    }
  }, (err) => console.warn("Realtime sync paused."));
  return () => off(userRef, 'value', listener);
};

export const subscribeToMessages = (citizenCode: string, callback: (msgs: Message[]) => void) => {
  const mailRef = ref(db, `mail/${citizenCode}`);
  const listener = onValue(mailRef, (snapshot) => {
    const data = snapshot.val();
    const messages: Message[] = data ? Object.values(data) : [];
    messages.sort((a: any, b: any) => b.timestamp - a.timestamp);
    callback(messages);
  }, (err) => console.warn("Mail sync paused."));
  return () => off(mailRef, 'value', listener);
};

export const sendMessageCloud = async (sender: string, recipient: string, text: string) => {
  try {
      const msgRef = push(ref(db, `mail/${recipient}`));
      const newMsg: Message = { id: msgRef.key as string, sender, recipient, text, timestamp: Date.now(), read: false };
      await set(msgRef, newMsg);
      return true;
  } catch (e) { return false; }
};

export const sendFriendRequest = async (fromCitizenCode: string, toCitizenCode: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const targetRef = ref(db, `users/${toCitizenCode}`);
    const snapshot = await get(targetRef);
    if (!snapshot.exists()) return { success: false, error: "Citizen ID not found on Global Grid." };
    const targetUser = normalizeUser(snapshot.val());
    const currentRequests = targetUser.friendRequests || [];
    if (currentRequests.includes(fromCitizenCode)) return { success: false, error: "Request already pending." };
    if ((targetUser.friends || []).includes(fromCitizenCode)) return { success: false, error: "Already connected." };
    await update(targetRef, { friendRequests: [...currentRequests, fromCitizenCode] });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message?.includes('Permission denied') ? "Cloud Locked: Check Firebase Rules." : "Transmission Error." };
  }
};

export const respondToFriendRequest = async (citizenCode: string, fromCitizenCode: string, accept: boolean): Promise<{ success: boolean }> => {
  try {
    const myRef = ref(db, `users/${citizenCode}`);
    const mySnap = await get(myRef);
    if(!mySnap.exists()) return { success: false };
    const myUser = normalizeUser(mySnap.val());
    const newRequests = (myUser.friendRequests || []).filter((r: string) => r !== fromCitizenCode);
    let myFriends = myUser.friends || [];
    if (accept) {
        if (!myFriends.includes(fromCitizenCode)) myFriends.push(fromCitizenCode);
        const otherRef = ref(db, `users/${fromCitizenCode}`);
        const otherSnap = await get(otherRef);
        if (otherSnap.exists()) {
             const otherUser = normalizeUser(otherSnap.val());
             const otherFriends = otherUser.friends || [];
             if (!otherFriends.includes(citizenCode)) {
                 otherFriends.push(citizenCode);
                 await update(otherRef, { friends: otherFriends });
             }
        }
    }
    await update(myRef, { friendRequests: newRequests, friends: myFriends });
    return { success: true };
  } catch (e) { return { success: false }; }
};

export const markMessagesAsRead = async (citizenCode: string) => {
  try {
    const mailRef = ref(db, `mail/${citizenCode}`);
    const snapshot = await get(mailRef);
    if (!snapshot.exists()) return;
    const updates: any = {};
    snapshot.forEach((child) => { if (!child.val().read) updates[`${child.key}/read`] = true; });
    if (Object.keys(updates).length > 0) update(mailRef, updates);
  } catch(e) {}
};
