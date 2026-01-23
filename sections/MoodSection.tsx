
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Globe, Users, MessageSquare, Repeat, Edit2, Trash2, Check, X, Clock, Info } from 'lucide-react';
import { User, Post } from '../types';
import MoodPetSection from './MoodPetSection';
import { checkContentSafety } from '../services/geminiService';

interface MoodSectionProps {
  user: User;
  posts: Post[];
  onPost: (content: string, visibility: 'global' | 'circle') => void;
  onEditPost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onHeart: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onCommentInteraction: (postId: string, commentId: string, action: 'heart' | 'reply', replyText?: string) => void;
  onRepost: (post: Post) => void;
  onFollow: (username: string) => void;
  onBlock: (username: string) => void;
  isDarkMode: boolean;
  onNavigateToProfile: (username: string) => void;
  onUpdatePet: (hunger: number, thirst: number, rest: number, coins: number, exp?: number, sleepUntil?: number | null, newEmoji?: string, markChosen?: boolean, newName?: string, gameCooldownId?: string) => void;
  onViolation: (reason: string) => void;
}

const MoodSection: React.FC<MoodSectionProps> = ({ 
  user, posts, onPost, onEditPost, onDeletePost, onHeart, onComment, 
  onRepost, isDarkMode, onNavigateToProfile, onUpdatePet, onViolation 
}) => {
  const [subTab, setSubTab] = useState<'Express' | 'Mood Pet'>('Express');
  const [postContent, setPostContent] = useState('');
  const [feedFilter, setFeedFilter] = useState<'Global' | 'Circle'>('Global');
  const [postVisibility, setPostVisibility] = useState<'global' | 'circle'>('global');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [showLikersId, setShowLikersId] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => !user.blockedUsers.includes(p.author));
    if (feedFilter === 'Global') {
      return result.filter(p => p.visibility === 'global');
    }
    return result.filter(p => p.visibility === 'circle' && (user.following.includes(p.author) || p.author === user.username));
  }, [posts, feedFilter, user.following, user.username, user.blockedUsers]);

  const handlePost = async () => {
    if (!postContent.trim() || isBroadcasting) return;
    setIsBroadcasting(true);
    try {
      const safety = await checkContentSafety(postContent);
      if (safety.isInappropriate) {
        onViolation(safety.reason);
        setIsBroadcasting(false);
        return;
      }
    } catch (e) {}
    onPost(postContent, postVisibility);
    setPostContent('');
    setIsBroadcasting(false);
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditBuffer(post.content);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editBuffer.trim()) return;
    try {
      const safety = await checkContentSafety(editBuffer);
      if (safety.isInappropriate) {
        onViolation(safety.reason);
        return;
      }
    } catch (e) {}
    onEditPost(postId, editBuffer);
    setEditingPostId(null);
  };

  const handleDelete = (postId: string) => {
    if (confirm("Permanently erase this signal from the metropolis?")) {
      onDeletePost(postId);
    }
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    onComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="flex flex-col gap-6 pb-20 h-full min-h-0">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {['Express', 'Mood Pet'].map((t) => (
          <button key={t} onClick={() => setSubTab(t as any)} className={`px-6 py-3 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap uppercase tracking-tighter border-b-4 ${subTab === t ? 'bg-custom border-black/20 text-white shadow-lg translate-y-[-2px]' : isDarkMode ? 'bg-slate-800 border-slate-900 text-white/30' : 'bg-white border-gray-100 text-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {subTab === 'Express' && (
            <motion.div key="express" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className={`p-6 md:p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-xl`}>
                <textarea 
                  value={postContent} 
                  onChange={(e) => setPostContent(e.target.value)} 
                  disabled={isBroadcasting}
                  placeholder={isBroadcasting ? "Scanning Frequency..." : "Broadcast your mood..."} 
                  className={`w-full ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-slate-900'} p-6 rounded-3xl border-2 border-black/5 focus:border-custom outline-none font-bold text-lg shadow-inner min-h-[120px] resize-none`} 
                />
                <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                  <div className="flex gap-2 bg-black/5 p-1.5 rounded-2xl">
                    <button onClick={() => setPostVisibility('global')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${postVisibility === 'global' ? 'bg-custom text-white' : 'opacity-40'}`}><Globe size={14}/> GLOBAL</button>
                    <button onClick={() => setPostVisibility('circle')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${postVisibility === 'circle' ? 'bg-custom text-white' : 'opacity-40'}`}><Users size={14}/> CIRCLE</button>
                  </div>
                  <button onClick={handlePost} disabled={isBroadcasting} className="kahoot-shadow kahoot-button-custom px-8 py-4 text-white rounded-2xl font-black text-xs flex items-center gap-2 disabled:opacity-50">
                    <Send size={18} /> {isBroadcasting ? 'SENDING...' : 'BROADCAST'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 bg-black/5 p-1 rounded-xl w-fit">
                <button onClick={() => setFeedFilter('Global')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${feedFilter === 'Global' ? 'bg-white text-custom shadow-sm' : 'opacity-40'}`}>Metropolis Feed</button>
                <button onClick={() => setFeedFilter('Circle')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${feedFilter === 'Circle' ? 'bg-white text-custom shadow-sm' : 'opacity-40'}`}>Neural Circle</button>
              </div>

              <div className="space-y-6 pb-12">
                {filteredPosts.map(post => {
                  const isAuthor = post.author === user.username;
                  const hasLiked = post.likedBy?.includes(user.username);
                  
                  return (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} border-2 border-black/5 shadow-md`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => onNavigateToProfile(post.author)} className="w-10 h-10 rounded-xl bg-custom text-white font-black flex items-center justify-center italic shadow-sm">{post.author[0].toUpperCase()}</button>
                          <div>
                            <h4 className="font-black text-sm">@{post.author}</h4>
                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {new Date(post.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {isAuthor && (
                          <div className="flex gap-2">
                             <button onClick={() => startEdit(post)} className="p-2 hover:bg-black/5 rounded-lg text-blue-500 transition-colors"><Edit2 size={16}/></button>
                             <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-black/5 rounded-lg text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        )}
                      </div>

                      {editingPostId === post.id ? (
                        <div className="space-y-4 mb-6">
                           <textarea value={editBuffer} onChange={e => setEditBuffer(e.target.value)} className={`w-full p-4 rounded-2xl border-2 font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100'} outline-none focus:border-custom resize-none`} />
                           <div className="flex gap-2 justify-end">
                             <button onClick={() => setEditingPostId(null)} className="p-3 bg-gray-200 text-slate-600 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                             <button onClick={() => handleSaveEdit(post.id)} className="p-3 bg-custom text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Check size={14}/> Save</button>
                           </div>
                        </div>
                      ) : (
                        <p className="text-base font-bold italic opacity-90 mb-4 leading-relaxed break-words">"{post.content}"</p>
                      )}

                      <div className="flex items-center gap-6 pt-4 border-t border-black/5">
                        <div className="flex flex-col items-center">
                          <button onClick={() => onHeart(post.id)} className={`flex items-center gap-1.5 font-black text-[10px] uppercase transition-all active:scale-125 ${hasLiked ? 'text-red-500' : 'text-custom'}`}>
                            <Heart size={16} fill={hasLiked ? "currentColor" : "none"} /> {post.likedBy?.length || 0} SYNC
                          </button>
                          {post.likedBy && post.likedBy.length > 0 && (
                            <button onClick={() => setShowLikersId(showLikersId === post.id ? null : post.id)} className="text-[7px] font-black uppercase opacity-20 hover:opacity-100 mt-1">Who Synced?</button>
                          )}
                        </div>
                        <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-1.5 text-blue-500 font-black text-[10px] uppercase"><MessageSquare size={16} /> {post.comments?.length || 0} ECHOES</button>
                        {!isAuthor && <button onClick={() => onRepost(post)} className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase"><Repeat size={16} /> RE-SYNC</button>}
                      </div>

                      <AnimatePresence>
                        {showLikersId === post.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 p-4 bg-black/5 rounded-2xl border-l-4 border-red-500/30 overflow-hidden">
                             <p className="text-[8px] font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Synchronized Citizens:</p>
                             <div className="flex flex-wrap gap-2">
                               {post.likedBy?.map(username => (
                                 <span key={username} onClick={() => onNavigateToProfile(username)} className="px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full text-[9px] font-black border border-black/5 cursor-pointer hover:bg-white transition-colors">@{username}</span>
                               ))}
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {expandedPostId === post.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-6 space-y-4 overflow-hidden">
                             <div className="flex gap-2">
                               <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Add an echo..." className={`flex-1 p-3 rounded-xl border-2 text-xs font-bold outline-none focus:border-custom ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`} />
                               <button onClick={() => handleAddComment(post.id)} className="bg-custom text-white px-4 rounded-xl shadow-md"><Send size={16} /></button>
                             </div>
                             {post.comments?.map(c => (
                               <div key={c.id} className="flex gap-3 p-3 bg-black/5 rounded-2xl">
                                  <div className="w-8 h-8 rounded-lg bg-custom/20 text-custom font-black flex items-center justify-center text-[10px]">{c.author[0]}</div>
                                  <div>
                                    <p className="text-[10px] font-black">@{c.author}</p>
                                    <p className="text-xs font-bold opacity-80 leading-relaxed">"{c.text}"</p>
                                  </div>
                               </div>
                             ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {subTab === 'Mood Pet' && (
            <motion.div key="pet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <MoodPetSection user={user} isDarkMode={isDarkMode} onUpdate={onUpdatePet} onPost={onPost} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodSection;
