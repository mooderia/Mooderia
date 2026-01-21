
import React, { useMemo } from 'react';
import { User, Post } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Award, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { STREAK_BADGES, DAILY_WISDOM } from '../constants';

interface HomeSectionProps {
  user: User;
  posts: Post[];
  isDarkMode: boolean;
}

const HomeSection: React.FC<HomeSectionProps> = ({ user, posts, isDarkMode }) => {
  const currentMood = user.moodHistory?.[user.moodHistory.length - 1]?.mood || 'Not set';
  const earnedBadges = STREAK_BADGES.filter(b => user.moodStreak >= b.threshold);
  
  const todayWisdom = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return DAILY_WISDOM[seed % DAILY_WISDOM.length];
  }, []);

  const chartData = useMemo(() => {
    if (!user.moodHistory || user.moodHistory.length === 0) return [{ name: 'New', score: 0 }];
    return user.moodHistory.slice(-7).map((entry, idx) => ({ name: `T${idx + 1}`, score: entry.score }));
  }, [user.moodHistory]);

  const happiness = useMemo(() => {
    if (!user.moodHistory || user.moodHistory.length === 0) return 0;
    const recent = user.moodHistory.slice(-5);
    return Math.round(recent.reduce((acc, curr) => acc + curr.score, 0) / recent.length);
  }, [user.moodHistory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome, {user.displayName}!</h2>
          <p className="opacity-40 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mt-2">Citizenship Tier: {user.title}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
          <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#ffa602] text-white font-black shadow-xl streak-glow">
            <Flame className="animate-pulse" size={24} />
            <span className="uppercase text-lg">{user.moodStreak || 0} Day Streak</span>
          </div>
          <div className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-4 font-black ${isDarkMode ? 'border-purple-400 text-purple-400' : 'border-[#46178f] text-[#46178f]'}`}>
            <span className="opacity-50 uppercase text-xs mr-1">Status:</span>
            <span className="uppercase italic text-lg">{currentMood}</span>
          </div>
        </div>
      </div>

      {earnedBadges.length > 0 && (
        <div className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl border-4 border-green-400/30 overflow-x-auto no-scrollbar`}>
           <div className="flex items-center gap-6">
              <ShieldCheck className="text-green-500 shrink-0" size={40} />
              <div className="flex gap-6 min-w-max">
                 {earnedBadges.map(badge => (
                   <div key={badge.id} className="flex flex-col items-center justify-center bg-green-500/10 p-4 rounded-[2rem] border-2 border-green-500/20 w-24">
                      <span className="text-4xl mb-2">{badge.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">{badge.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl border-b-[12px] border-blue-500/10`}>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Metropolis Following</p>
          <p className="text-5xl font-black text-[#1368ce] italic">{user.following.length}</p>
        </div>
        <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl border-b-[12px] border-green-500/10`}>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Follower Count</p>
          <p className="text-5xl font-black text-[#26890c] italic">{user.followers.length}</p>
        </div>
        <div className={`col-span-2 md:col-span-1 p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl border-b-[12px] border-red-500/10`}>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Harmony Level</p>
          <div className="flex items-center gap-3"><p className="text-5xl font-black text-[#e21b3c] italic">{happiness}%</p><Sparkles className="text-red-500 opacity-30" /></div>
        </div>
      </div>

      <div className={`p-8 rounded-[4rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl overflow-hidden border-4 border-black/5`}>
        <div className="flex justify-between items-center mb-10 px-4">
          <h3 className="text-2xl font-black uppercase italic flex items-center gap-4"><TrendingUp className="text-custom" size={32} /> Emotional Spectrum</h3>
          <div className="bg-custom/10 px-6 py-2 rounded-full border-2 border-custom/20"><span className="text-custom font-black text-sm uppercase tracking-widest">Latest Sync: {chartData[chartData.length-1].score}</span></div>
        </div>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={isDarkMode ? "#222" : "#eee"} />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#111' : '#fff', borderRadius: '24px', border: '4px solid rgba(0,0,0,0.05)', fontWeight: '900', fontSize: '14px' }} />
              <Area type="step" dataKey="score" stroke="var(--theme-color)" fill="var(--theme-color)" fillOpacity={0.1} strokeWidth={8} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className={`p-10 rounded-[3.5rem] border-l-[16px] border-[#ffa602] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} shadow-2xl relative overflow-hidden group`}>
        <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><Award size={280} /></div>
        <h4 className="font-black text-2xl mb-6 uppercase italic tracking-tighter opacity-40">Frequency of the Day</h4>
        <p className="italic font-bold text-2xl md:text-4xl leading-snug opacity-90 relative z-10">"{todayWisdom}"</p>
      </div>
    </div>
  );
};

export default HomeSection;
