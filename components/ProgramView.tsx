
import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedProgram, Exercise, WeeklyAnalysis, Milestone } from '../types';
import ExerciseCard from './ExerciseCard';
import PatientEducationModule from './PatientEducationModule';
import DailyCheckIn from './DailyCheckIn';
import { storageService } from '../services/storageService';
import { generateWeeklyAnalysis } from '../services/geminiService';
import { supabase, getUserId } from '../services/supabaseClient';
import { exportProgramToPDF } from '../services/pdfExport';
import { Calendar, ChevronRight, Activity, Info, BarChart, Printer, Sparkles, ThumbsUp, ShieldAlert, ArrowUpCircle, Zap, BrainCircuit, Star, Target, Crown, ClipboardCheck, X, Flame, TrendingUp, Lock, Unlock, Heart, PartyPopper, Download, Loader2 } from 'lucide-react';
import Spinner from './ui/Spinner';

// Get Stripe Link from Environment Variable or fallback to a placeholder
const STRIPE_CHECKOUT_URL = (import.meta as any).env?.VITE_STRIPE_LINK || "https://stripe.com"; 

interface ProgramViewProps {
  program: GeneratedProgram;
}

const ProgramView: React.FC<ProgramViewProps> = ({ program: initialProgram }) => {
  // Use local state for program to allow modifications (swaps)
  const [program, setProgram] = useState<GeneratedProgram>(initialProgram);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [historyCount, setHistoryCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Premium State Check
  const [isPremium, setIsPremium] = useState(false);

  // Daily Check-In State (Fas 6)
  const [showPreCheckIn, setShowPreCheckIn] = useState(false);
  const [showPostCheckIn, setShowPostCheckIn] = useState(false);
  const [hasCompletedPreCheckIn, setHasCompletedPreCheckIn] = useState(false);
  const [hasCompletedPostCheckIn, setHasCompletedPostCheckIn] = useState(false);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false); 

  const activePhase = program.phases[activePhaseIndex];
  // Calculate total exercises in the representative daily routine for the active phase
  const totalExercises = activePhase.dailyRoutine.flatMap(d => d.exercises).length;

  // Sync prop changes if initialProgram changes from outside (e.g. new generation)
  useEffect(() => {
      setProgram(initialProgram);
  }, [initialProgram]);

  // Load today's progress, history and streak on mount (Async)
  useEffect(() => {
    const fetchHistory = async () => {
        const today = new Date().toISOString().split('T')[0];
        // Fetch history first to ensure we have latest data
        const history = await storageService.getHistory();
        
        // Update today's status
        const todaysProgress = history[today] || {};
        setCompletedExercises(todaysProgress);

        // Calculate history for Coach Level
        const activeDays = Object.values(history).filter(day => Object.values(day).some(v => v)).length;
        setHistoryCount(activeDays);

        // Check Premium Status (Hybrid: Check DB first, fallback to Local)
        let premiumStatus = localStorage.getItem('rehabflow_is_premium') === 'true';
        
        if (supabase) {
             const userId = getUserId();
             const { data } = await supabase.from('users').select('subscription_status').eq('id', userId).single();
             if (data && (data.subscription_status === 'active' || data.subscription_status === 'trial')) {
                 premiumStatus = true;
                 localStorage.setItem('rehabflow_is_premium', 'true');
             }
        }
        
        setIsPremium(premiumStatus);

        // Calculate Streak
        let streak = 0;
        const date = new Date();
        // Check up to 30 days back
        for (let i = 0; i < 30; i++) {
            const dateStr = date.toISOString().split('T')[0];
            const dayData = history[dateStr];
            // Allow today to be empty without breaking streak if checking previous days
            if (i === 0 && (!dayData || !Object.values(dayData).some(v => v))) {
                // If today is empty, we don't count it as streak yet, but we don't break.
            } else if (dayData && Object.values(dayData).some(v => v)) {
                streak++;
            } else if (i > 0) {
                // If we miss a day in the past, streak breaks
                break;
            }
            date.setDate(date.getDate() - 1);
        }
        setCurrentStreak(streak);
        setLoadingHistory(false);

        // Check if pre-workout check-in has been done today (Fas 6)
        const hasPreCheckIn = storageService.hasPreWorkoutCheckIn(today);
        const hasPostCheckIn = storageService.hasPostWorkoutCheckIn(today);
        setHasCompletedPreCheckIn(hasPreCheckIn);
        setHasCompletedPostCheckIn(hasPostCheckIn);

        // Show pre-workout modal if not done yet
        if (!hasPreCheckIn) {
          setTimeout(() => setShowPreCheckIn(true), 500); // Small delay for better UX
        }
    };

    fetchHistory();
  }, []);

  const toggleExercise = async (name: string) => {
    // Optimistic UI update
    const newStatus = !completedExercises[name];
    setCompletedExercises(prev => ({
        ...prev,
        [name]: newStatus
    }));

    // Save to storage (async)
    const today = new Date().toISOString().split('T')[0];
    const newState = { ...completedExercises, [name]: newStatus };
    await storageService.saveDailyProgress(today, newState);
  };

  const handleExerciseSwap = async (dayIndex: number, exerciseIndex: number, newExercise: Exercise) => {
      const updatedProgram = { ...program };
      updatedProgram.phases[activePhaseIndex].dailyRoutine[dayIndex].exercises[exerciseIndex] = newExercise;
      
      setProgram(updatedProgram);
      await storageService.saveProgram(updatedProgram); // Persist change
  };

  const runWeeklyAnalysis = async () => {
    if (!isPremium) {
        setShowPremiumModal(true);
        return;
    }
    setIsAnalyzing(true);
    setShowAnalysisModal(true);
    
    try {
        // Use current progress for demo analysis
        const historyData = [{ total: 5, completed: Math.round(progress/100 * 5) }]; 
        
        const result = await generateWeeklyAnalysis(historyData, activePhase.phaseName);
        setAnalysis(result);
    } catch (e) {
        console.error("Analysis Error", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handlePhaseClick = (idx: number) => {
      if (!isPremium && idx > 0) {
          setShowPremiumModal(true);
      } else {
          setActivePhaseIndex(idx);
      }
  };

  const handleUpgradeClick = () => {
      if (STRIPE_CHECKOUT_URL === "https://stripe.com") {
          alert("Betalningslänk är inte konfigurerad än. Kontakta support.");
          return;
      }
      window.open(STRIPE_CHECKOUT_URL, '_blank');
  };

  // Demo: Allow user to simulate unlocking premium
  const simulateUnlock = () => {
      localStorage.setItem('rehabflow_is_premium', 'true');
      setIsPremium(true);
      setShowPremiumModal(false);
      alert("Pro-läge aktiverat (Demo). I produktion skulle detta ske automatiskt efter betalning.");
  };

  const progress = useMemo(() => {
     if (totalExercises === 0) return 0;
     const completedCount = Object.values(completedExercises).filter(Boolean).length;
     return Math.round((completedCount / totalExercises) * 100);
  }, [completedExercises, totalExercises]);

  // Check for new milestones after exercises are completed (Fas 6)
  useEffect(() => {
    const checkMilestones = async () => {
      const achieved = await storageService.checkAndAwardMilestones();
      if (achieved.length > 0) {
        setNewMilestones(achieved);
        setShowMilestoneModal(true);
      }
    };

    // Only check when progress increases
    if (progress > 0) {
      checkMilestones();
    }
  }, [progress]);

  // --- COACH LEVEL LOGIC (GAMIFICATION) ---
  const coachLevel = useMemo(() => {
      const levels = [
          { threshold: 0, name: "Nykomling", icon: Info, color: "text-slate-500", bg: "bg-slate-100", stars: 1, next: 3 },
          { threshold: 3, name: "Igång", icon: Target, color: "text-green-500", bg: "bg-green-100", stars: 2, next: 7 },
          { threshold: 7, name: "Atlet", icon: Activity, color: "text-blue-500", bg: "bg-blue-100", stars: 3, next: 14 },
          { threshold: 14, name: "Expert", icon: Star, color: "text-purple-500", bg: "bg-purple-100", stars: 4, next: 30 },
          { threshold: 30, name: "Mästare", icon: Crown, color: "text-amber-500", bg: "bg-amber-100", stars: 5, next: 100 }
      ];

      // Find current level
      let current = levels[0];
      for (let i = levels.length - 1; i >= 0; i--) {
          if (historyCount >= levels[i].threshold) {
              current = levels[i];
              break;
          }
      }

      // Calculate progress to next level
      const prevThreshold = current.threshold;
      const nextThreshold = current.next;
      const range = nextThreshold - prevThreshold;
      const currentProgress = historyCount - prevThreshold;
      const percent = Math.min(100, Math.max(0, (currentProgress / range) * 100));

      return { ...current, progressPercent: percent, remaining: nextThreshold - historyCount };
  }, [historyCount]);

  // --- AI COACH LOGIC (ENHANCED FEEDBACK) ---
  const feedback = useMemo(() => {
    const allExercises = activePhase.dailyRoutine.flatMap(d => d.exercises);
    const missedExercises = allExercises.filter(ex => !completedExercises[ex.name]);
    
    // Check specific conditions
    const missedHard = missedExercises.find(ex => ex.difficulty === 'Svår');
    const missedMobility = missedExercises.find(ex => ex.category === 'mobility');
    const missedStrength = missedExercises.find(ex => ex.category === 'strength');
    const missedBalance = missedExercises.find(ex => ex.category === 'balance');
    
    // 1. ELITE PERFORMANCE (100%)
    if (progress === 100) {
      if (currentStreak > 3) {
           return {
            title: `Otroligt! ${currentStreak} dagar i rad! 🔥`,
            msg: "Du bygger momentum som ett proffs. Det är den här typen av dedikation som ger varaktiga resultat. Njut av vilan nu.",
            color: "bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200 text-orange-900",
            icon: Flame,
            iconColor: "text-orange-600",
            badge: "Streak Master"
          };
      }
      return {
        title: "Passet fullbordat!",
        msg: "Perfekt genomfört! Eftersom du klarar hela passet konsekvent: Fokusera nu på den excentriska fasen (hålla emot långsamt i 3 sekunder på vägen tillbaka). Det är där styrkan byggs.",
        color: "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 text-emerald-900",
        icon: Sparkles,
        iconColor: "text-emerald-600",
        badge: "Avancerad Nivå"
      };
    } 
    
    // 2. HIGH PERFORMANCE (>75%)
    else if (progress >= 75) {
        if (missedHard) {
            return {
                title: `Våga utmana med "${missedHard.name}"`,
                msg: `Du är grym som gjort nästan allt! Jag ser dock att du hoppade över "${missedHard.name}". Den är tuff av en anledning. Testa att göra bara ett set eller färre reps, men försök få in den för max effekt!`,
                color: "bg-orange-50 border-orange-200 text-orange-900",
                icon: Target,
                iconColor: "text-orange-600",
                badge: "Utmaning"
            };
        }
        return {
            title: "Starkt slutspurt!",
            msg: "Du har nästan klarat hela passet. Det är nu tröttheten kommer, så var extra noga med tekniken i de sista repetitionerna. Kvalitet före kvantitet.",
            color: "bg-indigo-50 border-indigo-200 text-indigo-900",
            icon: Zap,
            iconColor: "text-indigo-600",
            badge: "Hög Prestation"
        };
    } 
    
    // 3. MID PERFORMANCE (>40%)
    else if (progress >= 40) {
        if (missedStrength && !missedMobility) {
             return {
                title: "Glöm inte styrkan",
                msg: "Bra jobbat med rörligheten! Men för långsiktig läkning måste vi bygga tolerans i vävnaden. Försök att lägga till åtminstone en styrkeövning nu innan du slutar.",
                color: "bg-blue-50 border-blue-200 text-blue-900",
                icon: Activity,
                iconColor: "text-blue-600",
                badge: "Fokus: Styrka"
            };
        }
        if (missedBalance) {
             return {
                title: "Stabilitet är nyckeln",
                msg: "Du jobbar på bra! Men balansövningar är ofta de vi 'glömmer' fast de skyddar bäst mot återfall. Ge balansövningen en chans, även om du bara gör 30 sekunder.",
                color: "bg-violet-50 border-violet-200 text-violet-900",
                icon: TrendingUp,
                iconColor: "text-violet-600",
                badge: "Fokus: Balans"
            };
        }
      return {
        title: "Bra flyt idag",
        msg: "Du är igång och gör jobbet. Kom ihåg att rehabilitering handlar om kontinuitet. Om något gör ont (mer än 3/10), minska rörelseomfånget men fortsätt röra dig.",
        color: "bg-blue-50 border-blue-200 text-blue-900",
        icon: ThumbsUp,
        iconColor: "text-blue-600",
        badge: "Bra jobbat"
      };
    } 
    
    // 4. LOW/START PERFORMANCE
    else if (progress > 0) {
       if (historyCount < 3) {
           return {
                title: "Välkommen igång!",
                msg: "I början handlar allt om att etablera vanan. Känn ingen press att göra allt perfekt. Att du har öppnat appen och gjort en övning är en seger.",
                color: "bg-emerald-50 border-emerald-200 text-emerald-900",
                icon: Sparkles,
                iconColor: "text-emerald-600",
                badge: "Välkommen"
           };
       }
       return {
        title: "En bra start",
        msg: "Det viktigaste är att du har börjat. Känns det tungt idag? Fokusera på rörlighetsövningarna först. Det är bättre att göra lite än ingenting alls.",
        color: "bg-amber-50 border-amber-200 text-amber-900",
        icon: ArrowUpCircle,
        iconColor: "text-amber-600",
        badge: "Kom igång"
      };
    } 
    
    // 5. NO PROGRESS YET
    else {
      return {
        title: "Dags för dagens insats",
        msg: "Din kropp läker bäst med lagom belastning. Har du ont om tid? Välj ut de två övningar som känns viktigast för dig just nu.",
        color: "bg-slate-50 border-slate-200 text-slate-700",
        icon: ShieldAlert,
        iconColor: "text-slate-500",
        badge: "Redo?"
      };
    }
  }, [progress, completedExercises, activePhase, currentStreak, historyCount]);

  const handlePrint = () => {
    window.print();
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const assessment = storageService.getAssessmentDraft();
      await exportProgramToPDF(program, assessment);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 pb-24 print:p-0 print:max-w-none overflow-hidden relative">
      
      {/* PRE-WORKOUT CHECK-IN MODAL (Fas 6) */}
      {showPreCheckIn && (
        <DailyCheckIn
          type="pre"
          onComplete={() => {
            setShowPreCheckIn(false);
            setHasCompletedPreCheckIn(true);
          }}
          onSkip={() => setShowPreCheckIn(false)}
        />
      )}

      {/* POST-WORKOUT CHECK-IN MODAL (Fas 6) */}
      {showPostCheckIn && (
        <DailyCheckIn
          type="post"
          onComplete={() => {
            setShowPostCheckIn(false);
            setHasCompletedPostCheckIn(true);
          }}
          onSkip={() => setShowPostCheckIn(false)}
        />
      )}

      {/* MILESTONE CELEBRATION MODAL (Fas 6) */}
      {showMilestoneModal && newMilestones.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-10 left-10 text-4xl animate-bounce delay-100">🎉</div>
              <div className="absolute top-20 right-10 text-3xl animate-bounce delay-200">⭐</div>
              <div className="absolute top-5 right-20 text-2xl animate-bounce delay-300">🎊</div>
            </div>

            <div className="p-8 text-center relative">
              <div className="text-6xl mb-4 animate-bounce">
                {newMilestones[0].icon}
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2">
                {newMilestones[0].title}
              </h3>
              <p className="text-slate-400 mb-6">
                {newMilestones[0].description}
              </p>

              <button
                onClick={() => {
                  // Mark as celebrated
                  newMilestones.forEach(m => storageService.markMilestoneCelebrated(m.id));
                  setShowMilestoneModal(false);
                  setNewMilestones([]);
                }}
                className="w-full py-4 bg-cyan-500 text-slate-900 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition-all"
              >
                Tack! 🙌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM UPSELL MODAL */}
      {showPremiumModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center animate-in zoom-in-95 duration-300">
                  <div className="h-32 bg-gradient-to-br from-slate-900 to-indigo-900 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                      <Crown size={64} className="text-yellow-400 drop-shadow-lg relative z-10" />
                  </div>
                  <div className="p-8">
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Lås upp RehabFlow Pro</h3>
                      <p className="text-slate-500 mb-6">Få tillgång till din fullständiga långsiktiga plan och avancerad AI-analys.</p>
                      
                      <div className="space-y-3 mb-8 text-left">
                          {[
                              "Veckovis AI-Coach analys",
                              "Tillgång till Fas 2 & 3 (Styrka & Återgång)",
                              "Obegränsad chatt med AI-Fysion",
                              "Djupgående statistik"
                          ].map((feat, i) => (
                              <div key={i} className="flex items-center gap-3">
                                  <div className="p-1 bg-green-100 text-green-600 rounded-full"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div>
                                  <span className="text-sm font-bold text-slate-700">{feat}</span>
                              </div>
                          ))}
                      </div>

                      <button onClick={handleUpgradeClick} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                          <Crown size={20} className="text-yellow-400" /> Skaffa Premium
                      </button>
                      
                      <button onClick={simulateUnlock} className="mt-4 text-xs font-bold text-slate-300 hover:text-primary-600 uppercase tracking-widest border-b border-transparent hover:border-primary-200">
                          (Simulera köp - Demo)
                      </button>

                      <button onClick={() => setShowPremiumModal(false)} className="mt-4 w-full text-xs font-bold text-slate-400 hover:text-slate-600">
                          Nej tack, jag fortsätter med basversionen
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* ANALYSIS MODAL */}
      {showAnalysisModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center gap-2 text-primary-700 font-bold text-lg">
                          <ClipboardCheck size={24} />
                          <h3>AI Veckoanalys</h3>
                      </div>
                      <button onClick={() => setShowAnalysisModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto">
                      {isAnalyzing ? (
                          <div className="flex flex-col items-center justify-center py-10">
                              <Spinner size="xl" text="Analyserar träningsdata..." centered />
                          </div>
                      ) : analysis ? (
                          <div className="space-y-8 animate-in slide-in-from-bottom-4">
                              <div className="text-center">
                                  <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 shadow-sm border ${
                                      analysis.decision === 'progress' ? 'bg-green-100 text-green-700 border-green-200' :
                                      analysis.decision === 'maintain' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                      'bg-amber-100 text-amber-700 border-amber-200'
                                  }`}>
                                      Rekommendation: {analysis.decision === 'progress' ? 'Gå vidare' : analysis.decision === 'maintain' ? 'Stanna kvar' : 'Backa bandet'}
                                  </div>
                                  
                                  <div className="w-28 h-28 mx-auto rounded-full border-8 border-slate-50 bg-white shadow-xl flex items-center justify-center relative mb-4">
                                      <span className="text-4xl font-extrabold text-slate-800">{analysis.score}</span>
                                      <span className="text-[10px] font-bold uppercase absolute bottom-5 text-slate-400">Score</span>
                                  </div>
                              </div>

                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                  <h4 className="font-bold text-slate-800 mb-2">Coach-utlåtande</h4>
                                  <p className="text-slate-600 text-base leading-relaxed">{analysis.reasoning}</p>
                              </div>

                              <div>
                                  <h4 className="font-bold text-slate-800 mb-3 ml-1">Fokus nästa vecka</h4>
                                  <ul className="space-y-3">
                                      {analysis.tips.map((tip, idx) => (
                                          <li key={idx} className="flex gap-3 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                              <div className="min-w-[6px] h-[6px] bg-primary-500 rounded-full mt-2.5"></div>
                                              <span className="text-sm font-medium">{tip}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      ) : null}
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg shadow-slate-200/50 border border-white mb-6 md:mb-8 lg:mb-10 print:border-none print:shadow-none print:p-0 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="max-w-full">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight break-words">{program.title}</h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed break-words">{program.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 print:hidden shrink-0">
                <button 
                    onClick={runWeeklyAnalysis}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all font-bold border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group/btn"
                >
                    {!isPremium && <div className="absolute inset-0 bg-slate-100/10 backdrop-blur-[1px] flex items-center justify-center z-20 transition-opacity opacity-0 group-hover/btn:opacity-100"><Lock size={16} className="text-slate-800" /></div>}
                    <ClipboardCheck size={20} className="text-primary-600" /> AI-Analys
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all font-bold border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Exportera program som PDF"
                >
                    {isExporting ? (
                      <Loader2 size={20} className="text-primary-500 animate-spin" />
                    ) : (
                      <Download size={20} className="text-primary-500" />
                    )}
                    <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all font-bold border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    aria-label="Skriv ut program"
                >
                    <Printer size={20} className="text-slate-400" />
                </button>
            </div>
        </div>
        
        {/* PATIENT EDUCATION MODULE */}
        {program.patientEducation && (
            <div className="mt-8 max-w-full">
                <PatientEducationModule education={program.patientEducation} />
            </div>
        )}
        
        {/* Basic Condition Analysis Fallback (if simplified view preferred) */}
        {!program.patientEducation && (
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mt-6 print:border-slate-200 print:bg-white max-w-full">
                <h3 className="flex items-center gap-2 text-blue-800 font-bold text-lg mb-2 print:text-slate-800">
                    <Activity size={24} /> Klinisk Analys
                </h3>
                <p className="text-blue-900/80 leading-relaxed text-base print:text-slate-700 break-words">
                    {program.conditionAnalysis}
                </p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 lg:gap-8 print:block">
        {/* Left: Phase Navigation & Status */}
        <div className="md:col-span-1 lg:col-span-3 space-y-4 lg:space-y-6 no-print min-w-0">
            <div className="bg-white/90 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 lg:mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Faser
                </h3>
                <div className="space-y-2">
                    {program.phases.map((phase, idx) => {
                        const isLocked = !isPremium && idx > 0;
                        return (
                        <button
                            key={idx}
                            onClick={() => handlePhaseClick(idx)}
                            className={`w-full text-left p-2 md:p-3 lg:p-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 relative overflow-hidden group min-w-0 ${
                                idx === activePhaseIndex
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1 relative z-10">
                                <span className="truncate flex items-center gap-2">
                                    Fas {idx + 1}
                                    {isLocked && <Lock size={12} className="text-slate-400" />}
                                </span>
                                {idx === activePhaseIndex && <ChevronRight size={16} className="shrink-0" />}
                            </div>
                            <div className={`text-[10px] lg:text-xs ${idx === activePhaseIndex ? 'text-slate-300' : 'text-slate-400'} relative z-10 truncate hidden md:block`}>
                                {isLocked ? 'Pro' : phase.durationWeeks}
                            </div>
                            {isLocked && (
                                <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Lock size={16} className="text-slate-800" />
                                </div>
                            )}
                        </button>
                    )})}
                </div>
            </div>

            <div className={`p-4 lg:p-8 rounded-2xl text-white shadow-xl shadow-primary-500/20 transition-all duration-700 relative overflow-hidden ${
                progress === 100 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-primary-500 to-indigo-600'
            }`}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                
                <h3 className="font-bold mb-3 flex items-center gap-2 text-white/90 relative z-10">
                    <BarChart size={20} /> Daglig Status
                </h3>
                <div className="flex items-baseline gap-1 relative z-10">
                    <span className="text-5xl font-extrabold">{progress}</span>
                    <span className="text-xl opacity-80">%</span>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full mt-6 overflow-hidden relative z-10">
                    <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Post-workout check-in button (Fas 6) */}
                {progress >= 50 && !hasCompletedPostCheckIn && hasCompletedPreCheckIn && (
                  <button
                    onClick={() => setShowPostCheckIn(true)}
                    className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative z-10"
                  >
                    <Heart size={18} />
                    Avsluta pass & logga smärta
                  </button>
                )}

                {hasCompletedPostCheckIn && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-white/80 text-sm relative z-10">
                    <PartyPopper size={16} />
                    <span>Passet loggat!</span>
                  </div>
                )}
            </div>

            {/* Coach Level Badge with Progress Bar */}
            <div className="bg-white/90 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${coachLevel.bg} ${coachLevel.color}`}>
                        {React.createElement(coachLevel.icon, { size: 24 })}
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coach Level</div>
                        <div className="font-bold text-slate-900 text-lg">{coachLevel.name}</div>
                    </div>
                </div>
                
                {/* Level Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>XP</span>
                        <span>{historyCount} / {coachLevel.next}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${coachLevel.color.replace('text-', 'bg-')}`} 
                            style={{ width: `${coachLevel.progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium text-center mt-2">
                        {coachLevel.remaining} pass till nästa nivå
                    </p>
                </div>

                <div className="flex gap-1 mt-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i} 
                            size={12} 
                            className={i < coachLevel.stars ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-slate-200"} 
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Active Phase Content */}
        <div className="md:col-span-3 lg:col-span-9 space-y-8 lg:space-y-10 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 print:block print:pb-2">
                <div className="max-w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight break-words">
                            {activePhase.phaseName} 
                        </h2>
                        {!isPremium && activePhaseIndex > 0 && <Lock className="text-slate-400" />}
                    </div>
                    <p className="text-slate-500 mt-2 text-lg break-words">{activePhase.description}</p>
                </div>
                <div className="flex gap-2 print:hidden shrink-0">
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100 shadow-sm max-w-[200px] truncate">
                        Mål: {activePhase.goals[0]}
                    </div>
                </div>
            </div>

            {/* Locked Content Overlay for Phases > 0 if not Premium */}
            {(!isPremium && activePhaseIndex > 0) ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Lock size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Denna fas är låst</h3>
                    <p className="text-slate-500 max-w-md mb-8">Uppgradera till RehabFlow Pro för att se hela rehabiliteringsplanen och få tillgång till nästa steg.</p>
                    <button onClick={() => setShowPremiumModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">
                        Lås upp Premium
                    </button>
                </div>
            ) : (
                <>
                {/* Dynamic AI Coach Feedback - ONLY visible on screen */}
                {loadingHistory ? (
                    <div className="p-6 rounded-2xl border border-slate-100 bg-white/50 animate-pulse flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                ) : (
                <div className={`p-6 rounded-2xl border flex gap-5 items-start transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${feedback.color} print:hidden shadow-sm hover:shadow-md relative overflow-hidden group`}>
                    <div className={`p-3 bg-white/60 rounded-xl ${feedback.iconColor} z-10 shadow-sm shrink-0`}>
                        {React.createElement(feedback.icon, { size: 28 })}
                    </div>
                    <div className="z-10 relative flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-xs uppercase tracking-widest opacity-80 flex items-center gap-2 truncate">
                                RehabFlow AI Coach
                            </h4>
                            <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm shrink-0">{feedback.badge}</span>
                        </div>
                        <p className="text-lg font-bold mb-1 tracking-tight break-words">{feedback.title}</p>
                        <p className="text-base leading-relaxed opacity-90 font-medium break-words">{feedback.msg}</p>
                    </div>
                    {/* Decorative background icon */}
                    <BrainCircuit className="absolute -right-6 -bottom-6 text-current opacity-[0.07] w-40 h-40 rotate-12 transition-transform duration-700 group-hover:rotate-45" />
                </div>
                )}

                {/* Precautions */}
                <div className="bg-amber-50/80 border border-amber-100 p-6 rounded-2xl print:bg-white print:border-slate-200">
                    <h4 className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3 uppercase tracking-wider print:text-slate-800">
                        <Info size={18} /> Försiktighetsåtgärder
                    </h4>
                    <ul className="space-y-2">
                        {activePhase.precautions.map((p, i) => (
                            <li key={i} className="flex gap-3 text-sm text-amber-900/80 print:text-slate-700 font-medium break-words">
                                <span className="min-w-[6px] h-[6px] rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Daily Routine */}
                {activePhase.dailyRoutine.map((dayPlan, dayIdx) => (
                    <div key={dayIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 page-break">
                        <div className="flex items-center gap-4 mb-6 mt-8">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-primary-600 font-bold print:border print:border-slate-300 transform -rotate-3 shrink-0">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Daglig Rutin</h3>
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                    <Target size={14} className="text-primary-500" /> Fokus: {dayPlan.focus}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-6">
                            {dayPlan.exercises.map((ex, exIdx) => (
                                <ExerciseCard 
                                    key={exIdx} 
                                    exercise={ex} 
                                    completed={!!completedExercises[ex.name]}
                                    onComplete={() => toggleExercise(ex.name)}
                                    onSwap={(newEx) => handleExerciseSwap(dayIdx, exIdx, newEx)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProgramView;
