import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Section, Notification, Mood, Message } from './types';
import Sidebar from './components/Sidebar';
import HomeSection from './sections/HomeSection';
import MoodSection from './sections/MoodSection';
import ZodiacSection from './sections/ZodiacSection';
import PsychiatristSection from './sections/PsychiatristSection';
import CityHallSection from './sections/CityHallSection';
import MailSection from './sections/MailSection';
import ProfileSection from './sections/ProfileSection';
import SettingsSection from './sections/SettingsSection';
import AuthScreen from './sections/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import MoodCheckIn from './components/MoodCheckIn';
import { MOOD_SCORES, getExpNeeded, t } from './constants';
import { syncProfile, fetchUserMessages, sendMessageCloud, getCurrentSessionUser, clearSession, supabase } from './services/supabaseService';
import { Coins, Sparkles, Trophy, Send, Calendar, Clock, Book, Rocket, Cog } from 'lucide-react';

type AnimationType = 'express' | 'schedule' | 'routine' | 'diary' | 'alarm' | null;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAppStarting, setIsAppStarting] = useState(true);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Filipino'>('English');
  const [activeToast, setActiveToast] = useState<{title: string, msg: string, icon?: any} | null>(null);
  
  const [centralAnimation, setCentralAnimation] = useState<{ type: AnimationType, text?: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Theme and Language
      const savedTheme = localStorage.getItem('mooderia_theme');
      if (savedTheme === 'dark') setIsDarkMode(true);
      const savedLang = localStorage.getItem('mooderia_lang');
      if (savedLang === 'Filipino') setLanguage('Filipino');
      
      // 2. Cloud Session Check
      try {
        const sessionUser = await getCurrentSessionUser();
        if (sessionUser) {
            setCurrentUser(sessionUser);
        }
      } catch (e) {
        console.error("Session fetch failed", e);
      }

      setIsLoaded(true);
      setTimeout(() => setIsAppStarting(false), 2000);
    };
    init();
  }, []);

  // Update profile in cloud whenever local state changes significantly
  useEffect(() => {
    if (currentUser) {
      syncProfile(currentUser);
    }
  }, [currentUser]);

  // Handle AI responses from PsychiatristSection via Custom Event
  useEffect(() => {
    const handleAiResponse = async (e: any) => {
      const aiMessage: Message = e.detail;
      await sendMessageCloud(aiMessage.sender, aiMessage.recipient, aiMessage.text);
      if (currentUser) {
        const freshMsgs = await fetchUserMessages(currentUser.username);
        setMessages(freshMsgs);
      }
    };
    window.addEventListener('ai-response', handleAiResponse);
    return () => window.removeEventListener('ai-response', handleAiResponse);
  }, [currentUser?.username]);

  // Real-time Polling for Cloud Data
  useEffect(() => {
    if (!currentUser) return;

    const pollData = async () => {
      const msgs = await fetchUserMessages(currentUser.username);
      setMessages(msgs);

      const mailNotifications: Notification[] = msgs.map((m: any) => ({
        id: m.id,
        type: 'mail',
        title: `From @${m.sender}`,
        text: m.text,
        timestamp: m.timestamp,
        read: m.read || false 
      }));

      // Fetch fresh profile data to sync friends/requests
      const { data: profile } = await supabase
        .from('profiles')
        .select('friends, friend_requests')
        .eq('username', currentUser.username)
        .single();

      if (profile) {
        if (JSON.stringify(profile.friends) !== JSON.stringify(currentUser.friends) || 
            JSON.stringify(profile.friend_requests) !== JSON.stringify(currentUser.friendRequests)) {
              setCurrentUser(prev => prev ? ({ ...prev, friends: profile.friends, friendRequests: profile.friend_requests }) : null);
        }

        const reqNotifs: Notification[] = (profile.friend_requests || []).map((reqUser: string) => ({
           id: `req-${reqUser}`,
           type: 'friend_request',
           title: 'Friend Request',
           text: `@${reqUser} wants to link frequencies.`,
           timestamp: Date.now(),
           fromUser: reqUser,
           read: false
        }));

        setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const allFreshNotifs = [...mailNotifications, ...reqNotifs];
            const newItems = allFreshNotifs.filter(n => !existingIds.has(n.id));

            if (newItems.length > 0) {
              const unreadNewMails = newItems.filter(n => n.type === 'mail' && !n.read);
              const unreadNewReqs = newItems.filter(n => n.type === 'friend_request' && !n.read);
              if (unreadNewMails.length > 0) showToast("New Mail", "Incoming transmission.");
              if (unreadNewReqs.length > 0) showToast("Alert", "New Citizen Link Request.");
            }
            
            return allFreshNotifs;
        });
      }
    };

    pollData();
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.username]);

  useEffect(() => {
    if (currentUser) {
      const today = new Date().toDateString();
      if (currentUser.lastMoodDate !== today) {
        setShowMoodCheckIn(true);
      } else {
        setShowMoodCheckIn(false);
      }
    }
  }, [currentUser?.username]); 

  const showToast = (title: string, msg: string, icon?: any) => {
    setActiveToast({ title, msg, icon });
    setTimeout(() => setActiveToast(null), 3000);
  };

  const triggerAnimation = (type: AnimationType, text?: string) => {
    setCentralAnimation({ type, text });
    setTimeout(() => setCentralAnimation(null), 2500);
  };

  const handleGainReward = useCallback((amount: number = 1, exp: number = 20) => {
    setCurrentUser(prev => {
       if(!prev) return null;
       let nextExp = prev.petExp + exp;
       let nextLevel = prev.petLevel;
       const needed = getExpNeeded(nextLevel);
       if (nextExp >= needed) {
         nextExp -= needed;
         nextLevel++;
         showToast("LEVEL UP!", `Pet reached Rank ${nextLevel}`, <Trophy size={20} className="text-yellow-400"/>);
       }
       return {
         ...prev,
         moodCoins: prev.moodCoins + amount,
         petExp: nextExp,
         petLevel: nextLevel
       };
    });
  }, []);

  const handleMoodSubmit = (mood: Mood) => {
    if (!currentUser) return;
    const today = new Date().toDateString();
    const score = mood ? MOOD_SCORES[mood] : 50;
    
    handleGainReward(1, 50);
    showToast(t('rewardTitle', language), t('rewardMsg', language), <Coins size={20} className="text-yellow-400" />);

    setCurrentUser(prev => {
      if (!prev) return prev;
      const history = [...prev.moodHistory, { date: today, mood, score }];
      let newStreak = prev.moodStreak;
      if (prev.lastMoodDate) {
         const lastDate = new Date(prev.lastMoodDate);
         const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays === 1) newStreak++;
         else if (diffDays > 1) newStreak = 1;
      } else {
         newStreak = 1;
      }
      return { ...prev, moodHistory: history, lastMoodDate: today, moodStreak: newStreak };
    });
    setShowMoodCheckIn(false);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleLogout = async () => {
    await clearSession(); 
    setCurrentUser(null);
    setIsAppStarting(true);
    setTimeout(() => setIsAppStarting(false), 1000);
  };

  const handleSendMail = async (recipient: string, message: string) => {
    if (!currentUser) return;
    const success = await sendMessageCloud(currentUser.username, recipient, message);
    if (success) {
      if (recipient !== 'DrPinel') {
        showToast("Sent!", `Express mail delivered to @${recipient}`);
      }
      const freshMsgs = await fetchUserMessages(currentUser.username);
      setMessages(freshMsgs);
    }
  };

  const renderCentralAnimation = () => {
    if (!centralAnimation) return null;
    const { type, text } = centralAnimation;
    let Icon = Sparkles;
    let color = "text-indigo-600";
    let animationProps = {};

    switch(type) {
        case 'express':
            Icon = Send;
            color = "text-red-500";
            animationProps = { 
                animate: { x: [0, 500], y: [0, -200], opacity: [1, 0] },
                transition: { duration: 1.5, ease: "easeIn" }
            };
            break;
        case 'schedule':
            Icon = Clock;
            color = "text-blue-500";
            animationProps = {
                animate: { rotate: 360, scale: [1, 1.5, 1] },
                transition: { duration: 1, repeat: 1 }
            };
            break;
        case 'routine':
            Icon = Cog;
            color = "text-purple-500";
            animationProps = {
                animate: { rotate: -360 },
                transition: { duration: 2, repeat: Infinity, ease: "linear" }
            };
            break;
        case 'diary':
            Icon = Book;
            color = "text-green-500";
            animationProps = {
                animate: { scale: [1, 1.2, 1], rotateY: [0, 180, 360] },
                transition: { duration: 1.5 }
            };
            break;
        default:
            Icon = Sparkles;
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 pointer-events-none"
      >
        <div className="relative flex flex-col items-center">
            <motion.div {...animationProps} className={`mb-6 ${color}`}>
                <Icon size={120} strokeWidth={3} />
            </motion.div>
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                className="text-center"
            >
                <h2 className="text-3xl font-black italic uppercase text-white tracking-widest drop-shadow-lg">
                    {type?.toUpperCase()} UPDATED
                </h2>
                {text && <p className="text-blue-300 font-bold uppercase mt-2">{text}</p>}
            </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-indigo-500 selection:text-white`}>
       <AnimatePresence>
         {isAppStarting && <LoadingScreen key="loading" />}
         
         {!isAppStarting && !currentUser && (
           <AuthScreen key="auth" onLogin={(u) => { setCurrentUser(u); setIsLoaded(true); }} />
         )}

         {!isAppStarting && currentUser && (
           <div className="flex flex-col md:flex-row h-screen">
              <Sidebar 
                activeSection={activeSection} 
                onNavigate={setActiveSection} 
                isDarkMode={isDarkMode} 
                user={currentUser}
                unreadMails={notifications.filter(n => !n.read).length}
                language={language}
              />
              
              <main className="flex-1 h-full overflow-y-auto relative p-4 md:p-8 no-scrollbar">
                <AnimatePresence mode="wait">
                  {activeSection === 'Home' && <motion.div key="home" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}><HomeSection user={currentUser} isDarkMode={isDarkMode} language={language} /></motion.div>}
                  {activeSection === 'Mood' && <motion.div key="mood" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="h-full"><MoodSection user={currentUser} onUpdate={handleUpdateUser} isDarkMode={isDarkMode} language={language} onReward={() => handleGainReward(1, 10)} triggerAnimation={triggerAnimation} /></motion.div>}
                  {activeSection === 'Zodiac' && <motion.div key="zodiac" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="h-full"><ZodiacSection isDarkMode={isDarkMode} /></motion.div>}
                  {activeSection === 'Psychiatrist' && <motion.div key="psychiatrist" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="h-full"><PsychiatristSection currentUser={currentUser} isDarkMode={isDarkMode} messages={messages} onSendMessage={(text) => handleSendMail('DrPinel', text)} /></motion.div>}
                  {activeSection === 'CityHall' && <motion.div key="cityhall" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="h-full"><CityHallSection user={currentUser} onUpdate={handleUpdateUser} isDarkMode={isDarkMode} language={language} onReward={() => handleGainReward(2, 20)} triggerAnimation={triggerAnimation} onSendMail={handleSendMail} /></motion.div>}
                  {activeSection === 'Mails' && <motion.div key="mails" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}><MailSection notifications={notifications} setNotifications={setNotifications} isDarkMode={isDarkMode} currentUser={currentUser} /></motion.div>}
                  {activeSection === 'Profile' && <motion.div key="profile" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}><ProfileSection user={currentUser} onUpdate={handleUpdateUser} isDarkMode={isDarkMode} /></motion.div>}
                  {activeSection === 'Settings' && <motion.div key="settings" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                    <SettingsSection 
                      isDarkMode={isDarkMode} 
                      onToggleDarkMode={() => { setIsDarkMode(!isDarkMode); localStorage.setItem('mooderia_theme', !isDarkMode ? 'dark' : 'light'); }}
                      language={language}
                      onToggleLanguage={() => { setLanguage(l => l === 'English' ? 'Filipino' : 'English'); localStorage.setItem('mooderia_lang', language === 'English' ? 'Filipino' : 'English'); }}
                      onLogout={handleLogout}
                      user={currentUser}
                    />
                  </motion.div>}
                </AnimatePresence>
              </main>

              <AnimatePresence>
                {showMoodCheckIn && (
                  <MoodCheckIn onSubmit={handleMoodSubmit} isDarkMode={isDarkMode} />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {renderCentralAnimation()}
              </AnimatePresence>
              <AnimatePresence>
                {activeToast && (
                  <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[100] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border-2 border-black/5 flex items-center gap-4 max-w-sm">
                     <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl">{activeToast.icon || <Sparkles className="text-indigo-600" size={20} />}</div>
                     <div><h5 className="font-black uppercase text-xs">{activeToast.title}</h5><p className="text-sm font-bold opacity-70">{activeToast.msg}</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default App;