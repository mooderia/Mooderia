
import React, { useState, useEffect } from 'react';
import { Home, Smile, Building2, Mail, User as UserIcon, Settings, Wifi, WifiOff } from 'lucide-react';
import { Section, User } from '../types';
import { t } from '../constants';
import { db } from '../services/firebaseConfig';
import { ref, onValue } from 'firebase/database';

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  isDarkMode: boolean;
  user: User;
  unreadMails: number;
  language: 'English' | 'Filipino';
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isDarkMode, user, unreadMails, language }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      setIsOnline(snap.val() === true);
    });
  }, []);

  const items: { id: Section, icon: any, labelKey: string, color: string }[] = [
    { id: 'Home', icon: Home, labelKey: 'home', color: 'bg-indigo-600' },
    { id: 'Mood', icon: Smile, labelKey: 'mood', color: 'bg-green-600' },
    { id: 'CityHall', icon: Building2, labelKey: 'cityHall', color: 'bg-red-600' },
    { id: 'Mails', icon: Mail, labelKey: 'mails', color: 'bg-orange-500' },
    { id: 'Profile', icon: UserIcon, labelKey: 'profile', color: 'bg-blue-600' },
    { id: 'Settings', icon: Settings, labelKey: 'settings', color: 'bg-slate-600' },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} border-b`}>
        <div className="flex items-center gap-2">
           <h1 className="font-black italic text-xl tracking-tighter text-indigo-600 uppercase">Mooderia</h1>
           <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`} />
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
           {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500" />}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around px-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} border-t shadow-2xl overflow-x-auto no-scrollbar`}>
        {items.map(item => (
          <button 
            key={item.id} 
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 transition-all min-w-[50px] ${activeSection === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400 opacity-60'}`}
          >
            <item.icon size={18} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{t(item.labelKey as any, language)}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 h-screen sticky top-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} border-r shadow-lg p-6`}>
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-indigo-600 uppercase">Mooderia</h1>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Metropolis Hub</p>
          </div>
          <div title={isOnline ? "Cloud Sync Active" : "Local-Only Mode"} className={`mt-2 p-1.5 rounded-lg border ${isOnline ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500'}`}>
             {isOnline ? <Wifi size={14}/> : <WifiOff size={14}/>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pb-10">
          {items.map(item => (
            <button 
              key={item.id} 
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center gap-4 p-4 rounded-2xl font-black text-sm uppercase transition-all ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-black/5 text-slate-500'}`}
            >
              <item.icon size={20} className={activeSection === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
              <span>{t(item.labelKey as any, language)}</span>
              {item.id === 'Mails' && unreadMails > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMails}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={`mt-auto p-4 rounded-3xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-indigo-500 shrink-0">
             {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-black">{user.displayName[0]}</div>}
          </div>
          <div className="min-w-0">
            <p className="font-black text-xs uppercase truncate">{user.displayName}</p>
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest truncate">{user.title}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
