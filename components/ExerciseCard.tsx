
import React, { useState, useEffect, useMemo, Suspense, lazy, useRef, useCallback } from 'react';
import { Exercise, ExerciseAdjustmentType, ExerciseLog } from '../types';
import { Play, Clock, Repeat, Check, AlertTriangle, Lightbulb, X, Activity, SlidersHorizontal, Loader2, TrendingUp, TrendingDown, PackageX, Trophy, Timer, Zap, Scan, FileText, Minus, Plus, MessageSquare, Heart, BookOpen, GraduationCap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { generateAlternativeExercise } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { User } from 'lucide-react';
import PainSlider from './ui/PainSlider';

// Focus trap hook for accessibility
const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Auto-focus first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
};

// Lazy load heavy components to improve initial load time
const AIMovementCoach = lazy(() => import('./AIMovementCoach'));
const Avatar3D = lazy(() => import('./Avatar3D'));

// Preload ML libraries when user hovers over AI Coach button
import { preloadMediaPipe } from '../services/lazyMediaPipe';

// Loading fallback component
const ComponentLoader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-xl">
    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
    <p className="text-slate-400 text-sm">{text}</p>
  </div>
);

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: () => void;
  onSwap?: (newExercise: Exercise) => void;
  completed?: boolean;
  readOnly?: boolean;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

const categoryMap: Record<string, string> = {
  mobility: 'Rörlighet',
  strength: 'Styrka',
  balance: 'Balans',
  endurance: 'Uthållighet'
};

const categoryColorMap: Record<string, string> = {
  mobility: 'bg-sky-50 text-sky-700 border-sky-100',
  strength: 'bg-rose-50 text-rose-700 border-rose-100',
  balance: 'bg-violet-50 text-violet-700 border-violet-100',
  endurance: 'bg-emerald-50 text-emerald-700 border-emerald-100'
};

// Difficulty indicator with dots
const getDifficultyIndicator = (difficulty: string): { dots: React.ReactNode; color: string; label: string } => {
  const filledDot = '●';
  const emptyDot = '○';

  switch (difficulty?.toLowerCase()) {
    case 'lätt':
    case 'easy':
      return {
        dots: <>{filledDot}{emptyDot}{emptyDot}</>,
        color: 'text-green-500',
        label: 'Lätt'
      };
    case 'medel':
    case 'medium':
      return {
        dots: <>{filledDot}{filledDot}{emptyDot}</>,
        color: 'text-amber-500',
        label: 'Medel'
      };
    case 'svår':
    case 'hard':
      return {
        dots: <>{filledDot}{filledDot}{filledDot}</>,
        color: 'text-red-500',
        label: 'Svår'
      };
    default:
      return {
        dots: <>{filledDot}{emptyDot}{emptyDot}</>,
        color: 'text-slate-400',
        label: difficulty || 'Okänd'
      };
  }
};

// Evidence level labels and colors
const evidenceLevelMap: Record<string, { label: string; description: string; color: string }> = {
  'A': { label: 'Nivå A', description: 'Stark evidens (RCT, systematiska översikter)', color: 'bg-green-100 text-green-800 border-green-200' },
  'B': { label: 'Nivå B', description: 'Måttlig evidens (kohortstudier)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'C': { label: 'Nivå C', description: 'Svag evidens (fallstudier)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'D': { label: 'Nivå D', description: 'Mycket begränsad evidens', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'expert': { label: 'Expertråd', description: 'Klinisk expertis, etablerad praxis', color: 'bg-purple-100 text-purple-800 border-purple-200' }
};

const ExerciseCardComponent: React.FC<ExerciseCardProps> = ({ exercise, onComplete, onSwap, completed, readOnly = false, onFavoriteToggle, isFavorite = false }) => {
  // AI Camera State
  const [showAICoach, setShowAICoach] = useState(false);

  // 3D Avatar State
  const [showAvatar3D, setShowAvatar3D] = useState(false);

  // Swap State
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSwapOptions, setShowSwapOptions] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Feedback State
  const [completionFeedback, setCompletionFeedback] = useState<{ title: string; message: string; icon: any; color: string } | null>(null);

  // Exercise Logging State
  const [showLoggingModal, setShowLoggingModal] = useState(false);

  // Sources State
  const [showSources, setShowSources] = useState(false);

  // Focus management refs
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const swapModalRef = useRef<HTMLDivElement>(null);
  const loggingModalRef = useRef<HTMLDivElement>(null);

  // Apply focus trap to modals
  useFocusTrap(showSwapOptions, swapModalRef);
  useFocusTrap(showLoggingModal, loggingModalRef);

  // Helper to open modal with focus tracking
  const openModalWithFocusTracking = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setter(true);
  }, []);

  // Helper to close modal and return focus
  const closeModalWithFocusReturn = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
    // Return focus after animation completes
    setTimeout(() => {
      lastFocusedElementRef.current?.focus();
      lastFocusedElementRef.current = null;
    }, 100);
  }, []);
  const [logData, setLogData] = useState({
    actualSets: exercise.sets,
    actualReps: exercise.reps,
    painDuring: 0,
    painAfter: 0,
    difficulty: 'lagom' as 'för_lätt' | 'lagom' | 'för_svår',
    notes: '',
    duration: 0
  });

  useEffect(() => {
    if (completed) {
        generateFeedback();
    } else {
        setCompletionFeedback(null);
    }
  }, [completed]);

  // Keyboard navigation - Escape to close modals with focus return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAICoach) {
          setShowAICoach(false);
          setTimeout(() => lastFocusedElementRef.current?.focus(), 100);
        }
        if (showAvatar3D) {
          setShowAvatar3D(false);
          setTimeout(() => lastFocusedElementRef.current?.focus(), 100);
        }
        if (showSwapOptions) closeModalWithFocusReturn(setShowSwapOptions);
        if (showLoggingModal) closeModalWithFocusReturn(setShowLoggingModal);
        if (showSources) setShowSources(false);
      }
    };

    // Only add listener if any modal is open
    const anyModalOpen = showAICoach || showAvatar3D || showSwapOptions || showLoggingModal || showSources;
    if (anyModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAICoach, showAvatar3D, showSwapOptions, showLoggingModal, showSources, closeModalWithFocusReturn]);

  const generateFeedback = () => {
      const isHard = exercise.difficulty === 'Svår';
      const isMobility = exercise.category === 'mobility';
      const sets = exercise.sets;
      const isDuration = exercise.reps.includes('sek') || exercise.reps.includes('min');

      let feedback = {
          title: "Bra jobbat!",
          message: "En övning närmare målet.",
          icon: Check,
          color: "text-green-600 bg-green-50 border-green-200"
      };

      if (isHard) {
          feedback = {
              title: "Starkt jobbat!",
              message: `Den här var tuff (${exercise.difficulty}). Vila minst 2 minuter nu.`,
              icon: Trophy,
              color: "text-amber-600 bg-amber-50 border-amber-200"
          };
      } else if (isMobility) {
          feedback = {
              title: "Smidigt!",
              message: "Känn efter hur rörligheten ökat. Andas djupt.",
              icon: Activity,
              color: "text-blue-600 bg-blue-50 border-blue-200"
          };
      } else if (isDuration) {
          feedback = {
              title: "Bra fokus!",
              message: `Att hålla fokus i ${exercise.reps} kräver mental styrka.`,
              icon: Timer,
              color: "text-purple-600 bg-purple-50 border-purple-200"
          };
      } else if (sets > 3) {
          feedback = {
              title: "Hög volym!",
              message: `${sets} set är mycket. Skaka loss musklerna.`,
              icon: Zap,
              color: "text-orange-600 bg-orange-50 border-orange-200"
          };
      }

      setCompletionFeedback(feedback);
  };

  const handleToggleComplete = () => {
      if (completed) {
        // If already completed, just toggle off
        if (onComplete) onComplete();
      } else {
        // Show logging modal before marking complete (with focus tracking)
        openModalWithFocusTracking(setShowLoggingModal);
      }
  };

  const handleSaveLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const exerciseLog: ExerciseLog = {
      exerciseId: `${exercise.name}-${today}`,
      exerciseName: exercise.name,
      date: today,
      completed: true,
      actualSets: logData.actualSets,
      actualReps: logData.actualReps,
      difficulty: logData.difficulty,
      painDuring: logData.painDuring,
      painAfter: logData.painAfter,
      notes: logData.notes || undefined,
      duration: logData.duration > 0 ? logData.duration : undefined
    };

    storageService.saveExerciseLog(exerciseLog);
    closeModalWithFocusReturn(setShowLoggingModal);
    if (onComplete) onComplete();
  };

  const handleSkipLogging = () => {
    closeModalWithFocusReturn(setShowLoggingModal);
    if (onComplete) onComplete();
  };

  const handleSwap = async (reason: string, type: ExerciseAdjustmentType) => {
    if (!onSwap) return;
    setIsSwapping(true);
    setShowSwapOptions(false);
    setSwapError(null);
    try {
        const newExercise = await generateAlternativeExercise(exercise, reason, type);
        onSwap(newExercise);
    } catch (e) {
        setSwapError("Kunde inte byta övning just nu. Försök igen senare.");
        setTimeout(() => setSwapError(null), 5000); // Auto-clear after 5s
    } finally {
        setIsSwapping(false);
    }
  };

  // Simple steps for Avatar3D (from exercise data)
  const avatarSteps = useMemo(() => {
    if (exercise.steps && exercise.steps.length > 0) {
      return exercise.steps.map(step => ({
        title: step.title,
        instruction: step.instruction
      }));
    }
    // Fallback: split description into steps
    const sentences = exercise.description.split('. ').filter(s => s.length > 0);
    return [
      { title: 'Utförande', instruction: sentences.join('. ') },
      ...(exercise.tips ? [{ title: 'Tips', instruction: exercise.tips }] : [])
    ];
  }, [exercise]);

  if (isSwapping) {
      return (
          <div className="border rounded-3xl p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[240px] border-dashed border-slate-300">
              <Loader2 className="animate-spin text-primary-600 mb-4" size={32} />
              <p className="text-slate-600 font-medium">AI anpassar din träning...</p>
              <p className="text-slate-400 mt-1">Söker evidensbaserat alternativ</p>
          </div>
      );
  }

  return (
    <>
    {/* AI MOVEMENT COACH MODAL - Lazy loaded */}
    {showAICoach && (
        <Suspense fallback={<ComponentLoader text="Startar AI Movement Coach..." />}>
            <AIMovementCoach
                exerciseName={exercise.name}
                videoUrl={exercise.videoUrl}
                onClose={() => setShowAICoach(false)}
            />
        </Suspense>
    )}

    {/* 3D Avatar Demo - Lazy loaded */}
    {showAvatar3D && (
        <Suspense fallback={<ComponentLoader text="Laddar 3D-avatar..." />}>
            <Avatar3D
                exerciseName={exercise.name}
                steps={avatarSteps}
                onClose={() => setShowAvatar3D(false)}
            />
        </Suspense>
    )}

    <article
      className={`border-2 rounded-3xl p-6 transition-all duration-500 ease-out transform relative overflow-hidden group
      ${completed
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-sm ring-2 ring-green-100'
        : 'bg-white border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-slate-200'
      }`}
      aria-label={`Övning: ${exercise.name}${completed ? ' - Slutförd' : ''}`}
      aria-describedby={`exercise-desc-${exercise.name.replace(/\s+/g, '-')}`}
    >
      {/* Swap Error Banner */}
      {swapError && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-red-500 text-white text-sm font-medium px-4 py-2 flex items-center justify-between rounded-t-3xl animate-in slide-in-from-top duration-300">
          <span className="flex items-center gap-2"><AlertTriangle size={16} />{swapError}</span>
          <button onClick={() => setSwapError(null)} className="p-1 hover:bg-red-600 rounded" aria-label="Stäng felmeddelande">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Completed Badge */}
      {completed && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/30 animate-in zoom-in duration-300">
          <Check size={14} className="stroke-[3px]" />
          Slutförd
        </div>
      )}
      
      {/* SWAP / DIFFICULTY OVERLAY */}
      {showSwapOptions && (
          <div
            ref={swapModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-dialog-title"
            className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-3xl"
          >
              <h4 id="swap-dialog-title" className="text-white font-bold text-xl mb-2">Justera svårighetsgrad</h4>
              <p className="text-slate-400 text-sm mb-8">AI:n skapar en anpassad övning baserat på ditt val.</p>

              <div className="grid grid-cols-1 w-full gap-3 max-w-sm">
                  {[
                    { label: "Gör den lättare", sub: "Minska belastning/smärta", icon: TrendingDown, type: 'easier', iconClass: "bg-green-500/10 text-green-400 group-hover/btn:bg-green-500" },
                    { label: "Gör den svårare", sub: "Öka utmaningen", icon: TrendingUp, type: 'harder', iconClass: "bg-orange-500/10 text-orange-400 group-hover/btn:bg-orange-500" },
                    { label: "Annat alternativ", sub: "Lika tung, annan övning", icon: PackageX, type: 'equivalent', iconClass: "bg-blue-500/10 text-blue-400 group-hover/btn:bg-blue-500" }
                  ].map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => handleSwap(opt.label, opt.type as ExerciseAdjustmentType)}
                        className="flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl text-left transition-all border border-slate-700 hover:border-slate-600 hover:scale-[1.02] group/btn"
                    >
                        <div className={`p-2.5 rounded-xl group-hover/btn:text-white transition-colors ${opt.iconClass}`}>
                            <opt.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="block text-sm font-bold">{opt.label}</span>
                            <span className="text-xs text-slate-400">{opt.sub}</span>
                        </div>
                    </button>
                  ))}
              </div>
              <button onClick={() => closeModalWithFocusReturn(setShowSwapOptions)} className="mt-8 text-slate-500 hover:text-white text-sm font-medium transition-colors">Avbryt</button>
          </div>
      )}

      {/* EXERCISE LOGGING MODAL */}
      {showLoggingModal && (
          <div
            ref={loggingModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logging-dialog-title"
            className="absolute inset-0 z-40 bg-white/98 backdrop-blur-md flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-3xl overflow-hidden"
          >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-green-50/50">
                  <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-500 text-white rounded-lg">
                          <FileText size={16} />
                      </div>
                      <span id="logging-dialog-title" className="font-bold text-slate-800 text-sm tracking-wide">Logga övning</span>
                  </div>
                  <button
                      onClick={() => closeModalWithFocusReturn(setShowLoggingModal)}
                      className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Stäng dialog"
                  >
                      <X size={20} />
                  </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  {/* Sets/Reps Row */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Antal set</label>
                          <div className="flex items-center gap-2">
                              <button
                                  onClick={() => setLogData(d => ({ ...d, actualSets: Math.max(1, d.actualSets - 1) }))}
                                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                  <Minus size={18} />
                              </button>
                              <span className="flex-1 text-center text-2xl font-bold text-slate-800">{logData.actualSets}</span>
                              <button
                                  onClick={() => setLogData(d => ({ ...d, actualSets: d.actualSets + 1 }))}
                                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              >
                                  <Plus size={18} />
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Reps/tid</label>
                          <input
                              type="text"
                              value={logData.actualReps}
                              onChange={(e) => setLogData(d => ({ ...d, actualReps: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800 focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100"
                          />
                      </div>
                  </div>

                  {/* Pain During Exercise */}
                  <PainSlider
                    value={logData.painDuring}
                    onChange={(val) => setLogData(d => ({ ...d, painDuring: val }))}
                    label="Smärta under övning"
                  />

                  {/* Pain After Exercise */}
                  <PainSlider
                    value={logData.painAfter}
                    onChange={(val) => setLogData(d => ({ ...d, painAfter: val }))}
                    label="Smärta efter övning"
                  />

                  {/* Difficulty */}
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">Hur kändes övningen?</label>
                      <div className="grid grid-cols-3 gap-2">
                          {[
                              { value: 'för_lätt', label: 'För lätt', icon: TrendingDown, activeClass: 'border-green-500 bg-green-50 text-green-700' },
                              { value: 'lagom', label: 'Lagom', icon: Check, activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
                              { value: 'för_svår', label: 'För svår', icon: TrendingUp, activeClass: 'border-orange-500 bg-orange-50 text-orange-700' }
                          ].map((opt) => (
                              <button
                                  key={opt.value}
                                  onClick={() => setLogData(d => ({ ...d, difficulty: opt.value as any }))}
                                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                      logData.difficulty === opt.value
                                          ? opt.activeClass
                                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                  }`}
                              >
                                  <opt.icon size={20} />
                                  <span className="text-xs font-bold">{opt.label}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Notes */}
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <MessageSquare size={14} /> Anteckningar (valfritt)
                      </label>
                      <textarea
                          value={logData.notes}
                          onChange={(e) => setLogData(d => ({ ...d, notes: e.target.value }))}
                          placeholder="T.ex. 'Kände pirrning i knäet', 'Bättre än förra gången'..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 resize-none"
                          rows={2}
                      />
                  </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                  <button
                      onClick={handleSkipLogging}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                      Hoppa över
                  </button>
                  <button
                      onClick={handleSaveLog}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                      <Check size={18} /> Spara & Klar
                  </button>
              </div>
          </div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-opacity duration-500 border ${completed ? 'opacity-70 grayscale' : 'opacity-100'} ${categoryColorMap[exercise.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {categoryMap[exercise.category] || exercise.category}
            </span>
            {/* Difficulty Indicator */}
            {exercise.difficulty && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 ${completed ? 'opacity-70' : 'opacity-100'}`}>
                <span className={`tracking-wider ${getDifficultyIndicator(exercise.difficulty).color}`}>
                  {getDifficultyIndicator(exercise.difficulty).dots}
                </span>
                <span className="text-slate-600 uppercase tracking-wider">
                  {getDifficultyIndicator(exercise.difficulty).label}
                </span>
              </span>
            )}
          </div>
          <h3 className={`text-xl font-bold mt-3 transition-all duration-300 tracking-tight ${completed ? 'text-slate-400 line-through decoration-slate-300 decoration-2' : 'text-slate-900'}`}>
            {exercise.name}
          </h3>
        </div>
        {!readOnly && onComplete && (
          <button 
            onClick={handleToggleComplete}
            className={`p-3 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-sm
                ${completed 
                  ? 'bg-green-500 text-white shadow-green-200 scale-100' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-green-500 hover:border-green-200 hover:shadow-md hover:-translate-y-0.5'
                }`}
          >
            <Check 
              size={22} 
              className={`transition-all duration-500 ${completed ? 'scale-110 stroke-[3px] rotate-0' : 'scale-100 -rotate-90 opacity-50'}`} 
            />
          </button>
        )}
      </div>

      {/* DYNAMIC FEEDBACK BANNER */}
      {completed && completionFeedback && (
          <div className={`mb-5 p-4 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${completionFeedback.color}`}>
              <div className="p-2.5 rounded-xl bg-white/60 shadow-sm">
                  {React.createElement(completionFeedback.icon, { size: 18 })}
              </div>
              <div>
                  <h4 className="text-sm font-bold">{completionFeedback.title}</h4>
                  <p className="text-xs font-medium opacity-80">{completionFeedback.message}</p>
              </div>
          </div>
      )}

      <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${completed ? 'text-slate-400' : 'text-slate-600'}`}>
        {exercise.description}
      </p>

      {/* Metrics Row - Responsive */}
      <div className={`grid grid-cols-2 ${exercise.calories ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 mb-6 transition-all duration-300 ${completed ? 'opacity-40 grayscale' : 'opacity-100'}`}>
        {[
            { label: 'Set', val: exercise.sets, icon: Repeat },
            { label: 'Reps', val: exercise.reps, icon: Clock },
            { label: 'Frekvens', val: exercise.frequency.split(' ')[0], icon: Play },
            ...(exercise.calories ? [{ label: 'Kalorier', val: `~${exercise.calories}`, icon: Zap }] : [])
        ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:border-slate-200 transition-colors">
                <stat.icon className="w-4 h-4 text-slate-400 mb-1.5" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="font-bold text-slate-700">{stat.val}</span>
            </div>
        ))}
      </div>

      {/* Tips Section - More prominent */}
      {exercise.tips && (
        <div className={`mb-5 p-4 rounded-2xl border transition-colors duration-300 ${
            completed
            ? 'bg-slate-50/50 text-slate-400 border-slate-100'
            : 'bg-amber-50/80 text-amber-800 border-amber-200'
        }`}>
           <div className="flex items-start gap-3">
              <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${completed ? 'text-slate-300' : 'text-amber-500'}`} />
              <div>
                <span className={`text-xs font-bold uppercase tracking-wide block mb-1 ${completed ? 'text-slate-400' : 'text-amber-600'}`}>Tips</span>
                <p className="text-sm font-medium leading-relaxed">{exercise.tips}</p>
              </div>
           </div>
        </div>
      )}

      {/* Risks / Safety Section */}
      {exercise.risks && (
        <div className={`mb-5 p-4 rounded-2xl border transition-colors duration-300 ${
            completed
            ? 'bg-slate-50/50 text-slate-400 border-slate-100'
            : 'bg-red-50/80 text-red-800 border-red-200'
        }`}>
           <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${completed ? 'text-slate-300' : 'text-red-500'}`} />
              <div className="flex-1">
                <span className={`text-xs font-bold uppercase tracking-wide block mb-2 ${completed ? 'text-slate-400' : 'text-red-600'}`}>Säkerhetsvarning</span>
                <p className="text-sm font-medium leading-relaxed">{exercise.risks}</p>
              </div>
           </div>
        </div>
      )}

      {/* Advanced Tips / Progression Section */}
      {exercise.advancedTips && (
        <details className={`mb-5 rounded-2xl border overflow-hidden transition-colors duration-300 ${
            completed
            ? 'bg-slate-50/50 border-slate-100'
            : 'bg-indigo-50/60 border-indigo-200'
        }`}>
           <summary className={`p-4 cursor-pointer flex items-center gap-3 hover:bg-indigo-100/50 transition-colors list-none ${completed ? 'text-slate-400' : 'text-indigo-800'}`}>
              <TrendingUp className={`w-5 h-5 flex-shrink-0 ${completed ? 'text-slate-300' : 'text-indigo-500'}`} />
              <span className="text-sm font-bold">Progression & avancerade tips</span>
              <ChevronDown className={`w-4 h-4 ml-auto ${completed ? 'text-slate-300' : 'text-indigo-400'}`} />
           </summary>
           <div className={`px-4 pb-4 pt-2 border-t ${completed ? 'border-slate-100' : 'border-indigo-200'}`}>
              <p className={`text-sm leading-relaxed ${completed ? 'text-slate-400' : 'text-indigo-700'}`}>
                {exercise.advancedTips}
              </p>
           </div>
        </details>
      )}

      {/* Evidence & Sources Section */}
      {(exercise.sources?.length || exercise.evidenceLevel) && (
        <div className="mb-5">
          {/* Evidence Badge & Toggle */}
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-slate-500" />
              <div className="flex items-center gap-2">
                {exercise.evidenceLevel && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${evidenceLevelMap[exercise.evidenceLevel]?.color || 'bg-slate-100 text-slate-600'}`}>
                    {evidenceLevelMap[exercise.evidenceLevel]?.label || exercise.evidenceLevel}
                  </span>
                )}
                <span className="text-sm text-slate-600 font-medium">
                  {exercise.sources?.length ? `${exercise.sources.length} vetenskaplig${exercise.sources.length > 1 ? 'a' : ''} käll${exercise.sources.length > 1 ? 'or' : 'a'}` : 'Vetenskaplig grund'}
                </span>
              </div>
            </div>
            {showSources ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Expanded Sources */}
          {showSources && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
              {/* Evidence Level Description */}
              {exercise.evidenceLevel && evidenceLevelMap[exercise.evidenceLevel] && (
                <p className="text-xs text-slate-500 pb-2 border-b border-slate-100">
                  {evidenceLevelMap[exercise.evidenceLevel].description}
                </p>
              )}

              {/* Source List */}
              {exercise.sources?.map((source, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 leading-snug">{source.title}</p>
                      {source.authors && (
                        <p className="text-slate-500 text-xs mt-0.5">{source.authors} {source.year && `(${source.year})`}</p>
                      )}
                      {source.journal && (
                        <p className="text-slate-400 text-xs italic">{source.journal}</p>
                      )}
                      {source.doi && (
                        <a
                          href={`https://doi.org/${source.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          DOI: {source.doi}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary Actions - Large touch-friendly buttons - Responsive */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 transition-opacity duration-300 ${completed ? 'opacity-60' : 'opacity-100'}`}>
         {/* AI Coach Button */}
         <button
            onClick={() => {
              lastFocusedElementRef.current = document.activeElement as HTMLElement;
              setShowAICoach(true);
            }}
            onMouseEnter={preloadMediaPipe} // Preload ML (~1.6MB) on hover for faster startup
            onFocus={preloadMediaPipe} // Also preload on focus for keyboard users
            className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            aria-label="Starta AI Rörelseanalys"
         >
            <Scan size={22} />
            <span className="text-sm">AI Rörelseanalys</span>
         </button>

         {/* 3D Avatar Button */}
         <button
            onClick={() => {
              lastFocusedElementRef.current = document.activeElement as HTMLElement;
              setShowAvatar3D(true);
            }}
            className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            aria-label="Visa 3D Demo"
         >
            <User size={22} />
            <span className="text-sm">3D Demo</span>
         </button>
      </div>

      {/* Secondary Actions Row - Responsive wrap */}
      <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ${completed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
         {/* FAVORITE BUTTON */}
         {onFavoriteToggle && (
            <button
                onClick={onFavoriteToggle}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all min-h-[44px] ${
                    isFavorite
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                }`}
                aria-label={isFavorite ? 'Ta bort favorit' : 'Lägg till favorit'}
            >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Favorit' : 'Spara'}
            </button>
         )}

         {/* SWAP BUTTON */}
         {!completed && onSwap && !readOnly && (
            <button
                onClick={() => openModalWithFocusTracking(setShowSwapOptions)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm font-medium min-h-[44px]"
                aria-label="Justera svårighetsgrad"
            >
                <SlidersHorizontal size={18} />
                Justera
            </button>
         )}
      </div>
    </article>
    </>
  );
};

// React.memo optimization to prevent unnecessary re-renders
// Only re-render if exercise.id, completed, or isFavorite changes
const ExerciseCard = React.memo(ExerciseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.exercise.name === nextProps.exercise.name &&
    prevProps.completed === nextProps.completed &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.readOnly === nextProps.readOnly
  );
});

export default ExerciseCard;
