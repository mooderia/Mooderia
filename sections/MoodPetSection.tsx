
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Coins, Heart, Trophy, ShoppingBag, Sparkles, X, Check, ArrowLeft } from 'lucide-react';
import { PET_BACKGROUNDS, getExpNeeded, t } from '../constants';

interface MoodPetSectionProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  isDarkMode: boolean;
  language: 'English' | 'Filipino';
}

const PET_EMOJIS = ['🐱', '🐶', '🦊', '🦁', '🐨', '🐼', '🦄', '🐲', '🐸', '🐹'];

const MoodPetSection: React.FC<MoodPetSectionProps> = ({ user, onUpdate, isDarkMode, language }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Interact' | 'Shop'>('Interact');
  const [interactionAnim, setInteractionAnim] = useState<string | null>(null);

  // New Pet Selection State
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [tempPetName, setTempPetName] = useState('');

  const handleCreatePet = () => {
    if (!tempPetName.trim() || !selectedEmoji) return;
    onUpdate({
      petName: tempPetName,
      petEmoji: selectedEmoji,
      petHasBeenChosen: true,
      petLevel: 1,
      petExp: 0,
      petBackground: 'default',
      unlockedBackgrounds: ['default']
    });
  };

  const handleBuyBackground = (bgId: string, price: number) => {
    if (user.moodCoins < price) {
      alert("Not enough coins!");
      return;
    }
    onUpdate({
      moodCoins: user.moodCoins - price,
      unlockedBackgrounds: [...(user.unlockedBackgrounds || []), bgId],
      petBackground: bgId
    });
  };

  const handleEquipBackground = (bgId: string) => {
    onUpdate({ petBackground: bgId });
  };

  const triggerInteraction = () => {
    const animations = ['bounce', 'shake', 'spin', 'pulse'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setInteractionAnim(randomAnim);
    setTimeout(() => setInteractionAnim(null), 1000);
  };

  if (!user.petHasBeenChosen) {
    return (
      <div className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-xl text-center min-h-[400px] flex flex-col justify-center`}>
        {!selectedEmoji ? (
          <>
             <h3 className="text-3xl font-black uppercase italic mb-8">{t('choosePet', language)}</h3>
             <div className="grid grid-cols-5 gap-4">
               {PET_EMOJIS.map(e => (
                 <button 
                   key={e} 
                   onClick={() => setSelectedEmoji(e)} 
                   className="text-4xl p-4 rounded-2xl hover:bg-black/5 transition-all hover:scale-110 active:scale-95"
                 >
                   {e}
                 </button>
               ))}
             </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <button onClick={() => setSelectedEmoji(null)} className="absolute top-8 left-8 p-2 opacity-30 hover:opacity-100"><ArrowLeft size={24}/></button>
            <div className="text-8xl animate-bounce mb-6">{selectedEmoji}</div>
            <h3 className="text-2xl font-black uppercase italic">Name your Guardian</h3>
            <input 
              autoFocus
              value={tempPetName}
              onChange={e => setTempPetName(e.target.value)}
              placeholder="Enter name..."
              className="w-full max-w-xs p-4 rounded-2xl border-2 bg-black/5 font-black text-center text-xl outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleCreatePet}
              disabled={!tempPetName.trim()}
              className="kahoot-button-custom w-full max-w-xs py-4 rounded-2xl text-white font-black uppercase shadow-lg disabled:opacity-50"
            >
              Adopt Guardian
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  const currentBg = PET_BACKGROUNDS.find(b => b.id === user.petBackground) || PET_BACKGROUNDS[0];
  const expNeeded = getExpNeeded(user.petLevel);

  return (
    <div className="space-y-6">
      <div className={`p-10 rounded-[4rem] shadow-xl border-4 border-black/5 flex flex-col items-center relative overflow-hidden transition-all duration-500 ${currentBg.style} min-h-[400px] justify-center`}>
        
        {/* Top UI */}
        <div className="absolute top-8 left-8 right-8 flex justify-between z-10">
          <div className="bg-yellow-400 text-white px-4 py-2 rounded-2xl font-black shadow-lg flex items-center gap-2 border-2 border-yellow-600"><Coins size={20}/> {user.moodCoins}</div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-black shadow-lg border-2 border-indigo-800 flex items-center gap-2"><Trophy size={18}/> LVL {user.petLevel}</div>
        </div>

        {/* Pet Display */}
        <motion.div 
          animate={interactionAnim === 'bounce' ? { y: [-20, 20, -20] } : 
                   interactionAnim === 'shake' ? { x: [-10, 10, -10, 10, 0] } :
                   interactionAnim === 'spin' ? { rotate: 360 } :
                   interactionAnim === 'pulse' ? { scale: [1, 1.2, 1] } :
                   { y: [0, -10, 0] }}
          transition={{ duration: interactionAnim ? 0.5 : 3, repeat: interactionAnim ? 0 : Infinity }}
          className="text-[140px] drop-shadow-2xl cursor-pointer select-none"
          onClick={triggerInteraction}
        >
          {user.petEmoji}
        </motion.div>
        
        <h4 className="text-3xl font-black uppercase italic tracking-tighter mt-4 text-white drop-shadow-md">{user.petName}</h4>

        {/* EXP Bar */}
        <div className="absolute bottom-8 left-10 right-10">
           <div className="flex justify-between text-white text-[10px] font-black uppercase mb-1 drop-shadow-md">
              <span>{t('exp', language)}</span>
              <span>{user.petExp} / {expNeeded}</span>
           </div>
           <div className="h-4 bg-black/20 rounded-full overflow-hidden border-2 border-white/20 backdrop-blur-sm">
             <motion.div animate={{ width: `${Math.min(100, (user.petExp / expNeeded) * 100)}%` }} className="h-full bg-gradient-to-r from-green-400 to-emerald-500" />
           </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['Interact', 'Shop'] as const).map(tabName => (
          <button key={tabName} onClick={() => setActiveSubTab(tabName)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase border-b-4 transition-all shadow-md ${activeSubTab === tabName ? 'bg-indigo-600 text-white translate-y-[-2px]' : 'bg-white text-slate-400'}`}>
             {tabName === 'Interact' ? t('care', language) : t('shop', language)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeSubTab === 'Interact' && (
           <div className="col-span-full p-10 text-center opacity-50 font-black italic uppercase">
              Tap your Guardian to play! <br/> Complete tasks in City Hall to gain Coins and EXP.
           </div>
        )}
        {activeSubTab === 'Shop' && (
           <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
             {PET_BACKGROUNDS.map(bg => {
               const isOwned = (user.unlockedBackgrounds || ['default']).includes(bg.id);
               const isEquipped = user.petBackground === bg.id;
               return (
                 <div key={bg.id} className={`p-4 rounded-3xl border-4 flex items-center gap-4 ${isEquipped ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-black/5'}`}>
                    <div className={`w-16 h-16 rounded-2xl ${bg.style} shadow-inner border-2 border-black/5`}></div>
                    <div className="flex-1">
                       <h5 className="font-black text-sm uppercase">{bg.name}</h5>
                       {!isOwned && <div className="text-[10px] font-black text-yellow-500 flex items-center gap-1"><Coins size={10}/> {bg.price}</div>}
                    </div>
                    {isOwned ? (
                      <button 
                        onClick={() => handleEquipBackground(bg.id)}
                        disabled={isEquipped}
                        className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase ${isEquipped ? 'bg-green-500 text-white opacity-50' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}
                      >
                        {isEquipped ? t('equipped', language) : 'Equip'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuyBackground(bg.id, bg.price)}
                        className="px-4 py-2 rounded-xl bg-yellow-400 text-white font-black text-[10px] uppercase shadow-lg active:scale-95 border-b-4 border-yellow-600"
                      >
                        {t('buy', language)}
                      </button>
                    )}
                 </div>
               )
             })}
           </div>
        )}
      </div>
    </div>
  );
};

export default MoodPetSection;
