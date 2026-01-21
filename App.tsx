
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mood, Section, Post, Comment, Message, Notification, MessageReaction } from './types';
import Sidebar from './components/Sidebar';
import MoodCheckIn from './components/MoodCheckIn';
import HomeSection from './sections/HomeSection';
import MoodSection from './sections/MoodSection';
import ZodiacSection from './sections/ZodiacSection';
import CityHallSection from './sections/CityHallSection';
import ProfileSection from './sections/ProfileSection';
import SettingsSection from './sections/SettingsSection';
import NotificationsSection from './sections/NotificationsSection';
import AuthScreen from './sections/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import { getExpNeeded, MOOD_SCORES } from './constants';
import { Trophy, Share2, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Home');
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [isAppStarting, setIsAppStarting] = useState(true);
  const [globalUpdateToggle, setGlobalUpdateToggle] = useState(0);
  
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const profileToView = useMemo(() => {
    if (!viewingUsername) return null;
    if (currentUser && viewingUsername === currentUser.username) return currentUser;
    const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
    return allUsers.find(u => u.username === viewingUsername) || null;
  }, [viewingUsername, currentUser, globalUpdateToggle]);

  const addNotification = useCallback((recipient: string, type: Notification['type'], snippet: string, postId: string = '') => {
    if (!currentUser || recipient === currentUser.username) {
      if (type !== 'achievement' && type !== 'tier') return;
    }
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      fromUser: currentUser?.username || 'Metropolis',
      recipient,
      type,
      postId,
      timestamp: Date.now(),
      read: false,
      postContentSnippet: snippet
    };
    setNotifications(prev => [...prev, newNotif]);
  }, [currentUser]);

  useEffect(() => {
    const savedUser = localStorage.getItem('mooderia_user');
    const savedPosts = localStorage.getItem('mooderia_posts') || '[]';
    const savedMessages = localStorage.getItem('mooderia_messages') || '[]';
    const savedNotifications = localStorage.getItem('mooderia_notifications') || '[]';
    const savedTheme = localStorage.getItem('mooderia_theme');
    
    if (savedUser) {
      const user: User = JSON.parse(savedUser);
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - (user.petLastUpdate || now)) / 60000);
      if (elapsedMinutes > 0) {
        user.petHunger = Math.max(0, user.petHunger - elapsedMinutes * 0.15);
        user.petThirst = Math.max(0, user.petThirst - elapsedMinutes * 0.2);
        if (!user.petSleepUntil || user.petSleepUntil < now) {
          user.petRest = Math.max(0, user.petRest - elapsedMinutes * 0.1);
        }
        user.petLastUpdate = now;
      }
      setCurrentUser(user);
    }

    setAllPosts(JSON.parse(savedPosts));
    setAllMessages(JSON.parse(savedMessages));
    setNotifications(JSON.parse(savedNotifications));
    if (savedTheme === 'dark') setIsDarkMode(true);
    setIsLoaded(true);

    const timer = setTimeout(() => setIsAppStarting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAppStarting && currentUser) {
      const todayStr = new Date().toDateString();
      if (currentUser.lastMoodDate !== todayStr) {
        setIsMoodModalOpen(true);
      }
    }
  }, [isAppStarting, currentUser?.username, currentUser?.lastMoodDate]);

  // Master Sync Effect: Persist all state changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    if (currentUser) {
      localStorage.setItem('mooderia_user', JSON.stringify(currentUser));
      const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
      const idx = allUsers.findIndex(u => u.username === currentUser.username);
      if (idx > -1) {
        allUsers[idx] = currentUser;
        localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
      }
    }
    localStorage.setItem('mooderia_posts', JSON.stringify(allPosts));
    localStorage.setItem('mooderia_messages', JSON.stringify(allMessages));
    localStorage.setItem('mooderia_notifications', JSON.stringify(notifications));
    localStorage.setItem('mooderia_theme', isDarkMode ? 'dark' : 'light');
  }, [currentUser, allPosts, allMessages, notifications, isDarkMode, isLoaded]);

  const handleFollow = (targetUsername: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following.includes(targetUsername);
    const updatedFollowing = isFollowing ? currentUser.following.filter(u => u !== targetUsername) : [...currentUser.following, targetUsername];
    setCurrentUser({ ...currentUser, following: updatedFollowing });
    const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
    const targetIdx = allUsers.findIndex(u => u.username === targetUsername);
    if (targetIdx > -1) {
      const targetUser = { ...allUsers[targetIdx] };
      targetUser.followers = isFollowing ? targetUser.followers.filter(u => u !== currentUser.username) : [...targetUser.followers, currentUser.username];
      allUsers[targetIdx] = targetUser;
      localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
      if (!isFollowing) addNotification(targetUsername, 'follow', 'started following you!');
    }
    setGlobalUpdateToggle(t => t + 1);
  };

  const handleHeart = (postId: string) => {
    if (!currentUser) return;
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (p.author !== currentUser.username) addNotification(p.author, 'heart', 'liked your expression', p.id);
        return { ...p, hearts: p.hearts + 1 };
      }
      return p;
    }));
  };

  const handleCommentInteraction = (postId: string, commentId: string, action: 'heart' | 'reply', replyText?: string) => {
    if (!currentUser) return;
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updateNested = (list: Comment[]): Comment[] => {
          return list.map(c => {
            if (c.id === commentId) {
              if (action === 'heart') {
                if (c.author !== currentUser.username) addNotification(c.author, 'comment_heart', 'liked your frequency', postId);
                return { ...c, hearts: c.hearts + 1 };
              }
              if (action === 'reply' && replyText) {
                const newRep: Comment = {
                  id: Math.random().toString(36).substr(2, 9),
                  author: currentUser.username,
                  text: replyText,
                  hearts: 0,
                  timestamp: Date.now(),
                  replies: []
                };
                if (c.author !== currentUser.username) addNotification(c.author, 'reply', 'responded to your frequency', postId);
                return { ...c, replies: [...c.replies, newRep] };
              }
            }
            if (c.replies.length > 0) return { ...c, replies: updateNested(c.replies) };
            return c;
          });
        };
        return { ...p, comments: updateNested(p.comments) };
      }
      return p;
    }));
  };

  const handleRepost = (p: Post) => {
    if (!currentUser) return;
    const newRepost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.username,
      content: p.content,
      hearts: 0,
      comments: [],
      timestamp: Date.now(),
      isRepost: true,
      originalAuthor: p.author,
      visibility: 'global'
    };
    setAllPosts(prev => [newRepost, ...prev]);
    if (p.author !== currentUser.username) addNotification(p.author, 'repost', 'echoed your transmission', p.id);
  };

  const handleBlock = (targetUsername: string) => {
    if (!currentUser) return;
    const updatedFollowing = currentUser.following.filter(u => u !== targetUsername);
    const updatedBlocked = [...currentUser.blockedUsers, targetUsername];
    setCurrentUser({ ...currentUser, following: updatedFollowing, blockedUsers: updatedBlocked });
    const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
    const targetIdx = allUsers.findIndex(u => u.username === targetUsername);
    if (targetIdx > -1) {
      const targetUser = { ...allUsers[targetIdx] };
      targetUser.followers = targetUser.followers.filter(u => u !== currentUser.username);
      targetUser.following = targetUser.following.filter(u => u !== currentUser.username);
      allUsers[targetIdx] = targetUser;
      const currentIdxGlobal = allUsers.findIndex(u => u.username === currentUser.username);
      if (currentIdxGlobal > -1) allUsers[currentIdxGlobal].followers = allUsers[currentIdxGlobal].followers.filter(u => u !== targetUsername);
      localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
    }
    setViewingUsername(currentUser.username);
    setActiveSection('Home');
    setGlobalUpdateToggle(t => t + 1);
  };

  const updatePetStats = (hunger: number, thirst: number, rest: number, coins: number, exp: number = 0, sleepUntil: number | null = null, newEmoji?: string, markChosen?: boolean, newName?: string, gameCooldownId?: string) => {
    if (!currentUser) return;
    let newLevel = currentUser.petLevel;
    let newExp = currentUser.petExp + exp;
    let leveledUp = false;
    while (newExp >= getExpNeeded(newLevel)) { newExp -= getExpNeeded(newLevel); newLevel += 1; leveledUp = true; }
    if (leveledUp) addNotification(currentUser.username, 'achievement', `Your Guardian ${newName || currentUser.petName} reached Level ${newLevel}!`);
    setCurrentUser({
      ...currentUser,
      petName: newName || currentUser.petName,
      petHunger: Math.min(100, Math.max(0, currentUser.petHunger + hunger)),
      petThirst: Math.min(100, Math.max(0, currentUser.petThirst + thirst)),
      petRest: Math.min(100, Math.max(0, currentUser.petRest + rest)),
      petExp: newExp,
      petLevel: newLevel,
      moodCoins: currentUser.moodCoins + coins,
      petSleepUntil: sleepUntil !== undefined ? sleepUntil : currentUser.petSleepUntil,
      petEmoji: newEmoji || currentUser.petEmoji,
      petHasBeenChosen: markChosen !== undefined ? markChosen : currentUser.petHasBeenChosen,
      petLastUpdate: Date.now(),
      gameCooldowns: gameCooldownId ? { ...currentUser.gameCooldowns, [gameCooldownId]: Date.now() + 60000 } : currentUser.gameCooldowns
    });
  };

  const handleMessageReaction = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    setAllMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        let reactions = [...(m.reactions || [])];
        const existingReaction = reactions.find(r => r.users.includes(currentUser.username));
        if (existingReaction) {
          if (existingReaction.emoji === emoji) {
            existingReaction.users = existingReaction.users.filter(u => u !== currentUser.username);
            if (existingReaction.users.length === 0) reactions = reactions.filter(r => r.emoji !== emoji);
          } else {
            existingReaction.users = existingReaction.users.filter(u => u !== currentUser.username);
            if (existingReaction.users.length === 0) reactions = reactions.filter(r => r.emoji !== existingReaction.emoji);
            const targetReaction = reactions.find(r => r.emoji === emoji);
            if (targetReaction) targetReaction.users.push(currentUser.username);
            else reactions.push({ emoji, users: [currentUser.username] });
            if (m.sender !== currentUser.username) addNotification(m.sender, 'reaction', emoji, msgId);
          }
        } else {
          const targetReaction = reactions.find(r => r.emoji === emoji);
          if (targetReaction) targetReaction.users.push(currentUser.username);
          else reactions.push({ emoji, users: [currentUser.username] });
          if (m.sender !== currentUser.username) addNotification(m.sender, 'reaction', emoji, msgId);
        }
        return { ...m, reactions };
      }
      return m;
    }));
  };

  const onLogin = (user: User) => {
    setCurrentUser(user);
    setActiveSection('Home');
    setViewingUsername(user.username);
  };

  const handleSendMessage = (recipient: string, text: string, options?: { isGroup?: boolean, recipients?: string[], groupName?: string, replyToId?: string, replyToText?: string, replyToSender?: string }) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: currentUser.username,
      recipient,
      text,
      timestamp: Date.now(),
      read: false,
      isGroup: options?.isGroup,
      recipients: options?.recipients,
      groupName: options?.groupName,
      replyToId: options?.replyToId,
      replyToText: options?.replyToText,
      replyToSender: options?.replyToSender
    };
    setAllMessages(prev => [...prev, newMsg]);
  };

  if (isAppStarting) return <LoadingScreen />;
  if (!currentUser) return <AuthScreen onLogin={onLogin} />;

  return (
    <div style={{'--theme-color': currentUser.profileColor || '#e21b3c'} as React.CSSProperties} className={`h-screen max-h-screen overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-[#f7f8fa] text-slate-900'} transition-colors duration-300`}>
      <style>{`
        :root { --theme-color: ${currentUser.profileColor || '#e21b3c'}; }
        .kahoot-button-custom { background-color: var(--theme-color); border-bottom: 4px solid rgba(0,0,0,0.3); }
        .text-custom { color: var(--theme-color); }
        .bg-custom { background-color: var(--theme-color); }
        .border-custom { border-color: var(--theme-color); }
      `}</style>
      <AnimatePresence>{isMoodModalOpen && <MoodCheckIn onSubmit={(m) => { const today = new Date().toDateString(); setCurrentUser({ ...currentUser, moodStreak: currentUser.lastMoodDate === today ? currentUser.moodStreak : (currentUser.moodStreak || 0) + 1, lastMoodDate: today, moodHistory: [...(currentUser.moodHistory || []), { date: today, mood: m, score: MOOD_SCORES[m || 'Normal'] }] }); setIsMoodModalOpen(false); }} isDarkMode={isDarkMode} />}</AnimatePresence>
      <Sidebar activeSection={activeSection} onNavigate={(s) => { setActiveSection(s); if(s === 'Profile') setViewingUsername(currentUser.username); }} isDarkMode={isDarkMode} user={currentUser} unreadMessages={allMessages.filter(m => m.recipient === currentUser.username && !m.read).length} unreadNotifications={notifications.filter(n => n.recipient === currentUser.username && !n.read).length} />
      <main className="flex-1 flex flex-col relative pt-16 pb-20 md:pt-0 md:pb-0 h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto fading-scrollbar p-4 md:p-8">
          <motion.div key={activeSection + (activeSection === 'Profile' ? viewingUsername : '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
            {activeSection === 'Home' && <HomeSection user={currentUser} posts={allPosts} isDarkMode={isDarkMode} />}
            {activeSection === 'Mood' && <MoodSection user={currentUser} posts={allPosts} onPost={(c, v) => setAllPosts(prev => [{id: Math.random().toString(36).substr(2, 9), author: currentUser.username, content: c, hearts: 0, comments: [], timestamp: Date.now(), visibility: v}, ...prev])} onHeart={handleHeart} onComment={(pid, t) => setAllPosts(prev => prev.map(p => p.id === pid ? { ...p, comments: [...p.comments, { id: Math.random().toString(36).substr(2, 9), author: currentUser.username, text: t, hearts: 0, timestamp: Date.now(), replies: [] }] } : p))} onCommentInteraction={handleCommentInteraction} onRepost={handleRepost} onFollow={handleFollow} onBlock={handleBlock} isDarkMode={isDarkMode} onNavigateToProfile={(u) => {setViewingUsername(u); setActiveSection('Profile');}} onUpdatePet={updatePetStats} />}
            {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
            {activeSection === 'CityHall' && <CityHallSection isDarkMode={isDarkMode} currentUser={currentUser} messages={allMessages} onSendMessage={handleSendMessage} onReadMessages={(u) => setAllMessages(prev => prev.map(m => (m.recipient === currentUser.username && m.sender === u) ? {...m, read: true} : m))} onNavigateToProfile={(u) => {setViewingUsername(u); setActiveSection('Profile');}} onReactToMessage={handleMessageReaction} />}
            {activeSection === 'Notifications' && <NotificationsSection notifications={notifications.filter(n => n.recipient === currentUser.username)} isDarkMode={isDarkMode} onMarkRead={() => setNotifications(notifications.map(n => n.recipient === currentUser.username ? {...n, read: true} : n))} />}
            {activeSection === 'Profile' && profileToView && <ProfileSection user={profileToView} allPosts={allPosts} isDarkMode={isDarkMode} currentUser={currentUser} onEditProfile={(dn, un, pp, ti, bp, pc, bi) => { setCurrentUser({...currentUser, displayName: dn, username: un, profilePic: pp, title: ti, profileColor: pc, bio: bi}); setViewingUsername(un); }} onBlock={handleBlock} onFollow={handleFollow} />}
            {activeSection === 'Settings' && <SettingsSection isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={() => {localStorage.removeItem('mooderia_user'); setCurrentUser(null);}} user={currentUser} onUnblock={(u) => setCurrentUser({...currentUser, blockedUsers: currentUser.blockedUsers.filter(b => b !== u)})} />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default App;
