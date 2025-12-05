
import React, { useMemo } from 'react';
import { ProgressHistory, Milestone } from '../types';
import { storageService } from '../services/storageService';
import { Calendar, TrendingUp, Award, Flame, Activity, Heart, Trophy, TrendingDown } from 'lucide-react';

interface ProgressDashboardProps {
  totalExercisesInRoutine: number; // To calculate percentages
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ totalExercisesInRoutine }) => {
  const history: ProgressHistory = storageService.getHistorySync();
  const painTrend = useMemo(() => storageService.getPainTrend(14), []); // Last 14 days
  const milestones: Milestone[] = useMemo(() => storageService.getMilestones(), []);

  // Calculate pain trend statistics
  const painStats = useMemo(() => {
    const validDays = painTrend.filter(d => d.avgPain > 0);
    if (validDays.length === 0) return { avg: 0, trend: 0, hasPainData: false };

    const avg = validDays.reduce((sum, d) => sum + d.avgPain, 0) / validDays.length;

    // Compare first week to second week (if enough data)
    const firstHalf = validDays.slice(0, Math.floor(validDays.length / 2));
    const secondHalf = validDays.slice(Math.floor(validDays.length / 2));

    const firstAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + d.avgPain, 0) / firstHalf.length
      : 0;
    const secondAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + d.avgPain, 0) / secondHalf.length
      : 0;

    const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return { avg: Math.round(avg * 10) / 10, trend: Math.round(trend), hasPainData: validDays.length >= 3 };
  }, [painTrend]);
  
  // Helpers
  const getDatesLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getCompletionPercentage = (date: string) => {
    const dayData = history[date];
    if (!dayData) return 0;
    const completedCount = Object.values(dayData).filter(v => v).length;
    // Prevent division by zero if routine is empty, default to 1 for calc
    const total = totalExercisesInRoutine || 1; 
    return Math.round((completedCount / total) * 100);
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    // Check last 365 days potentially, but break on first miss
    for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Skip today if empty (user might not have started yet), but don't break streak
        if (i === 0 && (!history[dateStr] || Object.values(history[dateStr]).filter(v=>v).length === 0)) {
            continue;
        }

        const dayData = history[dateStr];
        const hasActivity = dayData && Object.values(dayData).some(v => v);

        if (hasActivity) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  };

  const calculateTotalWorkouts = () => {
      return Object.keys(history).filter(date => {
          const dayData = history[date];
          return Object.values(dayData).some(v => v);
      }).length;
  };

  const last7Days = getDatesLast7Days();
  const streak = calculateStreak();
  const totalWorkouts = calculateTotalWorkouts();

  // Calendar generation (current month)
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i).toISOString().split('T')[0]);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dina Framsteg</h1>
        <p className="text-slate-500">Kontinuitet är nyckeln till rehabilitering.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <Flame size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Nuvarande Svit</p>
                <h3 className="text-2xl font-bold text-slate-900">{streak} <span className="text-sm font-normal text-slate-400">dagar</span></h3>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Activity size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Totalt antal pass</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalWorkouts} <span className="text-sm font-normal text-slate-400">pass</span></h3>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <Award size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Senaste veckan</p>
                <h3 className="text-2xl font-bold text-slate-900">
                    {Math.round(last7Days.reduce((acc, date) => acc + getCompletionPercentage(date), 0) / 7)}%
                </h3>
            </div>
        </div>

        {/* Pain Trend Stat (Fas 6) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              painStats.trend < 0 ? 'bg-green-100 text-green-600' :
              painStats.trend > 0 ? 'bg-red-100 text-red-600' :
              'bg-slate-100 text-slate-600'
            }`}>
                {painStats.trend <= 0 ? <TrendingDown size={24} /> : <Heart size={24} />}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Smärttrend</p>
                {painStats.hasPainData ? (
                  <h3 className={`text-2xl font-bold ${
                    painStats.trend < 0 ? 'text-green-600' :
                    painStats.trend > 0 ? 'text-red-600' :
                    'text-slate-900'
                  }`}>
                    {painStats.trend > 0 ? '+' : ''}{painStats.trend}%
                  </h3>
                ) : (
                  <h3 className="text-sm text-slate-400">Logga smärta för data</h3>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-500"/>
                Veckoöversikt
            </h3>
            
            <div className="flex items-end justify-between h-48 gap-2">
                {last7Days.map((date, index) => {
                    const pct = getCompletionPercentage(date);
                    const dayLabel = new Date(date).toLocaleDateString('sv-SE', { weekday: 'short' });
                    
                    return (
                        <div key={date} className="flex-1 flex flex-col items-center group">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div 
                                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out relative group-hover:opacity-90 ${
                                        pct === 100 ? 'bg-green-500' : 
                                        pct > 50 ? 'bg-primary-500' : 
                                        pct > 0 ? 'bg-primary-300' : 'bg-slate-100'
                                    }`}
                                    style={{ height: pct === 0 ? '4px' : `${pct}%` }}
                                >
                                    {pct > 0 && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {pct}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-400 mt-3 uppercase">{dayLabel}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-primary-500"/>
                {monthNames[new Date().getMonth()]}
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dateStr, idx) => {
                    if (!dateStr) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    
                    const pct = getCompletionPercentage(dateStr);
                    const dayNum = parseInt(dateStr.split('-')[2]);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div 
                            key={dateStr}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium border relative transition-all
                                ${isToday ? 'border-primary-500 ring-1 ring-primary-500' : 'border-transparent'}
                                ${pct === 100 ? 'bg-green-100 text-green-800' : 
                                  pct > 0 ? 'bg-blue-50 text-blue-800' : 
                                  'bg-slate-50 text-slate-400'}
                            `}
                            title={`${dateStr}: ${pct}% avklarat`}
                        >
                            {dayNum}
                            {pct > 0 && (
                                <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Pain Trend Chart (Fas 6) */}
      {painStats.hasPainData && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Heart size={18} className="text-red-500" />
            Smärttrend (senaste 14 dagarna)
          </h3>

          <div className="flex items-end justify-between h-48 gap-1">
            {painTrend.map((day, index) => {
              const maxPain = 10;
              const barHeight = day.avgPain > 0 ? (day.avgPain / maxPain) * 100 : 0;
              const dayLabel = new Date(day.date).toLocaleDateString('sv-SE', { day: 'numeric' });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${
                        day.avgPain === 0 ? 'bg-slate-100' :
                        day.avgPain <= 3 ? 'bg-green-400' :
                        day.avgPain <= 6 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ height: barHeight === 0 ? '2px' : `${barHeight}%` }}
                    >
                      {day.avgPain > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {day.avgPain}/10
                          {day.prePain !== undefined && day.postPain !== undefined && (
                            <span className="block text-[10px] text-slate-300">
                              Pre: {day.prePain} → Post: {day.postPain}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {index % 2 === 0 && (
                    <span className="text-[10px] font-medium text-slate-400 mt-2">{dayLabel}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-400"></div>
              <span className="text-slate-500">0-3 Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span className="text-slate-500">4-6 Måttlig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span className="text-slate-500">7-10 Svår</span>
            </div>
          </div>
        </div>
      )}

      {/* Milestones/Achievements Section (Fas 6) */}
      {milestones.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Dina Milstolpar
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{milestone.icon}</div>
                <h4 className="font-bold text-slate-800 text-sm">{milestone.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(milestone.achievedAt).toLocaleDateString('sv-SE')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for pain tracking */}
      {!painStats.hasPainData && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 mt-8 text-center">
          <Heart size={48} className="text-cyan-400 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-lg mb-2">Börja logga din smärta</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Genom att logga hur du mår före och efter varje träningspass får du värdefull
            insikt i hur din rehabilitering fortskrider.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
