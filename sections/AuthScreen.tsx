
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import LoadingScreen from '../components/LoadingScreen';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allUsersStr = localStorage.getItem('mooderia_all_users') || '[]';
    const allUsers: User[] = JSON.parse(allUsersStr);

    if (isSignUp) {
      const userExists = allUsers.some(u => u.email === email || u.username === username);
      if (userExists) {
        setError('This identity already exists in the metropolis.');
        return;
      }

      const newUser: User = {
        displayName: displayName,
        username: username,
        email: email,
        password: password,
        followers: [],
        following: [],
        friends: [],
        blockedUsers: [],
        posts: [],
        reposts: [],
        moodHistory: [],
        moodStreak: 0,
        title: email === 'travismiguel014@gmail.com' ? 'Creator' : 'Citizen',
        likesReceived: 0,
        petName: 'Guardian',
        moodCoins: 100,
        petEmoji: '🐱',
        petHunger: 100,
        petThirst: 100,
        petRest: 100,
        petLevel: 1,
        petExp: 0,
        petHasBeenChosen: false,
        petLastUpdate: Date.now(),
        petSleepUntil: null,
        gameCooldowns: {}
      };

      allUsers.push(newUser);
      localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
      
      setIsAuthenticating(true);
      setTimeout(() => {
        localStorage.setItem('mooderia_user', JSON.stringify(newUser));
        onLogin(newUser);
      }, 1500);
    } else {
      const existingUser = allUsers.find(u => u.email === email && u.password === password);
      
      if (existingUser) {
        setIsAuthenticating(true);
        setTimeout(() => {
          localStorage.setItem('mooderia_user', JSON.stringify(existingUser));
          onLogin(existingUser);
        }, 1200);
      } else {
        setError('Credentials invalid. Access denied.');
      }
    }
  };

  if (isAuthenticating) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#46178f] p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute text-white font-black opacity-20 rotate-12 text-6xl" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}>MOODERIA</div>
        ))}
      </div>
      
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-slate-900 border-4 border-white/10 rounded-[2.5rem] shadow-2xl p-8 z-10 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter mb-2 uppercase">Mooderia</h1>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Neural Access Terminal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div key="signup" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                <input type="text" placeholder="Identity Name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white border-2 border-slate-700 focus:border-blue-500 outline-none font-bold text-sm" />
                <input type="text" placeholder="ID Handle (Username)" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white border-2 border-slate-700 focus:border-blue-500 outline-none font-bold text-sm" />
              </motion.div>
            )}
          </AnimatePresence>
          <input type="email" placeholder="Neural Link (Email)" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white border-2 border-slate-700 focus:border-blue-500 outline-none font-bold text-sm" />
          <input type="password" placeholder="Access Phrase (Password)" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white border-2 border-slate-700 focus:border-blue-500 outline-none font-bold text-sm" />
          {error && <p className="text-[#e21b3c] text-xs font-black text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
          <button type="submit" className="kahoot-button-blue w-full p-5 rounded-2xl text-white font-black text-lg mt-4 shadow-lg active:scale-95 uppercase">{isSignUp ? 'Authorize ID' : 'Synchronize'}</button>
        </form>
        
        <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="mt-8 w-full text-xs font-bold text-blue-400 hover:text-white transition-colors hover:underline text-center uppercase tracking-widest">
          {isSignUp ? 'Already a citizen? Log in' : "New entity? Apply for Citizenship"}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
