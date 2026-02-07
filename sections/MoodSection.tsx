
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mood, DiaryEntry } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Book, Brain, Sparkles, Plus, X, Trash2, HeartPulse, Zap } from 'lucide-react';
import MoodPetSection from './MoodPetSection';
import { t } from '../constants';

interface MoodSectionProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  isDarkMode: boolean;
  language: 'English' | 'Filipino';
  onReward: () => void;
  triggerAnimation: (type: 'express' | 'schedule' | 'routine' | 'diary' | 'alarm', text?: string) => void;
}

const MoodSection: React.FC<MoodSectionProps> = ({ user, onUpdate, isDarkMode, language, onReward, triggerAnimation }) => {
  const [subTab, setSubTab] = useState<'Statistics' | 'Diary' | 'Mood Pet' | 'Scan' | 'Teller'>('Statistics');

  // Diary States
  const [isAddingDiary, setIsAddingDiary] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryMood, setDiaryMood] = useState<Mood>('Normal');

  // Scan States
  const [scanStep, setScanStep] = useState(0);
  const [scanScores, setScanScores] = useState<Record<string, number>>({});
  const [scanResult, setScanResult] = useState<Mood | null>(null);

  // Teller States
  const [fortuneQuestion, setFortuneQuestion] = useState('');
  const [fortuneAnswer, setFortuneAnswer] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);

  // Statistics Data
  const lineData = useMemo(() => {
    return (user.moodHistory || []).slice(-14).map((entry, i) => ({ name: `Day ${i + 1}`, score: entry.score }));
  }, [user.moodHistory]);

  const barData = useMemo(() => {
    const counts: Record<string, number> = { Wonderful: 0, Excited: 0, Happy: 0, Normal: 0, Tired: 0, Angry: 0, Flaming: 0 };
    (user.moodHistory || []).forEach(e => { if (e.mood) counts[e.mood]++; });
    return Object.entries(counts).map(([name, val]) => ({ name, val }));
  }, [user.moodHistory]);

  const handleSaveDiary = () => {
    if (!diaryTitle.trim() || !diaryContent.trim()) return;
    const newEntry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: diaryTitle,
      content: diaryContent,
      mood: diaryMood,
      timestamp: Date.now()
    };
    onUpdate({ diaryEntries: [newEntry, ...(user.diaryEntries || [])] });
    setIsAddingDiary(false);
    setDiaryTitle('');
    setDiaryContent('');
    
    // Reward
    onReward();
    triggerAnimation('diary', diaryTitle);
  };

  const handleScanAnswer = (moodImpact: Mood) => {
    if (moodImpact) {
      setScanScores(prev => ({ ...prev, [moodImpact]: (prev[moodImpact] || 0) + 1 }));
    }
    
    if (scanStep < SCAN_QUESTIONS.length - 1) {
      setScanStep(scanStep + 1);
    } else {
      const scores = { ...scanScores };
      if (moodImpact) scores[moodImpact] = (scores[moodImpact] || 0) + 1;
      
      const sorted = Object.entries(scores).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
      setScanResult((sorted[0]?.[0] as Mood) || 'Normal');
    }
  };

  const resetScan = () => {
    setScanStep(0);
    setScanScores({});
    setScanResult(null);
  };

  const handleFortune = () => {
    if(!fortuneQuestion.trim()) return;
    setIsConsulting(true);
    setFortuneAnswer('');
    
    setTimeout(() => {
        const rand = Math.random();
        let answer = "";
        if (rand < 0.25) answer = "Yes";
        else if (rand < 0.50) answer = "No";
        else if (rand < 0.75) answer = "Maybe Yes";
        else answer = "Maybe No";
        
        setFortuneAnswer(answer);
        setIsConsulting(false);
    }, 1500);
  };

  const SCAN_QUESTIONS = [
    { q: "How fast is your heart beating right now?", opts: [{ l: "Very fast!", m: "Excited" }, { l: "Calm", m: "Normal" }, { l: "A bit heavy", m: "Tired" }, { l: "Pounding!", m: "Angry" }] },
    { q: "Do you feel like dancing?", opts: [{ l: "Yes, definitely!", m: "Wonderful" }, { l: "Maybe later", m: "Happy" }, { l: "Too tired", m: "Tired" }, { l: "Not at all", m: "Angry" }] },
    { q: "How bright does the screen look?", opts: [{ l: "Perfectly vibrant", m: "Excited" }, { l: "Okay", m: "Normal" }, { l: "A bit dull", m: "Tired" }, { l: "It's annoying", m: "Angry" }] },
    { q: "Pick an emoji!", opts: [{ l: "✨", m: "Wonderful" }, { l: "🔥", m: "Flaming" }, { l: "💤", m: "Tired" }, { l: "😐", m: "Normal" }] },
    { q: "Are you hungry?", opts: [{ l: "For a feast!", m: "Excited" }, { l: "Just a snack", m: "Happy" }, { l: "No, too stressed", m: "Angry" }, { l: "Just thirsty", m: "Normal" }] },
    { q: "What's the vibe of your thoughts?", opts: [{ l: "Clear and sunny", m: "Wonderful" }, { l: "Steady flow", m: "Normal" }, { l: "Racing like a car", m: "Excited" }, { l: "Stuck in mud", m: "Tired" }] },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {(['Statistics', 'Diary', 'Mood Pet', 'Scan', 'Teller'] as const).map(tabName => (
          <button 
            key={tabName} 
            onClick={() => setSubTab(tabName)}
            className={`px-5 py-3 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap border-b-4 ${subTab === tabName ? 'bg-indigo-600 text-white shadow-lg translate-y-[-2px]' : isDarkMode ? 'bg-white/5 border-black text-white/40' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}
          >
            {tabName === 'Mood Pet' ? t('moodPet', language) : t(tabName.toLowerCase() as any, language) || tabName}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {subTab === 'Statistics' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} shadow-xl border-4 border-black/5`}>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3"><TrendingUp className="text-indigo-500"/> Overall Resonance</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="score" stroke="#46178f" strokeWidth={5} dot={{ fill: '#46178f', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} shadow-xl border-4 border-black/5`}>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3"><TrendingUp className="text-green-500"/> Frequency Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#eee'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                      <Bar dataKey="val" fill="#26890c" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {subTab === 'Diary' && (
            <motion.div key="diary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Book className="text-indigo-600"/> Personal Archives</h4>
                <button onClick={() => setIsAddingDiary(true)} className="kahoot-button-green px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-lg"><Plus size={18} /> NEW LOG</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.diaryEntries || []).length > 0 ? (user.diaryEntries || []).map(entry => (
                  <div key={entry.id} className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-md group relative`}>
                    <button onClick={() => onUpdate({ diaryEntries: (user.diaryEntries || []).filter(e => e.id !== entry.id) })} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-black uppercase opacity-40">{new Date(entry.timestamp).toLocaleDateString()}</span>
                       <span className="bg-indigo-600/10 text-indigo-600 px-2 rounded-lg text-[9px] font-black uppercase">{entry.mood}</span>
                    </div>
                    <h5 className="text-lg font-black uppercase italic mb-2 line-clamp-1">{entry.title}</h5>
                    <p className="text-sm font-bold opacity-60 leading-relaxed line-clamp-3">"{entry.content}"</p>
                  </div>
                )) : <div className="col-span-full py-20 text-center opacity-20 font-black uppercase">No entries yet.</div>}
              </div>

              {isAddingDiary && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border-4 border-white/10 relative`}>
                      <button onClick={() => setIsAddingDiary(false)} className="absolute top-6 right-6 opacity-40"><X size={32}/></button>
                      <h3 className="text-3xl font-black uppercase italic mb-8">New Entry</h3>
                      <div className="space-y-4">
                         <input value={diaryTitle} onChange={e => setDiaryTitle(e.target.value)} placeholder="Entry Title..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-green-500" />
                         <textarea value={diaryContent} onChange={e => setDiaryContent(e.target.value)} placeholder="Dear Diary..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-bold outline-none focus:border-green-500 min-h-[150px]" />
                         <div className="flex gap-2 overflow-x-auto pb-2">
                           {['Wonderful','Happy','Normal','Tired','Angry'].map(m => (
                             <button key={m} onClick={() => setDiaryMood(m as Mood)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${diaryMood === m ? 'bg-green-600 text-white border-green-600' : 'border-black/10'}`}>{m}</button>
                           ))}
                         </div>
                         <button onClick={handleSaveDiary} className="kahoot-button-green w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg mt-4">ARCHIVE MEMORY</button>
                      </div>
                    </motion.div>
                 </div>
              )}
            </motion.div>
          )}

          {subTab === 'Mood Pet' && (
             <MoodPetSection user={user} onUpdate={onUpdate} isDarkMode={isDarkMode} language={language} />
          )}

          {subTab === 'Scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[500px]">
                {!scanResult ? (
                    <div className={`w-full max-w-xl p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center`}>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">System Diagnostic</h2>
                            <p className="text-xs font-bold uppercase opacity-40 tracking-widest">Question {scanStep + 1} / {SCAN_QUESTIONS.length}</p>
                            <div className="w-full h-2 bg-black/10 rounded-full mt-4 overflow-hidden">
                                <motion.div animate={{ width: `${((scanStep + 1) / SCAN_QUESTIONS.length) * 100}%` }} className="h-full bg-blue-500"/>
                            </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black italic mb-10 min-h-[80px] flex items-center justify-center">
                            "{SCAN_QUESTIONS[scanStep].q}"
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {SCAN_QUESTIONS[scanStep].opts.map((opt, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleScanAnswer(opt.m as Mood)}
                                    className="kahoot-button-blue py-4 rounded-2xl text-white font-black uppercase shadow-lg text-sm"
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`w-full max-w-xl p-10 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center`}>
                        <HeartPulse size={80} className="mx-auto mb-6 text-red-500 animate-pulse"/>
                        <p className="text-xs font-bold uppercase opacity-40 tracking-widest mb-2">Diagnosis Complete</p>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6">{scanResult}</h2>
                        <p className="text-sm font-bold opacity-70 mb-10">Your responses indicate a resonance frequency matching {scanResult} state. Recommended: Drink water and check City Hall for tasks.</p>
                        <button onClick={resetScan} className="kahoot-button-green px-8 py-4 rounded-2xl text-white font-black uppercase shadow-lg">Run New Scan</button>
                    </div>
                )}
            </motion.div>
          )}

          {subTab === 'Teller' && (
              <motion.div key="teller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[500px]">
                  <div className={`w-full max-w-xl p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-2xl text-center relative overflow-hidden`}>
                      <Zap size={100} className={`absolute -top-6 -right-6 ${isConsulting ? 'text-purple-500 animate-spin' : 'text-purple-500/20'}`} />
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Destiny Predictor</h2>
                      
                      {!fortuneAnswer ? (
                          <div className="space-y-6">
                              <p className="text-sm font-bold opacity-60">Ask a "Yes" or "No" question to reveal your path...</p>
                              <textarea 
                                value={fortuneQuestion} 
                                onChange={e => setFortuneQuestion(e.target.value)} 
                                placeholder="Will I find success tomorrow?" 
                                className="w-full p-4 rounded-2xl bg-black/5 font-black text-center outline-none focus:border-purple-500 border-2 min-h-[100px]"
                              />
                              <button 
                                onClick={handleFortune} 
                                disabled={isConsulting || !fortuneQuestion.trim()}
                                className="kahoot-button-purple w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg disabled:opacity-50"
                              >
                                {isConsulting ? 'Consulting Spirits...' : 'Reveal Probability'}
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-8">
                              <div className="p-8 bg-purple-500/10 rounded-[2rem] border-2 border-purple-500/20">
                                  <h3 className="text-2xl md:text-3xl font-black italic text-purple-600 mb-2">The spirits reveal...</h3>
                                  <p className="text-5xl font-black uppercase tracking-tighter text-purple-600">{fortuneAnswer}</p>
                              </div>
                              <button onClick={() => { setFortuneAnswer(''); setFortuneQuestion(''); }} className="text-xs font-black uppercase opacity-40 hover:opacity-100">Ask Another Question</button>
                          </div>
                      )}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodSection;
