
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GeneratedProgram, Exercise, WeeklyAnalysis, Milestone, BaselineROM, UserAssessment } from '../types';
import ExerciseCard from './ExerciseCard';
import PatientEducationModule from './PatientEducationModule';
import DailyCheckIn from './DailyCheckIn';
import ROMSuggestionBanner, { useROMSuggestion } from './ROMSuggestionBanner';
import ROMProgressCard from './ROMProgressCard';
import ROMTrendChart from './ROMTrendChart';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import { storageService } from '../services/storageService';
import { generateWeeklyAnalysis } from '../services/geminiService';
import { supabase, getUserId } from '../services/supabaseClient';
import { exportProgramToPDF } from '../services/pdfExport';
import { useNotifications } from '../services/notificationService';
import { Calendar, ChevronRight, Activity, Info, BarChart, Printer, Sparkles, ThumbsUp, ShieldAlert, ArrowUpCircle, Zap, BrainCircuit, Star, Target, Crown, ClipboardCheck, X, Flame, TrendingUp, Lock, Unlock, Heart, PartyPopper, Download, Loader2, Bell, BellOff, Clock, Award } from 'lucide-react';
import { logger } from '../utils/logger';
import { GlassCard, Button, Badge, tokens, transitions } from './ui';

// Lazy load ROM Assessment
const ROMAssessment = lazy(() => import('./ROMAssessment'));

// Get Stripe Link from Environment Variable (null if not configured)
const STRIPE_CHECKOUT_URL = (import.meta as any).env?.VITE_STRIPE_LINK || null;

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

const slideVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
}; 

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

  // ROM Assessment State (AI-triggered suggestions)
  const [showROMAssessment, setShowROMAssessment] = useState(false);
  const [romDismissed, setRomDismissed] = useState(false);
  const [userAssessment, setUserAssessment] = useState<UserAssessment | null>(null);

  // Toast notifications
  const { toasts, removeToast, warning } = useToast();

  // Notification service for exercise reminders
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    preferences: notificationPreferences,
    requestPermission: requestNotificationPermission,
    scheduleExerciseReminder,
    getScheduled,
    cancelAll: cancelAllNotifications,
  } = useNotifications();
  const [showNotificationSetup, setShowNotificationSetup] = useState(false);
  const [reminderTime, setReminderTime] = useState<{ hour: number; minute: number }>({ hour: 9, minute: 0 });
  const [hasScheduledReminder, setHasScheduledReminder] = useState(false);

  // Check if reminder is already scheduled
  useEffect(() => {
    const scheduled = getScheduled();
    const hasExerciseReminder = scheduled.some(n => n.type === 'exercise_reminder');
    setHasScheduledReminder(hasExerciseReminder);
  }, [getScheduled]);

  // Load user assessment for ROM tracking
  useEffect(() => {
    const assessment = storageService.getAssessmentDraft();
    if (assessment) {
      setUserAssessment(assessment);
    }
  }, []);

  // Check if ROM suggestion should be shown
  const romSuggestion = useROMSuggestion(
    userAssessment?.baselineROM || null,
    false // recentProgressChange - could be derived from check-in data
  ); 

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
             const { data, error } = await supabase.from('users').select('subscription_status').eq('id', userId).single();
             if (!error && data && (data.subscription_status === 'active' || data.subscription_status === 'trial')) {
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
        logger.error("Analysis Error", e);
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
      if (!STRIPE_CHECKOUT_URL) {
          warning("Ej tillgängligt", "Betalningslänk är inte konfigurerad än. Kontakta support.");
          return;
      }
      window.open(STRIPE_CHECKOUT_URL, '_blank');
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
      logger.error('PDF export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto py-8 pb-24 print:p-0 print:max-w-none overflow-hidden relative"
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-20 -left-64 w-[500px] h-[500px] bg-gradient-to-br from-primary-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-64 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

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

      {/* ROM ASSESSMENT MODAL */}
      {showROMAssessment && (
        <Suspense fallback={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900/98 to-primary-900/20 z-50 flex items-center justify-center backdrop-blur-xl"
          >
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-primary-500/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border-4 border-transparent border-t-primary-500 rounded-full"
                />
                <Activity className="absolute inset-0 m-auto text-primary-400" size={24} />
              </div>
              <p className="text-white/80 font-medium">Laddar rörlighetsmätning...</p>
            </div>
          </motion.div>
        }>
          <ROMAssessment
            patientAge={userAssessment?.age}
            injuryLocation={userAssessment?.injuryLocation}
            onComplete={(baseline) => {
              // Save ROM baseline to assessment
              if (userAssessment) {
                const updated = { ...userAssessment, baselineROM: baseline };
                storageService.saveAssessmentDraft(updated);
                setUserAssessment(updated);
              }
              setShowROMAssessment(false);
            }}
            onSkip={() => {
              setShowROMAssessment(false);
              setRomDismissed(true);
            }}
          />
        </Suspense>
      )}

      {/* MILESTONE CELEBRATION MODAL (Fas 6) */}
      <AnimatePresence>
        {showMilestoneModal && newMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={transitions.spring}
              className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-cyan-500/20 opacity-60" />

              {/* Animated Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 100, x: Math.random() * 100 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-20, -150],
                      x: [null, Math.random() * 200 - 100]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeOut'
                    }}
                    className="absolute bottom-0 left-1/2 text-3xl"
                  >
                    {['🎉', '⭐', '🎊', '✨', '🏆', '💎'][i]}
                  </motion.div>
                ))}
              </div>

              <div className="p-8 text-center relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
                >
                  <span className="text-5xl">{newMilestones[0].icon}</span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-extrabold text-white mb-2"
                >
                  {newMilestones[0].title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400 mb-8"
                >
                  {newMilestones[0].description}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    newMilestones.forEach(m => storageService.markMilestoneCelebrated(m.id));
                    setShowMilestoneModal(false);
                    setNewMilestones([]);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-primary-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                >
                  Fantastiskt!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM UPSELL MODAL */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={transitions.spring}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center relative"
            >
              {/* Premium Header with Animated Crown */}
              <div className="h-36 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative z-10"
                >
                  <div className="absolute inset-0 blur-2xl bg-yellow-400/30 rounded-full scale-150" />
                  <Crown size={72} className="text-yellow-400 drop-shadow-lg relative" />
                </motion.div>
              </div>

              <div className="p-8">
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-extrabold text-slate-900 mb-2"
                >
                  Lås upp RehabFlow Pro
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-slate-500 mb-6"
                >
                  Få tillgång till din fullständiga rehabiliteringsplan
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 mb-8 text-left"
                >
                  {[
                    { text: "Veckovis AI-Coach analys", icon: BrainCircuit },
                    { text: "Tillgång till alla faser", icon: Unlock },
                    { text: "Obegränsad AI-Fysio chatt", icon: Sparkles },
                    { text: "Djupgående statistik", icon: TrendingUp }
                  ].map((feat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.08 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-xl"
                    >
                      <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <feat.icon size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feat.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgradeClick}
                  className="w-full py-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/30 hover:shadow-slate-900/40 transition-shadow flex items-center justify-center gap-2"
                >
                  <Crown size={20} className="text-yellow-400" /> Skaffa Premium
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowPremiumModal(false)}
                  className="mt-4 w-full text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  Fortsätt med gratisversionen
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION SETUP MODAL */}
      <AnimatePresence>
        {showNotificationSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={transitions.spring}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="h-28 bg-gradient-to-br from-primary-500 via-primary-600 to-cyan-600 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <Bell size={52} className="text-white drop-shadow-lg relative z-10" />
                </motion.div>
              </div>
              <div className="p-8">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-extrabold text-slate-900 mb-2"
                >
                  Träningspåminnelser
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-slate-500 mb-6"
                >
                  Få dagliga påminnelser så du aldrig missar ett pass
                </motion.p>

                {notificationPermission === 'denied' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <p className="text-red-700 text-sm font-medium">
                      Notifikationer är blockerade. Aktivera dem i webbläsarens inställningar.
                    </p>
                  </motion.div>
                ) : notificationPermission !== 'granted' ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      const result = await requestNotificationPermission();
                      if (result === 'granted') {
                        logger.info('[ProgramView] Notification permission granted');
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow mb-6 flex items-center justify-center gap-2"
                  >
                    <Bell size={20} />
                    Aktivera notifikationer
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 mb-6"
                  >
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Notifikationer aktiverade</span>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-xl p-4 border border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-primary-500" />
                        Välj tid för daglig påminnelse
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={reminderTime.hour}
                          onChange={(e) => setReminderTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          {[...Array(24)].map((_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, '0')}:00
                            </option>
                          ))}
                        </select>
                        <select
                          value={reminderTime.minute}
                          onChange={(e) => setReminderTime(prev => ({ ...prev, minute: parseInt(e.target.value) }))}
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          <option value={0}>:00</option>
                          <option value={15}>:15</option>
                          <option value={30}>:30</option>
                          <option value={45}>:45</option>
                        </select>
                      </div>
                    </div>

                    {hasScheduledReminder ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          cancelAllNotifications();
                          setHasScheduledReminder(false);
                        }}
                        className="w-full py-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <BellOff size={20} />
                        Ta bort påminnelse
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          scheduleExerciseReminder(reminderTime.hour, reminderTime.minute);
                          setHasScheduledReminder(true);
                          setShowNotificationSetup(false);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow flex items-center justify-center gap-2"
                      >
                        <Bell size={20} />
                        Schemalägg påminnelse
                      </motion.button>
                    )}
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setShowNotificationSetup(false)}
                  className="w-full text-sm font-medium text-slate-400 hover:text-slate-600 py-2 transition-colors"
                >
                  Stäng
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYSIS MODAL */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={transitions.spring}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-primary-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <BrainCircuit size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">AI Veckoanalys</h3>
                    <p className="text-xs text-slate-500">Personlig coaching baserad på din data</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="p-8 overflow-y-auto">
                {isAnalyzing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="relative w-20 h-20 mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-4 border-primary-200 rounded-full"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 border-4 border-transparent border-t-primary-500 rounded-full"
                      />
                      <BrainCircuit className="absolute inset-0 m-auto text-primary-500" size={28} />
                    </div>
                    <p className="text-slate-600 font-medium">Analyserar träningsdata...</p>
                    <p className="text-slate-400 text-sm mt-1">Detta tar några sekunder</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`inline-flex px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm border ${
                          analysis.decision === 'progress' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' :
                          analysis.decision === 'maintain' ? 'bg-gradient-to-r from-blue-100 to-primary-100 text-primary-700 border-primary-200' :
                          'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {analysis.decision === 'progress' ? 'Gå vidare' : analysis.decision === 'maintain' ? 'Stanna kvar' : 'Backa bandet'}
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-32 h-32 mx-auto mt-6 rounded-full bg-gradient-to-br from-slate-100 to-primary-50 shadow-xl flex items-center justify-center relative"
                      >
                        <div className="absolute inset-2 rounded-full bg-white shadow-inner flex items-center justify-center flex-col">
                          <span className="text-5xl font-extrabold bg-gradient-to-br from-slate-800 to-primary-700 bg-clip-text text-transparent">
                            {analysis.score}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-400 mt-1">Poäng</span>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-slate-50 to-primary-50/30 p-6 rounded-2xl border border-slate-200"
                    >
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Award size={18} className="text-primary-500" />
                        Coach-utlåtande
                      </h4>
                      <p className="text-slate-600 text-base leading-relaxed">{analysis.reasoning}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Target size={18} className="text-primary-500" />
                        Fokus nästa vecka
                      </h4>
                      <ul className="space-y-3">
                        {analysis.tips.map((tip, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + idx * 0.08 }}
                            className="flex gap-3 text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="min-w-[8px] h-[8px] bg-gradient-to-br from-primary-400 to-cyan-400 rounded-full mt-2" />
                            <span className="text-sm font-medium">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl shadow-slate-200/40 border border-white/80 mb-6 md:mb-8 lg:mb-10 print:border-none print:shadow-none print:p-0 overflow-hidden group"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-cyan-50/30 opacity-60" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-full"
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
                className="p-2 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl shadow-lg shadow-primary-500/25"
              >
                <Activity size={24} className="text-white" />
              </motion.div>
              <Badge variant="primary" size="sm">Ditt program</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight break-words">
              {program.title}
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed break-words">
              {program.summary}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 md:gap-3 print:hidden shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={runWeeklyAnalysis}
              className="flex items-center gap-2 px-5 py-3 bg-white/80 hover:bg-white text-slate-700 rounded-xl transition-all font-bold border border-slate-200/80 shadow-sm hover:shadow-lg relative overflow-hidden group/btn backdrop-blur-sm"
            >
              {!isPremium && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-slate-200/50 backdrop-blur-[1px] flex items-center justify-center z-20 transition-opacity opacity-0 group-hover/btn:opacity-100">
                  <Lock size={16} className="text-slate-600" />
                </div>
              )}
              <BrainCircuit size={20} className="text-primary-600" />
              <span className="hidden sm:inline">AI-Analys</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-3 bg-white/80 hover:bg-white text-slate-700 rounded-xl transition-all font-bold border border-slate-200/80 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              aria-label="Exportera program som PDF"
            >
              {isExporting ? (
                <Loader2 size={20} className="text-primary-500 animate-spin" />
              ) : (
                <Download size={20} className="text-primary-500" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </motion.button>

            {notificationsSupported && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationSetup(true)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all font-bold border shadow-sm hover:shadow-lg backdrop-blur-sm ${
                  hasScheduledReminder
                    ? 'bg-primary-50/80 hover:bg-primary-100 text-primary-700 border-primary-200'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200/80'
                }`}
                aria-label="Hantera påminnelser"
              >
                {hasScheduledReminder ? (
                  <Bell size={20} className="text-primary-500" />
                ) : (
                  <BellOff size={20} className="text-slate-400" />
                )}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="flex items-center gap-2 p-3 bg-white/80 hover:bg-white text-slate-700 rounded-xl transition-all font-bold border border-slate-200/80 shadow-sm hover:shadow-lg backdrop-blur-sm"
              aria-label="Skriv ut program"
            >
              <Printer size={20} className="text-slate-400" />
            </motion.button>
          </motion.div>
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

        {/* SAFETY ADJUSTMENTS BANNER - Shows when exercises were filtered for safety */}
        {(program as any).safetyAdjustments?.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 print:hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <ShieldAlert size={20} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-800 mb-1">
                  Programmet har justerats för din säkerhet
                </h3>
                <p className="text-amber-700 text-sm mb-3">
                  Baserat på ditt postoperativa protokoll har följande övningar tagits bort för att skydda din läkning:
                </p>
                <ul className="space-y-1">
                  {(program as any).safetyAdjustments.slice(0, 5).map((adj: { original: string; reason: string }, idx: number) => (
                    <li key={idx} className="text-sm text-amber-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                      <span className="font-medium">{adj.original}</span>
                      <span className="text-amber-500">- {adj.reason}</span>
                    </li>
                  ))}
                  {(program as any).safetyAdjustments.length > 5 && (
                    <li className="text-sm text-amber-500 italic">
                      ...och {(program as any).safetyAdjustments.length - 5} till
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 lg:gap-8 print:block"
      >
        {/* Left: Phase Navigation & Status */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-1 lg:col-span-3 space-y-4 lg:space-y-6 no-print min-w-0"
        >
          {/* Phase Navigation Card */}
          <GlassCard className="p-4 lg:p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 lg:mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary-500" /> Faser
            </h3>
            <div className="space-y-2">
              {program.phases.map((phase, idx) => {
                const isLocked = !isPremium && idx > 0;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhaseClick(idx)}
                    className={`w-full text-left p-3 lg:p-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 relative overflow-hidden group min-w-0 ${
                      idx === activePhaseIndex
                        ? 'bg-gradient-to-r from-slate-900 to-primary-900 text-white shadow-lg shadow-slate-900/30'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 relative z-10">
                      <span className="truncate flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          idx === activePhaseIndex
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="hidden lg:inline">{phase.phaseName.split(' ').slice(0, 2).join(' ')}</span>
                        {isLocked && <Lock size={12} className="text-slate-400" />}
                      </span>
                      {idx === activePhaseIndex && (
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                        >
                          <ChevronRight size={16} className="shrink-0" />
                        </motion.div>
                      )}
                    </div>
                    <div className={`text-[10px] lg:text-xs ${idx === activePhaseIndex ? 'text-white/70' : 'text-slate-400'} relative z-10 truncate hidden md:block ml-8`}>
                      {isLocked ? 'Premium' : phase.durationWeeks}
                    </div>
                    {isLocked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100/60 to-slate-200/60 backdrop-blur-[2px] z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock size={16} className="text-slate-600" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>

          {/* Daily Status Progress Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-5 lg:p-8 rounded-2xl text-white shadow-xl transition-all duration-500 relative overflow-hidden ${
              progress === 100
                ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 shadow-emerald-500/30'
                : 'bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 shadow-primary-500/30'
            }`}
          >
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            </div>

            <h3 className="font-bold mb-4 flex items-center gap-2 text-white/90 relative z-10">
              <BarChart size={20} /> Daglig Status
            </h3>

            <div className="flex items-baseline gap-1 relative z-10">
              <motion.span
                key={progress}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl lg:text-6xl font-extrabold"
              >
                {progress}
              </motion.span>
              <span className="text-xl opacity-80">%</span>
            </div>

            <div className="w-full bg-black/20 h-3 rounded-full mt-6 overflow-hidden relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>

            {/* Post-workout check-in button (Fas 6) */}
            {progress >= 50 && !hasCompletedPostCheckIn && hasCompletedPreCheckIn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPostCheckIn(true)}
                className="mt-5 w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative z-10 border border-white/20"
              >
                <Heart size={18} />
                Avsluta pass & logga
              </motion.button>
            )}

            {hasCompletedPostCheckIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-2 text-white/90 text-sm relative z-10 bg-white/10 rounded-xl py-2"
              >
                <PartyPopper size={16} />
                <span>Passet loggat!</span>
              </motion.div>
            )}
          </motion.div>

          {/* Coach Level Badge with Progress Bar */}
          <GlassCard className="p-4 lg:p-6">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className={`p-3 rounded-2xl shadow-lg ${coachLevel.bg} ${coachLevel.color}`}
              >
                {React.createElement(coachLevel.icon, { size: 24 })}
              </motion.div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coach Level</div>
                <div className="font-bold text-slate-900 text-lg">{coachLevel.name}</div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>XP</span>
                <span>{historyCount} / {coachLevel.next}</span>
              </div>
              <div className="w-full h-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${coachLevel.progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-all ${coachLevel.color.replace('text-', 'bg-')} shadow-sm`}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium text-center mt-2">
                {coachLevel.remaining} pass till nästa nivå
              </p>
            </div>

            <div className="flex gap-1 mt-4 justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Star
                    size={14}
                    className={i < coachLevel.stars
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                      : 'text-slate-200'
                    }
                  />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

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

                {/* ROM Progress & Trend Cards - Show existing measurements */}
                {userAssessment?.baselineROM && userAssessment.age && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ROMProgressCard
                      baseline={userAssessment.baselineROM}
                      patientAge={userAssessment.age}
                      showDetails={true}
                    />
                    <ROMTrendChart
                      patientAge={userAssessment.age}
                      showDetailedView={true}
                    />
                  </div>
                )}

                {/* ROM Suggestion Banner - AI-triggered */}
                {romSuggestion.shouldShow && !romDismissed && !showROMAssessment && (
                  <ROMSuggestionBanner
                    onAccept={() => setShowROMAssessment(true)}
                    onDecline={() => setRomDismissed(true)}
                    reason={romSuggestion.reason}
                    lastMeasurementDate={userAssessment?.baselineROM?.assessmentDate}
                    suggestedTests={romSuggestion.suggestedTests}
                  />
                )}

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
      </motion.div>
    </motion.div>
  );
};

export default ProgramView;
