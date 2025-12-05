
import React, { useMemo, useState } from 'react';
import { Milestone, MilestoneType } from '../types';
import { storageService } from '../services/storageService';
import {
  getUserPoints,
  getUserLevel,
  getRewardStats,
  getAllRewards,
} from '../services/gamificationService';
import { Trophy, Flame, Star, Target, Award, Medal, Crown, Heart, Calendar, TrendingDown, CheckCircle2, Lock, Sparkles, X, Gift, TrendingUp } from 'lucide-react';

interface AchievementsProps {
  onClose?: () => void;
}

// Badge definitions with metadata
const BADGE_DEFINITIONS: Record<MilestoneType, {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  requirement: string;
}> = {
  first_workout: {
    title: 'Första steget',
    description: 'Du slutförde din första träning!',
    icon: Star,
    color: 'text-amber-500',
    bgGradient: 'from-amber-400 to-orange-500',
    requirement: 'Slutför din första träning'
  },
  streak_3: {
    title: '3-dagars streak',
    description: 'Du har tränat 3 dagar i rad!',
    icon: Flame,
    color: 'text-orange-500',
    bgGradient: 'from-orange-400 to-red-500',
    requirement: 'Träna 3 dagar i rad'
  },
  streak_7: {
    title: 'Vecko-mästare',
    description: 'En hel vecka med konsekvent träning!',
    icon: Trophy,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-400 to-amber-500',
    requirement: 'Träna 7 dagar i rad'
  },
  streak_14: {
    title: 'Två veckor stark',
    description: '14 dagar av engagemang!',
    icon: Medal,
    color: 'text-blue-500',
    bgGradient: 'from-blue-400 to-indigo-500',
    requirement: 'Träna 14 dagar i rad'
  },
  streak_30: {
    title: 'Månadens hjälte',
    description: 'En hel månads uthållighet!',
    icon: Crown,
    color: 'text-purple-500',
    bgGradient: 'from-purple-400 to-pink-500',
    requirement: 'Träna 30 dagar i rad'
  },
  week_complete: {
    title: 'Vecka avklarad',
    description: 'Du slutförde alla övningar för en vecka!',
    icon: Calendar,
    color: 'text-green-500',
    bgGradient: 'from-green-400 to-emerald-500',
    requirement: 'Slutför alla övningar under en vecka'
  },
  month_complete: {
    title: 'Månads-champion',
    description: 'En hel månad med fullständig träning!',
    icon: Award,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-400 to-violet-500',
    requirement: 'Slutför alla övningar under en månad'
  },
  phase_complete: {
    title: 'Fas avklarad',
    description: 'Du har gått vidare till nästa rehabiliteringsfas!',
    icon: Target,
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-400 to-teal-500',
    requirement: 'Slutför en hel rehabiliteringsfas'
  },
  pain_reduction_25: {
    title: 'Smärtlindring 25%',
    description: 'Din smärta har minskat med 25%!',
    icon: TrendingDown,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-400 to-green-500',
    requirement: 'Minska din genomsnittliga smärta med 25%'
  },
  pain_reduction_50: {
    title: 'Halvvägs dit!',
    description: 'Din smärta har halverats!',
    icon: Heart,
    color: 'text-rose-500',
    bgGradient: 'from-rose-400 to-pink-500',
    requirement: 'Minska din genomsnittliga smärta med 50%'
  }
};

const ALL_BADGE_TYPES: MilestoneType[] = [
  'first_workout',
  'streak_3',
  'streak_7',
  'streak_14',
  'streak_30',
  'week_complete',
  'month_complete',
  'phase_complete',
  'pain_reduction_25',
  'pain_reduction_50'
];

const Achievements: React.FC<AchievementsProps> = ({ onClose }) => {
  const [selectedBadge, setSelectedBadge] = useState<MilestoneType | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'points'>('badges');

  const milestones = useMemo(() => {
    return storageService.getMilestones();
  }, []);

  const unlockedTypes = useMemo(() => {
    return new Set(milestones.map(m => m.type));
  }, [milestones]);

  const stats = useMemo(() => {
    const total = ALL_BADGE_TYPES.length;
    const unlocked = unlockedTypes.size;
    const percentage = Math.round((unlocked / total) * 100);
    return { total, unlocked, percentage };
  }, [unlockedTypes]);

  // Gamification data
  const userPoints = useMemo(() => getUserPoints(), []);
  const userLevel = useMemo(() => getUserLevel(), []);
  const rewardStats = useMemo(() => getRewardStats(), []);
  const allRewards = useMemo(() => getAllRewards(), []);

  const getMilestoneForType = (type: MilestoneType): Milestone | undefined => {
    return milestones.find(m => m.type === type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bS0xMCAwYzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00em0yMCAwYzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Trophy size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Prestationer</h1>
              <p className="text-white/80 text-sm">Dina framsteg och milstolpar</p>
            </div>
          </div>

          {/* Level & Points Summary */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{userLevel.icon}</span>
                <span className="font-bold">Nivå {userLevel.level}</span>
              </div>
              <p className="text-xs text-white/70">{userLevel.name}</p>
              <div className="h-1.5 bg-white/20 rounded-full mt-2">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${userLevel.progress}%` }}
                />
              </div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold">{userPoints.total}</div>
              <p className="text-xs text-white/70">Poäng totalt</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'badges'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Trophy size={16} className="inline mr-2" />
              Badges ({stats.unlocked}/{stats.total})
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'points'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Gift size={16} className="inline mr-2" />
              Poäng ({rewardStats.totalRewards})
            </button>
          </div>
        </div>
      </div>

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="px-6 py-8">
          {/* Points Breakdown */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Poängfördelning
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(userPoints.breakdown).map(([key, value]) => (
                <div key={key} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-2xl font-bold text-slate-800">{value}</div>
                  <p className="text-sm text-slate-500 capitalize">
                    {key === 'exercises' && 'Övningar'}
                    {key === 'streaks' && 'Streaks'}
                    {key === 'milestones' && 'Milstolpar'}
                    {key === 'challenges' && 'Utmaningar'}
                    {key === 'consistency' && 'Konsistens'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reward History */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Gift size={20} className="text-purple-500" />
              Intjänade belöningar
            </h2>
            {allRewards.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl">
                <p className="text-slate-500">Inga belöningar ännu. Fortsätt träna!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allRewards.slice(0, 10).map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      reward.type === 'milestone' ? 'bg-amber-100' :
                      reward.type === 'streak' ? 'bg-orange-100' :
                      reward.type === 'challenge' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {reward.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm">{reward.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">+{reward.points}</span>
                      <p className="text-xs text-slate-400">poäng</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level Perks */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star size={20} className="text-amber-500" />
              Dina förmåner (Nivå {userLevel.level})
            </h2>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <ul className="space-y-2">
                {userLevel.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-amber-800">
                    <CheckCircle2 size={16} className="text-amber-500" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Badge Grid */}
      {activeTab === 'badges' && (
      <div className="px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALL_BADGE_TYPES.map((type) => {
            const def = BADGE_DEFINITIONS[type];
            const isUnlocked = unlockedTypes.has(type);
            const milestone = getMilestoneForType(type);
            const Icon = def.icon;

            return (
              <button
                key={type}
                onClick={() => setSelectedBadge(type)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-center group ${
                  isUnlocked
                    ? 'bg-white border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-slate-300'
                    : 'bg-slate-50/50 border-slate-100 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Badge Icon */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center relative ${
                  isUnlocked
                    ? `bg-gradient-to-br ${def.bgGradient} shadow-lg`
                    : 'bg-slate-200'
                }`}>
                  {isUnlocked ? (
                    <Icon size={28} className="text-white drop-shadow-md" />
                  ) : (
                    <Lock size={24} className="text-slate-400" />
                  )}

                  {/* Sparkle effect for unlocked */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Badge Title */}
                <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {def.title}
                </h3>

                {/* Unlock Date */}
                {isUnlocked && milestone && (
                  <p className="text-xs text-slate-400">
                    {new Date(milestone.achievedAt).toLocaleDateString('sv-SE')}
                  </p>
                )}

                {!isUnlocked && (
                  <p className="text-xs text-slate-400 line-clamp-2">{def.requirement}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Recent Achievements Section */}
        {milestones.length > 0 && (
          <div className="px-6 pb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" />
              Senaste prestationer
            </h2>
            <div className="space-y-3">
              {milestones.slice(-5).reverse().map((milestone) => {
                const def = BADGE_DEFINITIONS[milestone.type];
                const Icon = def.icon;

                return (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${def.bgGradient} flex items-center justify-center shadow-md`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm">{def.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{def.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(milestone.achievedAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="px-6 pb-8 text-center">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Trophy size={36} className="text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Inga badges ännu</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Börja träna för att låsa upp din första prestation! Varje steg på din rehabiliteringsresa belönas.
              </p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const def = BADGE_DEFINITIONS[selectedBadge];
              const isUnlocked = unlockedTypes.has(selectedBadge);
              const milestone = getMilestoneForType(selectedBadge);
              const Icon = def.icon;

              return (
                <>
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center ${
                    isUnlocked
                      ? `bg-gradient-to-br ${def.bgGradient} shadow-xl`
                      : 'bg-slate-200'
                  }`}>
                    {isUnlocked ? (
                      <Icon size={48} className="text-white drop-shadow-lg" />
                    ) : (
                      <Lock size={36} className="text-slate-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                    {def.title}
                  </h3>

                  <p className="text-center text-slate-600 mb-4">
                    {isUnlocked ? def.description : def.requirement}
                  </p>

                  {isUnlocked && milestone && (
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100 mb-4">
                      <span className="text-sm text-green-700 font-medium">
                        Upplåst {new Date(milestone.achievedAt).toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <span className="text-sm text-slate-500">
                        Fortsätt träna för att låsa upp!
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Stäng
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
