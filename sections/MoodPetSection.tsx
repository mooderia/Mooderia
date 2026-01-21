
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { 
  Coins, Trophy, Heart, Timer, Sparkles, Star, Moon, DollarSign, PenTool, 
  Gamepad2, Calculator, Share2, Target, Brain, Dices, Keyboard, X, Edit2, Zap
} from 'lucide-react';
import { getExpNeeded } from '../constants';

interface MoodPetSectionProps {
  user: User;
  isDarkMode: boolean;
  onUpdate: (hunger: number, thirst: number, rest: number, coins: number, exp?: number, sleepUntil?: number | null, newEmoji?: string, markChosen?: boolean, newName?: string, gameCooldownId?: string) => void;
  onPost: (content: string, visibility: 'global' | 'circle') => void;
}

const RENAME_COST = 50;

const GAMES = [
  { id: 'clicker', name: 'Neural Tap', emoji: '👆', color: 'bg-yellow-400', time: 10, desc: 'High Frequency Tapping' },
  { id: 'math', name: 'Logic Pulse', emoji: '🔢', color: 'bg-blue-400', time: 15, desc: 'Solve or Reboot' },
  { id: 'wheel', name: 'Sync Wheel', emoji: '🎡', color: 'bg-orange-400', time: 5, desc: 'Spin for Vibe Rewards' },
  { id: 'hunter', name: 'Signal Catch', emoji: '🎯', color: 'bg-red-400', time: 20, desc: 'Tap Moving Targets' },
  { id: 'memory', name: 'Vibe Match', emoji: '🧠', color: 'bg-pink-400', time: 20, desc: 'Pattern Recognition' },
  { id: 'riddle', name: 'Code Breaker', emoji: '💻', color: 'bg-purple-500', time: 20, desc: 'Unscramble Metropolis Code' },
];

const PET_OPTIONS = ['🐱', '🐶', '🦊', '🦁', '🐨', '🐼', '🦄', '🐲', '🐸', '🐹', '🐰', '🐯', '🐧', '🐻', '🦉'];

const ITEMS = [
  { id: 'f1', type: 'hunger', name: 'Sync Snack', emoji: '🥨', cost: 5, fill: 6 },
  { id: 'f2', type: 'hunger', name: 'Metropop', emoji: '🍿', cost: 10, fill: 12 },
  { id: 'f3', type: 'hunger', name: 'Core Meal', emoji: '🍱', cost: 25, fill: 28 },
  { id: 'f4', type: 'hunger', name: 'Giga Burger', emoji: '🍔', cost: 45, fill: 50 },
  { id: 'd1', type: 'thirst', name: 'Nano Dew', emoji: '💧', cost: 3, fill: 5 },
  { id: 'd2', type: 'thirst', name: 'Vibe Cola', emoji: '🥤', cost: 12, fill: 15 },
  { id: 'd3', type: 'thirst', name: 'Energy Link', emoji: '⚡', cost: 30, fill: 35 },
  { id: 'd4', type: 'thirst', name: 'Cosmic Juice', emoji: '🧃', cost: 55, fill: 65 },
];

const SLEEP_MODES = [
  { id: 'nap', name: 'Quick Nap', emoji: '😴', rest: 15, cost: 0, duration: 30 },
  { id: 'recharge', name: 'Neural Charge', emoji: '⚡', rest: 45, cost: 60, duration: 120 },
  { id: 'deep', name: 'Deep Stasis', emoji: '💤', rest: 100, cost: 120, duration: 480 },
];

const RIDDLE_WORDS = ['STREAK', 'CITIZEN', 'MOODERIA', 'GUARDIAN', 'COSMIC', 'NEURAL', 'SIGNAL', 'FREQUENCY'];

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[260]">
    {Array.from({ length: 60 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          top: "100%", 
          left: `${Math.random() * 100}%`,
          opacity: 1,
          scale: Math.random() * 0.5 + 0.5
        }}
        animate={{ 
          top: "-20%", 
          left: `${(Math.random() - 0.5) * 50 + 50}%`,
          rotate: [0, 180, 360, 720],
          opacity: [1, 1, 0.8, 0]
        }}
        transition={{ 
          duration: Math.random() * 3 + 2, 
          delay: Math.random() * 0.8,
          ease: "easeOut"
        }}
        className="absolute text-3xl"
      >
        {['✨', '⭐', '🎈', '💖', '🔥', '💎', '🎨', '🚀'][Math.floor(Math.random() * 8)]}
      </motion.div>
    ))}
  </div>
);

const MoodPetSection: React.FC<MoodPetSectionProps> = ({ user, isDarkMode, onUpdate, onPost }) => {
  const [activeTab, setActiveTab] = useState<'Care' | 'Shop' | 'Arcade'>('Care');
  const [creationStep, setCreationStep] = useState(1);
  const [tempName, setTempName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [now, setNow] = useState(Date.now());
  const [isRenaming, setIsRenaming] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{ coins: number, exp: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tapScore, setTapScore] = useState(0);
  const [mathProb, setMathProb] = useState({ q: '', a: 0 });
  const [mathInput, setMathInput] = useState('');
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [hunterTarget, setHunterTarget] = useState({ x: 50, y: 50 });
  const [riddleWord, setRiddleWord] = useState({ scrambled: '', original: '' });

  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const prevLevelRef = useRef(user.petLevel);

  const isSleeping = useMemo(() => user.petSleepUntil ? user.petSleepUntil > now : false, [user.petSleepUntil, now]);
  const isDepleted = useMemo(() => user.petHunger < 10 || user.petThirst < 10 || user.petRest < 10, [user.petHunger, user.petThirst, user.petRest]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: number;
    if (gameMode && timeLeft > 0 && !gameResult) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameMode && timeLeft === 0 && !gameResult) {
      handleFinishGame();
    }
    return () => clearInterval(timer);
  }, [gameMode, timeLeft, gameResult]);

  // Reliable level-up observer
  useEffect(() => {
    if (user.petLevel > prevLevelRef.current) {
      setLevelUpModal(user.petLevel);
    }
    prevLevelRef.current = user.petLevel;
  }, [user.petLevel]);

  const genMath = () => {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 5;
    setMathProb({ q: `${a} + ${b}`, a: a + b });
    setMathInput('');
  };

  const genHunter = () => {
    setHunterTarget({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });
  };

  const genRiddle = () => {
    const original = RIDDLE_WORDS[Math.floor(Math.random() * RIDDLE_WORDS.length)];
    const scrambled = original.split('').sort(() => 0.5 - Math.random()).join('');
    setRiddleWord({ scrambled, original });
    setMathInput('');
  };

  const handleStartGame = (id: string) => {
    if (isDepleted) return alert("Guardian needs energy to enter the arcade!");
    const cd = user.gameCooldowns?.[id];
    if (cd && cd > now) return;
    setGameMode(id);
    setGameResult(null);
    setTapScore(0);
    setTimeLeft(GAMES.find(g => g.id === id)?.time || 15);
    if (id === 'math') genMath();
    if (id === 'hunter') genHunter();
    if (id === 'riddle') genRiddle();
  };

  const handleFinishGame = (rewards?: { coins: number, exp: number }) => {
    let coins = rewards?.coins || 0;
    let exp = rewards?.exp || 0;

    if (gameMode === 'clicker') { coins = Math.min(80, tapScore * 3); exp = tapScore * 6; }
    if (gameMode === 'math') { coins = Math.min(100, tapScore * 10); exp = tapScore * 20; }
    if (gameMode === 'hunter') { coins = Math.min(90, tapScore * 8); exp = tapScore * 15; }
    if (gameMode === 'riddle') { coins = Math.min(150, tapScore * 25); exp = tapScore * 50; }
    
    setGameResult({ coins, exp });
    onUpdate(-12, -10, -8, coins, exp, null, undefined, undefined, undefined, gameMode!);
  };

  const handleSpin = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setTimeout(() => {
      setWheelSpinning(false);
      const isBigWin = Math.random() > 0.85;
      const coins = isBigWin ? 200 : 50;
      const exp = isBigWin ? 300 : 100;
      handleFinishGame({ coins, exp });
    }, 2000);
  };

  const handleShareLevel = () => {
    if (levelUpModal) {
      onPost(`🚀 ACHIEVEMENT UNLOCKED: My Guardian ${user.petName} just reached Sync Level ${levelUpModal}! The metropolis connection is stronger than ever! ✨ #MooderiaGuardian #LevelUp`, 'global');
      setLevelUpModal(null);
    }
  };

  const handleRename = () => {
    if (user.moodCoins < RENAME_COST) return alert("Not enough coins for identity re-sync!");
    if (!newNameInput.trim()) return;
    onUpdate(0, 0, 0, -RENAME_COST, 0, null, undefined, undefined, newNameInput.trim());
    setIsRenaming(false);
    setNewNameInput('');
  };

  if (!user.petHasBeenChosen) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <AnimatePresence mode="wait">
          {creationStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full max-w-sm">
              <PenTool size={60} className="mx-auto text-custom" />
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Design Guardian</h2>
              <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Guardian Alias..." className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black text-center text-lg outline-none focus:border-custom" />
              <button onClick={() => setCreationStep(2)} disabled={!tempName.trim()} className="kahoot-button-custom w-full py-4 rounded-2xl text-white font-black uppercase text-sm shadow-md">Next Phase</button>
            </motion.div>
          )}
          {creationStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-md">
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Select Core</h2>
              <div className="grid grid-cols-5 gap-3">
                {PET_OPTIONS.map(e => <button key={e} onClick={() => setSelectedEmoji(e)} className={`text-3xl p-3 rounded-2xl border-2 transition-all ${selectedEmoji === e ? 'border-custom bg-custom/10 scale-105 shadow-md' : 'border-black/5'}`}>{e}</button>)}
              </div>
              <button onClick={() => setCreationStep(3)} disabled={!selectedEmoji} className="kahoot-button-custom w-full py-4 rounded-2xl text-white font-black uppercase text-sm shadow-md">Initialize</button>
            </motion.div>
          )}
          {creationStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center">
              <div className="text-[120px] animate-bounce drop-shadow-xl">{selectedEmoji}</div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{tempName}</h2>
              <button onClick={() => onUpdate(0, 0, 0, 0, 0, null, selectedEmoji, true, tempName)} className="kahoot-button-custom w-full py-5 rounded-2xl text-white font-black uppercase text-xl shadow-lg">Finalize Bond</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isSleeping) {
    return (
      <div className="p-16 rounded-[3rem] bg-indigo-950 text-white shadow-xl flex flex-col items-center justify-center text-center gap-10 min-h-[400px] border-[8px] border-indigo-900">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}><Moon size={80} className="text-indigo-300 fill-indigo-200" /></motion.div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Neural Stasis</h2>
          <p className="opacity-40 font-black uppercase tracking-widest text-[10px]">Guardian core is recharging...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Cinematic Achievement Pop-up */}
      <AnimatePresence>
        {levelUpModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-hidden">
            <Confetti />
            
            {/* Animated Rays Background */}
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[150vw] h-[150vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,166,2,0.1)_15deg,transparent_30deg)] pointer-events-none"
            />

            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 100 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              className="w-full max-w-sm bg-white rounded-[5rem] p-10 text-center shadow-[0_0_100px_rgba(255,166,2,0.5)] border-[10px] border-yellow-400 relative z-[310]"
            >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <motion.div 
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="bg-yellow-400 p-6 rounded-[2.5rem] shadow-2xl border-4 border-white"
                >
                  <Trophy size={80} className="text-white" />
                </motion.div>
              </div>

              <div className="mt-16 space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none"
                >
                  ACHIEVEMENT!
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-custom/10 inline-block px-6 py-2 rounded-full border-2 border-custom/20"
                >
                  <p className="text-xl font-black text-custom uppercase italic tracking-widest leading-none">Sync Rank {levelUpModal}</p>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-4"
                >
                  The Metropolis recognizes your bond with <span className="text-slate-900">{user.petName}</span>.
                </motion.p>
              </div>

              <div className="flex flex-col gap-4 mt-12">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareLevel} 
                  className="kahoot-button-custom flex items-center justify-center gap-3 py-6 rounded-[2.5rem] text-white font-black uppercase text-lg shadow-xl"
                >
                  <Share2 size={24} /> Broadcast Signal
                </motion.button>
                <button 
                  onClick={() => setLevelUpModal(null)} 
                  className="py-2 text-[11px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Return to Metropolis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {isRenaming && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-slate-900 rounded-[3rem] p-10 text-center shadow-2xl border-4 border-white/10 relative">
              <button 
                onClick={() => setIsRenaming(false)} 
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
              
              <PenTool size={60} className="mx-auto text-custom mb-6" />
              <h3 className="text-2xl font-black italic uppercase mb-2 text-white">Neural Identity Sync</h3>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-6 text-white">Modify Guardian designation for <span className="text-yellow-400 font-black">{RENAME_COST} coins</span></p>
              
              <input 
                type="text" 
                value={newNameInput} 
                onChange={(e) => setNewNameInput(e.target.value)} 
                placeholder="New Identity..." 
                className="w-full p-4 rounded-2xl border-2 bg-white/5 text-white font-black text-center text-lg outline-none border-white/10 focus:border-custom mb-8"
              />

              <div className="flex gap-4">
                <button onClick={() => setIsRenaming(false)} className="flex-1 py-4 border-2 border-white/10 rounded-2xl font-black uppercase text-xs opacity-50 text-white">Abort</button>
                <button onClick={handleRename} disabled={user.moodCoins < RENAME_COST || !newNameInput.trim()} className="flex-1 py-4 kahoot-button-custom text-white rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95">Sync ID</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Pet Display */}
      <div className={`relative p-10 rounded-[4rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-xl flex flex-col items-center overflow-hidden min-h-[440px]`}>
        <div className="absolute top-6 left-6 bg-yellow-400 text-white px-5 py-3 rounded-2xl font-black text-lg shadow-md border-b-4 border-yellow-700 flex items-center gap-2 z-10">
          <Coins size={24}/> {user.moodCoins}
        </div>

        {/* Pet Name & Rename Button */}
        <div className="flex items-center gap-3 mb-2 z-10 mt-2">
           <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{user.petName}</h3>
           <button onClick={() => setIsRenaming(true)} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-custom">
             <Edit2 size={18} />
           </button>
        </div>
        
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
           <div className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full font-black uppercase text-[8px] tracking-widest border border-blue-600/20">Rank {user.petLevel} Guardian</div>
           <div className="w-32 h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5 shadow-inner border border-black/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(user.petExp / getExpNeeded(user.petLevel)) * 100}%` }} className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full" />
           </div>
        </div>

        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            scale: isDepleted ? [1, 0.95, 1] : [1, 1.05, 1]
          }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
          className={`text-[150px] md:text-[240px] my-6 drop-shadow-2xl select-none ${isDepleted ? 'grayscale opacity-70' : ''}`}
        >
          {user.petEmoji}
        </motion.div>

        <div className="w-full max-w-md grid grid-cols-3 gap-6">
          {[
            { label: 'Energy', val: user.petHunger, color: 'bg-red-500' },
            { label: 'Vibe', val: user.petThirst, color: 'bg-blue-500' },
            { label: 'Stasis', val: user.petRest, color: 'bg-green-500' },
          ].map(bar => (
            <div key={bar.label} className="text-center space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{bar.label}</span>
                <span className="text-[9px] font-black opacity-30">{Math.round(bar.val)}%</span>
              </div>
              <div className="h-3 bg-black/5 rounded-full overflow-hidden border border-black/5 shadow-inner relative">
                <motion.div animate={{ width: `${Math.max(0, bar.val)}%` }} className={`h-full ${bar.color} rounded-full`} />
                {bar.val < 20 && (
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-white/20" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {(['Care', 'Shop', 'Arcade'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase border-b-4 transition-all shadow-md ${activeTab === tab ? 'bg-custom border-black/20 text-white translate-y-[-2px]' : 'bg-white text-slate-400 border-gray-100'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {activeTab === 'Shop' && (
            <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
              {ITEMS.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { if(user.moodCoins >= item.cost) onUpdate(item.type === 'hunger' ? item.fill : 0, item.type === 'thirst' ? item.fill : 0, 0, -item.cost, 10); }} 
                  className={`p-6 rounded-3xl bg-white text-slate-900 shadow-md border-2 border-black/5 flex flex-col items-center gap-2 transition-all active:scale-95 ${user.moodCoins < item.cost ? 'opacity-50' : ''}`}
                >
                  <span className="text-5xl mb-2">{item.emoji}</span>
                  <span className="font-black uppercase text-[10px] tracking-widest text-center leading-tight">{item.name}</span>
                  <div className="mt-2 bg-yellow-400 text-white px-4 py-1.5 rounded-xl text-[10px] font-black border-b-4 border-yellow-700 flex items-center gap-1.5 shadow-sm">
                    <Coins size={14}/> {item.cost}
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'Arcade' && !gameMode && (
             <motion.div key="arcade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-4">
               {GAMES.map(game => {
                 const cd = user.gameCooldowns?.[game.id];
                 const isCooling = cd && cd > now;
                 return (
                   <button 
                    key={game.id} 
                    onClick={() => handleStartGame(game.id)} 
                    className={`relative p-6 rounded-3xl bg-white text-slate-900 border-2 border-black/5 shadow-md flex flex-col items-center gap-2 transition-all active:scale-95 ${isDepleted || isCooling ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                   >
                     {isCooling && <div className="absolute inset-0 z-10 bg-black/80 rounded-[1.5rem] flex flex-col items-center justify-center text-white p-2 text-center"><Timer size={24} className="animate-spin mb-1"/><span className="text-[8px] font-black uppercase">Cooling</span></div>}
                     <span className="text-5xl mb-2">{game.emoji}</span>
                     <span className="text-[10px] font-black uppercase text-center leading-tight tracking-widest">{game.name}</span>
                   </button>
                 );
               })}
             </motion.div>
          )}

          {gameMode && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-2xl h-[70vh] rounded-[3rem] text-white text-center shadow-2xl relative border-b-8 border-white/10 flex flex-col ${GAMES.find(g=>g.id===gameMode)?.color}`}>
                  {gameResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-6">
                      <Confetti />
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Trophy size={100} className="text-yellow-300 animate-bounce" /></motion.div>
                      <div className="space-y-4">
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Transmission OK</h4>
                        <div className="flex gap-6 justify-center">
                          <div className="bg-black/30 px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 shadow-inner"><Coins size={32}/> {gameResult.coins}</div>
                          <div className="bg-black/30 px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 shadow-inner"><Sparkles size={32}/> {gameResult.exp} XP</div>
                        </div>
                      </div>
                      <button onClick={() => setGameMode(null)} className="w-full max-w-xs py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-base shadow-lg active:scale-95">Close Terminal</button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                       <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/20 px-6 py-3 rounded-2xl font-black text-2xl tabular-nums shadow-inner border-2 border-white/20">
                         <Timer size={24} /> {timeLeft}s
                       </div>
                       
                       <div className="flex-1 w-full flex flex-col items-center justify-center">
                         {gameMode === 'clicker' && (
                           <div className="flex flex-col items-center gap-8">
                             <p className="text-6xl font-black tabular-nums">{tapScore}</p>
                             <motion.button whileTap={{ scale: 0.85 }} onClick={() => setTapScore(s=>s+1)} className="w-48 h-48 md:w-64 md:h-64 bg-yellow-400 rounded-[3rem] shadow-[0_15px_0_0_#ca8a04] flex items-center justify-center text-8xl font-black border-[12px] border-white/30 hover:scale-105 transition-all"><DollarSign size={80}/></motion.button>
                           </div>
                         )}
                         
                         {gameMode === 'math' && <div className="space-y-8 w-full"><p className="text-7xl md:text-9xl font-black italic tracking-tighter tabular-nums leading-none">{mathProb.q}</p><input type="number" autoFocus value={mathInput} onChange={e => { setMathInput(e.target.value); if(parseInt(e.target.value) === mathProb.a) { setTapScore(s=>s+1); genMath(); } }} className="w-full max-w-sm p-6 rounded-3xl bg-white text-slate-900 font-black text-4xl text-center outline-none shadow-xl border-4 border-black/5" /></div>}
                         
                         {gameMode === 'wheel' && <div className="space-y-12"><motion.div animate={wheelSpinning ? { rotate: 360 * 5 } : {}} transition={{ duration: 2, ease: "easeOut" }} className="text-[120px] drop-shadow-xl leading-none">🎡</motion.div><button onClick={handleSpin} disabled={wheelSpinning} className="bg-white text-orange-500 px-12 py-4 rounded-2xl font-black text-2xl uppercase shadow-lg active:scale-95">Spin!</button></div>}
                         
                         {gameMode === 'hunter' && <div className="relative w-full h-full max-w-lg border-4 border-dashed border-white/20 rounded-3xl overflow-hidden bg-black/10">
                            <motion.button animate={{ x: `${hunterTarget.x}%`, y: `${hunterTarget.y}%` }} onClick={() => { setTapScore(s=>s+1); genHunter(); }} className="absolute w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl border-4 border-white/40 active:scale-75"><Target size={40} /></motion.button>
                         </div>}
                         
                         {gameMode === 'memory' && <div className="grid grid-cols-2 gap-6"><button onClick={() => { setTapScore(s=>s+1); }} className="p-12 md:p-16 bg-white/20 rounded-[2rem] border-4 border-white/30 hover:bg-white/40 transition-all active:scale-90"><Brain size={80} /></button></div>}
                         
                         {gameMode === 'riddle' && <div className="space-y-8 w-full"><p className="text-4xl md:text-7xl font-black italic tracking-widest uppercase leading-none">{riddleWord.scrambled}</p><input type="text" autoFocus value={mathInput} onChange={e => { setMathInput(e.target.value.toUpperCase()); if(e.target.value.toUpperCase() === riddleWord.original) { setTapScore(s=>s+1); genRiddle(); } }} className="w-full max-w-sm p-6 rounded-3xl bg-white text-slate-900 font-black text-2xl text-center outline-none shadow-xl uppercase border-4 border-black/5" /></div>}
                       </div>

                       <p className="mt-8 opacity-40 font-black uppercase tracking-widest text-[10px] italic">NEURAL INTERFACE ACTIVE</p>
                    </div>
                  )}
              </motion.div>
            </div>
          )}

          {activeTab === 'Care' && (
            <motion.div key="care" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SLEEP_MODES.map(mode => (
                  <button key={mode.id} onClick={() => onUpdate(0,0,mode.rest, -mode.cost, 5, Date.now() + mode.duration * 60000)} className="p-8 rounded-3xl bg-white text-slate-900 shadow-md border-2 border-black/5 flex flex-col items-center gap-4 transition-all active:scale-95">
                    <span className="text-6xl leading-none">{mode.emoji}</span>
                    <p className="font-black uppercase text-base tracking-tighter text-center leading-none">{mode.name}</p>
                    <p className="text-[10px] font-black text-blue-500 opacity-60 uppercase tracking-widest">+{mode.rest}% Core</p>
                    <div className="bg-yellow-400 text-white px-6 py-2 rounded-2xl text-xs font-black border-b-4 border-yellow-700 flex items-center gap-2 shadow-sm mt-2"><Coins size={18}/> {mode.cost}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => onUpdate(0,0,0,0,15)} className="w-full p-12 rounded-[3.5rem] bg-custom text-white shadow-lg flex flex-col items-center justify-center gap-4 border-b-8 border-black/20 active:translate-y-2 active:border-b-0 transition-all group overflow-hidden relative">
                <motion.div 
                  initial={{ scale: 1 }}
                  whileTap={{ scale: 1.5, rotate: 10 }}
                  className="z-10"
                >
                  <Heart size={80} className="group-hover:animate-ping" />
                </motion.div>
                <div className="text-center z-10">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Sync Core</h4>
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mt-2">Harmonize Vibe (+15 XP)</p>
                </div>
                {/* Visual heart feedback */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodPetSection;
