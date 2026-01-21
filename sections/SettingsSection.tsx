
import React from 'react';
import { LogOut, Moon, Sun, UserMinus, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface SettingsSectionProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  user: User;
  onUnblock: (username: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  onLogout, 
  user,
  onUnblock
}) => {
  return (
    <div className="space-y-6 pb-20">
      <h2 className={`text-4xl font-black italic mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CITY SETTINGS</h2>

      <div className={`p-8 rounded-3xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border-2 space-y-8 shadow-xl`}>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl">
          <div className="flex items-center gap-4 text-slate-900 dark:text-white">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-500">
              {isDarkMode ? <Moon size={24}/> : <Sun size={24}/>}
            </div>
            <div>
              <p className="font-bold">Dark Mode</p>
              <p className="text-xs opacity-50 font-bold uppercase">Toggle city lighting</p>
            </div>
          </div>
          <button 
            onClick={onToggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-all ${isDarkMode ? 'bg-[#26890c]' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Blocked Accounts Section */}
        <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <ShieldAlert className="text-red-500" />
            <h3 className="font-black italic uppercase">People you don't want to see</h3>
          </div>
          
          <div className="space-y-3">
            {user.blockedUsers.length === 0 ? (
              <p className="text-sm opacity-40 font-bold italic text-slate-900 dark:text-white">You haven't blocked anyone yet. Peace prevails!</p>
            ) : (
              user.blockedUsers.map(blocked => (
                <div key={blocked} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <span className="font-bold text-slate-900 dark:text-white">@{blocked}</span>
                  <button 
                    onClick={() => onUnblock(blocked)}
                    className="flex items-center gap-1 text-xs font-black text-blue-500 uppercase hover:underline"
                  >
                    <UserMinus size={14} /> Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-slate-700 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full p-4 rounded-2xl bg-[#e21b3c] hover:bg-[#b31530] text-white font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <LogOut size={20} /> LOG OUT
          </button>
        </div>

      </div>

      <div className="text-center opacity-30 font-black italic tracking-widest text-xs py-8 text-slate-900 dark:text-white">
        MOODERIA VERSION 3.1.0 • INFRASTRUCTURE VERIFIED
      </div>
    </div>
  );
};

export default SettingsSection;
