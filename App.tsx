
import React, { useState, useEffect, useCallback } from 'react';
import { User, Section, Post, Comment, Message, Notification, Group } from './types';
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
import { MOOD_SCORES } from './constants';
import { LogOut, Gavel } from 'lucide-react';
// Import AnimatePresence from framer-motion to resolve find name errors
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  useEffect(() => {
    const savedUser = localStorage.getItem('mooderia_user');
    const savedPosts = localStorage.getItem('mooderia_posts') || '[]';
    const savedMessages = localStorage.getItem('mooderia_messages') || '[]';
    const savedGroups = localStorage.getItem('mooderia_groups') || '[]';
    const savedNotifications = localStorage.getItem('mooderia_notifications') || '[]';
    const savedTheme = localStorage.getItem('mooderia_theme');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setViewingUsername(user.username);
      } catch (e) { 
        localStorage.removeItem('mooderia_user');
      }
    }
    setAllPosts(JSON.parse(savedPosts));
    setAllMessages(JSON.parse(savedMessages));
    setAllGroups(JSON.parse(savedGroups));
    setNotifications(JSON.parse(savedNotifications));
    if (savedTheme === 'dark') setIsDarkMode(true);
    setIsLoaded(true);
    setTimeout(() => setIsAppStarting(false), 2000);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (currentUser) {
      localStorage.setItem('mooderia_user', JSON.stringify(currentUser));
      const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
      const idx = allUsers.findIndex(u => u.username === currentUser.username);
      if (idx > -1) allUsers[idx] = currentUser;
      else allUsers.push(currentUser);
      localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
    }
    localStorage.setItem('mooderia_posts', JSON.stringify(allPosts));
    localStorage.setItem('mooderia_messages', JSON.stringify(allMessages));
    localStorage.setItem('mooderia_groups', JSON.stringify(allGroups));
    localStorage.setItem('mooderia_notifications', JSON.stringify(notifications));
    localStorage.setItem('mooderia_theme', isDarkMode ? 'dark' : 'light');
  }, [currentUser, allPosts, allMessages, allGroups, notifications, isDarkMode, isLoaded]);

  const addNotification = useCallback((recipient: string, type: Notification['type'], snippet: string, postId: string = '') => {
    if (!currentUser || recipient === currentUser.username) return;
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      fromUser: currentUser.username,
      recipient,
      type,
      postId,
      timestamp: Date.now(),
      read: false,
      postContentSnippet: snippet
    };
    setNotifications(prev => [...prev, newNotif]);
  }, [currentUser]);

  const handleHeart = (postId: string) => {
    if (!currentUser) return;
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        const alreadyLiked = likedBy.includes(currentUser.username);
        const newLikedBy = alreadyLiked ? likedBy.filter(u => u !== currentUser.username) : [...likedBy, currentUser.username];
        if (!alreadyLiked && p.author !== currentUser.username) {
          addNotification(p.author, 'heart', p.content.substring(0, 20), p.id);
        }
        return { ...p, hearts: newLikedBy.length, likedBy: newLikedBy };
      }
      return p;
    }));
  };

  const handleEditPost = (postId: string, content: string) => {
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, content } : p));
  };

  const handleDeletePost = (postId: string) => {
    setAllPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleLogout = () => {
    localStorage.removeItem('mooderia_user');
    setCurrentUser(null);
    setViewingUsername(null);
    setActiveSection('Home');
  };

  const onLogin = (user: User) => {
    setCurrentUser(user);
    setViewingUsername(user.username);
  };

  if (isAppStarting) return <LoadingScreen />;
  if (!currentUser) return <AuthScreen onLogin={onLogin} />;
  if (currentUser.isBanned) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-black italic uppercase text-red-600 mb-8 tracking-tighter">EXILED</h1>
        <button onClick={handleLogout} className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xl"><LogOut size={24} /> Leave Metropolis</button>
      </div>
    );
  }

  return (
    <div style={{'--theme-color': currentUser.profileColor || '#e21b3c'} as React.CSSProperties} className={`h-screen overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-[#f7f8fa] text-slate-900'} transition-colors duration-300`}>
      <Sidebar activeSection={activeSection} onNavigate={(s) => { setActiveSection(s); if(s === 'Profile') setViewingUsername(currentUser!.username); }} isDarkMode={isDarkMode} user={currentUser!} unreadMessages={0} unreadNotifications={notifications.filter(n => n.recipient === currentUser!.username && !n.read).length} />
      <main className="flex-1 overflow-y-auto fading-scrollbar p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {activeSection === 'Home' && <HomeSection user={currentUser!} posts={allPosts} isDarkMode={isDarkMode} />}
          {activeSection === 'Mood' && (
            <MoodSection 
              user={currentUser!} 
              posts={allPosts} 
              onPost={(c, v) => setAllPosts(prev => [{id: Math.random().toString(36).substr(2, 9), author: currentUser!.username, content: c, hearts: 0, likedBy: [], comments: [], timestamp: Date.now(), visibility: v}, ...prev])} 
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onHeart={handleHeart} 
              onComment={(pid, t) => setAllPosts(prev => prev.map(p => p.id === pid ? { ...p, comments: [...p.comments, { id: Math.random().toString(36).substr(2, 9), author: currentUser!.username, text: t, hearts: 0, timestamp: Date.now(), replies: [] }] } : p))} 
              onCommentInteraction={() => {}} 
              onRepost={(p) => setAllPosts(prev => [{...p, id: Math.random().toString(36).substr(2, 9), author: currentUser!.username, isRepost: true, originalAuthor: p.author, hearts: 0, likedBy: [], comments: [], timestamp: Date.now()}, ...prev])} 
              onFollow={() => {}} 
              onBlock={() => {}} 
              isDarkMode={isDarkMode} 
              onNavigateToProfile={(u) => {setViewingUsername(u); setActiveSection('Profile');}} 
              onUpdatePet={() => {}} 
              onViolation={() => {}}
            />
          )}
          {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
          {activeSection === 'Profile' && (
            <ProfileSection 
              user={currentUser} 
              allPosts={allPosts} 
              isDarkMode={isDarkMode} 
              currentUser={currentUser!} 
            />
          )}
          {activeSection === 'Notifications' && <NotificationsSection notifications={notifications} isDarkMode={isDarkMode} onMarkRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} />}
        </div>
      </main>
      <AnimatePresence>
        {isMoodModalOpen && <MoodCheckIn isDarkMode={isDarkMode} onSubmit={(m) => { setCurrentUser({...currentUser, lastMoodDate: new Date().toDateString()}); setIsMoodModalOpen(false); }} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
