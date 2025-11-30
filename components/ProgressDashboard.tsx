
import React from 'react';
import { ProgressHistory } from '../types';
import { storageService } from '../services/storageService';
import { Calendar, TrendingUp, Award, Flame, Activity } from 'lucide-react';

interface ProgressDashboardProps {
  totalExercisesInRoutine: number; // To calculate percentages
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ totalExercisesInRoutine }) => {
  const history: ProgressHistory = storageService.getHistorySync();
  
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    </div>
  );
};

export default ProgressDashboard;
