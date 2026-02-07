
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { JOB_TITLES } from '../constants';
import { Camera, Edit3, Check, Upload } from 'lucide-react';

interface ProfileSectionProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  isDarkMode: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onUpdate, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    title: user.title,
    profileColor: user.profileColor || '#46178f'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdate({ profilePic: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className={`rounded-[3rem] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5`}>
        <div className="h-48 md:h-64 w-full relative" style={{ backgroundColor: user.profileColor || '#46178f' }}>
           <div className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden">
             <h1 className="text-[20vw] font-black text-white italic whitespace-nowrap uppercase tracking-tighter select-none">{user.title}</h1>
           </div>
           <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                 <div 
                    onClick={triggerFileSelect}
                    className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-black/5 relative group bg-indigo-500 flex items-center justify-center text-white text-5xl font-black italic cursor-pointer"
                 >
                    {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" alt="Profile" /> : (user.displayName || 'M')[0]}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera size={32} />
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                 </div>
              </div>
           </div>
           <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all shadow-xl">
             <Edit3 size={24} />
           </button>
        </div>

        <div className="pt-20 px-8 md:px-12 pb-10 space-y-4">
           <div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">{user.displayName}</h2>
              <div className="flex items-center gap-3">
                 <span className="bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-600/20">{user.title}</span>
                 <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">ID:{user.citizenCode}</p>
              </div>
           </div>
           <p className="text-base font-bold opacity-60 max-w-2xl leading-relaxed italic">
             "{user.bio || 'Navigating the vibrant frequencies of Mooderia.'}"
           </p>

           <div className="pt-8 flex gap-12 border-t border-black/5">
              <div className="text-center md:text-left"><p className="text-3xl font-black italic leading-none">{user.moodStreak || 0}</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Streak</p></div>
              <div className="text-center md:text-left"><p className="text-3xl font-black italic leading-none">{user.moodCoins || 0}</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Coins</p></div>
              <div className="text-center md:text-left"><p className="text-3xl font-black italic leading-none">{(user.moodHistory || []).length}</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Moods</p></div>
           </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border-4 border-white/10 relative`}>
              <h3 className="text-3xl font-black uppercase italic mb-8">Synchronize ID</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 ml-2">Identity Alias</p>
                  <input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 ml-2">Metropolis Role</p>
                  <select value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-indigo-500 appearance-none">
                    {JOB_TITLES.map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 ml-2">Aura Color (Banner)</p>
                  <input type="color" value={editForm.profileColor} onChange={e => setEditForm({...editForm, profileColor: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer bg-transparent border-2 border-black/5" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-black uppercase text-xs opacity-40">Cancel</button>
                  <button onClick={handleSave} className="flex-1 kahoot-button-custom py-4 rounded-2xl text-white font-black uppercase flex items-center justify-center gap-2"><Check size={18}/> Commit Sync</button>
                </div>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
