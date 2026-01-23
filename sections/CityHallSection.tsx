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
// Fix: Added GROUP_EMOJIS constant for group settings
const GROUP_EMOJIS = ['🚀', '🍕', '🎮', '💡', '🔥', '🌈', '💎', '🎭', '👾', '🎨', '🎬', '🎧'];

const CityHallSection: React.FC<CityHallSectionProps> = ({ isDarkMode, currentUser, messages, groups, onSendMessage, onReadMessages, onGroupUpdate, onGroupCreate, onNavigateToProfile, onReactToMessage, onViolation }) => {
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<{ username: string, displayName: string, profilePic?: string, isGroup?: boolean, recipients?: string[] } | null>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [viewingReacters, setViewingReacters] = useState<MessageReaction | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupPhoto, setEditGroupPhoto] = useState('');
  const [nicknames, setNicknames] = useState<Record<string, string>>({});

  const allUsers: User[] = useMemo(() => JSON.parse(localStorage.getItem('mooderia_all_users') || '[]'), [isCreatingGroup, isEditingGroup]);
  const usersWhoBlockedMe = useMemo(() => allUsers.filter(u => u.blockedUsers.includes(currentUser.username)).map(u => u.username), [allUsers, currentUser.username]);

  const CREATOR_EMAIL = 'travismiguel014@gmail.com';
  const getIsCreator = (username: string) => {
    const user = allUsers.find(u => u.username === username);
    return user?.email === CREATOR_EMAIL;
  };

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

  // Fix: Added groupFilterList for group creation search
  const groupFilterList = useMemo(() => {
    return allUsers.filter(u => 
      u.username !== currentUser.username && 
      !currentUser.blockedUsers.includes(u.username) &&
      !usersWhoBlockedMe.includes(u.username) &&
      (u.displayName.toLowerCase().includes(groupSearchTerm.toLowerCase()) || 
       u.username.toLowerCase().includes(groupSearchTerm.toLowerCase()))
    );
  }, [groupSearchTerm, allUsers, currentUser.username, currentUser.blockedUsers, usersWhoBlockedMe]);

  const currentGroup = useMemo(() => {
    if (selectedCitizen?.isGroup) {
      return groups.find(g => g.id === selectedCitizen.username);
    }
    return null;
  }, [selectedCitizen, groups]);

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
  }, [messages, allUsers, currentUser.username, currentUser.blockedUsers, usersWhoBlockedMe, groups]);

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
    setGroupSearchTerm('');
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

  const handleOpenSettings = () => {
    if (currentGroup) {
      setEditGroupName(currentGroup.name);
      setEditGroupPhoto(currentGroup.photo || '🚀');
      setNicknames(currentGroup.nicknames || {});
      setIsEditingGroup(true);
    }
  };

  const handleSaveSettings = () => {
    if (currentGroup && editGroupName.trim()) {
      const updated = { ...currentGroup, name: editGroupName, photo: editGroupPhoto, nicknames: nicknames };
      onGroupUpdate(updated);
      setSelectedCitizen({ ...selectedCitizen!, displayName: editGroupName, profilePic: editGroupPhoto });
      setIsEditingGroup(false);
    }
  };

  const handleLeaveGroup = () => {
    if (currentGroup) {
      const updatedMembers = currentGroup.members.filter(m => m !== currentUser.username);
      const updatedGroup = { ...currentGroup, members: updatedMembers };
      onGroupUpdate(updatedGroup);
      onSendMessage(currentGroup.id, `${currentUser.displayName} has left the frequency.`, { isGroup: true, isSystem: true });
      setSelectedCitizen(null);
      setIsEditingGroup(false);
    }
  };

  const getNickname = (username: string) => {
    if (currentGroup?.nicknames?.[username]) return currentGroup.nicknames[username];
    const user = allUsers.find(u => u.username === username);
    return user?.displayName || username;
  };

  const getSenderPhoto = (username: string) => {
    const user = allUsers.find(u => u.username === username);
    return user?.profilePic;
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] md:max-h-full overflow-hidden">
      {/* Header Area */}
      <div className="flex justify-between items-center px-2 mb-6 shrink-0">
        <h2 className={`text-3xl md:text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Citizen Hub</h2>
        <button 
          onClick={handleStartCreateGroup} 
          className="kahoot-button-blue px-6 py-3 rounded-2xl text-white font-black flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> <span className="hidden sm:inline text-xs">NEW GROUP</span>
        </button>
      </div>

      {/* Main Terminal Box */}
      <div className={`flex-1 flex flex-col md:flex-row rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white'} shadow-2xl overflow-hidden border-b-[8px] border-black/10 dark:border-white/5 border-x-2 border-t-2 border-black/5 min-h-0`}>
        
        {/* Sidebar / Conversation List */}
        <div className={`w-full md:w-64 lg:w-72 border-r ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} flex flex-col ${selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search citizens..." 
                className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-black border-2 outline-none focus:border-blue-500 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`} 
              />
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`} size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto fading-scrollbar p-3 space-y-2">
            {(searchTerm.trim() ? filteredCitizens.map(u => ({ username: u.username, displayName: u.displayName, profilePic: u.profilePic, isGroup: false })) : chats).map(u => (
              <button 
                key={u.username} 
                onClick={() => { setSelectedCitizen(u); setReplyingTo(null); }} 
                className={`w-full p-3.5 rounded-[1.5rem] flex items-center gap-3 transition-all border-b-4 active:translate-y-0.5 active:border-b-2 ${selectedCitizen?.username === u.username ? 'bg-blue-600 border-blue-800 text-white shadow-lg translate-x-1' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-700 flex items-center justify-center font-black overflow-hidden shadow-sm shrink-0 border-2 border-white/20">
                  {u.isGroup ? (u.profilePic && u.profilePic.length < 5 ? <span className="text-xl">{u.profilePic}</span> : <Users size={20} className="text-blue-600 dark:text-blue-300" />) : (u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0].toUpperCase())}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`font-black text-[11px] truncate uppercase tracking-tight ${selectedCitizen?.username === u.username ? 'text-white' : ''}`}>{u.displayName}</p>
                    {getIsCreator(u.username) && <Crown size={10} className="text-yellow-400" />}
                  </div>
                  <p className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${selectedCitizen?.username === u.username ? 'text-white' : ''}`}>{u.isGroup ? 'Neural Group' : `@${u.username}`}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${!selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          {selectedCitizen ? (
            <>
              <div className={`p-4 md:p-5 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'} flex items-center justify-between shrink-0`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCitizen(null)} className="md:hidden p-2 rounded-xl hover:bg-black/5 text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg overflow-hidden border-2 border-white/20">
                      {selectedCitizen.isGroup ? (selectedCitizen.profilePic && selectedCitizen.profilePic.length < 5 ? <span className="text-xl">{selectedCitizen.profilePic}</span> : <Users size={24} />) : (selectedCitizen.profilePic ? <img src={selectedCitizen.profilePic} className="w-full h-full object-cover" /> : selectedCitizen.displayName[0])}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <p className={`font-black text-sm md:text-base uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCitizen.displayName}</p>
                        {getIsCreator(selectedCitizen.username) && <Crown size={14} className="text-yellow-400 animate-pulse" />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{selectedCitizen.isGroup ? `${currentGroup?.members.length} Members` : 'Live Signal'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCitizen.isGroup && (
                    <button onClick={handleOpenSettings} className={`p-3 hover:bg-black/5 rounded-2xl transition-all ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
                      <Settings size={22} />
                    </button>
                  )}
                </div>
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 fading-scrollbar">
                {groupedMessages.map(group => (
                  <div key={group.dateLabel} className="space-y-6">
                    <div className="flex items-center gap-4 py-4">
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">{group.dateLabel}</span>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
                    </div>
                    {group.items.map(m => {
                      const isMe = m.sender === currentUser.username;
                      const senderNickname = getNickname(m.sender);
                      const senderPhoto = getSenderPhoto(m.sender);
                      const isCreator = getIsCreator(m.sender);
                      
                      if (m.isSystem) {
                        return (
                          <div key={m.id} className="flex justify-center my-6">
                            <span className="bg-black/5 dark:bg-white/5 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest opacity-40">{m.text}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 group/msg relative mb-2`}>
                          <div onClick={() => onNavigateToProfile(m.sender)} className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${isCreator ? 'bg-yellow-400 ring-4 ring-yellow-400/20' : 'bg-custom'} text-white font-black flex items-center justify-center shrink-0 border-2 border-white/20 shadow-md overflow-hidden cursor-pointer active:scale-90 transition-all`}>
                             {senderPhoto ? <img src={senderPhoto} className="w-full h-full object-cover" /> : m.sender[0].toUpperCase()}
                          </div>

                          <div className={`max-w-[80%] md:max-w-[70%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {selectedCitizen.isGroup && !isMe && (
                              <div className="flex items-center gap-1 ml-1 mb-1">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{senderNickname}</p>
                                {isCreator && <Crown size={8} className="text-yellow-400" />}
                              </div>
                            )}
                            
                            <div className="relative group/bubble">
                              <div className={`relative px-5 py-3.5 rounded-[1.5rem] font-bold text-sm shadow-sm transition-all border-b-4 ${isMe ? 'bg-blue-600 border-blue-800 text-white rounded-tr-none' : isDarkMode ? 'bg-slate-800 border-slate-900 text-white rounded-tl-none' : 'bg-gray-100 border-gray-200 text-slate-800 rounded-tl-none'}`}>
                                {m.replyToId && (
                                  <div className={`mb-3 p-3 rounded-xl text-[10px] flex flex-col gap-1 border-l-4 ${isMe ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/20'} opacity-80 italic`}>
                                    <div className="flex items-center gap-1 font-black uppercase">
                                      <CornerDownRight size={10} /> @{m.replyToSender}
                                    </div>
                                    <div className="truncate opacity-60">"{m.replyToText}"</div>
                                  </div>
                                )}
                                <p className="leading-relaxed">{m.text}</p>
                                
                                {m.reactions && m.reactions.length > 0 && (
                                  <div className={`absolute -bottom-4 ${isMe ? 'right-2' : 'left-2'} flex gap-1 bg-white dark:bg-slate-900 rounded-full px-2 py-1 shadow-lg border-2 border-black/5 cursor-pointer z-10`} onClick={(e) => { e.stopPropagation(); setViewingReacters(m.reactions?.[0] || null); }}>
                                    {m.reactions.map(r => (
                                      <button key={r.emoji} className="flex items-center gap-1">
                                        <span className="text-xs">{r.emoji}</span>
                                        <span className="text-[9px] font-black text-slate-900 dark:text-white">{r.users.length}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <div className={`absolute ${isMe ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-white/10 backdrop-blur-md p-1.5 rounded-2xl z-20`}>
                                  <button onClick={() => setReactionPickerMsgId(reactionPickerMsgId === m.id ? null : m.id)} className={`p-2 rounded-xl hover:bg-white/20 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-500'}`}><Smile size={18} /></button>
                                  <button onClick={() => { setReplyingTo(m); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className={`p-2 rounded-xl hover:bg-white/20 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-500'}`}><Reply size={18} /></button>
                                </div>

                                <AnimatePresence>
                                  {reactionPickerMsgId === m.id && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className={`absolute z-30 ${isMe ? 'right-0 -top-14' : 'left-0 -top-14'} bg-white dark:bg-slate-800 border-4 border-black/5 rounded-[2rem] p-2 flex gap-1 shadow-2xl`}>
                                      {REACTION_EMOJIS.map(emoji => {
                                        const isReacted = m.reactions?.find(r => r.emoji === emoji && r.users.includes(currentUser.username));
                                        return (<button key={emoji} onClick={() => { onReactToMessage(m.id, emoji); setReactionPickerMsgId(null); }} className={`hover:scale-125 transition-transform p-2 rounded-xl ${isReacted ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>{emoji}</button>);
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase opacity-20 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && (m.read ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className={`p-4 md:p-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} shrink-0 bg-inherit`}>
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div initial={{ height: 0, opacity: 0, y: 20 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: 20 }} className="mb-4 overflow-hidden bg-blue-500/10 border-l-[6px] border-blue-500 p-4 rounded-r-3xl flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 mb-1"><Reply size={14} /> Replying to @{replyingTo.sender}</p>
                        <p className={`text-xs font-bold truncate opacity-60`}>"{replyingTo.text}"</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-slate-400 hover:text-red-500"><X size={20} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className={`flex items-center gap-3 p-2 rounded-[2rem] border-4 transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} focus-within:border-blue-500`}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                    disabled={isSending}
                    placeholder={isSending ? "Scanning..." : (replyingTo ? "Transmit reply..." : "Broadcast frequency...")} 
                    className={`flex-1 bg-transparent px-5 py-3 font-black text-sm outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={isSending}
                    className="kahoot-button-blue p-4 rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSending ? <Clock size={24} className="animate-spin" /> : <Send size={24} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="relative mb-8">
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
                   transition={{ duration: 6, repeat: Infinity }}
                   className="p-12 bg-blue-500/10 rounded-[4rem] text-blue-500 relative z-10"
                 >
                    <Radio size={80} />
                 </motion.div>
                 <motion.div 
                   animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-blue-500/20 rounded-full -z-0"
                 />
              </div>
              <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Citizen Terminal</h3>
              <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30 max-w-xs leading-relaxed">Select a frequency to synchronize transmissions and activate metropolitan communications</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Create Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'} w-full max-w-md rounded-[3rem] p-10 border-4 shadow-2xl`}>
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black italic uppercase tracking-tighter">Initialize Group</h3><button onClick={() => setIsCreatingGroup(false)} className="opacity-40 hover:opacity-100"><X size={28}/></button></div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase opacity-40 ml-2">Neural Identification</p>
                    <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group Name..." className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black text-center text-lg outline-none focus:border-custom" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase opacity-40 ml-2">Broadcast Search</p>
                    <input type="text" value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} placeholder="Search Citizens..." className="w-full p-4 rounded-xl border-2 bg-black/5 font-bold text-sm outline-none" />
                 </div>
                 <div className="max-h-40 overflow-y-auto fading-scrollbar p-2 space-y-2 bg-black/5 rounded-2xl">
                    {groupFilterList.map(u => (
                      <button key={u.username} onClick={() => setSelectedForGroup(prev => prev.includes(u.username) ? prev.filter(x => x !== u.username) : [...prev, u.username])} className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedForGroup.includes(u.username) ? 'bg-blue-600 text-white' : 'hover:bg-black/5'}`}>
                         <div className="w-8 h-8 rounded-lg bg-custom text-white font-black flex items-center justify-center italic text-xs border-2 border-white/20 shrink-0">{u.displayName[0]}</div>
                         <p className="text-[11px] font-black uppercase flex-1 text-left">{u.displayName}</p>
                         {selectedForGroup.includes(u.username) && <Check size={16}/>}
                      </button>
                    ))}
                 </div>
                 <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedForGroup.length === 0} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50">Launch Network</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Group Settings Modal */}
      <AnimatePresence>
        {isEditingGroup && currentGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'} w-full max-w-lg rounded-[3.5rem] p-10 border-4 shadow-2xl relative overflow-hidden`}>
              <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Frequency Ops</h3><button onClick={() => setIsEditingGroup(false)} className="opacity-40 hover:opacity-100"><X size={32}/></button></div>
              
              <div className="space-y-8 overflow-y-auto max-h-[60vh] fading-scrollbar pr-4">
                 <div className="flex justify-center mb-6">
                    <div className="grid grid-cols-4 gap-2">
                       {GROUP_EMOJIS.map(e => (
                         <button key={e} onClick={() => setEditGroupPhoto(e)} className={`text-2xl p-3 rounded-2xl border-2 transition-all ${editGroupPhoto === e ? 'border-custom bg-custom/10 scale-110 shadow-md' : 'border-black/5'}`}>{e}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Network Identity</p>
                    <input type="text" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="w-full p-4 rounded-2xl border-2 bg-black/5 font-black text-center text-xl outline-none focus:border-custom" />
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Citizen Nicknames</p>
                    <div className="space-y-3">
                       {currentGroup.members.map(member => (
                         <div key={member} className="flex items-center gap-3">
                            <span className="text-[10px] font-black opacity-30 w-20 truncate">@{member}</span>
                            <input 
                              type="text" 
                              placeholder="Nickname..." 
                              value={nicknames[member] || ''} 
                              onChange={e => setNicknames({...nicknames, [member]: e.target.value})} 
                              className="flex-1 p-3 rounded-xl border-2 bg-black/5 font-bold text-xs outline-none focus:border-custom" 
                            />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 space-y-4">
                   <button onClick={handleSaveSettings} className="kahoot-button-custom w-full py-5 rounded-2xl text-white font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Update Frequency</button>
                   <button onClick={handleLeaveGroup} className="w-full py-5 rounded-2xl border-4 border-red-500/20 text-red-500 font-black uppercase text-sm hover:bg-red-500 hover:text-white transition-all">Disconnect from Group</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reaction Reacters View Modal */}
      <AnimatePresence>
        {viewingReacters && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50" onClick={() => setViewingReacters(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} w-full max-w-xs rounded-[2rem] p-6 shadow-2xl`} onClick={e => e.stopPropagation()}>
               <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{viewingReacters.emoji}</span>
                  <p className="text-sm font-black uppercase tracking-tighter">Echoed by</p>
               </div>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewingReacters.users.map(u => (
                    <div key={u} className="flex items-center gap-3 p-2 bg-black/5 rounded-xl">
                       <div className="w-6 h-6 rounded-md bg-custom text-white font-black flex items-center justify-center text-[10px] italic">{u[0].toUpperCase()}</div>
                       <p className="text-xs font-black">@{u}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityHallSection;