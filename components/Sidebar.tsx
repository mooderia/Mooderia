
import React, { useState, useEffect } from 'react';
// Added missing import for motion component from framer-motion
import { motion } from 'framer-motion';
import { Home, Smile, Moon, Building2, User, Settings, Bell, LucideProps, Clock as ClockIcon, ChevronRight } from 'lucide-react';
import { Section, User as UserType } from '../types';

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  isDarkMode: boolean;
  user: UserType;
  unreadMessages?: number;
  unreadNotifications?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isDarkMode, user, unreadMessages = 0, unreadNotifications = 0 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items: { id: Section, icon: React.ReactElement<LucideProps>, color: string, label: string, mobileLabel: string }[] = [
    { id: 'Home', icon: <Home />, color: 'kahoot-button-purple', label: 'Dashboard', mobileLabel: 'Home' },
    { id: 'Mood', icon: <Smile />, color: 'kahoot-button-blue', label: 'Mood Labs', mobileLabel: 'Labs' },
    { id: 'Zodiac', icon: <Moon />, color: 'kahoot-button-green', label: 'Zodiac Hub', mobileLabel: 'Stars' },
    { id: 'CityHall', icon: <Building2 />, color: 'kahoot-button-red', label: 'Citizen Hub', mobileLabel: 'City' },
    { id: 'Notifications', icon: <Bell />, color: 'kahoot-button-yellow', label: 'Alerts', mobileLabel: 'Alerts' },
  ];

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      {/* Mobile Top Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-[60] px-4 py-3 flex justify-between items-center ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'} backdrop-blur-xl border-b shadow-sm`}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tighter text-[#46178f] italic uppercase">Mooderia</h1>
          <div className="bg-black/5 px-2 py-0.5 rounded-full">
            <span className="text-[9px] font-black uppercase opacity-60 tabular-nums">{formattedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => onNavigate('Settings')} className={`p-2 rounded-xl transition-all ${activeSection === 'Settings' ? 'bg-[#46178f] text-white shadow-lg' : 'text-gray-400 hover:bg-black/5'}`}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Optimized for 6 items (Ops removed) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-t px-0.5 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.1)]`}>
        <div className="flex justify-around items-center h-16">
          {items.map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`relative flex flex-col items-center justify-center transition-all flex-1 py-1 rounded-xl ${activeSection === item.id ? 'text-[#46178f]' : 'text-gray-400 opacity-60'}`}>
              {React.cloneElement(item.icon, { size: 18 })}
              {item.id === 'CityHall' && unreadMessages > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#e21b3c] text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadMessages}</span>}
              {item.id === 'Notifications' && unreadNotifications > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#ffa602] text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadNotifications}</span>}
              <span className="text-[6.5px] font-black uppercase mt-1 tracking-tighter">{item.mobileLabel}</span>
              {activeSection === item.id && <motion.div layoutId="mobile-indicator" className="absolute -bottom-1 w-1 h-1 bg-[#46178f] rounded-full" />}
            </button>
          ))}
          <button onClick={() => onNavigate('Profile')} className={`relative flex flex-col items-center justify-center flex-1 py-1 ${activeSection === 'Profile' ? 'text-indigo-600' : 'text-gray-400 opacity-60'}`}>
             <User size={18} />
             <span className="text-[6.5px] font-black uppercase mt-1 tracking-tighter">Profile</span>
             {activeSection === 'Profile' && <motion.div layoutId="mobile-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />}
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 p-6 lg:p-8 h-screen sticky top-0 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'} border-r shadow-2xl z-50`}>
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-[#46178f] uppercase leading-none">Mooderia</h1>
          <div className="flex items-center gap-2 mt-2 opacity-30">
            <ClockIcon size={12} /> <span className="text-[9px] font-black uppercase tracking-widest tabular-nums">{formattedTime}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 lg:space-y-3">
          {items.map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full group relative flex items-center gap-4 p-3 lg:p-4 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-tight transition-all border-b-4 ${activeSection === item.id ? item.color + ' text-white translate-x-1 shadow-lg' : 'hover:bg-black/5 opacity-60 hover:opacity-100'}`}>
              <span className="shrink-0">{React.cloneElement(item.icon, { size: 20 })}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'CityHall' && unreadMessages > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow-lg">{unreadMessages}</span>}
              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${activeSection === item.id ? 'opacity-100 translate-x-1' : ''}`} />
            </button>
          ))}
          <div className="h-px bg-black/5 dark:bg-white/5 my-6" />
          <button onClick={() => onNavigate('Profile')} className={`w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-tight transition-all border-b-4 ${activeSection === 'Profile' ? 'bg-indigo-600 border-indigo-800 text-white translate-x-1 shadow-lg' : 'hover:bg-black/5 opacity-60 hover:opacity-100'}`}>
            <User size={20} /> Profile ID
          </button>
          <button onClick={() => onNavigate('Settings')} className={`w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-tight transition-all border-b-4 ${activeSection === 'Settings' ? 'bg-gray-700 border-gray-900 text-white translate-x-1 shadow-lg' : 'hover:bg-black/5 opacity-60 hover:opacity-100'}`}>
            <Settings size={20} /> Operations
          </button>
        </nav>

        <div className="mt-auto bg-black/5 dark:bg-white/5 p-4 rounded-[2rem] border border-black/5 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-indigo-500 shadow-xl flex items-center justify-center text-white font-black overflow-hidden shrink-0 border-2 border-white/20">
             {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user.displayName[0]}
           </div>
           <div className="flex-1 min-w-0">
             <p className="font-black text-[11px] truncate leading-none mb-1">{user.displayName}</p>
             <p className="text-[8px] font-black uppercase opacity-40 tracking-widest truncate">{user.title}</p>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
