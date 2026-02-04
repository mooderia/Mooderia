import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { LogIn, UserPlus, Building2, Loader2, AlertTriangle, Scan, Globe, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser, importTransferCode } from '../services/supabaseService';
import { COUNTRIES } from '../constants';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  // Login State
  const [loginCode, setLoginCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].code);

  // Success State
  const [newlyCreatedCode, setNewlyRegisteredCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Recover State
  const [showRecover, setShowRecover] = useState(false);
  const [recoverData, setRecoverData] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyCode = () => {
    if (newlyCreatedCode) {
        navigator.clipboard.writeText(newlyCreatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToLogin = () => {
      if (newlyCreatedCode) {
          setLoginCode(newlyCreatedCode);
          setNewlyRegisteredCode(null);
          setMode('login');
          setFirstName('');
          setLastName('');
          setUsername('');
          setPassword('');
      }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (showRecover) {
        if (!recoverData) { setError("Please paste your data string."); setIsLoading(false); return; }
        const result = await importTransferCode(recoverData);
        if (result.success && result.user) {
            onLogin(result.user);
        } else {
            setError("Recovery Failed: " + (result.error || "Invalid Data"));
        }
      } else if (mode === 'signup') {
        if (!username || !password || !firstName || !lastName) { setError("All fields required."); setIsLoading(false); return; }
        
        const newUser: User = {
          displayName: `${firstName} ${lastName}`.trim(),
          username: username,
          email: `${username}@mooderia.local`,
          citizenCode: '', 
          country: selectedCountry,
          moodHistory: [],
          diaryEntries: [],
          schedule: [],
          routines: [],
          moodStreak: 0,
          moodCoins: 0, 
          petName: 'Guardian',
          petEmoji: '🐱',
          petLevel: 1,
          petExp: 0,
          petHasBeenChosen: false,
          petBackground: 'default',
          unlockedBackgrounds: ['default'],
          friends: [],
          friendRequests: [],
          following: [],
          followers: [],
          likesReceived: 0,
          title: 'Citizen'
        };

        const result = await registerUser(newUser, password);
        
        if (!result.success) {
          setError(result.error || 'Registration failed.');
        } else {
          if (result.citizenCode) {
              setNewlyRegisteredCode(result.citizenCode);
          } else {
              setError("System Error: ID not generated.");
          }
        }
      } else {
        if (!loginCode || !loginPassword) {
            setError("Identification and Phrase required.");
            setIsLoading(false);
            return;
        }
        const result = await loginUser(loginCode, loginPassword);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.error || 'Login failed. Check your ID and Phrase.');
        }
      }
    } catch (err) {
      setError('System malfunction.');
    } finally {
      setIsLoading(false);
    }
  };

  if (newlyCreatedCode) {
    return (
        <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center">
                <Building2 size={600} className="text-white" />
            </div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 border-b-[12px] border-black/10 text-center"
            >
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-black italic uppercase text-indigo-900 tracking-tighter leading-none mb-4">Registration Complete</h2>
                <p className="text-sm font-bold opacity-60 mb-8">This is your permanent Metropolis ID. You will need it to login on any device.</p>

                <div className="bg-black/5 p-6 rounded-2xl mb-8 relative border-2 border-black/5">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Your Metropolis ID</p>
                    <p className="text-5xl font-mono font-black tracking-widest text-indigo-600 select-all">{newlyCreatedCode}</p>
                    <button 
                        onClick={handleCopyCode}
                        className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100 transition-opacity"
                    >
                        {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                    </button>
                </div>

                <div className="bg-yellow-100 p-4 rounded-xl flex items-start gap-3 text-left mb-6">
                    <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                    <p className="text-[10px] font-black uppercase text-yellow-800 leading-tight pt-0.5">Save this code immediately. It is your key to the Cloud Neural Grid.</p>
                </div>

                <button 
                    onClick={handleProceedToLogin} 
                    className="kahoot-button-blue w-full py-5 rounded-2xl text-white font-black uppercase shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                    Proceed to Login <ArrowRight size={20}/>
                </button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center">
        <Building2 size={600} className="text-white" />
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 border-b-[12px] border-black/10"
      >
        <div className="text-center mb-10">
           <h1 className="text-4xl md:text-6xl font-black italic text-indigo-600 tracking-tighter uppercase mb-2">Mooderia</h1>
           <div className="flex items-center justify-center gap-2 opacity-40">
             <ShieldCheck size={14} />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cloud-Linked Neural Grid</p>
           </div>
        </div>

        {!showRecover && (
           <div className="flex bg-black/5 p-1.5 rounded-2xl mb-8">
              <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'login' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Passport Entry</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'signup' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>New Citizen</button>
           </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {showRecover ? (
             <div className="relative">
                <button type="button" onClick={() => setShowRecover(false)} className="absolute -top-10 right-0 text-[10px] font-black uppercase opacity-40">Cancel</button>
                <div className="mb-4">
                    <h3 className="font-black italic uppercase text-lg">Recover Identity</h3>
                    <p className="text-xs font-bold opacity-60">Paste your Cloud Passport Data String here.</p>
                </div>
                <textarea 
                  value={recoverData}
                  onChange={e => setRecoverData(e.target.value)}
                  placeholder="Paste encrypted string..."
                  className="w-full p-4 rounded-2xl bg-black/5 font-mono text-[10px] outline-none focus:border-indigo-500 border-2 border-transparent transition-all min-h-[150px]"
                />
             </div>
          ) : (
            <>
                {mode === 'signup' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            value={firstName} 
                            onChange={e => setFirstName(e.target.value)} 
                            placeholder="First Name" 
                            className="w-full p-4 rounded-2xl bg-black/5 font-black text-sm outline-none focus:border-indigo-500 border-b-4 border-transparent transition-all"
                        />
                        <input 
                            value={lastName} 
                            onChange={e => setLastName(e.target.value)} 
                            placeholder="Last Name" 
                            className="w-full p-4 rounded-2xl bg-black/5 font-black text-sm outline-none focus:border-indigo-500 border-b-4 border-transparent transition-all"
                        />
                    </div>
                     <div className="relative">
                        <select 
                            value={selectedCountry} 
                            onChange={e => setSelectedCountry(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-black/5 font-black text-sm outline-none focus:border-indigo-500 border-b-4 border-transparent appearance-none"
                        >
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                        <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"/>
                    </div>
                    <input 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder="Display @username" 
                      className="w-full p-4 rounded-2xl bg-black/5 font-black text-sm outline-none focus:border-indigo-500 border-b-4 border-transparent transition-all"
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Create Access Phrase" 
                        className="w-full p-4 rounded-2xl bg-black/5 font-black text-sm outline-none focus:border-indigo-500 border-b-4 border-transparent transition-all"
                    />
                  </div>
                )}
                
                {mode === 'login' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-4">Enter Citizen ID</p>
                            <input 
                                value={loginCode} 
                                onChange={e => setLoginCode(e.target.value)} 
                                placeholder="000000" 
                                maxLength={6}
                                className="w-full p-6 rounded-[2rem] bg-black/5 font-black text-center text-5xl tracking-[0.5em] outline-none focus:border-indigo-500 border-b-[8px] border-black/5 transition-all placeholder:opacity-10"
                            />
                        </div>
                        <div className="relative group">
                            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 ml-4">Access Phrase</p>
                            <input 
                                type="password" 
                                value={loginPassword} 
                                onChange={e => setLoginPassword(e.target.value)} 
                                placeholder="••••••••" 
                                className="w-full p-5 rounded-2xl bg-black/5 font-black text-center text-xl outline-none focus:border-indigo-500 border-b-4 border-transparent transition-all"
                            />
                        </div>
                    </div>
                )}
            </>
          )}
          
          {error && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black uppercase leading-tight border-b-4 border-red-200">
                 <AlertTriangle size={24} className="shrink-0"/>
                 <p>{error}</p>
             </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="kahoot-button-blue w-full py-6 rounded-2xl text-white font-black uppercase text-xl mt-6 shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {isLoading ? <Loader2 className="animate-spin" /> : showRecover ? <Scan size={24}/> : (mode === 'login' ? <LogIn size={24}/> : <UserPlus size={24}/>)}
             {isLoading ? 'Synchronizing...' : (showRecover ? 'Restore Identity' : (mode === 'login' ? 'Join Grid' : 'Initialize Account'))}
          </button>
          
          {!showRecover && mode === 'login' && (
              <button type="button" onClick={() => setShowRecover(true)} className="w-full py-3 text-[10px] font-black uppercase opacity-30 hover:opacity-100 transition-opacity">
                  Lost Device? Link Cloud Passport
              </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AuthScreen;