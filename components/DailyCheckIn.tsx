/**
 * DailyCheckIn - Pre/Post workout check-in modal
 *
 * Collects pain levels and mood before/after training sessions.
 * Used for tracking trends and adapting the rehabilitation program.
 */

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { WorkoutCheckIn, PainCharacter } from '../types';
import { storageService } from '../services/storageService';
import { checkPainSpike, PainAlert } from '../services/painAlertService';

interface DailyCheckInProps {
  type: 'pre' | 'post';
  onComplete: () => void;
  onSkip?: () => void;
  /** Callback when a pain alert is triggered */
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

  const totalSteps = type === 'pre' ? 3 : 3;
  const today = new Date().toISOString().split('T')[0];

  const getPainColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level <= 4) return 'text-lime-500';
    if (level <= 6) return 'text-yellow-500';
    if (level <= 8) return 'text-orange-500';
    return 'text-red-500';
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

      // Check for new milestones
      await storageService.checkAndAwardMilestones();

      // Check for pain spike alerts
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

  const renderPreWorkoutStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ThermometerSun className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Hur mår du idag?</h3>
        <p className="text-slate-400 text-sm">Ange din smärtnivå just nu (i vila)</p>
      </div>

      {/* Pain slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Smärtnivå</span>
          <span className={`text-2xl font-bold ${getPainColor(painLevel)}`}>
            {painLevel}/10
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        <div className="flex justify-between text-xs text-slate-500">
          <span>0 - Ingen</span>
          <span className={`font-medium ${getPainColor(painLevel)}`}>
            {getPainLabel(painLevel)}
          </span>
          <span>10 - Extrem</span>
        </div>
      </div>

      {/* Pain character (only if pain > 0) */}
      {painLevel > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Hur känns smärtan?</p>
          <div className="grid grid-cols-3 gap-2">
            {PAIN_CHARACTERS.map((char) => (
              <button
                key={char.value}
                onClick={() => setPainCharacter(char.value)}
                className={`
                  p-3 rounded-xl text-center transition-all
                  ${painCharacter === char.value
                    ? 'bg-cyan-500/20 border-2 border-cyan-500 text-white'
                    : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                <span className="text-xl">{char.icon}</span>
                <p className="text-xs mt-1">{char.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPreWorkoutStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Energinivå</h3>
        <p className="text-slate-400 text-sm">Hur mycket energi har du just nu?</p>
      </div>

      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4, 5].map((level) => {
          const Icon = level <= 2 ? BatteryLow : level <= 3 ? BatteryMedium : BatteryFull;
          return (
            <button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={`
                p-4 rounded-xl transition-all flex flex-col items-center
                ${energyLevel === level
                  ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400'
                  : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                }
              `}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{level}</span>
            </button>
          );
        })}
      </div>

      <div className="text-center text-sm text-slate-400">
        {energyLevel <= 2 && 'Låg energi - ta det lugnt idag'}
        {energyLevel === 3 && 'Normal energi'}
        {energyLevel >= 4 && 'Bra energi - kör hårt!'}
      </div>
    </div>
  );

  const renderPreWorkoutStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smile className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Hur känner du dig?</h3>
        <p className="text-slate-400 text-sm">Ditt mentala tillstånd påverkar träningen</p>
      </div>

      <div className="flex justify-center gap-6">
        {[
          { value: 'bra' as const, icon: Smile, label: 'Bra', color: 'green' },
          { value: 'okej' as const, icon: Meh, label: 'Okej', color: 'yellow' },
          { value: 'dålig' as const, icon: Frown, label: 'Dålig', color: 'red' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setMood(option.value)}
            className={`
              p-6 rounded-2xl transition-all flex flex-col items-center
              ${mood === option.value
                ? `bg-${option.color}-500/20 border-2 border-${option.color}-500`
                : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              }
            `}
          >
            <option.icon
              className={`w-10 h-10 mb-2 ${
                mood === option.value ? `text-${option.color}-400` : 'text-slate-400'
              }`}
            />
            <span className={mood === option.value ? 'text-white' : 'text-slate-400'}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Optional notes */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Anteckningar (valfritt)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="T.ex. dålig sömn, stressad, träningsvärk..."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderPostWorkoutStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Bra jobbat!</h3>
        <p className="text-slate-400 text-sm">Hur var smärtan under träningen?</p>
      </div>

      {/* Pain slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Smärtnivå under träning</span>
          <span className={`text-2xl font-bold ${getPainColor(painLevel)}`}>
            {painLevel}/10
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        <div className="flex justify-between text-xs text-slate-500">
          <span>0 - Ingen</span>
          <span className={`font-medium ${getPainColor(painLevel)}`}>
            {getPainLabel(painLevel)}
          </span>
          <span>10 - Extrem</span>
        </div>
      </div>

      {/* Pain warning */}
      {painLevel >= 7 && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">Hög smärta rapporterad</p>
            <p className="text-red-300/70 text-xs mt-1">
              Om smärtan är ovanligt hög, överväg att ta en vilodag och kontakta din fysioterapeut.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderPostWorkoutStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Svårighetsgrad</h3>
        <p className="text-slate-400 text-sm">Hur upplevde du träningspasset?</p>
      </div>

      <div className="flex justify-center gap-4">
        {[
          { value: 'för_lätt' as const, label: 'För lätt', desc: 'Kunde gjort mer' },
          { value: 'lagom' as const, label: 'Lagom', desc: 'Precis rätt' },
          { value: 'för_svår' as const, label: 'För svår', desc: 'Behöver anpassa' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setWorkoutDifficulty(option.value)}
            className={`
              flex-1 p-4 rounded-xl transition-all text-center
              ${workoutDifficulty === option.value
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              }
            `}
          >
            <p className={`font-medium ${
              workoutDifficulty === option.value ? 'text-white' : 'text-slate-300'
            }`}>
              {option.label}
            </p>
            <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl">
        <p className="text-sm text-slate-400">
          {workoutDifficulty === 'för_lätt' && (
            '💪 Bra! Vi kan öka intensiteten nästa gång.'
          )}
          {workoutDifficulty === 'lagom' && (
            '✅ Perfekt! Du är på rätt nivå.'
          )}
          {workoutDifficulty === 'för_svår' && (
            '🔄 Vi justerar programmet för att passa dig bättre.'
          )}
        </p>
      </div>
    </div>
  );

  const renderPostWorkoutStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Något mer?</h3>
        <p className="text-slate-400 text-sm">Lägg till anteckningar om träningen</p>
      </div>

      <div className="space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="T.ex. vilken övning som var svårast, hur kroppen kändes..."
          className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none"
          rows={4}
        />
      </div>

      {/* Summary */}
      <div className="p-4 bg-slate-800/50 rounded-xl space-y-2">
        <p className="text-sm font-medium text-slate-300">Sammanfattning:</p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Smärta under träning:</span>
          <span className={getPainColor(painLevel)}>{painLevel}/10</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Svårighetsgrad:</span>
          <span className="text-white">
            {workoutDifficulty === 'för_lätt' && 'För lätt'}
            {workoutDifficulty === 'lagom' && 'Lagom'}
            {workoutDifficulty === 'för_svår' && 'För svår'}
          </span>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {type === 'pre' ? 'Före träning' : 'Efter träning'}
            </h2>
            <p className="text-xs text-slate-500">
              Steg {step} av {totalSteps}
            </p>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              Tillbaka
            </button>
          )}
          <button
            onClick={step < totalSteps ? () => setStep(step + 1) : handleSubmit}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Sparar...' : step < totalSteps ? 'Nästa' : 'Klar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckIn;
