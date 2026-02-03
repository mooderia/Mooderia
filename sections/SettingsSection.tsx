import React, { useState } from 'react';
import { Moon, Sun, Globe, LogOut, ChevronRight, Copy, QrCode, Shield, Check } from 'lucide-react';
import { generateTransferCode } from '../services/supabaseService'; 
import { User } from '../types';
import { COUNTRIES } from '../constants';

interface SettingsSectionProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'English' | 'Filipino';
  onToggleLanguage: () => void;
  onLogout: () => void;
  user: User;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ isDarkMode, onToggleDarkMode, language, onToggleLanguage, onLogout, user }) => {
  const [showFullData, setShowFullData] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRevealData = () => {
    if (!user) return;
    const code = generateTransferCode(user);
    setTransferCode(code);
    setShowFullData(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const flagUrl = `https://flagcdn.com/w320/${user.country || 'un'}.png`;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Citizen Terminal</h2>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Identity & Configuration</p>
      </div>

      {/* PASSPORT CARD */}
      <div className={`relative w-full max-w-xl mx-auto aspect-[1.58] rounded-[2rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 border-4 ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        {/* Holographic Background with FULL FLAG WATERMARK */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
           {/* THE FULL FLAG BACKGROUND */}
           <div className="absolute inset-0 opacity-10 pointer-events-none grayscale-[20%]">
               <img src={flagUrl} className="w-full h-full object-cover" alt="Country Flag" />
           </div>
           
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(70,23,143,1)_0%,_transparent_70%)]" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        {/* Passport Content */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
           {/* Header */}
           <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                 <Shield size={24} className="text-indigo-600" />
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Mooderia</h3>
                    <p className="text-[8px] font-black uppercase opacity-50 tracking-[0.2em]">Official Metropolis Passport</p>
                 </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 overflow-hidden bg-indigo-100">
                 {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-black">{user.displayName[0]}</div>}
              </div>
           </div>

           {/* Main Data */}
           <div className="flex gap-6 mt-4">
              <div className="flex-1 space-y-4">
                 <div>
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Citizen Name</p>
                    <p className="text-xl md:text-2xl font-black italic uppercase leading-none truncate drop-shadow-sm">{user.displayName}</p>
                 </div>
                 <div className="flex gap-4">
                    <div>
                        <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Role</p>
                        <p className="text-sm font-black uppercase leading-none text-indigo-600">{user.title}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Origin</p>
                        <p className="text-sm font-black uppercase leading-none text-indigo-600">{COUNTRIES.find(c => c.code === user.country)?.name || 'Unknown'}</p>
                    </div>
                 </div>
                 <div>
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Metropolis ID</p>
                    <div className="flex items-center gap-2">
                       <p className="text-3xl md:text-4xl font-mono font-black tracking-widest text-indigo-600">{user.citizenCode}</p>
                       <button onClick={() => copyToClipboard(user.citizenCode)} className="opacity-50 hover:opacity-100"><Copy size={16}/></button>
                    </div>
                 </div>
              </div>
              <div className="hidden md:block w-24 h-24 bg-white/80 p-2 rounded-xl self-end shadow-lg backdrop-blur-sm">
                 <QrCode className="w-full h-full opacity-80" />
              </div>
           </div>

           {/* Footer */}
           <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-end">
              <p className="text-[8px] font-mono opacity-40">MDR-882-991-X</p>
              <button onClick={handleRevealData} className="text-[9px] font-black uppercase text-indigo-500 hover:underline">Export Full Data</button>
           </div>
        </div>
      </div>
      
      {/* Full Data String Modal */}
      {showFullData && (
         <div className="p-6 rounded-[2rem] bg-indigo-600/5 border-2 border-indigo-600/10">
             <div className="flex justify-between items-center mb-4">
                 <h4 className="font-black italic uppercase text-indigo-600 text-xs">Full Data String (For New Device Login)</h4>
                 <button onClick={() => setShowFullData(false)} className="text-[10px] font-black uppercase opacity-40">Hide</button>
             </div>
             <p className="text-[9px] opacity-60 mb-2">Copy this entire code and paste it into the "Recover Identity" section on a new device.</p>
             <div className="p-3 bg-black/10 rounded-xl break-all text-[10px] font-mono h-24 overflow-y-auto select-all mb-2">
                 {transferCode}
             </div>
             <button onClick={() => copyToClipboard(transferCode)} className={`w-full py-3 ${copied ? 'bg-green-500' : 'bg-indigo-600'} text-white rounded-xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2`}>
                 {copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied!' : 'Copy Code'}
             </button>
         </div>
      )}

      {/* Settings Grid */}
      <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-2xl space-y-4`}>
        <button 
          onClick={onToggleDarkMode}
          className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 shadow-sm'}`}>
              {isDarkMode ? <Moon size={24}/> : <Sun size={24}/>}
            </div>
            <div className="text-left">
               <p className="font-black italic uppercase text-sm">City Lighting</p>
               <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
            </div>
          </div>
          <ChevronRight size={20} className="opacity-20" />
        </button>

        <button 
          onClick={onToggleLanguage}
          className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-green-600 text-white' : 'bg-white text-green-600 shadow-sm'}`}>
              <Globe size={24}/>
            </div>
            <div className="text-left">
               <p className="font-black italic uppercase text-sm">Citizen Dialect</p>
               <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Current: {language}</p>
            </div>
          </div>
          <span className="font-black text-xs uppercase opacity-40">{language === 'English' ? 'EN' : 'PH'}</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-6 bg-red-600/10 text-red-600 rounded-3xl font-black uppercase text-sm border-2 border-red-600/10 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
        >
          <LogOut size={20} />
          <span>Terminate Session</span>
        </button>
      </div>

      <div className="text-center opacity-20 font-black italic tracking-widest text-[10px] py-10">
        MOODERIA METROPOLIS v8.2.0
      </div>
    </div>
  );
};

export default SettingsSection;