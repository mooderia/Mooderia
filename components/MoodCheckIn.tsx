
import React from 'react';
import { motion } from 'framer-motion';
import { Mood } from '../types';

interface MoodCheckInProps {
  onSubmit: (mood: Mood) => void;
  isDarkMode: boolean;
}

const MoodCheckIn: React.FC<MoodCheckInProps> = ({ onSubmit, isDarkMode }) => {
  const moods: { label: Mood, emoji: string, color: string }[] = [
    { label: 'Wonderful', emoji: '✨', color: 'bg-indigo-400' },
    { label: 'Excited', emoji: '🤩', color: 'bg-pink-400' },
    { label: 'Happy', emoji: '😊', color: 'bg-yellow-400' },
    { label: 'Normal', emoji: '😐', color: 'bg-green-400' },
    { label: 'Tired', emoji: '😴', color: 'bg-purple-400' },
    { label: 'Angry', emoji: '😡', color: 'bg-orange-500' },
    { label: 'Flaming', emoji: '🔥', color: 'bg-red-600' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-xl p-10 rounded-[3rem] text-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-4 border-white/20 shadow-2xl`}
      >
        <h2 className="text-4xl font-black mb-4 italic uppercase tracking-tighter">Emotional Sync</h2>
        <p className="mb-10 opacity-70 font-bold uppercase tracking-widest text-xs">Authorize today's mood frequency</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moods.map(m => (
            <button
              key={m.label}
              onClick={() => onSubmit(m.label)}
              className={`kahoot-button group p-4 rounded-3xl flex flex-col items-center gap-2 border-b-[6px] ${m.color} text-white transition-all hover:scale-105 active:scale-95`}
            >
              <span className="text-4xl group-hover:animate-bounce">{m.emoji}</span>
              <span className="font-black text-[10px] uppercase tracking-tighter">{m.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MoodCheckIn;
