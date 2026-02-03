import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bell, CheckCircle2, Inbox, Clock, ShieldAlert, Sparkles, Trophy, UserPlus, Reply, X, Check } from 'lucide-react';
import { Notification } from '../types';
import { respondToFriendRequest } from '../services/supabaseService';

interface NotificationsSectionProps {
  notifications: Notification[];
  isDarkMode: boolean;
  onMarkRead: () => void;
  currentUser: string; // Needed for handling requests
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ notifications, isDarkMode, onMarkRead, currentUser }) => {
  useEffect(() => {
    onMarkRead();
  }, [onMarkRead]);

  const handleFriendAction = async (fromUser: string | undefined, accept: boolean) => {
    if (!fromUser) return;
    await respondToFriendRequest(currentUser, fromUser, accept);
    // Note: State update happens in App.tsx via polling, but for UX we can hide it immediately or show success.
    // In this simplified version, we rely on the parent polling to clear the notification from the list eventually.
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="text-red-500" size={28} fill="currentColor" />;
      case 'friend_request': return <UserPlus className="text-orange-500" size={28} />;
      case 'friend_accepted': return <CheckCircle2 className="text-green-500" size={28} />;
      case 'comment_heart': return <Heart className="text-pink-500" size={28} fill="currentColor" />;
      case 'comment': return <MessageCircle className="text-blue-500" size={28} fill="currentColor" />;
      case 'reply': return <Reply className="text-cyan-500" size={28} />;
      case 'repost': return <Repeat className="text-green-500" size={28} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={28} />;
      case 'follow': return <UserPlus className="text-indigo-500" size={28} />;
      default: return <Sparkles size={28} className="text-purple-500" />;
    }
  };

  const getMessageText = (notif: Notification) => {
    switch (notif.type) {
      case 'friend_request': return (
         <div>
            <p className="text-base md:text-lg leading-tight font-bold mb-2">
              <span className="font-black text-orange-500">@{notif.fromUser}</span> wants to link frequencies.
            </p>
            <div className="flex gap-2">
                <button onClick={() => handleFriendAction(notif.fromUser, true)} className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs uppercase shadow-md flex items-center gap-1"><Check size={14}/> Accept</button>
                <button onClick={() => handleFriendAction(notif.fromUser, false)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-xs uppercase shadow-md flex items-center gap-1"><X size={14}/> Deny</button>
            </div>
         </div>
      );
      case 'friend_accepted': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-green-500">@{notif.fromUser}</span> is now connected to your grid.
        </p>
      );
      case 'heart': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-[#e21b3c]">@{notif.fromUser}</span> liked your transmission
        </p>
      );
      // ... (Rest of existing cases)
      case 'comment_heart': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-pink-500">@{notif.fromUser}</span> liked your frequency (comment)
        </p>
      );
      case 'comment': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-blue-500">@{notif.fromUser}</span> replied to your transmission
        </p>
      );
      case 'reply': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-cyan-500">@{notif.fromUser}</span> responded to your frequency
        </p>
      );
      case 'repost': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-green-500">@{notif.fromUser}</span> echoed your transmission
        </p>
      );
      case 'follow': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-indigo-500">@{notif.fromUser}</span> started following your frequencies!
        </p>
      );
      case 'achievement': return (
        <p className="text-base md:text-lg leading-tight font-bold">
          <span className="font-black text-yellow-500">METROPOLIS ALERT:</span> {notif.postContentSnippet}
        </p>
      );
      default: return <p className="font-bold">Activity from <span className="font-black">@{notif.fromUser}</span></p>;
    }
  };

  const getColorTheme = (type: string) => {
    switch (type) {
      case 'friend_request': return 'border-orange-500 bg-orange-500/5';
      case 'friend_accepted': return 'border-green-500 bg-green-500/5';
      case 'heart': return 'border-[#e21b3c] bg-[#e21b3c]/5';
      case 'comment_heart': return 'border-pink-500 bg-pink-500/5';
      case 'comment': return 'border-blue-500 bg-blue-500/5';
      case 'reply': return 'border-cyan-500 bg-cyan-500/5';
      case 'repost': return 'border-green-500 bg-green-500/5';
      case 'achievement': return 'border-yellow-500 bg-yellow-500/5';
      case 'follow': return 'border-indigo-500 bg-indigo-500/5';
      default: return 'border-purple-500 bg-purple-500/5';
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="space-y-10 min-h-[70vh] pb-32 overflow-y-auto fading-scrollbar px-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>City Alerts</h2>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-3">Live from the Metropolis Secure Network</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl border-b-[6px] border-green-700">
          <ShieldAlert size={18} /> Network Secured
        </div>
      </div>

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`py-32 text-center rounded-[4rem] border-[6px] border-dashed ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} flex flex-col items-center gap-6`}>
            <div className="bg-gray-100 dark:bg-white/5 p-10 rounded-full"><Inbox size={80} className="opacity-20" /></div>
            <div>
              <p className="text-2xl font-black uppercase italic opacity-30">The streets are quiet</p>
              <p className="text-xs font-bold max-w-xs mx-auto mt-2 opacity-20 uppercase tracking-widest">Transmit in the Express tab to activate notifications</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {[...notifications].reverse().map((notif, i) => (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`p-8 rounded-[3rem] border-l-[12px] shadow-2xl flex flex-col md:flex-row items-start md:items-center gap-8 transition-all hover:scale-[1.02] ${isDarkMode ? 'text-white bg-[#111111]' : 'text-slate-900 bg-white'} ${getColorTheme(notif.type)}`}>
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg border-4 border-black/5 bg-white dark:bg-slate-800`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    {getMessageText(notif)}
                    <span className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em] flex items-center gap-2">
                       <Clock size={14}/> {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  {notif.type !== 'follow' && notif.type !== 'friend_request' && notif.postContentSnippet && (
                    <div className="p-5 bg-black/5 dark:bg-white/5 rounded-[1.5rem] italic text-sm font-medium opacity-80 border-l-4 border-black/10 truncate">
                      "{notif.postContentSnippet}"
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;