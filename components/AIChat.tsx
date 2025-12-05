import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, RefreshCw, AlertCircle, Sparkles, History, Mic, MicOff } from 'lucide-react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
import {
  chatWithPTStreaming,
  saveConversationMemory,
  loadAllConversations,
  createNewConversation,
  summarizeConversation,
  ConversationMemory
} from '../services/geminiService';
import { GeneratedProgram } from '../types';
import { UI_CONFIG } from '../constants';

interface AIChatProps {
  program: GeneratedProgram;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  isStreaming?: boolean;
  timestamp?: number;
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
    { role: 'model', text: 'Hej! Jag är din AI-Fysio. Har du frågor om ditt program eller hur en övning känns?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ConversationMemory | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationMemory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'sv-SE';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          // Show interim results in input as user speaks
          setInput(interimTranscript);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  // Initialize or load conversation on mount
  useEffect(() => {
    const allConvs = loadAllConversations();
    setConversations(allConvs);

    // Load most recent conversation or create new
    if (allConvs.length > 0) {
      const latest = allConvs[allConvs.length - 1];
      // Only restore if less than 24 hours old
      if (Date.now() - latest.updatedAt < 24 * 60 * 60 * 1000) {
        setCurrentConversation(latest);
        if (latest.messages.length > 0) {
          setMessages([
            { role: 'model', text: 'Välkommen tillbaka! Här är vår tidigare konversation.', timestamp: Date.now() },
            ...latest.messages.map(m => ({ ...m, timestamp: m.timestamp }))
          ]);
        }
      } else {
        const newConv = createNewConversation();
        setCurrentConversation(newConv);
      }
    } else {
      const newConv = createNewConversation();
      setCurrentConversation(newConv);
    }
  }, []);

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

  // Save conversation when messages change
  useEffect(() => {
    if (currentConversation && messages.length > 1) {
      const updatedConv: ConversationMemory = {
        ...currentConversation,
        messages: messages
          .filter(m => !m.isError && !m.isStreaming)
          .map(m => ({
            role: m.role,
            text: m.text,
            timestamp: m.timestamp || Date.now()
          })),
        updatedAt: Date.now()
      };
      saveConversationMemory(updatedConv);
      setCurrentConversation(updatedConv);
    }
  }, [messages.length]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isStreaming) return;

    setInput('');
    setLastFailedMessage(null);
    const userMessage: Message = { role: 'user', text: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    streamingTextRef.current = '';

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true, timestamp: Date.now() }]);

    try {
      const context = `
        Programtitel: ${program.title}
        Analys: ${program.conditionAnalysis}
        Nuvarande fas: ${program.phases[0].phaseName}
        Mål: ${program.phases[0].goals.join(', ')}
        ${currentConversation?.summary ? `Sammanfattning av tidigare: ${currentConversation.summary}` : ''}
      `;

      const history = messages
        .filter(m => !m.isError && !m.isStreaming)
        .concat(userMessage);

      await chatWithPTStreaming(
        history.map(m => ({ role: m.role, text: m.text })),
        context,
        (chunk) => {
          streamingTextRef.current += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.isStreaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                text: streamingTextRef.current
              };
            }
            return updated;
          });
        },
        () => {
          // On complete - remove streaming flag
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.isStreaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                isStreaming: false
              };
            }
            return updated;
          });
          setIsStreaming(false);
          setIsLoading(false);

          // Check if we should summarize
          if (currentConversation && messages.length > 15) {
            summarizeConversation(messages.map(m => ({ role: m.role, text: m.text })))
              .then(summary => {
                if (summary && currentConversation) {
                  const updatedConv = { ...currentConversation, summary };
                  saveConversationMemory(updatedConv);
                  setCurrentConversation(updatedConv);
                }
              });
          }
        }
      );
    } catch (e) {
      console.error('Chat error:', e);
      setLastFailedMessage(messageText);
      // Remove streaming message and add error
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isStreaming);
        return [...filtered, {
          role: 'model',
          text: "Kunde inte ansluta till coachen just nu. Klicka på 'Försök igen' för att skicka om ditt meddelande.",
          isError: true,
          timestamp: Date.now()
        }];
      });
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleRetry = () => {
    if (lastFailedMessage) {
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

  const handleNewConversation = () => {
    const newConv = createNewConversation();
    setCurrentConversation(newConv);
    setMessages([
      { role: 'model', text: 'Hej! Jag är din AI-Fysio. Har du frågor om ditt program eller hur en övning känns?', timestamp: Date.now() }
    ]);
    setLastFailedMessage(null);
    setShowHistory(false);
  };

  const handleLoadConversation = (conv: ConversationMemory) => {
    setCurrentConversation(conv);
    if (conv.messages.length > 0) {
      setMessages(conv.messages.map(m => ({ ...m, timestamp: m.timestamp })));
    }
    setShowHistory(false);
  };

  const toggleHistory = () => {
    if (!showHistory) {
      setConversations(loadAllConversations());
    }
    setShowHistory(!showHistory);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden print:hidden">
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">RehabFlow Coach</h3>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></span>
                  {isStreaming ? 'Skriver...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleHistory}
                className={`p-1.5 rounded transition-colors ${showHistory ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Visa historik"
                aria-label="Visa historik"
              >
                <History size={16} />
              </button>
              <button
                onClick={handleNewConversation}
                className="text-slate-400 hover:text-white p-1.5 transition-colors"
                title="Ny konversation"
                aria-label="Ny konversation"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 transition-colors"
                aria-label="Stäng chatt"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-10 max-h-64 overflow-y-auto">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Tidigare konversationer</span>
                <button
                  onClick={handleNewConversation}
                  className="text-xs text-primary-600 hover:underline"
                >
                  + Ny chatt
                </button>
              </div>
              {conversations.length === 0 ? (
                <p className="p-4 text-sm text-slate-400 text-center">Ingen historik ännu</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {conversations.slice().reverse().map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv)}
                      className={`w-full p-3 text-left hover:bg-slate-50 transition-colors ${
                        currentConversation?.id === conv.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {conv.messages[0]?.text?.slice(0, 40) || 'Tom konversation'}...
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {conv.messages.length} meddelanden
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-2">
                          {formatDate(conv.updatedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                  <span className={msg.isStreaming ? 'streaming-text' : ''}>
                    {msg.text}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-0.5 bg-slate-400 animate-pulse" />}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator (before streaming starts) */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={12} className="animate-spin" /> Ansluter...
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
            {speechSupported && (
              <button
                onClick={toggleListening}
                disabled={isLoading || isStreaming}
                className={`p-2.5 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isListening ? 'Stoppa inspelning' : 'Spela in röstmeddelande'}
                title={isListening ? 'Stoppa' : 'Tala'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Lyssnar...' : 'Ställ en fråga...'}
              className={`flex-grow p-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${
                isListening ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={isLoading || isStreaming}
              aria-label="Chattmeddelande"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isStreaming}
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
