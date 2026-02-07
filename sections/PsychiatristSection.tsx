
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { User, ChatMessage } from '../types';
import { BrainCircuit, Send, Loader2, User as UserIcon } from 'lucide-react';

interface PsychiatristSectionProps {
  user: User;
  isDarkMode: boolean;
}

const PsychiatristSection: React.FC<PsychiatristSectionProps> = ({ user, isDarkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', role: 'model', text: `Greetings, Citizen ${user.displayName}. I am Dr. Pinel. How is your emotional frequency vibrating today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: `You are Dr. Pinel, an empathetic AI psychiatrist in the neon-city of Mooderia. Keep responses warm, futuristic, and under 3 sentences. User: ${user.displayName}.`,
          temperature: 0.8,
        }
      });
      
      const replyText = response.text || "Connection to the Grid lost. Please try again.";
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
       setMessages(prev => [...prev, {
        id: 'err', role: 'model', text: "Signal interrupted. Check your cloud connection.", timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col pb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4 shrink-0">
        <div>
          <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dr. Pinel</h2>
          <p className="opacity-40 font-black uppercase tracking-[0.2em] text-xs mt-2">Neural Wellness Guide</p>
        </div>
        <div className="px-6 py-3 bg-pink-500 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl flex items-center gap-2 border-b-4 border-pink-700">
            <BrainCircuit size={18} /> Sync Active
        </div>
      </div>

      <div className={`flex-1 rounded-[3rem] ${isDarkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black/5 shadow-2xl overflow-hidden flex flex-col relative`}>
         <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 fading-scrollbar">
            {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex items-end gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${msg.role === 'user' ? 'bg-indigo-100 border-indigo-500' : 'bg-pink-100 border-pink-500'}`}>
                        {msg.role === 'user' ? (user.profilePic ? <img src={user.profilePic} className="w-full h-full rounded-full object-cover"/> : <UserIcon size={20} className="text-indigo-600"/>) : <BrainCircuit size={20} className="text-pink-600"/>}
                    </div>
                    <div className={`max-w-[75%] p-6 rounded-[2rem] font-bold text-sm md:text-base leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : (isDarkMode ? 'bg-white/10 text-white rounded-tl-none' : 'bg-gray-100 text-slate-800 rounded-tl-none')}`}>
                        {msg.text}
                    </div>
                </motion.div>
            ))}
            {isTyping && (
                <div className="flex items-end gap-4">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-pink-100 border-pink-500"><BrainCircuit size={20} className="text-pink-600"/></div>
                     <div className={`p-6 rounded-[2rem] rounded-tl-none ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}><Loader2 className="animate-spin opacity-50" size={20}/></div>
                </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'} border-t-2 border-black/5`}>
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 md:gap-4">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Share your frequency..." className={`flex-1 p-4 md:p-5 rounded-[2rem] ${isDarkMode ? 'bg-[#222] text-white' : 'bg-white text-slate-900'} font-bold outline-none border-2 border-transparent focus:border-pink-500 shadow-inner`} />
                <button type="submit" disabled={!input.trim() || isTyping} className="kahoot-button-custom bg-pink-500 border-pink-700 p-4 md:p-5 rounded-[2rem] text-white shadow-xl disabled:opacity-50 transition-all"><Send size={24} /></button>
             </form>
         </div>
      </div>
    </div>
  );
};

export default PsychiatristSection;
