
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Search, MessageSquare, ArrowLeft, ShieldCheck, Check, CheckCheck, Clock, Smile, Plus, X, Reply, CornerDownRight } from 'lucide-react';
import { User, Message, MessageReaction } from '../types';

interface CityHallSectionProps {
  isDarkMode: boolean;
  currentUser: User;
  messages: Message[];
  onSendMessage: (recipient: string, text: string, options?: { isGroup?: boolean, recipients?: string[], groupName?: string, replyToId?: string, replyToText?: string, replyToSender?: string }) => void;
  onReadMessages: (withUsername: string) => void;
  onNavigateToProfile: (username: string) => void;
  onReactToMessage: (msgId: string, emoji: string) => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

const CityHallSection: React.FC<CityHallSectionProps> = ({ isDarkMode, currentUser, messages, onSendMessage, onReadMessages, onNavigateToProfile, onReactToMessage }) => {
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<{ username: string, displayName: string, profilePic?: string, isGroup?: boolean, recipients?: string[] } | null>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [viewingReacters, setViewingReacters] = useState<MessageReaction | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allUsers: User[] = useMemo(() => JSON.parse(localStorage.getItem('mooderia_all_users') || '[]'), [isCreatingGroup, isCreatingGroup === false]);
  const usersWhoBlockedMe = useMemo(() => allUsers.filter(u => u.blockedUsers.includes(currentUser.username)).map(u => u.username), [allUsers, currentUser.username]);

  const filteredCitizens = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allUsers.filter(u => 
      u.username !== currentUser.username && 
      !currentUser.blockedUsers.includes(u.username) &&
      !usersWhoBlockedMe.includes(u.username) &&
      (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsers, currentUser.username, currentUser.blockedUsers, usersWhoBlockedMe]);

  const groupFilterList = useMemo(() => {
    return allUsers.filter(u => 
      u.username !== currentUser.username && 
      !currentUser.blockedUsers.includes(u.username) &&
      !usersWhoBlockedMe.includes(u.username) &&
      (u.displayName.toLowerCase().includes(groupSearchTerm.toLowerCase()) || 
       u.username.toLowerCase().includes(groupSearchTerm.toLowerCase()))
    );
  }, [groupSearchTerm, allUsers, currentUser.username, currentUser.blockedUsers, usersWhoBlockedMe]);

  const chats = useMemo(() => {
    const list: any[] = [];
    const processedDms = new Set<string>();
    const processedGroups = new Set<string>();

    messages.forEach(m => {
      if (m.isGroup && m.recipient && !processedGroups.has(m.recipient)) {
        processedGroups.add(m.recipient);
        list.push({ 
          username: m.recipient, 
          displayName: m.groupName || 'Unnamed Group', 
          isGroup: true, 
          recipients: m.recipients 
        });
      } else if (!m.isGroup) {
        const other = m.sender === currentUser.username ? m.recipient : m.sender;
        if (!processedDms.has(other)) {
          processedDms.add(other);
          const userObj = allUsers.find(u => u.username === other);
          if (userObj && !currentUser.blockedUsers.includes(other) && !usersWhoBlockedMe.includes(other)) {
            list.push({ 
              username: other, 
              displayName: userObj.displayName, 
              profilePic: userObj.profilePic, 
              isGroup: false 
            });
          }
        }
      }
    });
    return list;
  }, [messages, allUsers, currentUser.username, currentUser.blockedUsers, usersWhoBlockedMe]);

  const chatMessages = useMemo(() => {
    if (!selectedCitizen) return [];
    if (selectedCitizen.isGroup) {
      return messages.filter(m => m.isGroup && m.recipient === selectedCitizen.username)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return messages.filter(m => 
      !m.isGroup &&
      ((m.sender === currentUser.username && m.recipient === selectedCitizen.username) ||
      (m.sender === selectedCitizen.username && m.recipient === currentUser.username))
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedCitizen, currentUser.username]);

  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string, items: Message[] }[] = [];
    chatMessages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let label = date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      if (date.toDateString() === today.toDateString()) label = "Today";
      else if (date.toDateString() === yesterday.toDateString()) label = "Yesterday";
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === label) lastGroup.items.push(msg);
      else groups.push({ dateLabel: label, items: [msg] });
    });
    return groups;
  }, [chatMessages]);

  useEffect(() => {
    if (selectedCitizen && !selectedCitizen.isGroup) onReadMessages(selectedCitizen.username);
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [selectedCitizen, messages.length]);

  const handleSend = () => {
    if (!input.trim() || !selectedCitizen) return;
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
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedForGroup.length < 1) return;
    const groupId = 'group_' + Math.random().toString(36).substr(2, 9);
    const recipients = [...selectedForGroup, currentUser.username];
    onSendMessage(groupId, `CITIZEN TERMINAL: Group "${groupName}" initialized.`, { isGroup: true, recipients, groupName });
    setSelectedCitizen({ username: groupId, displayName: groupName, isGroup: true, recipients });
    setIsCreatingGroup(false);
    setGroupName('');
    setGroupSearchTerm('');
    setSelectedForGroup([]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden gap-4">
      <div className="flex justify-between items-center px-2 shrink-0">
        <h2 className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Citizen Hub</h2>
        <button onClick={() => setIsCreatingGroup(true)} className="kahoot-button-blue p-3 rounded-xl text-white font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
          <Plus size={20} /> <span className="hidden sm:inline text-xs">NEW GROUP</span>
        </button>
      </div>

      <div className={`flex-1 flex flex-col md:flex-row rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl overflow-hidden border-4 border-gray-100 dark:border-slate-700 min-h-0`}>
        {/* Sidebar */}
        <div className={`w-full md:w-72 lg:w-80 border-r ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} flex flex-col ${selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Citizens..." className={`w-full px-10 py-3 rounded-xl text-xs font-bold border-2 outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`} />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-white/50" size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto fading-scrollbar p-2 space-y-1">
            {(searchTerm.trim() ? filteredCitizens.map(u => ({ username: u.username, displayName: u.displayName, profilePic: u.profilePic, isGroup: false })) : chats).map(u => (
              <button key={u.username} onClick={() => { setSelectedCitizen(u); setReplyingTo(null); }} className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedCitizen?.username === u.username ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-600 flex items-center justify-center font-black overflow-hidden shadow-sm shrink-0">
                  {u.isGroup ? <Users size={20} className="text-blue-600 dark:text-blue-300" /> : (u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0].toUpperCase())}
                </div>
                <div className="text-left truncate flex-1">
                  <p className="font-black text-xs truncate uppercase tracking-tight">{u.displayName}</p>
                  <p className={`text-[9px] font-bold ${selectedCitizen?.username === u.username ? 'text-white/60' : 'opacity-40'}`}>@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${!selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          {selectedCitizen ? (
            <>
              <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-gray-50 border-gray-100'} flex items-center justify-between shrink-0`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCitizen(null)} className="md:hidden p-2 rounded-xl hover:bg-gray-200"><ArrowLeft size={20} /></button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md overflow-hidden">
                      {selectedCitizen.isGroup ? <Users size={24} /> : (selectedCitizen.profilePic ? <img src={selectedCitizen.profilePic} className="w-full h-full object-cover" /> : selectedCitizen.displayName[0])}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-slate-800 dark:text-white uppercase italic">{selectedCitizen.displayName}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{selectedCitizen.isGroup ? `${selectedCitizen.recipients?.length} Members` : 'Active Signal'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 fading-scrollbar">
                {groupedMessages.map(group => (
                  <div key={group.dateLabel} className="space-y-6">
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
                      <span className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">{group.dateLabel}</span>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
                    </div>
                    {group.items.map(m => {
                      const isMe = m.sender === currentUser.username;
                      const senderName = allUsers.find(u => u.username === m.sender)?.displayName || m.sender;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-2`}>
                          <div className={`max-w-[85%] md:max-w-[70%] space-y-1`}>
                            {selectedCitizen.isGroup && !isMe && <p className="text-[8px] font-black uppercase opacity-40 mb-1 ml-1 tracking-widest">{senderName}</p>}
                            
                            <div className="relative group/bubble">
                              <div className={`relative px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : isDarkMode ? 'bg-slate-700 text-white rounded-tl-none' : 'bg-gray-100 text-slate-800 rounded-tl-none'}`}>
                                {m.replyToId && (
                                  <div className={`mb-2 p-2 rounded-lg text-[10px] flex flex-col gap-1 border-l-4 ${isMe ? 'bg-white/10 border-white/30' : 'bg-black/5 border-black/20'} opacity-70 italic`}>
                                    <div className="flex items-center gap-1 font-black uppercase">
                                      <CornerDownRight size={10} /> @{m.replyToSender}
                                    </div>
                                    <div className="truncate">{m.replyToText}</div>
                                  </div>
                                )}
                                {m.text}
                                {m.reactions && m.reactions.length > 0 && (
                                  <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-md border border-black/5 cursor-pointer z-10`} onClick={(e) => { e.stopPropagation(); setViewingReacters(m.reactions?.[0] || null); }}>
                                    {m.reactions.map(r => (
                                      <button 
                                        key={r.emoji} 
                                        onClick={(e) => { e.stopPropagation(); setViewingReacters(r); }}
                                        className="flex items-center gap-1 hover:scale-110 transition-transform"
                                      >
                                        <span className="text-xs">{r.emoji}</span>
                                        <span className="text-[8px] font-black">{r.users.length}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <div className={`absolute ${isMe ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-white/5 backdrop-blur-sm p-1 rounded-xl z-20`}>
                                  <button onClick={() => setReactionPickerMsgId(reactionPickerMsgId === m.id ? null : m.id)} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-black/5 transition-colors"><Smile size={16} /></button>
                                  <button onClick={() => { setReplyingTo(m); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-black/5 transition-colors"><Reply size={16} /></button>
                                </div>
                                <AnimatePresence>
                                  {reactionPickerMsgId === m.id && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className={`absolute z-30 ${isMe ? 'right-0 -top-12' : 'left-0 -top-12'} bg-white dark:bg-slate-800 border-4 border-black/5 rounded-full p-1.5 flex gap-1.5 shadow-2xl`}>
                                      {REACTION_EMOJIS.map(emoji => {
                                        const isReacted = m.reactions?.find(r => r.emoji === emoji && r.users.includes(currentUser.username));
                                        return (<button key={emoji} onClick={() => { onReactToMessage(m.id, emoji); setReactionPickerMsgId(null); }} className={`hover:scale-125 transition-transform p-1.5 rounded-full ${isReacted ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>{emoji}</button>);
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 text-[9px] font-black uppercase opacity-30 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <Clock size={10} /> {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && (m.read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className={`p-4 md:p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} shrink-0 bg-inherit`}>
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div initial={{ height: 0, opacity: 0, y: 10 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: 10 }} className="mb-3 overflow-hidden bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded-r-xl flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2"><Reply size={12} /> Replying to @{replyingTo.sender}</p>
                        <p className="text-xs font-bold opacity-60 truncate mt-1">"{replyingTo.text}"</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className={`flex items-center gap-3 p-2 rounded-2xl border-4 ${isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-gray-50 border-gray-200'} focus-within:border-blue-500/50 transition-all`}>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={replyingTo ? "Transmit reply..." : "Broadcast frequency..."} className="flex-1 bg-transparent px-4 py-2 font-bold text-sm outline-none dark:text-white" />
                  <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30">
              <MessageSquare size={80} className="mb-6 text-slate-400" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">Citizen Terminal</h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 text-slate-800 dark:text-white">Select a frequency to synchronize transmissions</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewingReacters && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-sm rounded-[3rem] p-8 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'} border-4 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{viewingReacters.emoji}</span>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Reacters</h3>
                </div>
                <button onClick={() => setViewingReacters(null)} className="p-2 rounded-full hover:bg-black/5"><X size={24} className="opacity-40" /></button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto fading-scrollbar">
                {viewingReacters.users.map(u => {
                  const userObj = allUsers.find(cu => cu.username === u);
                  return (
                    <div key={u} className="flex items-center gap-3 p-3 rounded-2xl bg-black/5">
                      <div className="w-10 h-10 rounded-xl bg-custom text-white flex items-center justify-center font-black shadow-sm overflow-hidden">
                        {userObj?.profilePic ? <img src={userObj.profilePic} className="w-full h-full object-cover" /> : u[0].toUpperCase()}
                      </div>
                      <div><p className="font-black text-xs uppercase">{userObj?.displayName || u}</p><p className="text-[10px] font-bold opacity-40">@{u}</p></div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg rounded-[3rem] p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Initialize Group</h3>
                <button onClick={() => { setIsCreatingGroup(false); setGroupSearchTerm(''); }} className="bg-black/5 p-2 rounded-full"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Group Designation</p>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Echo Squad..." className="w-full p-4 rounded-2xl border-4 bg-black/5 font-black text-lg outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Select Citizens ({selectedForGroup.length})</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={groupSearchTerm} 
                      onChange={(e) => setGroupSearchTerm(e.target.value)} 
                      placeholder="Search for citizens to add..." 
                      className="w-full p-3 pl-10 rounded-xl border-2 bg-black/5 font-bold text-xs outline-none focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                  </div>
                  <div className="h-56 overflow-y-auto fading-scrollbar border-4 border-black/5 rounded-2xl p-2 grid grid-cols-1 gap-2">
                    {groupFilterList.length > 0 ? groupFilterList.map(u => (
                      <button 
                        key={u.username} 
                        onClick={() => setSelectedForGroup(prev => prev.includes(u.username) ? prev.filter(un => un !== u.username) : [...prev, u.username])}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedForGroup.includes(u.username) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center font-black overflow-hidden">{u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0]}</div>
                        <div className="text-left flex-1"><p className="font-black text-xs uppercase">{u.displayName}</p><p className="text-[9px] font-bold opacity-60">@{u.username}</p></div>
                        {selectedForGroup.includes(u.username) && <Check size={16} />}
                      </button>
                    )) : <p className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-widest">No citizens found.</p>}
                  </div>
                </div>

                <button 
                  onClick={handleCreateGroup} 
                  disabled={!groupName.trim() || selectedForGroup.length === 0}
                  className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase text-xl shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  AUTHORIZE GROUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityHallSection;
