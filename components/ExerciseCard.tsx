
import React, { useState, useEffect, useMemo } from 'react';
import { Exercise, ExerciseAdjustmentType } from '../types';
import { Play, Info, Clock, Repeat, Check, AlertTriangle, Lightbulb, Navigation, X, ChevronRight, ChevronLeft, MapPin, Activity, Flame, BarChart2, SlidersHorizontal, Loader2, TrendingUp, TrendingDown, PackageX, Volume2, VolumeX, Trophy, Timer, Zap, Youtube, ExternalLink, Search, Camera, Scan } from 'lucide-react';
import { generateAlternativeExercise } from '../services/geminiService';
import AIMovementCoach from './AIMovementCoach';

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: () => void;
  onSwap?: (newExercise: Exercise) => void;
  completed?: boolean;
  readOnly?: boolean;
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

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onComplete, onSwap, completed, readOnly = false }) => {
  const [showVideo, setShowVideo] = useState(false);
  
  // Guide State
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // AI Camera State
  const [showAICoach, setShowAICoach] = useState(false);

  // Swap State
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSwapOptions, setShowSwapOptions] = useState(false);

  // Feedback State
  const [completionFeedback, setCompletionFeedback] = useState<{ title: string; message: string; icon: any; color: string } | null>(null);

  // Robust check for valid YouTube Embed URL
  const hasValidEmbed = useMemo(() => {
      return exercise.videoUrl && exercise.videoUrl.includes('youtube.com/embed');
  }, [exercise.videoUrl]);

  useEffect(() => {
    if (completed) {
        generateFeedback();
    } else {
        setCompletionFeedback(null);
    }
  }, [completed]);

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
      if (onComplete) onComplete();
  };

  const handleVideoClick = async () => {
    if (showGuide) setShowGuide(false);
    setShowVideo(!showVideo);
  };

  const handleSwap = async (reason: string, type: ExerciseAdjustmentType) => {
    if (!onSwap) return;
    setIsSwapping(true);
    setShowSwapOptions(false);
    try {
        const newExercise = await generateAlternativeExercise(exercise, reason, type);
        onSwap(newExercise);
        setShowVideo(false);
    } catch (e) {
        alert("Kunde inte byta övning just nu.");
    } finally {
        setIsSwapping(false);
    }
  };

  const guideSteps = useMemo(() => {
    if (exercise.steps && exercise.steps.length > 0) {
        return exercise.steps.map(step => ({
            title: step.title,
            content: step.instruction,
            icon: step.type === 'start' ? MapPin : step.type === 'execution' ? Activity : Lightbulb,
            color: step.type === 'start' ? "text-blue-600 bg-blue-50" : step.type === 'execution' ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50",
            videoUrl: step.videoUrl,
            animationType: step.animationType
        }));
    }

    const steps = [];
    const sentences = exercise.description.split('. ').filter(s => s.length > 0);
    const startPos = sentences[0];
    const movement = sentences.slice(1).join('. ');

    steps.push({
        title: "Startposition",
        content: startPos + (startPos.endsWith('.') ? '' : '.'),
        icon: MapPin,
        color: "text-blue-600 bg-blue-50",
        animationType: 'pulse'
    });

    if (movement) {
        steps.push({
            title: "Utförande",
            content: movement + (movement.endsWith('.') ? '' : '.'),
            icon: Activity,
            color: "text-green-600 bg-green-50",
            animationType: 'slide'
        });
    }

    if (exercise.tips) {
        steps.push({
            title: "Tekniktips",
            content: exercise.tips,
            icon: Lightbulb,
            color: "text-amber-600 bg-amber-50",
            animationType: 'bounce'
        });
    }

    return steps;
  }, [exercise]);

  const handleGuideClick = () => {
    if (showVideo) setShowVideo(false);
    setShowGuide(!showGuide);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

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
    {/* AI MOVEMENT COACH MODAL */}
    {showAICoach && (
        <AIMovementCoach 
            exerciseName={exercise.name} 
            videoUrl={exercise.videoUrl}
            onClose={() => setShowAICoach(false)} 
        />
    )}

    <div className={`border rounded-3xl p-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform relative overflow-hidden group
      ${completed 
        ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50 shadow-inner scale-[0.98] opacity-90' 
        : 'bg-white border-white/50 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-slate-200 scale-100'
      }`}>
      
      {/* Interactive Guide Overlay */}
      {showGuide && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                        <Navigation size={16} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm tracking-wide">Steg-för-steg</span>
                </div>
                <button 
                    onClick={() => setShowGuide(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-grow flex flex-col p-0 bg-white relative">
                <div className="flex justify-center gap-1.5 p-4 pb-2 z-10 relative">
                    {guideSteps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentStep ? 'w-10 bg-slate-800' : idx < currentStep ? 'w-2 bg-slate-300' : 'w-2 bg-slate-100'}`}
                        />
                    ))}
                </div>

                <div className="w-full bg-slate-50 aspect-video relative flex items-center justify-center overflow-hidden border-y border-slate-100 group/media">
                    <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            {guideSteps[currentStep].animationType === 'pulse' && <div className="w-32 h-32 rounded-full border-4 border-cyan-400 animate-ping"></div>}
                            {guideSteps[currentStep].animationType === 'slide' && <div className="w-48 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[shimmer_2s_infinite]"></div>}
                            {guideSteps[currentStep].animationType === 'bounce' && <div className="w-20 h-20 bg-amber-400/50 rounded-full animate-bounce"></div>}
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl ${guideSteps[currentStep].color.replace('bg-', 'text-').replace('100', '300')}`}>
                                {React.createElement(guideSteps[currentStep].icon, { size: 40 })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 text-center flex flex-col justify-center flex-grow transition-all duration-300 transform" key={currentStep}>
                    <h4 className="text-2xl font-bold text-slate-800 mb-4 animate-in fade-in slide-in-from-bottom-2 tracking-tight">
                        {guideSteps[currentStep].title}
                    </h4>
                    
                    <p className="text-slate-600 leading-relaxed text-lg animate-in fade-in slide-in-from-bottom-3 delay-100 font-medium">
                        {guideSteps[currentStep].content}
                    </p>
                </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <button 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Steg {currentStep + 1} / {guideSteps.length}
                </div>

                {currentStep === guideSteps.length - 1 ? (
                    <button 
                        onClick={() => {
                            setShowGuide(false);
                            if (onComplete && !completed) handleToggleComplete();
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all hover:scale-105 hover:-translate-y-0.5"
                    >
                        Klart <Check size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:translate-x-1"
                    >
                        Nästa <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
      )}

      {/* SWAP / DIFFICULTY OVERLAY */}
      {showSwapOptions && (
          <div className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-3xl">
              <h4 className="text-white font-bold text-xl mb-2">Justera svårighetsgrad</h4>
              <p className="text-slate-400 text-sm mb-8">AI:n skapar en anpassad övning baserat på ditt val.</p>
              
              <div className="grid grid-cols-1 w-full gap-3 max-w-sm">
                  {[
                    { label: "Gör den lättare", sub: "Minska belastning/smärta", icon: TrendingDown, type: 'easier', color: "green" },
                    { label: "Gör den svårare", sub: "Öka utmaningen", icon: TrendingUp, type: 'harder', color: "orange" },
                    { label: "Annat alternativ", sub: "Lika tung, annan övning", icon: PackageX, type: 'equivalent', color: "blue" }
                  ].map((opt) => (
                    <button 
                        key={opt.type}
                        onClick={() => handleSwap(opt.label, opt.type as ExerciseAdjustmentType)} 
                        className="flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl text-left transition-all border border-slate-700 hover:border-slate-600 hover:scale-[1.02] group/btn"
                    >
                        <div className={`p-2.5 bg-${opt.color}-500/10 rounded-xl text-${opt.color}-400 group-hover/btn:bg-${opt.color}-500 group-hover/btn:text-white transition-colors`}>
                            <opt.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="block text-sm font-bold">{opt.label}</span>
                            <span className="text-xs text-slate-400">{opt.sub}</span>
                        </div>
                    </button>
                  ))}
              </div>
              <button onClick={() => setShowSwapOptions(false)} className="mt-8 text-slate-500 hover:text-white text-sm font-medium transition-colors">Avbryt</button>
          </div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-opacity duration-500 border ${completed ? 'opacity-70 grayscale' : 'opacity-100'} ${categoryColorMap[exercise.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {categoryMap[exercise.category] || exercise.category}
          </span>
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

      {/* Expanded Video/Search Section */}
      {showVideo && !showGuide && (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {hasValidEmbed ? (
                /* 1. TRUSTED EMBED EXISTS (FROM DATABASE) */
                <div className={`bg-black rounded-2xl overflow-hidden aspect-video relative shadow-lg shadow-slate-200/50 border border-slate-100 transition-all duration-500 ${completed ? 'opacity-80' : ''}`}>
                    <iframe 
                        src={exercise.videoUrl}
                        title={exercise.name}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                /* 2. FAILSAFE SEARCH CARD (Bypass 'Video Unavailable' by opening in new tab) */
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl relative overflow-hidden text-white p-6 flex flex-col items-center justify-center text-center gap-4 shadow-xl border border-slate-700">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-2 ring-1 ring-white/20">
                        <Search size={32} className="text-white" />
                    </div>
                    
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-1">Hitta korrekt teknik</h4>
                        <p className="text-slate-300 text-sm max-w-[280px] mx-auto leading-relaxed">
                            Vi har ingen verifierad video för "{exercise.name}" än. Klicka nedan för att söka efter en fysioterapeutisk instruktion på YouTube.
                        </p>
                    </div>
                    
                    <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " physiotherapy exercise technique")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-8 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 group/link"
                    >
                        <Youtube size={20} className="group-hover/link:scale-110 transition-transform" /> 
                        Öppna sökning <ExternalLink size={16} className="opacity-70" />
                    </a>
                </div>
            )}

            {/* Info Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-sm transition-opacity duration-300 ${completed ? 'opacity-60' : 'opacity-100'}`}>
                <div className="md:col-span-2 flex gap-2 mb-1">
                     {exercise.difficulty && (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                            <BarChart2 size={14} /> {exercise.difficulty}
                         </div>
                     )}
                     {exercise.calories && (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                            <Flame size={14} /> {exercise.calories}
                         </div>
                     )}
                </div>

                {exercise.frequency && (
                     <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-blue-800 md:col-span-2">
                         <div className="flex items-center gap-2 font-bold mb-1 text-blue-900 text-xs uppercase tracking-wide">
                            <Play size={12} /> Rekommenderad Frekvens
                         </div>
                         <p className="text-sm opacity-90 font-medium">{exercise.frequency}</p>
                     </div>
                )}

                {exercise.risks && (
                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-red-800 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold mb-1 text-red-900 text-xs uppercase tracking-wide">
                            <AlertTriangle size={12} /> Tänk på
                        </div>
                        <p className="text-sm opacity-90 leading-snug">{exercise.risks}</p>
                    </div>
                )}
                {exercise.advancedTips && (
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-indigo-800 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold mb-1 text-indigo-900 text-xs uppercase tracking-wide">
                            <Lightbulb size={12} /> Proffstips
                        </div>
                        <p className="text-sm opacity-90 leading-snug">{exercise.advancedTips}</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-300 ${completed ? 'opacity-40 grayscale' : 'opacity-100'}`}>
        {[
            { label: 'Set', val: exercise.sets, icon: Repeat },
            { label: 'Reps', val: exercise.reps, icon: Clock },
            { label: 'Frekvens', val: exercise.frequency.split(' ')[0], icon: Play } // Shorten freq
        ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:border-slate-200 transition-colors">
                <stat.icon className="w-4 h-4 text-slate-400 mb-1.5" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="font-bold text-slate-700">{stat.val}</span>
            </div>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex gap-3">
         <div className={`flex-1 flex items-start gap-3 text-xs p-3 rounded-2xl border transition-colors duration-300 ${
             completed 
             ? 'bg-transparent text-slate-400 border-slate-100' 
             : 'bg-amber-50/50 text-amber-700 border-amber-100'
         }`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
            <p className="font-medium leading-relaxed">{exercise.tips}</p>
         </div>
         
         <div className={`flex gap-2 transition-opacity duration-300 ${completed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
             {!completed && onSwap && !readOnly && (
                <button
                    onClick={() => setShowSwapOptions(true)}
                    className="flex items-center justify-center w-12 rounded-2xl border bg-white text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow"
                    title="Justera nivå / Byt övning"
                >
                    <SlidersHorizontal size={20} />
                </button>
             )}

             <button 
                onClick={handleGuideClick}
                className={`flex items-center justify-center w-12 rounded-2xl border transition-all hover:-translate-y-0.5 shadow-sm hover:shadow ${
                    showGuide 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-slate-300' 
                    : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
                title="Starta guide"
             >
                <Navigation size={20} />
             </button>

             <button 
                onClick={handleVideoClick}
                className={`flex items-center justify-center w-12 rounded-2xl border transition-all hover:-translate-y-0.5 shadow-sm hover:shadow ${
                    showVideo 
                    ? 'bg-red-500 text-white border-red-500 shadow-red-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                }`}
                title="Visa video"
             >
                <Youtube size={20} />
             </button>
             
             {/* NEW VISIBLE CAMERA BUTTON */}
             <button
                onClick={() => setShowAICoach(true)}
                className={`flex items-center justify-center w-12 rounded-2xl border transition-all hover:-translate-y-0.5 shadow-sm hover:shadow ${
                    showAICoach
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-cyan-200'
                    : 'bg-white text-cyan-500 border-slate-200 hover:bg-cyan-50 hover:border-cyan-200'
                }`}
                title="AI Rörelseanalys"
             >
                <Scan size={20} />
             </button>
         </div>
      </div>
    </div>
    </>
  );
};

export default ExerciseCard;
