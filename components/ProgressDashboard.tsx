
import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { ProgressHistory, Milestone } from '../types';
import { storageService } from '../services/storageService';
import { Calendar, TrendingUp, Award, Flame, Activity, Heart, Trophy, TrendingDown, Sparkles, Target, Zap } from 'lucide-react';
import { GlassCard, Badge, tokens, transitions } from './ui';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};

interface ProgressDashboardProps {
  totalExercisesInRoutine: number;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ totalExercisesInRoutine }) => {
  const history: ProgressHistory = storageService.getHistorySync();
  const painTrend = useMemo(() => storageService.getPainTrend(14), []);
  const milestones: Milestone[] = useMemo(() => storageService.getMilestones(), []);

  // Calculate pain trend statistics
  const painStats = useMemo(() => {
    const validDays = painTrend.filter(d => d.avgPain > 0);
    if (validDays.length === 0) return { avg: 0, trend: 0, hasPainData: false };

    const avg = validDays.reduce((sum, d) => sum + d.avgPain, 0) / validDays.length;
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
    const total = totalExercisesInRoutine || 1;
    return Math.round((completedCount / total) * 100);
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      if (i === 0 && (!history[dateStr] || Object.values(history[dateStr]).filter(v => v).length === 0)) {
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
  const weeklyAverage = Math.round(last7Days.reduce((acc, date) => acc + getCompletionPercentage(date), 0) / 7);

  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i).toISOString().split('T')[0]);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];

  // Stat card configuration
  const statCards = [
    {
      icon: Flame,
      label: "Nuvarande Svit",
      value: streak,
      suffix: "dagar",
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-gradient-to-br from-orange-100 to-amber-100",
      iconColor: "text-orange-600"
    },
    {
      icon: Activity,
      label: "Totalt antal pass",
      value: totalWorkouts,
      suffix: "pass",
      gradient: "from-primary-500 to-indigo-500",
      bg: "bg-gradient-to-br from-primary-100 to-indigo-100",
      iconColor: "text-primary-600"
    },
    {
      icon: Award,
      label: "Senaste veckan",
      value: weeklyAverage,
      suffix: "%",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: painStats.trend <= 0 ? TrendingDown : Heart,
      label: "Smärttrend",
      value: painStats.hasPainData ? `${painStats.trend > 0 ? '+' : ''}${painStats.trend}` : '--',
      suffix: painStats.hasPainData ? "%" : "",
      gradient: painStats.trend < 0 ? "from-green-500 to-emerald-500" :
                painStats.trend > 0 ? "from-red-500 to-rose-500" :
                "from-slate-400 to-slate-500",
      bg: painStats.trend < 0 ? "bg-gradient-to-br from-green-100 to-emerald-100" :
          painStats.trend > 0 ? "bg-gradient-to-br from-red-100 to-rose-100" :
          "bg-gradient-to-br from-slate-100 to-slate-50",
      iconColor: painStats.trend < 0 ? "text-green-600" :
                 painStats.trend > 0 ? "text-red-600" : "text-slate-600"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 -left-64 w-[500px] h-[500px] bg-gradient-to-br from-primary-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-64 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-cyan-100 rounded-full mb-4"
        >
          <Sparkles size={16} className="text-primary-600" />
          <span className="text-sm font-bold text-primary-700">Dina framsteg</span>
        </motion.div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Framstegsdashboard
        </h1>
        <p className="text-slate-500 text-lg">Kontinuitet är nyckeln till rehabilitering</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group"
          >
            <GlassCard className="p-6 relative overflow-hidden" hover={false}>
              {/* Gradient Glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity`} />

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`p-3 rounded-2xl ${stat.bg} ${stat.iconColor} shadow-sm`}
                >
                  <stat.icon size={24} />
                </motion.div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={stat.value}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-extrabold text-slate-900"
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-sm font-medium text-slate-400">{stat.suffix}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Weekly Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 lg:p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp size={18} className="text-primary-600" />
              </div>
              Veckoöversikt
            </h3>

            <div className="flex items-end justify-between h-48 gap-2">
              {last7Days.map((date, index) => {
                const pct = getCompletionPercentage(date);
                const dayLabel = new Date(date).toLocaleDateString('sv-SE', { weekday: 'short' });

                return (
                  <motion.div
                    key={date}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full flex items-end justify-center h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: pct === 0 ? '4px' : `${pct}%` }}
                        transition={{ duration: 0.8, delay: index * 0.08, ease: 'easeOut' }}
                        className={`w-full max-w-[40px] rounded-t-xl relative group-hover:opacity-90 transition-all ${
                          pct === 100 ? 'bg-gradient-to-t from-emerald-500 to-green-400 shadow-lg shadow-emerald-500/30' :
                          pct > 50 ? 'bg-gradient-to-t from-primary-500 to-primary-400 shadow-lg shadow-primary-500/20' :
                          pct > 0 ? 'bg-gradient-to-t from-primary-300 to-primary-200' :
                          'bg-slate-100'
                        }`}
                      >
                        {pct > 0 && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            {pct}%
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                          </div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-3 uppercase">{dayLabel}</span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Calendar View */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 lg:p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Calendar size={18} className="text-cyan-600" />
              </div>
              {monthNames[new Date().getMonth()]}
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="aspect-square" />;

                const pct = getCompletionPercentage(dateStr);
                const dayNum = parseInt(dateStr.split('-')[2]);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold relative cursor-default transition-all ${
                      isToday ? 'ring-2 ring-primary-500 ring-offset-1' : ''
                    } ${
                      pct === 100 ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm' :
                      pct > 0 ? 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700' :
                      'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                    title={`${dateStr}: ${pct}% avklarat`}
                  >
                    {dayNum}
                    {pct > 0 && pct < 100 && (
                      <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Pain Trend Chart */}
      {painStats.hasPainData && (
        <motion.div variants={itemVariants} className="mt-6 relative z-10">
          <GlassCard className="p-6 lg:p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart size={18} className="text-red-500" />
              </div>
              Smärttrend (senaste 14 dagarna)
              {painStats.trend < 0 && (
                <Badge variant="success" size="sm" className="ml-auto">Förbättring</Badge>
              )}
            </h3>

            <div className="flex items-end justify-between h-48 gap-1">
              {painTrend.map((day, index) => {
                const maxPain = 10;
                const barHeight = day.avgPain > 0 ? (day.avgPain / maxPain) * 100 : 0;
                const dayLabel = new Date(day.date).toLocaleDateString('sv-SE', { day: 'numeric' });

                return (
                  <motion.div
                    key={day.date}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: index * 0.03 }}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full flex items-end justify-center h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barHeight === 0 ? '2px' : `${barHeight}%` }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className={`w-full max-w-[20px] rounded-t-md ${
                          day.avgPain === 0 ? 'bg-slate-100' :
                          day.avgPain <= 3 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                          day.avgPain <= 6 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-t from-red-500 to-red-400'
                        }`}
                      >
                        {day.avgPain > 0 && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1.5 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            <span className="font-bold">{day.avgPain}/10</span>
                            {day.prePain !== undefined && day.postPain !== undefined && (
                              <div className="text-[10px] text-slate-300 mt-0.5">
                                {day.prePain} → {day.postPain}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </div>
                    {index % 2 === 0 && (
                      <span className="text-[10px] font-medium text-slate-400 mt-2">{dayLabel}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-green-400" />
                <span className="text-slate-500 font-medium">0-3 Mild</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-yellow-500 to-yellow-400" />
                <span className="text-slate-500 font-medium">4-6 Måttlig</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-red-400" />
                <span className="text-slate-500 font-medium">7-10 Svår</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6 relative z-10">
          <GlassCard className="p-6 lg:p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy size={18} className="text-yellow-600" />
              </div>
              Dina Milstolpar
              <Badge variant="primary" size="sm" className="ml-auto">{milestones.length} uppnådda</Badge>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="p-4 bg-gradient-to-br from-slate-50 via-white to-primary-50/30 rounded-xl border border-slate-200/80 text-center hover:shadow-lg hover:border-primary-200 transition-all cursor-default"
                >
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="text-4xl mb-3"
                  >
                    {milestone.icon}
                  </motion.div>
                  <h4 className="font-bold text-slate-800 text-sm">{milestone.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {new Date(milestone.achievedAt).toLocaleDateString('sv-SE')}
                  </p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Empty state for pain tracking */}
      {!painStats.hasPainData && (
        <motion.div variants={itemVariants} className="mt-6 relative z-10">
          <GlassCard className="p-8 text-center bg-gradient-to-br from-cyan-50/50 to-primary-50/50" glow="primary">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart size={56} className="text-cyan-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="font-bold text-slate-800 text-xl mb-2">Börja logga din smärta</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Genom att logga hur du mår före och efter varje träningspass får du värdefull
              insikt i hur din rehabilitering fortskrider.
            </p>
            <div className="mt-6 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Zap size={16} className="text-primary-500" />
                <span>Spåra framsteg</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Target size={16} className="text-primary-500" />
                <span>Se trender</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressDashboard;
