
import React, { useMemo } from 'react';
import { User } from '../types';
import { WISDOM_OF_MOODERIA, t } from '../constants';
import { Sparkles, Building2, Flame } from 'lucide-react';

interface HomeSectionProps {
  user: User;
  isDarkMode: boolean;
  language: 'English' | 'Filipino';
}

const HomeSection: React.FC<HomeSectionProps> = ({ user, isDarkMode, language }) => {
  const dailyWisdom = useMemo(() => {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    return WISDOM_OF_MOODERIA[seed % WISDOM_OF_MOODERIA.length];
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('welcome', language)}</h2>
          <p className="opacity-40 font-black uppercase tracking-[0.2em] text-xs">Home of the Vibrant Metropolis</p>
        </div>
        <div className="bg-orange-500 text-white px-6 py-4 rounded-[2rem] shadow-xl flex items-center gap-3 border-b-8 border-orange-700">
          <Flame size={28} className="animate-pulse" />
          <div>
            <p className="text-2xl font-black leading-none">{user.moodStreak}</p>
            <p className="text-[10px] font-black uppercase opacity-60">{t('streak', language)}</p>
          </div>
        </div>
      </div>

      <div className={`p-10 md:p-16 rounded-[4rem] ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-black/5'} border-4 shadow-2xl relative overflow-hidden`}>
        <Building2 className="absolute -bottom-10 -right-10 text-indigo-500/10" size={300} />
        <div className="relative z-10 space-y-6">
          <div className="bg-indigo-600 text-white w-fit px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Metropolis Guide</div>
          <h3 className="text-3xl md:text-5xl font-black italic leading-tight uppercase tracking-tighter">Enter Mooderia, the city where your emotions shape the skyline.</h3>
          <p className="text-base md:text-xl font-bold opacity-70 leading-relaxed max-w-2xl">
            In this vibrant metropolis, your moods are tracked, your zodiac insights guide your path, and your loyal mood pet grows with your positivity. Stay synchronized, stay inspired.
          </p>
        </div>
      </div>

      <div className={`p-10 rounded-[3rem] border-l-[16px] border-yellow-500 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} shadow-2xl relative group overflow-hidden`}>
        <Sparkles className="absolute top-6 right-6 text-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Wisdom of Mooderia</p>
        <p className="italic font-bold text-2xl md:text-4xl leading-snug">"{dailyWisdom}"</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Mood Logs', val: user.moodHistory.length, color: 'text-green-500' },
          { label: 'Tasks Slated', val: user.schedule.length, color: 'text-blue-500' },
          { label: t('coins', language), val: user.moodCoins, color: 'text-yellow-500' }
        ].map(stat => (
          <div key={stat.label} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
             <p className={`text-4xl font-black italic ${stat.color}`}>{stat.val}</p>
             <p className="text-[10px] font-black uppercase opacity-30 mt-2 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeSection;
