
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Zap, BookOpen, Scroll, Sparkles, Lock, Unlock } from 'lucide-react';
import { ZODIACS, getZodiacFromDate } from '../constants';
import { getHoroscope, getLovePrediction } from '../services/geminiService';

interface ZodiacSectionProps {
  isDarkMode: boolean;
}

type ZodiacTab = 'LoveMatcher' | 'Horoscope' | 'Almanac' | 'LuckyDay';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ZodiacSection: React.FC<ZodiacSectionProps> = ({ isDarkMode }) => {
  const [tab, setTab] = useState<ZodiacTab>('LoveMatcher');
  const [m1, setM1] = useState(1);
  const [d1, setD1] = useState(1);
  const [m2, setM2] = useState(1);
  const [d2, setD2] = useState(1);
  const [matchResult, setMatchResult] = useState<{ percentage: number, reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyHoroscopes, setDailyHoroscopes] = useState<Record<string, string>>({});
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const [luckyZodiac, setLuckyZodiac] = useState(ZODIACS[0].name);

  // Daily Lock Persistence for each Sign
  useEffect(() => {
    const saved = localStorage.getItem('mooderia_multi_horoscopes');
    if (saved) {
      const { date, data } = JSON.parse(saved);
      if (date === new Date().toDateString()) {
        setDailyHoroscopes(data);
      } else {
        localStorage.removeItem('mooderia_multi_horoscopes');
      }
    }
  }, []);

  const handleMatch = async () => {
    setIsLoading(true);
    const sign1 = getZodiacFromDate(m1, d1);
    const sign2 = getZodiacFromDate(m2, d2);
    try {
      const result = await getLovePrediction(sign1, sign2);
      setMatchResult(result);
    } catch (e) {
      setMatchResult({ percentage: 75, reason: "Cosmic interference detected, but the connection is inherently strong." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHoroscope = async (sign: string) => {
    setActiveSign(sign);
    if (dailyHoroscopes[sign]) return; // Already fetched for today
    
    setIsLoading(true);
    try {
      const res = await getHoroscope(sign);
      const text = res || 'Consulting stars...';
      const newData = { ...dailyHoroscopes, [sign]: text };
      setDailyHoroscopes(newData);
      localStorage.setItem('mooderia_multi_horoscopes', JSON.stringify({
        date: new Date().toDateString(),
        data: newData
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLucky = useMemo(() => {
    const today = new Date().toDateString();
    const seed = luckyZodiac + today;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const colors = [
      { name: "Ruby Red", hex: "#e21b3c" },
      { name: "Emerald Green", hex: "#26890c" },
      { name: "Azure Blue", hex: "#1368ce" },
      { name: "Goldenrod", hex: "#ffa602" },
      { name: "Metropolis Purple", hex: "#46178f" }
    ];
    return { 
      color: colors[Math.abs(hash) % colors.length], 
      number: (Math.abs(hash) % 99) + 1, 
      phrase: ["Vibrant opportunities await in social districts.", "Deep focus on self-care will yield rewards.", "Creative resonance is peaking in your sector.", "A sudden alignment may bring a lost connection."][Math.abs(hash) % 4]
    };
  }, [luckyZodiac]);

  const DayPicker = ({ val, setVal }: { val: number, setVal: (v: number) => void }) => (
    <select value={val} onChange={(e) => setVal(parseInt(e.target.value))} className={`flex-1 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'} p-3 md:p-4 rounded-2xl font-black border-4 border-black/5 text-[10px] md:text-xs outline-none focus:border-custom appearance-none text-center`}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
    </select>
  );

  const MonthPicker = ({ val, setVal }: { val: number, setVal: (v: number) => void }) => (
    <select value={val} onChange={(e) => setVal(parseInt(e.target.value))} className={`flex-1 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'} p-3 md:p-4 rounded-2xl font-black border-4 border-black/5 text-[10px] md:text-xs outline-none focus:border-custom appearance-none text-center`}>
      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
    </select>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 pb-6 shrink-0 overflow-x-auto no-scrollbar">
        {['LoveMatcher', 'Horoscope', 'Almanac', 'LuckyDay'].map((t) => (
          <button key={t} onClick={() => setTab(t as ZodiacTab)} className={`px-6 md:px-8 py-3 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap uppercase tracking-tighter border-b-4 ${tab === t ? 'bg-custom border-black/20 text-white shadow-xl translate-y-[-2px]' : isDarkMode ? 'bg-[#1a1a1a] border-black text-white/30' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}>
            {t.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div className="flex-1 fading-scrollbar overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {tab === 'LoveMatcher' && (
            <motion.div key="love" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center`}>
              <Heart className="mx-auto mb-6 md:mb-8 text-[#e21b3c] animate-pulse" size={60} />
              <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-12 uppercase italic tracking-tighter">Love Matcher</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-10 mb-8 md:mb-12 max-w-3xl mx-auto">
                <div className="space-y-3"><p className="text-[8px] md:text-[10px] font-black uppercase opacity-30 tracking-[0.4em]">Citizen Alpha</p><div className="flex gap-2"><MonthPicker val={m1} setVal={setM1} /><DayPicker val={d1} setVal={setD1} /></div></div>
                <div className="text-4xl md:text-6xl font-black text-[#e21b3c] select-none">&hearts;</div>
                <div className="space-y-3"><p className="text-[8px] md:text-[10px] font-black uppercase opacity-30 tracking-[0.4em]">Citizen Beta</p><div className="flex gap-2"><MonthPicker val={m2} setVal={setM2} /><DayPicker val={d2} setVal={setD2} /></div></div>
              </div>
              <button disabled={isLoading} onClick={handleMatch} className="kahoot-button-custom px-10 md:px-16 py-4 md:py-6 rounded-3xl text-white font-black text-lg md:text-2xl uppercase shadow-xl">{isLoading ? 'CALCULATING...' : 'REVEAL FREQUENCY'}</button>
              {matchResult && (
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="mt-8 md:mt-12 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-8 border-custom/20 bg-custom/5 max-w-xl mx-auto overflow-hidden">
                  <p className="text-5xl md:text-8xl font-black text-custom mb-4 italic tracking-tighter">{matchResult.percentage}%</p>
                  <p className="text-sm md:text-lg font-bold opacity-80 leading-relaxed italic line-clamp-4">"{matchResult.reason}"</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === 'Horoscope' && (
            <motion.div key="horoscope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} border-4 border-black/5 shadow-2xl`}>
              <Star className="mx-auto mb-8 text-[#ffa602]" size={60} />
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6 uppercase italic tracking-tighter">Cosmic Forecast</h2>
              
              <div className="mb-10 text-center">
                <p className="text-sm font-bold opacity-40 uppercase tracking-tight">Synchronize with any constellation. Each lock resets at midnight.</p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 md:gap-3 mb-10 md:mb-12">
                {ZODIACS.map(z => {
                  const isLocked = !!dailyHoroscopes[z.name];
                  return (
                    <button 
                      key={z.name} 
                      disabled={isLoading}
                      onClick={() => handleHoroscope(z.name)} 
                      className={`p-3 md:p-4 rounded-2xl md:rounded-3xl border-4 font-black transition-all flex flex-col items-center gap-1 md:gap-2 ${activeSign === z.name ? 'border-custom bg-custom/10 scale-105 shadow-xl opacity-100' : isLocked ? 'opacity-80 grayscale-0 border-custom/40 bg-custom/5' : isDarkMode ? 'bg-[#1a1a1a] border-white/5 opacity-50' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                    >
                      <div className="relative">
                        <span className="text-2xl md:text-4xl">{z.symbol}</span>
                        {isLocked && <div className="absolute -top-1 -right-1 text-custom"><Unlock size={10} /></div>}
                      </div>
                      <span className="text-[8px] md:text-[10px] uppercase truncate w-full text-center">{z.name}</span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center flex flex-col items-center gap-4">
                    <Sparkles className="text-custom animate-spin" size={48} />
                    <p className="text-lg font-black uppercase tracking-widest italic opacity-40">Synchronizing Constellations...</p>
                  </motion.div>
                )}
                {activeSign && dailyHoroscopes[activeSign] && !isLoading && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-l-[16px] border-custom bg-custom/5 relative overflow-hidden">
                    <div className="absolute top-4 right-6 opacity-20"><Unlock size={32} className="text-custom" /></div>
                    <h4 className="text-lg md:text-2xl font-black text-custom uppercase italic mb-3 md:mb-4 tracking-widest">{activeSign} Alignment</h4>
                    <p className="text-sm md:text-xl font-bold leading-relaxed italic opacity-90">"{dailyHoroscopes[activeSign]}"</p>
                    <p className="mt-8 text-[9px] font-black uppercase opacity-20 tracking-widest">This sign's frequency is captured for the day.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {tab === 'Almanac' && (
            <motion.div key="almanac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className={`p-8 md:p-10 rounded-[3rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center mb-8`}>
                 <BookOpen size={60} className="mx-auto mb-4 md:mb-6 text-custom" />
                 <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">City Almanac</h2>
                 <p className="text-[10px] md:text-xs font-black opacity-40 uppercase tracking-[0.4em] mt-2">Archives of the Ancient Metropolis</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20">
                  {ZODIACS.map(z => (
                    <div key={z.name} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} border-4 border-black/5 shadow-2xl group hover:border-custom transition-all`}>
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                         <div className="flex items-center gap-3 md:gap-5">
                            <span className="text-4xl md:text-6xl">{z.symbol}</span>
                            <div><h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight">{z.name}</h3><p className="text-[8px] md:text-[10px] font-black text-custom uppercase">{z.dates}</p></div>
                         </div>
                         <Scroll className="opacity-10 group-hover:opacity-40 transition-opacity" size={30} />
                      </div>
                      <p className="text-sm md:text-lg font-bold opacity-70 leading-relaxed italic mb-4 md:mb-6">"{z.history}"</p>
                      <div className="p-4 md:p-6 bg-black/5 rounded-[1.5rem] md:rounded-[2rem] border-b-4 border-custom/20"><p className="text-[8px] md:text-[9px] font-black uppercase opacity-30 mb-2 tracking-widest">Philosophy</p><p className="text-xs md:text-sm font-black italic">{z.description}</p></div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {tab === 'LuckyDay' && (
            <motion.div key="lucky" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] ${isDarkMode ? 'bg-[#111111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center`}>
              <Zap className="mx-auto mb-8 md:mb-10 shrink-0" size={60} style={{ color: currentLucky.color.hex }} />
              <h2 className="text-3xl md:text-5xl font-black mb-10 md:mb-14 uppercase italic tracking-tighter">Lucky Sync</h2>
              <div className="flex justify-center mb-10 md:mb-14">
                <select value={luckyZodiac} onChange={(e) => setLuckyZodiac(e.target.value)} className={`w-full max-w-sm p-4 md:p-6 rounded-2xl md:rounded-3xl font-black border-4 dark:bg-slate-800 text-lg md:text-2xl outline-none focus:border-custom appearance-none text-center shadow-inner`}>
                  {ZODIACS.map(z => <option key={z.name} value={z.name}>{z.symbol} {z.name.toUpperCase()}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                <div className="p-6 md:p-8 rounded-[2rem] text-white shadow-xl border-b-[8px] border-black/20 flex items-center justify-between" style={{ backgroundColor: currentLucky.color.hex }}>
                  <p className="text-[10px] md:text-xs font-black uppercase opacity-70 tracking-[0.3em]">Lucky Color</p>
                  <p className="text-xl md:text-4xl font-black italic tracking-tighter uppercase">{currentLucky.color.name}</p>
                </div>
                
                <div className={`p-6 md:p-8 rounded-[2rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-4 shadow-xl flex items-center justify-between`} style={{ borderColor: currentLucky.color.hex }}>
                  <p className="text-[10px] md:text-xs font-black uppercase opacity-60 tracking-[0.3em]" style={{ color: currentLucky.color.hex }}>Lucky Number</p>
                  <p className="text-4xl md:text-7xl font-black italic tracking-tighter" style={{ color: currentLucky.color.hex }}>{currentLucky.number}</p>
                </div>
                
                <div className="p-8 md:p-10 rounded-[2rem] shadow-xl flex items-center justify-center border-4 border-black/5 bg-black/5 min-h-[120px]">
                  <p className="text-sm md:text-xl font-black italic leading-tight">
                    "{currentLucky.phrase}"
                  </p>
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
