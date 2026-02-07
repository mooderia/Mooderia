
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ScheduleItem, RoutineItem } from '../types';
import { Send, Clock, X, Check, Users, UserPlus, Search, Loader2, Calendar, Plus, Trash2, Repeat, BrainCircuit } from 'lucide-react';
import { WISDOM_OF_MOODERIA, t } from '../constants';
import { sendFriendRequest, findCitizenInCloud } from '../services/supabaseService';

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
  const [subTab, setSubTab] = useState<'Express' | 'Schedule' | 'Routine' | 'Registry' | 'Wisdom'>('Express');

  // Search Registry
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendStatus, setFriendStatus] = useState('');

  // Express Mail
  const [recipient, setRecipient] = useState('');
  const [letter, setLetter] = useState('');

  // Schedule Input
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');

  // Routine Input
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineTime, setRoutineTime] = useState('');
  const [routineDays, setRoutineDays] = useState<number[]>([]);

  const handleSearchRegistry = async () => {
    if (searchQuery.length < 6) return;
    setIsSearching(true);
    setSearchResult(null);
    const result = await findCitizenInCloud(searchQuery);
    setSearchResult(result);
    setIsSearching(false);
  };

  const handleSendFriendRequest = async () => {
    setFriendStatus('Pinging grid...');
    const result = await sendFriendRequest(user.citizenCode, friendCodeInput);
    if (result.success) {
        setFriendStatus('Signal sent!');
        setTimeout(() => { setShowAddFriend(false); setFriendCodeInput(''); setFriendStatus(''); }, 2000);
    } else { setFriendStatus(result.error || 'Signal lost.'); }
  };

  const addTask = () => {
    if (!taskTitle || !taskDate || !taskTime) return;
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      title: taskTitle,
      date: taskDate,
      time: taskTime,
      period: parseInt(taskTime.split(':')[0]) >= 12 ? 'PM' : 'AM',
      timestamp: new Date(`${taskDate}T${taskTime}`).getTime(),
      alerted: false
    };
    onUpdate({ schedule: [...(user.schedule || []), newItem].sort((a,b) => a.timestamp - b.timestamp) });
    setTaskTitle('');
    setTaskDate('');
    setTaskTime('');
    triggerAnimation('schedule', 'Task Slated');
  };

  const removeTask = (id: string) => {
    onUpdate({ schedule: (user.schedule || []).filter(i => i.id !== id) });
  };

  const addRoutine = () => {
    if (!routineTitle || !routineTime || routineDays.length === 0) return;
    const newRoutine: RoutineItem = {
      id: Date.now().toString(),
      title: routineTitle,
      icon: '✨',
      days: routineDays,
      startTime: routineTime,
      startPeriod: parseInt(routineTime.split(':')[0]) >= 12 ? 'PM' : 'AM',
      endTime: '',
      endPeriod: 'AM',
      durationMinutes: 0,
      completedDates: []
    };
    onUpdate({ routines: [...(user.routines || []), newRoutine] });
    setRoutineTitle('');
    setRoutineTime('');
    setRoutineDays([]);
    triggerAnimation('routine', 'Habit Locked');
  };

  const removeRoutine = (id: string) => {
    onUpdate({ routines: (user.routines || []).filter(r => r.id !== id) });
  };

  const toggleDay = (dayIdx: number) => {
    if (routineDays.includes(dayIdx)) setRoutineDays(routineDays.filter(d => d !== dayIdx));
    else setRoutineDays([...routineDays, dayIdx].sort());
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {(['Express', 'Schedule', 'Routine', 'Registry', 'Wisdom'] as const).map(tabName => (
          <button key={tabName} onClick={() => setSubTab(tabName)} className={`px-6 py-3 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap border-b-4 ${subTab === tabName ? 'bg-red-600 text-white shadow-lg translate-y-[-2px]' : isDarkMode ? 'bg-white/5 border-black text-white/40' : 'bg-white border-gray-100 text-slate-500 shadow-sm'}`}>{tabName}</button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* --- SCHEDULE TAB --- */}
          {subTab === 'Schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
               <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8"><Calendar className="text-blue-500"/> Task Slate</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6 bg-black/5 rounded-[2rem]">
                  <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task Name" className="md:col-span-2 p-4 rounded-xl font-bold bg-white dark:bg-black/20 outline-none border-2 border-transparent focus:border-blue-500" />
                  <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="p-4 rounded-xl font-bold bg-white dark:bg-black/20 outline-none" />
                  <input type="time" value={taskTime} onChange={e => setTaskTime(e.target.value)} className="p-4 rounded-xl font-bold bg-white dark:bg-black/20 outline-none" />
                  <button onClick={addTask} disabled={!taskTitle || !taskDate} className="md:col-span-4 kahoot-button-blue py-4 rounded-xl text-white font-black uppercase shadow-lg disabled:opacity-50"><Plus size={20} className="mx-auto"/></button>
               </div>

               <div className="space-y-4">
                 {(user.schedule || []).length === 0 && <p className="text-center opacity-30 font-black italic uppercase py-10">Slate is empty.</p>}
                 {(user.schedule || []).map(item => (
                   <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-white/5 border-2 border-black/5 shadow-sm group">
                      <div>
                         <h4 className="font-black uppercase text-lg">{item.title}</h4>
                         <p className="text-xs font-bold opacity-50 flex items-center gap-2">
                           <Calendar size={12}/> {item.date} <Clock size={12}/> {item.time}
                         </p>
                      </div>
                      <button onClick={() => removeTask(item.id)} className="p-3 rounded-xl bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* --- ROUTINE TAB --- */}
          {subTab === 'Routine' && (
            <motion.div key="routine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
               <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8"><Repeat className="text-purple-500"/> Habit Loop</h3>
               
               <div className="mb-8 p-6 bg-black/5 rounded-[2rem] space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input value={routineTitle} onChange={e => setRoutineTitle(e.target.value)} placeholder="Habit Name (e.g. Drink Water)" className="flex-1 p-4 rounded-xl font-bold bg-white dark:bg-black/20 outline-none border-2 border-transparent focus:border-purple-500" />
                    <input type="time" value={routineTime} onChange={e => setRoutineTime(e.target.value)} className="p-4 rounded-xl font-bold bg-white dark:bg-black/20 outline-none" />
                  </div>
                  <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                    {DAYS.map((d, i) => (
                      <button key={d} onClick={() => toggleDay(i)} className={`w-10 h-10 rounded-full font-black text-[10px] uppercase flex items-center justify-center border-2 ${routineDays.includes(i) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-black/20 border-black/10'}`}>{d[0]}</button>
                    ))}
                  </div>
                  <button onClick={addRoutine} disabled={!routineTitle || !routineTime || routineDays.length === 0} className="w-full kahoot-button-purple py-4 rounded-xl text-white font-black uppercase shadow-lg disabled:opacity-50">Initialize Loop</button>
               </div>

               <div className="space-y-4">
                 {(user.routines || []).length === 0 && <p className="text-center opacity-30 font-black italic uppercase py-10">No active loops.</p>}
                 {(user.routines || []).map(item => (
                   <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-white/5 border-2 border-black/5 shadow-sm group">
                      <div>
                         <h4 className="font-black uppercase text-lg flex items-center gap-2">{item.title}</h4>
                         <div className="flex gap-1 mt-2">
                           {item.days.map(d => <span key={d} className="text-[9px] font-black uppercase bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">{DAYS[d]}</span>)}
                           <span className="text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock size={8}/> {item.startTime}</span>
                         </div>
                      </div>
                      <button onClick={() => removeRoutine(item.id)} className="p-3 rounded-xl bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* --- WISDOM TAB --- */}
          {subTab === 'Wisdom' && (
             <motion.div key="wisdom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8"><BrainCircuit className="text-yellow-500"/> Cloud Wisdom</h3>
                <div className="space-y-4">
                  {WISDOM_OF_MOODERIA.map((w, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border-l-8 border-yellow-500 italic font-bold opacity-80">
                      "{w}"
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {/* --- REGISTRY TAB (Existing) --- */}
          {subTab === 'Registry' && (
            <motion.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
               <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-6"><Search className="text-indigo-600"/> Citizen Registry</h3>
               <p className="text-xs font-bold opacity-60 mb-6 uppercase tracking-widest leading-tight">Query the Global Grid to confirm cross-device synchronization.</p>
               <div className="flex gap-4 mb-8">
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value.replace(/\D/g,''))} maxLength={6} placeholder="000000" className="flex-1 p-4 rounded-2xl bg-black/5 font-black text-2xl text-center tracking-[0.4em] outline-none focus:border-indigo-500 border-2" />
                  <button onClick={handleSearchRegistry} disabled={searchQuery.length < 6 || isSearching} className="kahoot-button-blue px-6 py-4 rounded-2xl text-white font-black uppercase shadow-lg disabled:opacity-50">
                    {isSearching ? <Loader2 className="animate-spin"/> : <Search/>}
                  </button>
               </div>
               
               {searchResult ? (
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 rounded-[2rem] border-4 border-indigo-500/20 bg-indigo-500/5 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black italic">{searchResult.displayName[0]}</div>
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Citizen Found</p>
                        <h4 className="text-xl font-black uppercase italic leading-none">{searchResult.displayName}</h4>
                        <p className="text-xs font-bold opacity-60 mt-1 uppercase text-indigo-600">{searchResult.title}</p>
                    </div>
                    <button onClick={() => { setFriendCodeInput(searchResult.citizenCode); setShowAddFriend(true); }} className="ml-auto kahoot-button-blue px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase">Link</button>
                 </motion.div>
               ) : searchQuery.length === 6 && !isSearching && (
                 <div className="p-12 text-center opacity-30 font-black uppercase italic">ID not found in the grid.</div>
               )}
            </motion.div>
          )}

          {/* --- EXPRESS TAB (Existing) --- */}
          {subTab === 'Express' && (
            <motion.div key="express" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Send className="text-red-500"/> Express Mail</h3>
                 <button onClick={() => setShowAddFriend(true)} className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase"><UserPlus size={14}/> Add Link</button>
               </div>
               <div className="space-y-6">
                  <select value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black outline-none focus:border-red-500 appearance-none">
                      <option value="">Select a Friend...</option>
                      {user.friends?.map(f => <option key={f} value={f}>Citizen ID: {f}</option>)}
                  </select>
                  <textarea value={letter} onChange={e => setLetter(e.target.value)} maxLength={100} placeholder="Transmit your frequency..." className="w-full p-6 rounded-[2rem] border-2 bg-black/5 font-bold outline-none focus:border-red-500 min-h-[150px]" />
                  <button onClick={() => { if(recipient && letter.trim()) { onSendMail(recipient, letter); setLetter(''); } }} disabled={!recipient || !letter.trim()} className="kahoot-button-red w-full py-5 rounded-2xl text-white font-black uppercase shadow-lg">Transmit Signal</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showAddFriend && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-4 border-white/10 relative text-center`}>
            <button onClick={() => setShowAddFriend(false)} className="absolute top-6 right-6 opacity-40"><X size={24}/></button>
            <Users size={48} className="mx-auto mb-4 text-indigo-500"/>
            <h3 className="text-2xl font-black uppercase italic mb-6">Identity Link</h3>
            <input value={friendCodeInput} onChange={e => setFriendCodeInput(e.target.value.replace(/\D/g,''))} placeholder="000000" maxLength={6} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black text-center text-2xl tracking-[0.5em] outline-none focus:border-indigo-500 mb-4" />
            {friendStatus && <p className="text-[10px] font-black uppercase text-indigo-500 mb-4">{friendStatus}</p>}
            <button onClick={handleSendFriendRequest} className="kahoot-button-blue w-full py-4 rounded-2xl text-white font-black uppercase shadow-lg">Send Request</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CityHallSection;
