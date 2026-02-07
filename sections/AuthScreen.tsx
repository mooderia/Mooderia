
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { LogIn, UserPlus, Building2, Loader2, AlertTriangle, Globe, Copy, Check, ArrowRight, ShieldCheck, WifiOff, KeyRound, Download } from 'lucide-react';
import { loginUser, registerUser, importTransferCode } from '../services/supabaseService';
import { COUNTRIES } from '../constants';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'recover'>('login');
  const [loginCode, setLoginCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up States
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].code);
  
  const [passportInput, setPassportInput] = useState('');

  const [newlyCreated, setNewlyRegistered] = useState<{ code: string, isLocal: boolean, username: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyCode = () => {
    if (newlyCreated) {
        navigator.clipboard.writeText(newlyCreated.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'recover') {
        if (!passportInput.trim()) { setError("Passport String required."); setIsLoading(false); return; }
        const result = await importTransferCode(passportInput);
        if (result.success && result.user) onLogin(result.user);
        else setError(result.error || "Recovery failed.");
      } else if (mode === 'signup') {
        if (!password || !firstName || !lastName || !username) { setError("All fields required."); setIsLoading(false); return; }
        
        // Basic username validation
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (cleanUsername.length < 3) { setError("Username too short (min 3 chars)."); setIsLoading(false); return; }

        const newUser: User = {
          displayName: `${firstName} ${lastName}`.trim(), 
          username: cleanUsername,
          citizenCode: '', 
          password: password, 
          country: selectedCountry,
          moodHistory: [], diaryEntries: [], schedule: [], routines: [], moodStreak: 0, moodCoins: 0, 
          petName: 'Guardian', petEmoji: '🐱', petLevel: 1, petExp: 0, petHasBeenChosen: false,
          petBackground: 'default', unlockedBackgrounds: ['default'], friends: [], friendRequests: [],
          following: [], followers: [], likesReceived: 0, title: 'Citizen'
        };
        const result = await registerUser(newUser, password);
        if (!result.success) setError(result.error || 'Registration failed.');
        else setNewlyRegistered({ code: result.citizenCode!, isLocal: !!result.isLocal, username: cleanUsername });
      } else {
        if (!loginCode || !loginPassword) { setError("ID and Phrase required."); setIsLoading(false); return; }
        const result = await loginUser(loginCode, loginPassword);
        if (result.success && result.user) onLogin(result.user);
        else setError(result.error || 'Login failed.');
      }
    } catch (err) {
      setError('System malfunction.');
    } finally {
      setIsLoading(false);
    }
  };

  if (newlyCreated) {
    return (
        <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center"><Building2 size={600} className="text-white" /></div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 border-b-[12px] border-black/10 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-600" /></div>
                <h2 className="text-3xl font-black italic uppercase text-indigo-900 tracking-tighter mb-4">Identity Forged</h2>
                <p className="font-bold text-gray-500 mb-6">Welcome, @{newlyCreated.username}</p>
                {newlyCreated.isLocal && (
                  <div className="bg-yellow-50 p-4 rounded-2xl mb-6 border-2 border-yellow-200 text-left flex items-start gap-3">
                     <WifiOff className="text-yellow-600 shrink-0" size={20} />
                     <p className="text-[10px] font-black uppercase text-yellow-800 leading-tight">Cloud Link Blocked. Your account is Local-Only. Go to Settings later to export a Passport String for other devices.</p>
                  </div>
                )}
                <div className="bg-black/5 p-6 rounded-2xl mb-8 border-2 border-black/5 relative">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Citizen Code</p>
                    <p className="text-5xl font-mono font-black tracking-widest text-indigo-600">{newlyCreated.code}</p>
                    <button onClick={handleCopyCode} className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100">{copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}</button>
                </div>
                <button onClick={() => { setLoginCode(newlyCreated.code); setNewlyRegistered(null); setMode('login'); }} className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase shadow-xl flex items-center justify-center gap-2">Enter Metropolis <ArrowRight size={20}/></button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center"><Building2 size={600} className="text-white" /></div>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 border-b-[12px] border-black/10">
        <div className="text-center mb-10">
           <h1 className="text-4xl md:text-6xl font-black italic text-indigo-600 tracking-tighter uppercase mb-2">Mooderia</h1>
           <div className="flex items-center justify-center gap-2 opacity-40">
             <ShieldCheck size={14} /><p className="text-[10px] font-black uppercase tracking-[0.2em]">Cross-Device Enabled</p>
           </div>
        </div>

        <div className="flex bg-black/5 p-1 rounded-xl mb-8 overflow-x-auto no-scrollbar">
           <button onClick={() => setMode('login')} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'login' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Passport</button>
           <button onClick={() => setMode('signup')} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'signup' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>New Citizen</button>
           <button onClick={() => setMode('recover')} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'recover' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Recover</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full p-4 rounded-xl bg-black/5 font-black text-sm border-b-4 border-transparent focus:border-indigo-500 outline-none" />
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full p-4 rounded-xl bg-black/5 font-black text-sm border-b-4 border-transparent focus:border-indigo-500 outline-none" />
                </div>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username (Unique Handle)" className="w-full p-4 rounded-xl bg-black/5 font-black text-sm border-b-4 border-transparent focus:border-indigo-500 outline-none" />
                
                <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 font-black text-sm border-b-4 border-transparent focus:border-indigo-500 outline-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Access Phrase" className="w-full p-4 rounded-xl bg-black/5 font-black text-sm border-b-4 border-transparent focus:border-indigo-500 outline-none" />
              </motion.div>
            )}

            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="000000" maxLength={6} className="w-full p-6 rounded-2xl bg-black/5 font-black text-center text-5xl tracking-[0.4em] outline-none focus:border-indigo-500 border-b-8 border-black/5" />
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Access Phrase" className="w-full p-4 rounded-xl bg-black/5 font-black text-center text-xl border-b-4 border-transparent focus:border-indigo-500 outline-none" />
              </motion.div>
            )}

            {mode === 'recover' && (
              <motion.div key="recover" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-xl text-[10px] font-bold text-indigo-700 leading-tight flex items-start gap-3">
                     <Download size={16} className="shrink-0" />
                     Paste your Passport String from your other device to instantly reconstruct your identity.
                  </div>
                  <textarea value={passportInput} onChange={e => setPassportInput(e.target.value)} placeholder="Paste Passport String here..." className="w-full p-4 rounded-xl bg-black/5 font-mono text-[10px] h-32 border-b-4 border-transparent focus:border-indigo-500 outline-none" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {error && <div className="p-4 bg-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase leading-tight border-b-4 border-red-200"><AlertTriangle size={20} className="shrink-0"/><p>{error}</p></div>}

          <button type="submit" disabled={isLoading} className="kahoot-button-blue w-full py-6 rounded-2xl text-white font-black uppercase text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
             {isLoading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? <LogIn size={24}/> : mode === 'signup' ? <UserPlus size={24}/> : <KeyRound size={24}/>)}
             {isLoading ? 'Beaming...' : (mode === 'login' ? 'Join Grid' : mode === 'signup' ? 'Initialize' : 'Recover Identity')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
