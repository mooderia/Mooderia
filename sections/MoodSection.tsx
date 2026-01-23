
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Sparkles, Brain, Clock, Globe, Users, MessageSquare, Repeat, Reply, Info } from 'lucide-react';
import { User, Post, Comment } from '../types';
import MoodPetSection from './MoodPetSection';
import { checkContentSafety } from '../services/geminiService';

interface MoodSectionProps {
  user: User;
  posts: Post[];
  onPost: (content: string, visibility: 'global' | 'circle') => void;
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

const MoodSection: React.FC<MoodSectionProps> = ({ user, posts, onPost, onHeart, onComment, onCommentInteraction, onRepost, onFollow, onBlock, isDarkMode, onNavigateToProfile, onUpdatePet, onViolation }) => {
  const [subTab, setSubTab] = useState<'Express' | 'Teller' | 'Scan' | 'Mood Pet'>('Express');
  const [postContent, setPostContent] = useState('');
  const [feedFilter, setFeedFilter] = useState<'Global' | 'Circle'>('Global');
  const [postVisibility, setPostVisibility] = useState<'global' | 'circle'>('global');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const [tellerQuestion, setTellerQuestion] = useState('');
  const [tellerResponse, setTellerResponse] = useState('');
  const [isTellerLoading, setIsTellerLoading] = useState(false);

  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({ Happy: 0, Angry: 0, Tired: 0, Normal: 0, Excited: 0 });
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string, commentId: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const filteredPosts = useMemo(() => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
    const usersWhoBlockedMe = allUsers.filter(u => u.blockedUsers.includes(user.username)).map(u => u.username);
    
    let result = posts.filter(p => 
      !user.blockedUsers.includes(p.author) && 
      !usersWhoBlockedMe.includes(p.author)
    );

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
    } catch (e) {
      // If AI fails, we allow the post to ensure the app doesn't feel "broken"
      console.warn("AI Safety Scanner Unavailable. Defaulting to safe.");
    }

    onPost(postContent, postVisibility);
    setPostContent('');
    setIsBroadcasting(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    onComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReply = (postId: string, commentId: string) => {
    if (!replyContent.trim()) return;
    onCommentInteraction(postId, commentId, 'reply', replyContent);
    setReplyContent('');
    setReplyingTo(null);
  };

  const renderComment = (postId: string, comment: Comment, depth = 0) => (
    <div key={comment.id} className={`mt-4 ${depth > 0 ? 'ml-6 md:ml-10 border-l-2 border-black/5 pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-custom text-white font-black flex items-center justify-center shrink-0 text-sm italic">{comment.author[0].toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs">@{comment.author}</span>
            <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">{new Date(comment.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-sm font-bold opacity-80 mt-1 leading-relaxed">"{comment.text}"</p>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => onCommentInteraction(postId, comment.id, 'heart')} className="flex items-center gap-1 text-[9px] font-black uppercase text-custom transition-transform active:scale-95"><Heart size={12} fill={comment.hearts > 0 ? "currentColor" : "none"} /> {comment.hearts} Sync</button>
            <button 
              onClick={() => setReplyingTo(replyingTo?.commentId === comment.id ? null : { postId, commentId: comment.id })} 
              className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 transition-transform active:scale-95"
            >
              <Reply size={12} /> Echo
            </button>
          </div>
          
          <AnimatePresence>
            {replyingTo?.commentId === comment.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={replyContent} 
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Echo back..."
                    className={`flex-1 p-2 rounded-xl border-2 text-[10px] font-bold outline-none focus:border-custom ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    onKeyPress={e => e.key === 'Enter' && handleReply(postId, comment.id)}
                  />
                  <button onClick={() => handleReply(postId, comment.id)} className="bg-custom text-white px-3 rounded-xl shadow-md transition-transform active:scale-95"><Send size={12} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {comment.replies && comment.replies.map(reply => renderComment(postId, reply, depth + 1))}
    </div>
  );

  const handleTeller = () => {
    if (!tellerQuestion.trim()) return;
    setIsTellerLoading(true);
    setTimeout(() => {
      const rand = Math.random();
      let result = '';
      if (rand < 0.2) result = 'YES. The stars have spoken!';
      else if (rand < 0.4) result = 'NO. The frequency is blocked.';
      else if (rand < 0.6) result = 'MAYBE. The vibes are still charging.';
      else if (rand < 0.8) result = 'SUPER YES! The universe is screaming it!';
      else result = 'SUPER NO! Not in this city, or any other.';
      setTellerResponse(result);
      setIsTellerLoading(false);
    }, 1200);
  };

  const startQuiz = () => {
    setQuizActive(true);
    setQuizStep(0);
    setQuizScores({ Happy: 0, Angry: 0, Tired: 0, Normal: 0, Excited: 0 });
    setQuizResult(null);
  };

  const QUIZ_STEPS = [
    { q: "How happy do you feel right now?", options: ["Very!", "A little", "Not much", "Not at all"], scores: ["Happy", "Normal", "Tired", "Angry"] },
    { q: "Are you feeling sleepy?", options: ["No, I'm awake!", "A tiny bit", "I need a nap", "I'm a zombie"], scores: ["Excited", "Normal", "Tired", "Tired"] },
    { q: "Are you mad at anyone?", options: ["No, I'm chill", "Just a bit", "Maybe one person", "I'm so angry!"], scores: ["Happy", "Normal", "Angry", "Angry"] },
    { q: "Do you feel excited about today?", options: ["Yes, so much!", "Maybe a bit", "Not really", "Zero excitement"], scores: ["Excited", "Excited", "Normal", "Tired"] },
    { q: "How fast is your brain working?", options: ["Super fast!", "Normal speed", "A bit slow", "It's stuck"], scores: ["Excited", "Normal", "Tired", "Normal"] },
    { q: "Do you want to hug a pet?", options: ["Yes, please!", "Sure", "Not really", "No way"], scores: ["Happy", "Happy", "Normal", "Angry"] },
    { q: "How much do you like today?", options: ["I love it!", "It's okay", "It's boring", "I hate it"], scores: ["Happy", "Normal", "Tired", "Angry"] },
    { q: "Are you busy right now?", options: ["Very busy!", "A little bit", "Not at all", "I'm bored"], scores: ["Excited", "Normal", "Happy", "Tired"] },
    { q: "Do you feel like dancing?", options: ["Yes, right now!", "Maybe later", "No, too tired", "Not my vibe"], scores: ["Excited", "Happy", "Tired", "Normal"] },
    { q: "Pick your favorite color!", options: ["Yellow", "Blue", "Red", "Green"], scores: ["Happy", "Tired", "Angry", "Normal"] }
  ];

  const handleQuizChoice = (idx: number) => {
    const currentStep = QUIZ_STEPS[quizStep];
    const moodKey = currentStep.scores[idx];
    const updatedScores = { ...quizScores };
    if (moodKey) {
      updatedScores[moodKey] = (updatedScores[moodKey] || 0) + 1;
      setQuizScores(updatedScores);
    }
    const nextStep = quizStep + 1;
    if (nextStep < QUIZ_STEPS.length) {
      setQuizStep(nextStep);
    } else {
      const sortedEntries = Object.entries(updatedScores).sort((a, b) => (b[1] as number) - (a[1] as number));
      setQuizResult(sortedEntries[0][0]);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-6 pb-20 h-full min-h-0">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {['Express', 'Teller', 'Scan', 'Mood Pet'].map((t) => (
          <button key={t} onClick={() => setSubTab(t as any)} className={`px-5 py-2.5 rounded-full font-black text-[10px] md:text-xs transition-all whitespace-nowrap uppercase tracking-tighter border-b-4 ${subTab === t ? 'bg-custom border-black/20 text-white shadow-lg translate-y-[-2px]' : isDarkMode ? 'bg-slate-800 border-slate-900 text-white/30' : 'bg-white border-gray-100 text-slate-500'}`}>
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
                  placeholder={isBroadcasting ? "Scanning Signal..." : (postVisibility === 'global' ? "Transmit a global frequency..." : "Whisper to your circle...")} 
                  className={`w-full ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-slate-900'} p-6 rounded-3xl border-2 border-black/5 focus:border-custom outline-none font-bold text-lg shadow-inner min-h-[120px]`} 
                />
                <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                  <div className="flex gap-2 bg-black/5 p-1.5 rounded-2xl">
                    <button onClick={() => setPostVisibility('global')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${postVisibility === 'global' ? 'bg-custom text-white' : 'opacity-40'}`}><Globe size={14}/> GLOBAL</button>
                    <button onClick={() => setPostVisibility('circle')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${postVisibility === 'circle' ? 'bg-custom text-white' : 'opacity-40'}`}><Users size={14}/> CIRCLE</button>
                  </div>
                  <button 
                    onClick={handlePost} 
                    disabled={isBroadcasting}
                    className="kahoot-button-custom px-8 py-4 text-white rounded-2xl font-black text-xs flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isBroadcasting ? <Clock size={18} className="animate-spin" /> : <Send size={18} />} 
                    {isBroadcasting ? 'SCANNIG...' : 'BROADCAST'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 bg-black/5 p-1 rounded-xl w-fit">
                <button onClick={() => setFeedFilter('Global')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${feedFilter === 'Global' ? 'bg-white text-custom shadow-sm' : 'opacity-40'}`}>Metropolis Feed</button>
                <button onClick={() => setFeedFilter('Circle')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${feedFilter === 'Circle' ? 'bg-white text-custom shadow-sm' : 'opacity-40'}`}>Neural Circle</button>
              </div>

              <div className="space-y-6 pb-12">
                {filteredPosts.length > 0 ? filteredPosts.map(post => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} border-2 border-black/5 shadow-md`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => onNavigateToProfile(post.author)} className="w-10 h-10 rounded-xl bg-custom text-white font-black shrink-0 text-xl flex items-center justify-center italic shadow-sm">{post.author[0].toUpperCase()}</button>
                        <div>
                          <h4 className="font-black text-sm">@{post.author}</h4>
                          <p className="text-[9px] font-black opacity-30 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {formatTime(post.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                    {post.isRepost && <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase italic mb-2"><Repeat size={12}/> Echoing: @{post.originalAuthor}</div>}
                    <p className="text-base font-bold italic opacity-90 mb-6 leading-relaxed break-words">"{post.content}"</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-black/5">
                      <button onClick={() => onHeart(post.id)} className="flex items-center gap-1.5 text-custom font-black text-[10px] uppercase"><Heart size={16} fill={post.hearts > 0 ? "currentColor" : "none"} /> {post.hearts} SYNC</button>
                      <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-1.5 text-blue-500 font-black text-[10px] uppercase"><MessageSquare size={16} /> {post.comments?.length || 0} ECHO</button>
                      <button onClick={() => onRepost(post)} className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase transition-transform active:scale-95"><Repeat size={16} /> ECHO RE-SIGNAL</button>
                    </div>

                    <AnimatePresence>
                      {expandedPostId === post.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                           <div className="pt-6 space-y-4">
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={commentInputs[post.id] || ''} 
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  placeholder="Add an echo to this signal..." 
                                  className={`flex-1 p-3 rounded-xl border-2 text-xs font-bold outline-none focus:border-custom ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                                  onKeyPress={e => e.key === 'Enter' && handleAddComment(post.id)}
                                />
                                <button onClick={() => handleAddComment(post.id)} className="bg-custom text-white px-4 rounded-xl shadow-md transition-transform active:scale-95"><Send size={16} /></button>
                              </div>

                              <div className="space-y-4 max-h-[400px] overflow-y-auto fading-scrollbar pr-2">
                                {post.comments?.length > 0 ? (
                                  post.comments.map(c => renderComment(post.id, c))
                                ) : (
                                  <p className="text-[10px] font-black uppercase opacity-20 text-center py-4 tracking-widest">No echoes yet.</p>
                                )}
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )) : <div className="py-20 text-center opacity-20 font-black uppercase italic text-lg tracking-widest">The metropolis is quiet.</div>}
              </div>
            </motion.div>
          )}

          {subTab === 'Teller' && (
            <motion.div key="teller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-xl text-center flex flex-col items-center`}>
               <Sparkles className="mb-6 text-custom" size={60} />
               <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase italic tracking-tighter">Fortune Oracle</h2>
               <input value={tellerQuestion} onChange={e => setTellerQuestion(e.target.value)} placeholder="Type a question for the stars..." className={`w-full max-w-xl p-5 rounded-2xl border-2 font-black text-center mb-6 outline-none focus:border-custom shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
               <button onClick={handleTeller} disabled={isTellerLoading} className="kahoot-button-custom px-10 py-5 rounded-2xl text-white font-black uppercase text-sm shadow-lg active:scale-95 transition-transform">{isTellerLoading ? 'CALCULATING...' : 'ASK THE STARS'}</button>
               {tellerResponse && (
                 <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-8 p-6 rounded-3xl bg-custom/5 border-l-8 border-custom italic font-bold text-lg max-w-lg">
                   "{tellerResponse}"
                 </motion.div>
               )}
            </motion.div>
          )}

          {subTab === 'Scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-black/5 shadow-xl text-center flex flex-col items-center`}>
               <Brain className="mb-6 text-blue-500" size={60} />
               <h2 className="text-2xl md:text-4xl font-black mb-6 uppercase italic tracking-tighter">Emotional Scan</h2>
               {!quizActive ? (
                 <>
                   <p className="opacity-40 font-bold uppercase tracking-widest text-[10px] mb-10">See your mood signature in 10 quick steps</p>
                   <button onClick={startQuiz} className="kahoot-button-blue px-10 py-5 rounded-2xl text-white font-black uppercase text-sm shadow-lg">Start Scan</button>
                 </>
               ) : (
                 <div className="w-full max-w-lg space-y-8">
                   {quizResult ? (
                     <div className="space-y-6">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-2xl font-black italic uppercase">Scan Complete</h3>
                        <div className="p-6 rounded-3xl bg-custom/10 border-2 border-custom/20">
                          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Neural Signature</p>
                          <p className="text-2xl font-black text-custom italic uppercase">{quizResult}</p>
                        </div>
                        <button onClick={() => setQuizActive(false)} className="kahoot-button-custom px-8 py-3 rounded-xl text-white font-black uppercase text-xs">Reset Scan</button>
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="h-2 bg-black/10 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${((quizStep + 1) / QUIZ_STEPS.length) * 100}%` }} /></div>
                        <p className="text-lg font-black italic">"{QUIZ_STEPS[quizStep].q}"</p>
                        <div className="grid grid-cols-2 gap-4">
                           {QUIZ_STEPS[quizStep].options.map((opt, i) => (
                             <button key={opt} onClick={() => handleQuizChoice(i)} className="kahoot-button-custom py-4 rounded-xl text-white font-black uppercase text-[10px] active:scale-95 transition-transform">{opt}</button>
                           ))}
                        </div>
                        <p className="text-[10px] font-black uppercase opacity-30">Step {quizStep + 1} of {QUIZ_STEPS.length}</p>
                     </div>
                   )}
                 </div>
               )}
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
