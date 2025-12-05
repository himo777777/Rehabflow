/**
 * Workout Calendar Component
 *
 * Kalendervy för att schemalägga och hantera träningspass.
 * Features:
 * - Månads/veckovisning
 * - Drag & drop (future)
 * - Quick add workout
 * - Recurring schedule support
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Dumbbell,
  Check,
  X,
  MoreHorizontal,
  Repeat,
  Bell,
  Trash2,
  Edit3,
  CalendarDays,
  List,
  TrendingUp
} from 'lucide-react';
import {
  scheduleService,
  ScheduledWorkout,
  WorkoutColor,
  WORKOUT_COLORS,
  getWorkoutStats
} from '../services/scheduleService';

interface WorkoutCalendarProps {
  onClose?: () => void;
}

type ViewMode = 'month' | 'week' | 'list';

const WEEKDAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    title: 'Träningspass',
    time: '09:00',
    duration: 30,
    recurring: 'none' as 'none' | 'daily' | 'weekly' | 'custom',
    recurringDays: [] as number[],
    reminder: true,
    reminderMinutes: 30,
    color: 'blue' as WorkoutColor,
    notes: ''
  });

  // Get calendar data
  const calendarData = useMemo(() => {
    return scheduleService.getMonthCalendarData(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
  }, [currentDate]);

  // Get stats
  const stats = useMemo(() => getWorkoutStats(30), []);

  // Get upcoming workouts
  const upcomingWorkouts = useMemo(() => {
    return scheduleService.getUpcomingWorkouts(5);
  }, []);

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const grid: Array<{ date: string | null; day: number | null; isToday: boolean }> = [];
    const today = new Date().toISOString().split('T')[0];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      grid.push({ date: null, day: null, isToday: false });
    }

    // Add days of month
    for (let day = 1; day <= totalDays; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ date, day, isToday: date === today });
    }

    return grid;
  }, [currentDate]);

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Color classes
  const getColorClass = (color: WorkoutColor) => {
    const colorMap: Record<WorkoutColor, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      cyan: 'bg-cyan-500'
    };
    return colorMap[color] || 'bg-blue-500';
  };

  // Handle add workout
  const handleAddWorkout = () => {
    if (!selectedDate) return;

    scheduleService.scheduleWorkout({
      date: selectedDate,
      time: formData.time,
      title: formData.title,
      exercises: [],
      duration: formData.duration,
      recurring: formData.recurring,
      recurringDays: formData.recurringDays,
      reminder: formData.reminder,
      reminderMinutes: formData.reminderMinutes,
      color: formData.color,
      notes: formData.notes
    });

    setShowAddModal(false);
    resetForm();
  };

  // Handle edit workout
  const handleEditWorkout = () => {
    if (!editingWorkout) return;

    scheduleService.updateWorkout(editingWorkout.id, {
      title: formData.title,
      time: formData.time,
      duration: formData.duration,
      recurring: formData.recurring,
      recurringDays: formData.recurringDays,
      reminder: formData.reminder,
      reminderMinutes: formData.reminderMinutes,
      color: formData.color,
      notes: formData.notes
    });

    setEditingWorkout(null);
    resetForm();
  };

  // Handle delete workout
  const handleDeleteWorkout = (id: string) => {
    scheduleService.deleteWorkout(id);
    setEditingWorkout(null);
  };

  // Handle complete workout
  const handleCompleteWorkout = (id: string) => {
    scheduleService.completeWorkout(id);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: 'Träningspass',
      time: '09:00',
      duration: 30,
      recurring: 'none',
      recurringDays: [],
      reminder: true,
      reminderMinutes: 30,
      color: 'blue',
      notes: ''
    });
  };

  // Open edit modal
  const openEditModal = (workout: ScheduledWorkout) => {
    setFormData({
      title: workout.title,
      time: workout.time,
      duration: workout.duration,
      recurring: workout.recurring,
      recurringDays: workout.recurringDays || [],
      reminder: workout.reminder,
      reminderMinutes: workout.reminderMinutes,
      color: workout.color || 'blue',
      notes: workout.notes || ''
    });
    setEditingWorkout(workout);
  };

  // Render workout item
  const renderWorkoutItem = (workout: ScheduledWorkout, compact: boolean = false) => (
    <div
      key={workout.id}
      className={`
        ${getColorClass(workout.color || 'blue')}
        ${workout.completed ? 'opacity-50' : ''}
        ${compact ? 'h-2 rounded-sm' : 'p-2 rounded-lg text-white text-xs'}
        cursor-pointer transition-all hover:opacity-80
      `}
      onClick={() => !compact && openEditModal(workout)}
      title={`${workout.title} - ${workout.time}`}
    >
      {!compact && (
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{workout.time}</span>
          {workout.completed && <Check size={10} />}
          {workout.recurring !== 'none' && <Repeat size={10} />}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Träningsschema</h1>
              <p className="text-white/70 text-sm">Planera och följ upp din träning</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="flex-shrink-0 px-4 py-2 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <div className="text-xs text-white/70">Genomförda</div>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <div className="text-xs text-white/70">Dagars streak</div>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <div className="text-xs text-white/70">Kommande</div>
          </div>
        </div>
      </div>

      {/* Navigation & View Toggle */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
            Idag
          </button>
          <button onClick={goToNextMonth} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
          <span className="ml-2 font-bold text-slate-800">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'month' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            <CalendarDays size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="px-6 py-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((cell, idx) => {
              const workouts = cell.date ? calendarData.get(cell.date) || [] : [];
              const isSelected = cell.date === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => cell.date && setSelectedDate(cell.date)}
                  className={`
                    min-h-24 p-1 border rounded-lg transition-all cursor-pointer
                    ${cell.date ? 'hover:border-blue-300 hover:bg-blue-50/30' : 'bg-slate-50'}
                    ${cell.isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  `}
                >
                  {cell.day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        cell.isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {cell.day}
                      </div>
                      <div className="space-y-1">
                        {workouts.slice(0, 2).map(w => renderWorkoutItem(w, true))}
                        {workouts.length > 2 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{workouts.length - 2}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">
                  {new Date(selectedDate).toLocaleDateString('sv-SE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  <Plus size={16} />
                  Lägg till
                </button>
              </div>

              {(() => {
                const dayWorkouts = scheduleService.getWorkoutsForDate(selectedDate);
                if (dayWorkouts.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400">
                      <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Inga pass schemalagda</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {dayWorkouts.map(workout => (
                      <div
                        key={workout.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${
                          workout.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className={`w-2 h-12 rounded-full ${getColorClass(workout.color || 'blue')}`} />
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">{workout.title}</div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {workout.time}
                            </span>
                            <span>{workout.duration} min</span>
                            {workout.recurring !== 'none' && (
                              <span className="flex items-center gap-1 text-blue-500">
                                <Repeat size={14} />
                                Återkommande
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!workout.completed && (
                            <button
                              onClick={() => handleCompleteWorkout(workout.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                              title="Markera som klar"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(workout)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit3 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="px-6 py-4">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Kommande träningspass
          </h2>

          {upcomingWorkouts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Inga kommande pass</p>
              <button
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setShowAddModal(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
              >
                Schemalägg ditt första pass
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className={`w-3 h-16 rounded-full ${getColorClass(workout.color || 'blue')}`} />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{workout.title}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(workout.date).toLocaleDateString('sv-SE', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })} kl {workout.time}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{workout.duration} min</span>
                      {workout.reminder && (
                        <span className="flex items-center gap-1">
                          <Bell size={12} />
                          Påminnelse
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteWorkout(workout.id)}
                    className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200"
                  >
                    <Check size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingWorkout) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowAddModal(false);
            setEditingWorkout(null);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {editingWorkout ? 'Redigera pass' : 'Nytt träningspass'}
            </h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time & Duration */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tid</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Längd (min)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Återkommande</label>
              <select
                value={formData.recurring}
                onChange={e => setFormData({ ...formData, recurring: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              >
                <option value="none">Engångs</option>
                <option value="daily">Dagligen</option>
                <option value="weekly">Varje vecka</option>
                <option value="custom">Anpassad</option>
              </select>
            </div>

            {/* Custom recurring days */}
            {formData.recurring === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">Vilka dagar?</label>
                <div className="flex gap-2">
                  {WEEKDAYS.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const days = formData.recurringDays.includes(idx)
                          ? formData.recurringDays.filter(d => d !== idx)
                          : [...formData.recurringDays, idx];
                        setFormData({ ...formData, recurringDays: days });
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        formData.recurringDays.includes(idx)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Färg</label>
              <div className="flex gap-2">
                {WORKOUT_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Reminder toggle */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-slate-400" />
                <span className="text-sm text-slate-600">Påminnelse</span>
              </div>
              <button
                onClick={() => setFormData({ ...formData, reminder: !formData.reminder })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.reminder ? 'bg-blue-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  formData.reminder ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {editingWorkout && (
                <button
                  onClick={() => handleDeleteWorkout(editingWorkout.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingWorkout(null);
                  resetForm();
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200"
              >
                Avbryt
              </button>
              <button
                onClick={editingWorkout ? handleEditWorkout : handleAddWorkout}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
              >
                {editingWorkout ? 'Spara' : 'Skapa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalendar;
