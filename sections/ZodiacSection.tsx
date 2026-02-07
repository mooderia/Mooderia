import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZODIAC_SIGNS } from '../constants';
import { Star, X, Info } from 'lucide-react';

interface ZodiacSectionProps {
  isDarkMode: boolean;
}

const ZodiacSection: React.FC<ZodiacSectionProps> = ({ isDarkMode }) => {
  const [selectedSign, setSelectedSign] = useState<typeof ZODIAC_SIGNS[0] | null>(null);

  const colors = [
    'kahoot-button-red',
    'kahoot-button-blue',
    'kahoot-button-yellow',
    'kahoot-button-green'
  ];

  return (
    <div className="h-full pb-20 relative">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zodiac Academy</h2>
          <p className="opacity-40 font-black uppercase tracking-[0.2em] text-xs mt-2">Decode the stars</p>
        </div>
        <div className="px-6 py-3 bg-yellow-400 text-yellow-900 rounded-[2rem] font-black uppercase text-xs shadow-xl flex items-center gap-2">
            <Star size={18} fill="currentColor"/> Learning Mode
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {ZODIAC_SIGNS.map((sign, index) => (
          <motion.button
            key={sign.name}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedSign(sign)}
            className={`${colors[index % 4]} p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-transform group`}
          >
             <span className="text-6xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">{sign.icon}</span>
             <div className="text-white text-center">
                <h3 className="text-xl font-black uppercase italic tracking-wider">{sign.name}</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase">{sign.date}</p>
             </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedSign && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div 
               layoutId={selectedSign.name}
               className={`w-full max-w-lg ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-slate-900'} p-10 rounded-[3rem] shadow-2xl relative border-[12px] border-black/5 flex flex-col items-center text-center`}
             >
                <button onClick={() => setSelectedSign(null)} className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X size={24}/></button>
                
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-8xl mb-6 shadow-xl border-4 border-white/20">
                    {selectedSign.icon}
                </div>

                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{selectedSign.name}</h2>
                <span className="px-4 py-1 bg-black/5 rounded-full text-xs font-black uppercase tracking-widest opacity-60 mb-8">{selectedSign.date}</span>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                   <div className="p-6 rounded-3xl bg-red-100 text-red-800">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Element</p>
                      <p className="text-xl font-black uppercase">{selectedSign.element}</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-blue-100 text-blue-800">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Cosmic Trait</p>
                      <p className="text-sm font-black uppercase leading-tight">{selectedSign.trait}</p>
                   </div>
                </div>

                <div className="bg-indigo-50 dark:bg-white/5 p-6 rounded-3xl w-full text-left flex items-start gap-4">
                    <Info className="shrink-0 text-indigo-500" />
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Did you know?</p>
                        <p className="text-sm font-bold opacity-80 italic">People born under {selectedSign.name} are known for being true leaders of the metropolis, often finding success in creative or analytical fields depending on their moon phase.</p>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZodiacSection;