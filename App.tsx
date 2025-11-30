
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import ProgramView from './components/ProgramView';
import ExerciseLibrary from './components/ExerciseLibrary';
import ProgressDashboard from './components/ProgressDashboard';
import AIChat from './components/AIChat';
import { UserAssessment, GeneratedProgram } from './types';
import { generateRehabProgram } from './services/geminiService';
import { storageService } from './services/storageService';
import { Stethoscope, HeartPulse, UserCircle, BookOpen, Home, RefreshCw, Loader2, LogOut, TrendingUp, Sparkles, Cloud, ShieldAlert } from 'lucide-react';

type View = 'program' | 'library' | 'progress';

const LOADING_MESSAGES = [
  "Analyserar din skadeprofil...",
  "Konsulterar kliniska riktlinjer...",
  "Väljer ut evidensbaserade övningar...",
  "Strukturerar rehabiliteringsfaser...",
  "Optimerar belastningsnivåer...",
  "Färdigställer ditt program..."
];

export default function App() {
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [currentView, setCurrentView] = useState<View>('program');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load saved program on startup (Async now)
  useEffect(() => {
    const initApp = async () => {
        const savedProgram = await storageService.getProgram();
        if (savedProgram) {
            setProgram(savedProgram);
        }
        setIsInitializing(false);
    };
    initApp();
  }, []);

  // Rotate loading messages
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAssessmentSubmit = async (assessment: UserAssessment) => {
    setIsLoading(true);
    setLoadingMsgIndex(0);
    setError(null);
    try {
      const result = await generateRehabProgram(assessment);
      setProgram(result);
      // Save program AND the assessment data to Supabase/Local
      await storageService.saveProgram(result, assessment);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Misslyckades med att skapa program. Kontrollera din anslutning och försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Är du säker på att du vill radera ditt nuvarande program och börja om? Detta raderar även din data från molnet.")) {
      await storageService.clearProgram();
      setProgram(null);
      setCurrentView('program');
    }
  };

  // Calculate generic total exercises for progress tracking (simplified based on first phase)
  const totalExercises = program?.phases[0]?.dailyRoutine.flatMap(d => d.exercises).length || 0;

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-500 font-medium animate-pulse">Hämtar din journal...</p>
              </div>
          </div>
      );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/50 relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-[6px] border-primary-500 rounded-full border-t-transparent animate-spin"></div>
             <HeartPulse className="absolute inset-0 m-auto text-primary-500 animate-pulse" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Skapar ditt program</h2>
          <p className="text-slate-500 h-6 transition-all duration-500 fade-in font-medium">
             {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden w-full">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-6 print:hidden">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-lg rounded-2xl px-6 h-16 flex justify-between items-center transition-all duration-300">
            <button 
                onClick={() => setCurrentView('program')}
                className="flex items-center gap-3 focus:outline-none group"
            >
              <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
                <HeartPulse size={22} />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                RehabFlow
              </span>
            </button>
            
            <div className="flex items-center gap-2">
               <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-xl">
                 <button 
                    onClick={() => setCurrentView('program')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${currentView === 'program' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                 >
                    <Home size={18} /> <span className="hidden lg:inline">Hem</span>
                 </button>
                 
                 {program && (
                    <button 
                        onClick={() => setCurrentView('progress')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${currentView === 'progress' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    >
                        <TrendingUp size={18} /> <span className="hidden lg:inline">Framsteg</span>
                    </button>
                 )}

                 <button 
                    onClick={() => setCurrentView('library')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${currentView === 'library' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                 >
                    <BookOpen size={18} /> <span className="hidden lg:inline">Bibliotek</span>
                 </button>
               </div>
               
               {program && currentView === 'program' && (
                  <button 
                    onClick={handleReset}
                    className="ml-4 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                    title="Starta om / Nytt program"
                  >
                    <RefreshCw size={18} /> <span className="hidden md:inline text-sm font-medium">Starta om</span>
                  </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow relative px-4 sm:px-6">
        {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="p-2 bg-red-100 rounded-full"><LogOut size={16} /></div>
                <div><span className="font-bold">Ett fel uppstod:</span> {error}</div>
            </div>
        )}

        {currentView === 'library' ? (
          <ExerciseLibrary />
        ) : currentView === 'progress' ? (
          <ProgressDashboard totalExercisesInRoutine={totalExercises} />
        ) : (
          /* Program View Logic */
          !program ? (
            <div className="pt-8 px-4 max-w-5xl mx-auto">
              <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6 border border-primary-100">
                      <Sparkles size={12} /> AI-Driven Fysioterapi
                  </div>
                  <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                    Rehabilitering på <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">din kropps villkor.</span>
                  </h1>
                  <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
                    Få ett skräddarsytt återhämtningsprogram baserat på klinisk evidens, din skadehistorik och den senaste medicinska forskningen.
                  </p>
              </div>
              
              <Onboarding onSubmit={handleAssessmentSubmit} isLoading={isLoading} />
            </div>
          ) : (
            <ProgramView program={program} />
          )
        )}
        
        {/* GLOBAL AI CHAT COMPONENT */}
        {program && <AIChat program={program} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 print:hidden bg-slate-100/50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <HeartPulse size={24} className="text-primary-600"/>
                <span className="font-bold text-lg text-slate-700">RehabFlow</span>
            </div>
            
            <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50/50 rounded-xl border border-red-100 text-left">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wide mb-2">
                    <ShieldAlert size={14} /> Medicinsk Friskrivning
                </div>
                <p className="text-xs text-red-900/70 leading-relaxed">
                    RehabFlow är ett verktyg för egenvård och ersätter inte professionell medicinsk rådgivning, diagnos eller behandling. Sök alltid råd från läkare eller annan kvalificerad vårdgivare vid frågor om ett medicinskt tillstånd. Sluta omedelbart med övningar om du upplever skarp smärta eller obehag.
                </p>
            </div>

            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                &copy; {new Date().getFullYear()} RehabFlow. Alla rättigheter förbehållna.
            </p>
            
            <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <a href="#" className="hover:text-primary-600 transition-colors">Integritetspolicy</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Användarvillkor</a>
            </div>

            <div className="flex items-center justify-center gap-1 mt-6 text-[10px] text-slate-300">
                <Cloud size={10} /> {process.env.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL ? 'Enterprise Cloud Connected' : 'Local Mode'}
            </div>
        </div>
      </footer>
    </div>
  );
}
