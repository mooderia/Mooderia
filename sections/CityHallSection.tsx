import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Search, MessageSquare, ArrowLeft, ShieldCheck, Check, CheckCheck, Clock, Smile, Plus, X, Reply, CornerDownRight, Settings, Camera, LogOut, Globe, Crown, Zap, ExternalLink, Radio } from 'lucide-react';
import { User, Message, MessageReaction, Group } from '../types';
import { checkContentSafety } from '../services/geminiService';

interface CityHallSectionProps {
  isDarkMode: boolean;
  currentUser: User;
  messages: Message[];
  groups: Group[];
  onSendMessage: (recipient: string, text: string, options?: { isGroup?: boolean, recipients?: string[], groupName?: string, replyToId?: string, replyToText?: string, replyToSender?: string, isSystem?: boolean, liaisonData?: any }) => void;
  onReadMessages: (withUsername: string) => void;
  onGroupUpdate: (group: Group) => void;
  onGroupCreate: (group: Group) => void;
  onNavigateToProfile: (username: string) => void;
  onReactToMessage: (msgId: string, emoji: string) => void;
  onViolation: (reason: string) => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

const CityHallSection: React.FC<CityHallSectionProps> = ({ isDarkMode, currentUser, messages, groups, onSendMessage, onReadMessages, onGroupUpdate, onGroupCreate, onNavigateToProfile, onReactToMessage, onViolation }) => {
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<{ username: string, displayName: string, profilePic?: string, isGroup?: boolean, recipients?: string[] } | null>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [viewingReacters, setViewingReacters] = useState<MessageReaction | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allUsers: User[] = useMemo(() => JSON.parse(localStorage.getItem('mooderia_all_users') || '[]'), [isCreatingGroup]);

  const chats = useMemo(() => {
    const list: any[] = [];
    const processedDms = new Set<string>();

    groups.forEach(g => {
      if (g.members.includes(currentUser.username)) {
        list.push({ 
          username: g.id, 
          displayName: g.name, 
          isGroup: true, 
          recipients: g.members,
          profilePic: g.photo || '🚀'
        });
      }
    });

    messages.forEach(m => {
      if (!m.isGroup) {
        const other = m.sender === currentUser.username ? m.recipient : m.sender;
        if (!processedDms.has(other)) {
          processedDms.add(other);
          const userObj = allUsers.find(u => u.username === other);
          if (userObj) {
            list.push({ username: other, displayName: userObj.displayName, profilePic: userObj.profilePic, isGroup: false });
          }
        }
      }
    });
    return list;
  }, [messages, allUsers, currentUser.username, groups]);

  const chatMessages = useMemo(() => {
    if (!selectedCitizen) return [];
    if (selectedCitizen.isGroup) {
      return messages.filter(m => m.isGroup && m.recipient === selectedCitizen.username).sort((a, b) => a.timestamp - b.timestamp);
    }
    return messages.filter(m => 
      !m.isGroup &&
      ((m.sender === currentUser.username && m.recipient === selectedCitizen.username) ||
      (m.sender === selectedCitizen.username && m.recipient === currentUser.username))
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedCitizen, currentUser.username]);

  useEffect(() => {
    if (selectedCitizen && !selectedCitizen.isGroup) onReadMessages(selectedCitizen.username);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedCitizen, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !selectedCitizen || isSending) return;
    setIsSending(true);
    const safety = await checkContentSafety(input);
    if (safety.isInappropriate) {
      onViolation(safety.reason);
      setIsSending(false);
      return;
    }
    onSendMessage(selectedCitizen.username, input, { 
      isGroup: selectedCitizen.isGroup, 
      recipients: selectedCitizen.recipients, 
      groupName: selectedCitizen.displayName,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text,
      replyToSender: replyingTo?.sender
    });
    setInput('');
    setReplyingTo(null);
    setIsSending(false);
  };

  const handleStartCreateGroup = () => {
    setGroupName('');
    setSelectedForGroup([]);
    setIsCreatingGroup(true);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedForGroup.length < 1) return;
    const groupId = 'group_' + Math.random().toString(36).substr(2, 9);
    const members = [...selectedForGroup, currentUser.username];
    const newGroup: Group = {
      id: groupId,
      name: groupName,
      owner: currentUser.username,
      members: members,
      nicknames: {},
      createdAt: Date.now(),
      photo: '🚀'
    };
    onGroupCreate(newGroup);
    onSendMessage(groupId, `CITIZEN TERMINAL: Neural Group "${groupName}" initialized.`, { isGroup: true, recipients: members, groupName, isSystem: true });
    setSelectedCitizen({ username: groupId, displayName: groupName, isGroup: true, recipients: members, profilePic: '🚀' });
    setIsCreatingGroup(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full relative">
      <div className="flex justify-between items-center mb-6 shrink-0 px-2">
        <h2 className={`text-3xl md:text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Citizen Hub</h2>
        <button onClick={handleStartCreateGroup} className="kahoot-button-blue px-6 py-3 rounded-2xl text-white font-black flex items-center gap-2 shadow-lg active:scale-95 text-xs">
          <Plus size={18} /> <span>NEW GROUP</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} shadow-2xl overflow-hidden border-4 border-black/5 relative min-h-0">
        <div className={`w-full md:w-64 lg:w-80 border-r ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} flex flex-col ${selectedCitizen ? 'hidden md:flex' : 'flex'} min-h-0`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search citizens..." className={`w-full pl-10 pr-4 py-3 rounded-2xl text-[12px] font-black border-2 outline-none focus:border-blue-500 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`} />
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`} size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto fading-scrollbar p-3 space-y-2">
            {chats.map(u => (
              <button key={u.username} onClick={() => setSelectedCitizen(u)} className={`w-full p-4 rounded-[1.5rem] flex items-center gap-3 transition-all border-b-4 active:translate-y-0.5 active:border-b-2 ${selectedCitizen?.username === u.username ? 'bg-blue-600 border-blue-800 text-white shadow-md' : 'hover:bg-black/5'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center font-black overflow-hidden shadow-sm shrink-0">
                  {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0]}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className={`font-black text-[12px] truncate uppercase tracking-tight`}>{u.displayName}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 ${!selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          {selectedCitizen ? (
            <>
              <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCitizen(null)} className="md:hidden p-2"><ArrowLeft size={20} /></button>
                  <button onClick={() => !selectedCitizen.isGroup && onNavigateToProfile(selectedCitizen.username)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg overflow-hidden border-2 border-white/20">
                      {selectedCitizen.profilePic ? <img src={selectedCitizen.profilePic} className="w-full h-full object-cover" /> : selectedCitizen.displayName[0]}
                    </div>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCitizen.displayName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">@{selectedCitizen.username}</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 fading-scrollbar">
                {chatMessages.map(m => {
                  const isMe = m.sender === currentUser.username;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 group/msg relative`}>
                      <button onClick={() => onNavigateToProfile(m.sender)} className="w-8 h-8 rounded-xl bg-custom text-white font-black flex items-center justify-center shrink-0 border-2 border-white/20 shadow-md">
                        {m.sender[0].toUpperCase()}
                      </button>
                      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                        {m.replyToId && (
                          <div className={`mb-1 p-2 rounded-xl text-[10px] italic border-l-4 opacity-60 ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/20'}`}>
                            <p className="font-black">Echoing @{m.replyToSender}:</p>
                            <p className="truncate">"{m.replyToText}"</p>
                          </div>
                        )}
                        <div className="relative group/bubble">
                          <div className={`px-5 py-3 rounded-[1.5rem] font-bold text-sm border-b-4 ${isMe ? 'bg-blue-600 border-blue-800 text-white rounded-tr-none' : isDarkMode ? 'bg-slate-800 border-slate-900 text-white rounded-tl-none' : 'bg-gray-100 border-gray-200 text-slate-800 rounded-tl-none'}`}>
                            <p>{m.text}</p>
                          </div>
                          
                          {/* Tool Bar Hidden by Default */}
                          <div className={`absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover/bubble:opacity-100 transition-all flex items-center gap-1`}>
                            <button onClick={() => setReplyingTo(m)} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-all text-blue-500"><Reply size={14}/></button>
                            <button onClick={() => setReactionPickerMsgId(reactionPickerMsgId === m.id ? null : m.id)} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-all text-yellow-500"><Smile size={14}/></button>
                          </div>
                        </div>

                        {/* Reactions List */}
                        {m.reactions && m.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.reactions.map(r => (
                              <button key={r.emoji} onClick={() => onReactToMessage(m.id, r.emoji)} onContextMenu={(e) => { e.preventDefault(); setViewingReacters(r); }} className={`px-2 py-0.5 rounded-full text-[10px] font-black border-2 transition-all flex items-center gap-1 ${r.users.includes(currentUser.username) ? 'bg-custom/10 border-custom' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                                <span>{r.emoji}</span>
                                <span>{r.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reaction Picker Overlay */}
                      <AnimatePresence>
                        {reactionPickerMsgId === m.id && (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className={`absolute z-20 bottom-full mb-2 p-2 rounded-2xl flex gap-2 shadow-2xl border-4 ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-black/10'}`}>
                            {REACTION_EMOJIS.map(e => (
                              <button key={e} onClick={() => { onReactToMessage(m.id, e); setReactionPickerMsgId(null); }} className="text-xl hover:scale-125 transition-transform">{e}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Preview Bar */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`px-8 py-3 border-t flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-3">
                      <Reply size={16} className="text-blue-500" />
                      <div className="text-[10px] leading-tight">
                        <p className="font-black uppercase tracking-widest text-blue-500">Replying to @{replyingTo.sender}</p>
                        <p className="opacity-60 truncate max-w-md">"{replyingTo.text}"</p>
                      </div>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full bg-black/5"><X size={14}/></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`p-4 md:p-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} shrink-0`}>
                <div className={`flex items-center gap-3 p-2 rounded-[2rem] border-4 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} focus-within:border-blue-500 shadow-inner`}>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Broadcast frequency..." className={`flex-1 bg-transparent px-5 py-3 font-black text-sm outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                  <button onClick={handleSend} className="kahoot-button-blue p-4 rounded-2xl text-white shadow-xl active:scale-95 transition-all"><Send size={24} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
              <Radio size={80} className="mb-6 text-blue-500" />
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Citizen Terminal</h3>
              <p className="text-xs font-black uppercase tracking-widest">Select a frequency to activate transmissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Reacters Modal */}
      <AnimatePresence>
        {viewingReacters && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-sm rounded-[3rem] p-8 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'} border-4 shadow-2xl relative`}>
              <button onClick={() => setViewingReacters(null)} className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-all"><X size={24}/></button>
              <h3 className="text-xl font-black uppercase italic mb-6">Synchronization Core {viewingReacters.emoji}</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto fading-scrollbar">
                {viewingReacters.users.map(u => (
                  <button key={u} onClick={() => { onNavigateToProfile(u); setViewingReacters(null); }} className="w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-black/5 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-custom text-white font-black flex items-center justify-center italic text-xs border-2 border-white/20">{u[0].toUpperCase()}</div>
                    <p className="text-[12px] font-black uppercase text-left">@{u}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Group Create Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'} w-full max-w-md rounded-[3rem] p-10 border-4 shadow-2xl`}>
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase italic">Initialize Group</h3><button onClick={() => setIsCreatingGroup(false)} className="opacity-40"><X size={28}/></button></div>
              <div className="space-y-6">
                 <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group Name..." className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black text-center text-lg outline-none focus:border-custom" />
                 <div className="max-h-48 overflow-y-auto fading-scrollbar p-2 space-y-2 bg-black/5 rounded-2xl">
                    {allUsers.filter(u => u.username !== currentUser.username).map(u => (
                      <button key={u.username} onClick={() => setSelectedForGroup(prev => prev.includes(u.username) ? prev.filter(x => x !== u.username) : [...prev, u.username])} className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedForGroup.includes(u.username) ? 'bg-blue-600 text-white' : 'hover:bg-black/5'}`}>
                         <div className="w-8 h-8 rounded-lg bg-custom text-white font-black flex items-center justify-center italic text-xs shrink-0">{u.displayName[0]}</div>
                         <p className="text-[12px] font-black uppercase flex-1 text-left">{u.displayName}</p>
                         {selectedForGroup.includes(u.username) && <Check size={16}/>}
                      </button>
                    ))}
                 </div>
                 <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedForGroup.length === 0} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Launch Network</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityHallSection;