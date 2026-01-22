
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Post } from '../types';
import { Heart, Camera, Repeat, X, Star, Zap, Activity, Globe, UserCog, ShieldAlert, AlertTriangle, MessageSquare, TrendingUp, Trophy, Clock as ClockIcon } from 'lucide-react';
import { JOB_TITLES } from '../constants';

interface ProfileSectionProps {
  user: User;
  allPosts: Post[];
  isDarkMode: boolean;
  currentUser: User;
  onEditProfile?: (displayName: string, username: string, profilePic?: string, title?: string, bannerPic?: string, profileColor?: string, bio?: string) => void;
  onBlock?: (username: string) => void;
  onFollow?: (username: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, allPosts, isDarkMode, currentUser, onEditProfile, onBlock, onFollow }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'Posts' | 'Reposts' | 'Stats'>('Posts');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    username: user.username,
    profilePic: user.profilePic || '',
    title: user.title || 'Citizen',
    profileColor: user.profileColor || '#e21b3c',
    bio: user.bio || ''
  });

  const isOwnProfile = currentUser.username === user.username;
  const isFollowing = currentUser.following.includes(user.username);
  
  const myPosts = useMemo(() => allPosts.filter(p => p.author === user.username && !p.isRepost), [allPosts, user.username]);
  const myReposts = useMemo(() => allPosts.filter(p => p.author === user.username && p.isRepost), [allPosts, user.username]);

  const nameFontSize = useMemo(() => {
    const len = user.displayName.length;
    if (len > 35) return 'text-xl md:text-2xl';
    if (len > 20) return 'text-2xl md:text-4xl';
    return 'text-3xl md:text-5xl';
  }, [user.displayName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm(prev => ({ ...prev, profilePic: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onEditProfile?.(editForm.displayName, editForm.username, editForm.profilePic, editForm.title, undefined, editForm.profileColor, editForm.bio);
    setIsEditing(false);
  };

  const accentColor = user.profileColor || '#e21b3c';

  const availableTitles = useMemo(() => {
    return JOB_TITLES.filter(t => t !== 'Creator' || user.email === 'travismiguel014@gmail.com');
  }, [user.email]);

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Decorative Banner - Ultra Large Watermark Title */}
      <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-xl border-4 border-black/5 relative`}>
        <div className="h-40 md:h-64 lg:h-80 w-full relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <h1 className="text-[12vw] md:text-[18vw] font-black text-white/10 italic uppercase tracking-tighter whitespace-nowrap overflow-hidden leading-none select-none pointer-events-none absolute w-full text-center">
            {user.title}
          </h1>

          <div className="relative z-10 flex items-center justify-center">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/30 backdrop-blur-md px-6 py-2 md:py-4 rounded-2xl border-2 border-white/20 shadow-lg text-center">
                <p className="text-[7px] md:text-[9px] font-black text-white/50 uppercase tracking-[0.4em]">METROPOLIS DESIGNATION</p>
                <h2 className="text-sm md:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{user.title}</h2>
             </motion.div>
          </div>
        </div>

        <div className="px-6 md:px-10 pb-6 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 -mt-10 md:-mt-16 relative z-10">
          <div className={`w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-3xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'} p-1.5 md:p-2.5 shadow-xl shrink-0`}>
             <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-black/5 relative shadow-inner" style={{ backgroundColor: accentColor }}>
               {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl md:text-5xl font-black uppercase italic">{user.displayName[0]}</div>}
             </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2 min-w-0">
            <h2 className={`${nameFontSize} font-black italic uppercase tracking-tighter leading-none mb-2 break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.displayName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">@{user.username}</p>
              <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">Citizen Verified</div>
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center md:justify-end gap-3 mt-4 md:mt-0">
            {isOwnProfile ? (
              <button onClick={() => setIsEditing(true)} className="kahoot-button-custom p-4 md:p-5 text-white rounded-2xl font-black shadow-md flex items-center justify-center active:scale-90 transition-all">
                <UserCog size={24} />
              </button>
            ) : (
              <>
                <button onClick={() => onFollow?.(user.username)} className={`px-6 md:px-8 py-3 md:py-4 text-white rounded-2xl font-black text-xs uppercase shadow-md transition-all ${isFollowing ? 'bg-red-500/20 text-red-500 border-2 border-red-500' : 'kahoot-button-custom'}`}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button onClick={() => setShowBlockConfirm(true)} className="bg-red-600/10 p-3 md:p-4 rounded-2xl border-2 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                  <ShieldAlert size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-6 md:px-10 py-6 italic font-bold opacity-60 text-sm md:text-lg border-t border-black/5 leading-relaxed">
          "{user.bio || 'Navigating the vibrant frequencies of Mooderia.'}"
        </div>

        {/* Unified Stat Row */}
        <div className="px-6 md:px-10 py-6 bg-black/5 flex flex-row flex-wrap md:flex-nowrap justify-around md:justify-start items-center gap-6 md:gap-12 border-t border-black/5">
           <div className="text-center md:text-left"><p className="text-xl md:text-3xl font-black italic leading-none">{user.followers.length}</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Followers</p></div>
           <div className="text-center md:text-left"><p className="text-xl md:text-3xl font-black italic leading-none">{user.following.length}</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Following</p></div>
           <div className="md:ml-auto bg-orange-500 text-white px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl flex items-center gap-3 shadow-lg border-b-6 border-orange-700">
             <TrendingUp size={20} className="md:w-6 md:h-6 animate-pulse" />
             <div><p className="text-sm md:text-2xl font-black leading-none italic">{user.moodStreak}</p><p className="text-[8px] font-black opacity-60 uppercase">Streak</p></div>
           </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['Posts', 'Reposts', 'Stats'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 md:py-6 rounded-2xl font-black text-[10px] md:text-xs uppercase border-b-4 md:border-b-6 transition-all shadow-md ${activeTab === tab ? 'bg-custom border-black/20 text-white translate-y-[-2px]' : isDarkMode ? 'bg-slate-800 text-white/30 border-slate-900' : 'bg-white text-slate-400 border-gray-100'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Posts' && (
            <React.Fragment key="posts">
              {myPosts.length > 0 ? myPosts.map(post => (
                <motion.div key={post.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-2 border-black/5 shadow-md relative group`}>
                  <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-2"><ClockIcon size={12} className="opacity-20"/><p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</p></div><Globe size={12} className="opacity-20"/></div>
                  <p className="font-bold text-sm md:text-lg mb-6 leading-relaxed italic opacity-90 break-words line-clamp-3">"{post.content}"</p>
                  <div className="flex items-center gap-6 pt-4 border-t border-black/5">
                    <span className="flex items-center gap-2 text-custom font-black text-[9px] md:text-xs uppercase"><Heart size={16} fill={post.hearts > 0 ? "currentColor" : "none"} /> {post.hearts} Sync</span>
                    <span className="flex items-center gap-2 text-blue-500 font-black text-[9px] md:text-xs uppercase"><MessageSquare size={16} /> {post.comments.length} Echoes</span>
                  </div>
                </motion.div>
              )) : <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-lg italic tracking-widest">No broadcasts.</div>}
            </React.Fragment>
          )}

          {activeTab === 'Reposts' && (
            <React.Fragment key="reposts">
              {myReposts.length > 0 ? myReposts.map(post => (
                <motion.div key={post.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900 border-green-500/10' : 'bg-white border-green-500/5'} border-2 shadow-md relative`}>
                  <div className="flex items-center gap-3 mb-4"><div className="bg-green-500/10 p-2 rounded-lg text-green-500"><Repeat size={16} /></div><p className="text-[9px] font-black uppercase text-green-500 italic truncate">Echoed from @{post.originalAuthor}</p></div>
                  <p className="font-bold text-sm md:text-lg mb-6 leading-relaxed italic opacity-90">"{post.content}"</p>
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase text-custom"><Heart size={16} /> {post.hearts} Resonance</div>
                </motion.div>
              )) : <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-lg italic tracking-widest">No echoed signals.</div>}
            </React.Fragment>
          )}

          {activeTab === 'Stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { icon: <Heart size={32} className="text-red-500" />, val: myPosts.reduce((acc, p) => acc + p.hearts, 0), label: 'Resonance' },
                 { icon: <Trophy size={32} className="text-yellow-500" />, val: user.likesReceived, label: 'Influence' },
                 { icon: <Zap size={32} className="text-blue-500" />, val: user.petLevel, label: 'Guardian Rank' }
               ].map((stat, i) => (
                 <div key={i} className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-2 border-black/5 shadow-md text-center`}>
                    <div className="flex justify-center mb-4">{stat.icon}</div>
                    <p className="text-2xl md:text-3xl font-black italic">{stat.val}</p>
                    <p className="text-[9px] font-black uppercase opacity-40 mt-2 tracking-widest">{stat.label}</p>
                 </div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal for Blocking */}
      <AnimatePresence>
        {showBlockConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-md rounded-[3rem] p-8 text-center border-4 border-red-600/20`}>
              <AlertTriangle className="mx-auto mb-6 text-red-600 animate-bounce" size={60} />
              <h3 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter mb-4 text-red-600">Restrict Signal?</h3>
              <p className="text-[10px] md:text-sm font-bold opacity-60 mb-10 leading-relaxed uppercase tracking-tight">Severing connection with <span className="text-red-600">@{user.username}</span> will apply mutual invisibility across the metropolis.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowBlockConfirm(false)} className="flex-1 py-4 border-4 border-black/10 rounded-2xl font-black uppercase text-[10px] opacity-50">Abort</button>
                <button onClick={() => { onBlock?.(user.username); setShowBlockConfirm(false); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Restrict ID</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Editor */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border-4 border-white/10`}>
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Sync ID</h3><button onClick={() => setIsEditing(false)} className="bg-black/10 p-2 rounded-full"><X size={28} className="opacity-40" /></button></div>
              <div className="space-y-6 overflow-y-auto max-h-[70vh] fading-scrollbar pr-4">
                <div className="flex justify-center mb-8"><div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-black/5 bg-custom flex items-center justify-center shadow-lg">{editForm.profilePic ? <img src={editForm.profilePic} className="w-full h-full object-cover" /> : <span className="text-white text-4xl font-black">{editForm.displayName[0]}</span>}</div><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"><Camera className="text-white" size={40}/></div><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" /></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><p className="text-[9px] font-black uppercase opacity-30 ml-2">Identity Alias</p><input type="text" value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-custom text-sm" /></div>
                  <div className="space-y-2"><p className="text-[9px] font-black uppercase opacity-30 ml-2">Metropolis Role</p><select value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full p-4 rounded-xl border-2 bg-black/5 font-black outline-none focus:border-custom appearance-none text-sm">{availableTitles.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
                </div>
                <div className="space-y-2"><p className="text-[9px] font-black uppercase opacity-30 ml-2">Internal Aura (Color)</p><input type="color" value={editForm.profileColor} onChange={e => setEditForm({...editForm, profileColor: e.target.value})} className="h-12 w-full rounded-xl cursor-pointer bg-transparent border-2 border-black/5" /></div>
                <div className="space-y-2"><p className="text-[9px] font-black uppercase opacity-30 ml-2">Neural Bio (Max 150)</p><textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full p-4 rounded-xl border-2 bg-black/5 font-bold outline-none focus:border-custom text-sm" rows={3} maxLength={150} /></div>
                <button onClick={handleSave} className="kahoot-button-custom w-full py-5 rounded-2xl text-white font-black uppercase text-base shadow-lg mt-4">Authorize Sync</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSection;
