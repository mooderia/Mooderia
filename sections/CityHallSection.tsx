import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ScheduleItem, RoutineItem } from '../types';
import { Send, Calendar, Sparkles, Plus, Clock, X, Check, Bell, Palette, Play, Timer, Trash2, AlertTriangle, Users, UserPlus } from 'lucide-react';
import { DAILY_COLORS, WISDOM_OF_MOODERIA, t } from '../constants';
import { sendFriendRequest } from '../services/supabaseService';

interface CityHallSectionProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  isDarkMode: boolean;
  language: 'English' | 'Filipino';
  onReward: () => void;
  triggerAnimation: (type: 'express' | 'schedule' | 'routine' | 'diary' | 'alarm', text?: string) => void;
  onSendMail: (recipient: string, msg: string) => void;
}

const CityHallSection: React.FC<CityHallSectionProps> = ({ user, onUpdate, isDarkMode, language, onReward, triggerAnimation, onSendMail }) => {
  const [subTab, setSubTab] = useState<'Express' | 'Schedule' | 'Routine' | 'Wisdom'>('Express');

  // Express State
  const [recipient, setRecipient] = useState('');
  const [letter, setLetter] = useState('');
  const [expressError, setExpressError] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendStatus, setFriendStatus] = useState('');

  // Schedule State
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedPeriod, setSchedPeriod] = useState<'AM' | 'PM'>('AM');

  // Routine State
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineIcon, setRoutineIcon] = useState('📅');
  const [routineDays, setRoutineDays] = useState<number[]>([0,1,2,3,4,5,6]); 
  const [routineStartTime, setRoutineStartTime] = useState('08:00');
  const [routineStartPeriod, setRoutineStartPeriod] = useState<'AM'|'PM'>('AM');
  const [routineEndTime, setRoutineEndTime] = useState('09:00');
  const [routineEndPeriod, setRoutineEndPeriod] = useState<'AM'|'PM'>('AM');
  
  // Timer State
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState(0);

  const dailyWisdom = useMemo(() => {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const color = DAILY_COLORS[seed % DAILY_COLORS.length];
    const words = WISDOM_OF_MOODERIA[seed % WISDOM_OF_MOODERIA.length];
    return { color, words };
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeRoutineId && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft(prev => prev - 1);
      }, 1000);
    } else if (activeRoutineId && timerLeft <= 0) {
       clearInterval(interval);
       completeRoutine(activeRoutineId);
       setActiveRoutineId(null);
    }
    return () => clearInterval(interval);
  }, [activeRoutineId, timerLeft]);

  const handleSendFriendRequest = async () => {
    setFriendStatus('Sending signal...');
    const result = await sendFriendRequest(user.username, friendCodeInput);
    if (result.success) {
        setFriendStatus('Friend Request Transmitted!');
        setTimeout(() => { setShowAddFriend(false); setFriendCodeInput(''); setFriendStatus(''); }, 2000);
    } else {
        setFriendStatus(result.error || 'Signal Failed.');
    }
  };

  const handleSendExpress = () => {
    setExpressError('');
    if (!recipient || !letter.trim()) return;
    
    // Only allow sending to friends or system
    if (!user.friends?.includes(recipient) && recipient !== 'DrPinel') {
        setExpressError(`You are not connected with @${recipient}. Add them via code first.`);
        return;
    }

    triggerAnimation('express');
    onSendMail(recipient, letter);
    onReward();
    setLetter('');
  };

  const handleAddSchedule = () => {
    if (!schedTitle.trim() || !schedDate || !schedTime) return;
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: schedTitle,
      date: schedDate,
      time: schedTime,
      period: schedPeriod,
      timestamp: Date.now(),
      alerted: false
    };
    onUpdate({ schedule: [...user.schedule, newItem] });
    setIsAddingSchedule(false);
    setSchedTitle('');
    onReward();
    triggerAnimation('schedule');
  };

  const handleCompleteSchedule = (id: string) => {
    const item = user.schedule.find(s => s.id === id);
    if(item) {
        triggerAnimation('schedule', `COMPLETED: ${item.title}`);
        onUpdate({ schedule: user.schedule.filter(s => s.id !== id) });
        onReward();
    }
  };

  const calculateDuration = () => {
    let startH = parseInt(routineStartTime.split(':')[0]);
    let startM = parseInt(routineStartTime.split(':')[1]);
    if (routineStartPeriod === 'PM' && startH !== 12) startH += 12;
    if (routineStartPeriod === 'AM' && startH === 12) startH = 0;
    
    let endH = parseInt(routineEndTime.split(':')[0]);
    let endM = parseInt(routineEndTime.split(':')[1]);
    if (routineEndPeriod === 'PM' && endH !== 12) endH += 12;
    if (routineEndPeriod === 'AM' && endH === 12) endH = 0;

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    
    if (endTotal < startTotal) endTotal += 24 * 60; 
    return endTotal - startTotal;
  };

  const handleAddRoutine = () => {
    if (!routineTitle.trim()) return;
    const duration = calculateDuration();
    const newRoutine: RoutineItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: routineTitle,
      icon: routineIcon,
      days: routineDays,
      startTime: routineStartTime,
      startPeriod: routineStartPeriod,
      endTime: routineEndTime,
      endPeriod: routineEndPeriod,
      durationMinutes: duration,
      completedDates: []
    };
    onUpdate({ routines: [...(user.routines || []), newRoutine] });
    setIsAddingRoutine(false);
    onReward();
    triggerAnimation('routine');
  };

  const startRoutine = (r: RoutineItem) => {
    setActiveRoutineId(r.id);
    setTimerLeft(r.durationMinutes * 60); 
  };

  const completeRoutine = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onUpdate({
      routines: user.routines.map(r => r.id === id ? { ...r, completedDates: [...r.completedDates, todayStr] } : r)
    });
    onReward();
    triggerAnimation('routine');
  };

  const deleteRoutine = (id: string) => {
    onUpdate({ routines: user.routines.filter(r => r.id !== id) });
  };

  const toggleDay = (d: number) => {
    if (routineDays.includes(d)) setRoutineDays(routineDays.filter(day => day !== d));
    else setRoutineDays([...routineDays, d].sort());
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {(['Express', 'Schedule', 'Routine', 'Wisdom'] as const).map(tabName => (
          <button 
            key={tabName} 
            onClick={() => setSubTab(tabName)}
            className={`px-6 py-3 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap border-b-4 ${subTab === tabName ? 'bg-red-600 text-white shadow-lg translate-y-[-2px]' : isDarkMode ? 'bg-white/5 border-black text-white/40' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}
          >
            {t(tabName.toLowerCase() as any, language)}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {subTab === 'Express' && (
            <motion.div key="express" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Send className="text-red-500"/> Express Mail</h3>
                 <button onClick={() => setShowAddFriend(true)} className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-black/10"><UserPlus size={14}/> Add Citizen</button>
               </div>

               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 ml-4">Recipient (Friends Only)</p>
                    <select value={recipient} onChange={e => { setRecipient(e.target.value); setExpressError(''); }} className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black outline-none focus:border-red-500 appearance-none">
                        <option value="">Select a Friend...</option>
                        {user.friends?.map(f => <option key={f} value={f}>@{f}</option>)}
                        <option value="DrPinel">@DrPinel (System)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2 px-4">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Message Frequencies</p>
                        <p className={`text-[10px] font-black ${letter.length === 100 ? 'text-red-500' : 'opacity-40'}`}>{letter.length}/100</p>
                    </div>
                    <textarea 
                        value={letter} 
                        onChange={e => setLetter(e.target.value)} 
                        maxLength={100}
                        placeholder="Pour your neural state into words..." 
                        className="w-full p-6 rounded-[2rem] border-2 bg-black/5 font-bold outline-none focus:border-red-500 min-h-[200px]" 
                    />
                  </div>
                  {expressError && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-100 text-red-600 rounded-xl font-black text-xs flex items-center gap-2">
                          <AlertTriangle size={16}/> {expressError}
                      </motion.div>
                  )}
                  <button onClick={handleSendExpress} disabled={!recipient} className="kahoot-button-red w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg disabled:opacity-50">{t('sendMail', language)}</button>
               </div>

               {/* Add Friend Modal */}
               {showAddFriend && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-4 border-white/10 relative text-center`}>
                       <button onClick={() => setShowAddFriend(false)} className="absolute top-6 right-6 opacity-40"><X size={24}/></button>
                       <Users size={48} className="mx-auto mb-4 text-indigo-500"/>
                       <h3 className="text-2xl font-black uppercase italic mb-6">Link Frequency</h3>
                       <p className="text-xs font-bold opacity-60 mb-4">Enter the 6-Digit Citizen Code found in their Passport.</p>
                       <input 
                         value={friendCodeInput}
                         onChange={e => setFriendCodeInput(e.target.value)}
                         placeholder="123456"
                         maxLength={6}
                         className="w-full p-4 rounded-xl border-2 bg-black/5 font-black text-center text-2xl tracking-widest outline-none focus:border-indigo-500 mb-4"
                       />
                       {friendStatus && <p className="text-xs font-black uppercase text-indigo-500 mb-4">{friendStatus}</p>}
                       <button onClick={handleSendFriendRequest} className="kahoot-button-blue w-full py-4 rounded-2xl text-white font-black uppercase shadow-lg">Transmit Request</button>
                    </motion.div>
                 </div>
               )}
            </motion.div>
          )}

          {subTab === 'Schedule' && (
             <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center px-4">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Calendar className="text-blue-500"/> Citizen Slated</h3>
                   <button onClick={() => setIsAddingSchedule(true)} className="kahoot-button-blue px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-lg"><Plus size={18} /> {t('newTask', language)}</button>
                </div>
                {/* Existing Schedule List rendering */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.schedule.length > 0 ? user.schedule.sort((a,b)=>a.date.localeCompare(b.date)).map(item => (
                    <div key={item.id} className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-md flex items-center gap-4`}>
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${item.alerted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {item.alerted ? <Check size={24}/> : <Clock size={24}/>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h5 className="font-black text-sm uppercase truncate">{item.title}</h5>
                          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{item.date} • {item.time} {item.period}</p>
                       </div>
                       <button onClick={() => handleCompleteSchedule(item.id)} className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95">
                           Done
                       </button>
                    </div>
                  )) : <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-lg italic tracking-widest">{t('noEntries', language)}</div>}
               </div>

                {isAddingSchedule && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border-4 border-white/10 relative`}>
                      <button onClick={() => setIsAddingSchedule(false)} className="absolute top-6 right-6 opacity-40"><X size={32}/></button>
                      <h3 className="text-3xl font-black uppercase italic mb-8">Slate New Task</h3>
                      <div className="space-y-4">
                        <input value={schedTitle} onChange={e => setSchedTitle(e.target.value)} placeholder="Task Designation..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-blue-500" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-blue-500" />
                          <div className="flex gap-2">
                             <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} className="flex-1 p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-blue-500" />
                             <select value={schedPeriod} onChange={e => setSchedPeriod(e.target.value as any)} className="p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-blue-500">
                               <option>AM</option>
                               <option>PM</option>
                             </select>
                          </div>
                        </div>
                        <button onClick={handleAddSchedule} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg mt-4">COMMIT TO GRID</button>
                      </div>
                    </motion.div>
                  </div>
               )}
             </motion.div>
          )}

          {subTab === 'Routine' && (
             <motion.div key="routine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="flex justify-between items-center px-4">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Clock className="text-purple-500"/> Daily Routine</h3>
                   <button onClick={() => setIsAddingRoutine(true)} className="kahoot-button-purple px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-lg"><Plus size={18} /> {t('newRoutine', language)}</button>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {(user.routines || []).map(r => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isCompleted = r.completedDates.includes(todayStr);
                    return (
                      <div key={r.id} className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 ${isCompleted ? 'border-green-500/20 opacity-60' : 'border-black/5'} shadow-md flex items-center gap-4 relative overflow-hidden transition-all`}>
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isCompleted ? 'bg-green-100 grayscale' : 'bg-black/5'}`}>{r.icon}</div>
                         <div className="flex-1">
                            <h5 className={`font-black text-lg uppercase ${isCompleted ? 'line-through opacity-50' : ''}`}>{r.title}</h5>
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{r.startTime} {r.startPeriod} - {r.endTime} {r.endPeriod} ({r.durationMinutes}m)</p>
                            <div className="flex gap-1 mt-1 opacity-40">
                              {['S','M','T','W','T','F','S'].map((d,i) => <span key={i} className={`text-[9px] font-black ${r.days.includes(i) ? 'text-indigo-500' : 'text-gray-400'}`}>{d}</span>)}
                            </div>
                         </div>
                         {isCompleted ? (
                           <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md flex items-center gap-2">
                               <Check size={14}/> {t('complete', language)}
                           </div>
                         ) : (
                           <button onClick={() => startRoutine(r)} className="kahoot-button-green px-4 py-2 rounded-xl text-white font-black text-xs uppercase shadow-md flex items-center gap-2"><Play size={14}/> {t('startTask', language)}</button>
                         )}
                         <button onClick={() => deleteRoutine(r.id)} className="absolute top-4 right-4 opacity-10 hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                      </div>
                    );
                  })}
               </div>

               {/* Add Routine Modal */}
               {isAddingRoutine && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border-4 border-white/10 relative`}>
                      <button onClick={() => setIsAddingRoutine(false)} className="absolute top-6 right-6 opacity-40"><X size={32}/></button>
                      <h3 className="text-3xl font-black uppercase italic mb-8">Slate Routine</h3>
                      <div className="space-y-4">
                        <input value={routineTitle} onChange={e => setRoutineTitle(e.target.value)} placeholder="Routine Name..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-purple-500" />
                        <input value={routineIcon} onChange={e => setRoutineIcon(e.target.value)} placeholder="Emoji Icon..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-purple-500" maxLength={2} />
                        
                        <div className="flex gap-2 justify-between">
                           {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i) => (
                             <button key={d} onClick={() => toggleDay(i)} className={`w-8 h-8 rounded-full text-[9px] font-black uppercase ${routineDays.includes(i) ? 'bg-purple-600 text-white' : 'bg-black/10'}`}>{d[0]}</button>
                           ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase opacity-40">Start</p>
                             <div className="flex gap-2"><input type="time" value={routineStartTime} onChange={e => setRoutineStartTime(e.target.value)} className="flex-1 p-3 rounded-xl border-2 bg-black/5 font-black"/><select value={routineStartPeriod} onChange={e=>setRoutineStartPeriod(e.target.value as any)} className="p-3 bg-black/5 rounded-xl font-black"><option>AM</option><option>PM</option></select></div>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase opacity-40">End</p>
                             <div className="flex gap-2"><input type="time" value={routineEndTime} onChange={e => setRoutineEndTime(e.target.value)} className="flex-1 p-3 rounded-xl border-2 bg-black/5 font-black"/><select value={routineEndPeriod} onChange={e=>setRoutineEndPeriod(e.target.value as any)} className="p-3 bg-black/5 rounded-xl font-black"><option>AM</option><option>PM</option></select></div>
                           </div>
                        </div>

                        <button onClick={handleAddRoutine} className="kahoot-button-purple w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg mt-4">COMMIT TO GRID</button>
                      </div>
                    </motion.div>
                  </div>
               )}

               {/* Timer Modal */}
               {activeRoutineId && (
                  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-purple-900/90 backdrop-blur-xl">
                     <div className="text-center text-white">
                        <Timer size={60} className="mx-auto mb-6 animate-pulse"/>
                        <h2 className="text-4xl font-black italic uppercase mb-2">Routine Active</h2>
                        <h1 className="text-8xl font-black tabular-nums mb-8">
                           {Math.floor(timerLeft / 60).toString().padStart(2,'0')}:{(timerLeft % 60).toString().padStart(2,'0')}
                        </h1>
                        <button onClick={() => { setActiveRoutineId(null); setTimerLeft(0); }} className="px-8 py-3 bg-white/20 rounded-full font-black uppercase text-xs hover:bg-white/40">Cancel Timer</button>
                     </div>
                  </div>
               )}
             </motion.div>
          )}

          {subTab === 'Wisdom' && (
            <motion.div key="wisdom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className={`p-10 rounded-[4rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl text-center relative overflow-hidden`}>
                  <Sparkles className="absolute -top-10 -right-10 text-yellow-500/10" size={200} />
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-6">Metropolis Insight</p>
                  <p className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight mb-8">"{dailyWisdom.words}"</p>
               </div>
               
               <div className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl flex flex-col md:flex-row items-center gap-8`}>
                  <div className="w-32 h-32 rounded-[2rem] shadow-2xl border-b-8 border-black/20 flex items-center justify-center shrink-0" style={{ backgroundColor: dailyWisdom.color.hex }}>
                     <Palette size={48} className="text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Lucky Resonance Color</p>
                     <h4 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: dailyWisdom.color.hex }}>{dailyWisdom.color.name}</h4>
                     <p className="text-sm font-bold opacity-60 mt-2 uppercase tracking-tight">Today's Alignment: <span className="text-black dark:text-white">{dailyWisdom.color.meaning}</span></p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CityHallSection;