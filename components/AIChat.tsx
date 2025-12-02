import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { chatWithPT } from '../services/geminiService';
import { GeneratedProgram } from '../types';
import { UI_CONFIG } from '../constants';

interface AIChatProps {
  program: GeneratedProgram;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Hur länge ska jag vila mellan övningar?",
  "Är det normalt att det gör ont?",
  "Kan jag träna på gymmet också?",
  "Hur vet jag om jag gör framsteg?"
];

const AIChat: React.FC<AIChatProps> = ({ program }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hej! Jag är din AI-Fysio. Har du frågor om ditt program eller hur en övning känns?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Limit message history to prevent memory issues
  useEffect(() => {
    if (messages.length > UI_CONFIG.MAX_CHAT_HISTORY) {
      setMessages(prev => prev.slice(-UI_CONFIG.MAX_CHAT_HISTORY));
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setInput('');
    setLastFailedMessage(null);
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setIsLoading(true);

    try {
      const context = `
        Programtitel: ${program.title}
        Analys: ${program.conditionAnalysis}
        Nuvarande fas: ${program.phases[0].phaseName}
        Mål: ${program.phases[0].goals.join(', ')}
      `;

      const response = await chatWithPT(
        [...messages, { role: 'user', text: messageText }],
        context
      );

      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error('Chat error:', e);
      setLastFailedMessage(messageText);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Kunde inte ansluta till coachen just nu. Klicka på 'Försök igen' för att skicka om ditt meddelande.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleRetry = () => {
    if (lastFailedMessage) {
      // Remove the error message
      setMessages(prev => prev.filter(m => !m.isError));
      sendMessage(lastFailedMessage);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      { role: 'model', text: 'Hej! Jag är din AI-Fysio. Har du frågor om ditt program eller hur en övning känns?' }
    ]);
    setLastFailedMessage(null);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 print:hidden ${isOpen ? 'hidden' : 'flex'}`}
        title="Chatta med AI-Fysion"
        aria-label="Öppna chatt"
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                title="Rensa chatt"
                aria-label="Rensa chatt"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                aria-label="Stäng chatt"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.isError && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-red-600">
                      <AlertCircle size={14} />
                      <span className="font-bold text-xs">Fel</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={12} className="animate-spin" /> Tänker...
                </div>
              </div>
            )}

            {/* Retry button */}
            {lastFailedMessage && !isLoading && (
              <div className="flex justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium transition-colors"
                >
                  <RefreshCw size={12} /> Försök igen
                </button>
              </div>
            )}

            {/* Suggested questions - only show at start */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={10} /> Förslag på frågor
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedQuestion(q)}
                      className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-50 hover:border-primary-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ställ en fråga..."
              className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={isLoading}
              aria-label="Chattmeddelande"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Skicka meddelande"
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
