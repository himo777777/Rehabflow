/**
 * DailyCheckIn - Pre/Post workout check-in modal
 *
 * Collects pain levels and mood before/after training sessions.
 * Used for tracking trends and adapting the rehabilitation program.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Smile,
  Meh,
  Frown,
  Activity,
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ThermometerSun,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { WorkoutCheckIn, PainCharacter } from '../types';
import { storageService } from '../services/storageService';
import { checkPainSpike, PainAlert } from '../services/painAlertService';
import { transitions } from './ui';

interface DailyCheckInProps {
  type: 'pre' | 'post';
  onComplete: () => void;
  onSkip?: () => void;
  onPainAlert?: (alert: PainAlert) => void;
}

const PAIN_CHARACTERS: { value: PainCharacter; label: string; icon: string }[] = [
  { value: 'molande', label: 'Molande', icon: '🌊' },
  { value: 'huggande', label: 'Huggande', icon: '⚡' },
  { value: 'brännande', label: 'Brännande', icon: '🔥' },
  { value: 'bultande', label: 'Bultande', icon: '💓' },
  { value: 'domning', label: 'Domning', icon: '❄️' },
  { value: 'stelhet', label: 'Stelhet', icon: '🪨' }
];

const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  type,
  onComplete,
  onSkip,
  onPainAlert
}) => {
  const [step, setStep] = useState(1);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [painCharacter, setPainCharacter] = useState<PainCharacter | undefined>();
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [mood, setMood] = useState<'bra' | 'okej' | 'dålig'>('okej');
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'för_lätt' | 'lagom' | 'för_svår'>('lagom');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 3;
  const today = new Date().toISOString().split('T')[0];

  const getPainColor = (level: number) => {
    if (level <= 2) return 'text-emerald-400';
    if (level <= 4) return 'text-lime-400';
    if (level <= 6) return 'text-amber-400';
    if (level <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPainGradient = (level: number) => {
    if (level <= 2) return 'from-emerald-500 to-green-500';
    if (level <= 4) return 'from-lime-500 to-green-400';
    if (level <= 6) return 'from-amber-500 to-yellow-400';
    if (level <= 8) return 'from-orange-500 to-amber-400';
    return 'from-red-500 to-rose-400';
  };

  const getPainLabel = (level: number) => {
    if (level === 0) return 'Ingen smärta';
    if (level <= 2) return 'Mycket mild';
    if (level <= 4) return 'Mild';
    if (level <= 6) return 'Måttlig';
    if (level <= 8) return 'Svår';
    return 'Extremt svår';
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    const checkIn: WorkoutCheckIn = {
      type,
      timestamp: new Date().toISOString(),
      painLevel,
      painCharacter,
      ...(type === 'pre' && { energyLevel, mood }),
      ...(type === 'post' && { workoutDifficulty }),
      ...(notes && { notes })
    };

    try {
      if (type === 'pre') {
        await storageService.savePreWorkoutCheckIn(today, checkIn);
      } else {
        await storageService.savePostWorkoutCheckIn(today, checkIn);
      }

      await storageService.checkAndAwardMilestones();

      const painAlert = checkPainSpike(painLevel, {
        timeOfDay: type === 'pre' ? 'före träning' : 'efter träning',
        triggers: painCharacter ? [painCharacter] : undefined
      });

      if (painAlert && onPainAlert) {
        onPainAlert(painAlert);
      }

      onComplete();
    } catch (error) {
      console.error('Failed to save check-in:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const renderPreWorkoutStep1 = () => (
    <motion.div
      key="pre-step1"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20"
        >
          <ThermometerSun className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Hur mår du idag?</h3>
        <p className="text-slate-400">Ange din smärtnivå just nu</p>
      </div>

      {/* Pain slider */}
      <div className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400 font-medium">Smärtnivå</span>
          <motion.span
            key={painLevel}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-extrabold ${getPainColor(painLevel)}`}
          >
            {painLevel}<span className="text-lg opacity-60">/10</span>
          </motion.span>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-20" />
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="relative w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>Ingen</span>
          <motion.span
            key={painLevel}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`font-bold ${getPainColor(painLevel)}`}
          >
            {getPainLabel(painLevel)}
          </motion.span>
          <span>Extrem</span>
        </div>
      </div>

      {/* Pain character (only if pain > 0) */}
      <AnimatePresence>
        {painLevel > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-400 font-medium">Hur känns smärtan?</p>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_CHARACTERS.map((char, i) => (
                <motion.button
                  key={char.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPainCharacter(char.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    painCharacter === char.value
                      ? 'bg-gradient-to-br from-cyan-500/30 to-primary-500/30 border-2 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800/80 border-2 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{char.icon}</span>
                  <p className="text-xs mt-1 font-medium">{char.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderPreWorkoutStep2 = () => (
    <motion.div
      key="pre-step2"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20"
        >
          <Zap className="w-10 h-10 text-yellow-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Energinivå</h3>
        <p className="text-slate-400">Hur mycket energi har du just nu?</p>
      </div>

      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level, i) => {
          const Icon = level <= 2 ? BatteryLow : level <= 3 ? BatteryMedium : BatteryFull;
          return (
            <motion.button
              key={level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEnergyLevel(level)}
              className={`p-4 rounded-2xl transition-all flex flex-col items-center ${
                energyLevel === level
                  ? 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-2 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/20'
                  : 'bg-slate-800/80 border-2 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-sm font-bold">{level}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={energyLevel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
      >
        <p className="text-sm text-slate-300 font-medium">
          {energyLevel <= 2 && '😴 Låg energi - ta det lugnt idag'}
          {energyLevel === 3 && '👍 Normal energi'}
          {energyLevel >= 4 && '💪 Bra energi - kör hårt!'}
        </p>
      </motion.div>
    </motion.div>
  );

  const renderPreWorkoutStep3 = () => (
    <motion.div
      key="pre-step3"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20"
        >
          <Smile className="w-10 h-10 text-purple-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Hur känner du dig?</h3>
        <p className="text-slate-400">Ditt mentala tillstånd påverkar träningen</p>
      </div>

      <div className="flex justify-center gap-4">
        {[
          { value: 'bra' as const, icon: Smile, label: 'Bra', gradient: 'from-emerald-500/30 to-green-500/30', border: 'border-emerald-500', iconColor: 'text-emerald-400' },
          { value: 'okej' as const, icon: Meh, label: 'Okej', gradient: 'from-yellow-500/30 to-amber-500/30', border: 'border-yellow-500', iconColor: 'text-yellow-400' },
          { value: 'dålig' as const, icon: Frown, label: 'Dålig', gradient: 'from-red-500/30 to-rose-500/30', border: 'border-red-500', iconColor: 'text-red-400' }
        ].map((option, i) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMood(option.value)}
            className={`p-6 rounded-2xl transition-all flex flex-col items-center ${
              mood === option.value
                ? `bg-gradient-to-br ${option.gradient} border-2 ${option.border} shadow-lg`
                : 'bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500'
            }`}
          >
            <option.icon
              className={`w-12 h-12 mb-2 ${
                mood === option.value ? option.iconColor : 'text-slate-400'
              }`}
            />
            <span className={`font-bold ${mood === option.value ? 'text-white' : 'text-slate-400'}`}>
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Optional notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm text-slate-400 font-medium">Anteckningar (valfritt)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="T.ex. dålig sömn, stressad, träningsvärk..."
          className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          rows={2}
        />
      </motion.div>
    </motion.div>
  );

  const renderPostWorkoutStep1 = () => (
    <motion.div
      key="post-step1"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Bra jobbat! 💪</h3>
        <p className="text-slate-400">Hur var smärtan under träningen?</p>
      </div>

      {/* Pain slider */}
      <div className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400 font-medium">Smärtnivå under träning</span>
          <motion.span
            key={painLevel}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-extrabold ${getPainColor(painLevel)}`}
          >
            {painLevel}<span className="text-lg opacity-60">/10</span>
          </motion.span>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-20" />
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="relative w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>Ingen</span>
          <motion.span
            key={painLevel}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`font-bold ${getPainColor(painLevel)}`}
          >
            {getPainLabel(painLevel)}
          </motion.span>
          <span>Extrem</span>
        </div>
      </div>

      {/* Pain warning */}
      <AnimatePresence>
        {painLevel >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-bold text-sm">Hög smärta rapporterad</p>
              <p className="text-red-300/70 text-xs mt-1">
                Om smärtan är ovanligt hög, överväg att ta en vilodag och kontakta din fysioterapeut.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderPostWorkoutStep2 = () => (
    <motion.div
      key="post-step2"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
        >
          <Activity className="w-10 h-10 text-blue-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Svårighetsgrad</h3>
        <p className="text-slate-400">Hur upplevde du träningspasset?</p>
      </div>

      <div className="flex justify-center gap-3">
        {[
          { value: 'för_lätt' as const, label: 'För lätt', desc: 'Kunde gjort mer', emoji: '😌' },
          { value: 'lagom' as const, label: 'Lagom', desc: 'Precis rätt', emoji: '👌' },
          { value: 'för_svår' as const, label: 'För svår', desc: 'Behöver anpassa', emoji: '😰' }
        ].map((option, i) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setWorkoutDifficulty(option.value)}
            className={`flex-1 p-4 rounded-xl transition-all text-center ${
              workoutDifficulty === option.value
                ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500'
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <p className={`font-bold mt-2 ${
              workoutDifficulty === option.value ? 'text-white' : 'text-slate-300'
            }`}>
              {option.label}
            </p>
            <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={workoutDifficulty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center"
      >
        <p className="text-sm text-slate-300">
          {workoutDifficulty === 'för_lätt' && '💪 Bra! Vi kan öka intensiteten nästa gång.'}
          {workoutDifficulty === 'lagom' && '✅ Perfekt! Du är på rätt nivå.'}
          {workoutDifficulty === 'för_svår' && '🔄 Vi justerar programmet för att passa dig bättre.'}
        </p>
      </motion.div>
    </motion.div>
  );

  const renderPostWorkoutStep3 = () => (
    <motion.div
      key="post-step3"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitions.smooth}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <h3 className="text-2xl font-extrabold text-white mb-2">Något mer?</h3>
        <p className="text-slate-400">Lägg till anteckningar om träningen</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="T.ex. vilken övning som var svårast, hur kroppen kändes..."
          className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          rows={4}
        />
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-800/50 rounded-xl border border-slate-700/50 space-y-3"
      >
        <p className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 size={16} className="text-cyan-400" />
          Sammanfattning
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Smärta under träning:</span>
          <span className={`font-bold ${getPainColor(painLevel)}`}>{painLevel}/10</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Svårighetsgrad:</span>
          <span className="text-white font-medium">
            {workoutDifficulty === 'för_lätt' && 'För lätt'}
            {workoutDifficulty === 'lagom' && 'Lagom'}
            {workoutDifficulty === 'för_svår' && 'För svår'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    if (type === 'pre') {
      switch (step) {
        case 1: return renderPreWorkoutStep1();
        case 2: return renderPreWorkoutStep2();
        case 3: return renderPreWorkoutStep3();
      }
    } else {
      switch (step) {
        case 1: return renderPostWorkoutStep1();
        case 2: return renderPostWorkoutStep2();
        case 3: return renderPostWorkoutStep3();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={transitions.spring}
        className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-primary-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {type === 'pre' ? 'Före träning' : 'Efter träning'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s * 0.1 }}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    s <= step
                      ? 'bg-gradient-to-r from-cyan-500 to-primary-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-2">
                {step}/{totalSteps}
              </span>
            </div>
          </div>
          {onSkip && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSkip}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 flex gap-3">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              Tillbaka
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={step < totalSteps ? () => setStep(step + 1) : handleSubmit}
            disabled={isSaving}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-primary-500 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Sparar...
              </>
            ) : step < totalSteps ? (
              <>
                Nästa
                <ChevronRight size={18} />
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Klar
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DailyCheckIn;
