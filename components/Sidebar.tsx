import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Smile, Moon, Building2, User, Settings, Bell, LucideProps, Clock as ClockIcon, ChevronRight, Sparkles, Lock, WifiOff } from 'lucide-react';
import { Section, User as UserType } from '../types';

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  isDarkMode: boolean;
  user: UserType;
  isGuest?: boolean;
  isOffline?: boolean;
  unreadMessages?: number;
  unreadNotifications?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isDarkMode, user, isGuest = false, isOffline = false, unreadMessages = 0, unreadNotifications = 0 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items: { id: Section, icon: React.ReactElement<LucideProps>, color: string, label: string, mobileLabel: string, restricted?: boolean, offlineRestricted?: boolean }[] = [
    { id: 'Home', icon: <Home />, color: 'bg-[#46178f]', label: 'Dashboard', mobileLabel: 'Home' },
    { id: 'Zodiac', icon: <Sparkles />, color: 'bg-[#1368ce]', label: 'Cosmic Hub', mobileLabel: 'Zodiac' },
    { id: 'Mood', icon: <Smile />, color: 'bg-[#26890c]', label: 'Mood Labs', mobileLabel: 'Labs' },
    { id: 'CityHall', icon: <Building2 />, color: 'bg-[#e21b3c]', label: 'Citizen Hub', mobileLabel: 'City', restricted: true, offlineRestricted: true },
    { id: 'Notifications', icon: <Bell />, color: 'bg-[#ffa602]', label: 'Alerts', mobileLabel: 'Alerts', restricted: true },
  ];

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      <div className={`md:hidden fixed top-0 left-0 right-0 z-[60] px-6 py-4 flex justify-between items-center ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'} backdrop-blur-xl border-b shadow-sm`}>
        <h1 className="text-2xl font-black italic tracking-tighter text-[#46178f] uppercase leading-none">Mooderia</h1>
        <button onClick={() => onNavigate('Settings')} className={`p-2.5 rounded-2xl transition-all shadow-sm ${activeSection === 'Settings' ? 'bg-[#46178f] text-white' : 'text-gray-400 bg-black/5'}`}>
          <Settings size={22} />
        </button>
      </div>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-t px-1 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.1)]`}>
        <div className="flex justify-around items-center h-20 overflow-x-auto no-scrollbar">
          {items.map(item => {
            const isLocked = (isGuest && item.restricted) || (isOffline && item.offlineRestricted);
            return (
              <button 
                key={item.id} 
                onClick={() => onNavigate(item.id)} 
                className={`relative flex flex-col items-center justify-center transition-all flex-1 py-3 px-2 rounded-2xl ${activeSection === item.id ? 'text-[#46178f]' : 'text-gray-400 opacity-60'} ${isLocked ? 'grayscale' : ''}`}
              >
                <div className="relative">
                  {React.cloneElement(item.icon, { size: 22 })}
                  {isLocked && (
                    <div className="absolute -top-1 -right-1">
                       {isOffline && item.offlineRestricted ? <WifiOff size={10} className="text-red-600" /> : <Lock size={10} className="text-red-500" />}
                    </div>
                  )}
                  {!isGuest && !isOffline && item.id === 'CityHall' && unreadMessages > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e21b3c] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">{unreadMessages}</span>}
                </div>
                <span className="text-[8px] font-black uppercase mt-1 tracking-tight">{item.mobileLabel}</span>
              </button>
            );
          })}
          <button onClick={() => onNavigate('Profile')} className={`relative flex flex-col items-center justify-center flex-1 py-3 px-2 ${activeSection === 'Profile' ? 'text-indigo-600' : 'text-gray-400 opacity-60'}`}>
             <div className="relative">
               <User size={22} />
               {isGuest && <Lock size={10} className="absolute -top-1 -right-1 text-red-500" />}
             </div>
             <span className="text-[8px] font-black uppercase mt-1 tracking-tight">Me</span>
          </button>
        </div>
      </nav>

      <aside className={`hidden md:flex flex-col w-64 lg:w-68 p-5 lg:p-6 h-screen sticky top-0 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'} border-r shadow-2xl z-50`}>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-[#46178f] uppercase leading-none">Mooderia</h1>
          <div className="flex items-center gap-2 mt-3 opacity-30 px-1">
            <ClockIcon size={14} /> 
            <span className="text-[10px] font-black uppercase tracking-[0.25em] tabular-nums">{formattedTime}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 lg:space-y-2.5 overflow-y-auto no-scrollbar">
          {items.map(item => {
            const isLocked = (isGuest && item.restricted) || (isOffline && item.offlineRestricted);
            return (
              <button 
                key={item.id} 
                onClick={() => onNavigate(item.id)} 
                className={`w-full group relative flex items-center gap-3.5 p-3 rounded-2xl font-black text-[12px] uppercase tracking-tight transition-all border-b-4 active:translate-y-0.5 active:border-b-2 ${activeSection === item.id ? item.color + ' text-white translate-x-1 shadow-md' : 'hover:bg-black/5 opacity-70 hover:opacity-100'} ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
                <span className="shrink-0">{React.cloneElement(item.icon, { size: 18 })}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {isLocked && (
                  <span className="opacity-60">
                    {isOffline && item.offlineRestricted ? <WifiOff size={14} className="text-red-600" /> : <Lock size={14} />}
                  </span>
                )}
                {!isGuest && !isOffline && item.id === 'CityHall' && unreadMessages > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full border-2 border-white shadow-lg leading-none">{unreadMessages}</span>}
                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${activeSection === item.id ? 'opacity-100 translate-x-1' : ''}`} />
              </button>
            );
          })}
          <div className="h-px bg-black/5 dark:bg-white/5 my-4 mx-2" />
          <button 
            onClick={() => onNavigate('Profile')} 
            className={`w-full group relative flex items-center gap-3.5 p-3 rounded-2xl font-black text-[12px] uppercase tracking-tight transition-all border-b-4 active:translate-y-0.5 active:border-b-2 ${activeSection === 'Profile' ? 'bg-indigo-600 border-indigo-800 text-white translate-x-1 shadow-md' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}`}
          >
             <span className="shrink-0"><User size={18} /></span>
             <span className="flex-1 text-left">My Profile</span>
             {isGuest && <Lock size={14} className="opacity-40" />}
             <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${activeSection === 'Profile' ? 'opacity-100 translate-x-1' : ''}`} />
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          {isOffline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-600 rounded-xl mb-2">
               <WifiOff size={14} />
               <span className="text-[10px] font-black uppercase">Offline</span>
            </div>
          )}
          <button onClick={() => onNavigate('Settings')} className={`w-full flex items-center gap-3.5 p-3 rounded-2xl font-black text-[12px] uppercase tracking-tight transition-all border-b-4 active:translate-y-0.5 active:border-b-2 ${activeSection === 'Settings' ? 'bg-slate-700 border-slate-900 text-white shadow-md' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}`}>
            <span className="shrink-0"><Settings size={18} /></span>
            <span className="flex-1 text-left">System</span>
          </button>
          
          <div className={`mt-4 p-4 rounded-3xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-indigo-50/50'} border-2 border-dashed border-black/5`}>
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-custom text-white font-black flex items-center justify-center italic shadow-sm overflow-hidden border-2 border-white/20">
                  {user.profilePic ? <img src={user.profilePic} alt={user.displayName} className="w-full h-full object-cover" /> : user.displayName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-[10px] uppercase truncate">{user.displayName}</p>
                  <p className="text-[7px] font-black uppercase opacity-40 tracking-widest">{user.title}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
