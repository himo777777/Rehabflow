import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Exercise } from '../types';
import { generateExerciseRecommendations, ExerciseRecommendation } from '../services/geminiService';
import { searchExercises as searchLocalExercises, EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { storageService } from '../services/storageService';
import ExerciseCard from './ExerciseCard';
import { evaluateExerciseSafety, SafetyContext, SafetyResult, getAvailableProtocols } from '../services/safetyService';
import { Search, Loader2, Dumbbell, Filter, Database, Sparkles, Heart, SlidersHorizontal, X, Star, Lightbulb, ChevronRight, Zap, Target, Activity, BookOpen, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  "Ländrygg", "Nacke", "Axlar", "Knä", "Fotled", "Höft", "Bålstabilitet", "Hållning"
];

const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'Alla nivåer' },
  { value: 'Lätt', label: 'Lätt' },
  { value: 'Medel', label: 'Medel' },
  { value: 'Svår', label: 'Svår' }
];

const FAVORITES_KEY = 'rehabflow_favorite_exercises';

// Helper to get favorites from localStorage
const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save favorites to localStorage
const saveFavorites = (favorites: string[]): void => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const ExerciseLibrary: React.FC = () => {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Safety filter state
  const [safetyFilterEnabled, setSafetyFilterEnabled] = useState(false);
  const [safetyPhase, setSafetyPhase] = useState<1 | 2 | 3>(1);
  const [isPostOp, setIsPostOp] = useState(false);
  const [surgeryType, setSurgeryType] = useState<string>('');
  const [daysSinceSurgery, setDaysSinceSurgery] = useState<number>(14);
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  // Load favorites and recommendations on mount
  useEffect(() => {
    setFavorites(getFavorites());
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      // Get user data from storage
      const assessment = storageService.getAssessmentDraft();

      // Get exercise logs from the last 7 days
      const completedExercises: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const logs = storageService.getExerciseLogsForDate(dateStr);
        logs
          .filter(log => log.completed)
          .forEach(log => {
            if (!completedExercises.includes(log.exerciseName)) {
              completedExercises.push(log.exerciseName);
            }
          });
      }

      const recs = await generateExerciseRecommendations(
        assessment?.injuryLocation || 'Allmän rehabilitering',
        assessment?.painLevel || 3,
        completedExercises,
        getFavorites()
      );
      setRecommendations(recs);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const toggleFavorite = useCallback((exerciseName: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(exerciseName)
        ? prev.filter(f => f !== exerciseName)
        : [...prev, exerciseName];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const handleSearch = (term: string) => {
    setSearched(true);
    setLoading(true);

    // Use local database search - it's synchronous and fast
    try {
      if (!term || term === "Vanliga rehabövningar") {
        // Show all exercises when no search term
        setExercises([...EXERCISE_DATABASE]);
      } else {
        const results = searchLocalExercises(term);
        setExercises(results);
      }
    } catch (e) {
      console.error(e);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setActiveFilter(null);
      handleSearch(query);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setQuery("");
    setActiveFilter(cat);
    setSearched(true);
    setLoading(true);
    try {
      // Use local database search by body area
      const results = searchLocalExercises(cat);
      setExercises(results);
    } catch (e) {
      console.error(e);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("Vanliga rehabövningar");
  }, []);

  // Safety context for filtering
  const safetyContext = useMemo((): SafetyContext => ({
    phase: safetyPhase,
    isPostOp,
    daysSinceSurgery: isPostOp ? daysSinceSurgery : undefined,
    surgeryType: isPostOp ? surgeryType : undefined,
    painLevel: undefined // Could be connected to user's current pain
  }), [safetyPhase, isPostOp, daysSinceSurgery, surgeryType]);

  // Calculate safety results for all exercises
  const exerciseSafetyMap = useMemo(() => {
    if (!safetyFilterEnabled) return new Map<string, SafetyResult>();
    const map = new Map<string, SafetyResult>();
    exercises.forEach(ex => {
      map.set(ex.name, evaluateExerciseSafety(ex, safetyContext));
    });
    return map;
  }, [exercises, safetyContext, safetyFilterEnabled]);

  // Filter exercises based on difficulty, favorites, and safety
  const filteredExercises = exercises.filter(ex => {
    // Difficulty filter
    if (difficultyFilter !== 'all' && ex.difficulty !== difficultyFilter) {
      return false;
    }
    // Favorites filter
    if (showFavoritesOnly && !favorites.includes(ex.name)) {
      return false;
    }
    // Safety filter - hide contraindicated exercises
    if (safetyFilterEnabled) {
      const safety = exerciseSafetyMap.get(ex.name);
      if (safety?.warningLevel === 'contraindicated') {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    // Sort favorites first
    const aFav = favorites.includes(a.name) ? 1 : 0;
    const bFav = favorites.includes(b.name) ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;

    // Then sort by safety (safest first)
    if (safetyFilterEnabled) {
      const aSafety = exerciseSafetyMap.get(a.name);
      const bSafety = exerciseSafetyMap.get(b.name);
      const safetyOrder = { none: 0, caution: 1, warning: 2, contraindicated: 3 };
      return (safetyOrder[aSafety?.warningLevel || 'none'] - safetyOrder[bSafety?.warningLevel || 'none']);
    }
    return 0;
  });

  const activeFilterCount = (difficultyFilter !== 'all' ? 1 : 0) + (showFavoritesOnly ? 1 : 0) + (safetyFilterEnabled ? 1 : 0);

  // Count exercises with warnings
  const warningCount = useMemo(() => {
    if (!safetyFilterEnabled) return 0;
    let count = 0;
    exerciseSafetyMap.forEach(safety => {
      if (safety.warningLevel === 'warning' || safety.warningLevel === 'caution') {
        count++;
      }
    });
    return count;
  }, [exerciseSafetyMap, safetyFilterEnabled]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Övningsbibliotek</h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 text-sm font-medium">
          <BookOpen size={16} className="text-primary-500"/>
          <span><strong>{EXERCISE_DATABASE.length}</strong> evidensbaserade rehabövningar med vetenskapliga källor</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8 sticky top-24 z-30">
        {/* Floating Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-white flex items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 focus-within:ring-2 focus-within:ring-primary-500/20">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full p-4 pl-14 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-lg font-medium rounded-2xl"
              placeholder="Sök specifikt (t.ex. 'hopparknä', 'tennisarmbåge')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          </div>
          <button
            onClick={() => setShowSafetyPanel(!showSafetyPanel)}
            className={`p-4 rounded-2xl transition-all relative ${
              showSafetyPanel || safetyFilterEnabled
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Säkerhetsfilter"
          >
            {safetyFilterEnabled ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            {safetyFilterEnabled && warningCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {warningCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl transition-all relative ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary-100 text-primary-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Visa filter"
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-4 rounded-2xl transition-all ${
              showFavoritesOnly
                ? 'bg-red-100 text-red-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={showFavoritesOnly ? 'Visa alla' : 'Visa favoriter'}
          >
            <Heart size={20} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              setActiveFilter(null);
              handleSearch(query);
            }}
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sök'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-lg animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">Filtrera resultat</span>
              <button
                onClick={() => {
                  setDifficultyFilter('all');
                  setShowFavoritesOnly(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Rensa alla
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Svårighetsgrad</label>
                <div className="flex gap-2">
                  {DIFFICULTY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setDifficultyFilter(level.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        difficultyFilter === level.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Filter Panel */}
        {showSafetyPanel && (
          <div className="mt-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4 shadow-lg animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">Protokoll-säkerhetsfilter</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">Aktivera</span>
                <input
                  type="checkbox"
                  checked={safetyFilterEnabled}
                  onChange={(e) => setSafetyFilterEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            {safetyFilterEnabled && (
              <div className="space-y-4">
                {/* Phase Selection */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Rehabiliteringsfas</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(phase => (
                      <button
                        key={phase}
                        onClick={() => setSafetyPhase(phase as 1 | 2 | 3)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          safetyPhase === phase
                            ? phase === 1 ? 'bg-red-500 text-white' :
                              phase === 2 ? 'bg-yellow-500 text-white' :
                                'bg-green-500 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Fas {phase}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post-Op Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPostOp}
                      onChange={(e) => setIsPostOp(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Postoperativ patient</span>
                  </label>
                </div>

                {/* Post-Op Details */}
                {isPostOp && (
                  <div className="space-y-3 p-3 bg-white/50 rounded-xl">
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">Operationstyp</label>
                      <select
                        value={surgeryType}
                        onChange={(e) => setSurgeryType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="">Välj operationstyp...</option>
                        {getAvailableProtocols().map(protocol => (
                          <option key={protocol} value={protocol}>{protocol}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">
                        Dagar sedan operation: <strong>{daysSinceSurgery}</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={daysSinceSurgery}
                        onChange={(e) => setDaysSinceSurgery(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Warning Summary */}
                {warningCount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-100 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700">
                      {warningCount} övningar med varningar visas
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories / Filters */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Filter size={12} /> Snabbfiltrera efter område
          </div>
          {activeFilter && (
            <button
              onClick={() => {
                setActiveFilter(null);
                handleSearch("Rehabövningar");
              }}
              className="text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-wide px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              Rensa filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 border flex items-center gap-2 ${
                activeFilter === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 transform -translate-y-0.5'
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-primary-200 hover:text-primary-700 hover:bg-white hover:shadow-md'
              }`}
            >
              {cat}
              {activeFilter === cat && <Sparkles size={14} className="animate-pulse text-white/70" />}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-100 overflow-hidden">
          <div className="p-4 border-b border-indigo-100/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Lightbulb size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  AI-Rekommendationer
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-semibold">
                    Personliga
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Baserat på din profil och tidigare träning</p>
              </div>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-slate-400"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => {
              const priorityStyles = {
                high: { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', icon: Zap, label: 'Hög prioritet' },
                medium: { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: Target, label: 'Medium' },
                low: { bg: 'bg-gradient-to-br from-slate-400 to-slate-500', icon: Activity, label: 'Komplement' }
              };
              const style = priorityStyles[rec.priority];
              const Icon = style.icon;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-white hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => handleSearch(rec.category)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${style.bg} shadow-lg`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{rec.category}</h4>
                      <span className="text-xs text-slate-400">{style.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{rec.reason}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {rec.suggestedExercises.slice(0, 2).map((ex, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium"
                      >
                        {ex}
                      </span>
                    ))}
                    {rec.suggestedExercises.length > 2 && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-lg font-medium">
                        +{rec.suggestedExercises.length - 2} till
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading recommendations */}
      {loadingRecommendations && !recommendations.length && (
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-3">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
          <span className="text-slate-600 font-medium">Analyserar din profil för personliga rekommendationer...</span>
        </div>
      )}

      {/* Favorites summary */}
      {favorites.length > 0 && !showFavoritesOnly && (
        <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Heart size={20} className="text-red-500" fill="currentColor" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Du har {favorites.length} favoritövningar</p>
                <p className="text-sm text-slate-500">Klicka på hjärtat för att visa endast favoriter</p>
              </div>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className="px-4 py-2 bg-white text-red-600 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors border border-red-100"
            >
              Visa favoriter
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <Loader2 className="relative z-10 w-16 h-16 animate-spin text-primary-600" />
          </div>
          <p className="text-xl text-slate-800 font-bold mb-2">
            {activeFilter ? `Hämtar övningar för ${activeFilter}...` : 'Söker i databasen...'}
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
            <Database size={14} /> Söker i databasen
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {searched && filteredExercises.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {showFavoritesOnly ? (
                  <Heart className="w-10 h-10 text-slate-300" />
                ) : (
                  <Dumbbell className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {showFavoritesOnly ? 'Inga favoriter ännu' : 'Inga träffar'}
              </h3>
              <p className="text-slate-500">
                {showFavoritesOnly
                  ? 'Klicka på hjärtat på en övning för att spara den som favorit.'
                  : `Vi hittade inget för "${query}". Försök med en annan term.`}
              </p>
              {showFavoritesOnly && (
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  Visa alla övningar
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {showFavoritesOnly ? 'Dina favoriter' : activeFilter ? `Kategori: ${activeFilter}` : 'Resultat'}
                  <span className="ml-3 bg-white border border-slate-200 text-slate-800 px-3 py-0.5 rounded-full text-xs shadow-sm">
                    {filteredExercises.length} träffar
                  </span>
                </h3>
                {difficultyFilter !== 'all' && (
                  <span className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                    <Star size={12} /> {difficultyFilter}
                    <button
                      onClick={() => setDifficultyFilter('all')}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {filteredExercises.map((ex, idx) => (
                  <div key={idx} className="relative">
                    {/* Favorite badge */}
                    {favorites.includes(ex.name) && (
                      <div className="absolute -top-2 -left-2 z-10 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                        <Heart size={14} fill="currentColor" />
                      </div>
                    )}
                    <ExerciseCard
                      exercise={ex}
                      readOnly={true}
                      onFavoriteToggle={() => toggleFavorite(ex.name)}
                      isFavorite={favorites.includes(ex.name)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
