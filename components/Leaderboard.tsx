/**
 * Leaderboard Component
 *
 * Visar anonymiserad ranking för user engagement.
 * Features:
 * - Vecko/månads/all-time filter
 * - "Din position" highlight
 * - Animerad rank-förändring
 * - Privacy toggle för deltagande
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import {
  getLeaderboard,
  getUserPoints,
  getUserLevel,
  LeaderboardEntry
} from '../services/gamificationService';

interface LeaderboardProps {
  /** Callback to close if in modal */
  onClose?: () => void;
  /** Compact mode for embedding */
  compact?: boolean;
}

type TimeFilter = 'week' | 'month' | 'allTime';

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, compact = false }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [isParticipating, setIsParticipating] = useState(true);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Get leaderboard data
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const userPoints = useMemo(() => getUserPoints(), []);
  const userLevel = useMemo(() => getUserLevel(), []);

  // Find user's position
  const userEntry = useMemo(() => {
    return leaderboard.find(e => e.isCurrentUser);
  }, [leaderboard]);

  // Filter and sort based on timeframe (mock - same data for now)
  const filteredLeaderboard = useMemo(() => {
    // In real implementation, this would filter by time period
    return leaderboard;
  }, [leaderboard, timeFilter]);

  // Get rank medal/icon
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <Crown size={20} className="text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md">
            <Medal size={20} className="text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-md">
            <Award size={20} className="text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-600">{rank}</span>
          </div>
        );
    }
  };

  // Get level icon
  const getLevelIcon = (level: number) => {
    const icons = ['🌱', '🏃', '💪', '🎯', '⭐', '🏆', '👑', '🥇', '🌟', '💎'];
    return icons[Math.min(level - 1, icons.length - 1)];
  };

  // Mock rank change (would be stored in real implementation)
  const getRankChange = (entry: LeaderboardEntry): 'up' | 'down' | 'same' => {
    if (entry.isCurrentUser) return 'same';
    // Random for demo
    const changes: Array<'up' | 'down' | 'same'> = ['up', 'down', 'same', 'same', 'same'];
    return changes[entry.rank % changes.length];
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        {/* Compact header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Trophy size={18} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800">Topplista</h3>
          </div>
          <span className="text-xs text-slate-500">Top 5</span>
        </div>

        {/* Compact list */}
        <div className="space-y-2">
          {filteredLeaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-2 rounded-xl ${
                entry.isCurrentUser ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-slate-50'
              }`}
            >
              <span className="w-6 text-center font-bold text-slate-500">{entry.rank}</span>
              <span className="text-lg">{getLevelIcon(entry.level)}</span>
              <span className={`flex-1 font-medium truncate ${
                entry.isCurrentUser ? 'text-cyan-700' : 'text-slate-700'
              }`}>
                {entry.name}
              </span>
              <span className="text-sm font-bold text-slate-600">{entry.points}</span>
            </div>
          ))}
        </div>

        {/* User position if not in top 5 */}
        {userEntry && userEntry.rank > 5 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 bg-cyan-50 rounded-xl border border-cyan-200">
              <span className="w-6 text-center font-bold text-cyan-600">{userEntry.rank}</span>
              <span className="text-lg">{getLevelIcon(userEntry.level)}</span>
              <span className="flex-1 font-medium text-cyan-700">Du</span>
              <span className="text-sm font-bold text-cyan-600">{userEntry.points}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>

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
              <h1 className="text-2xl font-bold">Topplista</h1>
              <p className="text-white/80 text-sm">Se hur du står dig mot andra</p>
            </div>
          </div>

          {/* User's position card */}
          {userEntry && isParticipating && (
            <div className="mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">#{userEntry.rank}</div>
                  <p className="text-xs text-white/70">Din position</p>
                </div>
                <div className="flex-1 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{userLevel.icon}</span>
                    <div>
                      <div className="font-bold">{userLevel.name}</div>
                      <div className="text-sm text-white/70">{userPoints.total} poäng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time filter */}
          <div className="flex gap-2 mt-4">
            {[
              { value: 'week' as TimeFilter, label: 'Denna vecka' },
              { value: 'month' as TimeFilter, label: 'Denna månad' },
              { value: 'allTime' as TimeFilter, label: 'All tid' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  timeFilter === filter.value
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isParticipating ? (
              <Eye size={18} className="text-green-500" />
            ) : (
              <EyeOff size={18} className="text-slate-400" />
            )}
            <span className="text-sm text-slate-600">
              {isParticipating ? 'Du deltar i topplistan' : 'Du är dold från topplistan'}
            </span>
            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <Info size={14} />
            </button>
          </div>
          <button
            onClick={() => setIsParticipating(!isParticipating)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isParticipating ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              isParticipating ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {showPrivacyInfo && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <p>
              Din identitet visas endast som ett anonymt användarnamn.
              Om du väljer att inte delta syns du inte för andra användare.
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="px-6 py-6">
        {/* Top 3 podium */}
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd place */}
          {filteredLeaderboard[1] && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg">
                <span className="text-3xl">{getLevelIcon(filteredLeaderboard[1].level)}</span>
              </div>
              <div className="text-sm font-bold text-slate-700 truncate max-w-20">
                {filteredLeaderboard[1].name}
              </div>
              <div className="text-xs text-slate-500">{filteredLeaderboard[1].points} p</div>
              <div className="mt-2 w-16 h-16 mx-auto bg-gradient-to-t from-slate-300 to-slate-200 rounded-t-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-600">2</span>
              </div>
            </div>
          )}

          {/* 1st place */}
          {filteredLeaderboard[0] && (
            <div className="text-center -mt-4">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Sparkles size={20} className="text-amber-400 animate-pulse" />
              </div>
              <div className="w-24 h-24 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-xl ring-4 ring-amber-200">
                <span className="text-4xl">{getLevelIcon(filteredLeaderboard[0].level)}</span>
              </div>
              <div className="text-sm font-bold text-slate-800 truncate max-w-24">
                {filteredLeaderboard[0].name}
              </div>
              <div className="text-xs text-amber-600 font-medium">{filteredLeaderboard[0].points} p</div>
              <div className="mt-2 w-20 h-20 mx-auto bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-xl flex items-center justify-center">
                <Crown size={28} className="text-amber-700" />
              </div>
            </div>
          )}

          {/* 3rd place */}
          {filteredLeaderboard[2] && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
                <span className="text-3xl">{getLevelIcon(filteredLeaderboard[2].level)}</span>
              </div>
              <div className="text-sm font-bold text-slate-700 truncate max-w-20">
                {filteredLeaderboard[2].name}
              </div>
              <div className="text-xs text-slate-500">{filteredLeaderboard[2].points} p</div>
              <div className="mt-2 w-16 h-12 mx-auto bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-200">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Rest of list */}
        <div className="space-y-3">
          {filteredLeaderboard.slice(3).map((entry) => {
            const rankChange = getRankChange(entry);

            return (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 shadow-md'
                    : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Rank */}
                {getRankDisplay(entry.rank)}

                {/* Rank change indicator */}
                <div className="w-6">
                  {rankChange === 'up' && (
                    <ChevronUp size={18} className="text-green-500" />
                  )}
                  {rankChange === 'down' && (
                    <ChevronDown size={18} className="text-red-500" />
                  )}
                  {rankChange === 'same' && (
                    <Minus size={18} className="text-slate-300" />
                  )}
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getLevelIcon(entry.level)}</span>
                    <span className={`font-bold ${
                      entry.isCurrentUser ? 'text-cyan-700' : 'text-slate-800'
                    }`}>
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="px-2 py-0.5 bg-cyan-200 text-cyan-800 text-xs font-medium rounded-full">
                        Du
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">Nivå {entry.level}</p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    entry.isCurrentUser ? 'text-cyan-600' : 'text-slate-800'
                  }`}>
                    {entry.points.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500">poäng</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div className="mt-8 p-4 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Users size={18} className="text-slate-400" />
            <span>{filteredLeaderboard.length} deltagare totalt</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Topplistan uppdateras automatiskt baserat på dina träningsframsteg.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
