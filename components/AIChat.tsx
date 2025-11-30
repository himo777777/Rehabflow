
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { chatWithPT } from '../services/geminiService';
import { GeneratedProgram } from '../types';

interface AIChatProps {
  program: GeneratedProgram;
}

const AIChat: React.FC<AIChatProps> = ({ program }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: 'Hej! Jag är din AI-Fysio. Har du frågor om ditt program eller hur en övning känns?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const context = `
            Programtitel: ${program.title}
            Analys: ${program.conditionAnalysis}
            Nuvarande fas: ${program.phases[0].phaseName}
            Mål: ${program.phases[0].goals.join(', ')}
        `;
        
        const response = await chatWithPT(
            [...messages, { role: 'user', text: userMsg }], 
            context
        );
        
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Kunde inte ansluta till coachen just nu." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 print:hidden ${isOpen ? 'hidden' : 'flex'}`}
        title="Chatta med AI-Fysion"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden print:hidden">
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">RehabFlow Coach</h3>
                        <p className="text-[10px] text-slate-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-xs">
                            <Loader2 size={12} className="animate-spin" /> Tänker...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ställ en fråga..." 
                    className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
