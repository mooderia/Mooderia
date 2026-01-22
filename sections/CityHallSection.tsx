
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Search, MessageSquare, ArrowLeft, ShieldCheck, Check, CheckCheck, Clock, Smile, Plus, X, Reply, CornerDownRight, Settings, Camera, LogOut, Globe, Crown, Zap, ExternalLink } from 'lucide-react';
import { User, Message, MessageReaction, Group } from '../types';

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
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];
const GROUP_EMOJIS = ['🚀', '🌟', '👾', '🌈', '🍕', '🎉', '🧠', '🤖', '👑', '💎', '🔥', '🌍'];

const CityHallSection: React.FC<CityHallSectionProps> = ({ isDarkMode, currentUser, messages, groups, onSendMessage, onReadMessages, onGroupUpdate, onGroupCreate, onNavigateToProfile, onReactToMessage }) => {
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group settings state
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

    // Priority: Groups first
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

    // Then DMs from existing messages
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
    <div className="flex flex-col h-full overflow-hidden gap-4">
      <div className="flex justify-between items-center px-2 shrink-0">
        <h2 className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>Citizen Hub</h2>
        <button onClick={handleStartCreateGroup} className="kahoot-button-blue p-3 rounded-xl text-white font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
          <Plus size={20} /> <span className="hidden sm:inline text-xs">NEW GROUP</span>
        </button>
      </div>

      <div className={`flex-1 flex flex-col md:flex-row rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl overflow-hidden border-4 border-gray-100 dark:border-slate-700 min-h-0`}>
        {/* Sidebar / Conversation List */}
        <div className={`w-full md:w-72 lg:w-80 border-r ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} flex flex-col ${selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Citizens..." className={`w-full px-10 py-3 rounded-xl text-xs font-bold border-2 outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 !text-black'}`} />
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/50' : '!text-black opacity-80'}`} size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto fading-scrollbar p-2 space-y-1">
            {(searchTerm.trim() ? filteredCitizens.map(u => ({ username: u.username, displayName: u.displayName, profilePic: u.profilePic, isGroup: false })) : chats).map(u => (
              <button key={u.username} onClick={() => { setSelectedCitizen(u); setReplyingTo(null); }} className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedCitizen?.username === u.username ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-600 flex items-center justify-center font-black overflow-hidden shadow-sm shrink-0 border-2 border-white/20">
                  {u.isGroup ? (u.profilePic && u.profilePic.length < 5 ? <span className="text-xl">{u.profilePic}</span> : <Users size={20} className="text-blue-600 dark:text-blue-300" />) : (u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0].toUpperCase())}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`font-black text-xs truncate uppercase tracking-tight ${selectedCitizen?.username === u.username ? 'text-white' : '!text-black dark:text-white'}`}>{u.displayName}</p>
                    {getIsCreator(u.username) && <Crown size={10} className="text-yellow-400" />}
                  </div>
                  <p className={`text-[9px] font-bold ${selectedCitizen?.username === u.username ? 'text-white/90' : '!text-black dark:text-white/50'}`}>{u.isGroup ? 'Neural Group' : `@${u.username}`}</p>
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
                  <button onClick={() => setSelectedCitizen(null)} className={`md:hidden p-2 rounded-xl hover:bg-black/10 transition-colors ${isDarkMode ? 'text-white' : '!text-black'}`}><ArrowLeft size={20} /></button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md overflow-hidden border-2 border-white/20">
                      {selectedCitizen.isGroup ? (selectedCitizen.profilePic && selectedCitizen.profilePic.length < 5 ? <span className="text-xl">{selectedCitizen.profilePic}</span> : <Users size={24} />) : (selectedCitizen.profilePic ? <img src={selectedCitizen.profilePic} className="w-full h-full object-cover" /> : selectedCitizen.displayName[0])}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        <p className={`font-black text-sm uppercase italic ${isDarkMode ? 'text-white' : '!text-black'}`}>{selectedCitizen.displayName}</p>
                        {getIsCreator(selectedCitizen.username) && <Crown size={14} className="text-yellow-400 animate-pulse" />}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/50' : '!text-black'}`}>{selectedCitizen.isGroup ? `${currentGroup?.members.length} Members` : 'Active Signal'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCitizen.isGroup && (
                    <button onClick={handleOpenSettings} className={`p-2 hover:bg-black/5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:text-blue-500' : '!text-black hover:text-blue-500'}`}>
                      <Settings size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 fading-scrollbar">
                {groupedMessages.map(group => (
                  <div key={group.dateLabel} className="space-y-6">
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-black/10 dark:bg-white/5"></div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : '!text-black'}`}>{group.dateLabel}</span>
                      <div className="h-px flex-1 bg-black/10 dark:bg-white/5"></div>
                    </div>
                    {group.items.map(m => {
                      const isMe = m.sender === currentUser.username;
                      const senderNickname = getNickname(m.sender);
                      const senderPhoto = getSenderPhoto(m.sender);
                      const isCreator = getIsCreator(m.sender);
                      
                      if (m.isSystem) {
                        return (
                          <div key={m.id} className="flex justify-center my-4">
                            <span className={`bg-black/10 dark:bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/40' : '!text-black'}`}>{m.text}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 group relative mb-2`}>
                          <div onClick={() => onNavigateToProfile(m.sender)} className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${isCreator ? 'bg-yellow-400 ring-4 ring-yellow-400/20' : 'bg-custom'} text-white font-black flex items-center justify-center shrink-0 border-2 border-white/20 shadow-sm overflow-hidden cursor-pointer active:scale-90 transition-all`}>
                             {senderPhoto ? <img src={senderPhoto} className="w-full h-full object-cover" /> : m.sender[0].toUpperCase()}
                          </div>

                          <div className={`max-w-[75%] md:max-w-[65%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {selectedCitizen.isGroup && !isMe && (
                              <div className="flex items-center gap-1 ml-1 mb-1">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/40' : '!text-black'}`}>{senderNickname}</p>
                                {isCreator && <Crown size={8} className="text-yellow-400" />}
                              </div>
                            )}
                            
                            <div className="relative group/bubble">
                              <div className={`relative px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : isDarkMode ? 'bg-slate-700 text-white rounded-tl-none' : 'bg-gray-100 text-slate-800 rounded-tl-none'} ${isCreator ? 'ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : ''}`}>
                                {m.replyToId && (
                                  <div className={`mb-2 p-2 rounded-lg text-[10px] flex flex-col gap-1 border-l-4 ${isMe ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/20'} opacity-80 italic`}>
                                    <div className="flex items-center gap-1 font-black uppercase">
                                      <CornerDownRight size={10} /> @{m.replyToSender}
                                    </div>
                                    <div className="truncate">{m.replyToText}</div>
                                  </div>
                                )}
                                {m.text}
                                
                                {m.reactions && m.reactions.length > 0 && (
                                  <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-md border border-black/10 cursor-pointer z-10`} onClick={(e) => { e.stopPropagation(); setViewingReacters(m.reactions?.[0] || null); }}>
                                    {m.reactions.map(r => (
                                      <button key={r.emoji} onClick={(e) => { e.stopPropagation(); setViewingReacters(r); }} className="flex items-center gap-1 hover:scale-110 transition-transform">
                                        <span className="text-xs">{r.emoji}</span>
                                        <span className={`text-[8px] font-black ${isDarkMode ? 'text-white' : '!text-black'}`}>{r.users.length}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <div className={`absolute ${isMe ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-black/5 backdrop-blur-sm p-1 rounded-xl z-20`}>
                                  <button onClick={() => setReactionPickerMsgId(reactionPickerMsgId === m.id ? null : m.id)} className={`p-2 rounded-lg hover:bg-black/10 transition-colors ${isDarkMode ? 'text-slate-400' : '!text-black'}`}><Smile size={16} /></button>
                                  <button onClick={() => { setReplyingTo(m); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className={`p-2 rounded-lg hover:bg-black/10 transition-colors ${isDarkMode ? 'text-slate-400' : '!text-black'}`}><Reply size={16} /></button>
                                </div>

                                <AnimatePresence>
                                  {reactionPickerMsgId === m.id && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className={`absolute z-30 ${isMe ? 'right-0 -top-12' : 'left-0 -top-12'} bg-white dark:bg-slate-800 border-4 border-black/10 rounded-full p-1.5 flex gap-1.5 shadow-2xl`}>
                                      {REACTION_EMOJIS.map(emoji => {
                                        const isReacted = m.reactions?.find(r => r.emoji === emoji && r.users.includes(currentUser.username));
                                        return (<button key={emoji} onClick={() => { onReactToMessage(m.id, emoji); setReactionPickerMsgId(null); }} className={`hover:scale-125 transition-transform p-1.5 rounded-full ${isReacted ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>{emoji}</button>);
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-2 text-[9px] font-black uppercase ${isDarkMode ? 'text-white/30' : '!text-black opacity-60'} ${isMe ? 'justify-end' : 'justify-start'}`}>
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
                        <p className={`text-xs font-bold truncate mt-1 ${isDarkMode ? 'opacity-60' : '!text-black'}`}>"{replyingTo.text}"</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className={`p-2 hover:text-red-500 transition-colors ${isDarkMode ? 'text-slate-400' : '!text-black'}`}><X size={16} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className={`flex items-center gap-3 p-2 rounded-2xl border-4 ${isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-gray-50 border-gray-200'} focus-within:border-blue-500/50 transition-all`}>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={replyingTo ? "Transmit reply..." : "Broadcast frequency..."} className={`flex-1 bg-transparent px-4 py-2 font-bold text-sm outline-none ${isDarkMode ? 'text-white' : '!text-black'}`} />
                  <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40">
              <MessageSquare size={80} className={`mb-6 ${isDarkMode ? 'text-slate-400' : '!text-black'}`} />
              <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : '!text-black'}`}>Citizen Terminal</h3>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-2 ${isDarkMode ? 'text-white' : '!text-black'}`}>Select a frequency to synchronize transmissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Creation Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg rounded-[3rem] p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : '!text-black'}`}>Initialize Group</h3>
                <button onClick={() => setIsCreatingGroup(false)} className="bg-black/10 p-2 rounded-full"><X size={24} className={isDarkMode ? 'text-white' : '!text-black'} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className={`text-[10px] font-black uppercase ml-2 tracking-widest ${isDarkMode ? 'text-white/40' : '!text-black'}`}>Group Designation</p>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Echo Squad..." className={`w-full p-4 rounded-2xl border-4 font-black text-lg outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-200 !text-black'}`} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] font-black uppercase ml-2 tracking-widest ${isDarkMode ? 'text-white/40' : '!text-black'}`}>Select Citizens ({selectedForGroup.length})</p>
                  </div>
                  <div className="relative">
                    <input type="text" value={groupSearchTerm} onChange={(e) => setGroupSearchTerm(e.target.value)} placeholder="Search for citizens..." className={`w-full p-3 pl-10 rounded-xl border-2 font-bold text-xs outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-200 !text-black'}`} />
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white' : '!text-black'} opacity-80`} size={16} />
                  </div>
                  <div className={`h-56 overflow-y-auto fading-scrollbar border-4 rounded-2xl p-2 grid grid-cols-1 gap-2 ${isDarkMode ? 'border-slate-800 bg-black/10' : 'border-gray-200 bg-gray-50'}`}>
                    {groupFilterList.length > 0 ? groupFilterList.map(u => (
                      <button 
                        key={u.username} 
                        onClick={() => setSelectedForGroup(prev => prev.includes(u.username) ? prev.filter(un => un !== u.username) : [...prev, u.username])}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedForGroup.includes(u.username) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/10'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center font-black overflow-hidden">{u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.displayName[0]}</div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-1">
                            <p className={`font-black text-xs uppercase ${selectedForGroup.includes(u.username) ? 'text-white' : '!text-black dark:text-white'}`}>{u.displayName}</p>
                            {getIsCreator(u.username) && <Crown size={10} className="text-yellow-400" />}
                          </div>
                          <p className={`text-[9px] font-bold ${selectedForGroup.includes(u.username) ? 'text-white/80' : '!text-black dark:text-white/40'}`}>@{u.username}</p>
                        </div>
                        {selectedForGroup.includes(u.username) && <Check size={16} />}
                      </button>
                    )) : (
                      <div className={`text-center py-10 font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'text-white/20' : '!text-black opacity-30'}`}>No citizens found.</div>
                    )}
                  </div>
                </div>

                <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedForGroup.length === 0} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase text-xl shadow-xl active:scale-95 disabled:opacity-30 transition-all">
                  AUTHORIZE GROUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Group Settings Modal */}
      <AnimatePresence>
        {isEditingGroup && currentGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-2xl rounded-[3.5rem] p-8 md:p-12 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-4 border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
              <div className="flex justify-between items-center mb-10">
                <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : '!text-black'}`}>Frequency Settings</h3>
                <button onClick={() => setIsEditingGroup(false)} className="bg-black/10 p-2 rounded-full"><X size={24} className={isDarkMode ? 'text-white' : '!text-black'} /></button>
              </div>

              <div className="flex-1 overflow-y-auto fading-scrollbar pr-4 space-y-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                   <div className="relative group cursor-pointer" onClick={() => {
                     const nextIdx = (GROUP_EMOJIS.indexOf(editGroupPhoto) + 1) % GROUP_EMOJIS.length;
                     setEditGroupPhoto(GROUP_EMOJIS[nextIdx]);
                   }}>
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-6xl shadow-xl border-4 border-white/20">
                       {editGroupPhoto.length < 5 ? editGroupPhoto : <img src={editGroupPhoto} className="w-full h-full object-cover" />}
                     </div>
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                       <Camera size={40} className="text-white" />
                     </div>
                   </div>
                   
                   <div className="flex-1 space-y-4 w-full">
                     <div className="space-y-2">
                       <p className={`text-[10px] font-black uppercase ml-2 ${isDarkMode ? 'text-white/40' : '!text-black'}`}>Channel Name</p>
                       <input type="text" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className={`w-full p-4 rounded-2xl border-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-200 !text-black'} font-black text-lg outline-none focus:border-blue-500`} />
                     </div>
                     <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : '!text-black'}`}>Group ID: {currentGroup.id}</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Users size={24} className="text-blue-500" />
                    <h4 className={`text-xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : '!text-black'}`}>Nickname Registry</h4>
                  </div>
                  <div className="space-y-4">
                    {currentGroup.members.map(member => (
                      <div key={member} className={`flex items-center gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/10 border-black/10'} border-2`}>
                        <div className={`w-10 h-10 rounded-xl ${getIsCreator(member) ? 'bg-yellow-400 shadow-lg shadow-yellow-400/20' : 'bg-blue-600'} text-white flex items-center justify-center font-black shrink-0`}>
                          {member[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/40' : '!text-black'}`}>@{member}</p>
                            {getIsCreator(member) && <Crown size={10} className="text-yellow-400" />}
                          </div>
                          <input 
                            type="text" 
                            placeholder="Set Nickname..." 
                            value={nicknames[member] || ''} 
                            onChange={e => setNicknames({...nicknames, [member]: e.target.value})}
                            className={`w-full bg-transparent font-black text-sm outline-none border-b-2 border-transparent focus:border-blue-500 transition-all py-1 ${isDarkMode ? 'text-white' : '!text-black'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-black/10 space-y-4">
                  <button onClick={handleSaveSettings} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase text-base shadow-xl active:scale-95 transition-all">
                    COMMIT CHANGES
                  </button>
                  <button onClick={handleLeaveGroup} className="w-full py-5 rounded-2xl bg-red-600/10 text-red-600 border-4 border-red-600/20 font-black uppercase text-base hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    <LogOut size={20} /> LEAVE FREQUENCY
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Reacters Modal */}
      <AnimatePresence>
        {viewingReacters && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-sm rounded-[3rem] p-8 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border-4 shadow-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{viewingReacters.emoji}</span>
                  <h3 className={`text-xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : '!text-black'}`}>Reacters</h3>
                </div>
                <button onClick={() => setViewingReacters(null)} className="p-2 rounded-full hover:bg-black/10"><X size={24} className={`opacity-60 ${isDarkMode ? 'text-white' : '!text-black'}`} /></button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto fading-scrollbar">
                {viewingReacters.users.map(u => {
                  const userObj = allUsers.find(cu => cu.username === u);
                  return (
                    <div key={u} className={`flex items-center gap-3 p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/10'}`}>
                      <div className={`w-10 h-10 rounded-xl ${getIsCreator(u) ? 'bg-yellow-400' : 'bg-custom'} text-white flex items-center justify-center font-black shadow-sm overflow-hidden border-2 border-white/20`}>
                        {userObj?.profilePic ? <img src={userObj.profilePic} className="w-full h-full object-cover" /> : u[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className={`font-black text-xs uppercase ${isDarkMode ? 'text-white' : '!text-black'}`}>{userObj?.displayName || u}</p>
                          {getIsCreator(u) && <Crown size={12} className="text-yellow-400" />}
                        </div>
                        <p className={`text-[10px] font-bold opacity-60 ${isDarkMode ? 'text-white' : '!text-black'}`}>@{u}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityHallSection;
