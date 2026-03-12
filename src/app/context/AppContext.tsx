import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Habit, HabitLog, User } from '../types';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import {
  authApi, habitsApi, logsApi,
  getToken, removeToken,
  HabitResponse, LogResponse
} from '../../lib/api';

const AppContext = createContext<AppContextType | null>(null);

// ── Converters ──────────────────────────────────────────────
function habitFromApi(h: HabitResponse): Habit {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    category: h.category,
    icon: h.icon,
    dailyTask: h.daily_task,
    targetValue: h.target_value ?? undefined,
    unit: h.unit ?? undefined,
    frequency: h.frequency,
    timesPerPeriod: h.times_per_period,
    createdAt: h.created_at.split('T')[0],
  };
}

function logFromApi(l: LogResponse): HabitLog {
  return {
    id: l.id,
    habitId: l.habit_id,
    date: l.date,
    completed: l.completed,
    note: l.note ?? undefined,
    loggedAt: l.logged_at,
  };
}

// ── Provider ─────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Al arrancar, si hay token, carga el usuario y sus datos
  useEffect(() => {
    const init = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const me = await authApi.me();
        setUser({ id: me.id, name: me.name, email: me.email });
        const [apiHabits, apiLogs] = await Promise.all([
          habitsApi.getAll(),
          logsApi.getAll(),
        ]);
        setHabits(apiHabits.map(habitFromApi));
        setLogs(apiLogs.map(logFromApi));
      } catch {
        removeToken();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    const me = await authApi.me();
    setUser({ id: me.id, name: me.name, email: me.email });
    const [apiHabits, apiLogs] = await Promise.all([
      habitsApi.getAll(),
      logsApi.getAll(),
    ]);
    setHabits(apiHabits.map(habitFromApi));
    setLogs(apiLogs.map(logFromApi));
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setHabits([]);
    setLogs([]);
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const created = await habitsApi.create({
      name: habit.name,
      description: habit.description,
      category: habit.category,
      icon: habit.icon,
      daily_task: habit.dailyTask,
      target_value: habit.targetValue,
      unit: habit.unit,
      frequency: habit.frequency,
      times_per_period: habit.timesPerPeriod,
    });
    setHabits(prev => [...prev, habitFromApi(created)]);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updated = await habitsApi.update(id, {
      name: updates.name,
      description: updates.description,
      category: updates.category,
      icon: updates.icon,
      daily_task: updates.dailyTask,
      target_value: updates.targetValue,
      unit: updates.unit,
      frequency: updates.frequency,
      times_per_period: updates.timesPerPeriod,
    });
    setHabits(prev => prev.map(h => h.id === id ? habitFromApi(updated) : h));
  };

    const deleteHabit = async (id: string) => {
      await habitsApi.delete(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      setLogs(prev => prev.filter(l => l.habitId !== id));
    };

  const toggleLog = async (habitId: string, date: string) => {
    const existing = logs.find(l => l.habitId === habitId && l.date === date);
    if (existing) {
      // Toggle off — elimina localmente, la API devuelve 200 con detail
      await logsApi.toggle(habitId, date);
      setLogs(prev => prev.filter(l => !(l.habitId === habitId && l.date === date)));
    } else {
      // Toggle on — crea el log
      const created = await logsApi.toggle(habitId, date);
      if (created) {
        setLogs(prev => [...prev, logFromApi(created)]);
      }
    }
  };

  const addNote = async (habitId: string, date: string, note: string) => {
    const log = logs.find(l => l.habitId === habitId && l.date === date);
    if (!log) return;
    await logsApi.updateNote(log.id, note);
    setLogs(prev =>
      prev.map(l => l.habitId === habitId && l.date === date ? { ...l, note } : l)
    );
  };

  // ── Stats (calculadas localmente igual que antes) ──────────
  const getLogsForDate = useCallback(
    (date: string) => logs.filter(l => l.date === date && l.completed),
    [logs]
  );

  const getLogsForHabit = useCallback(
    (habitId: string) => logs.filter(l => l.habitId === habitId && l.completed),
    [logs]
  );

  const getStreak = useCallback((habitId: string): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const hasLog = logs.some(l => l.habitId === habitId && l.date === date && l.completed);
      if (hasLog) { streak++; }
      else if (i > 0) { break; }
    }
    return streak;
  }, [logs]);

  const getCompletionRate = useCallback((habitId: string, days = 30): number => {
    const today = new Date();
    let completed = 0;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    const startDay = differenceInDays(today, parseISO(habit.createdAt));
    const actualDays = Math.min(days, startDay);
    if (actualDays === 0) return 0;
    for (let i = 1; i <= actualDays; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      if (logs.some(l => l.habitId === habitId && l.date === date && l.completed)) {
        completed++;
      }
    }
    return Math.round((completed / actualDays) * 100);
  }, [logs, habits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#444] text-xs uppercase tracking-widest animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, habits, logs,
      isAuthenticated: !!user,
      login, logout,
      addHabit, updateHabit, deleteHabit,
      toggleLog, addNote,
      getLogsForDate, getLogsForHabit,
      getStreak, getCompletionRate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}