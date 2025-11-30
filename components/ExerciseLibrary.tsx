import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { searchExercises } from '../services/geminiService';
import ExerciseCard from './ExerciseCard';
import { Search, Loader2, Dumbbell, Filter, Globe2, Sparkles } from 'lucide-react';

const CATEGORIES = [
  "Ländrygg", "Nacke", "Axlar", "Knä", "Fotled", "Höft", "Bålstabilitet", "Hållning"
];

const ExerciseLibrary: React.FC = () => {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleSearch = async (term: string) => {
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchExercises(term);
      setExercises(results);
    } catch (e) {
      console.error(e);
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
    handleSearch(`Bästa evidensbaserade rehabövningar för ${cat}`);
  };

  useEffect(() => {
    handleSearch("Vanliga rehabövningar");
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Globalt Övningsbibliotek</h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 text-sm font-medium">
            <Globe2 size={16} className="text-primary-500"/>
            <span>Tillgång till <strong>10 000+</strong> kliniskt granskade övningar via AI.</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12 sticky top-24 z-30">
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
            <Globe2 size={14} /> Analyserar kliniska riktlinjer
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {searched && exercises.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Inga träffar</h3>
                <p className="text-slate-500">Vi hittade inget för "{query}". Försök med en annan term.</p>
            </div>
          ) : (
            <>
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {activeFilter ? `Kategori: ${activeFilter}` : 'Resultat'} 
                        <span className="ml-3 bg-white border border-slate-200 text-slate-800 px-3 py-0.5 rounded-full text-xs shadow-sm">
                            {exercises.length} träffar
                        </span>
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {exercises.map((ex, idx) => (
                    <ExerciseCard 
                    key={idx} 
                    exercise={ex} 
                    readOnly={true}
                    />
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