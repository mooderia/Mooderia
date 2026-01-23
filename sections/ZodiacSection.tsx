
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, BookOpen, Scroll, RefreshCw, Trash2, Info } from 'lucide-react';
import { ZODIACS } from '../constants';
import { getHoroscope } from '../services/geminiService';

interface ZodiacSectionProps {
  isDarkMode: boolean;
}

type ZodiacTab = 'Horoscope' | 'Almanac' | 'LuckyDay';

const LUCKY_PHRASES = [
  "New opportunities are blooming in the metropolis parks today.",
  "Your neural focus is at an all-time high. Channel it wisely.",
  "A surprise synchronicity will clear up a past confusion.",
  "The city lights are aligned to favor your boldest idea.",
  "Financial frequencies are stabilizing; seek a safe sync.",
  "A vibrant encounter awaits at the nearest transit hub.",
  "Quiet self-reflection will unlock a new inner layer today.",
  "Your creative pulse is beating faster than usual.",
  "Kindness to a stranger will echo back tenfold.",
  "A digital breakthrough is coming to your neural circle.",
  "The metropolis energy is yours to command this afternoon.",
  "Rest today; the stars are preparing a major event for tomorrow.",
  "Trust your first signal; it's calibrated perfectly today.",
  "You are the architect of your own urban happiness today.",
  "Synchronize your heart with the city's natural rhythm."
];

const ZodiacSection: React.FC<ZodiacSectionProps> = ({ isDarkMode }) => {
  const [tab, setTab] = useState<ZodiacTab>('Horoscope');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyHoroscopes, setDailyHoroscopes] = useState<Record<string, string>>({});
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const [luckyZodiac, setLuckyZodiac] = useState(ZODIACS[0].name);
  const [luckySeed, setLuckySeed] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mooderia_zodiac_cache');
    if (saved) {
      try {
        const { date, data } = JSON.parse(saved);
        if (date === new Date().toDateString()) {
          setDailyHoroscopes(data);
        } else {
          localStorage.removeItem('mooderia_zodiac_cache');
        }
      } catch (e) {
        localStorage.removeItem('mooderia_zodiac_cache');
      }
    }
  }, []);

  const handleHoroscope = async (sign: string, force = false) => {
    setActiveSign(sign);
    if (dailyHoroscopes[sign] && !force) return;
    
    setIsLoading(true);
    try {
      const res = await getHoroscope(sign);
      const newData = { ...dailyHoroscopes, [sign]: res };
      setDailyHoroscopes(newData);
      localStorage.setItem('mooderia_zodiac_cache', JSON.stringify({
        date: new Date().toDateString(),
        data: newData
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetHoroscopes = () => {
    if (confirm("Erase all cached horoscopes and re-sync with the stars?")) {
      localStorage.removeItem('mooderia_zodiac_cache');
      setDailyHoroscopes({});
      setActiveSign(null);
    }
  };

  const currentLucky = useMemo(() => {
    const today = new Date().toDateString();
    const hashInput = `${luckyZodiac}-${today}-${luckySeed}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = hashInput.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    const colors = [
      { name: "Neon Ruby", hex: "#e21b3c" }, { name: "Metropolis Emerald", hex: "#26890c" },
      { name: "Cyber Blue", hex: "#1368ce" }, { name: "Solar Gold", hex: "#ffa602" },
      { name: "Vibe Purple", hex: "#46178f" }, { name: "Electric Pink", hex: "#ec4899" }
    ];
    return { 
      color: colors[absHash % colors.length], 
      number: (absHash % 99) + 1, 
      phrase: LUCKY_PHRASES[absHash % LUCKY_PHRASES.length] || "Focus on your inner pulse."
    };
  }, [luckyZodiac, luckySeed]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 pb-6 shrink-0 overflow-x-auto no-scrollbar">
        {['Horoscope', 'Almanac', 'LuckyDay'].map((t) => (
          <button key={t} onClick={() => setTab(t as ZodiacTab)} className={`px-8 py-3 rounded-full font-black text-xs transition-all uppercase tracking-tighter border-b-4 ${tab === t ? 'bg-custom border-black/20 text-white shadow-xl translate-y-[-2px]' : isDarkMode ? 'bg-slate-800 border-black text-white/30' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}>
            {t.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div className="flex-1 fading-scrollbar overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {tab === 'Horoscope' && (
            <motion.div key="horoscope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 md:p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-2xl relative`}>
              <div className="absolute top-8 right-8 flex gap-2">
                <button onClick={resetHoroscopes} className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border-2 border-red-600/10" title="Reset Cache"><Trash2 size={20}/></button>
              </div>

              <Star className="mx-auto mb-8 text-[#ffa602] animate-pulse" size={60} />
              <h2 className="text-3xl md:text-5xl font-black text-center mb-8 uppercase italic tracking-tighter">Cosmic Forecast</h2>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-12">
                {ZODIACS.map(z => (
                  <button 
                    key={z.name} 
                    onClick={() => handleHoroscope(z.name)} 
                    className={`p-4 rounded-3xl border-4 font-black transition-all flex flex-col items-center gap-1 ${activeSign === z.name ? 'border-custom bg-custom/10 scale-105' : dailyHoroscopes[z.name] ? 'opacity-80 border-custom/40 bg-custom/5' : isDarkMode ? 'bg-slate-800 border-white/5 opacity-50' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                  >
                    <span className="text-3xl md:text-4xl">{z.symbol}</span>
                    <span className="text-[9px] uppercase">{z.name}</span>
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {activeSign && dailyHoroscopes[activeSign] && !isLoading && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 md:p-10 rounded-[2.5rem] border-l-[16px] border-custom bg-custom/5 relative overflow-hidden">
                    <h4 className="text-xl md:text-2xl font-black text-custom uppercase italic tracking-widest mb-4">{activeSign} Alignment</h4>
                    <p className="text-sm md:text-xl font-bold leading-relaxed italic opacity-90">"{dailyHoroscopes[activeSign]}"</p>
                    <button onClick={() => handleHoroscope(activeSign!, true)} className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-custom hover:underline"><RefreshCw size={14}/> Force Re-Sync</button>
                  </motion.div>
                )}
                {isLoading && <div className="py-20 text-center font-black uppercase italic opacity-30 animate-pulse tracking-widest">Scanning celestial signals...</div>}
              </AnimatePresence>
            </motion.div>
          )}

          {tab === 'Almanac' && (
            <motion.div key="almanac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center mb-8`}>
                <BookOpen size={60} className="mx-auto mb-6 text-custom" />
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">City Almanac</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {ZODIACS.map(z => (
                  <div key={z.name} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-2xl hover:border-custom transition-all group`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{z.symbol}</span>
                        <div><h3 className="text-2xl font-black uppercase italic tracking-tighter">{z.name}</h3><p className="text-[10px] font-black text-custom uppercase">{z.dates}</p></div>
                      </div>
                      <Scroll className="opacity-10 group-hover:opacity-40 transition-opacity" size={30} />
                    </div>
                    <p className="text-base font-bold opacity-70 leading-relaxed italic mb-6">"{z.history}"</p>
                    <div className="p-5 bg-black/5 rounded-2xl border-b-4 border-custom/20"><p className="text-[8px] font-black uppercase opacity-30 mb-2">Core Philosophy</p><p className="text-xs font-black italic">{z.description}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'LuckyDay' && (
            <motion.div key="lucky" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center relative`}>
              <div className="absolute top-8 right-8">
                <button onClick={() => setLuckySeed(s => s + 1)} className="p-3 bg-black/5 hover:bg-black/10 rounded-xl text-custom transition-all" title="Re-Roll Luck"><RefreshCw size={20}/></button>
              </div>

              <Zap className="mx-auto mb-10" size={60} style={{ color: currentLucky.color.hex }} />
              <h2 className="text-3xl md:text-5xl font-black mb-12 uppercase italic tracking-tighter">Lucky Sync</h2>
              <div className="flex justify-center mb-12">
                <select value={luckyZodiac} onChange={(e) => setLuckyZodiac(e.target.value)} className={`w-full max-w-sm p-5 rounded-3xl font-black border-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'} text-xl outline-none focus:border-custom appearance-none text-center shadow-inner`}>
                  {ZODIACS.map(z => <option key={z.name} value={z.name}>{z.symbol} {z.name.toUpperCase()}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between" style={{ backgroundColor: currentLucky.color.hex }}>
                  <p className="text-xs font-black uppercase opacity-70 tracking-widest">Lucky Color</p>
                  <p className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">{currentLucky.color.name}</p>
                </div>
                
                <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-4 shadow-xl flex items-center justify-between`} style={{ borderColor: currentLucky.color.hex }}>
                  <p className="text-xs font-black uppercase opacity-60 tracking-widest" style={{ color: currentLucky.color.hex }}>Lucky Number</p>
                  <p className="text-5xl md:text-7xl font-black italic" style={{ color: currentLucky.color.hex }}>{currentLucky.number}</p>
                </div>
                
                <div className={`p-10 rounded-[2.5rem] shadow-xl flex items-center justify-center border-4 border-black/5 min-h-[160px] relative transition-all ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 opacity-20"><Info size={16}/></div>
                  <p className={`text-lg md:text-2xl font-black italic leading-tight px-6 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>"{currentLucky.phrase}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ZodiacSection;
