import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mood, Section, Post, Comment, Message, Notification, MessageReaction, Group } from './types';
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
import { Trophy, Share2, X, ShieldAlert, AlertOctagon, LogOut, Gavel } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('Home');
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [isAppStarting, setIsAppStarting] = useState(true);
  
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeWarning, setActiveWarning] = useState<{ count: number, reason: string } | null>(null);

  const migrateUserData = (user: User): User => {
    return {
      ...user,
      blockedUsers: user.blockedUsers || [],
      moodHistory: user.moodHistory || [],
      following: user.following || [],
      followers: user.followers || [],
      moodStreak: user.moodStreak || 0,
      petLevel: user.petLevel || 1,
      moodCoins: user.moodCoins ?? 100,
      gameCooldowns: user.gameCooldowns || {},
      petHasBeenChosen: !!user.petHasBeenChosen,
      warnings: user.warnings ?? 0,
      isBanned: !!user.isBanned
    };
  };

  const profileToView = useMemo(() => {
    if (!viewingUsername) return null;
    if (currentUser && viewingUsername === currentUser.username) return currentUser;
    return allUsers.find(u => u.username === viewingUsername) || null;
  }, [viewingUsername, currentUser, allUsers]);

  const addNotification = useCallback((recipient: string, type: Notification['type'], snippet: string, postId: string = '') => {
    if (!currentUser) return;
    if (recipient === currentUser.username && type !== 'achievement' && type !== 'tier' && type !== 'warning') return;
    
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      fromUser: type === 'warning' ? 'Police Force' : (currentUser?.username || 'Metropolis'),
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
    const savedAllUsers = localStorage.getItem('mooderia_all_users') || '[]';
    const savedPosts = localStorage.getItem('mooderia_posts') || '[]';
    const savedMessages = localStorage.getItem('mooderia_messages') || '[]';
    const savedGroups = localStorage.getItem('mooderia_groups') || '[]';
    const savedNotifications = localStorage.getItem('mooderia_notifications') || '[]';
    const savedTheme = localStorage.getItem('mooderia_theme');
    
    try {
      const loadedAllUsers = JSON.parse(savedAllUsers).map(migrateUserData);
      setAllUsers(loadedAllUsers);
    } catch (e) {
      setAllUsers([]);
    }

    if (savedUser) {
      try {
        let user: User = JSON.parse(savedUser);
        user = migrateUserData(user);
        
        const now = Date.now();
        if (user.email === 'travismiguel014@gmail.com') user.title = 'Creator';
        
        const lastUpdate = user.petLastUpdate || now;
        const elapsedMinutes = Math.floor((now - lastUpdate) / 60000);
        
        if (elapsedMinutes > 0) {
          user.petHunger = Math.max(0, user.petHunger - elapsedMinutes * 0.15);
          user.petThirst = Math.max(0, user.petThirst - elapsedMinutes * 0.2);
          if (!user.petSleepUntil || user.petSleepUntil < now) {
            user.petRest = Math.max(0, user.petRest - elapsedMinutes * 0.1);
            user.petSleepUntil = null;
          }
          user.petLastUpdate = now;
        }
        setCurrentUser(user);
        setViewingUsername(user.username);
      } catch (e) { 
        localStorage.removeItem('mooderia_user');
      }
    }

    setAllPosts(JSON.parse(savedPosts).map((p: any) => ({ ...p, likes: Array.isArray(p.likes) ? p.likes : [] })));
    setAllMessages(JSON.parse(savedMessages));
    setAllGroups(JSON.parse(savedGroups));
    setNotifications(JSON.parse(savedNotifications));
    if (savedTheme === 'dark') setIsDarkMode(true);
    setIsLoaded(true);

    const timer = setTimeout(() => setIsAppStarting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (currentUser) {
      localStorage.setItem('mooderia_user', JSON.stringify(currentUser));
      setAllUsers(prev => {
        const idx = prev.findIndex(u => u.username === currentUser.username);
        const updated = [...prev];
        if (idx > -1) updated[idx] = currentUser;
        else updated.push(currentUser);
        return updated;
      });
    }
  }, [currentUser, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
    localStorage.setItem('mooderia_posts', JSON.stringify(allPosts));
    localStorage.setItem('mooderia_messages', JSON.stringify(allMessages));
    localStorage.setItem('mooderia_groups', JSON.stringify(allGroups));
    localStorage.setItem('mooderia_notifications', JSON.stringify(notifications));
    localStorage.setItem('mooderia_theme', isDarkMode ? 'dark' : 'light');
  }, [allUsers, allPosts, allMessages, allGroups, notifications, isDarkMode, isLoaded]);

  const handleFollow = (targetUsername: string) => {
    if (!currentUser || currentUser.username === targetUsername) return;
    const isFollowing = currentUser.following.includes(targetUsername);
    
    setAllUsers(prev => prev.map(u => {
      if (u.username === currentUser.username) {
        const updatedFollowing = isFollowing 
          ? u.following.filter(f => f !== targetUsername)
          : [...u.following, targetUsername];
        return { ...u, following: updatedFollowing };
      }
      if (u.username === targetUsername) {
        const updatedFollowers = isFollowing
          ? (u.followers || []).filter(f => f !== currentUser.username)
          : [...(u.followers || []), currentUser.username];
        return { ...u, followers: updatedFollowers };
      }
      return u;
    }));

    const newFollowing = isFollowing 
      ? currentUser.following.filter(f => f !== targetUsername)
      : [...currentUser.following, targetUsername];
    setCurrentUser({ ...currentUser, following: newFollowing });

    if (!isFollowing) addNotification(targetUsername, 'follow', '');
  };

  const handleBlock = (targetUsername: string) => {
    if (!currentUser || currentUser.username === targetUsername) return;
    setAllUsers(prev => prev.map(u => {
      if (u.username === currentUser.username) {
        return { 
          ...u, 
          blockedUsers: [...u.blockedUsers, targetUsername],
          following: u.following.filter(f => f !== targetUsername),
          followers: u.followers.filter(f => f !== targetUsername)
        };
      }
      if (u.username === targetUsername) {
        return {
          ...u,
          following: u.following.filter(f => f !== currentUser.username),
          followers: u.followers.filter(f => f !== currentUser.username)
        };
      }
      return u;
    }));

    setCurrentUser({
      ...currentUser,
      blockedUsers: [...currentUser.blockedUsers, targetUsername],
      following: currentUser.following.filter(f => f !== targetUsername),
      followers: currentUser.followers.filter(f => f !== currentUser.username)
    });
  };

  const handleSendMessage = (recipient: string, text: string, options?: any) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: currentUser.username,
      recipient,
      text,
      timestamp: Date.now(),
      read: false,
      isGroup: options?.isGroup || false,
      isSystem: options?.isSystem || false,
      groupName: options?.groupName,
      replyToId: options?.replyToId,
      replyToText: options?.replyToText,
      replyToSender: options?.replyToSender
    };
    setAllMessages(prev => [...prev, newMessage]);
  };

  const handleMessageReaction = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    setAllMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = [...(m.reactions || [])];
        const reactionIdx = reactions.findIndex(r => r.emoji === emoji);
        if (reactionIdx > -1) {
          const reaction = reactions[reactionIdx];
          const userIdx = reaction.users.indexOf(currentUser.username);
          if (userIdx > -1) {
            const newUsers = reaction.users.filter(u => u !== currentUser.username);
            if (newUsers.length === 0) reactions.splice(reactionIdx, 1);
            else reactions[reactionIdx] = { ...reaction, users: newUsers };
          } else {
            reactions[reactionIdx] = { ...reaction, users: [...reaction.users, currentUser.username] };
          }
        } else {
          reactions.push({ emoji, users: [currentUser.username] });
        }
        return { ...m, reactions };
      }
      return m;
    }));
  };

  // Auth and general state handlers
  const onLogin = (user: User) => {
    setCurrentUser(user);
    setViewingUsername(user.username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mooderia_user');
    setActiveSection('Home');
  };

  // Post handlers
  const handleHeart = (postId: string) => {
    if (!currentUser) return;
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = p.likes.includes(currentUser.username);
        const newLikes = isLiked 
          ? p.likes.filter(u => u !== currentUser.username)
          : [...p.likes, currentUser.username];
        
        if (!isLiked) {
          addNotification(p.author, 'heart', p.content.substring(0, 20), p.id);
        }
        return { ...p, likes: newLikes };
      }
      return p;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setAllPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleEditPost = (postId: string, newContent: string) => {
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
  };

  const handleCommentInteraction = (postId: string, commentId: string, action: 'heart' | 'reply', replyText?: string) => {
    if (!currentUser) return;
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map(c => {
            if (c.id === commentId) {
              if (action === 'heart') {
                return { ...c, hearts: c.hearts + 1 };
              } else if (action === 'reply' && replyText) {
                const newReply: Comment = {
                  id: Math.random().toString(36).substr(2, 9),
                  author: currentUser.username,
                  text: replyText,
                  hearts: 0,
                  timestamp: Date.now(),
                  replies: []
                };
                return { ...c, replies: [...c.replies, newReply] };
              }
            } else if (c.replies.length > 0) {
              return { ...c, replies: updateComments(c.replies) };
            }
            return c;
          });
        };
        return { ...p, comments: updateComments(p.comments) };
      }
      return p;
    }));
  };

  const handleRepost = (post: Post) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.username,
      content: post.content,
      likes: [],
      comments: [],
      timestamp: Date.now(),
      isRepost: true,
      originalAuthor: post.author,
      visibility: 'global'
    };
    setAllPosts(prev => [newPost, ...prev]);
    addNotification(post.author, 'repost', post.content.substring(0, 20), post.id);
  };

  // Pet logic handler
  const updatePetStats = (hunger: number, thirst: number, rest: number, coins: number, exp: number = 0, sleepUntil: number | null = null, newEmoji?: string, markChosen?: boolean, newName?: string, gameCooldownId?: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => {
      if (!prev) return null;
      let nextLevel = prev.petLevel;
      let nextExp = prev.petExp + exp;
      while (nextExp >= getExpNeeded(nextLevel)) {
        nextExp -= getExpNeeded(nextLevel);
        nextLevel++;
      }
      return {
        ...prev,
        petHunger: Math.min(100, Math.max(0, prev.petHunger + hunger)),
        petThirst: Math.min(100, Math.max(0, prev.petThirst + thirst)),
        petRest: Math.min(100, Math.max(0, prev.petRest + rest)),
        moodCoins: Math.max(0, prev.moodCoins + coins),
        petExp: nextExp,
        petLevel: nextLevel,
        petSleepUntil: sleepUntil !== null ? sleepUntil : prev.petSleepUntil,
        petEmoji: newEmoji || prev.petEmoji,
        petHasBeenChosen: markChosen !== undefined ? markChosen : prev.petHasBeenChosen,
        petName: newName || prev.petName,
        gameCooldowns: gameCooldownId ? { ...prev.gameCooldowns, [gameCooldownId]: Date.now() + 300000 } : prev.gameCooldowns,
        petLastUpdate: Date.now()
      };
    });
  };

  // Moderation handler
  const handleViolation = (reason: string) => {
    if (!currentUser) return;
    const newWarnings = (currentUser.warnings || 0) + 1;
    const isBanned = newWarnings >= 3;
    
    setCurrentUser({
      ...currentUser,
      warnings: newWarnings,
      isBanned: isBanned
    });

    setActiveWarning({ count: newWarnings, reason });
    addNotification(currentUser.username, 'warning', reason);
  };

  // Group handlers
  const handleGroupUpdate = (group: Group) => {
    setAllGroups(prev => prev.map(g => g.id === group.id ? group : g));
  };

  const handleGroupCreate = (group: Group) => {
    setAllGroups(prev => [...prev, group]);
  };

  if (isAppStarting) return <LoadingScreen />;
  if (!currentUser) return <AuthScreen onLogin={onLogin} />;

  if (currentUser.isBanned) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black text-white flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <Gavel size={120} className="text-red-600 mb-8" />
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 text-red-600">EXILED</h1>
        <button onClick={handleLogout} className="flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xl transition-all shadow-2xl z-[1001]"><LogOut size={24} /> Leave Metropolis</button>
      </div>
    );
  }

  const isFixedSection = activeSection === 'CityHall' || activeSection === 'Mood';

  return (
    <div style={{'--theme-color': currentUser.profileColor || '#e21b3c'} as React.CSSProperties} className={`h-screen max-h-screen overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-[#f7f8fa] text-slate-900'} transition-colors duration-300`}>
      <style>{`
        :root { --theme-color: ${currentUser.profileColor || '#e21b3c'}; }
        .kahoot-shadow { box-shadow: 0 4px 0 0 rgba(0,0,0,0.2); }
        .kahoot-button-custom { background-color: var(--theme-color); border-bottom: 6px solid rgba(0,0,0,0.3); }
        .text-custom { color: var(--theme-color); }
        .bg-custom { background-color: var(--theme-color); }
        .border-custom { border-color: var(--theme-color); }
      `}</style>

      <AnimatePresence>
        {activeWarning && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-slate-900 text-white rounded-[3rem] p-10 text-center border-8 border-red-600 shadow-2xl">
                <ShieldAlert size={80} className="mx-auto text-red-600 mb-6" />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">CITIZEN WARNING</h2>
                <div className="bg-red-600 text-white inline-block px-8 py-2 rounded-full font-black text-xl mb-6 shadow-xl">VIOLATION {activeWarning.count} / 3</div>
                <button onClick={() => setActiveWarning(null)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-base shadow-xl">I ACKNOWLEDGE THE ACCORDS</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMoodModalOpen && (
          <MoodCheckIn 
            onSubmit={(m) => { 
              const today = new Date().toDateString(); 
              setCurrentUser({ 
                ...currentUser!, 
                moodStreak: currentUser!.lastMoodDate === today ? currentUser!.moodStreak : (currentUser!.moodStreak || 0) + 1, 
                lastMoodDate: today, 
                moodHistory: [...(currentUser!.moodHistory || []), { date: today, mood: m, score: MOOD_SCORES[m || 'Normal'] }] 
              }); 
              setIsMoodModalOpen(false); 
            }} 
            isDarkMode={isDarkMode} 
          />
        )}
      </AnimatePresence>
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={(s) => { 
          setActiveSection(s); 
          if(s === 'Profile') setViewingUsername(currentUser!.username); 
        }} 
        isDarkMode={isDarkMode} 
        user={currentUser!} 
        unreadMessages={allMessages.filter(m => m.recipient === currentUser!.username && !m.read).length} 
        unreadNotifications={notifications.filter(n => n.recipient === currentUser!.username && !n.read).length} 
      />
      <main className="flex-1 flex flex-col min-h-0 relative pt-14 pb-16 md:pt-0 md:pb-0 h-full overflow-hidden">
        <div className={`flex-1 flex flex-col min-h-0 ${isFixedSection ? 'overflow-hidden' : 'overflow-y-auto fading-scrollbar'} p-4 md:p-8`}>
          <motion.div 
            key={activeSection + (activeSection === 'Profile' ? viewingUsername : '')} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0`}
          >
            {activeSection === 'Home' && <HomeSection user={currentUser!} posts={allPosts} isDarkMode={isDarkMode} />}
            {activeSection === 'Mood' && (
              <MoodSection 
                user={currentUser!} 
                posts={allPosts} 
                onPost={(c, v) => setAllPosts(prev => [{id: Math.random().toString(36).substr(2, 9), author: currentUser!.username, content: c, likes: [], comments: [], timestamp: Date.now(), visibility: v}, ...prev])} 
                onHeart={handleHeart} 
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
                onComment={(pid, t) => setAllPosts(prev => prev.map(p => p.id === pid ? { ...p, comments: [...p.comments, { id: Math.random().toString(36).substr(2, 9), author: currentUser!.username, text: t, hearts: 0, timestamp: Date.now(), replies: [] }] } : p))} 
                onCommentInteraction={handleCommentInteraction} 
                onRepost={handleRepost} 
                onFollow={handleFollow} 
                onBlock={handleBlock} 
                isDarkMode={isDarkMode} 
                onNavigateToProfile={(u) => {setViewingUsername(u); setActiveSection('Profile');}} 
                onUpdatePet={updatePetStats} 
                onViolation={handleViolation}
              />
            )}
            {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
            {activeSection === 'CityHall' && (
              <CityHallSection 
                isDarkMode={isDarkMode} 
                currentUser={currentUser!} 
                messages={allMessages} 
                groups={allGroups}
                onSendMessage={handleSendMessage} 
                onGroupUpdate={handleGroupUpdate}
                onGroupCreate={handleGroupCreate}
                onReadMessages={(u) => setAllMessages(prev => prev.map(m => (m.recipient === currentUser!.username && m.sender === u) ? {...m, read: true} : m))} 
                onNavigateToProfile={(u) => {setViewingUsername(u); setActiveSection('Profile');}} 
                onReactToMessage={handleMessageReaction} 
                onViolation={handleViolation}
              />
            )}
            {activeSection === 'Notifications' && (
              <NotificationsSection 
                notifications={notifications.filter(n => n.recipient === currentUser!.username)} 
                isDarkMode={isDarkMode} 
                onMarkRead={() => setNotifications(notifications.map(n => n.recipient === currentUser!.username ? {...n, read: true} : n))} 
              />
            )}
            {activeSection === 'Profile' && profileToView && (
              <ProfileSection 
                user={profileToView} 
                allPosts={allPosts} 
                isDarkMode={isDarkMode} 
                currentUser={currentUser!} 
                onEditProfile={(dn, un, pp, ti, bp, pc, bi) => { 
                  setCurrentUser({...currentUser!, displayName: dn, username: un, profilePic: pp, title: ti, profileColor: pc, bio: bi}); 
                  setViewingUsername(un); 
                }} 
                onBlock={handleBlock} 
                onFollow={handleFollow} 
              />
            )}
            {activeSection === 'Settings' && (
              <SettingsSection 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                onLogout={handleLogout} 
                user={currentUser!} 
                onUnblock={(u) => {
                  const newBlocked = currentUser!.blockedUsers.filter(b => b !== u);
                  setCurrentUser({...currentUser!, blockedUsers: newBlocked});
                }} 
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default App;
