import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification, User } from '../types';
import { Mail, Bell, ShieldAlert, Clock, Inbox, CheckCircle2, Trash2, X, UserPlus, Check } from 'lucide-react';
import { respondToFriendRequest, markMessagesAsRead } from '../services/supabaseService';

interface MailSectionProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  isDarkMode: boolean;
  currentUser: User;
}

const MailSection: React.FC<MailSectionProps> = ({ notifications, setNotifications, isDarkMode, currentUser }) => {
  const [selectedMail, setSelectedMail] = useState<Notification | null>(null);

  useEffect(() => {
    // Mark all as read when entering in state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Persist read status in storage to prevent re-alerting on refresh
    markMessagesAsRead(currentUser.username);
  }, [currentUser.username, setNotifications]);

  const clearAll = () => {
    setNotifications([]);
  };

  const handleFriendAction = async (fromUsername: string, accept: boolean) => {
    const success = await respondToFriendRequest(currentUser.username, fromUsername, accept);
    if (success) {
      // Remove the notification from the local list
      setNotifications(prev => prev.filter(n => n.fromUser !== fromUsername || n.type !== 'friend_request'));
      setSelectedMail(null);
    }
  };

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Metropolis Mails</h2>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Notification Terminal</p>
        </div>
        <button onClick={clearAll} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 flex items-center gap-1 transition-all"><Trash2 size={14}/> CLEAR ARCHIVE</button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className={`p-20 rounded-[4rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-dashed border-black/5 text-center flex flex-col items-center gap-6 opacity-30`}>
             <Inbox size={80} />
             <p className="text-xl font-black uppercase italic">The terminal is silent.</p>
          </div>
        ) : (
          <AnimatePresence>
            {[...notifications].reverse().map(notif => (
              <motion.div 
                key={notif.id}
                layoutId={notif.id}
                onClick={() => setSelectedMail(notif)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-black/5'} border-4 shadow-lg flex items-start gap-4 transition-all hover:scale-[1.01] cursor-pointer relative overflow-hidden`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${notif.type === 'schedule' ? 'bg-blue-600' : notif.type === 'friend_request' ? 'bg-orange-500' : 'bg-yellow-500'} text-white`}>
                   {notif.type === 'schedule' ? <Bell size={28}/> : notif.type === 'friend_request' ? <UserPlus size={28}/> : <Mail size={28}/>}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <h5 className="font-black text-sm uppercase italic tracking-tight">{notif.title}</h5>
                      <span className="text-[9px] font-black opacity-30 uppercase flex items-center gap-1"><Clock size={12}/> {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <p className="text-sm font-bold opacity-70 leading-relaxed italic truncate">"{notif.text}"</p>
                   
                   {notif.type === 'friend_request' && (
                     <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleFriendAction(notif.fromUser!, true)}
                          className="kahoot-button-green px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase flex items-center gap-1 shadow-md"
                        >
                          <Check size={14}/> Accept
                        </button>
                        <button 
                          onClick={() => handleFriendAction(notif.fromUser!, false)}
                          className="kahoot-button-red px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase flex items-center gap-1 shadow-md"
                        >
                          <X size={14}/> Decline
                        </button>
                     </div>
                   )}
                </div>
                {!notif.read && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse mt-6" />}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className={`p-6 rounded-[2rem] bg-indigo-600/5 border-2 border-indigo-600/10 flex items-center gap-3 opacity-60`}>
         <ShieldAlert size={20} className="text-indigo-600" />
         <p className="text-[10px] font-black uppercase tracking-widest leading-none">All communications are encrypted by Mooderia City Grid.</p>
      </div>

      {/* Expanded Mail Modal */}
      <AnimatePresence>
        {selectedMail && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    layoutId={selectedMail.id}
                    className={`w-full max-w-2xl ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-slate-900'} p-10 rounded-[3rem] shadow-2xl relative border-4 border-white/20`}
                >
                    <button onClick={(e) => { e.stopPropagation(); setSelectedMail(null); }} className="absolute top-8 right-8 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X size={24}/></button>
                    
                    <div className="flex items-center gap-6 mb-8 border-b-2 border-black/5 pb-6">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg ${selectedMail.type === 'schedule' ? 'bg-blue-600' : selectedMail.type === 'friend_request' ? 'bg-orange-500' : 'bg-yellow-500'} text-white shrink-0`}>
                            {selectedMail.type === 'schedule' ? <Bell size={40}/> : selectedMail.type === 'friend_request' ? <UserPlus size={40}/> : <Mail size={40}/>}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] mb-1">{selectedMail.type === 'schedule' ? 'System Alert' : selectedMail.type === 'friend_request' ? 'Link Request' : 'Incoming Transmission'}</p>
                            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{selectedMail.title}</h2>
                            <p className="text-xs font-black opacity-30 mt-2 flex items-center gap-2"><Clock size={12}/> {new Date(selectedMail.timestamp).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-black/5 p-8 rounded-[2rem] min-h-[200px]">
                        <p className="text-lg md:text-2xl font-bold leading-relaxed italic">"{selectedMail.text}"</p>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        {selectedMail.type === 'friend_request' && (
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleFriendAction(selectedMail.fromUser!, true)}
                              className="kahoot-button-green flex-1 py-5 rounded-2xl text-white font-black uppercase text-lg shadow-xl"
                            >
                              Confirm Link
                            </button>
                            <button 
                              onClick={() => handleFriendAction(selectedMail.fromUser!, false)}
                              className="kahoot-button-red flex-1 py-5 rounded-2xl text-white font-black uppercase text-lg shadow-xl"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                        <button onClick={() => setSelectedMail(null)} className="px-8 py-3 rounded-full bg-indigo-600/10 text-indigo-600 font-black uppercase text-xs">Dismiss</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MailSection;